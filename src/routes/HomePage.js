
import React from "react";
import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox";

const HomePage = () => {
// copied form "https://stackoverflow.com/questions/997284/how-does-md5sum-algorithm-work"
   
   

    return(
        <>
            <h1>
                Welcome

               
                    <Link to ='/protein/8a8c1b6c6d5e7589f18afd6455086c82'> go to TSBP1 </Link>
                    
        
            </h1>
            <div style={{margin:'2rem'}}> 
                <SearchBox/>
            </div>
            
            {/* <div> 
                <label> input 1 :</label>
                <input>
                
                </input>
                <label> input2</label>
                <textarea>

                </textarea>
            </div> */}
        
        
        </>


    )

}


export default HomePage;