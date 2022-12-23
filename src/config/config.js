
export const aminoacid_ordering = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'];

export const number_of_colors = 60; // legend colors
export const database_url = "http://10.3.2.13:8080/database/"; // database base url


// for feature lane
export const lane_height = '5vh';
export const lane_width = '80vw';
// coef = coefficient
export const top_margin_sl_coef= 4;
export const top_margin_ml_coef = 8;
export const sub_lane_divider_coef = 2;
// features tooltip
export const filtered_categories = ['category','sub_lane'];  // sub_lane is calculated by us;





// prediction tool parameters
const lists2_parameters = {
  toolname: "LIST-S2", // shown to the user
  //toolname_api: "lists2", // api url, example: /database/lists2/{md5sum} // deprecated
  toolname_json: "lists2", // field name in the api response json.
  score_ranges: [
    {
      start: 0.0,
      end: 0.85,
      risk_assessment: "benign",
      start_color: "#2c663c",
      end_color: "#ffa500",
      gamma:1
      // end_color: "#fcedaa",
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "deleterious",
      start_color: "#ffa500",
      // start_color: "#fcedaa",
      end_color: "#981e2a",
      gamma:1

    },
  ],
  ref_value: 0,
};
const polyphen2_humdiv_parameters = {
  toolname: "Polyphen-2 (Humdiv)",
 // toolname_api: "polyphen", // used in the api url
  toolname_json: "pph_humdiv", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
      gamma:1

    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
      gamma:1
    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
      gamma:1
    },
  ],
  ref_value: 0,
};
const polyphen2_humvar_parameters = {
  toolname: "Polyphen-2 (Humvar)",
  //toolname_api: "polyphen", // used in the api url
  toolname_json: "pph_humvar", // used in the return value of the all_scores api
  score_ranges: [
    {
      start: 0.0,
      end: 0.15,
      risk_assessment: " benign",
      start_color: "#2c663c",
      end_color: "#d3d3d3",
      gamma:1

    },
    {
      start: 0.15,
      end: 0.85,
      risk_assessment: "possibly damaging",
      start_color: "#d3d3d3",
      end_color: "#ffa500",
      gamma:1

    },
    {
      start: 0.85,
      end: 1.0,
      risk_assessment: "confidently damaging",
      start_color: "#ffa500",
      end_color: "#981e2a",
      gamma:1

    },
  ],
  ref_value: 0,
};
const sift_swissprot_parameters = {
  toolname: "Sift (Swissprot) ",
  //toolname_api: "sift",
  toolname_json: "sift4g_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gamma:1

    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gamma:1

    },
  ],
  ref_value: 1,
};
const sift_trembl_parameters = {
  toolname: "Sift (Trembl)",
  //toolname_api: "sift",
  toolname_json: "sift4g_sp_trembl",
  score_ranges: [
    {
      start: 0.0,
      end: 0.05,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gamma:1

    },
    {
      start: 0.05,
      end: 1.0,
      risk_assessment: "benign",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gamma:1

    },
  ],
  ref_value: 1,
};
const efin_humdiv_parameters= {
  toolname: "Efin (Humdiv)",
  //toolname_api: "sift",
  toolname_json: "efin_humdiv",
  score_ranges: [
    {
      start: 0.0,
      end: 0.28,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gamma:1

    },
    {
      start: 0.28,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gamma:1

    },
  ],
  ref_value: 1,
};
const efin_swissprot_parameters = {
  toolname: "Efin (Swissprot)",
  //toolname_api: "sift",
  toolname_json: "efin_swissprot",
  score_ranges: [
    {
      start: 0.0,
      end: 0.60,
      risk_assessment: "deleterious",
      start_color: "#981e2a",
      end_color: "#fcedaa",
      gamma:1

    },
    {
      start: 0.60,
      end: 1.0,
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gamma:1

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
      gamma:1
    },
    {
      start: -2.50,
      end: 15, // maximum value of the scores will be used instead
      risk_assessment: "neutral",
      start_color: "#fcedaa",
      end_color: "#2c663c",
      gamma:1
    },
  ],
  ref_value : 0
}

export const all_prediction_tools_array = [
  lists2_parameters,
  polyphen2_humdiv_parameters,
  polyphen2_humvar_parameters,
  sift_swissprot_parameters,
  sift_trembl_parameters,
  efin_humdiv_parameters,
  efin_swissprot_parameters,
  provean_parameters
];