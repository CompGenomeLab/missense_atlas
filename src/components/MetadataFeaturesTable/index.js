import React, {useEffect, useState} from "react";
import MetadataFeatureLane from "./MetadataFeatureLane";
import { laneHeight,c_palettes, h4_font_size } from "../../config/config";




function MetadataFeaturesTable({ allFeaturesArray, sequenceLength, scaleAndOriginX, setScaleAndOriginX }) {
  
  // these 3 are shared by all lanes
  const [currentTooltip, setCurrentTooltipFeature] = useState({feature:'invisible', mouseX:0, mouseY:0, color:'#FFFFFF'}); // will be either invisible (won't dispaly)
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


 

  const featureCategories =
    allFeaturesArray?.reduce((curSet, ftr) => {
      curSet.add(ftr.category);
      return curSet;
    }, new Set()) || new Set(); // return empty set if metadata doesn't exist instead of undefined;

  
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
      return [
        <div
          key={category}
        >
          <div>
            <p style={{ fontSize: h4_font_size, marginBottom:'0px' }}>
              {category.split("_").join(" ")} :
            </p>
          </div>
        </div>,
        <div
          key={category + "metadataFeatureLane"}
          style={{ height: laneHeight, width: "100%" }}
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
    <>
      <div>
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
  );
}
export default MetadataFeaturesTable;
