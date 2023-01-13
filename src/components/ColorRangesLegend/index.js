import React, { useRef,useState,useEffect } from "react";
import { number_of_colors,colorRangesLegendRangeWidthCoef,heatmapCellHeight, colorRangesLegendNumRows } from "../../config/config";

const ColorRangesLegend = ({currentPredictionToolParameters, color_lists_array}) => {

  const colorRangesLegendRef = useRef(null);
  const [resizeCount,setResizeCount] = useState(0);
  let font_size = 16;  // (window.innerHeight/ 100 *  heatmapCellHeight * heatmapTooltipFontMultiplier); //16
  if (window.screen.height > 1920){
    font_size = 24;
  }
  const y_buffer_px = font_size * 2.2;
  // let documentTotalHeight = document.body.scrollHeight; // force rerender when proteinmetadata loads
  useEffect(() => {
    // draw color ranges legend
    const drawColorRangesLegend = () => {
      // can become a component; input = toolparams , colorlist
      // console.log("ranges redraw");
       // width of each color in the gradient;
      const c = colorRangesLegendRef.current;
      if (!c) {
        return;
      }
      
      // width is dynamic; based on predicion tool
      const x_buffer = 3; //6
      const x_buffer_px = font_size * x_buffer //window.innerWidth/100 * x_buffer; // in pixels
      // const width_vw = (currentPredictionToolParameters.score_ranges.length * colorRangesLegendRangeWidthCoef) + x_buffer; // 2vw is the x_buffer for writing scores
      // const vw_string = String(width_vw) + "vw";
      const width_vw = String(currentPredictionToolParameters.score_ranges.length * colorRangesLegendRangeWidthCoef) + "vw" ; // 2vw is the x_buffer for writing scores
      const vw_string = "calc(" + width_vw + " + " + x_buffer_px + "px)" ;
      c.style.width = vw_string;

      const color_ranges_legend_rect = c.getBoundingClientRect();
      const h = color_ranges_legend_rect.height; // is always the same
      const w = color_ranges_legend_rect.width;
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;

      const ctx = c.getContext("2d");
      ctx.scale(ratio, ratio);
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom"
      ctx.font = String(font_size) + "px Arial" ;
      // buffer for 50, and number_of_rectangles (including black divider ones);
      const step_size = (w - x_buffer_px)/(((number_of_colors + 1) * currentPredictionToolParameters.score_ranges.length) + 1 ) ;
      // w = 500; 450/(30*3) = 5, 
      // ctx.fillRect(0,h/4,w,h/2);
      let current_x = x_buffer_px/2;
      ctx.fillStyle = "black";       
      ctx.fillRect(current_x, Math.floor(y_buffer_px/2), Math.ceil(step_size) + 1, h); // draw the divider
      ctx.fillStyle = "white";
      ctx.fillRect(current_x + step_size, Math.floor(y_buffer_px/2) , w, h) // clear the overflow by using all the height;

      ctx.fillStyle = "black";  // returning fillstyle to p

      ctx.fillText(
        currentPredictionToolParameters.score_ranges[0].start.toFixed(2),
        current_x,
        y_buffer_px/2
      );
      current_x += step_size;

      for (let i = 0; i < currentPredictionToolParameters.score_ranges.length; i++) {
        // i = 0,1
        for (let j = 0; j < color_lists_array[i].length; j++) {
          ctx.fillStyle = color_lists_array[i][j];
          ctx.fillRect(current_x, y_buffer_px , Math.ceil(step_size) + 1  , h); //current_x, h / 4, Math.ceil(step_size) + 1  , h / 2
          current_x += step_size;
          if (j === Math.floor(color_lists_array[i].length / 2)) {
            // middle element
            ctx.fillText(
              currentPredictionToolParameters.score_ranges[i].risk_assessment,
              current_x,
              y_buffer_px,
              (number_of_colors * step_size - x_buffer_px/4) // max width of text x_buffer_px /4, so that it doesn't get very crowded
            ); // 30 = number of colors
          }
        }
        ctx.fillStyle = "black";       
        ctx.fillRect(current_x, Math.floor(y_buffer_px/2), Math.ceil(step_size) + 1, h); // draw the divider
        ctx.fillStyle = "white";
        ctx.fillRect(current_x + step_size, Math.floor(y_buffer_px/2) , w, h) // clear the overflow by using all the height;
        ctx.fillStyle = "black"; 
        // in previous rects we deliberately draw a bit more than enough to make sure there aren't any gaps between them;
        current_x += step_size;
        ctx.fillText(
          currentPredictionToolParameters.score_ranges[i].end.toFixed(2),
          current_x,
          y_buffer_px/2
        );
      }
      // if any of the fillText of risk assessments is too large, remove both the scores and risk assesments from the top;
      let legend_text_flag = true;
      let num_score_ranges = currentPredictionToolParameters.score_ranges.length;
      const basis_text = "0.00"
      const range_px = (w - x_buffer_px)/num_score_ranges
      if ((ctx.measureText(basis_text).width ) >  (range_px / 3) )
      {
        // console.log(basis_text);
        // console.log(ctx.measureText(cur_range_risk_assessment).width);
        // console.log(w-x_buffer_px)
        legend_text_flag = false;
      }
      
      if (legend_text_flag === false){
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,w,y_buffer_px);
      }



      return;
    };
    drawColorRangesLegend();
  }, [currentPredictionToolParameters, color_lists_array,resizeCount,font_size,y_buffer_px]); // resizeCount Added to drawColorRangesLegend

  useEffect(() => { // redraw on resize
    const handleResize = () => { // reset canvasScaleOrigin reference and draw in roughly 30 fps
      console.log('resized');
      setResizeCount(prev => prev+1); // FORCE RE RENDER
    }
    window.addEventListener("resize" , handleResize )
    // console.log(resizeCount);
    return () => {window.removeEventListener("resize" , handleResize)}; // cleanup

},[resizeCount]) // draw heatmap again on resize //drawHeatmap2

const height_vh = String(heatmapCellHeight * (colorRangesLegendNumRows))+ 'vh'
const colorRangesLegendHeightJSX = "calc(" + height_vh + " + " + y_buffer_px + "px)" // +1 is for writing scores (y_buffer)
  return (
    // margin right 1 vw from proteinPage, xbuffer_px/2 , to make it align with heatmap we need 10vw - (10px )
    // to account for scrollbar, because parent's margin is 1vw each side, parents size is 100% - 2vw; // scrollbarWidth = 100vw - 100% of the document
    // parents width is 100%(document) - 2vw, then 98 vw - parents width => 100vw - 100%(document)
    // if we use 100% in calc, it means the width of the parent (100% of document - 2vw), so 98vw - 100% => scrollbars width
    //  'calc(6vw - 10px - scrollbarWidth)' 
    // this calculation will change,
    <canvas
      id="color_ranges_legend"
      ref={colorRangesLegendRef}
      height={"85"}
      style={{ width: "1px", height: colorRangesLegendHeightJSX, marginRight:'calc(6vw - 10px - 98vw + 100%)' }} // width is calculated based on how many score ranges the current tool has
    ></canvas>
  );
};

export default ColorRangesLegend;

 // if (i !== (currentPredictionToolParameters.score_ranges.length -1) )
        // {
        //   ctx.fillRect(current_x, y_buffer_px/2, Math.ceil(step_size) + 1, h);
        //   ctx.fillStyle = "white";
        //   ctx.fillRect(current_x + step_size, y_buffer_px/2, w, y_buffer_px/2) // removing the overflowing blackness from Math.ceil(step_size)
        //   ctx.fillStyle = "black"; // returning the fillstyle to previous after cleaning up the overflow
        // }
        // else{ // last line
        //   // ctx.fillStyle = "white";
        //   ctx.fillRect(current_x, y_buffer_px/2, Math.ceil(step_size) + 1, h);
        //   ctx.fillStyle = "white";
        //   ctx.fillRect(current_x + step_size, y_buffer_px/2, w, h) // clear the overflow by using all the height;
        //   ctx.fillStyle = "black"; // returning the fillstyle to previous after cleaning up the overflow
        // }