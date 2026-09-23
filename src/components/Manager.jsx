
import { useRef,useState,useEffect} from 'react'

const Manager = () => {
  const ref = useRef()
  const [form, setform] = useState({site:"",username:"",password:""})
  const [passwordArray, setPasswordArray] = useState([])

  useEffect(() => {
   let passwords=localStorage.getItem("passwords");
    if(passwords){
     setPasswordArray(JSON.parse(passwords))
    } 
  }, [])

  const showPassword = () => {  
    alert("show the password")
    if( ref.current.src.includes("hide.png")){
      ref.current.src = "show.png"
    }
    else{
      ref.current.src = "hide.png" 
    }
  }
  const savePassword = () => {
    alert("Password Saved")
    setPasswordArray([...passwordArray,form])
    localStorage.setItem("passwords",JSON.stringify([...passwordArray,form]))
    console.log([...passwordArray,form])
  }
  const handleChange = (e) => {
    setform({...form,[e.target.name]:e.target.value})
  }
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="icon-wrap mt-4 pt-4" role="img" aria-label="Animated password lock icon">
          <svg viewBox="0 0 128 128" className="lock-icon" xmlns="http://www.w3.org/2000/svg">
            <path className="lock-shackle" d="M42 52V38c0-15.5 12.5-28 28-28s28 12.5 28 28v14" />
            <rect className="lock-body" x="28" y="52" width="72" height="54" rx="12" />
            <circle className="lock-core" cx="64" cy="78" r="8" />
            <path className="lock-line" d="M64 86v12" />
          </svg>
        </div>

        <div className="text-wrap mt-3 text-center">
          <h1 className="font-bold tracking-tight text-white">Password Manager</h1>
          <p className="mt-1 font-mono text-sm text-white/70">Your Own Password Manager.</p>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-2xl rounded-2xl bg-white/5 px-10 py-2 text-white shadow-lg backdrop-blur-xl">
        <div className="flex flex-col p-2 text-white">
          <input value={form.site}  onChange={handleChange}type="text" className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-white placeholder:text-white/50" name="site" id="websitename" placeholder="Enter Website Name" />
        </div>
        <div className="mx-auto flex gap-12 p-4">
          <input value={form.username}  onChange={handleChange} type="text" className="rounded-full border border-white/20 bg-white/10 px-5 py-0.5 text-white placeholder:text-white/50" name="username" id="Username" placeholder="Enter Username" />
          <input value={form.password}  onChange={handleChange}type="text" className="rounded-full border border-white/20 bg-white/10 px-5 py-0.5 text-white placeholder:text-white/50" name="password" id="Password" placeholder="Enter Password" />
          <span className="text-white/70 absolute right-23 top-16.5 cursor-pointer" onClick={showPassword}>
          <img ref={ref} className='w-8 h-8 p-1 invert-100' src="show.png" alt="show" srcset="" />
          </span>
        </div>
        <button onClick={savePassword} className="mx-auto mt-4 flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg hover:shadow-violet-500/20">
          <span className="add-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Add Password
        </button>
      </div>
    </>
  )
}

export default Manager