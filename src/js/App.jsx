import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import '../css/App.css'
import { db } from './firebase'
import {collection, query, orderBy, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore'
import Canvas from './Canvas'
import Register from './Register'
import Header from './Header'
import Profile from './Profile'

function App() {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path={'/'} element={<Main/>}></Route>
        <Route path={'/users/:username'} element={ <Profile/> }></Route>
        <Route path={'/register'} element={<Register/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

function Main() {
  return (
    <div className="Main">
      <Canvas/>
    </div>
  );
}

export default App
