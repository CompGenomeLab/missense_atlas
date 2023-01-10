import React from "react";
import SearchBox from "../components/SearchBox";
import { h1_font_size } from "../config/config";

const HomePage = () => {
  return (
    <div>
      <h1 style={{textAlign:'center', fontSize:h1_font_size}}>
        Welcome to Missense Atlas
      </h1>
      <div style={{ margin: "2rem" }}>
        <SearchBox />
      </div>
    </div>
  );
};

export default HomePage;
