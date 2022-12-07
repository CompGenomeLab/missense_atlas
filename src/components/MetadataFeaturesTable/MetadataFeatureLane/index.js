import React, { useEffect, useRef, useCallback, useState } from "react";

function MetadataFeatureLane({ featureArray, sequenceLength, isLatest }) {
  const metadataFeatureLaneRef = useRef(null);
  // also returns the extendedFeatureArray, which has an extra field that specifies which sublane is the current feature supposed to be in
  const findSubLanesNeeded = () => {
    // for metadata features
    // try to put each feature into a lane, starting from 1st lane, if can't find a lane, add another lane
    // careful we need to parseInt, because begin and end are json values;
    //featureArray.sort((a,b) => parseInt(a.begin) - parseInt(b.begin)); // ascending sort; just in case;
    // no need to sort, as data comes sorted already in the parent;
    // console.log(featureArray);
    let temp_feature_array = JSON.parse(JSON.stringify(featureArray)); // to deep copy
    let lanes_needed = 1;
    let lanes_last_endings = new Map();// keeping track of each lanes latest ending point;
    temp_feature_array[0].sub_lane = 1; // first in the list gets first sublane always
    lanes_last_endings.set(1, parseInt(temp_feature_array[0].end)); // add the value for the first of the array
    for (let i = 1; i < temp_feature_array.length; i++) {
      let cur_begin = parseInt(temp_feature_array[i].begin);
      let cur_end = parseInt(temp_feature_array[i].end);
      let current_lane = 1;
      let lane_not_found = true;
      for (let j = 1; j <= lanes_last_endings.size && lane_not_found; j++) {
        if (cur_begin < lanes_last_endings.get(j)) {
          // can't put in this lane
          current_lane += 1;
        } else {
          // breaks loop as we found the lane we can put into;
          lane_not_found = false;
        }
      }
      // after the for loop, we found the appropriate lane;
      temp_feature_array[i].sub_lane = current_lane; // our extension to the feature array;
      lanes_last_endings.set(current_lane, cur_end); // update the last ending for the lane we placed the current elemnt;
      if (current_lane > lanes_needed) {
        lanes_needed = current_lane;
      }
    }
    
    return {extended_feature_arr: temp_feature_array, lane_count: lanes_needed};
  };

  const extendedFeatureArray = findSubLanesNeeded().extended_feature_arr;
  const subLaneCount = findSubLanesNeeded().lane_count;
  const curCategory = extendedFeatureArray[0].category.replace("_"," ");
  const canvasId = "Lane " + curCategory; // not really needed;

  const drawLane = useCallback(() => {
    // let s_time = Date.now();
    const c = metadataFeatureLaneRef.current;
    const ctx = c.getContext("2d");
    c.style.width = "100%" ; //lane_width + "px"; //'calc(100vw - 200px)'; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
    c.style.height = "5vh";
    const rect = c.getBoundingClientRect(); //console.log(rect);
    const laneWidth = rect.width;// must be the same as in canvas width html element
    const laneHeight = rect.height;
    const ratio = window.devicePixelRatio;
    c.width = laneWidth * ratio; // width is taken from 100%
    c.height = laneHeight * ratio; // height is predetermined;
    // Probably not but calc syntax should be correct 100vw-200px wont work 
    // console.log(canvas_originX);
    //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio,ratio);
    // ctx.fillRect(0,0,lane_width,lane_height/2);
    const cell_width = laneWidth/sequenceLength;
    let sub_lane_height = 0;
    let lane_top_margin = 0;
    let sublane_divider_height = 0;
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(0,1);
    ctx.lineTo(laneWidth,1);
    ctx.stroke();
    console.log(isLatest);
    if (isLatest) {
      ctx.moveTo(0, laneHeight - 1);
      ctx.lineTo(laneWidth, laneHeight - 1);
      ctx.stroke();
    }
    if (subLaneCount === 1) {
      lane_top_margin = laneHeight/4;
      sublane_divider_height = 0;
      sub_lane_height = (laneHeight - (lane_top_margin *2)) / subLaneCount ;
    }
    else{
      lane_top_margin = laneHeight/4;
      sublane_divider_height = lane_top_margin/2;
      sub_lane_height = (laneHeight - (lane_top_margin *2) - sublane_divider_height*(subLaneCount-1) ) / subLaneCount ;
      
    }
    for(let i = 0; i< extendedFeatureArray.length; i++)
    {
      const cur_begin_x = parseInt(extendedFeatureArray[i].begin) * cell_width ;
      const cur_end_x = (parseInt(extendedFeatureArray[i].end) + 1) * cell_width ;
      const cur_sub_lane = parseInt(extendedFeatureArray[i].sub_lane);
      const fill_width = cur_end_x - cur_begin_x;
      const start_height = lane_top_margin + ((cur_sub_lane-1) * (sub_lane_height + sublane_divider_height) );
      ctx.fillStyle = "black";
      ctx.fillRect(cur_begin_x, start_height ,fill_width,sub_lane_height);
      if(curCategory === "TOPOLOGY"){
        const topology_text = extendedFeatureArray[i].type; 
        ctx.textAlign = "center";
        ctx.fillStyle = 'red';
        ctx.textBaseline = "middle";
        ctx.fillText(topology_text, (cur_begin_x + fill_width/2) , start_height + sub_lane_height/2 ,fill_width - 2);
      }
      // ctx.fillRect(0,0,999,999);
    }
    // let e_time = Date.now();
    // console.log("drawing => " + String(e_time - s_time));
  },[extendedFeatureArray,sequenceLength,curCategory,subLaneCount,isLatest]);

  useEffect( () => {
    drawLane();
  },[drawLane] );
 
  return (
    // using canvas because we want to be able to zoom and pan, similar to heatmap, and I have already implemented it in canvas
    <canvas
      id={canvasId}
      ref={metadataFeatureLaneRef}
    ></canvas>
  );
}

export default MetadataFeatureLane;
