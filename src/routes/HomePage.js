import React from "react";
import SearchBox from "../components/SearchBox";
import { h1_font_size } from "../config/config";

const HomePage = () => {
  return (
    <div style={{margin:"0px auto", width:"max-content"}}>
      <h1 style={{textAlign:'center', fontSize:h1_font_size}}>
        Missense Atlas
      </h1>
      <div >
        <SearchBox />
      </div>
    </div>
  );
};

export default HomePage;
