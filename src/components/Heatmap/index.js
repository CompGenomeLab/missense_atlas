
import React, { useCallback, useEffect, useRef, useState,useMemo } from "react";

//  22.8 is the magic number for starting position of the heatmap summary, it starts at cell_height * 22.8;
import {
  max_zoom_visible_aa_count,
  aminoacid_ordering,
  aa_visible_width_ratio,
  aminoAcidLegendWidth,
  heatmapCellHeight,
  heatmapTotalNumRows,
  heatmapSpaceBtwnSummaryNumRows,
  heatmapSummaryNumRows,
  currentViewWindowNumRows,
  aa_position_notches_threshold,
  heatmapAminoAcidCharactersNumRows,
  all_prediction_tools_array,
  tools_negative_synonyms,
  heatmapTooltipFontMultiplier,
  // tools_positive_synonyms
} from "../../config/config";
// const aminoAcidLegendWidth = 120;
// const number_of_colors = 30;
// heatmap offset from config.js
// yukleme ekranı
function Heatmap( props ){
  const {currentPredictionToolParameters,proteinData,color_lists_array,number_of_colors, scaleAndOriginX, setScaleAndOriginX } = props;
    // maybe looping over the whole proteinData makes a differnece but probably not much
    // used use memo to not define a function and call it in the next line, because it is easier to read;
    // immediately invoked function expresssions can be used too, but there is no harm in useMemo I think

  const available_tools_list = useMemo( () => {
    if(currentPredictionToolParameters.toolname_json === 'AggregatorLocal'){
      return all_prediction_tools_array.filter( tool => Object.hasOwn(proteinData, tool.toolname_json) );
    }
    return [currentPredictionToolParameters];
  },[currentPredictionToolParameters,proteinData] )

  const sequence_length = useMemo ( () => { // calculate sequence length based on the return value of the api
    /// aggregator additionnal code
    let sequence;
    if (currentPredictionToolParameters.toolname_json === 'AggregatorLocal'){
      const first_tool_name = available_tools_list[0].toolname_json;
      sequence = proteinData[first_tool_name];
    }
    else{
      sequence = proteinData;
    }
    // aggregator code ends;
    let i = 1;
    while( Object.hasOwn (sequence, i)  )
    {
      i += 1;
    }
    return i - 1 ;
  }, [proteinData,currentPredictionToolParameters.toolname_json,available_tools_list] )
  const heatmapRef = useRef(null); // ref for the heatmap in top
  const positionsRef = useRef(null); // for showing heatmap indices between the heatmap's 20 aminoacids and heatmap summary

  const aminoAcidLegendRef = useRef(null);

  const currentViewWindowRef = useRef(null);
  // const [panningStartX,setPanningStartX] = useState(0); 
  // const [scaleAndOriginX,setScaleAndOriginX] = useState({scale:1,originX:0}); // so that we update both of them at the smae time instead of seperately,;

  const [prevTime, setPrevTime] = useState( () => Date.now() ); // limit number of drawings per second, must have for resizing window

  const [tooltip, setTooltip] = useState({status:'invisible',pageX:100, pageY:300, lines:[{color:'white',text:'a'},{color:'white',text:'b'},]});
  // handles NaN
  // i starts from 1
  // returns string representation with 3 decimal places.
  const calculateMedianOfPosition = (i,input_protein_data,tool_parameters) => {
    let cur_pos_array = [];
    let ref_flag = true;
    for (let j = 0; j<20; j++) // for each aminoacid
    {
        let current_score = "Missing";
        if (Object.hasOwn(input_protein_data[i] , aminoacid_ordering[j]  )  ){
          current_score = parseFloat(input_protein_data[i][aminoacid_ordering[j]]);
          if(isNaN(current_score) ){ // typeof(current_score) !== 'number'
            // NaN value reached Nan nan
            return "There is a NaN value"; // used in heatmap median colors
          }
        }
        else if (ref_flag){ // NEED TO ACCOUNT FOR MISSING VALUES !!!!
          current_score = tool_parameters.ref_value;
          ref_flag = false;
        }
        if (current_score !== "Missing"){
          cur_pos_array.push(current_score);
        }
    }
    // median calculation
    cur_pos_array.sort( (a,b) => a-b ) // ascending order;
    
    let cur_pos_median // changed to 10, because 0th is the reference,
    // if 0 is benign, then first index is reference, so elements from indices 1 to 19 are considered
    if (cur_pos_array.length !== 20){
      cur_pos_median = "There are missing values";
    }
    else if (tool_parameters.ref_value === 0){// biger or equal to, for the case of all tools prediction;
      cur_pos_median = cur_pos_array[10].toFixed(3);  // elements are numbers, won't ever be strings;
    }
    else{ // 1 is benign, so final element isn't considered in median calculation, 
      cur_pos_median = cur_pos_array[9].toFixed(3); 
    } // this will also work in the special case of visualizing all of the tools;
    return cur_pos_median;
  }

  // handles NaN;
  const calculateRiskAssessment = (mutation_risk_raw_value, tool_parameters) => {

    if (mutation_risk_raw_value === "Missing Value"){
      return "Missing Value";
    }
    if (isNaN(mutation_risk_raw_value)){ // typeof(mutation_risk_raw_value) !== 'number'
      //NaN
      return "NaN value in data";
    }
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

  // hard to read, but not broken;

  const helperGetPositionScore = useCallback( (i,j,input_protein_data) => {
    let current_score;
    // everything is normal;
    if (Object.hasOwn(input_protein_data[i+1] , aminoacid_ordering[j]  )  ){
      current_score = parseFloat(input_protein_data[i+1][aminoacid_ordering[j]]);
      if (isNaN(current_score))
      {
        // temp_heatmapColorsMatrix[i][j] = "#add8e6";
        return "NaN";
      }
    }
    else if (aminoacid_ordering[j] === input_protein_data[i+1]?.ref){
      // doesn't exist because it is the ref, everything going normal
      current_score = currentPredictionToolParameters.ref_value;
    }
    else{
     
      return "Missing Value";
    }    
    return current_score;
  },[currentPredictionToolParameters.ref_value]);


  const helperGetPositionAggregateScore = useCallback( (i,j) => {
    let negative_count = 0;
    let negative_predicting_tools_array = [];
    for (let k = 0; k < available_tools_list.length; k++){
      const cur_tool = available_tools_list[k];
      const cur_score = helperGetPositionScore(i,j,proteinData[cur_tool.toolname_json]);
      const cur_risk_assessment = calculateRiskAssessment(cur_score,cur_tool);
      if ( tools_negative_synonyms.includes(cur_risk_assessment)  ){
        negative_count += 1;
        negative_predicting_tools_array.push(cur_tool.toolname);
      }      
    }
    return {score: negative_count , pred_tools: negative_predicting_tools_array};
  },[available_tools_list,helperGetPositionScore,proteinData]);

  const heatmapColors = useMemo( () => {
    console.log("colors");
    if (currentPredictionToolParameters.score_ranges?.length !== color_lists_array.length){
      return
    }
    // 2 helper functio
   

    // 2d array; row count = sequence_length cols = 20, as we are looping the same way in drawheatmap etc.
    let temp_heatmapColorsMatrix = Array(sequence_length).fill().map(entry => Array(2).fill(-1)) 
    for(let i = 0; i< sequence_length; i++){
      for (let j = 0; j <20; j++) // aminoacid_ordering
      {
        let current_score;
        if (currentPredictionToolParameters.toolname_json === 'AggregatorLocal'){
          current_score = helperGetPositionAggregateScore(i,j).score;
        }
        else{
          current_score = helperGetPositionScore(i,j,proteinData);
        }
        if (isNaN(current_score)){
          temp_heatmapColorsMatrix[i][j] = '#add8e6'
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
  },[color_lists_array,proteinData,currentPredictionToolParameters,number_of_colors,sequence_length,helperGetPositionAggregateScore,helperGetPositionScore])

  const heatmapMeanColors = useMemo( () => {
    console.log("meancolors");
    if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
      return
    }
    let temp_heatmapMeanColors = Array(sequence_length).fill(-1);
    for ( let i = 0; i < sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
    {
      let cur_pos_median;
      if (currentPredictionToolParameters.toolname_json !== 'AggregatorLocal'){
        // parseFloat because calculateMedianOfPosition returns a string representation actually
        cur_pos_median = parseFloat(calculateMedianOfPosition(i+1,proteinData,currentPredictionToolParameters)); // i+1, because proteinData.scores' index starts from 1;
      }
      else{
        let negative_count = 0;
        for (let k = 0; k< available_tools_list.length; k++){
          const cur_tool = available_tools_list[k];
          const cur_tool_median = calculateMedianOfPosition(i+1,proteinData[cur_tool.toolname_json],cur_tool);
          const cur_assessment = calculateRiskAssessment(cur_tool_median,cur_tool);
          if (tools_negative_synonyms.includes(cur_assessment)){
            negative_count += 1;
          }
        }
        cur_pos_median = negative_count;
      }
      if (isNaN(cur_pos_median)){ // NaN value checking, it will be NaN if something went wrong (missing values or NaN values)
        temp_heatmapMeanColors[i] = "#add8e6";
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

  },[color_lists_array,currentPredictionToolParameters,number_of_colors,sequence_length,available_tools_list,proteinData] )
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
      // c.style.width = '80vw' ; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
      const rect = c.getBoundingClientRect(); //console.log(rect);
      const heatmap_width = rect.width;// must be the same as in canvas width html element
      const heatmap_height = rect.height;//must be the same as in canvas height html element
      const ratio = window.devicePixelRatio;
      c.width = heatmap_width * ratio;
      c.height = heatmap_height * ratio;
      // console.log(heatmap_width);
      // Probably not but calc syntax should be correct 100vw-200px wont work 
      // c.style.height = heatmap_height + "px"; // will change !!!
      // console.log(canvas_originX);

      //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio,ratio); 
      ctx.clearRect(0,0,heatmap_width,heatmap_height); // actually not needed because of c.width = heatmap_width lines
      ctx.imageSmoothingEnabled = false; // doesn't actually do anything as this command is for imported images

      // ctx.clearRect(0,0,heatmap_width,heatmap_height); 
      const canvas_originX = scaleAndOriginX.originX * heatmap_width ; //!!QZY
      const canvas_scale = scaleAndOriginX.scale;
      ctx.scale(canvas_scale,1); 
      ctx.translate(-canvas_originX,0); 
      // console.log("orignx = " + canvas_originX);
      const cell_height = heatmap_height / heatmapTotalNumRows; //!! must be same in drawtooltip //10, number 20 = aminoacids, also left 70 px space in the bottom;
      const cell_width = (heatmap_width/sequence_length); // sequence_length can not be 0
      // !! must be same in draw tooltip !!!! THIS IS THE REASON OF BORDERS BETWEEN SQUARES !!!
      // cell width changes on resize, because heamtap_width also changes;

      // copied from currentviewWindow, minus 10 just to make sure, and no +1, because this won't be shown, only used as index of the array
      const leftmost_visible_index = Math.max(Math.floor((canvas_originX/heatmap_width * sequence_length) -10 ), 0); 
      const rightmost_visible_index = Math.min(Math.floor( (canvas_originX/heatmap_width * sequence_length) + (sequence_length/canvas_scale) + 10) , sequence_length );   // + 10 just to make sure
      // math.min and max so that index doesn't go out of bounds
      // drawing the colored rectangles
      for (let i = leftmost_visible_index; i< rightmost_visible_index; i++)// for every aminoacid
      {
        // if (i*cell_width >= canvas_originX && (i*cell_width <= (canvas_originX + heatmap_width/canvas_scale) ) ){ // currently viewing
          for( let j = 0 ; j < 20 ; j++ )// for every position
          {// sift value = protein_data_sift[i].data[j].y  //
            ctx.fillStyle = heatmapColors[i][j];
            ctx.fillRect(i * cell_width ,j * cell_height ,cell_width + 1  ,cell_height + 1  )
          }
          // drawing the grid
      } 
      // drawing the grid
      // horizontal lines always drawn
      ctx.fillStyle = "white"
      for( let j = 1 ; j < 20 ; j++ )// for every position
      {// sift value = protein_data_sift[i].data[j].y  //
        ctx.fillRect(0,j * cell_height,heatmap_width,1/ratio);
      }
      // vertical lines drawn only when visible number of aminoacids are small
      if ( (rightmost_visible_index - leftmost_visible_index) < 400){
        for (let i = leftmost_visible_index; i< rightmost_visible_index; i++)// for every aminoacid
        {        
          ctx.fillRect(i * cell_width - (0 / (canvas_scale * ratio)) , 0, 1/(ratio * canvas_scale) , 20 * cell_height );
        } 
      }
      // grid horizontal lines
     
      // fill position median values below;
      for ( let i = leftmost_visible_index; i< rightmost_visible_index; i++) // alternative is to count greens/yellows, or take the average of their colors
      {
        ctx.fillStyle = heatmapMeanColors[i];
        ctx.fillRect(i * cell_width ,(20 + heatmapSpaceBtwnSummaryNumRows )  * cell_height ,cell_width , (cell_height* heatmapSummaryNumRows) );
      } 
      ctx.font = String(window.innerHeight * heatmapAminoAcidCharactersNumRows * 0.8 / 100) + "px Arial"
      const aa_character_text_metrics = ctx.measureText("M"); // widest character
      const aa_character_width = aa_character_text_metrics.width;
      const aa_character_height = aa_character_text_metrics.actualBoundingBoxAscent + aa_character_text_metrics.actualBoundingBoxDescent;
      // 1 problem is aa_character_height will always be constant, so If we set the font size too big, it will never draw aminoacid characters.
      if (aa_character_width < (cell_width * canvas_scale * aa_visible_width_ratio) && aa_character_height < (cell_height* heatmapSummaryNumRows ) )
      {
        ctx.fillStyle = 'black';
        ctx.scale(1/canvas_scale,1);
        for ( let i = leftmost_visible_index; i< rightmost_visible_index; i++) // alternative is to count greens/yellows, or take the average of their colors
        {
          let cur_pos_aminoacid;
          if (currentPredictionToolParameters.toolname_json !== 'AggregatorLocal'){
            cur_pos_aminoacid = proteinData[i+1]?.ref;
          }
          else{
            const first_tool_name = available_tools_list[0].toolname_json;
            cur_pos_aminoacid = proteinData[first_tool_name][i+1]?.ref;
          }
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            String(cur_pos_aminoacid),
            canvas_scale * (i + 0.5) * cell_width,
            cell_height *
              (20 +
                heatmapSpaceBtwnSummaryNumRows +
                heatmapSummaryNumRows +
                heatmapAminoAcidCharactersNumRows / 2)
          );
        } 
        ctx.scale(canvas_scale,1);

      }

    // const end_time = Date.now();
    // console.log("draw time = " + String(end_time - start_time));
  },[scaleAndOriginX.originX,scaleAndOriginX.scale,sequence_length,color_lists_array,currentPredictionToolParameters,heatmapColors,heatmapMeanColors,proteinData,available_tools_list] );
  // callback because it is in useEffect dependency array;

  const drawHeatmapPositions = useCallback ( () => {
    if (currentPredictionToolParameters.score_ranges.length !== color_lists_array.length){
      return // only draw if these 2 parameters match, or else It will result in runtime error,
    }
    
    const c = positionsRef.current;
    const ctx = c.getContext("2d");
    // c.style.width = '80vw' ; // !!! IMPORTANT for sizing MUST BE SAME IN THE HTML CODE
    const rect = c.getBoundingClientRect(); //console.log(rect);
    const positions_width = rect.width;// must be the same as in canvas width html element
    const positions_height = rect.height;//must be the same as in canvas height html element
    const ratio = window.devicePixelRatio;
    c.width = positions_width * ratio;
    c.height = positions_height * ratio;
    const c2 = heatmapRef.current;
    const rect2 = c2.getBoundingClientRect(); //console.log(rect);
    const heatmap_width = rect2.width;// must be the same as in canvas width html element
    const heatmap_height = rect2.height;

    const canvas_originX = scaleAndOriginX.originX * heatmap_width ; //!!QZY
    const canvas_scale = scaleAndOriginX.scale;
    const cell_width = (heatmap_width/sequence_length); // sequence_length can not be 0
    const cell_height = heatmap_height / heatmapTotalNumRows; //!! must be same in drawtooltip //10, number 20 = aminoacids, also left 70 px space in the bottom;

    const leftmost_visible_index = Math.max(Math.round((canvas_originX/heatmap_width * sequence_length)), 0);  // 0 based index
    const rightmost_visible_index = Math.min(Math.round( (canvas_originX/heatmap_width * sequence_length) + (sequence_length/canvas_scale)) , sequence_length );// max = length of sequence
    
    ctx.fillStyle = 'black';
    // ctx.font = "0.8rem Arial"; // change based on device??????
    ctx.font = String(window.innerHeight * heatmapCellHeight * 0.95 / 100) + "px Arial" // 1.4 vh didn't work, so I had to resort to this
    const num_visible = sequence_length/canvas_scale;
    const browser_resize_ratio = (window.innerWidth/window.screen.availWidth); // max value is 1
    // the constant 20 in step_size calculation will be included in config.js
    const step_size = Math.max(Math.round(num_visible/ ( 20  *  browser_resize_ratio )),1); // so that step_size isn't smaller than 1; // if stepsize becomes 0 I get infinite loop;
    ctx.scale(ratio,ratio); // important don't forget this
    ctx.scale(canvas_scale,1); 
    ctx.translate(-canvas_originX,0); 
    ctx.scale(1/canvas_scale,1);
    ctx.translate(30,0);
    ctx.textAlign ="center";
   
    for (let i = 0; i< rightmost_visible_index; i+= step_size) // without leftmost (let i = 0; i< sequence_length; i+= step_size) 
    {
      // let number_text = String(i+1);
      // because of ctx.translate(-canvas_originX) after scaling, this looks confusing but it is corrrect;
      if ( i >= leftmost_visible_index) {
        ctx.textBaseline = 'end';
        ctx.fillText(String(i+1),cell_width * (i+0.5) * canvas_scale, cell_height * heatmapSpaceBtwnSummaryNumRows/2 );
        ctx.beginPath();       // Start a new path
        ctx.moveTo(cell_width * (i+0.5) * canvas_scale , cell_height *  heatmapSpaceBtwnSummaryNumRows * (0.55)  );    // Move the pen to (30, 50)
        ctx.lineTo(cell_width * (i+0.5) * canvas_scale , cell_height* heatmapSpaceBtwnSummaryNumRows );  // Draw a line to (150, 100)
        ctx.stroke(); 
        if ( step_size <= aa_position_notches_threshold && step_size > 1){
          for (let j = i +1 ; (j < i + step_size) && j < rightmost_visible_index ; j++){
            ctx.beginPath();       // Start a new path
            ctx.moveTo(cell_width * (j+0.5) * canvas_scale , cell_height *  heatmapSpaceBtwnSummaryNumRows * (0.75)  );    // Move the pen to (30, 50)
            ctx.lineTo(cell_width * (j+0.5) * canvas_scale , cell_height* heatmapSpaceBtwnSummaryNumRows );  // Draw a line to (150, 100)
            ctx.stroke();
          }
        }
        // drawing notches for the left of the leftmost position
        if ( step_size <= aa_position_notches_threshold &&  (i - step_size < leftmost_visible_index)){ 
          for(let j = i-1; j >= leftmost_visible_index; j--){
            ctx.beginPath();       // Start a new path
            ctx.moveTo(cell_width * (j+0.5) * canvas_scale , cell_height *  heatmapSpaceBtwnSummaryNumRows * (0.75)  );    // Move the pen to (30, 50)
            ctx.lineTo(cell_width * (j+0.5) * canvas_scale , cell_height* heatmapSpaceBtwnSummaryNumRows );  // Draw a line to (150, 100)
            ctx.stroke();
          }
        }
      }
    }
    ctx.scale(canvas_scale,1);

  },[color_lists_array.length, currentPredictionToolParameters.score_ranges.length, scaleAndOriginX.scale, scaleAndOriginX.originX, sequence_length])

  const drawCurrentViewWindow = useCallback ( () => { // 50 px both left and right for the index number to display
    // const start_time = Date.now();      // takes 13 miliseconds for 1610 aa protein
    // return;
    const c = currentViewWindowRef.current;
    const ctx = c.getContext("2d");

    const current_view_window_rect = c.getBoundingClientRect();
    const w = current_view_window_rect.width; 
    const h = current_view_window_rect.height;
    
    const ratio = window.devicePixelRatio;
    c.width = w * ratio;
    c.height = h * ratio;
    ctx.scale(ratio,ratio);
    // 80vw + 100px;
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
    // // drawing indices;
    // const leftmost_visible_index = String(Math.floor((canvas_originX/heatmapRect_width * sequence_length) +1 ));
    // const rightmost_visible_index = String(Math.ceil((canvas_originX/heatmapRect_width * sequence_length) + (sequence_length/canvas_scale)));  
    const leftmost_visible_index = Math.round((canvas_originX/heatmapRect_width * sequence_length)) + 1;  // 0 based index
    const rightmost_visible_index = Math.min(Math.round( (canvas_originX/heatmapRect_width * sequence_length) + (sequence_length/canvas_scale)) , sequence_length );// max = length of sequence
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    ctx.font = String(window.innerHeight * heatmapCellHeight * 0.95 / 100) + "px Arial" // 1.4 vh didn't work, so I had to resort to this

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
    const mouse_xcor = e.clientX - rect.left;

    if (cur_time - prevTime < 1500) {
      e.preventDefault(); // so that it doesn't scroll while zooming
      if (cur_time - prevTime < 32) // to limit fps;
      {
          // console.log(cur_time - prevTime);
          // console.log("fail");
          return;
      }
    }
    
    const canvas_scale_prev = canvas_scale_and_originX.scale; // value of zoom before scroll event
    const canvas_originX_prev = canvas_scale_and_originX.originX * heatmap_width; // QZY
    //const canvas_originX_prev = canvas_scale_and_originX.originX;


    // console.log("originX prev = ")
    let max_zoom_value = sequence_length/max_zoom_visible_aa_count;

    let canvas_scale_next = (1 - (e.deltaY/180)) * canvas_scale_prev; //new value of zoom after scroll


    canvas_scale_next = Math.min(Math.max(1, canvas_scale_next), max_zoom_value); // 64 = max zoom value, calculation of zoom value should be based on protein size
    const scalechange = canvas_scale_next / canvas_scale_prev; // 

    let real_xcor = canvas_originX_prev + (mouse_xcor/canvas_scale_prev); // real x coordinate of the mouse pointer, this line is reused in tooltip function
    // real coordinate of current mouse point;
    let canvas_originX_next = Math.max( (real_xcor - ((real_xcor - canvas_originX_prev)/scalechange)), 0); // so that it doesn't become smaller than 0
    canvas_originX_next = Math.min(canvas_originX_next,(heatmap_width - heatmap_width/canvas_scale_next)) // so that heatmap new originX isn't too large, (start and end is constant)
    canvas_originX_next = canvas_originX_next/heatmap_width // !!QZY
    if (canvas_scale_next !== canvas_scale_prev){     
      e.preventDefault();
      setScaleAndOriginX( {scale:canvas_scale_next, originX: canvas_originX_next} );
      setPrevTime(cur_time); // should it stay here or at the end??

    }
 
    
  },[prevTime,setScaleAndOriginX,sequence_length]);
  const drawAminoAcidLegend  = () => {  // will only run once on startup of useEffect
    const c = aminoAcidLegendRef.current;
    const ctx = c.getContext("2d");
    // c.style.width = aminoAcidLegendWidth; 
    const legend_rect = c.getBoundingClientRect();
    const w = legend_rect.width;
    const h = legend_rect.height;
    const ratio = window.devicePixelRatio;
    c.width = w * ratio;
    c.height = h * ratio;
    // c.style.height = h + "px";
    ctx.scale(ratio,ratio);
    ctx.clearRect(0,0,10000,1000000);
    //{'A': 0, 'R': 1, 'N': 2, 'D': 3, 'C': 4, 'Q': 5, 'E': 6, 'G': 7, 'H': 8, 'I': 9, 'L': 10, 'K': 11, 'M': 12, 'F': 13, 'P': 14, 'S': 15, 'T': 16, 'W': 17, 'Y': 18, 'V': 19}    
    const cHeatmap = heatmapRef.current;
    const heatmapRect = cHeatmap.getBoundingClientRect();
    const cell_height = heatmapRect.height / heatmapTotalNumRows ; //!! must be same in drawtooltip and drwaheatmap //10, number 20 = aminoacids, also left 50 px space in the bottom;
    ctx.font = String(window.innerHeight * heatmapCellHeight * 0.95 / 100) + "px Arial" // 1.4 vh didn't work, so I had to resort to this
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
    ctx.textBaseline = 'bottom';
    ctx.fillText("Position" , w - 30 , cell_height*(20 + heatmapSpaceBtwnSummaryNumRows + heatmapSummaryNumRows/4) );
    ctx.fillText("average" , w - 30 , cell_height* (20 + heatmapSpaceBtwnSummaryNumRows + heatmapSummaryNumRows*3/4) );
    ctx.beginPath();
    ctx.moveTo(w - 20 ,  cell_height * (20 + heatmapSpaceBtwnSummaryNumRows + heatmapSummaryNumRows/2));
    ctx.lineTo(w - 10, cell_height * (20 + heatmapSpaceBtwnSummaryNumRows + heatmapSummaryNumRows/2));
    ctx.stroke();
    // ctx.fillText("Position average",20,(cell_height*(25+1)));
    // ctx.beginPath();
    // ctx.moveTo(105,  cell_height * (25+0.5) );
    // ctx.lineTo(115,  cell_height *  (25+0.5) );
    // ctx.stroke();
} ;

  // wheelzoom event registeration
  useEffect(()=>{ 
      // console.log("zlistener");
      
      const zoomListener = (e) => wheelZoom2(e,scaleAndOriginX);
      let hMapRefValue = null;
     
      if (heatmapRef.current ){
        heatmapRef.current.addEventListener("wheel", zoomListener);
        hMapRefValue = heatmapRef.current; // to cancel scrolling while on heatmap
      }

      return () => {
        // console.log("cleanup runs");
        if (hMapRefValue){
          hMapRefValue.removeEventListener('wheel', zoomListener);
        }
      }
    },[wheelZoom2,scaleAndOriginX]);
  
  // redraw on scale or origin change (zoom or pan)
  useEffect( () => {
    if (heatmapRef && heatmapRef.current &&  sequence_length > 0) // Object.keys(proteinData).length !== 0 &&
      { 
          // let s_time = Date.now();
          drawHeatmap2();
          drawHeatmapPositions();
          drawAminoAcidLegend();
          drawCurrentViewWindow();
          // let end_time = Date.now();
          // console.log("drawing hmap => " + String(end_time - s_time)); 
      } 
  }, [scaleAndOriginX,sequence_length,drawHeatmap2,drawCurrentViewWindow,drawHeatmapPositions] );

  useEffect(() => { // redraw on resize
      const handleResize = () => { // reset canvasScaleOrigin reference and draw in roughly 30 fps
          // console.log("handleresize");
          // const cur_time = Date.now();
          // if (cur_time - prevTime < 32) // 1000/40 = 25 fps
          // {
          // return;
          // }
          
          // giving canvas scale a new reference so that drawing heatmap runs once again;
          setScaleAndOriginX( prev => { return( {scale: prev.scale , originX: prev.originX } ) } )
          // drawHeatmap2(); // causes flickering , no idea why; instead I need to use setCanvasScaleAndOrigin and setPrevtime
          // setPrevTime(prev => cur_time); // if removed, flickering will happen, no idea why?? May not be the case anymore
      }
      window.addEventListener("resize" , handleResize )

      return () => {window.removeEventListener("resize" , handleResize)}; // cleanup

  },[setScaleAndOriginX]) // draw heatmap again on resize //drawHeatmap2
  
  
  
  const drawTooltipHeatmapMain = (mouse_xcor,mouse_ycor,heatmapRect) => {
      
    const heatmapRect_height = heatmapRect.height;
    const heatmapRect_width = heatmapRect.width;
    
    const cell_height = heatmapRect_height /heatmapTotalNumRows ;  //!! must be same in drawheatmap // 300/20 = 15 ,  number 20 is same for all 
    const cell_width = (heatmapRect_width/sequence_length); //!! must be same in drawheatmap // if we use floor, it will result in 0 cell width when protein length is larger than c.width;
    
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    
    //const canvas_originX_prev = scaleAndOriginX.originX;
    let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
    //  | | | | => 0,1,2;
    const original_aminoacid_idx = Math.max(Math.ceil(real_xcor/cell_width),1) ;
    const mutated_aminoacid_idx = Math.min(Math.floor(mouse_ycor/cell_height),19);
    const mutated_aminoacid = aminoacid_ordering[mutated_aminoacid_idx]; // the resulting aminoacid from SNP mutation
    let ttLines = []; // tooltip lines array, element format = {color:'white', text:'asd'} 
    let position_string;
    let risk_string;
    if (currentPredictionToolParameters.toolname_json !== 'AggregatorLocal'){
      const original_aminoacid = proteinData[original_aminoacid_idx].ref;
      const mutation_risk_raw_value = helperGetPositionScore(original_aminoacid_idx -1 ,mutated_aminoacid_idx,proteinData); 
      const mutation_risk_assessment = calculateRiskAssessment(mutation_risk_raw_value, currentPredictionToolParameters); // handles NaN
      let mutation_risk_raw_value_string  = mutation_risk_raw_value;
      // 3 decimal points
      if ( !isNaN(mutation_risk_raw_value)){
        mutation_risk_raw_value_string = mutation_risk_raw_value.toFixed(3);
      }    
      position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + mutation_risk_raw_value_string;
      risk_string =  String(mutation_risk_assessment);
      ttLines.push({color:'white',text:position_string})
      ttLines.push({color:heatmapColors[original_aminoacid_idx -1 ][mutated_aminoacid_idx], text:risk_string})
    }
    else{
      // original_aminoacid can be split into multiplelnes
      const first_tool_name = available_tools_list[0]?.toolname_json;
      const original_aminoacid = proteinData?.[first_tool_name]?.[original_aminoacid_idx]?.ref;
      const num_negative_predictions = helperGetPositionAggregateScore(original_aminoacid_idx-1,mutated_aminoacid_idx).score;
      position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid);
      risk_string =  String(num_negative_predictions) + " out of " + String(available_tools_list.length) + " predicts pathogenic";
      ttLines.push({color:'white',text:position_string})
      ttLines.push({color:heatmapColors[original_aminoacid_idx -1 ][mutated_aminoacid_idx], text:risk_string})
    }
    setTooltip({status:'ok',pageX:mouse_xcor, pageY:heatmapRect_height - mouse_ycor + 30, lines:ttLines})
   
  }

  const drawTooltipHeatmapSummary = (mouse_xcor,mouse_ycor,heatmapRect) => { // to be completd
    const tool_parameters = currentPredictionToolParameters;
    // tooltip ref variables
   
    //heatmap ref variables
    const heatmapRect_width = heatmapRect.width;
    const heatmapRect_height = heatmapRect.height;
    const cell_width = (heatmapRect_width/sequence_length); //!! must be same in drawheatmap // if we use floor, it will result in 0 cell width when protein length is larger than c.width;
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    //const canvas_originX_prev = scaleAndOriginX.originX;
    

    let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
    
    const original_aminoacid_idx = Math.max(Math.ceil(real_xcor/cell_width),1) // real_xcor 0 to cell_wid = 0th aminoacid; realxcor cell_width to 2*cell_width = 1st aminoacid; // +1 because our scores start from 1;
    let ttLines = [];
    if (currentPredictionToolParameters.toolname_json !== 'AggregatorLocal'){
      const original_aminoacid = proteinData[original_aminoacid_idx].ref;
      const position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid); // definitely smaller than median value string; so I didn't add it into calculation of risk_strings;
      ttLines.push({color:'white',text:position_string});
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
        const mutation_risk_assessment = calculateRiskAssessment(mutation_risk_raw_value, currentPredictionToolParameters);
        risk_assessment_buckets[mutation_risk_assessment].add(mutated_aminoacid);
      }
      for(let i = 0; i< tool_parameters.score_ranges.length; i++){
        const cur_assessment = tool_parameters.score_ranges[i].risk_assessment;
        const num_of_cur_assessment = risk_assessment_buckets[cur_assessment].size;
        const cur_string = "" + cur_assessment + " : " + String(num_of_cur_assessment);
        const cur_risk_string_color = String(color_lists_array[i][Math.floor(number_of_colors/2)]); 
        ttLines.push({color:cur_risk_string_color,text:cur_string});
      }
      const cur_pos_median = calculateMedianOfPosition(original_aminoacid_idx,proteinData,currentPredictionToolParameters);
      const median_value_string = "Median of values = " + cur_pos_median;
      ttLines.push({color:heatmapMeanColors[original_aminoacid_idx -1], text:median_value_string})
      
      
    }
    // else aggregator
    else{
      const first_tool_name = available_tools_list[0]?.toolname_json; // doesn't matter which tool we are looking at, the sequence is the same
      const original_aminoacid = proteinData[first_tool_name][original_aminoacid_idx].ref;
      // get aggregation results for each index;
      let aggregate_scores_array = [];
      for(let j = 0; j < 20; j++){
        const num_negative_predictions = helperGetPositionAggregateScore(original_aminoacid_idx-1, j).score;
        aggregate_scores_array.push(num_negative_predictions);
      }
      const median_of_aggregates = aggregate_scores_array.sort()[10]; // 0'th index is 0, so 10 is the median of the 19 values
      const position_string =  String(original_aminoacid_idx) + ". " + String(original_aminoacid);
      ttLines.push({color:'white',text:position_string});
      const median_string_title = "Position aggregation median:"
      ttLines.push({color:'white',text:median_string_title});
      const median_string_result = String(median_of_aggregates) + " out of " + String(available_tools_list.length) + " predicts pathogenic";
      ttLines.push({text:median_string_result, color: heatmapMeanColors[original_aminoacid_idx-1] })
      
    }
    setTooltip({status:'ok',pageX:mouse_xcor, pageY:heatmapRect_height - mouse_ycor + 30, lines:ttLines});
    
  }

  function drawTooltipOrPan2(e) // scale comes from top_canvas_scale
  { // be careful, cell_height and width must be the same in the draw function, if you change this also change drawheatmap;
    // if clause to check if xcor and ycor is inside the heatmapCanvas coordinates;
    // !!!! DrawToolTip Part of the function; !!!
    // console.log("tooltip start prevX  = " + topCanvasOriginXPrev);
    if (sequence_length === 0 ){
      return;
    }
  
    
    // const cHeatmap = ctxRef.current; // 
    const cHeatmap = heatmapRef.current;
    // !! get boundaries of the heatmap instead of the tooltip canvas, for the "rect" variable;
    const heatmapRect = cHeatmap.getBoundingClientRect();  // !! get boundaries of the heatmap//console.log(rect);
    const heatmapRect_height = heatmapRect.height;
    const heatmapRect_width = heatmapRect.width;
    const cell_height = heatmapRect_height / heatmapTotalNumRows; //!! must be same in drawheatmap // 300/20 = 15 ,  number 20 is same for all 
    const mouse_xcor = e.clientX - heatmapRect.left;//console.log("hover mouse_xcor = " + mouse_xcor); // console.log(heatmapRect.width);
    const mouse_ycor = e.clientY - heatmapRect.top; // scale doen't affect this, so this is the real_ycoordinate //console.log("hover mouse_ycor = " + mouse_ycor);// console.log(heatmapRect.height-50); // -50 space for position indexes;
    
    const canvas_scale = scaleAndOriginX.scale; // value of zoom before scroll event
    const canvas_originX_prev = scaleAndOriginX.originX * heatmapRect_width; // QZY
    
    // const aminoacid_legend_width = aminoAcidLegendRef.current.getBoundingClientRect().width;
    // const x_offset = heatmapRect.left - tooltipRect.left;
    // const y_offset = heatmapRect.top - tooltipRect.top;
  

    if (mouse_xcor > heatmapRect_width || mouse_xcor < 0 || mouse_ycor <= 0 || mouse_ycor >= (heatmapRect_height)) 
    { // boundary check for heatmap, -50 is for the space left for position indices
      // bigger or equal to, so that index finders don't go out of bounds, as maxwidth/cell_width = an index 1 bigger than the sequence length
      // setIsDown(prev => false);// so that panning point resets when mouse goes out of bounds;
      if (tooltip?.status !== 'invisible'){
        setTooltip({status:'invisible',pageX:0,pageY:0,lines:[]})
      }
      return

    }
    else if ( mouse_ycor >= (cell_height* (20 + heatmapSpaceBtwnSummaryNumRows) ) ){ // inside summary part
      drawTooltipHeatmapSummary(mouse_xcor,mouse_ycor,heatmapRect);
    }
    else if (mouse_ycor <= ( cell_height * 20 )){ // inside main heatmap
      drawTooltipHeatmapMain(mouse_xcor,mouse_ycor,heatmapRect);
    }
    else{
      if (tooltip?.status !== 'invisible'){
        setTooltip({status:'invisible',pageX:0,pageY:0,lines:[]})
      }
    }
    const isDown = (e.buttons %2 === 1);
    const notScrolling = (e.buttons%8 !== 4);
    if (isDown && notScrolling) // panning the canvas if mouse down is down; left button is clicked & not scrolling
    {
      const dx_normalized = (e.movementX * -1) / canvas_scale; // change in X direction
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
      // setPanningStartX(prev => mouse_xcor); 
    }
    //ctx.resetTransform(); no need
  }
  
  
  

  const onMouseLeaveHelper = () => {
    setTooltip({status:'invisible',pageX:0,pageY:0,lines:[]})

  }
  //left:'100px', bottom:'300px', 
//left:tooltip.pageX +'px' ,bottom:(tooltip.pageY-120) + 'px',
  const tooltipJSX = tooltip?.status !== "invisible" && (
    <div
      style={{
        position: "absolute",
        left: tooltip.pageX + "px",
        bottom: tooltip.pageY + "px",
        backgroundColor: "black",
        pointerEvents: "none",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        padding:'0.25rem 0.25rem'
      }}
    >
      {tooltip.lines.map((line) => {
        let font_size = 16;
        let font_size_candidate =
          (window.innerHeight / 100) *
          heatmapCellHeight *
          0.95 *
          heatmapTooltipFontMultiplier;
        if (font_size_candidate > font_size) {
          font_size = font_size_candidate;
        }
        const font_style = String(font_size) + "px Arial";
        return (
          <div key={line.text}>
            <span style={{ color: line.color, font: font_style }}>
              {line.text}
            </span>
          </div>
        );
      })}
    </div>
  );
  // positions canvas' Z index being bigger than heatmap canvas disables zooming and panning when over that canvas
  const heatmapHeightStyle = String(heatmapCellHeight * heatmapTotalNumRows) + 'vh';
  // const heatmapPlusCurrentViewWindowHeightJSX = String(heatmapCellHeight * (heatmapTotalNumRows + currentViewWindowNumRows)) + 'vh'
  const currentVisibleWindowHeightStyle = String(heatmapCellHeight * currentViewWindowNumRows) + 'vh'
  return (
      <>
          <div style={{marginBottom: String(heatmapCellHeight) + 'vh'}}>  
            <canvas id="current_view_window" ref={currentViewWindowRef}
                        style= {{marginLeft:"calc(" + aminoAcidLegendWidth + " - 40px" , width:'calc(80vw + 100px)', height:currentVisibleWindowHeightStyle}}  > 
            </canvas>
          </div>
          {/* Height of asds must be the same as max(amino_acid_legend,heatmap_canvas) */}
          {/* canvas width width ={window.innerwidth} is only for the initialization, then we change by reassigning the canvas width inside functions */}
          {/* asds is only there because canvas positions are absolute, So it acts as a filler, so that subsequent elements and canvases don't overlap */}
          {/* asds must have the same height as heatmap, for the ttolipt, and they must start at the same pos */}
          <div id="asds" style={{ width:"calc(-25px + 100vw)", height:heatmapHeightStyle, position:'relative'}}> 
                  { tooltipJSX}
                  <canvas  id="heatmap_canvas" ref={heatmapRef} style = {{position:"absolute",top:"0px", left:"calc("+ aminoAcidLegendWidth +  " + 10px)" , zIndex:1, width:'80vw', height:heatmapHeightStyle}}
                  // onClick={(e) => console.log("asfasfasfasfs")}
                  // onclick or other functions don't work here as the topmost layers is the canvas below
                  // scrolling is registered manually, so not given as props here
                  onMouseMove = {(e) => drawTooltipOrPan2(e)}
                  onDoubleClick= {(e) => setScaleAndOriginX({scale:1, originX:0})}
                  onMouseLeave= {onMouseLeaveHelper} // a bit redundant, but nevertheless here just to make sure;
                  >
                  </canvas>
                  <canvas  id="positions_canvas" ref={positionsRef} style = {{position:"absolute",top:String(heatmapCellHeight *20)+'vh' , left:"calc("+ aminoAcidLegendWidth +  " - 20px)" , zIndex:2, width:'calc(80vw + 60px)', height: String(heatmapCellHeight * heatmapSpaceBtwnSummaryNumRows) + 'vh' }}
                  >
                  </canvas>
                  <canvas id="amino_acid_legend" ref={aminoAcidLegendRef} style={{position:"absolute",top:"0px", left:"10px",width:aminoAcidLegendWidth, height: heatmapHeightStyle ,zIndex:1 }}>
                  </canvas>

          </div>
          
      </>
      
  )



};

export default Heatmap;



// const heatmapColors = useMemo( () => {
//   if (currentPredictionToolParameters.score_ranges?.length !== color_lists_array.length){
//     return
//   }
//   // 2d array; row count = sequence_length cols = 20, as we are looping the same way in drawheatmap etc.
//   let temp_heatmapColorsMatrix = Array(sequence_length).fill().map(entry => Array(2).fill(-1)) 
//   for(let i = 0; i< sequence_length; i++){
//     for (let j = 0; j <20; j++) // aminoacid_ordering
//     {
//       let current_score;
//       if (Object.hasOwn(proteinData[i+1] , aminoacid_ordering[j]  )  ){
//         current_score = parseFloat(proteinData[i+1][aminoacid_ordering[j]]);
//         if (isNaN(current_score))
//         {
//           temp_heatmapColorsMatrix[i][j] = "#add8e6";
//           continue;
//         }
//       }
//       else if (aminoacid_ordering[j] === proteinData[i+1]?.ref){
//         // doesn't exist because it is the ref, everything going normal
//         current_score = currentPredictionToolParameters.ref_value;
//       }
//       else{
//         // doesn't exist and is not reference, similar to NaN value but harder to find, isn't as obvious, more insidious;
//         temp_heatmapColorsMatrix[i][j] = "#add8e6";
//         continue;
//       }
//       let color_index;
//       let range_start;
//       let range_end;
//       let range_size;
//       let color_lists_index;
//       for (let k = 0; k< currentPredictionToolParameters.score_ranges.length; k++){
//         const current_loop_range_start = currentPredictionToolParameters.score_ranges[k].start;
//         const current_loop_range_end = currentPredictionToolParameters.score_ranges[k].end;
//         if(current_score >= current_loop_range_start && current_score <=current_loop_range_end ){
//           // is between current ranges
//           range_start = current_loop_range_start;
//           range_end = current_loop_range_end;
//           range_size = range_end - range_start
//           color_lists_index = k;
//         } 
//       }
//       // 30 is number of colors // 29 = number of //colors in range -1
//       color_index = Math.min( Math.floor((current_score - range_start) * (1/ range_size) * number_of_colors ) ,number_of_colors - 1 ) 
//       temp_heatmapColorsMatrix[i][j] =  String(color_lists_array[color_lists_index][color_index]); 
//   }
// }
// return temp_heatmapColorsMatrix;
  
//   // if( Object.hasOwn(proteinData) )
// },[color_lists_array,proteinData,currentPredictionToolParameters,number_of_colors,sequence_length])



// original_aminoacid = proteinData[original_aminoacid_idx].ref;
// let mutation_risk_raw_value_string;
// let mutation_risk_raw_value;
// if ( Object.hasOwn(proteinData[original_aminoacid_idx] , mutated_aminoacid)  ){
//   mutation_risk_raw_value = parseFloat(proteinData[original_aminoacid_idx][mutated_aminoacid]);
//   mutation_risk_raw_value_string = mutation_risk_raw_value.toFixed(3);
// }
// else if (proteinData[original_aminoacid_idx].ref === mutated_aminoacid){// if field doesn't exist but is the refernce aminoacid, working as intended no bug, or NaN situation
//     mutation_risk_raw_value = tool_parameters.ref_value;
//     mutation_risk_raw_value_string = mutation_risk_raw_value.toFixed(3);
//   }
// else{
//   mutation_risk_raw_value = "Missing value";
//   mutation_risk_raw_value_string = "Missing value";

// }      
// const mutation_risk_assessment = calculateRiskAssessment(mutation_risk_raw_value, currentPredictionToolParameters); // handles NaN
// // console.log(mutation_risk_assessment);
// let font_size = 16;
// if ((window.innerHeight * heatmapCellHeight * 0.95 / 100) > 15  ){
//   font_size = (window.innerHeight * heatmapCellHeight * 0.95 / 100);
// } 
// ctx.font = String(font_size) + "px Arial" ;

// ctx.textBaseline = "top";
// // const text = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + String(mutation_risk_raw_value) + " " + String(mutation_risk_assessment); 
// const position_string = String(original_aminoacid_idx) + ". " + String(original_aminoacid) + " --> " + String(mutated_aminoacid) + " " + mutation_risk_raw_value_string;
// const risk_string =  String(mutation_risk_assessment);
// const strings_max_width = Math.max(ctx.measureText(position_string).width , ctx.measureText(risk_string).width);
// const strings_max_height = Math.max(
// (ctx.measureText(position_string).actualBoundingBoxAscent + ctx.measureText(position_string).actualBoundingBoxDescent ) ,
// (ctx.measureText(risk_string).actualBoundingBoxAscent + ctx.measureText(risk_string).actualBoundingBoxDescent) );

// ctx.fillStyle="black"
// ctx.fillRect(mouse_xcor, mouse_ycor + y_offset - (4 * strings_max_height) -2  , strings_max_width + 10  , strings_max_height * 2 + 10 );

// ctx.fillStyle = "white";
// ctx.textAlign = "center"; 
// ctx.fillText(position_string, mouse_xcor + ((strings_max_width )/2) + 5 , mouse_ycor + y_offset -  (4 * strings_max_height) + 2 )
// ctx.fillStyle = heatmapColors[original_aminoacid_idx -1 ][mutated_aminoacid_idx]; // -1 because of heatmapColors is 0 indexed;
// ctx.fillText(risk_s