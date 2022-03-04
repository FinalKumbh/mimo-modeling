import React from 'react';

import { Camera, Footer, Header, Main} from './container';
import { Navbar } from './components'

import './App.scss'

const App = () => {
  return (
    <div className='app'>
      <Navbar />
      <Header />
      <Camera />
      <Footer />
      <Main />
    </div>
  );
}

export default App;