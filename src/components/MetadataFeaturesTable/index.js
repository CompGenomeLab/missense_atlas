import React, {useState} from "react";
import MetadataFeatureLane from "./MetadataFeatureLane";

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


  const featureCategories =
    allFeaturesArray?.reduce((curSet, ftr) => {
      curSet.add(ftr.category);
      return curSet;
    }, new Set()) || new Set(); // return empty set if metadata doesn't exist instead of undefined;

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
            flexWrap: "wrap",
            height: "4.5vh",
            backgroundColor: "lightblue",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <h3 style={{ fontSize: "1.5vh", textAlign: "center" }}>
            {category.split("_").join(" ")}
          </h3>
        </div>,
        <div key={category + "metadataFeatureLane"} style={{ height: "5vh" }}>
          <MetadataFeatureLane
            featureArray={cur_category_features}
            sequenceLength={sequenceLength}
            isLastLane={idx === featureCategories.size - 1} // index starts from 0, size starts from 1
            isFirstLane ={idx === 0}
            scaleAndOriginX = {scaleAndOriginX}
            setScaleAndOriginX = {setScaleAndOriginX}
            isDown = {isDown}
            setIsDown = {setIsDown}
            panningStartX = {panningStartX}
            setPanningStartX = {setPanningStartX}
            changeTooltipFeature = {changeTooltipFeature}
          />
        </div>,
      ];
    }
  );
  // if currentTooltipFeature is 'invisible' it doesn't give an error, so it is fine now;
  const currenTooltipFeatureTooltip = Object.keys(currentTooltipFeature)?.map( ftrKey => {
    // console.log(ftrKey);
    if (typeof(currentTooltipFeature[ftrKey]) === 'string' )
    {
      return(
        <li key={ftrKey}>
          {ftrKey} : {currentTooltipFeature[ftrKey]}
        </li>
      )
    }
    return(
      <li key={ftrKey}>
        {ftrKey} : {JSON.stringify(currentTooltipFeature[ftrKey])} 
      </li>)
    
    
  } )
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
    {
      currentTooltipFeature !== 'invisible' && // if Panning starts currentToolTipFeature will turn into 'invisible'
    <div style={{position:'absolute', left: (String(mousePosXY.x) + 'px') ,top: (String(mousePosXY.y) + 'px'), zIndex:1000, pointerEvents:'none', backgroundColor:'lavender' }}> 
      {/* <p> {JSON.stringify(currentTooltipFeature)} </p> */}
      <ul style={{ listStyleType:'none' }}> {currenTooltipFeatureTooltip} </ul>
    </div>
    }
    

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
