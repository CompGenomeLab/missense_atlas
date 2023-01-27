import React from "react";
import SearchBox from "../components/SearchBox";
import { h1_font_size } from "../config/config";

const HomePage = () => {
  return (
    <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', minHeight:'100vh',}} >
      <h1 style={{textAlign:'center', fontSize:h1_font_size}}>
        Missense Atlas
      </h1>
      <div style={{marginTop:'5rem'}}> 
        <SearchBox />
      </div>
      
      
    </div>
  );
};

export default HomePage;
