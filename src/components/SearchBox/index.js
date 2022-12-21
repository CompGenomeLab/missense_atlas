
import React, {useState} from "react";
import { MD5 } from "crypto-js";
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

function SearchBox(){

    const navigate = useNavigate();
    const database_url = "http://10.3.2.13:8080/database/";
    const [searchMethod,setSearchMethod] = useState('Sequence'); // sequence or md5sum
    const [proteinSequence,setProteinSequence] = useState(''); // .trim() the sequence to remove white spaces
    const [inputMD5Sum , setInputMD5Sum] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    let trimmedProteinSequence = proteinSequence; // will be trimmed using helper_protein_sequence_trimmer
    // let test_hash = MD5(protein_sequence).toString();
    
    // doesn't actually need to take sequence as input, as proteinSequence is reachable 
    // asd D  ARNDC Q E G H I J K L M N
    const helper_protein_sequence_trimmer = () => {
      let trimmedSequence = "";
      let string_lines = proteinSequence.split('\n');
      for(let line of string_lines){
        let cur_line = line.trim();
        let is_sequence_line_flag = true;
        let cur_line_aminoacids = "";
        for (let char of cur_line){
          if(char !== ' '){// ignoring whitesapces
            if (aminoacid_ordering.indexOf(char) === -1) // not an aminoacid symbol
            {
              is_sequence_line_flag = false;
            }
            else{ 
              cur_line_aminoacids += char;
            }
          }
        }
        if (is_sequence_line_flag){
          trimmedSequence += cur_line_aminoacids
        }
      }
      return trimmedSequence;
      // for(let i = 0; i < proteinSequence.length ; i++)
      // {
      //   if(proteinSequence[i] === '\n')
      //   console.log(i, proteinSequence[i]);
      // }
    }

    trimmedProteinSequence = helper_protein_sequence_trimmer();
    // console.log("test_hash = " + test_hash);
    // console.log("method = ");
    // console.log(searchMethod);
    
    const textBoxField = () => {
        if(searchMethod === 'MD5Sum'){
            return(
                <div style={{ margin:'2rem auto'}}>
                    <h4> 
                        { inputMD5Sum.trim().length !== 32 ? 'Length of MD5Sum must be 32' 
                        :'MD5Sum is Correct Length' }
                    </h4>
                    <input 
                    style={{height:'1rem', width:'25rem'}}
                    placeholder="MD5Sum"
                    value={inputMD5Sum}
                    onChange={(e) => setInputMD5Sum(() => e.target.value)}
                    >
                    </input>
                </div>
            )
        }
        else if (searchMethod === 'Sequence'){ 
            return(
                <div style={{ margin:'2rem 0px'}}>
                    <h4 style={{margin:'0.5rem 0px'}}> Sequence Length: {trimmedProteinSequence.length}</h4>
                    <textarea 
                    style={{width:'50%',height:'30vh'}}
                    placeholder="protein Sequence"
                    value={proteinSequence}
                    onChange={(e) => setProteinSequence(() => e.target.value)}
                    >
                    </textarea>
                </div>
            )
        }
        else{ // searchmethod isn't selected;
            return(
                <div>
                    ERROR Search method not found
                </div>
            )
        }
    }
    
    const callApi = (final_md5Sum) => {
        const request_url = "md5sum_to_sequence/" + String(final_md5Sum);
        axios.get(database_url + request_url ) // cors policy
        .then(function (response) {
          // handle success
          console.log('FOUND IN DB')
          setErrorMessage('');
          navigate('/protein/' + final_md5Sum);

          console.log(response);
        })
        .catch(function (error) {
          // handle error
          console.log('NOT found');
          setErrorMessage("md5Sum :" + final_md5Sum + ' was not found in database');
        //   console.log(error);
        })
        .then(function () {
          console.log("api called for " + database_url + request_url);
          // always executed
        });
    }

    const handleSearchClicked = () => {
        let final_md5Sum = inputMD5Sum;
        if (searchMethod === 'Sequence'){
            final_md5Sum = MD5(trimmedProteinSequence).toString();
            // console.log(final_md5Sum);
        }
        callApi(final_md5Sum);

    }

    return (
      <div>
        <h1>SearchBox method : {searchMethod} </h1>
        <button
          onClick={() => setSearchMethod("Sequence")}
          style={
            searchMethod === "Sequence" ? { color: "green" } : { color: "red" }
          }
        >
          Sequence
        </button>
        <button
          onClick={() => setSearchMethod("MD5Sum")}
          style={
            searchMethod === "MD5Sum" ? { color: "green" } : { color: "red" }
          }
        >
          MD5Sum
        </button>
        {textBoxField()}
        {errorMessage.length !== 0 && (
          <div
            style={{ display: "flex", marginTop: "-2rem", marginBottom: "0px" }}
          >
            <p style={{ color: "red" }}> {errorMessage}</p>
            <IconButton onClick={() => setErrorMessage('')} >
              <CloseIcon />
            </IconButton>
          </div>
        )}
        <button onClick={handleSearchClicked}>Search</button>
      </div>
    );



}


export default SearchBox;
