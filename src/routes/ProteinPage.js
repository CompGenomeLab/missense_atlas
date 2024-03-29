import React, { useState, useEffect, useMemo } from "react";
import chroma from "chroma-js";
import axios from "axios";
import { useParams } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Heatmap from "../components/Heatmap";
import MetadataFeaturesTable from "../components/MetadataFeaturesTable";
import ColorRangesLegend from "../components/ColorRangesLegend";
import Select from 'react-select'
import {
  database_url,
  all_prediction_tools_array,
  aminoacid_ordering,
  number_of_colors,
  color_mix_mode,h1_font_size,h2_font_size,h3_font_size,h4_font_size
} from "../config/config";

const ProteinPage = () => {
  //searchMethod is either md5sum, geneId, or uniprotId
  const { searchMethod, searchString } = useParams(); // searchString is either md5sum, geneid or uniprotId
  const [md5sum, setMd5sum] = useState("");
  const [allProteinData, setAllProteinData] = useState({});
  const [proteinDataLoadingStatus, setProteinDataLoadingStatus] = useState(
    "Fetching protein data"
  );
  const [metadata, setMetadata] = useState([]);
  // in case metadata, has more than 1 element, because if the protein exists in other animals;  example: 3d3f7f772cf34ea5db1998fc0eae9f72
  const [curMetadataHumanIndex, setCurMetadataHumanIndex] = useState(-1);
  const [currentPredictionToolParameters, setCurrentPredictionToolParameters] =
    useState();
  // shared between heatmap and metadataFeatureTable
  const [scaleAndOriginX, setScaleAndOriginX] = useState({
    scale: 1,
    originX: 0,
  });

  const findMetadataHumanAccAndIndices = (input_metadata) => {
    let temp_indices =
      input_metadata?.reduce((cur_list, cur_metadata, index) => {
        if (cur_metadata?.organism?.taxonomy === 9606 && cur_metadata.features?.length > 0) {
          cur_list.push({ accession: cur_metadata.accession, index: index });
        }
        return cur_list;
      }, []) || [];
    return temp_indices;
  };
  const metadataAccessionAndIndices = findMetadataHumanAccAndIndices(metadata);
  const color_lists_array = useMemo(() => {
    //color lists to use in drawing heatmap
    // https://gka.github.io/chroma.js/ chroma.js functions explained
    let temp_color_lists_array = []; // generate 30 colors between the score ranges
    for (
      let i = 0;
      i < currentPredictionToolParameters?.score_ranges?.length;
      i++
    ) {
      const current_range_start_color =
        currentPredictionToolParameters.score_ranges[i].start_color;
      const current_range_end_color =
        currentPredictionToolParameters.score_ranges[i].end_color;
      // chroma.scale(['#fafa6e','#2A4858']).mode('lch').colors(6)
      // !!! IMPORTANT , CHECK MODE and GAMMA//
      //   chroma.scale(['yellow', 'lightgreen', '008ae5']).domain([0,0.25,1]);
      const gradient_ratio =
        currentPredictionToolParameters.score_ranges[i].gradient_ratio; // between 0 and 1,
      //  number_of_colors * gradient_ratio => where the 50/50 mix of the blend will be located in the gradient
      const middle_color = chroma
        .mix(
          current_range_start_color,
          current_range_end_color,
          0.5,
          color_mix_mode
        )
        .hex();
      let temp_list = [];
      let chroma_obj = chroma
        .scale([
          current_range_start_color,
          middle_color,
          current_range_end_color,
        ])
        .domain([0, number_of_colors * gradient_ratio, number_of_colors - 1])
        .mode(color_mix_mode);
      for (let j = 0; j < number_of_colors; j++) {
        temp_list.push(chroma_obj(j).hex());
      }

      temp_color_lists_array.push(temp_list);
    }
    return temp_color_lists_array;
  }, [currentPredictionToolParameters]);


  

  const switchTool = (prediction_tool_parameters, all_protein_data) => {
    // iterate over data and find minimum and maximum values
    // doesn't work for aggreagator
    const helper_find_minmax_median = () => {
      let minimum_value = 100;
      let maximum_value = -40;
      const current_tool_protein_data = all_protein_data[prediction_tool_parameters.toolname_json];
      let i = 1;
      let score_buckets = new Array(prediction_tool_parameters.score_ranges.length).fill(0).map( () => new Array(0));
      while (Object.hasOwn(current_tool_protein_data, i)) {
        // each position
        for (let j = 0; j < 20; j++) {
          // each aminoacid for that position
          let current_score = "NaN"; // default value
          const cur_amino_acid = aminoacid_ordering[j];
          if (Object.hasOwn(current_tool_protein_data[i], cur_amino_acid)) {
            current_score = parseFloat(current_tool_protein_data[i][cur_amino_acid]);
            if (isNaN(current_score) === false) {
              // current score is not NaN
              // finding the correct bucket;
              let score_range_index = 0; // so that we don't accidentally add a score that is equal to the threshold value into 2 median arrays
              for (let k = 0; k< prediction_tool_parameters.score_ranges.length; k++){
                if ( current_score >= prediction_tool_parameters.score_ranges[k].start && current_score <= prediction_tool_parameters.score_ranges[k].end ) {
                  score_range_index = k;
                }
              }
              score_buckets[score_range_index].push(current_score);

              if (current_score > maximum_value) {
                maximum_value = current_score;
              }
              if (current_score < minimum_value) {
                minimum_value = current_score;
              }
            } 
          }
        }
        i += 1;
      }
      // not taking account of case where number of elements is even, as we don't need to find the exact median vlaue
      let temp_median_list = new Array(score_buckets.length).fill(0); // all zeros
      for (let j = 0; j < score_buckets.length; j++ ){
        const cur_bucket = score_buckets[j]
        const cur_median_index = Math.floor(cur_bucket.length / 2);
        // if bucket is empty, assign the middle value of the score range;
        const cur_median = cur_bucket.sort()[cur_median_index] || (prediction_tool_parameters.score_ranges[j].end - prediction_tool_parameters.score_ranges[j].start);
        temp_median_list[j] = cur_median;
        console.log("j =", j, "median = ", cur_median, cur_bucket);
      }
      

      return {
        min_value: minimum_value,
        max_value: maximum_value,
        median_list: temp_median_list,
      };
      
    }
    const get_new_score_ranges = () => {
      const { median_list } = helper_find_minmax_median();
      // difference in provean is instead of range_start and end, we use min_value and max_value
      let temp_score_ranges = [];
      for(let i = 0; i< prediction_tool_parameters.score_ranges.length; i++){
        const cur_score_range = prediction_tool_parameters.score_ranges[i];
        const cur_range_start = cur_score_range.start;
        const cur_range_end = cur_score_range.end;
        const cur_range_size = cur_range_end - cur_range_start;
        const cur_median = median_list[i] ; // if median bucket is empty median will be undefined;
        let cur_gradient_ratio = (cur_median - cur_range_start) / cur_range_size;
        cur_gradient_ratio = Math.max(Math.min(cur_gradient_ratio, 0.75), 0.25 );
        const new_score_range = {...cur_score_range, gradient_ratio : cur_gradient_ratio};
        temp_score_ranges.push(new_score_range);
      }

      return temp_score_ranges;
    }
    const helper_find_minmax_median_of_provean = () => {
      let minimum_value = 100;
      let maximum_value = -40;
      const current_tool_protein_data =
        all_protein_data[prediction_tool_parameters.toolname_json];
      let i = 1;
      let benign_scores_array = [];
      let deleterious_scores_array = [];
      let median_deleterious = 0;
      let median_benign = 0;

      while (Object.hasOwn(current_tool_protein_data, i)) {
        // each position
        for (let j = 0; j < 20; j++) {
          // each aminoacid for that position
          let current_score = "NaN"; // default value
          const cur_amino_acid = aminoacid_ordering[j];
          if (Object.hasOwn(current_tool_protein_data[i], cur_amino_acid)) {
            current_score = parseFloat(
              current_tool_protein_data[i][cur_amino_acid]
            );
            if (
              current_score < prediction_tool_parameters.score_ranges[0].end
            ) {
              // assuming first score range is deleterious second is benign, this is the case for provean
              if (isNaN(current_score)) {
              } else {
                deleterious_scores_array.push(current_score);
              }
            } else {
              benign_scores_array.push(current_score);
            }
            if (!isNaN(current_score)) {
              // not NaN
              if (current_score > maximum_value) {
                maximum_value = current_score;
              }
              if (current_score < minimum_value) {
                minimum_value = current_score;
              }
            }
          }
        }
        i += 1;
      }
      // not taking account of case where number of elements is even, as we don't need to find the exact median vlaue
      let median_index_deleterious = Math.floor(
        deleterious_scores_array.length / 2
      );
      let median_index_benign = Math.floor(benign_scores_array.length / 2);
      median_deleterious =
        deleterious_scores_array.sort()[median_index_deleterious];
      median_benign = benign_scores_array.sort()[median_index_benign];
      return {
        min_value: minimum_value,
        max_value: maximum_value,
        median_deleterious: median_deleterious,
        median_benign: median_benign,
      };
    };
    if (prediction_tool_parameters.toolname_json === "provean") {
      const { min_value, max_value,
         median_deleterious, median_benign } = helper_find_minmax_median_of_provean();

      // -2.5 is the transition value between benign and deleterius
      const deleterious_range = -2.5 - min_value;
      const benign_range = max_value - -2.5;
      let gradient_ratio_deleterious =
        (median_deleterious - min_value) / deleterious_range;
      let gradient_ratio_benign = (median_benign - -2.5) / benign_range;
      const first_score_range = {
        ...prediction_tool_parameters.score_ranges[0],
        start: min_value,
        gradient_ratio: gradient_ratio_deleterious,
      };
      const second_score_range = {
        ...prediction_tool_parameters.score_ranges[1],
        end: max_value,
        gradient_ratio: gradient_ratio_benign,
      };
      const new_score_ranges = [first_score_range, second_score_range];
      setCurrentPredictionToolParameters({
        ...prediction_tool_parameters,
        score_ranges: new_score_ranges,
      });
    } else if (prediction_tool_parameters.toolname_json === "AggregatorLocal") {
      const number_of_available_tools = all_prediction_tools_array.filter(
        (tool) => Object.hasOwn(all_protein_data, tool.toolname_json)
      ).length;
      setCurrentPredictionToolParameters({
        ...prediction_tool_parameters,
        score_ranges: [
          {
            ...prediction_tool_parameters.score_ranges[0],
            end: number_of_available_tools,
          },
        ],
      });
    } else {
      // these functions won't work for aggregator
      const new_score_ranges = get_new_score_ranges();
      setCurrentPredictionToolParameters({...prediction_tool_parameters, score_ranges: new_score_ranges});
    }
 
  };

  useEffect(() => {
    let request_url = "";
    if (searchMethod.toLowerCase() === "md5sum") {
      request_url = "AllScores/md5sum/" + String(searchString.toLowerCase());
      setMd5sum(searchString);
    }
    if (searchMethod.toLowerCase() === "uniprotid") {
      request_url =
        "AllScores/uniprotid/" + String(searchString.toUpperCase());
    }
    if (searchMethod.toLowerCase() === "geneid") {
      request_url = "AllScores/geneid/" + String(searchString.toUpperCase());
    }
    // just making sure request url exists
    if (request_url.length > 0) {
      axios
        .get(database_url + request_url) // cors policy
        .then(function (response) {
          setAllProteinData(response.data);
          // default tool is the aggregator
          switchTool(all_prediction_tools_array[0], response.data);

          setProteinDataLoadingStatus("Protein data loaded successfully");
          setMd5sum(response.data?.md5sum);
        })
        .catch(function (error) {
          console.log(error);
          setProteinDataLoadingStatus("Error loading sequence data");
        })
        .then(function () {
          console.log("api called for " + database_url + request_url);
          // always executed
        });
    }
  }, [searchMethod, searchString]);

  useEffect(() => {
    const fetchMetadata = () => {
      axios
        .get(
          // &organism=Homo%20sapiens to only get the results for human proteins
          "https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=100&organism=Homo%20sapiens&md5=" +
            md5sum
        )
        .then(function (response) {
          setMetadata(response.data);
          console.log(response.data);
          // setCurMetadataHumanIndex(findHumanIndex(response.data));
          // we need to run the function on the input of API, can't use a constant value calculated before the api call
          // can't use metadataAccessionAndIndices variable
          // setCurMetadataHumanIndex(findMetadataHumanAccAndIndices(response.data)[0].index);
          const temp_human_index = findMetadataHumanAccAndIndices(
            response.data
          )[0]?.index;
          setCurMetadataHumanIndex(temp_human_index); // as the api only returns metadata for human;
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
    if (md5sum.length === 32) {
      fetchMetadata();
    }
  }, [md5sum]);

  const proteinName =
    metadata[curMetadataHumanIndex]?.protein?.recommendedName?.fullName
      ?.value ??
    metadata[curMetadataHumanIndex]?.protein?.submittedName?.[0]?.fullName
      ?.value;

  const proteinNameJSX = (
    <div /*style={{ display: "flex", alignItems: "center" }}*/>
      <h1 style={{ fontSize: h1_font_size }}>
        {
          // the structure is different in some proteins, What to do?
          proteinName
        }
      </h1>
    </div>
  );
  const geneName = metadata[curMetadataHumanIndex]?.gene?.[0]?.name?.value;
  // undefined if no synonyms exist

  const synonymsListJSX = metadata[
    curMetadataHumanIndex
  ]?.gene?.[0]?.synonyms?.map((syn, idx) => {
    return (
      // in first element add '(' to beggining in last element add ')' to the end instead of ','
      <li key={syn?.value}>
        <h4 style={{ fontSize: h4_font_size }}>
          {idx === 0 && "("}
          {syn?.value}
          {idx !==
          metadata[curMetadataHumanIndex]?.gene?.[0]?.synonyms.length - 1
            ? ","
            : ")"}
        </h4>
      </li>
    );
  });

  const geneNameJSX = geneName && (
    <div style={{ display: "flex", alignItems: "center" }}>
      <h3 style={{ fontSize: h3_font_size }}>Uniprot Gene ID :</h3>
      <h4 style={{ paddingLeft: "0.5rem", fontSize: h4_font_size }}>
        {geneName}
      </h4>
      {synonymsListJSX && (
        <ul
          style={{
            listStyleType: "none",
            display: "flex",
            marginTop: "0px",
            marginLeft: "0px",
            paddingLeft: "0.25rem",
            marginBlockEnd: "0px",
            marginBlockStart: "0px",
          }}
        >
          {synonymsListJSX}
        </ul>
      )}
    </div>
  );

  const uniprotIdsJSX = metadataAccessionAndIndices.length > 0 && (
    <div style={{ display: "flex" }}>
      <h3 style={{ marginBlockStart: "0rem", fontSize: h3_font_size }}>
        Uniprot Sequence ID :
      </h3>
      <ul
        style={{
          listStyleType: "none",
          display: "flex",
          gap: "0.5rem",
          paddingInlineStart: "0.5rem",
          marginBlockStart: "0rem",
          marginBlockEnd: "0rem",
        }}
      >
        {metadataAccessionAndIndices?.map((accAndIndex) => {
          return (
            <li key={accAndIndex.accession} style={{ display: "flex" }}>
              <h3 style={{ marginBlockStart: "0rem", fontSize: h3_font_size }}>
                {accAndIndex.accession}
                {/* {accAndIndex.index !== metadataAccessionAndIndices.length - 1 && // is not the last element
                ","}  */}
              </h3>
              <a
                href={
                  "https://www.uniprot.org/uniprot/" + accAndIndex.accession
                }
                style={{ textDecoration: "none", fontSize: "1.8vh" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon fontSize="inherit" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );

  let heatmapProteinDataProp;
  if (currentPredictionToolParameters?.toolname_json === "AggregatorLocal") {
    heatmapProteinDataProp = allProteinData;
  } else if (currentPredictionToolParameters?.toolname_json?.length > 1) {
    // currentPredictionToolExists (has loaded)
    heatmapProteinDataProp =
      allProteinData[currentPredictionToolParameters?.toolname_json] || {};
  }

  // idx === 0 => aggregator
  const selectorPredictionToolsOptions = all_prediction_tools_array
    .filter(
      (tool, idx) =>
        idx === 0 || Object.hasOwn(allProteinData, tool.toolname_json)
    )
    .map((tool) => {
      return { value: tool, label: tool.toolname };
    });

  const selectorPredictionTools = (
    <div style={{ display: "flex" }}>
      <Select
        value={{
          value: currentPredictionToolParameters,
          label: currentPredictionToolParameters?.toolname,
        }}
        isSearchable={false}
        onChange={(new_option) => switchTool(new_option.value, allProteinData)}
        options={selectorPredictionToolsOptions}
        maxMenuHeight={window.innerHeight}
        styles={{
          menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            fontSize: h3_font_size,
          }),
          control: (provided) => ({ ...provided, fontSize: h3_font_size }),
        }}
      />
    </div>
  );

  const selectorMetadataAccessionOptions = metadataAccessionAndIndices.map(
    (accAndIndex) => {
      return { value: accAndIndex.index, label: accAndIndex.accession };
    }
  );

  const selectorMetadataAccession = (
    <div style={{ marginBottom: "1rem", display: "flex" }}>
      <Select
        value={{
          value: curMetadataHumanIndex,
          label: metadata?.[curMetadataHumanIndex]?.accession,
        }}
        isSearchable={false}
        maxMenuHeight={window.innerHeight}
        onChange={(new_option) => setCurMetadataHumanIndex(new_option.value)}
        options={selectorMetadataAccessionOptions}
        styles={{
          menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            fontSize: h3_font_size,
          }),
          control: (provided) => ({ ...provided, fontSize: h3_font_size }),
        }}
      ></Select>
    </div>
  );

  // const sequenceKeywordsJSX = metadata[curMetadataHumanIndex]?.keywords?.map(
  //   (keyword) => {
  //     return <li key={keyword.value}><p style={{fontSize:'1.3vh'}}> {keyword.value}</p></li>;
  //   }
  // );

  const page_width_max_px = String(window.screen.width * 0.8) + "px";
  const page_width = "min(" + page_width_max_px + ", (100% - 100px))";
  return (
    <div id="whole_page" style={{ margin: "0 auto 10rem", width: page_width }}>
      <div style={{ marginLeft: "96px" }}>
        {proteinNameJSX}
        {geneNameJSX}
        {uniprotIdsJSX}

        {currentPredictionToolParameters && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {currentPredictionToolParameters && (
              <div
                style={{
                  marginLeft: "0px",
                  marginRight: "auto",
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: h2_font_size,
                  }}
                >
                  Current tool:
                </h2>

                <div>{selectorPredictionTools}</div>
              </div>
            )}
            <ColorRangesLegend
              currentPredictionToolParameters={currentPredictionToolParameters}
              color_lists_array={color_lists_array}
            />
          </div>
        )}
      </div>
      <div style={{ marginBottom: "1rem", marginTop: "0rem" }}>
        {currentPredictionToolParameters ? (
          <Heatmap
            currentPredictionToolParameters={currentPredictionToolParameters}
            proteinData={heatmapProteinDataProp}
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
      <div style={{ marginLeft: "96px" }}>
        {metadataAccessionAndIndices?.length > 1 && selectorMetadataAccession}

        {metadataAccessionAndIndices?.length > 0 && (
          <MetadataFeaturesTable
            allFeaturesArray={metadata[curMetadataHumanIndex]?.features}
            sequenceLength={metadata[curMetadataHumanIndex]?.sequence.length}
            scaleAndOriginX={scaleAndOriginX}
            setScaleAndOriginX={setScaleAndOriginX}
          />
        )}
        {/* {sequenceKeywordsJSX && (
          <div style={{ marginLeft: "1vw", marginRight: "1vw" }}>
            <h3 style={{ fontSize: h3_font_size }}>Sequence Keywords:</h3>
            <ul style={{ listStyleType: "none" }}>{sequenceKeywordsJSX} </ul>
          </div>
        )} */}
      </div>
    </div>
  );
};
export default ProteinPage;
