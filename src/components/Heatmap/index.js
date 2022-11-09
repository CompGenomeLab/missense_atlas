
import React, { useCallback, useEffect, useRef, useState } from "react";


const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

// const number_of_colors = 30;
// heatmap offset from config.js

function Heatmap( props ){
    
    const {currentPredictionToolParameters,proteinData,color_lists_array,number_of_colors,sequence_length} = props;
    const heatmapRef = useRef(null); // ref for the heatmap in top
    const aminoAcidLegendRef = useRef(null);
    const tooltipRef = useRef(null); // ref for the tooltip layer on top of the heatmap
    const currentviewWindowRef = useRef(null);
    const [isDown,setIsDown] = useState(false);
    const [panningStartX,setPanningStartX] = useState(0); 
    const [canvasScaleAndOriginX2,setCanvasScaleAndOriginX2] = useState({scale:1,originX:0}) // so that we update both of them at the smae time instead of seperately,;

    const [prevTime, setPrevTime] = useState( () => Date.now() ); // limit number of drawings per second, must have for resizing window
    
    const drawHeatmap2 = useCallback (() => { // scale is given as parameter right now;
        //// be careful, cell_height and width must be the same in the tooltio, if you change this also change tooltip;
        // const c = ctxRef.current;
        // console.log("drawheatmap start originXprev = " + top_canvas_originX_prev);
        // to only draw when new tool data comes = 
        // if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
        //   console.log("curtools len = " + currentPredictionToolParameters.score_ranges.length);
        //   console.log("colorlist ary len =  "+ color_lists_array.length);
        //   return // only draw if these 2 parameters match, or else It will result in runtime error,

        // }
        // if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length)
        //   return // only draw if these 2 parameters match, or else It will result in error,
        const tool_parameters = currentPredictionToolParameters;
        const c = heatmapRef.current;
        const ctx = c.getContext("2d");
        const rect = c.getBoundingClientRect(); //console.log(rect);
        const heatmap_width = rect.width;// must be the same as in canvas width html element
        const heatmap_height = rect.height;//must be the same as in canvas height html element
        const ratio = window.devicePixelRatio;
        c.width = heatmap_width * ratio;
        c.height = heatmap_height * ratio;
        c.style.width = 'calc(100vw - 200px)'; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
        c.style.height = heatmap_height + "px";
        // console.log(canvas_originX);
  
        //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio,ratio);
  
        ctx.imageSmoothingEnabled = false; // doesn't actually do anything as this command is for imported images
        
        // ctx.clearRect(0,0,heatmap_width,heatmap_height); 
        const canvas_originX = canvasScaleAndOriginX2.originX * heatmap_width ; //!!QZY
        const canvas_scale = canvasScaleAndOriginX2.scale;
        ctx.scale(canvas_scale,1); 
        ctx.translate(-canvas_originX,0); 
  
        // console.log("orignx = " + canvas_originX);
        const cell_height = (heatmap_height - 70)/20; //!! must be same in drawtooltip //10, number 20 = aminoacids, also left 70 px space in the bottom;
        const cell_width = (heatmap_width/sequence_length); // !! must be same in draw tooltip !!!! THIS IS THE REASON OF BORDERS BETWEEN SQUARES !!!
        // cell width changes on resize, because heamtap_width also changes;
        for (let i = 0; i<sequence_length; i++) // for every aminoacid
        {
          for( let j = 0 ; j < 20 ; j++ )// for every position
          {// sift value = protein_data_sift[i].data[j].y 
            let current_score;
            if ( Object.hasOwn(proteinData.scores[i+1] , aminoacid_ordering[j]  )  ){
              current_score = proteinData.scores[i+1][aminoacid_ordering[j]];
            }
            else{
              current_score = tool_parameters.ref_value;
            }
            
            let color_index;
            
            let range_start;
            let range_end;
            let range_size;
            let color_lists_index;
            for (let k = 0; k< tool_parameters.score_ranges.length; k++){
              const current_loop_range_start = tool_parameters.score_ranges[k].start;
              const current_loop_range_end = tool_parameters.score_ranges[k].end;
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
            ctx.fillStyle = String(color_lists_array[color_lists_index][color_index]); // IMPORTANT this will be a generic color_lists array that will be generated based on the selected parameters;          
            // to map values between 0-1 to 10 values that are in my color_list
            // ctx.fillStyle = '#bfdf83';
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
        const num_visible = sequence_length/canvas_scale;
        const browser_resize_ratio = (window.innerWidth/window.screen.availWidth); // so that numbers don't get jumbled up
        // the constant 20 in step_size calculation will be included in config.js
        const step_size = Math.max(Math.floor(num_visible/ ( 20  *  browser_resize_ratio )),1); // so that step_size isn't smaller than 1; // if stepsize becomes 0 I get infinite loop;
        for (let i = 0; i< sequence_length; i+= step_size) 
        {
          // let number_text = String(i+1);
          ctx.fillText(String(i+1),cell_width * (i+0.5) * canvas_scale,cell_height*22);
        }
        ctx.scale(canvas_scale,1); // canvas scale returned back to state before we wrote positions;
  
        // draw position median values below;
        // !!! IMPORTANT, instead of this take the average of colors in all 20 slots 
        for ( let i = 0; i< sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
        { // because in sift 0 to 0.05 is benign, not all ranges are equal; 
          // trying the median value now,;
          // let cur_pos_mean = 0;
          let cur_pos_array = [];
          for (let j = 0; j<20; j++)
          {
              let current_score;
              if ( Object.hasOwn(proteinData.scores[i+1] , aminoacid_ordering[j]  )  ){
                current_score = proteinData.scores[i+1][aminoacid_ordering[j]];
              }
              else{
                current_score = tool_parameters.ref_value;
              }
              // const current_score = proteinData.scores[i+1][aminoacid_ordering[j]] || tool_parameters.ref_value;
              // cur_pos_mean += (current_score)/20;
              cur_pos_array.push(current_score);
          }
          // median calculation
          cur_pos_array.sort( (a,b) => a-b )
          const cur_pos_median = (cur_pos_array[9] + cur_pos_array[10]) / 2 ; // position has 20 elements, average of 9 and 10 is median
  
          let color_index;
            
          let range_start;
          let range_end;
          let range_size;
          let color_lists_index;  
          for (let k = 0; k< tool_parameters.score_ranges.length; k++){
              const current_loop_range_start = tool_parameters.score_ranges[k].start;
              const current_loop_range_end = tool_parameters.score_ranges[k].end;
              if(cur_pos_median >= current_loop_range_start && cur_pos_median <=current_loop_range_end ){
                // is between current ranges
                range_start = current_loop_range_start;
                range_end = current_loop_range_end;
                range_size = range_end - range_start
                color_lists_index = k;
              } 
            }
            color_index = Math.min( Math.floor((cur_pos_median - range_start) * (1/ range_size) * number_of_colors ) ,number_of_colors -1  ) 
            ctx.fillStyle = String(color_lists_array[color_lists_index][color_index]);
          // 30 is number of colors // 29 = number of colors in range -1
           
          ctx.fillRect(i * cell_width ,22.8 * cell_height ,cell_width ,cell_height* 4.2 )
          
        } 
          
    },[canvasScaleAndOriginX2.originX,canvasScaleAndOriginX2.scale,proteinData.scores,sequence_length,number_of_colors,color_lists_array,currentPredictionToolParameters] );
      
  const drawCurrentViewWindow = useCallback ( () => {
    const c = currentviewWindowRef.current;
    const ctx = c.getContext("2d");
    const current_view_window_rect = c.getBoundingClientRect();
    
    const w = current_view_window_rect.width; 
    const h = current_view_window_rect.height;
    
    const ratio = window.devicePixelRatio;
    c.width = w * ratio;
    c.height = h * ratio;
    // c.style.width = w + "px";
    c.style.width = 'calc(100vw - 200px)';
    c.style.height = h + "px";
    ctx.scale(ratio,ratio);

    const heatmapRect_width =  w; // actually the same as current_view_window_rect.width

    // fillrect params = (x: number, y: number, w: number, h: number): void
    // draw similar to position averages, but change alpha value,;
    // copied form drawheatmap2
    const tool_parameters = currentPredictionToolParameters;
    const cell_width = (heatmapRect_width/sequence_length)
    const canvas_originX = canvasScaleAndOriginX2.originX * heatmapRect_width; //!!QZY
    const canvas_scale = canvasScaleAndOriginX2.scale;
    for ( let i = 0; i< sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
    { // because in sift 0 to 0.05 is benign, not all ranges are equal; 
          // trying the median value now,;
          // let cur_pos_mean = 0;
          let cur_pos_array = [];
          for (let j = 0; j<20; j++)
          {
              let current_score;
              if ( Object.hasOwn(proteinData.scores[i+1] , aminoacid_ordering[j]  )  ){
                current_score = proteinData.scores[i+1][aminoacid_ordering[j]];
              }
              else{
                current_score = tool_parameters.ref_value;
              }
              // const current_score = proteinData.scores[i+1][aminoacid_ordering[j]] || tool_parameters.ref_value;
              // cur_pos_mean += (current_score)/20;
              cur_pos_array.push(current_score);
          }
          // median calculation
          cur_pos_array.sort( (a,b) => a-b )
          const cur_pos_median = (cur_pos_array[9] + cur_pos_array[10]) / 2 ; // position has 20 elements, average of 9 and 10 is median
  
          let color_index;
          let range_start;
          let range_end;
          let range_size;
          let color_lists_index;  
          for (let k = 0; k< tool_parameters.score_ranges.length; k++){
            const current_loop_range_start = tool_parameters.score_ranges[k].start;
            const current_loop_range_end = tool_parameters.score_ranges[k].end;
            if(cur_pos_median >= current_loop_range_start && cur_pos_median <=current_loop_range_end ){
              // is between current ranges
              range_start = current_loop_range_start;
              range_end = current_loop_range_end;
              range_size = range_end - range_start
              color_lists_index = k;
            } 
          }
          color_index = Math.min( Math.floor((cur_pos_median - range_start) * (1/ range_size) * number_of_colors ) ,number_of_colors -1  ) 
        // 30 is number of colors // 29 = number of colors in range -1
          if (i*cell_width >= canvas_originX && (i*cell_width <= (canvas_originX + heatmapRect_width/canvas_scale) ) ){ // currently viewing
            // left = origin, right = origin + current view size = width/scale;
            ctx.fillStyle = String(color_lists_array[color_lists_index][color_index]);
            ctx.fillRect(i * cell_width , h/2 , cell_width ,h/2 )
          }
          else{
            ctx.fillStyle = String(color_lists_array[color_lists_index][color_index]) + "30"; // last value is opacity
            ctx.fillRect(i * cell_width , h/2 , cell_width ,h/2 )
          }

    } 

      

    // ctx.fillStyle = 'silver';
    // ctx.fillRect(0,h/2,heatmapRect_width,h/2); // 1200 = width of heatmap
    
    // ctx.fillStyle = 'hotpink';
    // ctx.fillRect(canvas_originX,h/2 , heatmapRect_width/canvas_scale , h/2)  // 1200 = width of the heatmap
    
  


    // drawing indices;
    const leftmost_visible_index = String ( Math.floor((canvas_originX/heatmapRect_width * sequence_length) +1 ));
    const rightmost_visible_index = String(Math.floor((canvas_originX/heatmapRect_width * sequence_length) + (sequence_length/canvas_scale)));  
    ctx.fillStyle = 'hotpink';
    ctx.textBaseline = 'top';
    ctx.font = '12px Arial';
    if (((canvas_originX/heatmapRect_width * sequence_length) +1 ) > 10){ // if left most index is smaller than 20, textAlign to right;
        ctx.textAlign = 'right';
    }
    else{
        ctx.textAlign = 'left';
    }
    ctx.fillText( leftmost_visible_index , canvas_originX,  0 , 50) // leftmost visible of the window;
    ctx.textAlign = 'right';
                
    ctx.fillText(rightmost_visible_index, canvas_originX  + heatmapRect_width/canvas_scale , 0 , 50   );  // rightmost visilbe of the window
  },[canvasScaleAndOriginX2.originX,canvasScaleAndOriginX2.scale,color_lists_array,currentPredictionToolParameters,number_of_colors,proteinData.scores,sequence_length]);

    const wheelZoom2 =  useCallback ((e,canvas_scale_and_originX) => {  // zoomig function

    const c = heatmapRef.current;
    const rect = c.getBoundingClientRect()
    const heatmap_width = rect.width;
    const mouse_xcor = e.clientX - rect.left;
    const mouse_ycor = e.clientY - rect.top;

    setIsDown(prev => false); // just to make sure, we are not panning while zooming
    
    if (mouse_xcor > heatmap_width || mouse_xcor < 0 || mouse_ycor > 200 || mouse_ycor < 0 )  // heatmap boundaries;
    {
        return;
    }
    e.preventDefault(); // so that it doesn't scroll while zooming
        // to limit the canvas re renderings to roughly 30 fps
        const cur_time = Date.now();
        // console.log(cur_time - prevTime);
        if (cur_time - prevTime < 50) // to limit fps;
        {
            return;
        }

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
    canvas_scale_next = Math.min(Math.max(1, canvas_scale_next), 64);
    const scalechange = canvas_scale_next / canvas_scale_prev; // 

    let real_xcor = canvas_originX_prev + (mouse_xcor/canvas_scale_prev); // real x coordinate of the mouse pointer, this line is reused in tooltip function
        // real coordinate of current mouse point;
    // console.log("mouse_xcor in drawheatmap " + mouse_xcor);
    // console.log("real Xcord = " + real_xcor);
    // console.log("realxcor = + " + real_xcor + " scalechange = " + scalechange + " canvas_originX_prev =  " + canvas_originX_prev);
    let canvas_originX_next = Math.max( (real_xcor - ((real_xcor - canvas_originX_prev)/scalechange)), 0); // so that it doesn't become smaller than 0
    canvas_originX_next = Math.min(canvas_originX_next,(heatmap_width - heatmap_width/canvas_scale_next)) // so that heatmap new originX isn't too large, (start and end is constant)
    canvas_originX_next = canvas_originX_next/heatmap_width // !!QZY
    
    setCanvasScaleAndOriginX2( {scale:canvas_scale_next, originX: canvas_originX_next} );
    setPrevTime(cur_time); // moved this to here;
    // console.log("setted time");
    // console.log(canvas_scale_prev);


    },[prevTime]);

    useEffect(()=>{
        if (heatmapRef && heatmapRef.current &&  sequence_length > 0) // Object.keys(proteinData).length !== 0 &&
        { 
            drawHeatmap2();
            drawAminoAcidLegend();
            drawCurrentViewWindow();
        } 
        
        // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom(e,topCanvasScalePrevRef)); // to cancel scrolling while on heatmap
        const zoomListener = (e) => wheelZoom2(e,canvasScaleAndOriginX2);
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
      },[canvasScaleAndOriginX2, sequence_length,drawHeatmap2,drawCurrentViewWindow,wheelZoom2]);
    
    useEffect(() => { // redraw on resize
        const handleResize = () => { // reset canvasScaleOrigin reference and draw in roughly 30 fps
            // console.log("handleresize");
            const cur_time = Date.now();
            if (cur_time - prevTime < 32) // 1000/40 = 25 fps
            {
            return;
            }
            
            // giving canvas scale a new reference so that drawing heatmap runs once again;
            setCanvasScaleAndOriginX2( prev => { return( {scale: prev.scale , originX: prev.originX } ) } )
            // drawHeatmap2(); // causes flickering , no idea why; instead I need to use setCanvasScaleAndOrigin and setPrevtime
            setPrevTime(prev => cur_time); // if removed, flickering will happen, no idea why?? May not be the case anymore
        }
        window.addEventListener("resize" , handleResize )

        return () => {window.removeEventListener("resize" , handleResize)}; // cleanup

    },[prevTime]) // draw heatmap again on resize //drawHeatmap2
    
    const drawAminoAcidLegend  = () => {  // will only run once on startup of useEffect
        const c = aminoAcidLegendRef.current;
        const ctx = c.getContext("2d");
        const legend_rect = c.getBoundingClientRect();
        const w = legend_rect.width;
        const h = legend_rect.height;
        const ratio = window.devicePixelRatio;
        c.width = w * ratio;
        c.height = h * ratio;
        c.style.width = w + "px";
        c.style.height = h + "px";
        ctx.scale(ratio,ratio);
        
        //{'A': 0, 'R': 1, 'N': 2, 'D': 3, 'C': 4, 'Q': 5, 'E': 6, 'G': 7, 'H': 8, 'I': 9, 'L': 10, 'K': 11, 'M': 12, 'F': 13, 'P': 14, 'S': 15, 'T': 16, 'W': 17, 'Y': 18, 'V': 19}    
        const cHeatmap = heatmapRef.current;
        const heatmapRect = cHeatmap.getBoundingClientRect();
        const cell_height = (heatmapRect.height - 70)/20; //!! must be same in drawtooltip and drwaheatmap //10, number 20 = aminoacids, also left 50 px space in the bottom;
        ctx.font = "12px Arial Narrow";
        
        ctx.lineWidth = 1;
        
        for (let i = 0; i<20; i++)
        {
            ctx.fillText(aminoacid_ordering[i] , 90 , (cell_height * (i+1)) );
            ctx.beginPath();       // Start a new path
            ctx.moveTo(105, cell_height * (i+0.5));    // Move the pen to (30, 50)
            ctx.lineTo(115, cell_height * (i+0.5));  // Draw a line to (150, 100)
            ctx.stroke();          // Render the path
        }

        ctx.fillText("Position" , 70 , cell_height*(24.5) );
        ctx.fillText("average" , 70 , cell_height* (26) );
        ctx.beginPath();
        ctx.moveTo(105,  cell_height * (25));
        ctx.lineTo(115, cell_height * (25));
        ctx.stroke();
        // ctx.fillText("Position average",20,(cell_height*(25+1)));
        // ctx.beginPath();
        // ctx.moveTo(105,  cell_height * (25+0.5) );
        // ctx.lineTo(115,  cell_height *  (25+0.5) );
        // ctx.stroke();
  
    } ;
    
    function drawTooltipOrPan2(e) // scale comes from top_canvas_scale
    { // be careful, cell_height and width must be the same in the draw function, if you change this also change drawheatmap;
      // if clause to check if xcor and ycor is inside the heatmapCanvas coordinates;
      // !!!! DrawToolTip Part of the function; !!!
      // console.log("tooltip start prevX  = " + topCanvasOriginXPrev);
      const tool_parameters =  currentPredictionToolParameters;
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
      c.style.width = "calc(100vw)";
      c.style.height = tooltip_height + "px";
      // console.log("width =   "  + c.width);
      ctx.scale(ratio,ratio);
      ctx.clearRect(0,0,tooltip_width,tooltip_height);
     
      
      // const cHeatmap = ctxRef.current; // 
      const cHeatmap = heatmapRef.current;
      // !! get boundaries of the heatmap instead of the tooltip canvas, for the "rect" variable;
      const heatmapRect = cHeatmap.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
      const heatmapRect_height = heatmapRect.height;
      const heatmapRect_width = heatmapRect.width;
      const mouse_xcor = e.clientX - heatmapRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(heatmapRect.width);
      const mouse_ycor = e.clientY - heatmapRect.top; // scale doen't affect this, so this is the real_ycoordinate //console.log("hover mouse_ycor = " + mouse_ycor);// console.log(heatmapRect.height-50); // -50 space for position indexes;
      
      if (mouse_xcor >= heatmapRect_width || mouse_xcor <= 0 || mouse_ycor <= 0 || mouse_ycor >= (heatmapRect_height - 70)) 
      { // boundary check for heatmap, -50 is for the space left for position indices
        // bigger or equal to, so that index finders don't go out of bounds, as maxwidth/cell_width = an index 1 bigger than the sequence length
        setIsDown(prev => false);// so that panning point resets when mouse goes out of bounds;
        return
      }
      
      const cell_height = (heatmapRect_height-70)/20; //!! must be same in drawheatmap // 300/20 = 15 ,  number 20 is same for all 
      const cell_width = (heatmapRect_width/sequence_length); //!! must be same in drawheatmap // if we use floor, it will result in 0 cell width when protein length is larger than c.width;
      // const xcor = e.clientX;
      // const ycor = e.clientY;

      // using real_xcor to calculate which aminoacid the current pointed cell corresponds to
      const canvas_scale = canvasScaleAndOriginX2.scale; // value of zoom before scroll event
      const canvas_originX_prev = canvasScaleAndOriginX2.originX * heatmapRect_width; // QZY
      //const canvas_originX_prev = canvasScaleAndOriginX2.originX;
      let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
      // console.log(canvas_originX_prev);
      // real_xcor = topCanvasOriginXPrev + (mouse_xcor/topCanvasScalePrev); 


      // got the context;    // console.log(e);
      
      const original_aminoacid_idx = Math.floor(real_xcor/cell_width) + 1 // real_xcor 0 to cell_wid = 0th aminoacid; realxcor cell_width to 2*cell_width = 1st aminoacid; // +1 because our scores start from 1;
      const original_aminoacid = proteinData.scores[original_aminoacid_idx].ref;
      const mutated_aminoacid_idx = Math.floor(mouse_ycor/cell_height);
      const mutated_aminoacid = aminoacid_ordering[mutated_aminoacid_idx]; // the resulting aminoacid from SNP mutation
      // console.log("original_aminoacid = " + original_aminoacid);
      // console.log("mutated_aminoacid = " + mutated_aminoacid);
      
      

      // !!! IMPORTANT HAVE TO THINK ABOUT WHAT TO DO WHEN COMBINING MULTIPLE TOOLS VALUES !!!
      let mutation_risk_raw_value;
      if ( Object.hasOwn(proteinData.scores[original_aminoacid_idx] , mutated_aminoacid)  ){
        mutation_risk_raw_value = proteinData.scores[original_aminoacid_idx][mutated_aminoacid];
      }
      else{
        mutation_risk_raw_value = tool_parameters.ref_value;
      }
        //console.log("mutation risk_raw_value = " + mutation_risk_raw_value);
      
      let mutation_risk_assesment // 'Neutral';  // change based on mutation_risk_raw value;
        // score_ranges:[ {start:0.00, end:0.15, risk_assessment : ' benign' , start_color:"2C663C", end_color:"D3D3D3" } , 
        //            {start:0.15, end:0.85, risk_assessment :'possibly damaging',start_color:"D3D3D3", end_color:"FFA500" }, 
        //            {start:0.85, end: 1.00, risk_assessment:'confidently damaging',start_color:"FFA500", end_color:"981E2A" }, ]
        for (let i = 0; i< tool_parameters.score_ranges.length; i++){
          const current_loop_range_start = tool_parameters.score_ranges[i].start;
          const current_loop_range_end = tool_parameters.score_ranges[i].end;
          const current_loop_range_risk_assessment = tool_parameters.score_ranges[i].risk_assessment;
          if(mutation_risk_raw_value >= current_loop_range_start && mutation_risk_raw_value <= current_loop_range_end ){
            // is between current ranges
            mutation_risk_assesment = current_loop_range_risk_assessment;
          } 
        }
      
      // String(original_aminoacid_idx) + ". " +
      const text = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + String(mutation_risk_raw_value) + " " + String(mutation_risk_assesment); 

      
      ctx.fillStyle="black"
      //ctx.fillRect(x,y,w,h);  // rect.left = 0 for now, rect.top = the offset of canvas element;
      ctx.fillRect(mouse_xcor + 100 , mouse_ycor + 10  , 300,31 ); // cell_width*40,cell_height*5 250 for sift, 300 for polyphen2
      // console.log("mouse_xcor = " + mouse_xcor);
      // console.log("mouse_ycor = " + mouse_ycor);

      // var text = "A to G 0.52 Neutral";
      ctx.fillStyle = "white";
      ctx.font = "15px Arial";
      ctx.fillText(text, (mouse_xcor + 120) , mouse_ycor + 30 );
      // console.log("text width = + " );
      // console.log(ctx.measureText(text));
      // console.log("text ending = " + (parseInt(mouse_xcor) + 120 + ctx.measureText(text).width) );
      // ctx.resetTransform();
      
      if (isDown) // panning the canvas if mouse down is down;
      {
        console.log("isdonwnnnn2");
        const dx_normalized = (panningStartX - mouse_xcor) / canvas_scale; // change in X direction

        let canvas_originX_next = canvas_originX_prev + dx_normalized;
        // console.log("temp_top_canvas_priginX_prev = " + temp_top_canvas_originX_prev);
        // console.log("tooltip panStartX , mouse_xcor , topcanvasscaleprev =  " + panningStartX + " " + mouse_xcor + " " + topCanvasScalePrev);
        // console.log("tooltip originXprev at start of Pan = " + topCanvasOriginXPrev);
        canvas_originX_next = Math.max(canvas_originX_next,0); // origin not smaller than 0
        canvas_originX_next = Math.min(canvas_originX_next, (heatmapRect_width - heatmapRect_width/canvas_scale)); // origin not larger than heatmap rightmost point;
        canvas_originX_next = canvas_originX_next / heatmapRect_width; // QZY
        setCanvasScaleAndOriginX2(prev => {
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
        const mouse_xcor = e.clientX - rect.left;
        const mouse_ycor = e.clientY - rect.top;
        //console.log("mouse xcor_point = " +mouse_xcor);
        //console.log("mouse_ycor " + mouse_ycor);
        console.log(heatmap_width);
        if (mouse_xcor >= heatmap_width || mouse_xcor <= 0 || mouse_ycor >= 200 || mouse_ycor <= 0 )  // heatmap boundaries;
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
            <div id="asds" style={{ width:1400, height:300 , position: "relative"}}> 
                    <canvas  id="heatmap_canvas" ref={heatmapRef} style = {{position:"absolute",top:"40px", left:"120px"}} height={"270"} width={window.innerWidth - 200} 
                    // onClick={(e) => console.log("asfasfasfasfs")}
                    // onclick or other functions don't work here as the topmost layers is the canvas below
                    >
                    </canvas>
                    
                    <canvas ref={aminoAcidLegendRef} style={{position:"absolute",top:"40px", left:"0px"}} height = {"300"} width={"120"}>
                    </canvas>

                    <canvas  id="heatmap_tooltip_canvas" ref={tooltipRef}  style = {{position:"absolute",top:"0", left:"120"}} height={"350"} width={window.innerWidth}
                        // onClick = {clickLogger} 
                        // onWheel={wheelZoom} added event listener in UseEffect, because "Unable to preventDefault inside passive event listener invocation."
                        onMouseMove = {(e) => drawTooltipOrPan2(e)}
                        onMouseDown = {(e) => onMouseDownHelper(e)}
                        onMouseUp= {(e) => onMouseUpHelper(e)}
                        onDoubleClick= {(e) => setCanvasScaleAndOriginX2({scale:1, originX:0})}>
                    </canvas>
                            
            </div>
            <h5 style={{textAlign:'center', marginBottom:'2px'}}> current visible window: </h5>
            <canvas id="current_view_window" ref={currentviewWindowRef} height={"30"} width={window.innerWidth -  200}
                        style= {{marginLeft:'120px'}}  > 
            </canvas>
        </>
        
    )



};

export default Heatmap;