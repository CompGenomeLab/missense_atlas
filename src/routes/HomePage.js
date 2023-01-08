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

      {/* <div> 
                <label> input 1 :</label>
                <input>
                
                </input>
                <label> input2</label>
                <textarea>

                </textarea>
            </div> */}
    </div>
  );
};

export default HomePage;
