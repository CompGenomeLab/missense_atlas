import React, { useRef,useState,useEffect } from "react";
import { number_of_colors,colorRangesLegendRangeWidthCoef,heatmapCellHeight, colorRangesLegendNumRows } from "../../config/config";

const ColorRangesLegend = ({currentPredictionToolParameters, color_lists_array}) => {

  const colorRangesLegendRef = useRef(null);
  const [resizeCount,setResizeCount] = useState(0);

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
      const ctx = c.getContext("2d");
      // width is dynamic; based on predicion tool
      const x_buffer = 6
      const x_buffer_px = window.innerWidth/100 * x_buffer; // in pixels
      const y_buffer = window.innerHeight/100 * heatmapCellHeight * 1.4;
      const width_vw = (currentPredictionToolParameters.score_ranges.length * colorRangesLegendRangeWidthCoef) + x_buffer; // 2vw is the x_buffer for writing scores
      const vw_string = String(width_vw) + "vw";
      c.style.width = vw_string;
      // c.style.width = "calc("+ vw_string + " + 60px)";


      const color_ranges_legend_rect = c.getBoundingClientRect();
      const h = color_ranges_legend_rect.height; // is always the same
      // const w = color_ranges_legend_rect.width;
      // const h = color_ranges_legend_rect.height;
      const w = color_ranges_legend_rect.width;
      // console.log("w= " + w );
      // const w =
      //   currentPredictionToolParameters.score_ranges.length *
      //     (number_of_colors + 1) *
      //     step_size +
      //   50; // 25 from beggining and end to make sure last number isn't cut short
      // *31, to account for black lines , + 15 to account for current_x starting from 15, and + 15 to make sure last number isn't cut short;
      const ratio = window.devicePixelRatio;
      c.width = w * ratio;
      c.height = h * ratio;
      ctx.scale(ratio, ratio);
      // buffer for 50, and number_of_rectangles (including black divider ones);
      const step_size = (w - x_buffer_px)/(((number_of_colors + 1) * currentPredictionToolParameters.score_ranges.length) + 1 ) ;
      // w = 500; 450/(30*3) = 5, 
      // ctx.fillRect(0,h/4,w,h/2);
      let current_x = x_buffer_px/2;
      ctx.fillStyle = "black";
      ctx.fillRect(current_x, y_buffer, Math.ceil(step_size) + 1, h); //(x: number, y: number, w: number, h: number): void
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom"
      let font_size = (window.innerHeight/ 100 *  heatmapCellHeight * 1.2); //16
      ctx.font = String(font_size) + "px Arial" ;
      ctx.fillText(
        currentPredictionToolParameters.score_ranges[0].start.toFixed(2),
        current_x,
        y_buffer
      );
      current_x += step_size;

      for (let i = 0; i < currentPredictionToolParameters.score_ranges.length; i++) {
        // i = 0,1
        for (let j = 0; j < color_lists_array[i].length; j++) {
          ctx.fillStyle = color_lists_array[i][j];
          ctx.fillRect(current_x, y_buffer , Math.ceil(step_size) + 1  , h); //current_x, h / 4, Math.ceil(step_size) + 1  , h / 2
          current_x += step_size;
          if (j === Math.floor(color_lists_array[i].length / 2)) {
            // middle element
            ctx.fillText(
              currentPredictionToolParameters.score_ranges[i].risk_assessment,
              current_x,
              y_buffer,
              (number_of_colors * step_size - x_buffer_px/2)
            ); // 30 = number of colors
          }
         
          // normal color line;
         
        }
        // empty black line
        ctx.fillStyle = "black";
        ctx.fillRect(current_x, y_buffer, step_size, h); // last rect, won't use Math.ceil()
        // in previous rects we deliberately draw a bit more than enough to make sure there aren't any gaps between them;
        current_x += step_size;
        ctx.fillText(
          currentPredictionToolParameters.score_ranges[i].end.toFixed(2),
          current_x,
          y_buffer
        );
      }
      
      return;
    };
    drawColorRangesLegend();
  }, [currentPredictionToolParameters, color_lists_array,resizeCount]); // resizeCount Added to drawColorRangesLegend

  useEffect(() => { // redraw on resize
    const handleResize = () => { // reset canvasScaleOrigin reference and draw in roughly 30 fps
    
      setResizeCount(prev => prev+1); // FORCE RE RENDER
    }
    window.addEventListener("resize" , handleResize )
    // console.log(resizeCount);
    return () => {window.removeEventListener("resize" , handleResize)}; // cleanup

},[resizeCount]) // draw heatmap again on resize //drawHeatmap2

const colorRangesLegendHeightJSX = String(heatmapCellHeight * (colorRangesLegendNumRows + 1.4))+ 'vh' // +1 is for writing scores (y_buffer)

  return (
    <canvas
      id="color_ranges_legend"
      ref={colorRangesLegendRef}
      height={"85"}
      style={{ width: "1px", height: colorRangesLegendHeightJSX }} // width is calculated based on how many score ranges the current tool has
    ></canvas>
  );
};

export default ColorRangesLegend;