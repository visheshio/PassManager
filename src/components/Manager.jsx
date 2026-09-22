import React from 'react'

const Manager = () => {
  return (
    <>
    <h1 className="text-center"> Password Manager</h1>
    <p className="text-center font-mono">Your Own Password Manager.</p>
    <div className="container mx-auto text-white max-w-2xl rounded-2xl  bg-white/5 px-10 py-2 shadow-lg backdrop-blur-xl">
      <div className="text-white flex flex-col p-2">
        <input type="text" className="rounded-full px-2 py-0.5 border border-white/20 bg-white/10 text-white placeholder:text-white/50" name="websitename" id="websitename" placeholder="Enter Website Name" />
      </div>
        <div className="flex gap-12 p-4 mx-auto">
          <input type="text" className="rounded-full px-5 py-0.5 border border-white/20 bg-white/10 text-white placeholder:text-white/50" name="Username" id="Username" placeholder="EnterUsername" />
          <input type="text" className="rounded-full px-5 py-0.5 border border-white/20 bg-white/10 text-white placeholder:text-white/50" name="Password" id="Password" placeholder="Enter Password" />
        </div>
        <button className="mx-50 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 hover:shadow-md">Add Password</button>
    </div>
    </>
  )
}

export default Manager