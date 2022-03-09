import React from 'react';

import { Camera, Footer, Header, Main} from './container';
import { Navbar } from './components'
import { BrowserRouter, Route, Link, Routes } from 'react-router-dom'

import './App.scss'

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Camera />} />
          <Route path='/home' element={<Header />} />
          <Route path='/camera' element={<Camera />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;