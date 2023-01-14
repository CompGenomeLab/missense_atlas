import React, {useEffect, useState} from "react";
import MetadataFeatureLane from "./MetadataFeatureLane";
import { laneHeight, laneWidth,c_palettes, h4_font_size } from "../../config/config";




function MetadataFeaturesTable({ allFeaturesArray, sequenceLength, scaleAndOriginX, setScaleAndOriginX }) {
  
  // these 3 are shared by all lanes
  // const [scaleAndOriginX,setScaleAndOriginX] = useState({scale:1,originX:0});
  const [currentTooltip, setCurrentTooltipFeature] = useState({feature:'invisible', mouseX:0, mouseY:0, color:'#FFFFFF'}); // will be either invisible (won't dispaly)
  // or it will be an element of the "features" array in the metadata


  
  // color is unused right now
  const changeTooltipFeature = (new_feature,new_posX,new_posY,new_color,position_left) => {
    if (currentTooltip.feature === 'invisible' && new_feature === 'invisible'){
      return; // to reduce the number of redraws, return without 'setState' in this case
      // not really necessary probably, as its perforamnce wasn't a problem without this "optimization"
    }
    setCurrentTooltipFeature({feature: new_feature, posX: new_posX, posY: new_posY, color: new_color,positionLeft: position_left});
  }

  // to remove tooltip when zoomed on heatmap
  useEffect( () => {
    setCurrentTooltipFeature({feature:'invisible',posX:0,posY:0,color:'#FFFFFF',positionLeft:true})
  },[scaleAndOriginX] )


  // onMouseUp in tooltip div;
 

  const featureCategories =
    allFeaturesArray?.reduce((curSet, ftr) => {
      curSet.add(ftr.category);
      return curSet;
    }, new Set()) || new Set(); // return empty set if metadata doesn't exist instead of undefined;

  
  // if currentTooltipFeature is 'invisible' it doesn't give an error, so it is fine now;


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


  // LIGANDS PARSING IS MISSING
  // const helperFeatureEvidenceParser = (cur_evidence) => {
  //   return (
  //     <ul style= {{listStyleType:'none',paddingInlineStart:'1rem'}} > 
  //       {
  //         Object.keys(cur_evidence)?.map((cur_evidence_key,index) => {
  //           if (typeof(cur_evidence[cur_evidence_key]) === 'string' ) // code or label
  //           {
  //             return(
  //               <li key={cur_evidence_key}>
  //                 {cur_evidence_key} : {cur_evidence[cur_evidence_key]}
  //               </li>
  //             )
  //           }
  //           // source object
  //           return( 
  //           <li key={cur_evidence_key}>
  //             source : 
  //               <ul style= {{listStyleType:'none',paddingInlineStart:'1rem'}} > {
  //               Object.keys(cur_evidence['source'])?.map(src_key => {
  //                 if(src_key === 'url' || src_key === 'alternativeUrl'){ // Link,
  //                   return (
  //                     <li key={src_key}>
  //                       {src_key} :{" "}
  //                       <a href={cur_evidence["source"][src_key]}>
  //                         {cur_evidence["source"][src_key]}{" "}
  //                       </a>
  //                     </li>
  //                   );
  //                 }
  //                 return( // not a link
  //                   <li key={src_key}> 
  //                       {src_key} : {cur_evidence['source'][src_key]}
  //                   </li>
  //                 )
  //               })
  //             }
  //             </ul>
  //           </li>)
  //         })
  //       }
  //     </ul>
  //   )
  // }
    //{/* {cur_evidence_key} : {JSON.stringify(cur_evidence[cur_evidence_key])}  */}

  // ADD LIGANDS PARSING
  // const currentTooltipFeatureJSX2 = Object.keys(currentTooltip.feature)?.filter(ftrKey => {
  //   if(currentTooltip.feature[ftrKey].length === 0 ){
  //     return false;
  //   }
  //   if(filtered_categories.indexOf(ftrKey) !== -1 ){
  //     return false; // the key is included in categories to be filtered;
  //   }
  //   return true; // value for key exists, and it is not one of the to be filterd categories
  // }).map( ftrKey => {
  //   // console.log(ftrKey);
  //   if (typeof(currentTooltip.feature[ftrKey]) === 'string' )
  //   {
  //     return(
  //       <li key={ftrKey}>
  //         {ftrKey} : {currentTooltip.feature[ftrKey]}
  //       </li>
  //     )
  //   }
  //   if (ftrKey === "evidences") {
  //     // evidences
  //     return (
  //       <li key={"evidences"}>
  //         evidences :
  //         <ul style={{ listStyleType: "none", paddingInlineStart: "1rem" }}>
  //           {currentTooltip.feature["evidences"]?.map((evidence, index) => {
  //             return (
  //               <li key={index}>
  //                 {index + 1}:{helperFeatureEvidenceParser(evidence)}
  //               </li>
  //             );
  //           })}
  //         </ul>
  //       </li>
  //     );
  //   }
  //   return( // will write for the case of ligand, probably;
  //     <li key={ftrKey}>
  //       {ftrKey} : {JSON.stringify(currentTooltip.feature[ftrKey])} 
  //     </li>)
  // } )
  

  const currentTooltipFeatureJSX = (
    <div>
      <div style={{ display: "flex", justifyContent:'center',gap: "0.5rem", marginTop:'0.25rem' }}>
        <p style={{margin:'0px'}}>{currentTooltip.feature.type}</p>
        <p style={{margin:'0px'}}>
          {currentTooltip.feature.begin}-{currentTooltip.feature.end}
        </p>
      </div>
      {currentTooltip.feature.description && (
        <div style={{ display: "flex",flexDirection:'column' ,alignItems:'center', gap:'0.5rem', marginTop:'1rem'}}><p style={{margin:'0px'}}> description:</p> <p style={{margin:'0px'}}> {currentTooltip.feature.description}</p> </div>
      )}
      {currentTooltip.feature?.ftId && (
        <div style={{ display: "flex",flexDirection:'column' ,alignItems:'center', gap:'0.5rem', marginTop:'1rem'}}><p style={{margin:'0px'}}> Uniprot Feature ID:</p> <p style={{margin:'0px'}}> {currentTooltip.feature.ftId}</p> </div>
      )}
      { currentTooltip.feature?.evidences?.length > 0 &&
      <ul style={{ textAlign:'center', listStyleType: "none", marginTop: "1rem", paddingInlineStart:'0px' }}>
        {currentTooltip.feature.evidences.filter(ev => ev.source?.url !== undefined).map( (evidence,idx) => {
          return(
            <li key={idx}>
              <a href={evidence.source.url}>
                evidence{idx + 1}   
              </a>
              
            </li>
          )
        } )}
      </ul>
      }
    </div>
  );

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
            // display: "flex",
            // // height: "4.5vh",
            // // backgroundColor: "lightblue",
            // // justifyContent:'end',
            // alignItems: "center",
          }}
        >
          <div
            style={{
              // display: "flex",
              // height: String(laneHeight*0.9) +'vh',
              // backgroundColor: "lightblue",
              // width: "100%",
              // justifyContent: "end",
              // alignItems: "center",
            }}
          >
            <h4 style={{ fontSize: h4_font_size }}>
              {category.split("_").join(" ")} :
            </h4>
          </div>
        </div>,
        <div
          key={category + "metadataFeatureLane"}
          style={{ height: String(laneHeight)+'vh', width: laneWidth }}
        >
          <MetadataFeatureLane
            featureArray={cur_category_features}
            sequenceLength={sequenceLength}
            
            scaleAndOriginX={scaleAndOriginX}
            setScaleAndOriginX={setScaleAndOriginX}
            changeTooltipFeature={changeTooltipFeature}
            colorPalette = {c_palettes[idx % c_palettes.length]}
          />
        </div>,
      ];
    }
  );
  let currentTooltipJSX;
  if (currentTooltip.positionLeft) {
    currentTooltipJSX = (
      <div
        style={{
          position: "absolute",
          left: String(currentTooltip.posX - 20) + "px",
          top: String(currentTooltip.posY + 15) + "px",
          zIndex: 1000,
          // backgroundColor: currentTooltip.color,
          backgroundColor: "lavender",
          maxHeight: "50vh",
          overflowY: "auto",
          padding:'0.25rem 0.25rem'
        }}
      >
        {currentTooltipFeatureJSX}
      </div>
    );
  } else {
    currentTooltipJSX = (
      <div
        style={{
          position: "absolute",
          right: String(window.innerWidth - (currentTooltip.posX + 30)) + "px",
          top: String(currentTooltip.posY + 15) + "px",
          zIndex: 1000,
          // backgroundColor: currentTooltip.color,
          backgroundColor: "lavender",
          maxHeight: "50vh",
          overflowY: "auto",
          padding:'0.25rem 0.25rem'
        }}
      >
        <ul
          style={{
            listStyleType: "none",
            paddingInlineStart: "3rem",
            paddingInlineEnd: "3rem",
          }}
        >
          {currentTooltipFeatureJSX}
        </ul>
      </div>
    );
  }

  return (
    // can't give rowgap, because then the canvasses won't touch, and there will be dead zones for zoom, instead make canvas larger, and then not draw the figures to those areas
    <>
      <div
        // style={{
        //   display: "grid",
        //   columnGap: "10px",
        //   // marginLeft:'20px', //
        //   gridTemplateColumns: "10vw auto",
        // }}
      >
        {featureCategoriesAndColumnsJsx}
      </div>

     
      {currentTooltip.feature !== "invisible" && ( // if Panning starts currentToolTipFeature will turn into 'invisible'
        <div>
          <div
            style={{
              // the little triangle that indicates what we are pointing at
              position: "absolute",
              left: String(currentTooltip.posX - 10) + "px",
              top: String(currentTooltip.posY) + "px",
              zIndex: 1001,
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "20px solid lavender",
              pointerEvents:'none',
              
            }}
          ></div>
          {currentTooltipJSX}
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