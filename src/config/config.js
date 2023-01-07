
export const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

export const number_of_colors = 90; // legend colors
export const color_mix_mode = "lch";
export const database_url = "https://10.3.2.13:8080/database/"; // database base url

// heatmap
//aminoacidlegend colorrangeslegend and heatmap fonts are tied to heatmapCellHeight
export const heatmapCellHeight = 1.6 // "2vh" will turn into vh in heatmap component;
export const currentViewWindowNumRows = 2.5;
export const colorRangesLegendNumRows = 2.5;

export const heatmapSpaceBtwnSummaryNumRows = 2.5;
export const heatmapSummaryNumRows = 3.2;
export const heatmapAminoAcidCharactersNumRows = 2;
export const heatmapTotalNumRows = 20 + heatmapSpaceBtwnSummaryNumRows + heatmapSummaryNumRows + heatmapAminoAcidCharactersNumRows; // 20 cells rows for each aa + summary + space between heatmap and summary, (previous 2 rows)
export const heatmapWidth = "80vw"; 
export const aminoAcidLegendWidth = "10vw";
export const heatmapTooltipFontMultiplier = 1.35;
export const max_zoom_visible_aa_count = 10; // to determine maximum zoom value
export const aa_position_notches_threshold = 9; // while drawing positions of the heatmap if step size of positions are smaller than threshold, draw small notches between the positions (like a ruler (cetvel)) 
export const aa_visible_width_ratio = 0.8; // between 1 and 0; if size of aminoacid character is smaller than ratio * cellwidth, then draw;

// export const aa_visible_threshold = 999; // the threshold under which aminoacids become visible
// may not need this, as it can be based on if text fits,

// for feature lane
export const laneHeight = 5; // will be 5vh
export const laneWidth = '80vw'; // equal to heatmapWidth;
//https://coolors.co/palette/001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226
// const cp1 = ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"];
// //https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
// const cp2 = ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff"];
// //https://coolors.co/palette/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1
// const cp3 = ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"];
// export const c_palettes = [cp1,cp2,cp3];
// next 3 are made from cp3, one of them is reversed, other has mixed first and second halves, last one is reversed and mixed halves;
const testcp3_1 = ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"];
const testcp3_2 = ["#277da1", "#577590", "#4d908e", "#43aa8b", "#90be6d", "#f9c74f", "#f9844a", "#f8961e", "#f3722c", "#f94144"];
const testcp3_3 = ["#90be6d","#43aa8b","#4d908e","#577590","#277da1","#f94144","#f3722c","#f8961e","#f9844a","#f9c74f"];
const testcp3_4 = ["#f9c74f", "#f9844a", "#f8961e", "#f3722c", "#f94144","#277da1", "#577590", "#4d908e", "#43aa8b", "#90be6d"];
export const c_palettes = [testcp3_1, testcp3_2, testcp3_3, testcp3_4];
export const top_margin_sl_coef= 4;
export const top_margin_ml_coef = 8;
export const sub_lane_divider_coef = 4; // used to be divided by top margin, now divided by sub_lane height;
// features tooltip
// export const filtered_categories = ['category','sub_lane'];  // sub_lane is calculated by us;

export const colorRangesLegendRangeWidthCoef = 10; // each range will be this variable 'vw';
// export const colorRangesLegendHeight = '85px';

// prediction tool parameters
// The substitutions with scores below and above this threshold (0.679) were assumed to be pathogenic and neutral,
//start_color: "#ffa500",
      // // start_color: "#fcedaa",
      // end_color: "#981e2a",
      // start_color: "#2c663c",
      // end_color: "#ffa500",


export const tools_negative_synonyms = ["pathogenic","deleterious","possibly damaging","confidently damaging"];
export const tools_positive_synonyms = ["neutral", "benign"];

const phactboost_parameters = {
  toolname: "PHACT Boost",
  toolname_json: "phactboost",
  score_ranges: [
    {
      start: 0.0,
      end: 0.35,
      risk_assessment: "pathogenic",
      start_color: "#981e2a",
      end_color: "#ffa500",
      // start_color: "#981e2a",
      // end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.35,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#ffa500",
      end_color: "#2c663c",
      // start_color: "#fcedaa",
      // end_color: "#2c663c",
      gradient_ratio:0.5
    },
  ],
  ref_value: 1,
}
const phact_parameters = {
  toolname: "PHACT",
  toolname_json: "phact",
  score_ranges: [
    {
      start: 0.0,
      end: 0.679,
      risk_assessment: "pathogenic",
      start_color: "#981e2a",
      end_color: "#ffa500",
      // start_color: "#981e2a",
      // end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.679,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#ffa500",
      end_color: "#2c663c",
      // start_color: "#fcedaa",
      // end_color: "#2c663c",
      gradient_ratio:0.5
    },
  ],
  ref_value: 1,
}

const lists2_parameters = {
  toolname: "LIST-S2", // shown to the user
  toolname_json: "lists2", // field name in the api response json.
  score_ranges: [
    {
      start: 0.0,
      end: 0.85,
      risk_assessment: "benign",
      start_color: "#2c663c",
      end_color: "#ffa500",
      gradient_ratio:0.5 // between 0 and 1, if 0.5 => then the middle of the gradient is the 50 50 mix of start and end
      // end_color: "#fcedaa",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "deleterious",
      start_color: "#ffa500",
      // start_color: "#fcedaa",
      end_color: "#981e2a",
      gradient_ratio:0.5

    },
  ],
  ref_value: 0,
};
const polyphen2_humdiv_parameters = {
  toolname: "Polyphen-2 (Humdiv)",
  toolname_json: "pph_humdiv", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
      gradient_ratio:0.5

    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
      gradient_ratio:0.5
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
      gradient_ratio:0.5
    },
  ],
  ref_value: 0,
};
const polyphen2_humvar_parameters = {
  toolname: "Polyphen-2 (Humvar)",
  toolname_json: "pph_humvar", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
      gradient_ratio:0.5

    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
      gradient_ratio:0.5

    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
      gradient_ratio:0.5

    },
  ],
  ref_value: 0,
};
const sift_swissprot_parameters = {
  toolname: "Sift (Swissprot) ",
  toolname_json: "sift4g_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gradient_ratio:0.5

    },
  ],
  ref_value: 1,
};
const sift_trembl_parameters = {
  toolname: "Sift (Trembl)",
  toolname_json: "sift4g_sp_trembl",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gradient_ratio:0.5

    },
  ],
  ref_value: 1,
};
const efin_humdiv_parameters= {
  toolname: "Efin (Humdiv)",
  toolname_json: "efin_humdiv",
  score_ranges: [
    {
      start: 0.0,
      end: 0.28,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.28,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gradient_ratio:0.5

    },
  ],
  ref_value: 1,
};
const efin_swissprot_parameters = {
  toolname: "Efin (Swissprot)",
  toolname_json: "efin_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.60,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gradient_ratio:0.5

    },
    {
      start: 0.60,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gradient_ratio:0.5

    },
  ],
  ref_value: 1,
};
const provean_parameters = { // change based on array;
  toolname: "Provean",
  toolname_json: "provean",
  score_ranges: [
    {
      start: -40.00, // minimum value of the scores will be used instead
      end: -2.50,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gradient_ratio:0.5
    },
    {
      start: -2.50,
      end: 15, // maximum value of the scores will be used instead
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gradient_ratio:0.5
    },
  ],
  ref_value : 0
}

const aggregator_parameters = {
  toolname: "Aggregator",
  toolname_json: "AggregatorLocal",
  score_ranges: [
    {
      start: 0.0,
      end: 1, // is assigend to number of tools in the button
      risk_assessment: "deleterious",
      start_color: "green",
      end_color: "red",
      gradient_ratio:0.5
    }
  ]
  // ref_value: 1, no ref value needed, as it is not like other tools
}

export const all_prediction_tools_array = [
  aggregator_parameters,
  phact_parameters,
  phactboost_parameters,
  lists2_parameters,
  polyphen2_humdiv_parameters,
  polyphen2_humvar_parameters,
  sift_swissprot_parameters,
  sift_trembl_parameters,
  efin_humdiv_parameters,
  efin_swissprot_parameters,
  provean_parameters,
];