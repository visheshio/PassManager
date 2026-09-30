import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'

function App() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Navbar />
        <Manager />
      </div>
    </div>
  )
}

export default App
