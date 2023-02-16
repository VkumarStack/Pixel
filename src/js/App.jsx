import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import '../css/App.css'
import { db } from './firebase'
import {collection, query, orderBy, onSnapshot, getDocs, getDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import Canvas from './Canvas'
import Register from './Register'
import Header from './Header'
import Profile from './Profile'
import Drawing from './Drawing'
import Timeline from './Timeline'

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
      <Timeline></Timeline>
    </div>
  );
}

export default App
