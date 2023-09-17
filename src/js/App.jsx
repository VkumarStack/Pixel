import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './Register'
import Header from './Header'
import Profile from './Profile'
import Timeline from './Timeline'
import Follows from './Follows'
import '../css/App.css'

function App() {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path={'/'} element={<Main/>}></Route>
        <Route path={'/users/:userid'} element={ <Profile/> }></Route>
        <Route path={'/register'} element={<Register/>}></Route>
        <Route path={'/test'} element={<Follows followers={true} user={"xn5LinmXDO1iFl53GWGKjDoATntD"}></Follows>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

function Main() {
  return (
    <div className="Main">
      <Timeline></Timeline>
    </div>
  );
}

export default App
