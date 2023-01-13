import React, { useEffect, useRef, useCallback, useState } from "react";

import {
  top_margin_sl_coef,
  top_margin_ml_coef,
  sub_lane_divider_coef,
  max_zoom_visible_aa_count
} from "../../../config/config";
// sl = single line, ml = multiline;
//coef = coefficient
function MetadataFeatureLane({
  featureArray,
  sequenceLength,
  isLastLane,
  isFirstLane,
  scaleAndOriginX,
  setScaleAndOriginX,
  changeTooltipFeature,
  colorPalette
}) {
  const metadataFeatureLaneRef = useRef(null);
  const [prevTime, setPrevTime] = useState(() => Date.now()); // limit number of drawings per second, must have for resizing window
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
    let lanes_last_endings = new Map(); // keeping track of each lanes latest ending point;
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

    return {
      extended_feature_arr: temp_feature_array,
      lane_count: lanes_needed,
    };
  };
  const extendedFeatureArray = findSubLanesNeeded().extended_feature_arr;
  const subLaneCount = findSubLanesNeeded().lane_count;
  const curCategory = extendedFeatureArray[0].category;

  let typesAndColors = {};
  let cur_palette_index = 0;
  for (let i = 0; i < featureArray.length; i++) {
    const cur_type = featureArray[i].type;
    if (typesAndColors[cur_type] === undefined) {
      typesAndColors[cur_type] = colorPalette[cur_palette_index];
      cur_palette_index = (cur_palette_index + 1) % colorPalette.length;
    }
  }

  const calculateLaneMarginDividerandHeight = useCallback(
    (laneHeight) => {
      let lane_top_margin; // there will be a bottom margin, but it is equal to top margin so no need to name it
      let sub_lane_divider_height;
      let sub_lane_height;
      if (subLaneCount === 1) {
        lane_top_margin = laneHeight / top_margin_sl_coef; // the coefficient we divide with can be part of config.js
        sub_lane_divider_height = 0; // no divider exists between lanes , as there is a single lane
        sub_lane_height = (laneHeight - lane_top_margin * 2) / subLaneCount;
      } else {
        lane_top_margin = laneHeight / top_margin_ml_coef; // the coefficient we divide with can be part of config.js
         // share this area with sub_lane_height and divider height;
         // now sub_lane_divider_height is related to sub_lane_height;
         const non_margin_height = laneHeight - 2* lane_top_margin; 
         const k = sub_lane_divider_coef; // to make the next line shorter
         sub_lane_divider_height = non_margin_height/( (subLaneCount * k) + subLaneCount - 1  );
         sub_lane_height = sub_lane_divider_height * k;

        // OLD calculation, divider_coef, related to lane_top_margin size,
        // sub_lane_divider_height = lane_top_margin / sub_lane_divider_coef; // the coefficient we divide with can be part of config.js
        // sub_lane_height =
        //   (laneHeight -
        //     lane_top_margin * 2 -
        //     sub_lane_divider_height * (subLaneCount - 1)) /
        //   subLaneCount;
      }
      return {
        lane_top_margin: lane_top_margin,
        sub_lane_divider_height: sub_lane_divider_height,
        sub_lane_height: sub_lane_height,
      };
    },
    [subLaneCount]
  );



  const drawLane = useCallback(() => {
    // let s_time = Date.now();
    const c = metadataFeatureLaneRef.current;
    const ctx = c.getContext("2d");
    c.style.width = "100%"; //lane_width + "px"; //'calc(100vw - 200px)'; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
    c.style.height = "100%";
    const rect = c.getBoundingClientRect(); //console.log(rect);
    const laneWidth = rect.width; // must be the same as in canvas width html element
    const laneHeight = rect.height;
    const ratio = window.devicePixelRatio;
    c.width = laneWidth * ratio; // width is taken from 100%
    c.height = laneHeight * ratio; // height is predetermined;
    // Probably not but calc syntax should be correct 100vw-200px wont work
    // console.log(lane_originX);
    //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    const lane_originX = scaleAndOriginX.originX * laneWidth; //!!QZY
    const lane_scale = scaleAndOriginX.scale;
    ctx.scale(lane_scale, 1);
    ctx.translate(-lane_originX, 0);

    // ctx.fillRect(0,0,lane_width,lane_height/2);
    const cell_width = laneWidth / sequenceLength;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(laneWidth, 1);
    ctx.stroke();
    if (isLastLane) {
      ctx.moveTo(0, laneHeight - 1);
      ctx.lineTo(laneWidth, laneHeight - 1);
      ctx.stroke();
    }
    
    const {sub_lane_height , lane_top_margin, sub_lane_divider_height } = calculateLaneMarginDividerandHeight(laneHeight);

    for (let i = 0; i < extendedFeatureArray.length; i++) { // -1, because begin is indexed from 1, not 0;
      const cur_begin_x = (parseInt(extendedFeatureArray[i].begin) -1 )  * cell_width;
      const cur_end_x =
        (parseInt(extendedFeatureArray[i].end)) * cell_width;
      const cur_sub_lane = parseInt(extendedFeatureArray[i].sub_lane);
      const fill_width = cur_end_x - cur_begin_x;
      const start_height =
        lane_top_margin +
        (cur_sub_lane - 1) * (sub_lane_height + sub_lane_divider_height);
      const cur_type = extendedFeatureArray[i].type;
      ctx.fillStyle = typesAndColors[cur_type];
      ctx.fillRect(cur_begin_x, start_height, fill_width, sub_lane_height);
      if (curCategory === "TOPOLOGY") {
        const topology_text = extendedFeatureArray[i].type;
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";

        ctx.scale(1 / lane_scale, 1);
        // draws right in the middle, but the text becomes too small then
        // if we don't do it like this, then the text becomes too big then, what to do?
        ctx.fillText(
          topology_text,
          (cur_begin_x + fill_width / 2) * lane_scale,
          start_height + sub_lane_height / 2,
          fill_width - 2
        );
        ctx.scale(lane_scale, 1);
      }
      // ctx.fillRect(0,0,999,999);
    }
    // let e_time = Date.now();
    // console.log("drawing => " + String(e_time - s_time));
  }, [
    extendedFeatureArray,
    sequenceLength,
    curCategory,
    isLastLane,
    scaleAndOriginX,
    calculateLaneMarginDividerandHeight,
    typesAndColors
  ]);

  const wheelZoomLane = useCallback(
    (e, lane_scale_and_originX) => {

      const cur_time = Date.now();

      const c = metadataFeatureLaneRef.current;
      const rect = c.getBoundingClientRect();
      const lane_width = rect.width;
      // const lane_height = rect.height;
      const mouse_xcor = e.clientX - rect.left;
      // const mouse_ycor = e.clientY - rect.top;
      
      // ((a&b) || (c&d)) & (f>1000) => ( (a || b) & (c || d) ) || (f<1000)
      // !((a&b) || (c&d)) =>  !(a&b) & !(c&d) => ((!a || !b) & (!c || !b)) || f<1000
      // deltaY => 0 => scrolling down; = zoom out
      // if code goes into the if block, then actual scrolling of the page is allowed, else the scroll is blocked;
      // allow scroll after a set time from last zoom or scale change

      let max_zoom_value = sequenceLength/max_zoom_visible_aa_count;

      if (cur_time - prevTime < 1500){
        e.preventDefault();
        if (cur_time - prevTime < 32){
          return;
        }
      }

      const lane_scale_prev = lane_scale_and_originX.scale; // value of zoom before scroll event
      const lane_originX_prev = lane_scale_and_originX.originX * lane_width;

      let lane_scale_next = (1 - e.deltaY / 180) * lane_scale_prev; //new value of zoom after scroll
      lane_scale_next = Math.min(Math.max(1, lane_scale_next), max_zoom_value); 
      const scalechange = lane_scale_next / lane_scale_prev; //

      let real_xcor = lane_originX_prev + mouse_xcor / lane_scale_prev; // real x coordinate of the mouse pointer, this line is reused in tooltip function
      // real coordinate of current mouse point;
      let lane_originX_next = Math.max(
        real_xcor - (real_xcor - lane_originX_prev) / scalechange,
        0
      ); // so that it doesn't become smaller than 0
      lane_originX_next = Math.min(
        lane_originX_next,
        lane_width - lane_width / lane_scale_next
      ); // so that heatmap new originX isn't too large, (start and end is constant)
      lane_originX_next = lane_originX_next / lane_width; // !!QZY
      if (lane_scale_next !== lane_scale_prev) {
        e.preventDefault();
        // changeTooltipFeature('invisible',0,0,'#FFFFFF');
        setScaleAndOriginX({
          scale: lane_scale_next,
          originX: lane_originX_next,
        });
        setPrevTime(cur_time); 

      }
    },
    [prevTime, setScaleAndOriginX,sequenceLength]
  );
  
  // zoom listener registration
  useEffect(() => {
    // console.log("zlistener");

    // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom(e,topCanvasScalePrevRef)); // to cancel scrolling while on heatmap
    const zoomListener = (e) => wheelZoomLane(e, scaleAndOriginX);
    let ttRefValue = null;
    if (metadataFeatureLaneRef.current) {
      metadataFeatureLaneRef.current.addEventListener("wheel", zoomListener);
      ttRefValue = metadataFeatureLaneRef.current; // to cancel scrolling while on heatmap
    }

    return () => {
      // console.log("cleanup runs");
      if (ttRefValue) {
        ttRefValue.removeEventListener("wheel", zoomListener);
      }
    };
  }, [wheelZoomLane, scaleAndOriginX]);

  // redraw, drawLane already depends on"Scale and Origin"
  useEffect(() => {
    drawLane();
  }, [drawLane]);

  
  const panLane = (e) => {
    const isScrolling = (e.buttons %8 === 4);
    const isDown = (e.buttons %2 === 1);
    if (isDown === false || isScrolling)
    {
      return;
    }
    const c = metadataFeatureLaneRef.current;
    const laneRect = c.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const lane_width = laneRect.width;
    const lane_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const lane_originX_prev = scaleAndOriginX.originX * lane_width; // QZY  
    const dx_normalized = (e.movementX * -1) / lane_scale; // change in X direction

    let lane_originX_next = lane_originX_prev + dx_normalized;
    
    lane_originX_next = Math.max(lane_originX_next,0); // origin not smaller than 0
    lane_originX_next = Math.min(lane_originX_next, (lane_width - lane_width/lane_scale)); // origin not larger than heatmap rightmost point;
    if (lane_originX_next !== lane_originX_prev ){
      lane_originX_next = lane_originX_next / lane_width; // QZY To make it in the correct format 
      // changeTooltipFeature('invisible',0,0,'#FFFFFF') // resetting tooltip so that it doesn't point to a different part;
      setScaleAndOriginX(prev => {
        return (  
          {scale: lane_scale ,originX: lane_originX_next }
        )
        } );
    }
    
  };


  // position_idx yerine raw pointerin valuesını yolla, brca2 gibi uzun sekanslarda 1 pozisyon uzunlugundaki feature'lar
  // 1 pixel'den kucuk oldugu icin position_idx oldugu zaman hepsini secemiyor
  const helper_find_feature = (position_idx,mouse_ycor,lane_height) =>  {

    const {sub_lane_height , lane_top_margin, sub_lane_divider_height } = calculateLaneMarginDividerandHeight(lane_height);
    for(let i = 0; i< extendedFeatureArray.length; i++){
      if (position_idx >= extendedFeatureArray[i].begin && position_idx <= extendedFeatureArray[i].end){
        const cur_sub_lane = extendedFeatureArray[i].sub_lane;
        const cur_ftr_start_ycor =
        lane_top_margin +
        (cur_sub_lane - 1) * (sub_lane_height + sub_lane_divider_height);
        const cur_ftr_end_ycor = cur_ftr_start_ycor + sub_lane_height;
        if (cur_ftr_start_ycor <=  mouse_ycor && mouse_ycor <= cur_ftr_end_ycor ){
          return extendedFeatureArray[i];
        }
      }
    }
    console.log("Not a Feature");
    return 'invisible';
  }

  const onMouseDownHelper = (e) => {
    const c = metadataFeatureLaneRef.current; // if goes out of feature lanes bounds
    const rect = c.getBoundingClientRect()
    const lane_width = rect.width;
    const lane_height = rect.height;
    const mouse_xcor = e.clientX - rect.left;
    const mouse_ycor = e.clientY - rect.top;
   
    //console.log("mouse xcor_point = " +mouse_xcor);
    //console.log("mouse_ycor " + mouse_ycor);
    // impossible to be out of them I guess
    if (mouse_xcor > lane_width || mouse_xcor < 0 || mouse_ycor > lane_height || mouse_ycor < 0 )  // lane boundaries;
    {
      return;
    }
    else // only if mouse points inside correct the heatmap
    {
      //find the currently pointed position in the sequence
      const cell_width = lane_width/sequenceLength;
      const lane_scale = scaleAndOriginX.scale; 
      const lane_originX_prev = scaleAndOriginX.originX * lane_width; // QZY
      //const canvas_originX_prev = scaleAndOriginX.originX;
      let real_xcor =  lane_originX_prev + (mouse_xcor/lane_scale);
      const current_aminoacid_position = Math.max(Math.ceil(real_xcor/cell_width),1) 

      // find the feature that corresponds to that position
      const feature = helper_find_feature(current_aminoacid_position,mouse_ycor,lane_height);
      const ftr_color = typesAndColors[feature.type];
      let position_left = true;
      if (e.clientX > window.innerWidth/2){
        position_left = false;;
      }
      changeTooltipFeature(feature,e.pageX, e.pageY,ftr_color,position_left);
    }
  };





  const onDoubleClickHelper = () => {
    if(scaleAndOriginX.scale !== 1){
      setScaleAndOriginX({ scale: 1, originX: 0 })
      // changeTooltipFeature('invisible',0,0,'black') // remove tooltip because it will point to a location that is not the mouse;
    }
  }

  return (
    // using canvas because we want to be able to zoom and pan, similar to heatmap, and I have already implemented it in canvas
    // parent div width = 100%, height = 5vh;
    // children canvases have width 95%, Not to be confused with parents 100%
    // %10 on the left, so we are left with 90% of the whole document, 
    // to get %10 + 80% => 8/9 => 0.8888 => 88.888 percent
    <div
      id={"Lane Div " + curCategory}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
          <canvas
            id={"Lane " + curCategory}
            ref={metadataFeatureLaneRef}
            style={{ position: "absolute", top: "0px", left: "0px" }}
            // zoom is added manually to prevent scrolling
            onDoubleClick={() => onDoubleClickHelper()}
            onMouseDown={(e) => onMouseDownHelper(e)}
            onMouseMove={(e) => panLane(e)}
          ></canvas>

          {/* <canvas
            id={"Lane " + curCategory + "Ttip"}
            ref={metadataFeatureLaneRef}
            style={{ position: "absolute", top: "0px", left: "0px", height:'100%', width:'100%', zIndex:100 }}
            height={window.innerHeight/20} // doesn't matter, as we are giving height and width in style part;
            width={window.innerWidth} // doesn't matter as well, Also, after the initial run styles are overriden by the drawToolTipOrPan function
            
          ></canvas> */}
    </div>
  );
}
//style = {{position:"absolute",top:"40px", left: aminoAcidLegendWidth + "px"}} height={270} width={window.innerWidth - 200}
export default MetadataFeatureLane;


// // allow scrolling if not zooming deprecated
// if ( ((lane_scale_and_originX.scale === 1 && e.deltaY >= 0) || (lane_scale_and_originX.scale === max_zoom_value && e.deltaY <= 0 ))
// && ((cur_time - prevTime) > 750 ) ){
//   return; // so that it scrolls, when it is at max zoom and user does zoom out, 
// }
// e.preventDefault(); // so that it doesn't scroll while zooming

// if (cur_time - prevTime < 32) {
//   // to limit fps;
//   return;
// }