import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import HomePage from './routes/HomePage.js'
import ProteinPage from './routes/ProteinPage.js'





function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path = '/' element={<HomePage/>}/>
          <Route path = '/protein/:searchMethod/:searchString' element={<ProteinPage/>}/> 
        </Routes>
      </Router>
    </>
  );

}

export default App;
