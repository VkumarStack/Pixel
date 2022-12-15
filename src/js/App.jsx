import { useState } from 'react'
import '../css/App.css'
import { db } from './firebase'
import {collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'
import Canvas from './Canvas'

function App() {
  return (
    <Canvas/>
  );
}

export default App
