import React, { useState, useRef, useEffect, useMemo } from "react";
import chroma from "chroma-js";
import axios from "axios";
import { useParams } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Heatmap from "../components/Heatmap";
import MetadataFeaturesTable from "../components/MetadataFeaturesTable";

// http://10.3.2.13:8080/database/efin/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/sift/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/provean/8a8c1b6c6d5e7589f18afd6455086c82 // what is del?; also has negative values; be careful;
// http://10.3.2.13:8080/database/lists2/8a8c1b6c6d5e7589f18afd6455086c82

// const md5sum = "8a8c1b6c6d5e7589f18afd6455086c82"; // for our current protein; // will be passed as a prop ?
// const protein_name = "Q5SRN2"; // can also be passed as a prop or taken from metadata?
// const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

const database_url = "http://10.3.2.13:8080/database/";

// List-s2 threshold values:

// Generic threshold: 0.85

// Equal to 0.85 or higher: deleterious

// lower than 0.85: benign

// Do another check to choose which one;
// const efin_swissprot_parameters = { // to be completed

// };
// const efin_humdiv_parameters = { // to be completed

// }

const lists2_parameters = {
  toolname: "LIST-S2", // shown to the user
  //toolname_api: "lists2", // api url, example: /database/lists2/{md5sum} // deprecated
  toolname_json: "lists2", // field name in the api response json.
  score_ranges: [
    {
      start: 0.0,
      end: 0.85,
      risk_assessment: "benign",
      start_color: "#2c663c",
      end_color: "#ffa500",
      // end_color: "#fcedaa",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "deleterious",
      start_color: "#ffa500",
      // start_color: "#fcedaa",
      end_color: "#981e2a",
    },
  ],
  ref_value: 0,
};
const polyphen2_humdiv_parameters = {
  toolname: "Polyphen-2 (Humdiv)",
 // toolname_api: "polyphen", // used in the api url
  toolname_json: "pph_humdiv", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
    },
  ],
  ref_value: 0,
};
const polyphen2_humvar_parameters = {
  toolname: "Polyphen-2 (Humvar)",
  //toolname_api: "polyphen", // used in the api url
  toolname_json: "pph_humvar", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
    },
  ],
  ref_value: 0,
};
const sift_swissprot_parameters = {
  toolname: "Sift (Swissprot) ",
  //toolname_api: "sift",
  toolname_json: "sift4g_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
    },
  ],
  ref_value: 1,
};
const sift_trembl_parameters = {
  toolname: "Sift (Trembl)",
  //toolname_api: "sift",
  toolname_json: "sift4g_sp_trembl",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
    },
  ],
  ref_value: 1,
};
const efin_humdiv_parameters= {
  toolname: "Efin (Humdiv)",
  //toolname_api: "sift",
  toolname_json: "efin_humdiv",
  score_ranges: [
    {
      start: 0.0,
      end: 0.28,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
    },
    {
      start: 0.28,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
    },
  ],
  ref_value: 1,
};
const efin_swissprot_parameters = {
  toolname: "Efin (Swissprot)",
  //toolname_api: "sift",
  toolname_json: "efin_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.60,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
    },
    {
      start: 0.60,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
    },
  ],
  ref_value: 1,
};
const possible_prediction_tools_array = [
  lists2_parameters,
  polyphen2_humdiv_parameters,
  polyphen2_humvar_parameters,
  sift_swissprot_parameters,
  sift_trembl_parameters,
  efin_humdiv_parameters,
  efin_swissprot_parameters,
];

const number_of_colors = 30; // add to config.js

const ProteinPage = () => {
  // add ?q=1, to the url to get uniprot metadata
  const { md5sum } = useParams();
  const [allProteinData, setAllProteinData] = useState({});
  const [proteinDataLoadingStatus, setProteinDataLoadingStatus] = useState("Fetching protein data");
  const [metadata, setMetadata] = useState({});
  // in case metadata, has more than 1 element, because if the protein exists in other animals;  example: 3d3f7f772cf34ea5db1998fc0eae9f72
  const [metadataHumanIndex, setMetadataHumanIndex] = useState(-1);
  const [currentPredictionToolParameters, setCurrentPredictionToolParameters] = useState();

  const colorRangesLegendRef = useRef(null);

  // , {headers:{'Access-Control-Allow-Origin' : '*',}}
  // const request_url = "polyphen/8a8c1b6c6d5e7589f18afd6455086c82"

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
      const temp_list = chroma
        .scale([current_range_start_color, current_range_end_color])
        .mode("lch")
        .colors(number_of_colors); // 30 is the number of colors, if you change 30 here, you must change it in drawheatmap color determination based on tool's value
      temp_color_lists_array.push(temp_list);
    }
    return temp_color_lists_array;
  }, [currentPredictionToolParameters]);



  useEffect(() => {
    // to fetch protein data

    const findAvailablePredictionTools = (all_protein_data) => {
      let temp_tools_list = [];
      for(let i = 0; i< possible_prediction_tools_array.length; i++)
      {
        if (Object.hasOwn(all_protein_data, possible_prediction_tools_array[i].toolname_json )){
          temp_tools_list.push(possible_prediction_tools_array[i]);
        }
      }
      return temp_tools_list;
    }
    const request_url = "all_scores/" + md5sum;
    axios
      .get(database_url + request_url) // cors policy
      .then(function (response) {
        // console.log(response);
        // add a function to calculate a data format for "tools combined", then add this to response.data;
        // testing;
        // delete response.data.Sift;
        // delete response.data.Lists2;
        const first_available_tool = findAvailablePredictionTools(response.data)[0];
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
    // draw color ranges legend
    const drawColorRangesLegend = () => {
      // can become a component; input = toolparams , colorlist
      // console.log("ranges redraw");
      const step_size = 8; // width of each color in the gradient;
      const c = colorRangesLegendRef.current;
      if (!c) {
        return;
      }
      const ctx = c.getContext("2d");
      const color_ranges_legend_rect = c.getBoundingClientRect();
      // const w = color_ranges_legend_rect.width;
      // const h = color_ranges_legend_rect.height;

      const w =
        currentPredictionToolParameters.score_ranges.length *
          (number_of_colors + 1) *
          step_size +
        30; // changes based on currentTool
      // *31, to account for black lines , + 15 to account for current_x starting from 15, and + 15 to make sure last number isn't cut short;
      const h = color_ranges_legend_rect.height; // is always the same
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.scale(ratio, ratio);

      // ctx.fillRect(0,h/4,w,h/2);
      let current_x = 15;
      ctx.fillStyle = "black";
      ctx.fillRect(current_x, h / 4, step_size, h / 2); //(x: number, y: number, w: number, h: number): void
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText(
        currentPredictionToolParameters.score_ranges[0].start.toFixed(2),
        current_x,
        15,
        40
      );
      current_x += step_size;

      for (
        let i = 0;
        i < currentPredictionToolParameters.score_ranges.length;
        i++
      ) {
        // i = 0,1
        for (let j = 0; j < color_lists_array[i].length; j++) {
          if (j === Math.floor(color_lists_array[i].length / 2)) {
            // middle element
            ctx.fillText(
              currentPredictionToolParameters.score_ranges[i].risk_assessment,
              current_x,
              15,
              number_of_colors * step_size
            ); // 30 = number of colors
          }
          // normal color line;
          ctx.fillStyle = color_lists_array[i][j];
          ctx.fillRect(current_x, h / 4, step_size, h / 2);
          current_x += step_size;
        }
        // empty black line
        ctx.fillStyle = "black";
        ctx.fillRect(current_x, h / 4, step_size, h / 2);
        ctx.fillText(
          currentPredictionToolParameters.score_ranges[i].end.toFixed(2),
          current_x,
          15,
          40
        );
        current_x += step_size;
      }
      
      return;
    };
    drawColorRangesLegend();
  }, [currentPredictionToolParameters, color_lists_array]);

  useEffect(() => {
    // fetch metadata

    const findHumanIndex = (input_metadata) => {
      let i = 0;
      while (input_metadata[i]?.organism?.taxonomy !== 9606) {
        i += 1;
        if (i > 2000) {
          // to make sure we don't get an infinite loop
          console.log("Couldn't find the human protein in metadata");
          return -1;
        }
      }
      return i;
    };
    const fetchMetadata = () => {
      axios
        .get(
          "https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=100&md5=" +
            md5sum
        )
        .then(function (response) {
          setMetadata(response.data);
          console.log(response.data);
          setMetadataHumanIndex(findHumanIndex(response.data));
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

  const switchTool = (e, prediction_tool_parameters) => {
    // Probably no need to use prev => prediction_tool_parameters
    setCurrentPredictionToolParameters((prev) => prediction_tool_parameters);
    // drawColorRangesLegend();
  };
  // console.log("pdata = ");
  // console.log(allProteinData[currentPredictionToolParameters.toolname_json]);
  /* <p> {(metadata[metadataHumanIndex]?.protein?.recommendedName?.fullName?.value)}</p> */

  // instead of parsing the metadata JSON in jsx code, I write the constant values here;
  const uniprotId = metadata[metadataHumanIndex]?.accession;

  

  // const featureCategoriesJsx = Array.from(featureCategories).map( (category) => {
  //   console.log(category);
  //   return(
  //     <h3>
  //       {category}
  //     </h3>
  //   )
  // });

  // FIX calculation bug;


  const proteinKeywordsJsx = metadata[metadataHumanIndex]?.keywords?.map(
    (keyword) => {
      return <li key={keyword.value}>{keyword.value}</li>;
    }
  );
  const geneName = metadata[metadataHumanIndex]?.gene?.[0]?.name?.value;
  
  const changePredictionToolButtons = possible_prediction_tools_array
    .filter((tool) => Object.hasOwn(allProteinData, tool.toolname_json))
    .map((tool) => {
      return (
        <li key={tool.toolname_json}>
          <button onClick={(e) => switchTool(e, tool)}>{tool.toolname}</button>
        </li>
      );
    });

  // undefined if no synonyms exist
  const synonymsListJsx = metadata[metadataHumanIndex]?.gene?.[0]?.synonyms?.map(
    (syn, idx) => {
      return (
        // in first element add '(' to beggining in last element add ')' to the end instead of ','
        <li key = {syn?.value}>
          <h4>
            {idx === 0 && "("}
            {syn?.value}
            {idx !==
            metadata[metadataHumanIndex]?.gene?.[0]?.synonyms.length - 1
              ? ","
              : ")"}
          </h4>
        </li>
      );
    }
  );
  return (
    
    <>
      {/* <MetadataFeaturesTable 
        allFeaturesArray = {metadata[metadataHumanIndex]?.features}
        sequenceLength={metadata[metadataHumanIndex]?.sequence.length} 
      /> */}

      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>Uniprot ID : {uniprotId}</h1>
        <a
          href={"https://www.uniprot.org/uniprot/" + uniprotId}
          style={{ textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <OpenInNewIcon />
        </a>
      </div>

      <div>
        {/* style={{width:1400 , height:900,overflow:"scroll"  }}*/}
        <div> 
          <ul style={{listStyleType:'none', display: "flex", gap:'0.25rem'}}> {changePredictionToolButtons} </ul>
          { currentPredictionToolParameters &&
          <div
            style={{
              display: "flex",
              gap: "30px",
              justifyContent: "flex-end",
              marginRight: "50px",
            }}
          >
            <h2 style={{ marginLeft: "0px", marginRight: "auto" }}>
              Current tool : {currentPredictionToolParameters.toolname}
            </h2>
            <canvas
              id="color_ranges_legend"
              ref={colorRangesLegendRef}
              height={"85"}
              width={
                currentPredictionToolParameters.score_ranges.length *
                number_of_colors *
                6
              }
            ></canvas>
          </div>
          }
        </div>
        { currentPredictionToolParameters ?
        <Heatmap
          currentPredictionToolParameters={currentPredictionToolParameters}
          // adding "|| {}" so that proteinData is never undefined, instead it is an empty object
          proteinData={
            allProteinData[currentPredictionToolParameters.toolname_json] || {}
          }
          // proteinData={proteinData} // if we want to fetch one by one;
          color_lists_array={color_lists_array}
          number_of_colors={number_of_colors}
        />
      : 
      <div  style={{height:'400px',display:'flex',alignItems:'center', justifyContent:'center' }}> 
        <h1> {proteinDataLoadingStatus}</h1> 
        
      </div>
       
      }
      </div>
      {
        proteinKeywordsJsx &&
      <div>
        <h3>Sequence Keywords:</h3>
        <ul style={{ listStyleType: "none" }}>{proteinKeywordsJsx} </ul>
      </div>
       }

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
      <MetadataFeaturesTable 
        allFeaturesArray = {metadata[metadataHumanIndex]?.features}
        sequenceLength={metadata[metadataHumanIndex]?.sequence.length} 
      />
      
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
// const feature_categories = find_feature_categories(metadata[metadataHumanIndex]?.features);
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