
import React from 'react';
import { ResponsiveHeatMapCanvas } from '@nivo/heatmap'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const HeatMap = ({ data /* see data tab */ }) => (

    // make sure parent container have a defined height when using
    // responsive component, otherwise height will be 0 and
    // no chart will be rendered.
    // website examples showcase many properties,
    // you'll often use just a few of them.

   
        <ResponsiveHeatMapCanvas
            // ref = {ref} // functional components can not be given a ref, use refforward instead error
            data={data}
            margin={{ top: 20, right: 60, bottom: 45, left: 100 }}
            // valueFormat=">-.2s"
            // enableGridX={true}
            // enableGridY={true}
            axisTop={null}
            // axisBottom={null}
            // axisLeft={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -90,
                legend: '',
                legendOffset: 46
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 15,
                tickRotation: 0,
                legend: '',//aminoacid abbreviation
                legendPosition: 'middle',
                legendOffset: -35
            }}
            axisRight={null}
            colors={{
                type: 'quantize',
                scheme: 'red_yellow_green',
                steps: 10,
                minValue: -100000,
                maxValue: 100000
            }}
            emptyColor="#555555"
            // borderWidth={1}
            // borderColor="#000000"
            enableLabels={false}
            inactiveOpacity={0.2}

            legends={[{
                    anchor: 'left',
                    translateX: -80,
                    translateY: 0,
                    length: 200,
                    thickness: 10,
                    direction: 'column',
                    tickPosition: 'after',
                    tickSize: 3,
                    tickSpacing: 4,
                    tickOverlap: false,
                    // tickFormat: '>-.2s',
                    title: 'Value →',
                    titleAlign: 'start',
                    titleOffset: 4
                }
            ]}
            animate ={false}
            hoverTarget="column"
            annotations={[]}
            // isInteractive={false}
            // tooltip= { (input) =>
            //     {
            //         console.log(input)
            //         return(
            //             <>
            //                 tooltip
            //                 <br>
            //                 </br>
            //                 {input.cell.formattedValue}
            //             </>
            //         )
                  
            //     }
            // }
            onClick={
                (input) => {console.log(input)
                
                }
            }
        />
    )

export default HeatMap;



// const HeatMap = forwardRef ( ({ data /* see data tab */ },ref) => (

//     // make sure parent container have a defined height when using
//     // responsive component, otherwise height will be 0 and
//     // no chart will be rendered.
//     // website examples showcase many properties,
//     // you'll often use just a few of them.

   
//         <ResponsiveHeatMapCanvas
//             // ref = {ref} // functional components can not be given a ref, use refforward instead error
//             data={data}
//             margin={{ top: 20, right: 60, bottom: 45, left: 100 }}
//             // valueFormat=">-.2s"
//             // enableGridX={true}
//             // enableGridY={true}
//             axisTop={null}
//             axisBottom={null}
//             axisLeft={null}
//             // axisBottom={{
//             //     tickSize: 5,
//             //     tickPadding: 5,
//             //     tickRotation: -90,
//             //     legend: '',
//             //     legendOffset: 46
//             // }}
//             // axisLeft={{
//             //     tickSize: 5,
//             //     tickPadding: 15,
//             //     tickRotation: 0,
//             //     legend: '',//aminoacid abbreviation
//             //     legendPosition: 'middle',
//             //     legendOffset: -35
//             // }}
//             axisRight={null}
//             colors={{
//                 type: 'quantize',
//                 scheme: 'red_yellow_green',
//                 steps: 10,
//                 minValue: -100000,
//                 maxValue: 100000
//             }}
//             emptyColor="#555555"
//             // borderWidth={1}
//             // borderColor="#000000"
//             enableLabels={false}
//             inactiveOpacity={0.2}

//             legends={[]}
//                 // {
//                 //     anchor: 'left',
//                 //     translateX: -80,
//                 //     translateY: 0,
//                 //     length: 200,
//                 //     thickness: 10,
//                 //     direction: 'column',
//                 //     tickPosition: 'after',
//                 //     tickSize: 3,
//                 //     tickSpacing: 4,
//                 //     tickOverlap: false,
//                 //     // tickFormat: '>-.2s',
//                 //     title: 'Value →',
//                 //     titleAlign: 'start',
//                 //     titleOffset: 4
//             //     }
//             // ]}
//             animate ={false}
//             hoverTarget="column"
//             annotations={[]}
//             // isInteractive={false}
//             // tooltip= { (input) =>
//             //     {
//             //         console.log(input)
//             //         return(
//             //             <>
//             //                 tooltip
//             //                 <br>
//             //                 </br>
//             //                 {input.cell.formattedValue}
//             //             </>
//             //         )
                  
//             //     }
//             // }
//             onClick={
//                 (input) => {console.log(input)
                
//                 }
//             }
//         />
//     ))