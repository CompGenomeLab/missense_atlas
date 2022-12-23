import React, { useEffect, useRef, useCallback, useState } from "react";

function MetadataFeatureLane({
  featureArray,
  sequenceLength,
  isLastLane,
  isFirstLane,
  scaleAndOriginX,
  setScaleAndOriginX,
  isDown,
  setIsDown,
  panningStartX,
  setPanningStartX,
  changeTooltipFeature
}) {
  const metadataFeatureLaneRef = useRef(null);
  const metadataTooltipRef = useRef(null);
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

  const calculateLaneMarginDividerandHeight = useCallback(
    (laneHeight) => {
      let lane_top_margin;
      let sub_lane_divider_height;
      let sub_lane_height;
      if (subLaneCount === 1) {
        lane_top_margin = laneHeight / 4; // the coefficient we divide with can be part of config.js
        sub_lane_divider_height = 0;
        sub_lane_height = (laneHeight - lane_top_margin * 2) / subLaneCount;
      } else {
        lane_top_margin = laneHeight / 8; // the coefficient we divide with can be part of config.js
        sub_lane_divider_height = lane_top_margin / 2; // the coefficient we divide with can be part of config.js
        sub_lane_height =
          (laneHeight -
            lane_top_margin * 2 -
            sub_lane_divider_height * (subLaneCount - 1)) /
          subLaneCount;
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
    c.style.height = "5vh";
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
    ctx.strokeStyle = "green";
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
      ctx.fillStyle = "black";
      ctx.fillRect(cur_begin_x, start_height, fill_width, sub_lane_height);
      if (curCategory === "TOPOLOGY") {
        const topology_text = extendedFeatureArray[i].type;
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
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
    calculateLaneMarginDividerandHeight
  ]);

  const wheelZoomLane = useCallback(
    (e, lane_scale_and_originX) => {
      const cur_time = Date.now();

      const c = metadataFeatureLaneRef.current;
      const rect = c.getBoundingClientRect();
      const lane_width = rect.width;
      const lane_height = rect.height;
      const mouse_xcor = e.clientX - rect.left;
      const mouse_ycor = e.clientY - rect.top;

      if (
        mouse_xcor > lane_width ||
        mouse_xcor < 0 ||
        mouse_ycor < 0 ||
        mouse_ycor > lane_height
      ) {
        // heatmap boundaries
        return;
      }
      e.preventDefault(); // so that it doesn't scroll while zooming
      if (cur_time - prevTime < 32) {
        // to limit fps;
        return;
      }
      setPrevTime(cur_time); // should it stay here or at the end??
      setIsDown((prev) => false);

      const lane_scale_prev = lane_scale_and_originX.scale; // value of zoom before scroll event
      const lane_originX_prev = lane_scale_and_originX.originX * lane_width;

      let lane_scale_next = (1 - e.deltaY / 180) * lane_scale_prev; //new value of zoom after scroll
      lane_scale_next = Math.min(Math.max(1, lane_scale_next), 64); // 64 = max zoom value, calculation of zoom value should be based on protein size
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
        setScaleAndOriginX({
          scale: lane_scale_next,
          originX: lane_originX_next,
        });
      }
    },
    [prevTime, setScaleAndOriginX,setIsDown]
  );
  
  // zoom listener registration
  useEffect(() => {
    // console.log("zlistener");

    // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom(e,topCanvasScalePrevRef)); // to cancel scrolling while on heatmap
    const zoomListener = (e) => wheelZoomLane(e, scaleAndOriginX);
    let ttRefValue = null;
    if (metadataTooltipRef.current) {
      metadataTooltipRef.current.addEventListener("wheel", zoomListener);
      ttRefValue = metadataTooltipRef.current; // to cancel scrolling while on heatmap
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

  
  const drawTooltipOrPan = (e) => {
    const c = metadataTooltipRef.current;
    const ctx = c.getContext("2d");
    const tooltipRect = c.getBoundingClientRect();
    const tooltip_width = tooltipRect.width;// must be the same as in canvas width html element
    const tooltip_height = tooltipRect.height;//must be the same as in canvas height html element
    const ratio = window.devicePixelRatio;
    c.style.width = "100%"; //lane_width + "px"; //'calc(100vw - 200px)'; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
    c.style.height = "5vh";
    c.width = tooltip_width * ratio;
    c.height = tooltip_height * ratio;
    // console.log("width =   "  + c.width);
    ctx.scale(ratio,ratio);
    ctx.clearRect(0,0,tooltip_width,tooltip_height);
    const cLane = metadataFeatureLaneRef.current;
    // !! get boundaries of the heatmap instead of the tooltip canvas, for the "rect" variable;
    const laneRect = cLane.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const lane_width = laneRect.width;
    const mouse_xcor = e.clientX - laneRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(laneRect.width);
    const lane_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const lane_originX_prev = scaleAndOriginX.originX * lane_width; // QZY  
    if (isDown) // panning the canvas if mouse down is down;
    {
      // console.log("isdonwnnnn2");
      changeTooltipFeature("invisible",e.pageX,e.pageY);
      const dx_normalized = (panningStartX - mouse_xcor) / lane_scale; // change in X direction

      let lane_originX_next = lane_originX_prev + dx_normalized;
      
      lane_originX_next = Math.max(lane_originX_next,0); // origin not smaller than 0
      lane_originX_next = Math.min(lane_originX_next, (lane_width - lane_width/lane_scale)); // origin not larger than heatmap rightmost point;
      lane_originX_next = lane_originX_next / lane_width; // QZY
      setScaleAndOriginX(prev => {
        return (  
          {scale: lane_scale ,originX: lane_originX_next }
        )
        } );
      setPanningStartX(prev => mouse_xcor); 
    }
  };


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
      changeTooltipFeature(feature,e.pageX, e.pageY);
      setIsDown(true);
      setPanningStartX(prev => mouse_xcor);
    }
  };

  const onMouseLeaveHelper = (e) => {
    const cLane = metadataFeatureLaneRef.current;
    // !! get boundaries of the heatmap instead of the tooltip canvas, for the "rect" variable;
    const laneRect = cLane.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const lane_height = laneRect.height;
    const lane_width = laneRect.width;
    const mouse_xcor = e.clientX - laneRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(laneRect.width);
    const mouse_ycor = e.clientY - laneRect.top;
    // out of bounds from right or left, or topmost lanes's top, or bottom most lane's bottom
    if ( (mouse_xcor > lane_width || mouse_xcor < 0) || (isFirstLane && mouse_ycor < 0) || (isLastLane && mouse_ycor > lane_height)  ) 
    { // boundary check for heatmap, -50 is for the space left for position indices
      // bigger or equal to, so that index finders don't go out of bounds, as maxwidth/cell_width = an index 1 bigger than the sequence length
      setIsDown(prev => false);// so that panning point resets when mouse goes out of bounds;
      return
    }
  };

  const onMouseUpHelper = (e) => {
    setIsDown(false)
  };


  return (
    // using canvas because we want to be able to zoom and pan, similar to heatmap, and I have already implemented it in canvas
    // parent div width = 100%, height = 5vh;
    // children canvases have width 95%, Not to be confused with parents 100%
    // %10 on the left, so we are left with 90% of the whole document, 
    // to get %10 + 80% => 8/9 => 0.8888 => 88.888 percent
    <div
      id={"Lane Div " + curCategory}
      style={{ width: "80vw", height: "5vh", position: "relative" }}
    >
          <canvas
            id={"Lane " + curCategory}
            ref={metadataFeatureLaneRef}
            style={{ position: "absolute", top: "0px", left: "0px" }}
          ></canvas>

          <canvas
            id={"Lane " + curCategory + "Ttip"}
            ref={metadataTooltipRef}
            style={{ position: "absolute", top: "0px", left: "0px", height:'5vh', width:'100%', zIndex:100 }}
            height={window.innerHeight/20} // doesn't matter, as we are giving height and width in style part;
            width={window.innerWidth} // doesn't matter as well, Also, after the initial run styles are overriden by the drawToolTipOrPan function
            onDoubleClick={() => setScaleAndOriginX({ scale: 1, originX: 0 })}
            onMouseDown={(e) => onMouseDownHelper(e)}
            onMouseUp={(e) => onMouseUpHelper(e)}
            onMouseMove={(e) => drawTooltipOrPan(e)}
            onMouseLeave = {(e) => onMouseLeaveHelper(e) }
          ></canvas>
    </div>
  );
}
//style = {{position:"absolute",top:"40px", left: aminoAcidLegendWidth + "px"}} height={270} width={window.innerWidth - 200}
export default MetadataFeatureLane;


