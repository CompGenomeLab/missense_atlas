import React, { useState, useEffect, useMemo } from "react";
import chroma from "chroma-js";
import axios from "axios";
import { useParams } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Heatmap from "../components/Heatmap";
import MetadataFeaturesTable from "../components/MetadataFeaturesTable";
import ColorRangesLegend from "../components/ColorRangesLegend";
import {
  database_url,
  all_prediction_tools_array,
  aminoacid_ordering,
  number_of_colors,
  color_mix_mode
} from "../config/config";

// const https = require('https');
// http://10.3.2.13:8080/database/efin/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/sift/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/provean/8a8c1b6c6d5e7589f18afd6455086c82 // what is del?; also has negative values; be careful;
// http://10.3.2.13:8080/database/lists2/8a8c1b6c6d5e7589f18afd6455086c82

// const md5sum = "8a8c1b6c6d5e7589f18afd6455086c82"; // for our current protein; // will be passed as a prop ?
// const protein_name = "Q5SRN2"; // can also be passed as a prop or taken from metadata?



//????



const ProteinPage = () => {
  // add ?q=1, to the url to get uniprot metadata
  const { md5sum } = useParams();
  const [allProteinData, setAllProteinData] = useState({});
  const [proteinDataLoadingStatus, setProteinDataLoadingStatus] = useState("Fetching protein data");
  const [metadata, setMetadata] = useState([]);
  // in case metadata, has more than 1 element, because if the protein exists in other animals;  example: 3d3f7f772cf34ea5db1998fc0eae9f72
  const [curMetadataHumanIndex, setCurMetadataHumanIndex] = useState(-1);
  const [currentPredictionToolParameters, setCurrentPredictionToolParameters] = useState();
  // shared between heatmap and metadataFeatureTable
  const [scaleAndOriginX, setScaleAndOriginX] = useState({scale:1, originX:0});
  // const colorRangesLegendRef = useRef(null);

  // , {headers:{'Access-Control-Allow-Origin' : '*',}}
  // const request_url = "polyphen/8a8c1b6c6d5e7589f18afd6455086c82"
  // const findHumanIndex = (input_metadata) => {
  //   let i = 0;
  //   while (input_metadata[i]?.organism?.taxonomy !== 9606) {
  //     i += 1;
  //     if (i > 2000) {
  //       // to make sure we don't get an infinite loop
  //       console.log("Couldn't find the human protein in metadata");
  //       return -1;
  //     }
  //   }
  //   return i;
  // };
  // find accessions with features Instead
  const findMetadataHumanAccAndIndices = (input_metadata) => { 
    let temp_indices = input_metadata?.reduce( ( cur_list ,cur_metadata,index) => {
      if(cur_metadata?.organism?.taxonomy === 9606){
        cur_list.push( {accession: cur_metadata.accession, index : index } );
      }
      return cur_list
    }, [] ) || []
    return temp_indices;
  }
  const metadataHumanAccAndIndices = findMetadataHumanAccAndIndices(metadata);
  const color_lists_array = useMemo(() => {
    //color lists to use in drawing heatmap
    let temp_color_lists_array = []; // generate 30 colors between the score ranges
    for (
      let i = 0;
      i < currentPredictionToolParameters?.score_ranges.length;
      i++
    ) {
      
      const current_range_start_color =
        currentPredictionToolParameters.score_ranges[i].start_color;
      const current_range_end_color =
        currentPredictionToolParameters.score_ranges[i].end_color;
      // chroma.scale(['#fafa6e','#2A4858']).mode('lch').colors(6)
      // !!! IMPORTANT , CHECK MODE and GAMMA//
    //   chroma.scale(['yellow', 'lightgreen', '008ae5']).domain([0,0.25,1]);
      const gradient_ratio = currentPredictionToolParameters.score_ranges[i].gradient_ratio; // between 0 and 1,


      // const test = chroma.scale([current_range_start_color, current_range_end_color]).colors(5);
      // console.log(test);
      // const test2 = 
      // console.log(test2);
      //  number_of_colors * gradient_ratio => where the 50/50 mix of the blend will be located in the gradient
      const middle_color = chroma.mix(current_range_start_color,current_range_end_color,0.5, color_mix_mode ).hex();
      let temp_list = [];
      let chroma_obj = chroma.scale([current_range_start_color, middle_color ,current_range_end_color]).domain([0, number_of_colors * gradient_ratio  ,number_of_colors-1]).mode(color_mix_mode);
      for(let j = 0; j< number_of_colors; j++){
        temp_list.push(  chroma_obj(j).hex() );
      }
     
      temp_color_lists_array.push(temp_list);
    }
    return temp_color_lists_array;
  }, [currentPredictionToolParameters]);

  useEffect(() => {
    // to fetch protein data 
    // const axios_config = {
    //   httpsAgent: new https.Agent({ rejectUnauthorized: false })
    // }
    const request_url = "all_scores/md5sum/" + String(md5sum);
    axios
      .get((database_url + request_url)) // cors policy
      .then(function (response) {
        // console.log(response);
        // add a function to calculate a data format for "tools combined", then add this to response.data;
        // testing;
        // delete response.data.Sift;
        // delete response.data.Lists2;
        const first_available_tool = all_prediction_tools_array.filter((tool) =>
          Object.hasOwn(response.data, tool.toolname_json)
        )[0];
        setCurrentPredictionToolParameters(first_available_tool);
        setAllProteinData(response.data);
        setProteinDataLoadingStatus("Protein data loaded successfully");
        // console.log("pdata = ");
        // console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        setProteinDataLoadingStatus("Error loading protein data");
      })
      .then(function () {
        console.log("api called for " + database_url + request_url);
        // always executed
      });
  
    
  }, [md5sum]);

 
  useEffect(() => {
    // fetch metadata

    // const findHumanIndex = (input_metadata) => {
    //   let i = 0;
    //   while (input_metadata[i]?.organism?.taxonomy !== 9606) {
    //     i += 1;
    //     if (i > 2000) {
    //       // to make sure we don't get an infinite loop
    //       console.log("Couldn't find the human protein in metadata");
    //       return -1;
    //     }
    //   }
    //   return i;
    // };
    const fetchMetadata = () => {
      axios
        .get( // &organism=Homo%20sapiens to only get the results for human proteins
          "https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=100&organism=Homo%20sapiens&md5=" +
            md5sum
        )
        .then(function (response) {
          setMetadata(response.data);
          console.log(response.data);
          // setCurMetadataHumanIndex(findHumanIndex(response.data));
          // we need to run the function on the input of API, can't use a constant value calculated before the api call
          // can't use metadataHumanAccAndIndices variable
          // setCurMetadataHumanIndex(findMetadataHumanAccAndIndices(response.data)[0].index);
          setCurMetadataHumanIndex(0); // as the api only returns metadata for human;
          // IMPORTANT 0'th entry might not have features, SO find the first entry that has features?
          // else write no features exist for this entry;
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(function () {
          console.log("api called to fetfch metadata");
        });
    };
    fetchMetadata();
  }, [md5sum]);

  const helper_switch_tool_find_minmax_median_of_tool_scores_provean = (prediction_tool_parameters) => {
      let minimum_value = 100;
      let maximum_value = -40;
      const current_tool_protein_data = allProteinData[prediction_tool_parameters.toolname_json];
      let i = 1;
      let benign_scores_array = []; 
      let deleterious_scores_array = [];
      let median_deleterious = 0;
      let median_benign = 0;

      while(Object.hasOwn( current_tool_protein_data , i )){ // each position
        for(let j = 0; j<20; j++){ // each aminoacid for that position
          let current_score = "NaN"; // default value
          const cur_amino_acid = aminoacid_ordering[j]
          if (Object.hasOwn( current_tool_protein_data[i], cur_amino_acid ) ){
            current_score = parseFloat(current_tool_protein_data[i][cur_amino_acid]);
            if(current_score < prediction_tool_parameters.score_ranges[0].end){
              // assuming first score range is deleterious second is benign, this is the case for provean
              if (isNaN(current_score)){
                console.log("cs",current_score,"ind",i,j);
              }
              else{
                deleterious_scores_array.push(current_score);
              }
            } 
            else{
              benign_scores_array.push(current_score);
            }
            if ( ! isNaN(current_score)){// not NaN
              if (current_score > maximum_value){
                maximum_value = current_score;
              }
              if (current_score < minimum_value){
                minimum_value = current_score;
              }
            } 
          }
        }
        i+= 1;
      }
      // not taking account of case where number of elements is even, as we don't need to find the exact median vlaue
      let median_index_deleterious = deleterious_scores_array.length/2; 
      let median_index_benign = benign_scores_array.length/2;
      median_deleterious = deleterious_scores_array.sort()[median_index_deleterious];
      median_benign = benign_scores_array.sort()[median_index_benign];
      return {min_value: minimum_value, max_value: maximum_value,median_deleterious : median_deleterious ,median_benign : median_benign};
  }
  const switchTool = (e, prediction_tool_parameters) => {
    // Probably no need to use prev => prediction_tool_parameters
    // iterate over data and find minimum and maximum values
    if (prediction_tool_parameters.toolname_json === 'provean'){ 
      const {min_value,max_value,median_deleterious, median_benign} = helper_switch_tool_find_minmax_median_of_tool_scores_provean(prediction_tool_parameters);
     
      
      // -2.5 is the transition value between benign and deleterius
      const deleterious_range = (-2.5) - min_value
      const benign_range = max_value - (-2.5)
      let gradient_ratio_deleterious = (median_deleterious - min_value) / deleterious_range;
      let gradient_ratio_benign =  (median_benign - (-2.5)) / benign_range ;
      // console.log("benign =" , median_benign);
      // console.log("del =" , median_deleterious);
      // console.log("ratios del,ben = ")
      // console.log(gradient_ratio_deleterious,gradient_ratio_benign);
      const first_score_range = {...prediction_tool_parameters.score_ranges[0], start: min_value, gradient_ratio: gradient_ratio_deleterious };
      const second_score_range = {...prediction_tool_parameters.score_ranges[1], end: max_value , gradient_ratio: gradient_ratio_benign};
      const new_score_ranges = [first_score_range,second_score_range];

      setCurrentPredictionToolParameters( {
        ...prediction_tool_parameters,score_ranges: new_score_ranges 
      })
    }
    else{
      setCurrentPredictionToolParameters(prediction_tool_parameters);
    }
    // setCurrentPredictionToolParameters((prev) => prediction_tool_parameters);
    // drawColorRangesLegend();
  };
  
  // const synonymsListJsx = metadata[curMetadataHumanIndex]?.gene?.[0]?.synonyms?.map(
  //   (syn, idx) => {
  //     return (
  //       // in first element add '(' to beggining in last element add ')' to the end instead of ','
  //       <li key = {syn?.value}>
  //         <h4>
  //           {idx === 0 && "("}
  //           {syn?.value}
  //           {idx !==
  //           metadata[curMetadataHumanIndex]?.gene?.[0]?.synonyms.length - 1
  //             ? ","
  //             : ")"}
  //         </h4>
  //       </li>
  //     );
  //   }
  // );
  // const uniprotId = metadata[curMetadataHumanIndex]?.accession;
  const proteinNameJsx = (
    <div /*style={{ display: "flex", alignItems: "center" }}*/>
      <h1>
        { // the structure is different in some proteins, What to do? 
          metadata[curMetadataHumanIndex]?.protein?.recommendedName?.fullName?.value
        }
      </h1>
    </div>
  );

  const uniprotIdsJSX = (
    <div style={{ display: "flex" }}>
      <h3 style={{ marginBlockStart: "0rem" }}>Uniprot ID :</h3>

      <ul
        style={{
          listStyleType: "none",
          display: "flex",
          gap: "0.5rem",
          paddingInlineStart: "0.5rem",
          marginBlockStart:'0rem'
        }}
      >
        {metadataHumanAccAndIndices?.map((accAndIndex) => {
          return (
            <li key={accAndIndex.accession} style={{ display: "flex" }}>
              <h3 style={{ marginBlockStart: "0rem" }}>
                {accAndIndex.accession}
                {/* {accAndIndex.index !== metadataHumanAccAndIndices.length - 1 && // is not the last element
                ","}  */}
              </h3>
              <a
                href={
                  "https://www.uniprot.org/uniprot/" + accAndIndex.accession
                }
                style={{ textDecoration: "none" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );




  const sequenceKeywordsJsx = metadata[curMetadataHumanIndex]?.keywords?.map(
    (keyword) => {
      return <li key={keyword.value}>{keyword.value}</li>;
    }
  );
  const geneName = metadata[curMetadataHumanIndex]?.gene?.[0]?.name?.value;
  
  const changePredictionToolButtons = all_prediction_tools_array
    .filter((tool) => Object.hasOwn(allProteinData, tool.toolname_json))
    .map((tool) => {
      let cur_button_color = "white";
      if (
        tool.toolname_json === currentPredictionToolParameters.toolname_json
      ) {
        cur_button_color = "green";
      }
      return (
        <li key={tool.toolname_json}>
          <button
            style={{ backgroundColor: cur_button_color }}
            onClick={(e) => switchTool(e, tool)}
          >
            {tool.toolname}
          </button>
        </li>
      );
    });

  const changeMetadataButtons = (
    <ul
      style={{
        listStyleType: "none",
        display: "flex",
        gap: "0.25rem",
        paddingInlineStart: "0rem",
      }}
    >
      {metadataHumanAccAndIndices.map((accession) => {
        let cur_button_color = "white";
        if (
          metadata[curMetadataHumanIndex]?.accession === accession.accession
        ) {
          cur_button_color = "green";
        }
        return (
          <li key={accession.accession}>
            <button
              style={{ backgroundColor: cur_button_color }}
              onClick={() => {
                setCurMetadataHumanIndex(accession.index);
              }}
            >
              {accession.accession}
            </button>
          </li>
        );
      })}
    </ul>
  );
  
  // undefined if no synonyms exist
  const synonymsListJsx = metadata[curMetadataHumanIndex]?.gene?.[0]?.synonyms?.map(
    (syn, idx) => {
      return (
        // in first element add '(' to beggining in last element add ')' to the end instead of ','
        <li key = {syn?.value}>
          <h4>
            {idx === 0 && "("}
            {syn?.value}
            {idx !==
            metadata[curMetadataHumanIndex]?.gene?.[0]?.synonyms.length - 1
              ? ","
              : ")"}
          </h4>
        </li>
      );
    }
  );
  
  return (
    <>
      {proteinNameJsx}
      {uniprotIdsJSX}

      <div>
        {/* style={{width:1400 , height:900,overflow:"scroll"  }}*/}
        <div>
          <ul
            style={{ listStyleType: "none", display: "flex", gap: "0.25rem" }}
          >
            {" "}
            {changePredictionToolButtons}{" "}
          </ul>
          {currentPredictionToolParameters && (
            <div
              style={{
                display: "flex",
                gap: "30px",
                justifyContent: "flex-end",
                marginRight: "0px",
              }}
            >
              <h2 style={{ marginLeft: "0px", marginRight: "auto" }}>
                Current tool : {currentPredictionToolParameters.toolname}
              </h2>
              <ColorRangesLegend
                currentPredictionToolParameters={
                  currentPredictionToolParameters
                }
                color_lists_array={color_lists_array}
              />
              {/* <canvas
              id="color_ranges_legend"
              ref={colorRangesLegendRef}
              height={"85"}
              style={{width:'calc(30vw + 50px)', height:"85px"}}
            ></canvas> */}
            </div>
          )}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          {currentPredictionToolParameters ? (
            <Heatmap
              currentPredictionToolParameters={currentPredictionToolParameters}
              // adding "|| {}" so that proteinData is never undefined, instead it is an empty object
              proteinData={
                allProteinData[currentPredictionToolParameters.toolname_json] ||
                {}
              }
              // proteinData={proteinData} // if we want to fetch one by one;
              color_lists_array={color_lists_array}
              number_of_colors={number_of_colors}
              scaleAndOriginX={scaleAndOriginX}
              setScaleAndOriginX={setScaleAndOriginX}
            />
          ) : (
            <div
              style={{
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h1> {proteinDataLoadingStatus}</h1>
            </div>
          )}
        </div>
      </div>
      {
        // show switching buttons only if there exists more than 1 metadata for humans
        metadataHumanAccAndIndices.length > 1 && (
          <ul
            style={{
              listStyleType: "none",
              display: "flex",
              gap: "0.25rem",
              paddingInlineStart: "0rem",
            }}
          >
            {changeMetadataButtons}
          </ul>
        )
      }
      <MetadataFeaturesTable
        allFeaturesArray={metadata[curMetadataHumanIndex]?.features}
        sequenceLength={metadata[curMetadataHumanIndex]?.sequence.length}
        scaleAndOriginX={scaleAndOriginX}
        setScaleAndOriginX={setScaleAndOriginX}
      />
      {sequenceKeywordsJsx && (
        <div>
          <h3>Sequence Keywords:</h3>
          <ul style={{ listStyleType: "none" }}>{sequenceKeywordsJsx} </ul>
        </div>
      )}

      {
        // synonymsListJsx && uncomment to Remove gene Name title if no gene name part exists
        <div style={{ display: "flex" }}>
          <h3>Gene name:</h3>
          <h4 style={{ paddingLeft: "0.25rem" }}> {geneName}</h4>
          {synonymsListJsx && (
            <ul
              style={{
                listStyleType: "none",
                display: "flex",
                marginTop: "0px",
                marginLeft: "0px",
                paddingLeft: "0.25rem",
              }}
            >
              {synonymsListJsx}
            </ul>
          )}
        </div>
      }

      <br />

      {/* <div>{featuresJsx}</div> */}
    </>
  );
};
export default ProteinPage;

// const find_feature_categories = (input) => {
//   let temp_keys = new Set();
//   if (!input) {
//     return 0;
//   } else {
//     for (let i = 0; i < input.length; i++) {
//       temp_keys.add(input[i].category);
//     }
//   }
//   return temp_keys;
// };
// const feature_categories = find_feature_categories(metadata[curMetadataHuman]?.features);
// for(let i = 0; i< feature_arr.length; i++){ // is erroneous
//   if (feature_arr[i].category !== cur_category){
//     continue;
//   }
//   let temp_overlap_count = 0;
//   let temp_range_start = parseInt(feature_arr[i].begin);
//   let temp_range_end = parseInt(feature_arr[i].end);
//   for(let j = 0; j < feature_arr.length; j++){ // count range overlaps for temp range;
//     let compare_range_start = parseInt(feature_arr[j].begin);
//     let compare_range_end = parseInt(feature_arr[j].end);
//     if ((compare_range_start <= temp_range_end && compare_range_end >= temp_range_start ) && cur_category === feature_arr[j].category ) // overlaps with temp_range
//     {

      
//       temp_overlap_count += 1;
//     }
//   }
//   if(temp_overlap_count > maximum_overlap_count){
//     maximum_overlap_count = temp_overlap_count;
//   }
// }
// return maximum_overlap_count;
// {Object.hasOwn( // make this into a list.map() function
//             allProteinData,
//             polyphen2_parameters_humdiv.toolname_json
//           ) && (
//             <button onClick={(e) => switchTool(e, polyphen2_parameters_humdiv)}>
//               Polyphen2 {/*polyphen2_parameters.toolname */}
//             </button>
//           )}
//           {Object.hasOwn(allProteinData, sift_parameters_swissprot.toolname_json) && (
//             <button onClick={(e) => switchTool(e, sift_parameters_swissprot)}>
//               Sift {/* sift_parameters.toolname */}
//             </button>
//           )}
//           {Object.hasOwn(allProteinData, lists2_parameters.toolname_json) && (
//             <button onClick={(e) => switchTool(e, lists2_parameters)}>
//               LIST-S2 {/* lists2_parameters.toolname */}
//             </button>
//           )}
  // useEffect( () => { // to fetch for tools data one by one;
  //   const request_url = currentPredictionToolParameters.toolname_api + "/" + md5sum
  //   axios.get(database_url + request_url ) // cors policy
  //   .then(function (response) {
  //     // handle success
  //     // console.log(response);
  //     setAllProteinData(response.data);
  //     will need a variable for heatmap tool params, so that while waiting for the data of
  //     new tool, we don't redraw heatmap, with the scores of the previous tool
  //     setHeatmapPredictionToolParameters(currentPredictionToolParameters);
  //   })
  //   .catch(function (error) {
  //     // handle error
  //     console.log(error);
  //   })
  //   .then(function () {
  //     console.log("api called for " + database_url + request_url);
  //     // always executed
  //   });
  // },[currentPredictionToolParameters,md5sum] );
  // let minimum_value = 100;
  // let maximum_value = -40;
  // const current_tool_protein_data = allProteinData[prediction_tool_parameters.toolname_json];
  // let i = 1;
  // while(Object.hasOwn( current_tool_protein_data , i )){ // each position
  //   for(let j = 0; j<20; j++){ // each aminoacid for that position
  //     let current_score = "NaN"; // default value
  //     const cur_amino_acid = aminoacid_ordering[j]
  //     if (Object.hasOwn( current_tool_protein_data[i], cur_amino_acid ) ){
  //       current_score = parseFloat(current_tool_protein_data[i][cur_amino_acid]);
  //       if ( ! isNaN(current_score)){// not NaN
  //         if (maximum_value < current_score){
  //           maximum_value = current_score;
  //         }
  //         if (minimum_value > current_score){
  //           minimum_value = current_score;
  //         }
  //       } 
  //     }
  //   }
  //   i+= 1;
  // }
   // useEffect(() => {
  //   // draw color ranges legend
  //   const drawColorRangesLegend = () => {
  //     // can become a component; input = toolparams , colorlist
  //     // console.log("ranges redraw");
  //      // width of each color in the gradient;
  //     const c = colorRangesLegendRef.current;
  //     if (!c) {
  //       return;
  //     }
  //     const ctx = c.getContext("2d");
  //     const width_vw = currentPredictionToolParameters.score_ranges.length * 15;
  //     const vw_string = String(width_vw) + "vw";
  //     c.style.width = "calc("+ vw_string + " + 50px)";
  //     // width is dynamic; based on predicion tool

  //     const color_ranges_legend_rect = c.getBoundingClientRect();
  //     const h = color_ranges_legend_rect.height; // is always the same
  //     c.style.height = h + "px";
  //     // const w = color_ranges_legend_rect.width;
  //     // const h = color_ranges_legend_rect.height;
  //     const w = color_ranges_legend_rect.width;
  //     console.log("w= " + w );
  //     // const w =
  //     //   currentPredictionToolParameters.score_ranges.length *
  //     //     (number_of_colors + 1) *
  //     //     step_size +
  //     //   50; // 25 from beggining and end to make sure last number isn't cut short
  //     // *31, to account for black lines , + 15 to account for current_x starting from 15, and + 15 to make sure last number isn't cut short;
  //     const ratio = window.devicePixelRatio;
  //     c.width = w * ratio;
  //     c.height = h * ratio;
  //     ctx.scale(ratio, ratio);
  //     // buffer for 50, and number_of_rectangles (including black divider ones);
  //     const step_size = (w-50)/(((number_of_colors + 1) * currentPredictionToolParameters.score_ranges.length) + 1 ) ;
  //     // w = 500; 450/(30*3) = 5, 
  //     // ctx.fillRect(0,h/4,w,h/2);
  //     let current_x = 25;
  //     ctx.fillStyle = "black";
  //     ctx.fillRect(current_x, h / 4, Math.ceil(step_size) + 1, h / 2); //(x: number, y: number, w: number, h: number): void
  //     ctx.textAlign = "center";
  //     ctx.font = "16px Arial";
  //     ctx.fillText(
  //       currentPredictionToolParameters.score_ranges[0].start.toFixed(2),
  //       current_x,
  //       15,
  //       50
  //     );
  //     current_x += step_size;

  //     for (let i = 0; i < currentPredictionToolParameters.score_ranges.length; i++) {
  //       // i = 0,1
  //       for (let j = 0; j < color_lists_array[i].length; j++) {
  //         ctx.fillStyle = color_lists_array[i][j];
  //         ctx.fillRect(current_x, h / 4, Math.ceil(step_size) + 1  , h / 2);
  //         current_x += step_size;
  //         if (j === Math.floor(color_lists_array[i].length / 2)) {
  //           // middle element
  //           ctx.fillText(
  //             currentPredictionToolParameters.score_ranges[i].risk_assessment,
  //             current_x,
  //             15,
  //             (number_of_colors * step_size - 50)
  //           ); // 30 = number of colors
  //         }
         
  //         // normal color line;
         
  //       }
  //       // empty black line
  //       ctx.fillStyle = "black";
  //       ctx.fillRect(current_x, h / 4, step_size, h / 2); // last rect, won't use Math.ceil()
  //       // in previous rects we deliberately draw a bit more than enough to make sure there aren't any gaps between them;
  //       current_x += step_size;
  //       ctx.fillText(
  //         currentPredictionToolParameters.score_ranges[i].end.toFixed(2),
  //         current_x,
  //         15,
  //         50
  //       );
  //     }
      
  //     return;
  //   };
  //   drawColorRangesLegend();
  // }, [currentPredictionToolParameters, color_lists_array]); // resizeCount Added to drawColorRangesLegend
 // const temp_list = chroma
      //   .scale([current_range_start_color, current_range_end_color])
      //   .mode("lch")
      //   .colors(number_of_colors); // 30 is the number of colors, if you change 30 here, you must change it in drawheatmap color determination based on tool's value