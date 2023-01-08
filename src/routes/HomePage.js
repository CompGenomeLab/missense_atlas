import React from "react";
import SearchBox from "../components/SearchBox";

const HomePage = () => {
  return (
    <div>
      <h1 style={{textAlign:'center'}}>
        Welcome to Missense Atlas
      </h1>
      <div style={{ margin: "2rem" }}>
        <SearchBox />
      </div>
    </div>
  );
};

export default HomePage;
