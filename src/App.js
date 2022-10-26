// import logo from './logo.svg';
import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
// import HeatMapSvg from './components/HeatMapSvg';
// import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
// import { useRef, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import HomePage from './routes/HomePage.js'
import ProteinPage from './routes/ProteinPage.js'





function App() {

  return (
    <>
    <h1>
      test
      {/* <div style={{width : 1200 ,height : 300}}> 
      <HeatMap data={data2}/>
      </div> */}
      {/* <HomePage/>
      <ProteinPage/> */}
    </h1>
    <Router>
      <Routes>
        <Route path = '/' element={<HomePage/>}/>
        <Route path = '/protein/TSBP1' element={<ProteinPage/>}/>
      </Routes>
    </Router>
    </>
  );

}

export default App;
