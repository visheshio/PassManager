import React from 'react'

const Navbar = () => {
  return (
    <nav className="mx-60 mt-4 flex  justify-between rounded-2xl border border-white/10 bg-white/5 px-10 py-2 shadow-lg backdrop-blur-xl">
        <div className="logo flex items-center gap-2">
          <img src="favicon.svg" alt="logo" className="h-8 w-8" />
        </div>
        <ul className="flex items-center gap-10">
          <li>
            <a href="/home" className="rounded-lg px-3 py-2 text-sm font-bold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="rounded-lg px-3 py-2 text-sm font-bold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white">
              About
            </a>
          </li>
          <li>
            <a href="/login" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 hover:shadow-md">
              Login
            </a>
          </li>
        </ul>
    </nav>
  )
}

export default Navbar