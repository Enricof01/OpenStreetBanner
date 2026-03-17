import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CombinedMap from './CombinedMap'
import LoadingOverlay from './LoadingOverlay'
function App() {

  return (

    <>  
      <BrowserRouter>
        <Routes>
          <Route element={<CombinedMap />} path='/'></Route>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
