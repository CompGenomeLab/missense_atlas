import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import HomePage from './routes/HomePage.js'
import ProteinPage from './routes/ProteinPage.js'





function App() {


  // make pages urls dependent on md5sum values of proteins or another name like uniprot ID;

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
