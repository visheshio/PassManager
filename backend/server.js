import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import express from 'express'
import { config } from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'
import cookieParser from 'cookie-parser'

config()

const app = express()
const port = Number(process.env.PORT || 3000)
const databaseName = process.env.MONGODB_DB || 'passvault'
const allowedOrigins = new Set((process.env.APP_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((origin) => origin.trim()))
const sessionCookieName = 'pv_session'
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000
const scrypt = promisify(nodeScrypt)
const appStartedAt = new Date()
const rateBuckets = new Map()

let database = null
let databaseStatus = 'missing-config'
let dummyPasswordHash = null

app.disable('x-powered-by')
app.use(express.json({ limit: '256kb' }))
app.use(cookieParser())
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'same-origin')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Cache-Control', 'no-store')
  next()
})

const sendError = (response, status, message) => response.status(status).json({ message })

const requireDatabase = (_request, response, next) => {
  if (!database) return sendError(response, 503, 'Account service is unavailable. Configure MongoDB Atlas and restart the backend.')
  next()
}

const requireSameOrigin = (request, response, next) => {
  const origin = request.get('origin')
  if (!origin || !allowedOrigins.has(origin)) return sendError(response, 403, 'Request origin is not allowed.')
  next()
}

const limitAttempts = (maximum = 10, windowMs = 15 * 60 * 1000) => (request, response, next) => {
  const now = Date.now()
  const key = `${request.ip}:${request.path}`
  const bucket = rateBuckets.get(key)
  if (!bucket || now >= bucket.expiresAt) {
    rateBuckets.set(key, { count: 1, expiresAt: now + windowMs })
    if (rateBuckets.size > 5000) {
      for (const [bucketKey, current] of rateBuckets) {
        if (now >= current.expiresAt) rateBuckets.delete(bucketKey)
      }
    }
    return next()
  }
  bucket.count += 1
  if (bucket.count > maximum) return sendError(response, 429, 'Too many attempts. Wait a while, then try again.')
  next()
}

const hashPassword = async (password) => {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return { algorithm: 'scrypt-32768-8-1', salt: salt.toString('base64'), hash: Buffer.from(derived).toString('base64') }
}

const verifyPassword = async (password, stored) => {
  if (stored?.algorithm !== 'scrypt-32768-8-1') return false
  const salt = Buffer.from(stored.salt, 'base64')
  const expected = Buffer.from(stored.hash, 'base64')
  if (salt.length !== 16 || expected.length !== 64) return false
  const actual = Buffer.from(await scrypt(password, salt, expected.length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }))
  return timingSafeEqual(actual, expected)
}

const hashSessionToken = (token) => createHash('sha256').update(token).digest('hex')

const setSessionCookie = (response, token) => {
  const secure = process.env.NODE_ENV === 'production'
  response.cookie(sessionCookieName, token, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api',
    maxAge: sessionLifetimeMs,
  })
}

const clearSessionCookie = (response) => {
  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
  })
}

const startSession = async (user, response) => {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + sessionLifetimeMs)
  await database.collection('sessions').insertOne({
    _id: hashSessionToken(token),
    userId: user._id,
    expiresAt,
    createdAt: new Date(),
  })
  setSessionCookie(response, token)
}

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  encryptionSalt: user.encryptionSalt,
})

const requireAccount = async (request, response, next) => {
  const token = request.cookies?.[sessionCookieName]
  if (!token || token.length > 100) return sendError(response, 401, 'Sign in to access your vault.')
  try {
    const session = await database.collection('sessions').findOne({
      _id: hashSessionToken(token),
      expiresAt: { $gt: new Date() },
    })
    if (!session) {
      clearSessionCookie(response)
      return sendError(response, 401, 'Your session expired. Sign in again.')
    }
    const user = await database.collection('users').findOne({ _id: session.userId })
    if (!user) {
      clearSessionCookie(response)
      return sendError(response, 401, 'Your account could not be found.')
    }
    request.account = user
    request.sessionId = session._id
    next()
  } catch {
    sendError(response, 503, 'Account service is unavailable. Try again shortly.')
  }
}

const validPassword = (password) => typeof password === 'string' && Buffer.byteLength(password, 'utf8') >= 12 && Buffer.byteLength(password, 'utf8') <= 1024
const validEmail = (email) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const validBase64 = (value, exactLength) => {
  if (typeof value !== 'string' || value.length > 180_000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) return false
  const decoded = Buffer.from(value, 'base64')
  return exactLength ? decoded.length === exactLength : decoded.length > 0
}

const validEncryptedRecord = (record) => record &&
  validBase64(record.iv, 12) &&
  validBase64(record.ciphertext) &&
  record.version === 1

app.get('/api/health', (_request, response) => {
  response.status(database ? 200 : 503).json({ status: database ? 'ready' : 'unavailable', database: databaseStatus, startedAt: appStartedAt.toISOString() })
})

app.post('/api/auth/register', requireSameOrigin, limitAttempts(), requireDatabase, async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const { password, encryptionSalt } = request.body || {}
  if (!validEmail(email)) return sendError(response, 400, 'Enter a valid email address.')
  if (!validPassword(password)) return sendError(response, 400, 'Use a password between 12 and 1024 bytes.')
  if (!validBase64(encryptionSalt, 16)) return sendError(response, 400, 'Unable to initialize vault encryption. Try again.')

  try {
    const user = {
      email,
      passwordHash: await hashPassword(password),
      encryptionSalt,
      createdAt: new Date(),
    }
    const { insertedId } = await database.collection('users').insertOne(user)
    user._id = insertedId
    await startSession(user, response)
    response.status(201).json({ user: publicUser(user) })
  } catch (error) {
    if (error?.code === 11000) return sendError(response, 409, 'An account with that email already exists.')
    sendError(response, 503, 'Could not create the account. Try again shortly.')
  }
})

app.post('/api/auth/signin', requireSameOrigin, limitAttempts(), requireDatabase, async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const { password } = request.body || {}
  if (!validEmail(email) || typeof password !== 'string' || password.length > 1024) return sendError(response, 400, 'Enter a valid email and password.')
  try {
    const user = await database.collection('users').findOne({ email })
    const passwordMatches = await verifyPassword(password, user?.passwordHash || dummyPasswordHash)
    if (!user || !passwordMatches) return sendError(response, 401, 'Email or password is incorrect.')
    await startSession(user, response)
    response.json({ user: publicUser(user) })
  } catch {
    sendError(response, 503, 'Could not sign in. Try again shortly.')
  }
})

app.post('/api/auth/unlock', requireSameOrigin, limitAttempts(), requireDatabase, requireAccount, async (request, response) => {
  const { password } = request.body || {}
  if (typeof password !== 'string' || password.length > 1024) return sendError(response, 400, 'Enter your account password.')
  try {
    if (!(await verifyPassword(password, request.account.passwordHash))) return sendError(response, 401, 'Email or password is incorrect.')
    response.json({ user: publicUser(request.account) })
  } catch {
    sendError(response, 503, 'Could not unlock your vault. Try again shortly.')
  }
})

app.get('/api/auth/me', requireDatabase, requireAccount, (request, response) => {
  response.json({ user: publicUser(request.account) })
})

app.post('/api/auth/signout', requireSameOrigin, async (request, response) => {
  const token = request.cookies?.[sessionCookieName]
  clearSessionCookie(response)
  if (token && database) await database.collection('sessions').deleteOne({ _id: hashSessionToken(token) })
  response.status(204).end()
})

app.get('/api/vault', requireDatabase, requireAccount, async (request, response) => {
  try {
    const records = await database.collection('vaultRecords')
      .find({ userId: request.account._id })
      .sort({ createdAt: 1 })
      .toArray()
    response.json({ records: records.map((record) => ({
      id: record._id.toString(),
      iv: record.iv,
      ciphertext: record.ciphertext,
      version: record.version,
    })) })
  } catch {
    sendError(response, 503, 'Could not load the vault. Try again shortly.')
  }
})

app.post('/api/vault', requireSameOrigin, requireDatabase, requireAccount, async (request, response) => {
  const { iv, ciphertext, version } = request.body || {}
  if (!validEncryptedRecord({ iv, ciphertext, version })) return sendError(response, 400, 'Invalid encrypted vault record.')
  try {
    const record = { userId: request.account._id, iv, ciphertext, version, createdAt: new Date(), updatedAt: new Date() }
    const { insertedId } = await database.collection('vaultRecords').insertOne(record)
    response.status(201).json({ id: insertedId.toString(), iv, ciphertext, version })
  } catch {
    sendError(response, 503, 'Could not save the vault entry. Try again shortly.')
  }
})

app.put('/api/vault/:id', requireSameOrigin, requireDatabase, requireAccount, async (request, response) => {
  const { iv, ciphertext, version } = request.body || {}
  if (!ObjectId.isValid(request.params.id) || !validEncryptedRecord({ iv, ciphertext, version })) return sendError(response, 400, 'Invalid encrypted vault record.')
  try {
    const result = await database.collection('vaultRecords').updateOne(
      { _id: new ObjectId(request.params.id), userId: request.account._id },
      { $set: { iv, ciphertext, version, updatedAt: new Date() } }
    )
    if (!result.matchedCount) return sendError(response, 404, 'Vault entry not found.')
    response.json({ id: request.params.id, iv, ciphertext, version })
  } catch {
    sendError(response, 503, 'Could not update the vault entry. Try again shortly.')
  }
})

app.delete('/api/vault/:id', requireSameOrigin, requireDatabase, requireAccount, async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) return sendError(response, 400, 'Invalid vault entry.')
  try {
    const result = await database.collection('vaultRecords').deleteOne({ _id: new ObjectId(request.params.id), userId: request.account._id })
    if (!result.deletedCount) return sendError(response, 404, 'Vault entry not found.')
    response.status(204).end()
  } catch {
    sendError(response, 503, 'Could not delete the vault entry. Try again shortly.')
  }
})

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.too.large') return sendError(response, 413, 'Request is too large.')
  sendError(response, 400, 'Invalid request.')
})

const start = async () => {
  dummyPasswordHash = await hashPassword(randomBytes(32).toString('base64'))
  if (process.env.MONGODB_URI) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI)
      await client.connect()
      database = client.db(databaseName)
      await Promise.all([
        database.collection('users').createIndex({ email: 1 }, { unique: true }),
        database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        database.collection('vaultRecords').createIndex({ userId: 1, createdAt: 1 }),
      ])
      databaseStatus = 'connected'
      console.log('MongoDB connected.')
    } catch {
      databaseStatus = 'connection-failed'
      console.error('MongoDB connection failed. Check the local MONGODB_URI and Atlas network access.')
    }
  } else {
    console.warn('MongoDB is not configured. Set MONGODB_URI in backend/.env to enable account routes.')
  }

  app.listen(port, () => console.log(`PASSVAULT API listening on http://localhost:${port}`))
}

start()