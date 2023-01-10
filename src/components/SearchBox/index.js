
import React, {useState} from "react";
import { MD5 } from "crypto-js";
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { database_url,aminoacid_ordering, h1_font_size, h4_font_size, h3_font_size } from "../../config/config";
import Select from "react-select";


function SearchBox(){

    const navigate = useNavigate();
    const [searchMethod,setSearchMethod] = useState('Sequence'); // sequence md5sum Uniprot Gene ID or UniprotId
    const [proteinSequence,setProteinSequence] = useState(''); // .trim() the sequence to remove white spaces
    const [inputMD5Sum , setInputMD5Sum] = useState('');
    const [inputGeneId, setInputGeneId] = useState('');
    const [inputUniprotId, setInputUniprotId] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    let trimmedProteinSequence = proteinSequence; // will be trimmed using helper_protein_sequence_trimmer
    // let test_hash = MD5(protein_sequence).toString();
    
    // doesn't actually need to take sequence as input, as proteinSequence is reachable 
    // asd D  ARNDC Q E G H I J K L M N
    // !(a != 1 &&  a != 2)
    const helper_protein_sequence_trimmer = () => {
      let trimmedSequence = "";
      let string_lines = proteinSequence.split('\n');
      for(let line of string_lines){
        let cur_line = line.trim();
        let is_sequence_line_flag = true;
        if(cur_line?.[0] === '>' || cur_line?.[0] === ';'){
          is_sequence_line_flag = false;
        }
        let cur_line_aminoacids = "";
        for (let char of cur_line){
          if (aminoacid_ordering.includes(char)) 
          {
            cur_line_aminoacids += char;
          }
        }
        if (is_sequence_line_flag){
          trimmedSequence += cur_line_aminoacids
        }
      }
      return trimmedSequence;
    }

    trimmedProteinSequence = helper_protein_sequence_trimmer();
    // console.log("test_hash = " + test_hash);
    // console.log("method = ");
    // console.log(searchMethod);
    
    let MD5Sum_text_area_color = 'red';
    if (inputMD5Sum.trim().length === 32){
      MD5Sum_text_area_color = 'green';
    }

    
    
    const callApiMD5Sum = (final_md5Sum) => {
        const request_url = "md5sum_to_sequence/" + String(final_md5Sum); // may also add this to configjs
        axios.get(database_url + request_url ) // cors policy
        .then(function (response) {
          // handle success
          console.log('FOUND IN DB')
          setErrorMessage('');
          navigate('/protein/md5sum/' + final_md5Sum);
          console.log(response);
        })
        .catch(function (error) {
          // handle error
          console.log('NOT found');
          setErrorMessage("MD5Sum : " + final_md5Sum + ' was not found in database');
        //   console.log(error);
        })
        .then(function () {
          console.log("api called for " + database_url + request_url);
          // always executed
        });
    }

    const callApiById = (search_method , input_id) => {
      let search_method_api;
      // CAREFUL API calls
      if (search_method === 'Uniprot Gene ID'){
        search_method_api = "geneId";
      }
      else if (search_method === 'Uniprot Accession ID'){
        search_method_api = "uniprotId"
      }
        navigate('/protein/' + search_method_api + "/" + String(input_id).toUpperCase());
    }
    const handleSearchClicked = () => {
      if (searchMethod === 'Sequence' || searchMethod === 'MD5Sum')
      {
        let final_md5Sum = inputMD5Sum;
        if (searchMethod === 'MD5Sum'){
          if (inputMD5Sum?.length !== 32){
            setErrorMessage("MD5Sum must be 32 characters");
            return;
          }
        }
        if (searchMethod === 'Sequence'){
          if (trimmedProteinSequence?.length < 1){
            setErrorMessage("Sequence can not be empty");
            return;
          }
          final_md5Sum = MD5(trimmedProteinSequence).toString();
            // console.log(final_md5Sum);
        }
        callApiMD5Sum(final_md5Sum);
      }
      else if (searchMethod === 'Uniprot Gene ID' || searchMethod === 'Uniprot Accession ID' ) { 
        let userInputId;
        
        if (searchMethod === 'Uniprot Gene ID'){
          userInputId = inputGeneId;
        }
        if(searchMethod === 'Uniprot Accession ID'){
          userInputId = inputUniprotId;
        }
        if (userInputId?.trim()?.length < 1) {
          setErrorMessage(searchMethod + " can not be empty");
          return;
        }
        callApiById(searchMethod, userInputId)
      }
      else{
        setErrorMessage("Error, Unknown search method");
      }

    }

    const selectorSearchMethods = [
      {
        value: "Sequence",
        label: "Sequence",
      },
      {
        value: "MD5Sum",
        label: "MD5Sum",
      },
      {
        value: "Uniprot Gene ID",
        label: "Uniprot Gene ID",
      },
      {
        value: "Uniprot Accession ID",
        label: "Uniprot Accession ID",
      },
    ];


    let textBoxField;
    if (searchMethod === "Sequence") {
      textBoxField = (
        <div style={{ margin: "0rem 0px" }}>
          <h4 style={{ margin: "0.5rem 0px", fontSize:h4_font_size }}>
            Sequence Length: {trimmedProteinSequence.length}
          </h4>
          <textarea
            style={{ width: "50%", height: "30vh" }}
            placeholder="Enter protein sequence in fasta format"
            value={proteinSequence}
            onChange={(e) => setProteinSequence(() => e.target.value)}
          ></textarea>
        </div>
      );
    } else if (searchMethod === "MD5Sum") {
      textBoxField = (
        <div style={{ margin: "0rem auto" }}>
          <h4 style={{fontSize:h4_font_size}}>
            {inputMD5Sum.trim().length !== 32
              ? "Length of MD5Sum must be 32 characters"
              : "Input MD5Sum is Correct Length"}
          </h4>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <input
              style={{
                height: "1rem",
                width: "25rem",
                color: MD5Sum_text_area_color,
              }}
              placeholder="Enter MD5Sum"
              value={inputMD5Sum}
              onChange={(e) => setInputMD5Sum(() => e.target.value.toLowerCase())}
            ></input>
            <button onClick={handleSearchClicked}>Search</button>
          </div>
        </div>
      );
    } else if (searchMethod === "Uniprot Gene ID") {
      textBoxField = (
        <div
          style={{
            margin: "0rem auto",
          }}
        >
          <h4 style={{fontSize:h4_font_size}}>Enter the Uniprot Gene ID for the sequence</h4>
          <div
            style={{
              margin: "0rem auto",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <input
              style={{ height: "1rem", width: "10rem" }}
              placeholder="Gene ID"
              value={inputGeneId}
              onChange={(e) => setInputGeneId(() => e.target.value)}
            ></input>
            <button onClick={handleSearchClicked}>Search</button>
          </div>
        </div>
      );
    } else if (searchMethod === "Uniprot Accession ID") {
      textBoxField = (
        <div
          style={{
            margin: "0rem auto",
          }}
        >
          <h4 style={{fontSize:h4_font_size}}>Enter the Uniprot Accession ID of the sequence</h4>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <input
              style={{ height: "1rem", width: "10rem" }}
              placeholder="Uniprot ID"
              value={inputUniprotId}
              onChange={(e) => setInputUniprotId(() => e.target.value)}
            ></input>
            <button onClick={handleSearchClicked}>Search</button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
        <h1 style={{fontSize:h1_font_size}}>Search method: </h1>
        <div style={{width:'15rem'}}> 
          <Select
            value={{
              value: searchMethod,
              label: searchMethod,
            }}
            onChange={(new_option) =>
              { setSearchMethod(new_option.value); setErrorMessage("");}
            }
            
            options={selectorSearchMethods}
            styles={{
              menu: (provided) => ({ ...provided,fontSize:h3_font_size }),
              control: (provided) => ({...provided, fontSize:h3_font_size})
              
            }}
            
          />
        </div>
        </div>
        {textBoxField}
        {errorMessage.length !== 0 && (
          <div
            style={{ display: "flex", marginTop: "0rem", marginBottom: "0px" }}
          >
            <p style={{ color: "red", font: "1rem Arial" }}> {errorMessage}</p>
            <IconButton onClick={() => setErrorMessage("")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        )}
        { // the button is inside the textboxField in other search methods
          searchMethod === 'Sequence' &&
        <button style={{ marginTop: "0.5rem" }} onClick={handleSearchClicked}>
          Search
        </button>  }
      </div>
    );



}


export default SearchBox;

// <button
// onClick={() => setSearchMethod("Sequence")}
// style={
//   searchMethod === "Sequence" ? { color: "green" } : { color: "red" }
// }
// >
// Sequence
// </button>
// <button
// onClick={() => setSearchMethod("MD5Sum")}
// style={
//   searchMethod === "MD5Sum" ? { color: "green" } : { color: "red" }
// }
// >
// MD5Sum
// </button>
// <button
// onClick={() => setSearchMethod("Uniprot Gene ID")}
// style={
//   searchMethod === "Uniprot Gene ID" ? { color: "green" } : { color: "red" }
// }
// >
// Uniprot Gene ID
// </button>
// <button
// onClick={() => setSearchMethod("Uniprot Accession ID")}
// style={
//   searchMethod === "Uniprot Accession ID" ? { color: "green" } : { color: "red" }
// }
// >
// Uniprot Accession ID
// </button>
// const textBoxField = () => {
    //     if(searchMethod === 'MD5Sum'){
    //         return(
    //             <div style={{ margin:'2rem auto'}}>
    //                 <h4> 
    //                     { inputMD5Sum.trim().length !== 32 ? 'Length of MD5Sum must be 32' 
    //                     :'MD5Sum is Correct Length' }
    //                 </h4>
    //                 <input 
    //                 style={{height:'1rem', width:'25rem', color: MD5Sum_text_area_color }}
    //                 placeholder="Enter MD5Sum"
    //                 value={inputMD5Sum}
    //                 onChange={(e) => setInputMD5Sum(() => e.target.value)}
    //                 >
    //                 </input>
    //             </div>
    //         )
    //     }
    //     else if (searchMethod === 'Sequence'){ 
    //         return(
    //             <div style={{ margin:'2rem 0px'}}>
    //                 <h4 style={{margin:'0.5rem 0px'}}> Sequence Length: {trimmedProteinSequence.length}</h4>
    //                 <textarea 
    //                 style={{width:'50%',height:'30vh'}}
    //                 placeholder="Enter protein sequence. The lines containing sequence can only contain aminoacid characters and spaces"
    //                 value={proteinSequence}
    //                 onChange={(e) => setProteinSequence(() => e.target.value)}
    //                 >
    //                 </textarea>
    //             </div>
    //         )
    //     }
    //     else{ // searchmethod isn't selected;
    //         return(
    //             <div>
    //                 ERROR Search method not found
    //             </div>
    //         )
    //     }
    // }