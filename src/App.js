// import logo from './logo.svg';
import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
// import HeatMapSvg from './components/HeatMapSvg';
// import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
// import { useRef, useEffect } from 'react';
import HeatMap from './components/HeatMap';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import HomePage from './routes/HomePage.js'
import ProteinPage from './routes/ProteinPage.js'



const data = [
  {
    "id": "Japan",
    "data": [
      {
        "x": "Train",
        "y": 61354
      },
      {
        "x": "Subway",
        "y": -97044
      },
      {
        "x": "Bus",
        "y": -43071
      },
      {
        "x": "Car",
        "y": 43698
      },
      {
        "x": "Boat",
        "y": 23923
      },
      {
        "x": "Moto",
        "y": -17541
      },
      {
        "x": "Moped",
        "y": -9280
      },
      {
        "x": "Bicycle",
        "y": -36335
      },
      {
        "x": "Others",
        "y": -74093
      }
    ]
  },
  {
    "id": "France",
    "data": [
      {
        "x": "Train",
        "y": -33173
      },
      {
        "x": "Subway",
        "y": -4757
      },
      {
        "x": "Bus",
        "y": 65950
      },
      {
        "x": "Car",
        "y": -72301
      },
      {
        "x": "Boat",
        "y": -91173
      },
      {
        "x": "Moto",
        "y": 90269
      },
      {
        "x": "Moped",
        "y": -40658
      },
      {
        "x": "Bicycle",
        "y": -41724
      },
      {
        "x": "Others",
        "y": -28996
      }
    ]
  },
  {
    "id": "US",
    "data": [
      {
        "x": "Train",
        "y": -15154
      },
      {
        "x": "Subway",
        "y": -84724
      },
      {
        "x": "Bus",
        "y": -62725
      },
      {
        "x": "Car",
        "y": 31921
      },
      {
        "x": "Boat",
        "y": 18033
      },
      {
        "x": "Moto",
        "y": 90292
      },
      {
        "x": "Moped",
        "y": 29992
      },
      {
        "x": "Bicycle",
        "y": 80697
      },
      {
        "x": "Others",
        "y": 32450
      }
    ]
  },
  {
    "id": "Germany",
    "data": [
      {
        "x": "Train",
        "y": -87482
      },
      {
        "x": "Subway",
        "y": 21127
      },
      {
        "x": "Bus",
        "y": -18767
      },
      {
        "x": "Car",
        "y": -6037
      },
      {
        "x": "Boat",
        "y": 75091
      },
      {
        "x": "Moto",
        "y": -22187
      },
      {
        "x": "Moped",
        "y": 9336
      },
      {
        "x": "Bicycle",
        "y": -24735
      },
      {
        "x": "Others",
        "y": -66973
      }
    ]
  },
  {
    "id": "Norway",
    "data": [
      {
        "x": "Train",
        "y": 19179
      },
      {
        "x": "Subway",
        "y": -65049
      },
      {
        "x": "Bus",
        "y": -61843
      },
      {
        "x": "Car",
        "y": 24129
      },
      {
        "x": "Boat",
        "y": 22890
      },
      {
        "x": "Moto",
        "y": 57259
      },
      {
        "x": "Moped",
        "y": -208
      },
      {
        "x": "Bicycle",
        "y": 7108
      },
      {
        "x": "Others",
        "y": 81123
      }
    ]
  },
  {
    "id": "Iceland",
    "data": [
      {
        "x": "Train",
        "y": 97812
      },
      {
        "x": "Subway",
        "y": -54865
      },
      {
        "x": "Bus",
        "y": -48994
      },
      {
        "x": "Car",
        "y": -42274
      },
      {
        "x": "Boat",
        "y": 43889
      },
      {
        "x": "Moto",
        "y": 75728
      },
      {
        "x": "Moped",
        "y": -75187
      },
      {
        "x": "Bicycle",
        "y": 85745
      },
      {
        "x": "Others",
        "y": 58052
      }
    ]
  },
  {
    "id": "UK",
    "data": [
      {
        "x": "Train",
        "y": 33777
      },
      {
        "x": "Subway",
        "y": -50416
      },
      {
        "x": "Bus",
        "y": 51967
      },
      {
        "x": "Car",
        "y": 71637
      },
      {
        "x": "Boat",
        "y": -86652
      },
      {
        "x": "Moto",
        "y": -54971
      },
      {
        "x": "Moped",
        "y": 78556
      },
      {
        "x": "Bicycle",
        "y": -29656
      },
      {
        "x": "Others",
        "y": -41490
      }
    ]
  },
  {
    "id": "Vietnam",
    "data": [
      {
        "x": "Train",
        "y": -14433
      },
      {
        "x": "Subway",
        "y": 6596
      },
      {
        "x": "Bus",
        "y": 5541
      },
      {
        "x": "Car",
        "y": -65710
      },
      {
        "x": "Boat",
        "y": 84019
      },
      {
        "x": "Moto",
        "y": 766
      },
      {
        "x": "Moped",
        "y": -28621
      },
      {
        "x": "Bicycle",
        "y": 97557
      },
      {
        "x": "Others",
        "y": -50477
      }
    ]
  }
]




const dummy_data = [
  {
    "id": "Japan",
    "data": [
      {
        "x": "Train",
        "y": 61354
      },
      {
        "x": "Subway",
        "y": -97044
      },
      {
        "x": "Bus",
        "y": -43071
      },
      {
        "x": "Car",
        "y": 43698
      },
      {
        "x": "Boat",
        "y": 23923
      },
      {
        "x": "Moto",
        "y": -17541
      },
      {
        "x": "Moped",
        "y": -9280
      },
      {
        "x": "Bicycle",
        "y": -36335
      },
      {
        "x": "Others",
        "y": -74093
      }
    ]
  },
  {
    "id": "France",
    "data": [
      {
        "x": "Train",
        "y": -33173
      },
      {
        "x": "Subway",
        "y": -4757
      },
      {
        "x": "Bus",
        "y": 65950
      },
      {
        "x": "Car",
        "y": -72301
      },
      {
        "x": "Boat",
        "y": -91173
      },
      {
        "x": "Moto",
        "y": 90269
      },
      {
        "x": "Moped",
        "y": -40658
      },
      {
        "x": "Bicycle",
        "y": -41724
      },
      {
        "x": "Others",
        "y": -28996
      }
    ]
  },
  {
    "id": "US",
    "data": [
      {
        "x": "Train",
        "y": -15154
      },
      {
        "x": "Subway",
        "y": -84724
      },
      {
        "x": "Bus",
        "y": -62725
      },
      {
        "x": "Car",
        "y": 31921
      },
      {
        "x": "Boat",
        "y": 18033
      },
      {
        "x": "Moto",
        "y": 90292
      },
      {
        "x": "Moped",
        "y": 29992
      },
      {
        "x": "Bicycle",
        "y": 80697
      },
      {
        "x": "Others",
        "y": 32450
      }
    ]
  },
  {
    "id": "Germany",
    "data": [
      {
        "x": "Train",
        "y": -87482
      },
      {
        "x": "Subway",
        "y": 21127
      },
      {
        "x": "Bus",
        "y": -18767
      },
      {
        "x": "Car",
        "y": -6037
      },
      {
        "x": "Boat",
        "y": 75091
      },
      {
        "x": "Moto",
        "y": -22187
      },
      {
        "x": "Moped",
        "y": 9336
      },
      {
        "x": "Bicycle",
        "y": -24735
      },
      {
        "x": "Others",
        "y": -66973
      }
    ]
  },
  {
    "id": "Norway",
    "data": [
      {
        "x": "Train",
        "y": 19179
      },
      {
        "x": "Subway",
        "y": -65049
      },
      {
        "x": "Bus",
        "y": -61843
      },
      {
        "x": "Car",
        "y": 24129
      },
      {
        "x": "Boat",
        "y": 22890
      },
      {
        "x": "Moto",
        "y": 57259
      },
      {
        "x": "Moped",
        "y": -208
      },
      {
        "x": "Bicycle",
        "y": 7108
      },
      {
        "x": "Others",
        "y": 81123
      }
    ]
  },
  {
    "id": "Iceland",
    "data": [
      {
        "x": "Train",
        "y": 97812
      },
      {
        "x": "Subway",
        "y": -54865
      },
      {
        "x": "Bus",
        "y": -48994
      },
      {
        "x": "Car",
        "y": -42274
      },
      {
        "x": "Boat",
        "y": 43889
      },
      {
        "x": "Moto",
        "y": 75728
      },
      {
        "x": "Moped",
        "y": -75187
      },
      {
        "x": "Bicycle",
        "y": 85745
      },
      {
        "x": "Others",
        "y": 58052
      }
    ]
  },
  {
    "id": "UK",
    "data": [
      {
        "x": "Train",
        "y": 33777
      },
      {
        "x": "Subway",
        "y": -50416
      },
      {
        "x": "Bus",
        "y": 51967
      },
      {
        "x": "Car",
        "y": 71637
      },
      {
        "x": "Boat",
        "y": -86652
      },
      {
        "x": "Moto",
        "y": -54971
      },
      {
        "x": "Moped",
        "y": 78556
      },
      {
        "x": "Bicycle",
        "y": -29656
      },
      {
        "x": "Others",
        "y": -41490
      }
    ]
  },
  {
    "id": "Vietnam",
    "data": [
      {
        "x": "Train",
        "y": -14433
      },
      {
        "x": "Subway",
        "y": 6596
      },
      {
        "x": "Bus",
        "y": 5541
      },
      {
        "x": "Car",
        "y": -65710
      },
      {
        "x": "Boat",
        "y": 84019
      },
      {
        "x": "Moto",
        "y": 766
      },
      {
        "x": "Moped",
        "y": -28621
      },
      {
        "x": "Bicycle",
        "y": 97557
      },
      {
        "x": "Others",
        "y": -50477
      }
    ]
  }
]

const data2 = [
  {
    "id": "AD",
    "data": [
      {
        "x": "John",
        "y": 32584
      },
      {
        "x": "Raoul",
        "y": 38217
      },
      {
        "x": "Jane",
        "y": -3113
      },
      {
        "x": "Marcel",
        "y": 58973
      },
      {
        "x": "Ibrahim",
        "y": 58652
      },
      {
        "x": "Junko",
        "y": 76970
      },
      {
        "x": "Lyu",
        "y": 17168
      },
      {
        "x": "André",
        "y": -59266
      },
      {
        "x": "Maki",
        "y": 50330
      },
      {
        "x": "Véronique",
        "y": -88289
      },
      {
        "x": "Thibeau",
        "y": -9652
      },
      {
        "x": "Josiane",
        "y": -31062
      },
      {
        "x": "Raphaël",
        "y": -61754
      },
      {
        "x": "Mathéo",
        "y": -17743
      },
      {
        "x": "Margot",
        "y": -61888
      },
      {
        "x": "Hugo",
        "y": 24627
      },
      {
        "x": "Christian",
        "y": 21983
      },
      {
        "x": "Louis",
        "y": -34654
      },
      {
        "x": "Ella",
        "y": 19108
      },
      {
        "x": "Alton",
        "y": -80795
      },
      {
        "x": "Jimmy",
        "y": 93493
      },
      {
        "x": "Guillaume",
        "y": 42290
      },
      {
        "x": "Sébastien",
        "y": -21269
      },
      {
        "x": "Alfred",
        "y": -34304
      },
      {
        "x": "Bon",
        "y": -19280
      },
      {
        "x": "Solange",
        "y": 58849
      },
      {
        "x": "Kendrick",
        "y": -62392
      },
      {
        "x": "Jared",
        "y": -6236
      },
      {
        "x": "Satoko",
        "y": -39093
      },
      {
        "x": "Tomoko",
        "y": -54432
      },
      {
        "x": "Line",
        "y": -26729
      },
      {
        "x": "Delphine",
        "y": 72958
      },
      {
        "x": "Leonard",
        "y": 15851
      },
      {
        "x": "Alphonse",
        "y": -26462
      },
      {
        "x": "Lisa",
        "y": 95223
      },
      {
        "x": "Bart",
        "y": -79249
      },
      {
        "x": "Benjamin",
        "y": 92822
      },
      {
        "x": "Homer",
        "y": -96239
      },
      {
        "x": "Jack",
        "y": -22367
      }
    ]
  },
  {
    "id": "AE",
    "data": [
      {
        "x": "John",
        "y": -69731
      },
      {
        "x": "Raoul",
        "y": -54576
      },
      {
        "x": "Jane",
        "y": -63413
      },
      {
        "x": "Marcel",
        "y": -24546
      },
      {
        "x": "Ibrahim",
        "y": 76372
      },
      {
        "x": "Junko",
        "y": -28663
      },
      {
        "x": "Lyu",
        "y": -55750
      },
      {
        "x": "André",
        "y": 73278
      },
      {
        "x": "Maki",
        "y": 8983
      },
      {
        "x": "Véronique",
        "y": -47581
      },
      {
        "x": "Thibeau",
        "y": 18631
      },
      {
        "x": "Josiane",
        "y": 43233
      },
      {
        "x": "Raphaël",
        "y": 34846
      },
      {
        "x": "Mathéo",
        "y": -71520
      },
      {
        "x": "Margot",
        "y": 14552
      },
      {
        "x": "Hugo",
        "y": 17457
      },
      {
        "x": "Christian",
        "y": -30810
      },
      {
        "x": "Louis",
        "y": -10619
      },
      {
        "x": "Ella",
        "y": -64941
      },
      {
        "x": "Alton",
        "y": -62141
      },
      {
        "x": "Jimmy",
        "y": -78697
      },
      {
        "x": "Guillaume",
        "y": -95483
      },
      {
        "x": "Sébastien",
        "y": -58234
      },
      {
        "x": "Alfred",
        "y": -75135
      },
      {
        "x": "Bon",
        "y": 81836
      },
      {
        "x": "Solange",
        "y": -37516
      },
      {
        "x": "Kendrick",
        "y": 42791
      },
      {
        "x": "Jared",
        "y": 36980
      },
      {
        "x": "Satoko",
        "y": -72295
      },
      {
        "x": "Tomoko",
        "y": -6529
      },
      {
        "x": "Line",
        "y": -72253
      },
      {
        "x": "Delphine",
        "y": -15478
      },
      {
        "x": "Leonard",
        "y": -72641
      },
      {
        "x": "Alphonse",
        "y": 81022
      },
      {
        "x": "Lisa",
        "y": -72548
      },
      {
        "x": "Bart",
        "y": 17187
      },
      {
        "x": "Benjamin",
        "y": -50886
      },
      {
        "x": "Homer",
        "y": -11460
      },
      {
        "x": "Jack",
        "y": -71216
      }
    ]
  },
  {
    "id": "AF",
    "data": [
      {
        "x": "John",
        "y": -98262
      },
      {
        "x": "Raoul",
        "y": 58042
      },
      {
        "x": "Jane",
        "y": 41715
      },
      {
        "x": "Marcel",
        "y": -41180
      },
      {
        "x": "Ibrahim",
        "y": 48150
      },
      {
        "x": "Junko",
        "y": 708
      },
      {
        "x": "Lyu",
        "y": -15335
      },
      {
        "x": "André",
        "y": -88855
      },
      {
        "x": "Maki",
        "y": -86344
      },
      {
        "x": "Véronique",
        "y": -60314
      },
      {
        "x": "Thibeau",
        "y": 51670
      },
      {
        "x": "Josiane",
        "y": -46268
      },
      {
        "x": "Raphaël",
        "y": -83513
      },
      {
        "x": "Mathéo",
        "y": -87946
      },
      {
        "x": "Margot",
        "y": 13084
      },
      {
        "x": "Hugo",
        "y": 89316
      },
      {
        "x": "Christian",
        "y": 39966
      },
      {
        "x": "Louis",
        "y": 50049
      },
      {
        "x": "Ella",
        "y": 42389
      },
      {
        "x": "Alton",
        "y": 50867
      },
      {
        "x": "Jimmy",
        "y": -94558
      },
      {
        "x": "Guillaume",
        "y": -71309
      },
      {
        "x": "Sébastien",
        "y": 82158
      },
      {
        "x": "Alfred",
        "y": 73513
      },
      {
        "x": "Bon",
        "y": 97486
      },
      {
        "x": "Solange",
        "y": -62631
      },
      {
        "x": "Kendrick",
        "y": -13821
      },
      {
        "x": "Jared",
        "y": -83137
      },
      {
        "x": "Satoko",
        "y": 32943
      },
      {
        "x": "Tomoko",
        "y": -29772
      },
      {
        "x": "Line",
        "y": 57493
      },
      {
        "x": "Delphine",
        "y": -67684
      },
      {
        "x": "Leonard",
        "y": -59139
      },
      {
        "x": "Alphonse",
        "y": 25253
      },
      {
        "x": "Lisa",
        "y": 20762
      },
      {
        "x": "Bart",
        "y": 31682
      },
      {
        "x": "Benjamin",
        "y": -22877
      },
      {
        "x": "Homer",
        "y": -59327
      },
      {
        "x": "Jack",
        "y": -24652
      }
    ]
  },
  {
    "id": "AG",
    "data": [
      {
        "x": "John",
        "y": -2407
      },
      {
        "x": "Raoul",
        "y": -73303
      },
      {
        "x": "Jane",
        "y": 89834
      },
      {
        "x": "Marcel",
        "y": 90147
      },
      {
        "x": "Ibrahim",
        "y": -86304
      },
      {
        "x": "Junko",
        "y": -85553
      },
      {
        "x": "Lyu",
        "y": -77246
      },
      {
        "x": "André",
        "y": 78161
      },
      {
        "x": "Maki",
        "y": 95824
      },
      {
        "x": "Véronique",
        "y": -25
      },
      {
        "x": "Thibeau",
        "y": -20621
      },
      {
        "x": "Josiane",
        "y": -3045
      },
      {
        "x": "Raphaël",
        "y": -93862
      },
      {
        "x": "Mathéo",
        "y": 20320
      },
      {
        "x": "Margot",
        "y": -39883
      },
      {
        "x": "Hugo",
        "y": 92342
      },
      {
        "x": "Christian",
        "y": 63363
      },
      {
        "x": "Louis",
        "y": 76097
      },
      {
        "x": "Ella",
        "y": 1835
      },
      {
        "x": "Alton",
        "y": 72223
      },
      {
        "x": "Jimmy",
        "y": -86348
      },
      {
        "x": "Guillaume",
        "y": -78379
      },
      {
        "x": "Sébastien",
        "y": 47536
      },
      {
        "x": "Alfred",
        "y": 75316
      },
      {
        "x": "Bon",
        "y": -14505
      },
      {
        "x": "Solange",
        "y": -3821
      },
      {
        "x": "Kendrick",
        "y": -15768
      },
      {
        "x": "Jared",
        "y": -1290
      },
      {
        "x": "Satoko",
        "y": -60832
      },
      {
        "x": "Tomoko",
        "y": 65309
      },
      {
        "x": "Line",
        "y": -64127
      },
      {
        "x": "Delphine",
        "y": -7082
      },
      {
        "x": "Leonard",
        "y": -29957
      },
      {
        "x": "Alphonse",
        "y": -51084
      },
      {
        "x": "Lisa",
        "y": -82322
      },
      {
        "x": "Bart",
        "y": -49779
      },
      {
        "x": "Benjamin",
        "y": -80021
      },
      {
        "x": "Homer",
        "y": 98306
      },
      {
        "x": "Jack",
        "y": -45939
      }
    ]
  },
  {
    "id": "AI",
    "data": [
      {
        "x": "John",
        "y": -49545
      },
      {
        "x": "Raoul",
        "y": 96511
      },
      {
        "x": "Jane",
        "y": -77705
      },
      {
        "x": "Marcel",
        "y": -22114
      },
      {
        "x": "Ibrahim",
        "y": -44446
      },
      {
        "x": "Junko",
        "y": 18441
      },
      {
        "x": "Lyu",
        "y": 26836
      },
      {
        "x": "André",
        "y": 26232
      },
      {
        "x": "Maki",
        "y": -9562
      },
      {
        "x": "Véronique",
        "y": -83116
      },
      {
        "x": "Thibeau",
        "y": 92747
      },
      {
        "x": "Josiane",
        "y": -49430
      },
      {
        "x": "Raphaël",
        "y": -70456
      },
      {
        "x": "Mathéo",
        "y": 48478
      },
      {
        "x": "Margot",
        "y": 93622
      },
      {
        "x": "Hugo",
        "y": -28270
      },
      {
        "x": "Christian",
        "y": 37596
      },
      {
        "x": "Louis",
        "y": -27224
      },
      {
        "x": "Ella",
        "y": 15206
      },
      {
        "x": "Alton",
        "y": 71602
      },
      {
        "x": "Jimmy",
        "y": -58030
      },
      {
        "x": "Guillaume",
        "y": 73925
      },
      {
        "x": "Sébastien",
        "y": 52367
      },
      {
        "x": "Alfred",
        "y": -10159
      },
      {
        "x": "Bon",
        "y": 48533
      },
      {
        "x": "Solange",
        "y": -46423
      },
      {
        "x": "Kendrick",
        "y": -32521
      },
      {
        "x": "Jared",
        "y": 47805
      },
      {
        "x": "Satoko",
        "y": -39712
      },
      {
        "x": "Tomoko",
        "y": 74558
      },
      {
        "x": "Line",
        "y": -25318
      },
      {
        "x": "Delphine",
        "y": 12861
      },
      {
        "x": "Leonard",
        "y": -39366
      },
      {
        "x": "Alphonse",
        "y": 26948
      },
      {
        "x": "Lisa",
        "y": 49481
      },
      {
        "x": "Bart",
        "y": -92273
      },
      {
        "x": "Benjamin",
        "y": -31894
      },
      {
        "x": "Homer",
        "y": 61670
      },
      {
        "x": "Jack",
        "y": -2508
      }
    ]
  },
  {
    "id": "AL",
    "data": [
      {
        "x": "John",
        "y": -79194
      },
      {
        "x": "Raoul",
        "y": -51565
      },
      {
        "x": "Jane",
        "y": -14124
      },
      {
        "x": "Marcel",
        "y": -37290
      },
      {
        "x": "Ibrahim",
        "y": 51518
      },
      {
        "x": "Junko",
        "y": 52304
      },
      {
        "x": "Lyu",
        "y": -82786
      },
      {
        "x": "André",
        "y": 44619
      },
      {
        "x": "Maki",
        "y": 96241
      },
      {
        "x": "Véronique",
        "y": -13539
      },
      {
        "x": "Thibeau",
        "y": -88905
      },
      {
        "x": "Josiane",
        "y": -97744
      },
      {
        "x": "Raphaël",
        "y": -7950
      },
      {
        "x": "Mathéo",
        "y": 72581
      },
      {
        "x": "Margot",
        "y": -95167
      },
      {
        "x": "Hugo",
        "y": -21874
      },
      {
        "x": "Christian",
        "y": -46938
      },
      {
        "x": "Louis",
        "y": -61784
      },
      {
        "x": "Ella",
        "y": -72861
      },
      {
        "x": "Alton",
        "y": 11694
      },
      {
        "x": "Jimmy",
        "y": -38996
      },
      {
        "x": "Guillaume",
        "y": 7301
      },
      {
        "x": "Sébastien",
        "y": 13678
      },
      {
        "x": "Alfred",
        "y": 87290
      },
      {
        "x": "Bon",
        "y": 61663
      },
      {
        "x": "Solange",
        "y": 86530
      },
      {
        "x": "Kendrick",
        "y": -37163
      },
      {
        "x": "Jared",
        "y": -57424
      },
      {
        "x": "Satoko",
        "y": -30037
      },
      {
        "x": "Tomoko",
        "y": -35098
      },
      {
        "x": "Line",
        "y": -87834
      },
      {
        "x": "Delphine",
        "y": -10885
      },
      {
        "x": "Leonard",
        "y": -42478
      },
      {
        "x": "Alphonse",
        "y": -96826
      },
      {
        "x": "Lisa",
        "y": 9832
      },
      {
        "x": "Bart",
        "y": -18018
      },
      {
        "x": "Benjamin",
        "y": -89173
      },
      {
        "x": "Homer",
        "y": 22653
      },
      {
        "x": "Jack",
        "y": 3355
      }
    ]
  },
  {
    "id": "AM",
    "data": [
      {
        "x": "John",
        "y": 96602
      },
      {
        "x": "Raoul",
        "y": -12366
      },
      {
        "x": "Jane",
        "y": -43580
      },
      {
        "x": "Marcel",
        "y": 73455
      },
      {
        "x": "Ibrahim",
        "y": 36645
      },
      {
        "x": "Junko",
        "y": -42730
      },
      {
        "x": "Lyu",
        "y": -59092
      },
      {
        "x": "André",
        "y": -20599
      },
      {
        "x": "Maki",
        "y": -63240
      },
      {
        "x": "Véronique",
        "y": -38426
      },
      {
        "x": "Thibeau",
        "y": -71544
      },
      {
        "x": "Josiane",
        "y": -53220
      },
      {
        "x": "Raphaël",
        "y": -30331
      },
      {
        "x": "Mathéo",
        "y": -92649
      },
      {
        "x": "Margot",
        "y": 44928
      },
      {
        "x": "Hugo",
        "y": 81290
      },
      {
        "x": "Christian",
        "y": 47634
      },
      {
        "x": "Louis",
        "y": 224
      },
      {
        "x": "Ella",
        "y": 10469
      },
      {
        "x": "Alton",
        "y": -77676
      },
      {
        "x": "Jimmy",
        "y": -134
      },
      {
        "x": "Guillaume",
        "y": 50037
      },
      {
        "x": "Sébastien",
        "y": -80868
      },
      {
        "x": "Alfred",
        "y": -6233
      },
      {
        "x": "Bon",
        "y": -65787
      },
      {
        "x": "Solange",
        "y": 35438
      },
      {
        "x": "Kendrick",
        "y": -65177
      },
      {
        "x": "Jared",
        "y": -817
      },
      {
        "x": "Satoko",
        "y": 62637
      },
      {
        "x": "Tomoko",
        "y": 90033
      },
      {
        "x": "Line",
        "y": 43554
      },
      {
        "x": "Delphine",
        "y": -48580
      },
      {
        "x": "Leonard",
        "y": -63377
      },
      {
        "x": "Alphonse",
        "y": -7612
      },
      {
        "x": "Lisa",
        "y": -97101
      },
      {
        "x": "Bart",
        "y": 57144
      },
      {
        "x": "Benjamin",
        "y": -91703
      },
      {
        "x": "Homer",
        "y": 14615
      },
      {
        "x": "Jack",
        "y": -83592
      }
    ]
  },
  {
    "id": "AO",
    "data": [
      {
        "x": "John",
        "y": -30647
      },
      {
        "x": "Raoul",
        "y": 80857
      },
      {
        "x": "Jane",
        "y": -51749
      },
      {
        "x": "Marcel",
        "y": 56980
      },
      {
        "x": "Ibrahim",
        "y": -39095
      },
      {
        "x": "Junko",
        "y": -18235
      },
      {
        "x": "Lyu",
        "y": -3448
      },
      {
        "x": "André",
        "y": -91244
      },
      {
        "x": "Maki",
        "y": -86049
      },
      {
        "x": "Véronique",
        "y": -28709
      },
      {
        "x": "Thibeau",
        "y": -37869
      },
      {
        "x": "Josiane",
        "y": 17988
      },
      {
        "x": "Raphaël",
        "y": 68422
      },
      {
        "x": "Mathéo",
        "y": -24419
      },
      {
        "x": "Margot",
        "y": -99934
      },
      {
        "x": "Hugo",
        "y": 96744
      },
      {
        "x": "Christian",
        "y": 72084
      },
      {
        "x": "Louis",
        "y": 22327
      },
      {
        "x": "Ella",
        "y": 65901
      },
      {
        "x": "Alton",
        "y": -98024
      },
      {
        "x": "Jimmy",
        "y": 3525
      },
      {
        "x": "Guillaume",
        "y": -16782
      },
      {
        "x": "Sébastien",
        "y": 92796
      },
      {
        "x": "Alfred",
        "y": -35576
      },
      {
        "x": "Bon",
        "y": -29920
      },
      {
        "x": "Solange",
        "y": 94149
      },
      {
        "x": "Kendrick",
        "y": 83199
      },
      {
        "x": "Jared",
        "y": 90979
      },
      {
        "x": "Satoko",
        "y": 21373
      },
      {
        "x": "Tomoko",
        "y": 27779
      },
      {
        "x": "Line",
        "y": 24289
      },
      {
        "x": "Delphine",
        "y": -57451
      },
      {
        "x": "Leonard",
        "y": -46924
      },
      {
        "x": "Alphonse",
        "y": 5886
      },
      {
        "x": "Lisa",
        "y": 1100
      },
      {
        "x": "Bart",
        "y": 69593
      },
      {
        "x": "Benjamin",
        "y": 62258
      },
      {
        "x": "Homer",
        "y": 36569
      },
      {
        "x": "Jack",
        "y": -57760
      }
    ]
  },
  {
    "id": "AQ",
    "data": [
      {
        "x": "John",
        "y": -66669
      },
      {
        "x": "Raoul",
        "y": -34113
      },
      {
        "x": "Jane",
        "y": -82526
      },
      {
        "x": "Marcel",
        "y": 11007
      },
      {
        "x": "Ibrahim",
        "y": -80760
      },
      {
        "x": "Junko",
        "y": 94089
      },
      {
        "x": "Lyu",
        "y": 80264
      },
      {
        "x": "André",
        "y": 9038
      },
      {
        "x": "Maki",
        "y": -28856
      },
      {
        "x": "Véronique",
        "y": -69696
      },
      {
        "x": "Thibeau",
        "y": 25293
      },
      {
        "x": "Josiane",
        "y": 42451
      },
      {
        "x": "Raphaël",
        "y": 6173
      },
      {
        "x": "Mathéo",
        "y": 8566
      },
      {
        "x": "Margot",
        "y": 35243
      },
      {
        "x": "Hugo",
        "y": 39978
      },
      {
        "x": "Christian",
        "y": -25396
      },
      {
        "x": "Louis",
        "y": 21133
      },
      {
        "x": "Ella",
        "y": -95516
      },
      {
        "x": "Alton",
        "y": -83655
      },
      {
        "x": "Jimmy",
        "y": -88579
      },
      {
        "x": "Guillaume",
        "y": 51001
      },
      {
        "x": "Sébastien",
        "y": 68815
      },
      {
        "x": "Alfred",
        "y": -28159
      },
      {
        "x": "Bon",
        "y": 83501
      },
      {
        "x": "Solange",
        "y": 50852
      },
      {
        "x": "Kendrick",
        "y": 43661
      },
      {
        "x": "Jared",
        "y": -72407
      },
      {
        "x": "Satoko",
        "y": -74242
      },
      {
        "x": "Tomoko",
        "y": 2827
      },
      {
        "x": "Line",
        "y": -80302
      },
      {
        "x": "Delphine",
        "y": -81236
      },
      {
        "x": "Leonard",
        "y": -23052
      },
      {
        "x": "Alphonse",
        "y": -6791
      },
      {
        "x": "Lisa",
        "y": -41992
      },
      {
        "x": "Bart",
        "y": 30309
      },
      {
        "x": "Benjamin",
        "y": 64854
      },
      {
        "x": "Homer",
        "y": 29374
      },
      {
        "x": "Jack",
        "y": -21327
      }
    ]
  },
  {
    "id": "AR",
    "data": [
      {
        "x": "John",
        "y": -28185
      },
      {
        "x": "Raoul",
        "y": -92456
      },
      {
        "x": "Jane",
        "y": 19000
      },
      {
        "x": "Marcel",
        "y": 88185
      },
      {
        "x": "Ibrahim",
        "y": -57496
      },
      {
        "x": "Junko",
        "y": -44905
      },
      {
        "x": "Lyu",
        "y": 99897
      },
      {
        "x": "André",
        "y": 2458
      },
      {
        "x": "Maki",
        "y": 86446
      },
      {
        "x": "Véronique",
        "y": 44191
      },
      {
        "x": "Thibeau",
        "y": 99982
      },
      {
        "x": "Josiane",
        "y": -45882
      },
      {
        "x": "Raphaël",
        "y": 971
      },
      {
        "x": "Mathéo",
        "y": -92003
      },
      {
        "x": "Margot",
        "y": -35816
      },
      {
        "x": "Hugo",
        "y": 3426
      },
      {
        "x": "Christian",
        "y": 79758
      },
      {
        "x": "Louis",
        "y": 59866
      },
      {
        "x": "Ella",
        "y": 55579
      },
      {
        "x": "Alton",
        "y": -39598
      },
      {
        "x": "Jimmy",
        "y": -99537
      },
      {
        "x": "Guillaume",
        "y": 42219
      },
      {
        "x": "Sébastien",
        "y": 37283
      },
      {
        "x": "Alfred",
        "y": 5039
      },
      {
        "x": "Bon",
        "y": -22334
      },
      {
        "x": "Solange",
        "y": -56254
      },
      {
        "x": "Kendrick",
        "y": -81906
      },
      {
        "x": "Jared",
        "y": 10028
      },
      {
        "x": "Satoko",
        "y": -92968
      },
      {
        "x": "Tomoko",
        "y": -38611
      },
      {
        "x": "Line",
        "y": -87850
      },
      {
        "x": "Delphine",
        "y": 88592
      },
      {
        "x": "Leonard",
        "y": -32733
      },
      {
        "x": "Alphonse",
        "y": -18865
      },
      {
        "x": "Lisa",
        "y": -19850
      },
      {
        "x": "Bart",
        "y": 67540
      },
      {
        "x": "Benjamin",
        "y": -12130
      },
      {
        "x": "Homer",
        "y": 89974
      },
      {
        "x": "Jack",
        "y": 37398
      }
    ]
  },
  {
    "id": "AS",
    "data": [
      {
        "x": "John",
        "y": -28823
      },
      {
        "x": "Raoul",
        "y": 77962
      },
      {
        "x": "Jane",
        "y": -48820
      },
      {
        "x": "Marcel",
        "y": 6352
      },
      {
        "x": "Ibrahim",
        "y": 97576
      },
      {
        "x": "Junko",
        "y": -71522
      },
      {
        "x": "Lyu",
        "y": -59199
      },
      {
        "x": "André",
        "y": -35067
      },
      {
        "x": "Maki",
        "y": -8510
      },
      {
        "x": "Véronique",
        "y": 18527
      },
      {
        "x": "Thibeau",
        "y": -56815
      },
      {
        "x": "Josiane",
        "y": 17625
      },
      {
        "x": "Raphaël",
        "y": -59104
      },
      {
        "x": "Mathéo",
        "y": 65679
      },
      {
        "x": "Margot",
        "y": 85435
      },
      {
        "x": "Hugo",
        "y": 77427
      },
      {
        "x": "Christian",
        "y": 50187
      },
      {
        "x": "Louis",
        "y": -75570
      },
      {
        "x": "Ella",
        "y": -47082
      },
      {
        "x": "Alton",
        "y": 3892
      },
      {
        "x": "Jimmy",
        "y": 68141
      },
      {
        "x": "Guillaume",
        "y": 45456
      },
      {
        "x": "Sébastien",
        "y": -80617
      },
      {
        "x": "Alfred",
        "y": -80692
      },
      {
        "x": "Bon",
        "y": -10625
      },
      {
        "x": "Solange",
        "y": -55911
      },
      {
        "x": "Kendrick",
        "y": 40458
      },
      {
        "x": "Jared",
        "y": -18176
      },
      {
        "x": "Satoko",
        "y": 8927
      },
      {
        "x": "Tomoko",
        "y": 23007
      },
      {
        "x": "Line",
        "y": -15706
      },
      {
        "x": "Delphine",
        "y": 36271
      },
      {
        "x": "Leonard",
        "y": 50956
      },
      {
        "x": "Alphonse",
        "y": -3281
      },
      {
        "x": "Lisa",
        "y": -26366
      },
      {
        "x": "Bart",
        "y": -16878
      },
      {
        "x": "Benjamin",
        "y": 50716
      },
      {
        "x": "Homer",
        "y": 44878
      },
      {
        "x": "Jack",
        "y": -93026
      }
    ]
  },
  {
    "id": "AT",
    "data": [
      {
        "x": "John",
        "y": 34789
      },
      {
        "x": "Raoul",
        "y": 61811
      },
      {
        "x": "Jane",
        "y": 67016
      },
      {
        "x": "Marcel",
        "y": 29226
      },
      {
        "x": "Ibrahim",
        "y": -35825
      },
      {
        "x": "Junko",
        "y": 65729
      },
      {
        "x": "Lyu",
        "y": 98634
      },
      {
        "x": "André",
        "y": 56962
      },
      {
        "x": "Maki",
        "y": 13887
      },
      {
        "x": "Véronique",
        "y": -73532
      },
      {
        "x": "Thibeau",
        "y": -86918
      },
      {
        "x": "Josiane",
        "y": -7114
      },
      {
        "x": "Raphaël",
        "y": 5866
      },
      {
        "x": "Mathéo",
        "y": -50626
      },
      {
        "x": "Margot",
        "y": 95325
      },
      {
        "x": "Hugo",
        "y": 31796
      },
      {
        "x": "Christian",
        "y": 14650
      },
      {
        "x": "Louis",
        "y": 78337
      },
      {
        "x": "Ella",
        "y": -49242
      },
      {
        "x": "Alton",
        "y": -42644
      },
      {
        "x": "Jimmy",
        "y": -58975
      },
      {
        "x": "Guillaume",
        "y": 34665
      },
      {
        "x": "Sébastien",
        "y": 49785
      },
      {
        "x": "Alfred",
        "y": 47004
      },
      {
        "x": "Bon",
        "y": -3959
      },
      {
        "x": "Solange",
        "y": 8263
      },
      {
        "x": "Kendrick",
        "y": 44324
      },
      {
        "x": "Jared",
        "y": -23926
      },
      {
        "x": "Satoko",
        "y": -40562
      },
      {
        "x": "Tomoko",
        "y": -18220
      },
      {
        "x": "Line",
        "y": -82373
      },
      {
        "x": "Delphine",
        "y": -30741
      },
      {
        "x": "Leonard",
        "y": 90721
      },
      {
        "x": "Alphonse",
        "y": -57305
      },
      {
        "x": "Lisa",
        "y": 1862
      },
      {
        "x": "Bart",
        "y": -88284
      },
      {
        "x": "Benjamin",
        "y": -66539
      },
      {
        "x": "Homer",
        "y": -62484
      },
      {
        "x": "Jack",
        "y": 79079
      }
    ]
  },
  {
    "id": "AU",
    "data": [
      {
        "x": "John",
        "y": 67902
      },
      {
        "x": "Raoul",
        "y": -41876
      },
      {
        "x": "Jane",
        "y": 70048
      },
      {
        "x": "Marcel",
        "y": -519
      },
      {
        "x": "Ibrahim",
        "y": 18561
      },
      {
        "x": "Junko",
        "y": 78707
      },
      {
        "x": "Lyu",
        "y": -20935
      },
      {
        "x": "André",
        "y": 64369
      },
      {
        "x": "Maki",
        "y": -9782
      },
      {
        "x": "Véronique",
        "y": -61899
      },
      {
        "x": "Thibeau",
        "y": -39872
      },
      {
        "x": "Josiane",
        "y": 69866
      },
      {
        "x": "Raphaël",
        "y": -88449
      },
      {
        "x": "Mathéo",
        "y": 46070
      },
      {
        "x": "Margot",
        "y": -1378
      },
      {
        "x": "Hugo",
        "y": -64614
      },
      {
        "x": "Christian",
        "y": -55243
      },
      {
        "x": "Louis",
        "y": 25122
      },
      {
        "x": "Ella",
        "y": 84909
      },
      {
        "x": "Alton",
        "y": -7338
      },
      {
        "x": "Jimmy",
        "y": -82560
      },
      {
        "x": "Guillaume",
        "y": -19419
      },
      {
        "x": "Sébastien",
        "y": 35804
      },
      {
        "x": "Alfred",
        "y": -58271
      },
      {
        "x": "Bon",
        "y": -49529
      },
      {
        "x": "Solange",
        "y": -31281
      },
      {
        "x": "Kendrick",
        "y": 38893
      },
      {
        "x": "Jared",
        "y": 86222
      },
      {
        "x": "Satoko",
        "y": -27989
      },
      {
        "x": "Tomoko",
        "y": 6745
      },
      {
        "x": "Line",
        "y": -88583
      },
      {
        "x": "Delphine",
        "y": -97039
      },
      {
        "x": "Leonard",
        "y": 13860
      },
      {
        "x": "Alphonse",
        "y": 92448
      },
      {
        "x": "Lisa",
        "y": -55196
      },
      {
        "x": "Bart",
        "y": 96671
      },
      {
        "x": "Benjamin",
        "y": 90971
      },
      {
        "x": "Homer",
        "y": -5727
      },
      {
        "x": "Jack",
        "y": 66015
      }
    ]
  },
  {
    "id": "AW",
    "data": [
      {
        "x": "John",
        "y": 82374
      },
      {
        "x": "Raoul",
        "y": -44342
      },
      {
        "x": "Jane",
        "y": -92951
      },
      {
        "x": "Marcel",
        "y": 83112
      },
      {
        "x": "Ibrahim",
        "y": 7493
      },
      {
        "x": "Junko",
        "y": -8699
      },
      {
        "x": "Lyu",
        "y": -65169
      },
      {
        "x": "André",
        "y": 91046
      },
      {
        "x": "Maki",
        "y": -75711
      },
      {
        "x": "Véronique",
        "y": -99645
      },
      {
        "x": "Thibeau",
        "y": 50497
      },
      {
        "x": "Josiane",
        "y": 42325
      },
      {
        "x": "Raphaël",
        "y": -92835
      },
      {
        "x": "Mathéo",
        "y": 99169
      },
      {
        "x": "Margot",
        "y": -61634
      },
      {
        "x": "Hugo",
        "y": -51288
      },
      {
        "x": "Christian",
        "y": 58682
      },
      {
        "x": "Louis",
        "y": 51108
      },
      {
        "x": "Ella",
        "y": 13421
      },
      {
        "x": "Alton",
        "y": 46435
      },
      {
        "x": "Jimmy",
        "y": 39526
      },
      {
        "x": "Guillaume",
        "y": -61632
      },
      {
        "x": "Sébastien",
        "y": -70808
      },
      {
        "x": "Alfred",
        "y": 86660
      },
      {
        "x": "Bon",
        "y": 18476
      },
      {
        "x": "Solange",
        "y": -33793
      },
      {
        "x": "Kendrick",
        "y": 32153
      },
      {
        "x": "Jared",
        "y": -73844
      },
      {
        "x": "Satoko",
        "y": 74091
      },
      {
        "x": "Tomoko",
        "y": 10090
      },
      {
        "x": "Line",
        "y": -98736
      },
      {
        "x": "Delphine",
        "y": -71759
      },
      {
        "x": "Leonard",
        "y": -91626
      },
      {
        "x": "Alphonse",
        "y": -12567
      },
      {
        "x": "Lisa",
        "y": 92836
      },
      {
        "x": "Bart",
        "y": 46800
      },
      {
        "x": "Benjamin",
        "y": -38887
      },
      {
        "x": "Homer",
        "y": -28634
      },
      {
        "x": "Jack",
        "y": -98849
      }
    ]
  },
  {
    "id": "AX",
    "data": [
      {
        "x": "John",
        "y": -39517
      },
      {
        "x": "Raoul",
        "y": 91996
      },
      {
        "x": "Jane",
        "y": -74469
      },
      {
        "x": "Marcel",
        "y": -79281
      },
      {
        "x": "Ibrahim",
        "y": 37937
      },
      {
        "x": "Junko",
        "y": 16369
      },
      {
        "x": "Lyu",
        "y": -70081
      },
      {
        "x": "André",
        "y": -10061
      },
      {
        "x": "Maki",
        "y": 85083
      },
      {
        "x": "Véronique",
        "y": 3922
      },
      {
        "x": "Thibeau",
        "y": -59539
      },
      {
        "x": "Josiane",
        "y": 57223
      },
      {
        "x": "Raphaël",
        "y": -84997
      },
      {
        "x": "Mathéo",
        "y": -2760
      },
      {
        "x": "Margot",
        "y": -98777
      },
      {
        "x": "Hugo",
        "y": 59964
      },
      {
        "x": "Christian",
        "y": -83429
      },
      {
        "x": "Louis",
        "y": 59239
      },
      {
        "x": "Ella",
        "y": -89248
      },
      {
        "x": "Alton",
        "y": -92184
      },
      {
        "x": "Jimmy",
        "y": 24754
      },
      {
        "x": "Guillaume",
        "y": 11699
      },
      {
        "x": "Sébastien",
        "y": -98094
      },
      {
        "x": "Alfred",
        "y": 82059
      },
      {
        "x": "Bon",
        "y": -77348
      },
      {
        "x": "Solange",
        "y": -77341
      },
      {
        "x": "Kendrick",
        "y": 19490
      },
      {
        "x": "Jared",
        "y": 45211
      },
      {
        "x": "Satoko",
        "y": 52647
      },
      {
        "x": "Tomoko",
        "y": 1388
      },
      {
        "x": "Line",
        "y": 12258
      },
      {
        "x": "Delphine",
        "y": -10379
      },
      {
        "x": "Leonard",
        "y": -21167
      },
      {
        "x": "Alphonse",
        "y": -63784
      },
      {
        "x": "Lisa",
        "y": -87875
      },
      {
        "x": "Bart",
        "y": -52389
      },
      {
        "x": "Benjamin",
        "y": -17641
      },
      {
        "x": "Homer",
        "y": 71660
      },
      {
        "x": "Jack",
        "y": 71012
      }
    ]
  },
  {
    "id": "AZ",
    "data": [
      {
        "x": "John",
        "y": 62161
      },
      {
        "x": "Raoul",
        "y": 62440
      },
      {
        "x": "Jane",
        "y": 34822
      },
      {
        "x": "Marcel",
        "y": 36471
      },
      {
        "x": "Ibrahim",
        "y": -92381
      },
      {
        "x": "Junko",
        "y": -19451
      },
      {
        "x": "Lyu",
        "y": 90124
      },
      {
        "x": "André",
        "y": 56434
      },
      {
        "x": "Maki",
        "y": 83378
      },
      {
        "x": "Véronique",
        "y": -14888
      },
      {
        "x": "Thibeau",
        "y": -49285
      },
      {
        "x": "Josiane",
        "y": -54687
      },
      {
        "x": "Raphaël",
        "y": -28718
      },
      {
        "x": "Mathéo",
        "y": 97052
      },
      {
        "x": "Margot",
        "y": -39737
      },
      {
        "x": "Hugo",
        "y": -62445
      },
      {
        "x": "Christian",
        "y": 42437
      },
      {
        "x": "Louis",
        "y": -58703
      },
      {
        "x": "Ella",
        "y": -21292
      },
      {
        "x": "Alton",
        "y": -45805
      },
      {
        "x": "Jimmy",
        "y": 87320
      },
      {
        "x": "Guillaume",
        "y": 69185
      },
      {
        "x": "Sébastien",
        "y": 24262
      },
      {
        "x": "Alfred",
        "y": -57080
      },
      {
        "x": "Bon",
        "y": -68667
      },
      {
        "x": "Solange",
        "y": -86431
      },
      {
        "x": "Kendrick",
        "y": 61451
      },
      {
        "x": "Jared",
        "y": 13445
      },
      {
        "x": "Satoko",
        "y": 43539
      },
      {
        "x": "Tomoko",
        "y": 73436
      },
      {
        "x": "Line",
        "y": 83078
      },
      {
        "x": "Delphine",
        "y": -49565
      },
      {
        "x": "Leonard",
        "y": 75835
      },
      {
        "x": "Alphonse",
        "y": 51177
      },
      {
        "x": "Lisa",
        "y": -18508
      },
      {
        "x": "Bart",
        "y": 41030
      },
      {
        "x": "Benjamin",
        "y": 92827
      },
      {
        "x": "Homer",
        "y": -25608
      },
      {
        "x": "Jack",
        "y": -72179
      }
    ]
  },
  {
    "id": "BA",
    "data": [
      {
        "x": "John",
        "y": -92607
      },
      {
        "x": "Raoul",
        "y": 47349
      },
      {
        "x": "Jane",
        "y": -93667
      },
      {
        "x": "Marcel",
        "y": 66797
      },
      {
        "x": "Ibrahim",
        "y": 98859
      },
      {
        "x": "Junko",
        "y": 257
      },
      {
        "x": "Lyu",
        "y": 72094
      },
      {
        "x": "André",
        "y": -8887
      },
      {
        "x": "Maki",
        "y": 13803
      },
      {
        "x": "Véronique",
        "y": -35147
      },
      {
        "x": "Thibeau",
        "y": -47253
      },
      {
        "x": "Josiane",
        "y": -35259
      },
      {
        "x": "Raphaël",
        "y": 20834
      },
      {
        "x": "Mathéo",
        "y": -71043
      },
      {
        "x": "Margot",
        "y": -36894
      },
      {
        "x": "Hugo",
        "y": -65940
      },
      {
        "x": "Christian",
        "y": -69800
      },
      {
        "x": "Louis",
        "y": 12385
      },
      {
        "x": "Ella",
        "y": 2420
      },
      {
        "x": "Alton",
        "y": -27575
      },
      {
        "x": "Jimmy",
        "y": 83561
      },
      {
        "x": "Guillaume",
        "y": 77110
      },
      {
        "x": "Sébastien",
        "y": 96946
      },
      {
        "x": "Alfred",
        "y": 32302
      },
      {
        "x": "Bon",
        "y": 63963
      },
      {
        "x": "Solange",
        "y": -19945
      },
      {
        "x": "Kendrick",
        "y": -4652
      },
      {
        "x": "Jared",
        "y": -94148
      },
      {
        "x": "Satoko",
        "y": 77737
      },
      {
        "x": "Tomoko",
        "y": -60388
      },
      {
        "x": "Line",
        "y": -55924
      },
      {
        "x": "Delphine",
        "y": 7501
      },
      {
        "x": "Leonard",
        "y": 82293
      },
      {
        "x": "Alphonse",
        "y": -90179
      },
      {
        "x": "Lisa",
        "y": 10004
      },
      {
        "x": "Bart",
        "y": -85210
      },
      {
        "x": "Benjamin",
        "y": -23791
      },
      {
        "x": "Homer",
        "y": -42473
      },
      {
        "x": "Jack",
        "y": 22389
      }
    ]
  },
  {
    "id": "BB",
    "data": [
      {
        "x": "John",
        "y": -80607
      },
      {
        "x": "Raoul",
        "y": 84531
      },
      {
        "x": "Jane",
        "y": 84754
      },
      {
        "x": "Marcel",
        "y": -15547
      },
      {
        "x": "Ibrahim",
        "y": 12238
      },
      {
        "x": "Junko",
        "y": -35248
      },
      {
        "x": "Lyu",
        "y": -3454
      },
      {
        "x": "André",
        "y": 16015
      },
      {
        "x": "Maki",
        "y": -30924
      },
      {
        "x": "Véronique",
        "y": 75087
      },
      {
        "x": "Thibeau",
        "y": -58467
      },
      {
        "x": "Josiane",
        "y": -43262
      },
      {
        "x": "Raphaël",
        "y": 13820
      },
      {
        "x": "Mathéo",
        "y": 69815
      },
      {
        "x": "Margot",
        "y": 22435
      },
      {
        "x": "Hugo",
        "y": 39415
      },
      {
        "x": "Christian",
        "y": 83176
      },
      {
        "x": "Louis",
        "y": 79666
      },
      {
        "x": "Ella",
        "y": -79760
      },
      {
        "x": "Alton",
        "y": -65935
      },
      {
        "x": "Jimmy",
        "y": -24649
      },
      {
        "x": "Guillaume",
        "y": -86579
      },
      {
        "x": "Sébastien",
        "y": -37306
      },
      {
        "x": "Alfred",
        "y": 58053
      },
      {
        "x": "Bon",
        "y": 39725
      },
      {
        "x": "Solange",
        "y": -54890
      },
      {
        "x": "Kendrick",
        "y": 82893
      },
      {
        "x": "Jared",
        "y": -59402
      },
      {
        "x": "Satoko",
        "y": -51800
      },
      {
        "x": "Tomoko",
        "y": 66008
      },
      {
        "x": "Line",
        "y": 10162
      },
      {
        "x": "Delphine",
        "y": 31441
      },
      {
        "x": "Leonard",
        "y": -39300
      },
      {
        "x": "Alphonse",
        "y": 62252
      },
      {
        "x": "Lisa",
        "y": 25840
      },
      {
        "x": "Bart",
        "y": -10229
      },
      {
        "x": "Benjamin",
        "y": 59959
      },
      {
        "x": "Homer",
        "y": 87235
      },
      {
        "x": "Jack",
        "y": 26772
      }
    ]
  },
  {
    "id": "BD",
    "data": [
      {
        "x": "John",
        "y": -39276
      },
      {
        "x": "Raoul",
        "y": 10976
      },
      {
        "x": "Jane",
        "y": -66115
      },
      {
        "x": "Marcel",
        "y": 11618
      },
      {
        "x": "Ibrahim",
        "y": 67095
      },
      {
        "x": "Junko",
        "y": 83999
      },
      {
        "x": "Lyu",
        "y": -48637
      },
      {
        "x": "André",
        "y": -85586
      },
      {
        "x": "Maki",
        "y": -25110
      },
      {
        "x": "Véronique",
        "y": 96732
      },
      {
        "x": "Thibeau",
        "y": 95759
      },
      {
        "x": "Josiane",
        "y": 25798
      },
      {
        "x": "Raphaël",
        "y": 85598
      },
      {
        "x": "Mathéo",
        "y": -86420
      },
      {
        "x": "Margot",
        "y": -7197
      },
      {
        "x": "Hugo",
        "y": 4799
      },
      {
        "x": "Christian",
        "y": -82275
      },
      {
        "x": "Louis",
        "y": 10035
      },
      {
        "x": "Ella",
        "y": 85551
      },
      {
        "x": "Alton",
        "y": 43495
      },
      {
        "x": "Jimmy",
        "y": -75029
      },
      {
        "x": "Guillaume",
        "y": 47922
      },
      {
        "x": "Sébastien",
        "y": -73671
      },
      {
        "x": "Alfred",
        "y": 81398
      },
      {
        "x": "Bon",
        "y": -10952
      },
      {
        "x": "Solange",
        "y": -3861
      },
      {
        "x": "Kendrick",
        "y": -73312
      },
      {
        "x": "Jared",
        "y": 17607
      },
      {
        "x": "Satoko",
        "y": 57278
      },
      {
        "x": "Tomoko",
        "y": -65091
      },
      {
        "x": "Line",
        "y": -53056
      },
      {
        "x": "Delphine",
        "y": 77152
      },
      {
        "x": "Leonard",
        "y": 67131
      },
      {
        "x": "Alphonse",
        "y": -75673
      },
      {
        "x": "Lisa",
        "y": -79244
      },
      {
        "x": "Bart",
        "y": 52083
      },
      {
        "x": "Benjamin",
        "y": -2470
      },
      {
        "x": "Homer",
        "y": -83379
      },
      {
        "x": "Jack",
        "y": -98911
      }
    ]
  },
  {
    "id": "BE",
    "data": [
      {
        "x": "John",
        "y": 7754
      },
      {
        "x": "Raoul",
        "y": 74902
      },
      {
        "x": "Jane",
        "y": 80778
      },
      {
        "x": "Marcel",
        "y": -8035
      },
      {
        "x": "Ibrahim",
        "y": 49011
      },
      {
        "x": "Junko",
        "y": -3828
      },
      {
        "x": "Lyu",
        "y": -23215
      },
      {
        "x": "André",
        "y": 92266
      },
      {
        "x": "Maki",
        "y": 954
      },
      {
        "x": "Véronique",
        "y": -38406
      },
      {
        "x": "Thibeau",
        "y": -65912
      },
      {
        "x": "Josiane",
        "y": -68110
      },
      {
        "x": "Raphaël",
        "y": -63063
      },
      {
        "x": "Mathéo",
        "y": -64820
      },
      {
        "x": "Margot",
        "y": -18444
      },
      {
        "x": "Hugo",
        "y": -62562
      },
      {
        "x": "Christian",
        "y": -18438
      },
      {
        "x": "Louis",
        "y": -30133
      },
      {
        "x": "Ella",
        "y": 3481
      },
      {
        "x": "Alton",
        "y": 22834
      },
      {
        "x": "Jimmy",
        "y": 25215
      },
      {
        "x": "Guillaume",
        "y": 41116
      },
      {
        "x": "Sébastien",
        "y": -12125
      },
      {
        "x": "Alfred",
        "y": 84795
      },
      {
        "x": "Bon",
        "y": 43269
      },
      {
        "x": "Solange",
        "y": 84114
      },
      {
        "x": "Kendrick",
        "y": 22215
      },
      {
        "x": "Jared",
        "y": 27381
      },
      {
        "x": "Satoko",
        "y": -893
      },
      {
        "x": "Tomoko",
        "y": -51481
      },
      {
        "x": "Line",
        "y": 50195
      },
      {
        "x": "Delphine",
        "y": -28824
      },
      {
        "x": "Leonard",
        "y": 3037
      },
      {
        "x": "Alphonse",
        "y": 91839
      },
      {
        "x": "Lisa",
        "y": 42180
      },
      {
        "x": "Bart",
        "y": 25538
      },
      {
        "x": "Benjamin",
        "y": 65479
      },
      {
        "x": "Homer",
        "y": -98546
      },
      {
        "x": "Jack",
        "y": 81312
      }
    ]
  },
  {
    "id": "BF",
    "data": [
      {
        "x": "John",
        "y": 66351
      },
      {
        "x": "Raoul",
        "y": -3411
      },
      {
        "x": "Jane",
        "y": 88878
      },
      {
        "x": "Marcel",
        "y": -19490
      },
      {
        "x": "Ibrahim",
        "y": 31738
      },
      {
        "x": "Junko",
        "y": 58828
      },
      {
        "x": "Lyu",
        "y": 86946
      },
      {
        "x": "André",
        "y": 74444
      },
      {
        "x": "Maki",
        "y": 18016
      },
      {
        "x": "Véronique",
        "y": 45345
      },
      {
        "x": "Thibeau",
        "y": 69211
      },
      {
        "x": "Josiane",
        "y": -97482
      },
      {
        "x": "Raphaël",
        "y": -93583
      },
      {
        "x": "Mathéo",
        "y": -45005
      },
      {
        "x": "Margot",
        "y": -83571
      },
      {
        "x": "Hugo",
        "y": -81833
      },
      {
        "x": "Christian",
        "y": -17791
      },
      {
        "x": "Louis",
        "y": -44944
      },
      {
        "x": "Ella",
        "y": 12888
      },
      {
        "x": "Alton",
        "y": -87327
      },
      {
        "x": "Jimmy",
        "y": -29173
      },
      {
        "x": "Guillaume",
        "y": -60078
      },
      {
        "x": "Sébastien",
        "y": -38792
      },
      {
        "x": "Alfred",
        "y": 36207
      },
      {
        "x": "Bon",
        "y": -87698
      },
      {
        "x": "Solange",
        "y": -97493
      },
      {
        "x": "Kendrick",
        "y": -77505
      },
      {
        "x": "Jared",
        "y": 33567
      },
      {
        "x": "Satoko",
        "y": -64459
      },
      {
        "x": "Tomoko",
        "y": 18013
      },
      {
        "x": "Line",
        "y": 45178
      },
      {
        "x": "Delphine",
        "y": 24254
      },
      {
        "x": "Leonard",
        "y": 42850
      },
      {
        "x": "Alphonse",
        "y": -86899
      },
      {
        "x": "Lisa",
        "y": 4361
      },
      {
        "x": "Bart",
        "y": -56617
      },
      {
        "x": "Benjamin",
        "y": 56157
      },
      {
        "x": "Homer",
        "y": 44472
      },
      {
        "x": "Jack",
        "y": -56025
      }
    ]
  },
  {
    "id": "BG",
    "data": [
      {
        "x": "John",
        "y": 94431
      },
      {
        "x": "Raoul",
        "y": 1268
      },
      {
        "x": "Jane",
        "y": 80952
      },
      {
        "x": "Marcel",
        "y": 59492
      },
      {
        "x": "Ibrahim",
        "y": 81426
      },
      {
        "x": "Junko",
        "y": 17166
      },
      {
        "x": "Lyu",
        "y": 98311
      },
      {
        "x": "André",
        "y": -64674
      },
      {
        "x": "Maki",
        "y": -67573
      },
      {
        "x": "Véronique",
        "y": 25014
      },
      {
        "x": "Thibeau",
        "y": -76457
      },
      {
        "x": "Josiane",
        "y": 76729
      },
      {
        "x": "Raphaël",
        "y": -393
      },
      {
        "x": "Mathéo",
        "y": -78083
      },
      {
        "x": "Margot",
        "y": 59624
      },
      {
        "x": "Hugo",
        "y": -2799
      },
      {
        "x": "Christian",
        "y": 30311
      },
      {
        "x": "Louis",
        "y": 95616
      },
      {
        "x": "Ella",
        "y": 85451
      },
      {
        "x": "Alton",
        "y": 3663
      },
      {
        "x": "Jimmy",
        "y": 25130
      },
      {
        "x": "Guillaume",
        "y": -66751
      },
      {
        "x": "Sébastien",
        "y": 2744
      },
      {
        "x": "Alfred",
        "y": -94195
      },
      {
        "x": "Bon",
        "y": -92229
      },
      {
        "x": "Solange",
        "y": -258
      },
      {
        "x": "Kendrick",
        "y": 63786
      },
      {
        "x": "Jared",
        "y": -5824
      },
      {
        "x": "Satoko",
        "y": -63794
      },
      {
        "x": "Tomoko",
        "y": 7628
      },
      {
        "x": "Line",
        "y": -91002
      },
      {
        "x": "Delphine",
        "y": 9496
      },
      {
        "x": "Leonard",
        "y": 47469
      },
      {
        "x": "Alphonse",
        "y": 19350
      },
      {
        "x": "Lisa",
        "y": 41554
      },
      {
        "x": "Bart",
        "y": -68927
      },
      {
        "x": "Benjamin",
        "y": -68373
      },
      {
        "x": "Homer",
        "y": 70219
      },
      {
        "x": "Jack",
        "y": 91792
      }
    ]
  },
  {
    "id": "BH",
    "data": [
      {
        "x": "John",
        "y": 71558
      },
      {
        "x": "Raoul",
        "y": 6652
      },
      {
        "x": "Jane",
        "y": -2984
      },
      {
        "x": "Marcel",
        "y": 67433
      },
      {
        "x": "Ibrahim",
        "y": 72399
      },
      {
        "x": "Junko",
        "y": -94605
      },
      {
        "x": "Lyu",
        "y": 71521
      },
      {
        "x": "André",
        "y": 91163
      },
      {
        "x": "Maki",
        "y": 26976
      },
      {
        "x": "Véronique",
        "y": -14508
      },
      {
        "x": "Thibeau",
        "y": -41796
      },
      {
        "x": "Josiane",
        "y": -32436
      },
      {
        "x": "Raphaël",
        "y": -33588
      },
      {
        "x": "Mathéo",
        "y": -95255
      },
      {
        "x": "Margot",
        "y": 62769
      },
      {
        "x": "Hugo",
        "y": 34321
      },
      {
        "x": "Christian",
        "y": 11200
      },
      {
        "x": "Louis",
        "y": -50255
      },
      {
        "x": "Ella",
        "y": 75241
      },
      {
        "x": "Alton",
        "y": -22719
      },
      {
        "x": "Jimmy",
        "y": 45518
      },
      {
        "x": "Guillaume",
        "y": -71262
      },
      {
        "x": "Sébastien",
        "y": -54154
      },
      {
        "x": "Alfred",
        "y": 54744
      },
      {
        "x": "Bon",
        "y": -66942
      },
      {
        "x": "Solange",
        "y": 808
      },
      {
        "x": "Kendrick",
        "y": 67068
      },
      {
        "x": "Jared",
        "y": -99975
      },
      {
        "x": "Satoko",
        "y": 10541
      },
      {
        "x": "Tomoko",
        "y": 57288
      },
      {
        "x": "Line",
        "y": 64823
      },
      {
        "x": "Delphine",
        "y": 867
      },
      {
        "x": "Leonard",
        "y": -15252
      },
      {
        "x": "Alphonse",
        "y": -71718
      },
      {
        "x": "Lisa",
        "y": 14968
      },
      {
        "x": "Bart",
        "y": 3808
      },
      {
        "x": "Benjamin",
        "y": -33367
      },
      {
        "x": "Homer",
        "y": -75859
      },
      {
        "x": "Jack",
        "y": 67214
      }
    ]
  },
  {
    "id": "BI",
    "data": [
      {
        "x": "John",
        "y": 69948
      },
      {
        "x": "Raoul",
        "y": -3029
      },
      {
        "x": "Jane",
        "y": -53807
      },
      {
        "x": "Marcel",
        "y": 22755
      },
      {
        "x": "Ibrahim",
        "y": 23762
      },
      {
        "x": "Junko",
        "y": 57736
      },
      {
        "x": "Lyu",
        "y": 10791
      },
      {
        "x": "André",
        "y": -62855
      },
      {
        "x": "Maki",
        "y": -83111
      },
      {
        "x": "Véronique",
        "y": -12677
      },
      {
        "x": "Thibeau",
        "y": -63109
      },
      {
        "x": "Josiane",
        "y": -93129
      },
      {
        "x": "Raphaël",
        "y": 96047
      },
      {
        "x": "Mathéo",
        "y": -90178
      },
      {
        "x": "Margot",
        "y": 62422
      },
      {
        "x": "Hugo",
        "y": -46106
      },
      {
        "x": "Christian",
        "y": -28641
      },
      {
        "x": "Louis",
        "y": 66404
      },
      {
        "x": "Ella",
        "y": -55638
      },
      {
        "x": "Alton",
        "y": 23864
      },
      {
        "x": "Jimmy",
        "y": -78476
      },
      {
        "x": "Guillaume",
        "y": 60833
      },
      {
        "x": "Sébastien",
        "y": -34004
      },
      {
        "x": "Alfred",
        "y": -94696
      },
      {
        "x": "Bon",
        "y": 88295
      },
      {
        "x": "Solange",
        "y": 93645
      },
      {
        "x": "Kendrick",
        "y": -6866
      },
      {
        "x": "Jared",
        "y": -76251
      },
      {
        "x": "Satoko",
        "y": -92617
      },
      {
        "x": "Tomoko",
        "y": 48295
      },
      {
        "x": "Line",
        "y": -63119
      },
      {
        "x": "Delphine",
        "y": 69316
      },
      {
        "x": "Leonard",
        "y": 80991
      },
      {
        "x": "Alphonse",
        "y": 90738
      },
      {
        "x": "Lisa",
        "y": -24304
      },
      {
        "x": "Bart",
        "y": 67508
      },
      {
        "x": "Benjamin",
        "y": -4898
      },
      {
        "x": "Homer",
        "y": -66587
      },
      {
        "x": "Jack",
        "y": -43655
      }
    ]
  },
  {
    "id": "BJ",
    "data": [
      {
        "x": "John",
        "y": 4435
      },
      {
        "x": "Raoul",
        "y": -25513
      },
      {
        "x": "Jane",
        "y": -70082
      },
      {
        "x": "Marcel",
        "y": 97318
      },
      {
        "x": "Ibrahim",
        "y": -95494
      },
      {
        "x": "Junko",
        "y": 13696
      },
      {
        "x": "Lyu",
        "y": -74042
      },
      {
        "x": "André",
        "y": 90546
      },
      {
        "x": "Maki",
        "y": 18002
      },
      {
        "x": "Véronique",
        "y": -70441
      },
      {
        "x": "Thibeau",
        "y": 87925
      },
      {
        "x": "Josiane",
        "y": 78530
      },
      {
        "x": "Raphaël",
        "y": -45216
      },
      {
        "x": "Mathéo",
        "y": 49516
      },
      {
        "x": "Margot",
        "y": 87249
      },
      {
        "x": "Hugo",
        "y": -29861
      },
      {
        "x": "Christian",
        "y": -80119
      },
      {
        "x": "Louis",
        "y": -37728
      },
      {
        "x": "Ella",
        "y": -62774
      },
      {
        "x": "Alton",
        "y": 4417
      },
      {
        "x": "Jimmy",
        "y": -13063
      },
      {
        "x": "Guillaume",
        "y": -47831
      },
      {
        "x": "Sébastien",
        "y": -11843
      },
      {
        "x": "Alfred",
        "y": 46614
      },
      {
        "x": "Bon",
        "y": 52582
      },
      {
        "x": "Solange",
        "y": 2402
      },
      {
        "x": "Kendrick",
        "y": 94793
      },
      {
        "x": "Jared",
        "y": 88033
      },
      {
        "x": "Satoko",
        "y": -44366
      },
      {
        "x": "Tomoko",
        "y": -57565
      },
      {
        "x": "Line",
        "y": -8625
      },
      {
        "x": "Delphine",
        "y": -61013
      },
      {
        "x": "Leonard",
        "y": 61312
      },
      {
        "x": "Alphonse",
        "y": 88483
      },
      {
        "x": "Lisa",
        "y": -58378
      },
      {
        "x": "Bart",
        "y": 49465
      },
      {
        "x": "Benjamin",
        "y": -10902
      },
      {
        "x": "Homer",
        "y": -83515
      },
      {
        "x": "Jack",
        "y": 41228
      }
    ]
  },
  {
    "id": "BL",
    "data": [
      {
        "x": "John",
        "y": 50918
      },
      {
        "x": "Raoul",
        "y": -47927
      },
      {
        "x": "Jane",
        "y": -94962
      },
      {
        "x": "Marcel",
        "y": 69158
      },
      {
        "x": "Ibrahim",
        "y": 57877
      },
      {
        "x": "Junko",
        "y": 95987
      },
      {
        "x": "Lyu",
        "y": -85769
      },
      {
        "x": "André",
        "y": -47526
      },
      {
        "x": "Maki",
        "y": -88247
      },
      {
        "x": "Véronique",
        "y": -94674
      },
      {
        "x": "Thibeau",
        "y": 53854
      },
      {
        "x": "Josiane",
        "y": -51600
      },
      {
        "x": "Raphaël",
        "y": -22077
      },
      {
        "x": "Mathéo",
        "y": -74125
      },
      {
        "x": "Margot",
        "y": -96249
      },
      {
        "x": "Hugo",
        "y": -65150
      },
      {
        "x": "Christian",
        "y": 12055
      },
      {
        "x": "Louis",
        "y": 84283
      },
      {
        "x": "Ella",
        "y": -94171
      },
      {
        "x": "Alton",
        "y": -38007
      },
      {
        "x": "Jimmy",
        "y": -47493
      },
      {
        "x": "Guillaume",
        "y": -75513
      },
      {
        "x": "Sébastien",
        "y": -91668
      },
      {
        "x": "Alfred",
        "y": -88418
      },
      {
        "x": "Bon",
        "y": -78042
      },
      {
        "x": "Solange",
        "y": 92830
      },
      {
        "x": "Kendrick",
        "y": -94243
      },
      {
        "x": "Jared",
        "y": 45955
      },
      {
        "x": "Satoko",
        "y": -54354
      },
      {
        "x": "Tomoko",
        "y": 64432
      },
      {
        "x": "Line",
        "y": -93211
      },
      {
        "x": "Delphine",
        "y": 12965
      },
      {
        "x": "Leonard",
        "y": -22008
      },
      {
        "x": "Alphonse",
        "y": -24398
      },
      {
        "x": "Lisa",
        "y": 19132
      },
      {
        "x": "Bart",
        "y": 64675
      },
      {
        "x": "Benjamin",
        "y": 79824
      },
      {
        "x": "Homer",
        "y": 57061
      },
      {
        "x": "Jack",
        "y": -27932
      }
    ]
  }
]

function App() {

  return (
    <>
    <h1>
      test
      {/* <div style={{width : 1200 ,height : 300}}> 
      <HeatMap data={data2}/>
      </div> */}
      {/* <HomePage/>
      <ProteinPage/> */}
    </h1>
    <Router>
      <Routes>
        <Route path = '/' element={<HomePage/>}/>
        <Route path = '/protein/TSBP1' element={<ProteinPage/>}/>
      </Routes>
    </Router>
    </>
  );

}

export default App;


