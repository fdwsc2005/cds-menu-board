import { Routes, Route } from 'react-router-dom'
import Screen1 from './pages/Screen1'
import Screen2 from './pages/Screen2'
import Screen3 from './pages/Screen3'
import Admin from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/screen/1" element={<Screen1 />} />
      <Route path="/screen/2" element={<Screen2 />} />
      <Route path="/screen/3" element={<Screen3 />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
