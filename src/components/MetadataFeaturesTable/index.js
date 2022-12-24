import React, {useState} from "react";
import MetadataFeatureLane from "./MetadataFeatureLane";
import { lane_height, lane_width, filtered_categories } from "../../config/config";




function MetadataFeaturesTable({ allFeaturesArray, sequenceLength, scaleAndOriginX, setScaleAndOriginX }) {
  
  // these 3 are shared by all lanes
  // const [scaleAndOriginX,setScaleAndOriginX] = useState({scale:1,originX:0});
  const [isDown,setIsDown] = useState(false);
  const [panningStartX,setPanningStartX] = useState(0);
  const [currentTooltipFeature, setCurrentTooltipFeature] = useState('invisible'); // will be either invisible (won't dispaly)
  // or it will be an element of the "features" array in the metadata
  const [mousePosXY, setMousePosXY] = useState({x:0, y:0})
  // const [mousePosX, setMousePosX] = useState(0);
  // const [mousePosY, setMousePosY] = useState(0);

  const changeTooltipFeature = (new_feature,new_mouse_posX,new_mouse_posY) => {
    if (currentTooltipFeature === 'invisible' && new_feature === 'invisible'){
      return; // to reduce the number of redraws, return without 'setState' in this case
      // not really necessary probably, as its perforamnce wasn't a problem without this "optimization"
    }
    setCurrentTooltipFeature(new_feature);
    setMousePosXY({x:new_mouse_posX, y:new_mouse_posY});
   
    
  }

  // onMouseUp in tooltip div;
  const onMouseUpHelper = () => {
    if(isDown){
      setIsDown(prev => false);
    }
  }

  const featureCategories =
    allFeaturesArray?.reduce((curSet, ftr) => {
      curSet.add(ftr.category);
      return curSet;
    }, new Set()) || new Set(); // return empty set if metadata doesn't exist instead of undefined;

  
  // if currentTooltipFeature is 'invisible' it doesn't give an error, so it is fine now;


  // 
  const helperFeatureEvidenceParser = (cur_evidence) => {
    return (
      <ul style= {{listStyleType:'none',paddingInlineStart:'1rem'}} > 
        {
          Object.keys(cur_evidence)?.map((cur_evidence_key,index) => {
            if (typeof(cur_evidence[cur_evidence_key]) === 'string' ) // code or label
            {
              return(
                <li key={cur_evidence_key}>
                  {cur_evidence_key} : {cur_evidence[cur_evidence_key]}
                </li>
              )
            }
            // source object
            return( 
            <li key={cur_evidence_key}>
              source : 
                <ul style= {{listStyleType:'none',paddingInlineStart:'1rem'}} > {
                Object.keys(cur_evidence['source'])?.map(src_key => {
                  if(src_key === 'url' || src_key === 'alternativeUrl'){ // Link,
                    return (
                      <li key={src_key}>
                        {src_key} :{" "}
                        <a href={cur_evidence["source"][src_key]}>
                          {cur_evidence["source"][src_key]}{" "}
                        </a>
                      </li>
                    );
                  }
                  return( // not a link
                    <li key={src_key}> 
                        {src_key} : {cur_evidence['source'][src_key]}
                    </li>
                  )
                })
              }
              </ul>
            </li>)
          })
        }
      </ul>
    )
  }
    //{/* {cur_evidence_key} : {JSON.stringify(cur_evidence[cur_evidence_key])}  */}

  // "evidences": [
  //   {
  //     "code": "string",
  //     "label": "string",
  //     "source": {
  //       "name": "string",
  //       "id": "string",
  //       "url": "string",
  //       "alternativeUrl": "string",
  //       "reviewed": false,
  //       "properties": {} // need to be implemetned
  //     }
  //   }
  // ]

  const currentTooltipFeatureJSX = Object.keys(currentTooltipFeature)?.filter(ftrKey => {
    if(currentTooltipFeature[ftrKey].length === 0 ){
      return false;
    }
    if(filtered_categories.indexOf(ftrKey) !== -1 ){
      return false; // the key is included in categories to be filtered;
    }
    return true; // value for key exists, and it is not one of the to be filterd categories
  }).map( ftrKey => {
    // console.log(ftrKey);
    if (typeof(currentTooltipFeature[ftrKey]) === 'string' )
    {
      return(
        <li key={ftrKey}>
          {ftrKey} : {currentTooltipFeature[ftrKey]}
        </li>
      )
    }
    if (ftrKey === "evidences") {
      // evidences
      return (
        <li key={"evidences"}>
          evidences :
          <ul style={{ listStyleType: "none", paddingInlineStart: "1rem" }}>
            {currentTooltipFeature["evidences"]?.map((evidence, index) => {
              return (
                <li key={index}>
                  {index + 1}:{helperFeatureEvidenceParser(evidence)}
                </li>
              );
            })}
          </ul>
        </li>
      );
    }
    return( // will write for the case of ligand, probably;
      <li key={ftrKey}>
        {ftrKey} : {JSON.stringify(currentTooltipFeature[ftrKey])} 
      </li>)
  } )
  
  const featureCategoriesAndColumnsJsx = Array.from(featureCategories).flatMap(
    (category, idx) => {
      // const cur_ftr = metadata[metadataHumanIndex]?.features.map( (ftr) => {
      //   return( <div> {ftr.begin}{" ==> "}{ftr.end}  </div>)
      // });
      // cur_category_features can't be null because it is mapped from featureCategories
      const cur_category_features = allFeaturesArray?.filter(
        (ftr) => ftr.category === category
      );
      cur_category_features.sort(
        (a, b) => parseInt(a.begin) - parseInt(b.begin)
      );
      // ascending sort; the api return sorted, but sorting just in case it is not
      return [
        // 10 vh to config.js boxSizing:'border-box',height:'10vh', backgroundColor:'lightBlue'
        <div
          key={category}
          style={{
            display: "flex",
            // height: "4.5vh",
            // backgroundColor: "lightblue",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "4.5vh",
              backgroundColor: "lightblue",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "1.5vh", textAlign: "center" }}>
              {category.split("_").join(" ")}
            </h3>
          </div>
        </div>,
        <div
          key={category + "metadataFeatureLane"}
          style={{ height: lane_height, width: lane_width }}
        >
          <MetadataFeatureLane
            featureArray={cur_category_features}
            sequenceLength={sequenceLength}
            isLastLane={idx === featureCategories.size - 1} // index starts from 0, size starts from 1
            isFirstLane={idx === 0}
            scaleAndOriginX={scaleAndOriginX}
            setScaleAndOriginX={setScaleAndOriginX}
            isDown={isDown}
            setIsDown={setIsDown}
            panningStartX={panningStartX}
            setPanningStartX={setPanningStartX}
            changeTooltipFeature={changeTooltipFeature}
          />
        </div>,
      ];
    }
  );
  return (
    // can't give rowgap, because then the canvasses won't touch, and there will be dead zones for zoom, instead make canvas larger, and then not draw the figures to those areas
    <>
      <div
        style={{
          display: "grid",
          columnGap: "10px",
          // marginLeft:'20px', //
          gridTemplateColumns: "10vw auto",
        }}
      >
        {featureCategoriesAndColumnsJsx}
      </div>
      {currentTooltipFeature !== "invisible" && ( // if Panning starts currentToolTipFeature will turn into 'invisible'
        <div
          onMouseUp={onMouseUpHelper}
          style={{
            position: "absolute",
            left: String(mousePosXY.x) + "px",
            top: String(mousePosXY.y) + "px",
            zIndex: 1000,
            backgroundColor: "lavender",
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          {/* <p> {JSON.stringify(currentTooltipFeature)} </p> */}
          <ul
            style={{
              listStyleType: "none",
              paddingInlineStart: "3rem",
              paddingInlineEnd: "3rem",
            }}
          >
            {" "}
            {currentTooltipFeatureJSX}{" "}
          </ul>
        </div>
      )}
    </>
    // <ul style={{ listStyleType: "none", marginTop: "0px", marginLeft: "0px", paddingInlineStart:'0px' }}>
    //   {featureCategoriesAndColumnsJsx}
    // </ul>
  );
}
export default MetadataFeaturesTable;

// .grid-container {
//   display: grid;
//   column-gap: 50px;
//   grid-template-columns: auto auto auto;
//   background-color: #2196F3;
//   padding: 10px;
// }

// .grid-item {
//   background-color: rgba(255, 255, 255, 0.8);
//   border: 1px solid rgba(0, 0, 0, 0.8);
//   padding: 20px;
//   font-size: 30px;
//   text-align: center;
// }
//category.split("_").map(w => w[0].toUpperCase() + w.substring(1).toLowerCase()).join(" ")
// const helperFeatureEvidencesParser = (evidences_arr) => {
  //   let temp_jsx_array = [];
  //   for(let i = 0; i< evidences_arr.length; i++){
  //     const cur_evidence = evidences_arr[i];
  //     const cur_evidence_jsx = Object.keys(cur_evidence)?.map((cur_evidence_key,index) => {
  //       if (typeof(cur_evidence[cur_evidence_key]) === 'string' ) // code or label
  //       {
  //         return(
  //           <li key={cur_evidence_key}>
  //             {cur_evidence_key} : {cur_evidence[cur_evidence_key]}
  //           </li>
  //         )
  //       }
  //       // source object

  //       return( // make a recursive or iterative function to handle this case
  //     <li key={cur_evidence_key}>
  //       {cur_evidence_key} : {JSON.stringify(cur_evidence[cur_evidence_key])} 
  //     </li>)
  //     })
  //     temp_jsx_array.push(cur_evidence_jsx);

  //   }
  //   return temp_jsx_array;
  // }