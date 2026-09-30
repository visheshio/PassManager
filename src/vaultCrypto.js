const PBKDF2_ITERATIONS = 600_000

const decodeBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0))

const encodeBase64 = (value) => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export const deriveVaultKey = async (password, salt) => {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: decodeBase64(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const encryptVaultEntry = async (entry, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(entry)))
  return { iv: encodeBase64(iv), ciphertext: encodeBase64(ciphertext), version: 1 }
}

export const decryptVaultEntry = async (record, key) => {
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBase64(record.iv) }, key, decodeBase64(record.ciphertext))
  return JSON.parse(new TextDecoder().decode(plaintext))
}