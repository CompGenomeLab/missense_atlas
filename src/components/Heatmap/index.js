
import React, { useCallback, useEffect, useRef, useState,useMemo } from "react";

//  22.8 is the magic number for starting position of the heatmap summary, it starts at cell_height * 22.8;
const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];
// const aminoAcidLegendWidth = 120;
const aminoAcidLegendWidth = "10vw";
// const number_of_colors = 30;
// heatmap offset from config.js
// yukleme ekranı
function Heatmap( props ){
  const {currentPredictionToolParameters,proteinData,color_lists_array,number_of_colors, scaleAndOriginX, setScaleAndOriginX } = props;

    // maybe looping over the whole proteinData makes a differnece but probably not much
    // used use memo to not define a function and call it in the next line, because it is easier to read;
    // immediately invoked function expresssions can be used too, but there is no harm in useMemo I think
  const sequence_length = useMemo ( () => { // calculate sequence length based on the return value of the api
    let i = 1;
    while( Object.hasOwn (proteinData, i)  )
    {
      i += 1;
    }
    return i - 1 ;
  }, [proteinData] )
  const heatmapRef = useRef(null); // ref for the heatmap in top
  const aminoAcidLegendRef = useRef(null);
  const tooltipRef = useRef(null); // ref for the tooltip layer on top of the heatmap
  const currentviewWindowRef = useRef(null);
  const [isDown,setIsDown] = useState(false);
  const [panningStartX,setPanningStartX] = useState(0); 
  // const [scaleAndOriginX,setScaleAndOriginX] = useState({scale:1,originX:0}); // so that we update both of them at the smae time instead of seperately,;

  const [prevTime, setPrevTime] = useState( () => Date.now() ); // limit number of drawings per second, must have for resizing window

  // handles NaN
  const calculateMedianOfPosition = useCallback ( (i) => {
    let cur_pos_array = [];
    for (let j = 0; j<20; j++) // for each aminoacid
    {
        let current_score;
        if (Object.hasOwn(proteinData[i] , aminoacid_ordering[j]  )  ){
          current_score = parseFloat(proteinData[i][aminoacid_ordering[j]]);
          if(isNaN(current_score) ){ // typeof(current_score) !== 'number'
            // NaN value reached Nan nan
            return "NaN"; // used in heatmap median colors
          }
        }
        else{
          current_score = currentPredictionToolParameters.ref_value;
        }
        // const current_score = proteinData.scores[i+1][aminoacid_ordering[j]] || tool_parameters.ref_value;
        // cur_pos_mean += (current_score)/20;
        cur_pos_array.push(current_score);
    }
    // median calculation
    cur_pos_array.sort( (a,b) => a-b ) // ascending order;
    
    let cur_pos_median // changed to 10, because 0th is the reference,
    // if 0 is benign, then first index is reference, so elements from indices 1 to 19 are considered
    if (currentPredictionToolParameters.ref_value === 0){// biger or equal to, for the case of all tools prediction;
      cur_pos_median = cur_pos_array[10]; 
    }
    else{ // 1 is benign, so final element isn't considered in median calculation, 
      cur_pos_median = cur_pos_array[9]; 
    } // this will also work in the special case of visualizing all of the tools;
    return cur_pos_median;
  },[proteinData,currentPredictionToolParameters.ref_value])

  // handles NaN;
  const calculateRiskAssessment = (mutation_risk_raw_value) => {
    if (mutation_risk_raw_value === "Missing value"){
      return "Missing value";
    }
    if (isNaN(mutation_risk_raw_value)){ // typeof(mutation_risk_raw_value) !== 'number'
      //NaN
      return "NaN value in data";
    }
    
    const tool_parameters = currentPredictionToolParameters;
    let mutation_risk_assessment // 'Neutral';  // change based on mutation_risk_raw value;
      // score_ranges:[ {start:0.00, end:0.15, risk_assessment : ' benign' , start_color:"2C663C", end_color:"D3D3D3" } , 
      //            {start:0.15, end:0.85, risk_assessment :'possibly damaging',start_color:"D3D3D3", end_color:"FFA500" }, 
      //            {start:0.85, end: 1.00, risk_assessment:'confidently damaging',start_color:"FFA500", end_color:"981E2A" }, ]
    for (let i = 0; i< tool_parameters.score_ranges.length; i++){
      const current_loop_range_start = tool_parameters.score_ranges[i].start;
      const current_loop_range_end = tool_parameters.score_ranges[i].end;
      const current_loop_range_risk_assessment = tool_parameters.score_ranges[i].risk_assessment;
      if(mutation_risk_raw_value >= current_loop_range_start && mutation_risk_raw_value <= current_loop_range_end ){
        // is between current ranges
        mutation_risk_assessment = current_loop_range_risk_assessment;
        return mutation_risk_assessment;
      } 
    }
  }

  const heatmapColors = useMemo( () => {
    if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
      return
    }
    // 2d array; row count = sequence_length cols = 20, as we are looping the same way in drawheatmap etc.
    let temp_heatmapColorsMatrix = Array(sequence_length).fill().map(entry => Array(2).fill(-1)) 
    for(let i = 0; i< sequence_length; i++){
      for (let j = 0; j <20; j++) // aminoacid_ordering
      {
        let current_score;
        if (Object.hasOwn(proteinData[i+1] , aminoacid_ordering[j]  )  ){
          current_score = parseFloat(proteinData[i+1][aminoacid_ordering[j]]);
          if (isNaN(current_score))
          {
            temp_heatmapColorsMatrix[i][j] = "#0000FF";
            continue;
          }
        }
        else if (aminoacid_ordering[j] === proteinData[i+1].ref){
          // doesn't exist because it is the ref, everything going normal
          current_score = currentPredictionToolParameters.ref_value;
        }
        else{
          // doesn't exist and is not reference, similar to NaN value but harder to find, isn't as obvious, more insidious;
          temp_heatmapColorsMatrix[i][j] = "#0000FF";
          continue;
        }
        let color_index;
        let range_start;
        let range_end;
        let range_size;
        let color_lists_index;
        for (let k = 0; k< currentPredictionToolParameters.score_ranges.length; k++){
          const current_loop_range_start = currentPredictionToolParameters.score_ranges[k].start;
          const current_loop_range_end = currentPredictionToolParameters.score_ranges[k].end;
          if(current_score >= current_loop_range_start && current_score <=current_loop_range_end ){
            // is between current ranges
            range_start = current_loop_range_start;
            range_end = current_loop_range_end;
            range_size = range_end - range_start
            color_lists_index = k;
          } 
        }
        // 30 is number of colors // 29 = number of //colors in range -1
        color_index = Math.min( Math.floor((current_score - range_start) * (1/ range_size) * number_of_colors ) ,number_of_colors - 1 ) 
        temp_heatmapColorsMatrix[i][j] =  String(color_lists_array[color_lists_index][color_index]); 
    }
  }
  return temp_heatmapColorsMatrix;
    
    // if( Object.hasOwn(proteinData) )
  },[color_lists_array,proteinData,currentPredictionToolParameters,number_of_colors,sequence_length])

  const heatmapMeanColors = useMemo( () => {
    if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
      return
    }
    let temp_heatmapMeanColors = Array(sequence_length).fill(-1);
    for ( let i = 0; i < sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
    {
      const cur_pos_median = calculateMedianOfPosition(i+1); // i+1, because proteinData.scores' index starts from 1;
      if (cur_pos_median === "NaN"){ // NaN value checking
        temp_heatmapMeanColors[i] = "#0000FF";
      }
      else{        
        let color_index;  
        let range_start;
        let range_end;
        let range_size;
        let color_lists_index;  
        for (let k = 0; k< currentPredictionToolParameters.score_ranges.length; k++){
          const current_loop_range_start = currentPredictionToolParameters.score_ranges[k].start;
          const current_loop_range_end = currentPredictionToolParameters.score_ranges[k].end;
          if(cur_pos_median >= current_loop_range_start && cur_pos_median <=current_loop_range_end ){
            // is between current ranges
            range_start = current_loop_range_start;
            range_end = current_loop_range_end;
            range_size = range_end - range_start
            color_lists_index = k;
          } 
        }
        color_index = Math.min( Math.floor((cur_pos_median - range_start) * (1/ range_size) * number_of_colors ) ,number_of_colors -1  ) 
        temp_heatmapMeanColors[i] = String(color_lists_array[color_lists_index][color_index]);
      }
    } 
    return temp_heatmapMeanColors;

  },[color_lists_array,currentPredictionToolParameters,number_of_colors,sequence_length,calculateMedianOfPosition] )
  // callback because it is in useEffect dependency array,
  const drawHeatmap2 = useCallback (() => { // scale is given as parameter right now;
      //// be careful, cell_height and width must be the same in the tooltio, if you change this also change tooltip;
      // const start_time = Date.now(); // takes 60 ms for 1610 aa protein at max zoom, then gets better while zoomed in;
      if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
        return // only draw if these 2 parameters match, or else It will result in runtime error,
      }
      // if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length)
      //   return // only draw if these 2 parameters match, or else It will result in error,
      // const tool_parameters = currentPredictionToolParameters;
      const c = heatmapRef.current;
      const ctx = c.getContext("2d");
      c.style.width = '80vw' ; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
      const rect = c.getBoundingClientRect(); //console.log(rect);
      const heatmap_width = rect.width;// must be the same as in canvas width html element
      const heatmap_height = rect.height;//must be the same as in canvas height html element
      const ratio = window.devicePixelRatio;
      c.width = heatmap_width * ratio;
      c.height = heatmap_height * ratio;
      // console.log(heatmap_width);
      // Probably not but calc syntax should be correct 100vw-200px wont work 
      c.style.height = heatmap_height + "px";
      // console.log(canvas_originX);

      //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio,ratio);

      ctx.imageSmoothingEnabled = false; // doesn't actually do anything as this command is for imported images
      
      // ctx.clearRect(0,0,heatmap_width,heatmap_height); 
      const canvas_originX = scaleAndOriginX.originX * heatmap_width ; //!!QZY
      const canvas_scale = scaleAndOriginX.scale;
      ctx.scale(canvas_scale,1); 
      ctx.translate(-canvas_originX,0); 

      // console.log("orignx = " + canvas_originX);
      const cell_height = (heatmap_height - 70)/20; //!! must be same in drawtooltip //10, number 20 = aminoacids, also left 70 px space in the bottom;
      const cell_width = (heatmap_width/sequence_length); // sequence_length can not be 0
      // !! must be same in draw tooltip !!!! THIS IS THE REASON OF BORDERS BETWEEN SQUARES !!!
      // cell width changes on resize, because heamtap_width also changes;

      const num_visible = sequence_length/canvas_scale;
      // copied from currentviewWindow, minus 10 just to make sure, and no +1, because this won't be shown, only used as index of the array
      const leftmost_visible_index = Math.max(Math.floor((canvas_originX/heatmap_width * sequence_length) -10 ), 0); 
      const rightmost_visible_index = Math.min(Math.floor( (canvas_originX/heatmap_width * sequence_length) + (sequence_length/canvas_scale) + 10) , sequence_length );   // + 10 just to make sure
      // math.min and max so that index doesn't go out of bounds
      for (let i = leftmost_visible_index; i< rightmost_visible_index; i++)// for every aminoacid
      {
        // if (i*cell_width >= canvas_originX && (i*cell_width <= (canvas_originX + heatmap_width/canvas_scale) ) ){ // currently viewing
          for( let j = 0 ; j < 20 ; j++ )// for every position
          {// sift value = protein_data_sift[i].data[j].y 
            ctx.fillStyle = heatmapColors[i][j];
            ctx.fillRect(i * cell_width ,j * cell_height ,cell_width ,cell_height )
          }
      } 
      //drawing the aminoacid positions inside the protein;
      ctx.scale(1/canvas_scale,1); // need this so that numbers size stay same;
      ctx.fillStyle = 'black';
      ctx.font = "12px Arial";
        // i want 20 numbers at most,
        // at scale = 1; number visible = protein len; so I must multiply protein len by (20/protein len)
        // numbefr visible = sequence_length/scale
        // step_size = (num_visible/20)
      const browser_resize_ratio = (window.innerWidth/window.screen.availWidth); // so that numbers don't get jumbled up
      // the constant 20 in step_size calculation will be included in config.js
      const step_size = Math.max(Math.floor(num_visible/ ( 20  *  browser_resize_ratio )),1); // so that step_size isn't smaller than 1; // if stepsize becomes 0 I get infinite loop;
      for (let i = 0; i< rightmost_visible_index; i+= step_size) // without leftmost (let i = 0; i< sequence_length; i+= step_size) 
      {
        // let number_text = String(i+1);
        if (i === 0){
          ctx.textAlign = "left";
        }
        else{
          ctx.textAlign = "right";
        } 
        // because of ctx.translate(-canvas_originX) after scaling, this looks confusing but it is corrrect;
        ctx.fillText(String(i+1),cell_width * (i+0.5) * canvas_scale,cell_height*22);
      }
      ctx.scale(canvas_scale,1); // canvas scale returned back to state before we wrote positions;

      // draw position median values below;
      for ( let i = leftmost_visible_index; i< rightmost_visible_index; i++) // alternative is to count greens/yellows, or take the average of their colors
      {
        ctx.fillStyle = heatmapMeanColors[i];
        ctx.fillRect(i * cell_width ,22.8 * cell_height ,cell_width ,cell_height* 4.2 );
      } 
    // const end_time = Date.now();
    // console.log("draw time = " + String(end_time - start_time));
  },[scaleAndOriginX.originX,scaleAndOriginX.scale,sequence_length,color_lists_array,currentPredictionToolParameters,heatmapColors,heatmapMeanColors] );
  // callback because it is in useEffect dependency array;
  const drawCurrentViewWindow = useCallback ( () => { // 50 px both left and right for the index number to display
    // const start_time = Date.now();      // takes 13 miliseconds for 1610 aa protein
    // return;
    const c = currentviewWindowRef.current;
    const ctx = c.getContext("2d");
    c.style.width = 'calc(80vw + 100px)';

    const current_view_window_rect = c.getBoundingClientRect();
    const w = current_view_window_rect.width; 
    const h = current_view_window_rect.height;
    
    const ratio = window.devicePixelRatio;
    c.width = w * ratio;
    c.height = h * ratio;
    // c.style.width = w + "px";
    c.style.height = h + "px";
    ctx.scale(ratio,ratio);
    ctx.translate(50,0); // shift by the amount of buffer on the left (for the number index to render)
    // - 100 is IMPORTANT, THE OFFSET FROM LEFT AND RIGHT
    const heatmapRect_width =  w - 100; // actually the same as current_view_window_rect.width

    // fillrect params = (x: number, y: number, w: number, h: number): void
    // draw similar to position averages, but change alpha value,;
    // copied form drawheatmap2
    // const tool_parameters = currentPredictionToolParameters;
    const cell_width = (heatmapRect_width/sequence_length)
    const canvas_originX = scaleAndOriginX.originX * heatmapRect_width; //!!QZY
    const canvas_scale = scaleAndOriginX.scale;
    for ( let i = 0; i< sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
    {
      if (i*cell_width >= canvas_originX && (i*cell_width <= (canvas_originX + heatmapRect_width/canvas_scale) ) ){ // currently viewing
        // left = origin, right = origin + current view size = width/scale;
        ctx.fillStyle = heatmapMeanColors[i];
        ctx.fillRect(i * cell_width , h/2 , cell_width ,h/2 )
      }
      else{
        ctx.fillStyle = heatmapMeanColors[i] + "30"; // last value is opacity
        ctx.fillRect(i * cell_width , h/2 , cell_width ,h/2 )
      }

    } 
    // drawing indices;
    const leftmost_visible_index = String(Math.floor((canvas_originX/heatmapRect_width * sequence_length) +1 ));
    const rightmost_visible_index = String(Math.floor((canvas_originX/heatmapRect_width * sequence_length) + (sequence_length/canvas_scale)));  
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    ctx.font = '12px Arial';
    // if (((canvas_originX/heatmapRect_width * sequence_length) +1 ) > 10){ // if left most index is smaller than 20, textAlign to right;
    //     ctx.textAlign = 'right';
    // }
    // else{
    //     ctx.textAlign = 'left';
    // }
    ctx.textAlign = 'right';
    ctx.fillText( leftmost_visible_index , canvas_originX,  0 , 50) // leftmost visible of the window;
    ctx.textAlign = 'left';
    ctx.fillText(rightmost_visible_index, canvas_originX  + heatmapRect_width/canvas_scale , 0 , 50   );  // rightmost visilbe of the window
    // const end_time = Date.now();
    // console.log("cur view widnow time = " + String(end_time - start_time));
  },[scaleAndOriginX.originX,scaleAndOriginX.scale,sequence_length,heatmapMeanColors]);

  const wheelZoom2 =  useCallback ((e,canvas_scale_and_originX) =>{  // zoomig function
    // to limit the canvas re renderings to roughly 30 fps
    const cur_time = Date.now();

    // console.log("zoom start = " + String(cur_time - prevTime));
    
    const c = heatmapRef.current;
    const rect = c.getBoundingClientRect()
    const heatmap_width = rect.width;
    const heatmap_height = rect.height;
    const mouse_xcor = e.clientX - rect.left;
    const mouse_ycor = e.clientY - rect.top;

    if (mouse_xcor > heatmap_width || mouse_xcor < 0 || mouse_ycor < 0 || mouse_ycor > heatmap_height)// heatmap boundaries
    { 
      return
    }
    e.preventDefault(); // so that it doesn't scroll while zooming
    if (cur_time - prevTime < 32) // to limit fps;
    {
        // console.log(cur_time - prevTime);
        // console.log("fail");
        return;
    }
    setPrevTime(cur_time); // should it stay here or at the end??
    // just to make sure, we are not panning while zooming, 
    //moved here so that It doesn't block during returned (bcs of previous if block) zoom events
    setIsDown(prev => false); 

      // setPrevTime(prev => cur_time); // moved this to here;
      // console.log("set time");
      // console.log(String(cur_time - prevTime));

      // console.log(cur_time - prevTime);
      // console.log("prev_tiem O= " + prevTime);
      // console.log("current time = " + cur_time);
      // console.log("diff = " + String(cur_time - prevTime));
    
    //top_canvas_scale -= (e.deltaY/120); // zoom in if deltaY < 0 , zoom out if deltaY > 0
    // console.log("topCanvasScalePrev_in zoom = " + top_canvas_scale_prev_ref.current); //1
    //{scale:1,originX:0}
    // const canvas_scale_prev = canvas_scale_and_originX_ref.current.scale; // value of zoom before scroll event
    // const canvas_originX_prev = canvas_scale_and_originX_ref.current.originX;
    
    const canvas_scale_prev = canvas_scale_and_originX.scale; // value of zoom before scroll event
    const canvas_originX_prev = canvas_scale_and_originX.originX * heatmap_width; // QZY
    //const canvas_originX_prev = canvas_scale_and_originX.originX;


    // console.log("originX prev = ")
    let canvas_scale_next = (1 - (e.deltaY/180)) * canvas_scale_prev; //new value of zoom after scroll
    canvas_scale_next = Math.min(Math.max(1, canvas_scale_next), 64); // 64 = max zoom value, calculation of zoom value should be based on protein size
    const scalechange = canvas_scale_next / canvas_scale_prev; // 

    let real_xcor = canvas_originX_prev + (mouse_xcor/canvas_scale_prev); // real x coordinate of the mouse pointer, this line is reused in tooltip function
    // real coordinate of current mouse point;
    let canvas_originX_next = Math.max( (real_xcor - ((real_xcor - canvas_originX_prev)/scalechange)), 0); // so that it doesn't become smaller than 0
    canvas_originX_next = Math.min(canvas_originX_next,(heatmap_width - heatmap_width/canvas_scale_next)) // so that heatmap new originX isn't too large, (start and end is constant)
    canvas_originX_next = canvas_originX_next/heatmap_width // !!QZY
    if (canvas_scale_next !== canvas_scale_prev){       
      setScaleAndOriginX( {scale:canvas_scale_next, originX: canvas_originX_next} );
    }
    // setPrevTime(cur_time); // moved this to here;
    // console.log("setted time");
    // console.log(canvas_scale_prev);
    // console.log("zoom end = " + String(cur_time - prevTime));
    
  },[prevTime,setScaleAndOriginX]);

  // wheelzoom event registeration
  useEffect(()=>{ 
      // console.log("zlistener");
      
      // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom(e,topCanvasScalePrevRef)); // to cancel scrolling while on heatmap
      const zoomListener = (e) => wheelZoom2(e,scaleAndOriginX);
      let ttRefValue = null;
      if (tooltipRef.current ){
        tooltipRef.current.addEventListener("wheel", zoomListener);
        ttRefValue = tooltipRef.current; // to cancel scrolling while on heatmap
      }

      return () => {
        // console.log("cleanup runs");
        if (ttRefValue){
          ttRefValue.removeEventListener('wheel', zoomListener);
        }
      }

      // return () => { //probably no need to cleanup, as heatmapref.current becomes null;
      //   console.log('cleanup runs');        
      //   console.log("heatmapref cur = " + heatmapRef.current);
      // };
    },[wheelZoom2,scaleAndOriginX]);
  
  // redraw on scale or origin change (zoom or pan)
  useEffect( () => {
    if (heatmapRef && heatmapRef.current &&  sequence_length > 0) // Object.keys(proteinData).length !== 0 &&
      { 
          // let s_time = Date.now();
          drawHeatmap2();
          drawAminoAcidLegend();
          drawCurrentViewWindow();
          // let end_time = Date.now();
          // console.log("drawing hmap => " + String(end_time - s_time)); 
      } 
  }, [scaleAndOriginX,sequence_length,drawHeatmap2,drawCurrentViewWindow] );

  useEffect(() => { // redraw on resize
      const handleResize = () => { // reset canvasScaleOrigin reference and draw in roughly 30 fps
          // console.log("handleresize");
          const cur_time = Date.now();
          if (cur_time - prevTime < 32) // 1000/40 = 25 fps
          {
          return;
          }
          
          // giving canvas scale a new reference so that drawing heatmap runs once again;
          setScaleAndOriginX( prev => { return( {scale: prev.scale , originX: prev.originX } ) } )
          // drawHeatmap2(); // causes flickering , no idea why; instead I need to use setCanvasScaleAndOrigin and setPrevtime
          setPrevTime(prev => cur_time); // if removed, flickering will happen, no idea why?? May not be the case anymore
      }
      window.addEventListener("resize" , handleResize )

      return () => {window.removeEventListener("resize" , handleResize)}; // cleanup

  },[prevTime,setScaleAndOriginX]) // draw heatmap again on resize //drawHeatmap2
  
  const drawAminoAcidLegend  = () => {  // will only run once on startup of useEffect
      const c = aminoAcidLegendRef.current;
      const ctx = c.getContext("2d");
      const legend_rect = c.getBoundingClientRect();
      const w = legend_rect.width;
      const h = legend_rect.height;
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;
      c.style.width = aminoAcidLegendWidth;
      c.style.height = h + "px";
      ctx.scale(ratio,ratio);
      
      //{'A': 0, 'R': 1, 'N': 2, 'D': 3, 'C': 4, 'Q': 5, 'E': 6, 'G': 7, 'H': 8, 'I': 9, 'L': 10, 'K': 11, 'M': 12, 'F': 13, 'P': 14, 'S': 15, 'T': 16, 'W': 17, 'Y': 18, 'V': 19}    
      const cHeatmap = heatmapRef.current;
      const heatmapRect = cHeatmap.getBoundingClientRect();
      const cell_height = (heatmapRect.height - 70)/20; //!! must be same in drawtooltip and drwaheatmap //10, number 20 = aminoacids, also left 50 px space in the bottom;
      ctx.font = "12px Arial Narrow";
      
      ctx.lineWidth = 1;
      ctx.textAlign = 'right';
      for (let i = 0; i<20; i++)
      {
        ctx.fillText(aminoacid_ordering[i] , w -30  , (cell_height * (i+1)) );
        ctx.beginPath();       // Start a new path
        ctx.moveTo(w - 20 , cell_height * (i+0.5));    // Move the pen to (30, 50)
        ctx.lineTo(w - 10 , cell_height * (i+0.5));  // Draw a line to (150, 100)
        ctx.stroke();          // Render the path
      }

      ctx.fillText("Position" , w - 30 , cell_height*(24.5) );
      ctx.fillText("average" , w - 30 , cell_height* (26) );
      ctx.beginPath();
      ctx.moveTo(w - 20 ,  cell_height * (25));
      ctx.lineTo(w - 10, cell_height * (25));
      ctx.stroke();
      // ctx.fillText("Position average",20,(cell_height*(25+1)));
      // ctx.beginPath();
      // ctx.moveTo(105,  cell_height * (25+0.5) );
      // ctx.lineTo(115,  cell_height *  (25+0.5) );
      // ctx.stroke();

  } ;
  
  const drawTooltipHeatmapMain = (c,cHeatmap,e,x_offset,y_offset) => {
    const tool_parameters =  currentPredictionToolParameters;
    // tooltip ref variables
    const ctx = c.getContext("2d");      
    //heatmap ref variables
    const heatmapRect = cHeatmap.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const heatmapRect_height = heatmapRect.height;
    const heatmapRect_width = heatmapRect.width;
    const mouse_xcor = e.clientX - heatmapRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(heatmapRect.width);
    const mouse_ycor = e.clientY - heatmapRect.top; // scale doen't affect this, so this is the real_ycoordinate //console.log("hover mouse_ycor = " + mouse_ycor);// console.log(heatmapRect.height-50); // -50 space for position indexes;

    const cell_height = (heatmapRect_height-70)/20; //!! must be same in drawheatmap // 300/20 = 15 ,  number 20 is same for all 
    const cell_width = (heatmapRect_width/sequence_length); //!! must be same in drawheatmap // if we use floor, it will result in 0 cell width when protein length is larger than c.width;
    
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    //const canvas_originX_prev = scaleAndOriginX.originX;
    let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
          
    const original_aminoacid_idx = Math.max(Math.ceil(real_xcor/cell_width),1);
    const original_aminoacid = proteinData[original_aminoacid_idx].ref;
    const mutated_aminoacid_idx = Math.min(Math.floor(mouse_ycor/cell_height),19);
    const mutated_aminoacid = aminoacid_ordering[mutated_aminoacid_idx]; // the resulting aminoacid from SNP mutation    

    let mutation_risk_raw_value;
    if ( Object.hasOwn(proteinData[original_aminoacid_idx] , mutated_aminoacid)  ){
      mutation_risk_raw_value = parseFloat(proteinData[original_aminoacid_idx][mutated_aminoacid]);
    }
    else if (proteinData[original_aminoacid_idx].ref === mutated_aminoacid){// if field doesn't exist but is the refernce aminoacid, working as intended no bug, or NaN situation
        mutation_risk_raw_value = tool_parameters.ref_value;
      }
    else{
      mutation_risk_raw_value = "Missing value";
    }      
    const mutation_risk_assessment = calculateRiskAssessment(mutation_risk_raw_value); // handles NaN
    // console.log(mutation_risk_assessment);
    ctx.font = "15px Arial";
    ctx.textBaseline = "top";
    // const text = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + String(mutation_risk_raw_value) + " " + String(mutation_risk_assessment); 
    const position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + String(mutation_risk_raw_value);
    const risk_string =  String(mutation_risk_assessment);
    const strings_max_width = Math.max(ctx.measureText(position_string).width , ctx.measureText(risk_string).width);
    const strings_max_height = Math.max(
    (ctx.measureText(position_string).actualBoundingBoxAscent + ctx.measureText(position_string).actualBoundingBoxDescent ) ,
    (ctx.measureText(risk_string).actualBoundingBoxAscent + ctx.measureText(risk_string).actualBoundingBoxDescent) );

    ctx.fillStyle="black"
    ctx.fillRect(mouse_xcor, mouse_ycor + y_offset - (4 * strings_max_height) -2  , strings_max_width + 10  , strings_max_height * 2 + 10 );

    ctx.fillStyle = "white";
    ctx.textAlign = "center"; 
    ctx.fillText(position_string, mouse_xcor + ((strings_max_width )/2) + 5 , mouse_ycor + y_offset -  (4 * strings_max_height) + 2 )
    ctx.fillStyle = heatmapColors[original_aminoacid_idx -1 ][mutated_aminoacid_idx]; // -1 because of heatmapColors is 0 indexed;
    ctx.fillText(risk_string ,mouse_xcor + ((strings_max_width )/2) + 5 , mouse_ycor + y_offset - (4 * strings_max_height) + strings_max_height + 4 );
    // console.log(ctx.measureText(text).width); // 260; 

    // rect size = text size + 30,
    // text starts from rect_begin + 30/2;
    // console.log("text ending = " + (parseInt(mouse_xcor) + 120 + ctx.measureText(text).width) );      
  }

  const drawTooltipHeatmapSummary = (c,cHeatmap,e,x_offset,y_offset) => { // to be completd
    const tool_parameters = currentPredictionToolParameters;
    // tooltip ref variables
    const ctx = c.getContext("2d");      
    //heatmap ref variables
    const heatmapRect = cHeatmap.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const heatmapRect_width = heatmapRect.width;
    const mouse_xcor = e.clientX - heatmapRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(heatmapRect.width);
    const mouse_ycor = e.clientY - heatmapRect.top;
    const cell_width = (heatmapRect_width/sequence_length); //!! must be same in drawheatmap // if we use floor, it will result in 0 cell width when protein length is larger than c.width;
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    //const canvas_originX_prev = scaleAndOriginX.originX;
    let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
    const original_aminoacid_idx = Math.max(Math.ceil(real_xcor/cell_width),1) // real_xcor 0 to cell_wid = 0th aminoacid; realxcor cell_width to 2*cell_width = 1st aminoacid; // +1 because our scores start from 1;
    const original_aminoacid = proteinData[original_aminoacid_idx].ref;
    const cur_pos_median = calculateMedianOfPosition(original_aminoacid_idx);
    // for every risk assessment, make a list of which aminoacids are deleterious, which of them are benign for that position;
    let risk_assessment_buckets = {};
    for (let i = 0; i < tool_parameters.score_ranges.length; i++) 
    {
      risk_assessment_buckets[tool_parameters.score_ranges[i].risk_assessment] = new Set();
    }
    risk_assessment_buckets["NaN value in data"]= new Set();

    for(let i = 0; i < 20; i++) // for each aminoacid determine their risk assessment;
    {
      let mutation_risk_raw_value;
      const mutated_aminoacid = aminoacid_ordering[i];
      if ( Object.hasOwn(proteinData[original_aminoacid_idx] , mutated_aminoacid)  ){
        mutation_risk_raw_value = parseFloat(proteinData[original_aminoacid_idx][mutated_aminoacid]);
        // if Nan, calculate risk assessment will handle this case;
      }
      else if (proteinData[original_aminoacid_idx].ref === mutated_aminoacid)
      {// if field doesn't exist but is the refernce aminoacid, working as intended no bug, or NaN situation
        mutation_risk_raw_value = tool_parameters.ref_value;
      }
      else{ 
        // Missing field for aminoacid, instead of value being NaN, This bug isn't as obvious, harder to find;
        mutation_risk_raw_value = "NaN value in data";
      }
      const mutation_risk_assessment = calculateRiskAssessment(mutation_risk_raw_value);
      risk_assessment_buckets[mutation_risk_assessment].add(mutated_aminoacid);
    }
    let risk_strings = [];
    let risk_strings_colors = [];
    ctx.font = "15px Arial";
    ctx.textBaseline = "top"; 
    const median_value_string = "Median of values = " + String(cur_pos_median);
    let risk_strings_max_width = ctx.measureText(median_value_string).width;
    let risk_strings_max_height = ctx.measureText(median_value_string).actualBoundingBoxAscent + ctx.measureText(median_value_string).actualBoundingBoxDescent;
    for(let i = 0; i< tool_parameters.score_ranges.length; i++){
      const cur_assessment = tool_parameters.score_ranges[i].risk_assessment;
      const num_of_cur_assessment = risk_assessment_buckets[cur_assessment].size;
      const cur_string = "" + cur_assessment + " : " + String(num_of_cur_assessment);
      risk_strings.push(cur_string);
      const cur_risk_string_color = String(color_lists_array[i][Math.floor(number_of_colors/2)]); 
      risk_strings_colors.push(cur_risk_string_color);
      const cur_string_metrics = ctx.measureText(cur_string);
      const cur_string_width = cur_string_metrics.width;
      const cur_string_height = cur_string_metrics.actualBoundingBoxAscent + cur_string_metrics.actualBoundingBoxDescent;

      if (cur_string_width > risk_strings_max_width){
        risk_strings_max_width = cur_string_width ;
      }
      if (cur_string_height > risk_strings_max_height){
        risk_strings_max_height = cur_string_height;
      }
    }
    risk_strings.push(median_value_string);
    risk_strings_colors.push(heatmapMeanColors[original_aminoacid_idx -1 ]); // because original_aminoacid_idx starts from 1 and heatmapMeancolors start from 0; 
    // risk_strings.push(median_value_string)

    ctx.fillStyle="black"
    ctx.fillRect((mouse_xcor),( mouse_ycor + y_offset - 85) , (risk_strings_max_width + 10) , (risk_strings_max_height * (risk_strings.length + 1) + 10 ) ); // cell_width*40,cell_height*5 250 for sift, 300 for polyphen
    // ctx.fillRect(mouse_xcor + x_offset , mouse_ycor + y_offset ,100 , 100); // cell_width*40,cell_height*5 250 for sift, 300 for polyphen
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    const position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid); 
    ctx.fillText(position_string, mouse_xcor + ((risk_strings_max_width + 10)/2) , mouse_ycor + y_offset -80 )
    for(let i = 0; i < risk_strings.length; i++)
    {
      ctx.fillStyle = risk_strings_colors[i];
      ctx.fillText( risk_strings[i] , (mouse_xcor + ((risk_strings_max_width + 10)/2) ) , mouse_ycor + y_offset - 80 + risk_strings_max_height  + (i * risk_strings_max_height) );
    }
  }

  function drawTooltipOrPan2(e) // scale comes from top_canvas_scale
  { // be careful, cell_height and width must be the same in the draw function, if you change this also change drawheatmap;
    // if clause to check if xcor and ycor is inside the heatmapCanvas coordinates;
    // !!!! DrawToolTip Part of the function; !!!
    // console.log("tooltip start prevX  = " + topCanvasOriginXPrev);
    if (sequence_length === 0 ){
      return;
    }
    const c = tooltipRef.current;
    const ctx = c.getContext("2d");
    const tooltipRect = c.getBoundingClientRect();
    const tooltip_width = tooltipRect.width;// must be the same as in canvas width html element
    const tooltip_height = tooltipRect.height;//must be the same as in canvas height html element
    const ratio = window.devicePixelRatio;
    c.width = tooltip_width * ratio;
    c.height = tooltip_height * ratio;
    c.style.width = "calc(100vw - 20px)"; // will override the value in html, We have overflow-x: hidden in App.css;
    c.style.height = tooltip_height + "px";
    c.style.top = "-80px"; // safari weird bug; canvas blurry text;
    // console.log("width =   "  + c.width);
    ctx.scale(ratio,ratio);
    ctx.clearRect(0,0,tooltip_width,tooltip_height);
    
    
    // const cHeatmap = ctxRef.current; // 
    const cHeatmap = heatmapRef.current;
    // !! get boundaries of the heatmap instead of the tooltip canvas, for the "rect" variable;
    const heatmapRect = cHeatmap.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const heatmapRect_height = heatmapRect.height;
    const heatmapRect_width = heatmapRect.width;
    const cell_height = (heatmapRect_height-70)/20; //!! must be same in drawheatmap // 300/20 = 15 ,  number 20 is same for all 
    const mouse_xcor = e.clientX - heatmapRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(heatmapRect.width);
    const mouse_ycor = e.clientY - heatmapRect.top; // scale doen't affect this, so this is the real_ycoordinate //console.log("hover mouse_ycor = " + mouse_ycor);// console.log(heatmapRect.height-50); // -50 space for position indexes;
    
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    
    // const aminoacid_legend_width = aminoAcidLegendRef.current.getBoundingClientRect().width;
    const x_offset = heatmapRect.left - tooltipRect.left;
    const y_offset = heatmapRect.top - tooltipRect.top;
  

    if (mouse_xcor > heatmapRect_width || mouse_xcor < 0 || mouse_ycor <= 0 || mouse_ycor >= (heatmapRect_height)) 
    { // boundary check for heatmap, -50 is for the space left for position indices
      // bigger or equal to, so that index finders don't go out of bounds, as maxwidth/cell_width = an index 1 bigger than the sequence length
      setIsDown(prev => false);// so that panning point resets when mouse goes out of bounds;
      return
    }
    else if ( mouse_ycor >= (cell_height*22.8) ){ // inside summary part
      drawTooltipHeatmapSummary(c,cHeatmap,e,x_offset,y_offset);
    }
    else if (mouse_ycor < (heatmapRect_height - 70)){ // inside main heatmap
      drawTooltipHeatmapMain(c,cHeatmap,e,x_offset,y_offset);
    }
    
    if (isDown) // panning the canvas if mouse down is down;
    {
      // console.log("isdonwnnnn2");
      const dx_normalized = (panningStartX - mouse_xcor) / canvas_scale; // change in X direction

      let canvas_originX_next = canvas_originX_prev + dx_normalized;
      // console.log("temp_top_canvas_priginX_prev = " + temp_top_canvas_originX_prev);
      // console.log("tooltip panStartX , mouse_xcor , topcanvasscaleprev =  " + panningStartX + " " + mouse_xcor + " " + topCanvasScalePrev);
      // console.log("tooltip originXprev at start of Pan = " + topCanvasOriginXPrev);
      canvas_originX_next = Math.max(canvas_originX_next,0); // origin not smaller than 0
      canvas_originX_next = Math.min(canvas_originX_next, (heatmapRect_width - heatmapRect_width/canvas_scale)); // origin not larger than heatmap rightmost point;
      canvas_originX_next = canvas_originX_next / heatmapRect_width; // QZY
      setScaleAndOriginX(prev => {
        return (  
          {scale: canvas_scale ,originX: canvas_originX_next }
        )
        } );
      setPanningStartX(prev => mouse_xcor); 
    }
    //ctx.resetTransform(); no need
  }
      
  const onMouseDownHelper = (e) =>{
      const c = heatmapRef.current;
      const rect = c.getBoundingClientRect()
      const heatmap_width = rect.width;
      const heatmap_height = rect.height;
      const mouse_xcor = e.clientX - rect.left;
      const mouse_ycor = e.clientY - rect.top;
      //console.log("mouse xcor_point = " +mouse_xcor);
      //console.log("mouse_ycor " + mouse_ycor);
      if (mouse_xcor >= heatmap_width || mouse_xcor < 0 || mouse_ycor > heatmap_height || mouse_ycor <= 0 )  // heatmap boundaries;
      {
        return;
      }
      else // only if mouse points inside correct the heatmap
      {
        setIsDown(true);
        setPanningStartX(prev => mouse_xcor);
      }
  }

  const onMouseUpHelper = (e) => {
      setIsDown(false);
  }

  return (
      <>
          {/* <button onClick={fetchDataTest2}> Fetch all protein data</button>
          <button onClick={fetchDataTest}> Metadata test</button> */}
          {/* current_view_window left = aminoacidlegendwidht + 10px -50px (50 is the buffer for position number drawing)
           10px is the gap property in metadataFeatureTable grid */}
          <div style={{marginBottom:'2rem'}}>  
            <h5 style={{textAlign:'center', marginBottom:'0.25rem', marginTop:'0rem'}}> current visible window: </h5>
            <canvas id="current_view_window" ref={currentviewWindowRef} height={"30"} width={window.innerWidth -  200}
                        style= {{marginLeft:"calc(" + aminoAcidLegendWidth + " - 40px" , width:'calc(100vw - 100px)'}}  > 
            </canvas>
          </div>
          {/* Height of asds must be the same as max(amino_acid_legend,heatmap_canvas) */}
          {/* canvas width width ={window.innerwidth} is only for the initialization, then we change by reassigning the canvas width inside functions */}
          {/* asds is only there because canvas positions are absolute, So it acts as a filler, so that subsequent elements and canvases don't overlap */}
          <div id="asds" style={{ width:"calc(-200px + 100vw)", height:"270px", position:'relative'}}> 
                  <canvas  id="heatmap_canvas" ref={heatmapRef} style = {{position:"absolute",top:"0px", left:"calc("+ aminoAcidLegendWidth +  " + 10px)" , zIndex:1, width:'80vw', height:'270px'}}
                  // onClick={(e) => console.log("asfasfasfasfs")}
                  // onclick or other functions don't work here as the topmost layers is the canvas below
                  >
                  </canvas>
                  
                  <canvas id="amino_acid_legend" ref={aminoAcidLegendRef} style={{position:"absolute",top:"0px", left:"10px",width:aminoAcidLegendWidth, height:'270px',zIndex:1 }}>
                  </canvas>

                  <canvas  id="heatmap_tooltip_canvas" ref={tooltipRef}  style = {{position:"absolute",top:"-80px", left:"0px" , zIndex:50}} height={"350"} width={window.innerWidth - 20 }
                      // onClick = {clickLogger} 
                      // onWheel={wheelZoom} added event listener in UseEffect, because "Unable to preventDefault inside passive event listener invocation."
                      onMouseMove = {(e) => drawTooltipOrPan2(e)}
                      onMouseDown = {(e) => onMouseDownHelper(e)}
                      onMouseUp= {(e) => onMouseUpHelper(e)}
                      onDoubleClick= {(e) => setScaleAndOriginX({scale:1, originX:0})}
                      onMouseLeave= {() => setIsDown(false)} // a bit redundant, but nevertheless here just to make sure;
                      >
                      
                  </canvas>              
          </div>
          
      </>
      
  )



};

export default Heatmap;

