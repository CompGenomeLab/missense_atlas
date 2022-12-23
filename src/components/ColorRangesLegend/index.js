import React, { useRef,useState,useEffect } from "react";
import { number_of_colors } from "../../config/config";

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
      const width_vw = currentPredictionToolParameters.score_ranges.length * 10;
      const vw_string = String(width_vw) + "vw";
      c.style.width = "calc("+ vw_string + " + 50px)";
      // width is dynamic; based on predicion tool

      const color_ranges_legend_rect = c.getBoundingClientRect();
      const h = color_ranges_legend_rect.height; // is always the same
      c.style.height = h + "px";
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
      const step_size = (w-50)/(((number_of_colors + 1) * currentPredictionToolParameters.score_ranges.length) + 1 ) ;
      // w = 500; 450/(30*3) = 5, 
      // ctx.fillRect(0,h/4,w,h/2);
      let current_x = 25;
      ctx.fillStyle = "black";
      ctx.fillRect(current_x, h / 4, Math.ceil(step_size) + 1, h / 2); //(x: number, y: number, w: number, h: number): void
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText(
        currentPredictionToolParameters.score_ranges[0].start.toFixed(2),
        current_x,
        15,
        50
      );
      current_x += step_size;

      for (let i = 0; i < currentPredictionToolParameters.score_ranges.length; i++) {
        // i = 0,1
        for (let j = 0; j < color_lists_array[i].length; j++) {
          ctx.fillStyle = color_lists_array[i][j];
          ctx.fillRect(current_x, h / 4, Math.ceil(step_size) + 1  , h / 2);
          current_x += step_size;
          if (j === Math.floor(color_lists_array[i].length / 2)) {
            // middle element
            ctx.fillText(
              currentPredictionToolParameters.score_ranges[i].risk_assessment,
              current_x,
              15,
              (number_of_colors * step_size - 50)
            ); // 30 = number of colors
          }
         
          // normal color line;
         
        }
        // empty black line
        ctx.fillStyle = "black";
        ctx.fillRect(current_x, h / 4, step_size, h / 2); // last rect, won't use Math.ceil()
        // in previous rects we deliberately draw a bit more than enough to make sure there aren't any gaps between them;
        current_x += step_size;
        ctx.fillText(
          currentPredictionToolParameters.score_ranges[i].end.toFixed(2),
          current_x,
          15,
          50
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


  return (
    <canvas
      id="color_ranges_legend"
      ref={colorRangesLegendRef}
      height={"85"}
      style={{ width: "calc(30vw + 50px)", height: "85px" }}
    ></canvas>
  );
};

export default ColorRangesLegend;