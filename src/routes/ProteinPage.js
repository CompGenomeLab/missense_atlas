import React, { useState,useRef, useEffect, useMemo } from "react";
import chroma from "chroma-js"
import axios from "axios";
// placed here for now because it is taking too many lines
 
// import {version} from "react"
// import disableScroll from 'disable-scroll'; // uninstalled because it causes stuttering while preventing scorll

// import * as d3 from "d3"
// import { Touch, Canvas } from 'react-touch-canvas'

// const zoomed = () => {
//   svg.attr(
//     "transform",
//     "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"
//   )

//   console.log("inside zoomed")
// }

// // zoom base element
// let svg = d3.select("svg")


// // zoom behaviour
// let zoom = d3.zoom().on("zoom", zoomed)

// // call behaviour on base element
// svg.call(zoom)
// http://10.3.2.13:8080/database/efin/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/sift/8a8c1b6c6d5e7589f18afd6455086c82
// http://10.3.2.13:8080/database/provean/8a8c1b6c6d5e7589f18afd6455086c82 // what is del?; also has negative values; be careful;
// http://10.3.2.13:8080/database/lists2/8a8c1b6c6d5e7589f18afd6455086c82


/*
{"md5sum":"8a8c1b6c6d5e7589f18afd6455086c82","sequence":"MTVLEITLAVILTLLGLAILAILLTRWARCKQSEMYISRYSSEQSARLLDYEDGRGSRHAYSTQSDTSYDNRERSKRDYTPSTNSLVSMASKFSLGQTELILLLMCFILALSRSSIGSIKCLQTTEEPPSRTAGAMMQFTAPIPGATGPIKLSQKTIVQTPGPIVQYPGSNAGPPSAPRGPPMAPIIISQRTARIPQVHTMDSSGKITLTPVVILTGYMDEELAKKSCSKIQILKCGGTARSQNSREENKEALKNDIIFTNSVESLKSAHIKEPEREGKGTDLEKDKIGMEVKVDSDAGIPKRQETQLKISEMSIPQGQGAQIKKSVSDVPRGQESQVKKSESGVPKGQEAQVTKSGLVVLKGQEAQVEKSEMGVPRRQESQVKKSQSGVSKGQEAQVKKRESVVLKGQEAQVEKSELKVPKGQEGQVEKTEADVPKEQEVQEKKSEAGVLKGPESQVKNTEVSVPETLESQVKKSESGVLKGQEAQEKKESFEDKGNNDKEKERDAEKDPNKKEKGDKNTKGDKGKDKVKGKRESEINGEKSKGSKRAKANTGRKYNKKVEE"}
*/

// sift 0.00 to 0.05 => deleterious,  0.05 to 1.0 benign,;
// so 0.00 to 0.05   red to yellow,   0.05 to 1.0 = yellow to green;
// Dismiss previous line, 0.00 to 0.05 red to white, 0.05 to 1.0, white to green
const protein_sequence = 'MTVLEITLAVILTLLGLAILAILLTRWARCKQSEMYISRYSSEQSARLLDYEDGRGSRHAYSTQSDTSYDNRERSKRDYTPSTNSLVSMASKFSLGQTELILLLMCFILALSRSSIGSIKCLQTTEEPPSRTAGAMMQFTAPIPGATGPIKLSQKTIVQTPGPIVQYPGSNAGPPSAPRGPPMAPIIISQRTARIPQVHTMDSSGKITLTPVVILTGYMDEELAKKSCSKIQILKCGGTARSQNSREENKEALKNDIIFTNSVESLKSAHIKEPEREGKGTDLEKDKIGMEVKVDSDAGIPKRQETQLKISEMSIPQGQGAQIKKSVSDVPRGQESQVKKSESGVPKGQEAQVTKSGLVVLKGQEAQVEKSEMGVPRRQESQVKKSQSGVSKGQEAQVKKRESVVLKGQEAQVEKSELKVPKGQEGQVEKTEADVPKEQEVQEKKSEAGVLKGPESQVKNTEVSVPETLESQVKKSESGVLKGQEAQEKKESFEDKGNNDKEKERDAEKDPNKKEKGDKNTKGDKGKDKVKGKRESEINGEKSKGSKRAKANTGRKYNKKVEE'; // can be accessed from protein_data values as reference is there, but If we send requests by typing the protein sequence, it won't be needed;
const sequence_length = 563; // this value must be taken from the input data; (protein_data_sift variable)
const md5sum = "8a8c1b6c6d5e7589f18afd6455086c82"; // for our current protein;
const protein_name = "Q5SRN2"; // also this value must be taken from input data
const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];
const polyphen2_parameters = {
  toolname: "Polyphen-2",
  toolname_api : "polyphen" , // used in the api url
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
    },
  ],
  ref_value: 0,
};
const sift_parameters = {
  toolname: "Sift",
  toolname_api: "sift",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
    },
  ],
  ref_value: 1,
};
const number_of_colors = 30;
const ProteinPage = () => {  // add ?q=1, to the url to get uniprot metadata
    // console.log(version);
    const database_url = "http://10.3.2.13:8080/database/";
    // console.log("qqqqq");
    const [proteinData,setProteinData] = useState({});
  
    const heatmapRef = useRef(null); // ref for the heatmap in top
    const aminoAcidLegendRef = useRef(null);
    const tooltipRef = useRef(null); // ref for the tooltip layer on top of the heatmap
    const colorRangesLegendRef = useRef(null);
    const currentviewWindowRef = useRef(null);
    const [isDown,setIsDown] = useState(false);
    const [panningStartX,setPanningStartX] = useState(0); 

    const [canvasScaleAndOriginX2,setCanvasScaleAndOriginX2] = useState({scale:1,originX:0}) // so that we update both of them at the smae time instead of seperately,;
    // const canvasScaleAndOriginX2Ref = useRef(canvasScaleAndOriginX2); // no use now
    
    // be careful, always update canvasScaleAndOrigin ref everytime you use setstate, so that wheelzoom doesn't get stale values

    const [prevTime, setPrevTime] = useState( () => Date.now() ); // so that usestate intitial function is only run once
    // use date.now() if we want to limit number of drawings per second;
     
   // const [currentPredictionTool , setCurrentPredictionTool] = useState('Polyphen2'); no need;
    const [currentPredictionToolParameters, setCurrentPredictionToolParameters ] = useState(sift_parameters);
    // console.log("current_predicition_tool_params = ");
    // console.log(currentPredictionToolParameters);
    // console.log(proteinData);
    //cors-anywhere-herokuapp.com
    // , {headers:{'Access-Control-Allow-Origin' : '*',}}
    // const request_url = "polyphen/8a8c1b6c6d5e7589f18afd6455086c82"

    const color_lists_array = useMemo( () => { //color lists to use in drawing heatmap 
      let temp_color_lists_array = []; // generate 30 colors between the score ranges
      for (let i = 0; i < currentPredictionToolParameters.score_ranges.length; i++)
      {
        const current_range_start_color = currentPredictionToolParameters.score_ranges[i].start_color;
        const current_range_end_color = currentPredictionToolParameters.score_ranges[i].end_color;
        // chroma.scale(['#fafa6e','#2A4858']).mode('lch').colors(6)
        const temp_list = chroma.scale([current_range_start_color,current_range_end_color]).mode('lrgb').colors(number_of_colors); // 30 is the number of colors, if you change 30 here, you must change it in drawheatmap color determination based on tool's value
        temp_color_lists_array.push(temp_list);
      }
      return temp_color_lists_array;
    }, [currentPredictionToolParameters] );

    const sequence_length = useMemo ( () => { // calculate sequence length based on the return value of the api
      if ( Object.hasOwn( proteinData, 'scores' ) == false ){
        return 0;
      }
      let i = 1;
      while( Object.hasOwn (proteinData.scores, i)  )
      {
        i += 1;
      }
      return i - 1 ;
    }, [proteinData.md5sum] )

    useEffect( () => {
      const request_url = currentPredictionToolParameters.toolname_api + "/" + md5sum
      drawColorRangesLegend();
      axios.get(database_url + request_url ) // cors policy
      .then(function (response) {
        // handle success
        console.log(response);
        setProteinData(response.data); 
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        console.log("api called for " + database_url + request_url);
        // always executed
      });
    },[currentPredictionToolParameters] );
    
    useEffect(()=>{
      if (heatmapRef && heatmapRef.current &&  sequence_length > 0) // Object.keys(proteinData).length !== 0 &&
      { 
       

        // maybe we can remove currentPredictionToolParameters from function arguemnts, as it is the state 
        // we can also remove canvas scale and origin, but I believe currently it makes it to understnad read the code
        drawHeatmap2(canvasScaleAndOriginX2.scale,canvasScaleAndOriginX2.originX,currentPredictionToolParameters);
        drawAminoAcidLegend();
        drawCurrentViewWindow();
      } 
      
      // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom(e,topCanvasScalePrevRef)); // to cancel scrolling while on heatmap
      const zoomListener = (e) => wheelZoom2(e,canvasScaleAndOriginX2);

      tooltipRef.current.addEventListener("wheel" , zoomListener); // to cancel scrolling while on heatmap
      // console.log("event listener added");
      // tooltipRef.current.addEventListener("wheel" , (e) => wheelZoom2(e,canvasScaleAndOriginX2Ref)); // to cancel scrolling while on heatmap

      return () => {
        // console.log("cleanup runs");
        tooltipRef.current.removeEventListener('wheel', zoomListener);
      }

      // return () => { //probably no need to cleanup, as heatmapref.current becomes null;
      //   console.log('cleanup runs');        
      //   console.log("heatmapref cur = " + heatmapRef.current);
      // };
    },[canvasScaleAndOriginX2, proteinData]);

    
    const drawAminoAcidLegend  = () =>{  // will only run once on startup of useEffect
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

    } 
    const drawColorRangesLegend = () => {

      const step_size = 8; // width of each color in the gradient;
      const c = colorRangesLegendRef.current;
      const ctx = c.getContext("2d");
      const color_ranges_legend_rect = c.getBoundingClientRect();
      // width = {currentPredictionToolParameters.score_ranges.length * 30 * 6}
      // const w = color_ranges_legend_rect.width;
      // const h = color_ranges_legend_rect.height;
      
      const w = (currentPredictionToolParameters.score_ranges.length * (number_of_colors + 1) * step_size) + 30  ; // changes based on currentTool
      // *31, to account for black lines , + 15 to account for current_x starting from 15, and + 15 to make sure last number isn't cut short;
      const h = color_ranges_legend_rect.height; // is always the same 
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.scale(ratio,ratio);


      // ctx.fillRect(0,h/4,w,h/2);
      let current_x = 15;
      ctx.fillStyle = 'black';
      ctx.fillRect(current_x,h/4, step_size,h/2); //(x: number, y: number, w: number, h: number): void
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText(currentPredictionToolParameters.score_ranges[0].start.toFixed(2),current_x,15,40);
      current_x += step_size;
      
      for(let i = 0; i< currentPredictionToolParameters.score_ranges.length; i++){ // i = 0,1 
        for(let j = 0; j< color_lists_array[i].length; j++){
          if(j == Math.floor(color_lists_array[i].length/2) ){ // middle element
            ctx.fillText(currentPredictionToolParameters.score_ranges[i].risk_assessment, current_x, 15 , number_of_colors * step_size); // 30 = number of colors
          }
          // normal color line;
          ctx.fillStyle = color_lists_array[i][j];
          ctx.fillRect(current_x, h/4,  step_size ,h/2);
          current_x += step_size;
        }
        // empty black line
        ctx.fillStyle = 'black';
        ctx.fillRect(current_x, h/4,   step_size, h/2);
        ctx.fillText(currentPredictionToolParameters.score_ranges[i].end.toFixed(2),current_x,15,40);
        current_x += step_size;
      }
      
      return;
    }
    const drawCurrentViewWindow = () => {
      const c = currentviewWindowRef.current;
      const ctx = c.getContext("2d");
      const current_view_window_rect = c.getBoundingClientRect();

      const w = current_view_window_rect.width; 
      const h = current_view_window_rect.height;
      
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.scale(ratio,ratio);
      // fillrect params = (x: number, y: number, w: number, h: number): void
      ctx.fillStyle = 'silver';
      ctx.fillRect(0,h/2,1200,h/2); // 1200 = width of heatmap
      ctx.fillStyle = 'hotpink';
      ctx.fillRect(canvasScaleAndOriginX2.originX,h/2 ,  1200/canvasScaleAndOriginX2.scale , h/2)  // 1200 = width of the heatmap
      // canvas_originX = 0 = protein's 0 , canvas_originX = 1200 = proteins' last; canvas_originX / 1200 * sequence_length = leftmost
      // rightmost visible = left_most visible + 
      const leftmost_visible_index = String (((canvasScaleAndOriginX2.originX/1200 * sequence_length) +1 ).toFixed(0));
      const rightmost_visible_index = (
        (canvasScaleAndOriginX2.originX/1200 * sequence_length) + (sequence_length/canvasScaleAndOriginX2.scale)
        ).toFixed(0);  
      
      ctx.textBaseline = 'top';
      ctx.font = '12px Arial';
      if (((canvasScaleAndOriginX2.originX/1200 * sequence_length) +1 ) > 10){ // if left most index is smaller than 20, textAlign to right;
        ctx.textAlign = 'right';
      }
      else{
        ctx.textAlign = 'left';
      }
      ctx.fillText( leftmost_visible_index , canvasScaleAndOriginX2.originX,  0 , 50) // leftmost visible of the window;
      ctx.textAlign = 'left';
                
      ctx.fillText(rightmost_visible_index, canvasScaleAndOriginX2.originX + 1200/canvasScaleAndOriginX2.scale , 0 , 50   );  // rightmost visilbe of the window
    };

    const helperConsoleLogger = () => {
      
      // 
      return;
      /*
      console.log(typeof(protein_data_sift[0].data))
      console.log((Object.keys(protein_data_sift[0])))
      console.log(protein_data_sift[0].data[0].y)
      // for (let i = 0; i< 20; i++) {
      //   console.log(protein_data_sift[i].id);
      // }
      // console.log()
      console.log(protein_data_sift[12].id);
      console.log(protein_data_sift[12].data[0].y);
      console.log(Math.floor((protein_data_sift[12].data[0].y)*10));
      const c = heatmapRef.current;
      const ctx = c.getContext("2d");
      ctx.fillStyle = 'rgba(152, 30, 42)';
      ctx.fillRect(0,0,10,15);
      */
      // setDummyCounter(prev => prev+1);
      // console.log("dummy counter = " + dummyCounter);
      // console.log("Dummy ref = " + dummyRef.current);
      // console.log("dummy ref = " + dummyRef);
      // setTestObj( () => { 
      //   return(
      //     {asd:'q',qwe:'f'}
      //   )
      
      // } )
    } 

    const onMouseDownHelper = (e) =>{

      e.preventDefault();
      e.stopPropagation();
      const c = heatmapRef.current;
      const rect = c.getBoundingClientRect()
      const mouse_xcor = e.clientX - rect.left;
      const mouse_ycor = e.clientY - rect.top;
      //console.log("mouse xcor_point = " +mouse_xcor);
      //console.log("mouse_ycor " + mouse_ycor);
      if (mouse_xcor > 1200 || mouse_xcor < 0 || mouse_ycor > 200 || mouse_ycor < 0 )  // heatmap boundaries;
      {
        return;
      }
      else // only if mouse points inside correct the heatmap
      {
        setIsDown(prev => true);
        // panning_startX = mouse_xcor;
        setPanningStartX(prev => mouse_xcor);
      }
    }

    const onMouseUpHelper = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDown(prev => false);
      
    }
    

    

    const drawHeatmap2 = (canvas_scale,canvas_originX, tool_parameters) => { // scale is given as parameter right now;
      //// be careful, cell_height and width must be the same in the tooltio, if you change this also change tooltip;
      // const c = ctxRef.current;
      // console.log("drawheatmap start originXprev = " + top_canvas_originX_prev);
      const c = heatmapRef.current;
      const ctx = c.getContext("2d");
      const rect = c.getBoundingClientRect(); //console.log(rect);
      const heatmap_width = rect.width;// must be the same as in canvas width html element
      const heatmap_height = rect.height;//must be the same as in canvas height html element
      const ratio = window.devicePixelRatio;
      c.width = heatmap_width * ratio;
      c.height = heatmap_height * ratio;
      c.style.width = heatmap_width + "px";
      c.style.height = heatmap_height + "px";
      //ctx.resetTransform(); same as setTransform(1,0,0,1,0,0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio,ratio);
      
      ctx.imageSmoothingEnabled = false;
      // ctx.clearRect(0,0,rect.width,rect.height); // size of canvas rect
      ctx.clearRect(0,0,heatmap_width,heatmap_height); 
       
      ctx.scale(canvas_scale,1); 
      ctx.translate(-canvas_originX,0); 
      
      const cell_height = (heatmap_height - 70)/20; //!! must be same in drawtooltip //10, number 20 = aminoacids, also left 50 px space in the bottom;
      // const cell_width = Math.floor(c.width/563); // 1200/563 = 2 , number 563 is the protein sequence length;if we use floor, it will result in 0 cell width when protein length is larger than c.width;
      const cell_width = (heatmap_width/sequence_length); // !! must be same in draw tooltip !!!! THIS IS THE REASON OF BORDERS BETWEEN SQUARES !!!
      
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
      const step_size = Math.max(Math.floor(num_visible/20),1); // so that step_size isn't smaller than 1; // if stepsize becomes 0 I get infinite loop;

      for (let i = 0; i< sequence_length; i+= step_size) 
      {
        // let number_text = String(i+1);
        ctx.fillText(String(i+1),cell_width * (i+0.5) * canvas_scale,cell_height*22);
      }
      ctx.scale(canvas_scale,1); // canvas scale returned back to state before we wrote positions;

      // !!! IMPORTANT, instead of this take the average of colors in all 20 slots 
      for ( let i = 0; i< sequence_length; i++) // alternative is to count greens/yellows, or take the average of their colors
      { // because in sift 0 to 0.05 is benign, not all ranges are equal; 
        // trying the median value now,;
        let cur_pos_mean = 0;
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
            cur_pos_mean += (current_score)/20;
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

       
        // for (let k = 0; k< tool_parameters.score_ranges.length; k++){
        //   const current_loop_range_start = tool_parameters.score_ranges[k].start;
        //   const current_loop_range_end = tool_parameters.score_ranges[k].end;
        //   if(cur_pos_mean >= current_loop_range_start && cur_pos_mean <=current_loop_range_end ){
        //     // is between current ranges
        //     range_start = current_loop_range_start;
        //     range_end = current_loop_range_end;
        //     range_size = range_end - range_start
        //     color_lists_index = k;
        //   } 
        // }
        // color_index = Math.min( Math.floor((cur_pos_mean - range_start) * (1/ range_size) * 30 ) ,29 ) 
        // ctx.fillStyle = String(color_lists_array[color_lists_index][color_index]);

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
        
  } 

  function drawTooltipOrPan2(e, tool_parameters) // scale comes from top_canvas_scale
  { // be careful, cell_height and width must be the same in the draw function, if you change this also change drawheatmap;
    // if clause to check if xcor and ycor is inside the heatmapCanvas coordinates;
    // !!!! DrawToolTip Part of the function; !!!
    // console.log("tooltip start prevX  = " + topCanvasOriginXPrev);
    
    
    const c = tooltipRef.current;
    const ctx = c.getContext("2d");
    const tooltipRect = c.getBoundingClientRect();
    const tooltip_width = tooltipRect.width;// must be the same as in canvas width html element
    const tooltip_height = tooltipRect.height;//must be the same as in canvas height html element
    const ratio = window.devicePixelRatio;
    c.width = tooltip_width * ratio;
    c.height = tooltip_height * ratio;
    c.style.width = tooltip_width + "px";
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
    const canvas_originX_prev = canvasScaleAndOriginX2.originX;
    let real_xcor =  canvas_originX_prev + (mouse_xcor/canvas_scale); // real x coordinate of the mouse pointer, this line and the if else block is reused in tooltip function
    // real_xcor = topCanvasOriginXPrev + (mouse_xcor/topCanvasScalePrev); 


    // got the context;    // console.log(e);
    
    const original_aminoacid_idx = Math.floor(real_xcor/cell_width) + 1 // real_xcor 0 to cell_wid = 0th aminoacid; realxcor cell_width to 2*cell_width = 1st aminoacid; // +1 because our scores start from 1;
    //const original_aminoacid = protein_sequence.charAt(original_aminoacid_idx);
    // const mutated_aminoacid = protein_data_sift[mutated_aminoacid_idx].id; // mouse_ycor/cell_height => in range 0-19, range of aminoacids
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
        if(mutation_risk_raw_value >= current_loop_range_start && mutation_risk_raw_value <= mutation_risk_raw_value ){
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
      
      setCanvasScaleAndOriginX2(prev => {
        return (  
          {scale: canvas_scale ,originX: canvas_originX_next }
        )
        } );
      setPanningStartX(prev => mouse_xcor); 

     

    }
    //ctx.resetTransform(); no need
  }
  
  const wheelZoom2 = (e,canvas_scale_and_originX) => {  // zoomig function
    // if (e.deltaY < 0) {
    //   console.log("Zoom in");
    //   top_canvas_scale += e.deltaY * -2;
    // }
    // else {
    //   console.log("Zoom out");
    //   top_canvas_scale -= e.deltaY * 2;
    // }
  const c = heatmapRef.current;
  const rect = c.getBoundingClientRect()
  const heatmap_width = rect.width;
  const mouse_xcor = e.clientX - rect.left;
  const mouse_ycor = e.clientY - rect.top;

 
  setIsDown(prev => false); // just to make sure, we are not panning while zooming
  //console.log("mouse xcor_point = " +mouse_xcor);
  //console.log("mouse_ycor " + mouse_ycor);
  if (mouse_xcor > 1200 || mouse_xcor < 0 || mouse_ycor > 200 || mouse_ycor < 0 )  // heatmap boundaries;
  {
    return;
  }
  e.preventDefault(); // so that it doesn't scroll while zooming
      // to limit the canvas re renderings to roughly 30 fps
      const cur_time = Date.now();
      if (cur_time - prevTime < 32) // 1000/40 = 25 fps
      {
        // console.log("new_time = "+  String(cur_time - prevTime));
        return;
      }
      // console.log("prev_tiem O= " + prevTime);
      // console.log("current time = " + cur_time);
      // console.log("diff = " + String(cur_time - prevTime));
      setPrevTime(prev => cur_time);
  
  //top_canvas_scale -= (e.deltaY/120); // zoom in if deltaY < 0 , zoom out if deltaY > 0
  // console.log("topCanvasScalePrev_in zoom = " + top_canvas_scale_prev_ref.current); //1
  //{scale:1,originX:0}
  // const canvas_scale_prev = canvas_scale_and_originX_ref.current.scale; // value of zoom before scroll event
  // const canvas_originX_prev = canvas_scale_and_originX_ref.current.originX;
  
  const canvas_scale_prev = canvas_scale_and_originX.scale; // value of zoom before scroll event
  const canvas_originX_prev = canvas_scale_and_originX.originX;


  // console.log("originX prev = ")
  let canvas_scale_next = (1 - (e.deltaY/180)) * canvas_scale_prev; //new value of zoom after scroll
  canvas_scale_next = Math.min(Math.max(1, canvas_scale_next), 64);
  const scalechange = canvas_scale_next / canvas_scale_prev; // 

  let real_xcor = canvas_originX_prev + (mouse_xcor/canvas_scale_prev);; // real x coordinate of the mouse pointer, this line is reused in tooltip function
    // real coordinate of current mouse point;
  // console.log("mouse_xcor in drawheatmap " + mouse_xcor);
  // console.log("real Xcord = " + real_xcor);
  // console.log("realxcor = + " + real_xcor + " scalechange = " + scalechange + " canvas_originX_prev =  " + canvas_originX_prev);
  let canvas_originX_next = Math.max( (real_xcor - ((real_xcor - canvas_originX_prev)/scalechange)), 0); // so that it doesn't become smaller than 0
  canvas_originX_next = Math.min(canvas_originX_next,(heatmap_width - heatmap_width/canvas_scale_next)) // so that heatmap new originX isn't too large, (start and end is constant)

  // canvas_scale_and_originX_ref.current.scale = canvas_scale_next;
  // canvas_scale_and_originX_ref.current.originX = canvas_originX_next;
  setCanvasScaleAndOriginX2(prev => {
    return (  
      {scale: canvas_scale_next ,originX: canvas_originX_next }
    )
    } );

  
}

  const switchTool = (e,prediction_tool_parameters) => {
    e.preventDefault();
    // setCurrentPredictionTool(() => prediction_tool);
    setCurrentPredictionToolParameters(prev => prediction_tool_parameters )
  }
  // const x = notes.map((note) => {
  //   // what should its type be
  //   // buggy onclick function or unnecessary renders; because onclicl function needs to change;
  //   console.log("222");

  //   return (
  //     <li style={{ margin: "15px 0px" }} key={note.id}>
  //       <div
  //         style={{ border: "solid", width: "20em" }}
  //         onClick={() => {
  //           console.log("click");
  //           handleSideBarNoteClick(note);
  //         }}
  //       >
  //         <span> Data = {note.data} </span>
  //         <span> Edit Date = {note.last_edit_date}</span>
  //       </div>
  //     </li>
  //   );
  

    return(
        <>
            <h1>
                {protein_name}
            </h1>
            
            <div > {/* style={{width:1400 , height:900,overflow:"scroll"  }}*/}
                <div > 
                  <button
                    onClick={helperConsoleLogger}
                  > logger helper
                  </button>
                  <button
                    onClick={(e) => switchTool(e, polyphen2_parameters)}
                  >
                    Polyphen2
                  </button>
                  <button
                    onClick={(e) => switchTool(e, sift_parameters)}
                  >
                    Sift
                  </button>
                  <div style={{display:'flex',gap:'30px', justifyContent:'flex-end', marginRight: '50px'}}>  
                    <canvas id="color_ranges_legend" ref={colorRangesLegendRef} height={"85"} 
                    width={currentPredictionToolParameters.score_ranges.length * number_of_colors * 6}  > </canvas>
                  </div>
                  <div> Current tool : {currentPredictionToolParameters.toolname}</div>
                  {/* <button
                    onClick={scaleTest}
                  > scale tester</button> */}
                  

                  <br/><br/>

                  {/* onClick={(e) => console.log(e.clientX + " " + e.clientY)} */}
                  <div id="asds" style={{ width:1400, height:300 , position: "relative"}}> 
                      <canvas  id="canvas1" ref={heatmapRef} style = {{position:"absolute",top:"40px", left:"120px"}} height={"270"} width={"1200"} 
                        // onClick={(e) => console.log("asfasfasfasfs")}
                        // onclick or other functions don't work here as the topmost layers is the canvas below
                      >
                      </canvas>
                      
                      <canvas ref={aminoAcidLegendRef} style={{position:"absolute",top:"40px", left:"0px"}} height = {"300"} width={"120"}>
                      </canvas>

                      <canvas  id="2" ref={tooltipRef}  style = {{position:"absolute",top:"0", left:"120"}} height={"350"} width={"1800"} 
                        // onClick = {clickLogger} 
                        // onWheel={wheelZoom} added event listener in UseEffect, because "Unable to preventDefault inside passive event listener invocation."
                        onMouseMove = {(e) => drawTooltipOrPan2(e,currentPredictionToolParameters)}
                        onMouseDown = {(e) => onMouseDownHelper(e)}
                        onMouseUp= {(e) => onMouseUpHelper(e)}
                        onDoubleClick= {(e) => setCanvasScaleAndOriginX2({scale:1, originX:0})} 
                        // check if double click works fine later;
                        
                      >
                      </canvas>
                      
                  </div>
                </div>
                <h5 style={{textAlign:'center', marginBottom:'2px'}}> current visible window: </h5>
                <canvas id="current_view_window" ref={currentviewWindowRef} height={"30"} width={"1250"}
                 style= {{marginLeft:'120px'}}  > </canvas>

                <div style={{width:1350, height:100}}>
                    <h1>
                        summary :
                    </h1>
                    
                      
                    
                </div>
                
            </div>
        
        
        
        </>


    )

}
export default ProteinPage;
