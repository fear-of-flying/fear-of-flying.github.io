
// var svg = d3.select("#flight_phase svg");
//
// var svgWidth = +svg.attr('width');
// var svgHeight = +svg.attr('height');
//
//
// d3.csv("./aircraft_incidents.csv",
//     function(d,i){
//         return {
//             severity: d['Injury_Severity'],
//             make: d['Make'],
//             model: d['Model'],
//             airline: d['Air_Carrier'],
//             weather: d['Weather_Condition'],
//             phase: d['Broad_Phase_of_Flight']
//         };
//     },
//
//     function(error, dataset) {
//         if (error) {console.log(error);}
//
//     });

var svg = d3.select('#flight_phase svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 40, b: 40, l: 200};

var barChartWidth = 300;
var barChartHeight = 250;

var barX = d3.scaleLinear().range([120, 290]);

var barXAxis = d3.axisBottom(barX)
    .ticks(6);

var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

d3.csv('./aircraft_incidents.csv',
    function(d) {
        return {
    		accident_number: d['Accident_Number'],
            date: d['Event_Date'],
    		make: d['Make'],
    		model: d['Model'],
    		airline: d['Air_Carrier'],
    		phase: d['Broad_Phase_of_Flight'],
            severity: d['Injury_Severity'],
            damage: d['Aircraft_Damage'],
            fatal_injuries: +d['Total_Fatal_Injuries'],
            serious_injuries: +d['Total_Serious_Injuries'],
            uninjured: +d['Total_Uninjured']
        };
    }, function(error, dataset) {
        if (error) {
            console.error('Error while loading ./aircraft_incidents.csv dataset.');
            console.error(error);
            return;
        }

        incidents = dataset;

        var phaseData = d3.nest()
            .key(function(d) {
                if (d.phase != "OTHER"
                        && d.phase != "UNKNOWN"
                        && d.phase != ""
                        && d.phase != null) {
                            return d.phase;
                        }
            })
            .entries(incidents);

        phaseData.sort(function(a, b) {
            return b.phase - a.phase;
        });

        console.log(phaseData);

        var fatalData = incidents.filter(function(d) {
            if (d.severity != "Unavailable"
                    && d.severity != "Non-Fatal"
                    && d.severity != "Incident"
                    && d.severity != ""
                    && d.phase != null) {
                return d;
            }
        });

        console.log(fatalData);

        var fatalByMake = d3.nest()
            .key(function(d) {
                return d.make;
            })
            .entries(fatalData);

        console.log(fatalByMake);

        var fatalByMakeCount = new Array();



        // just hardcode keys here in order of flight phase
        var phaseDataKeys = [];

        console.log(phaseDataKeys);

        console.log(d3.entries(phaseData));
        console.log(fatalData.length);

        var fatalPerPhaseCount = 0;

        var fatalPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .entries(fatalData);

        console.log(fatalPerPhase);
        console.log(fatalPerPhaseCount);

        var array = fatalPerPhase.slice(1);
        console.log(array);

        console.log

        var data_count = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            // .key(function(d) { return d.priority; })
            .rollup(function(leaves) {
                return leaves.length;
            })
            .entries(fatalPerPhase[0]);

        data_count.forEach(function(element) {
            console.log(element);
        });

        var gridData = gridData();

        var margin = {top: 100, right: 20, bottom: 50, left: 100},
          width = 900 - margin.left - margin.right,
          height = 900 - margin.top - margin.bottom;

        var x = d3.scaleLinear().range([0, 500])
                    .domain([0,20]);


        var grid = d3.select("body").append("svg")
          .attr("width", width )
          .attr("height", height )
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


        var colors = ["#ffe6e6","#ffcccc","#ffb3b3","#ff8080","#e63900"];
      //    var colors = ["red","blue","green"];
        var colorScale = d3.scaleQuantile()
              .domain([0,6])
              .range(colors);

        var row = grid.selectAll(".row")
          .data(gridData)
          .enter().append("g")
          .attr("class", "row");

      var tooltip = grid.append("text").attr("class", "toolTip");

        var column = row.selectAll(".square")
          .data(function(d) { return d; })
          .enter().append("rect")
          .attr("class","square")
          .attr("x", function(d) { return d.x+50; })
          .attr("y", function(d) { return d.y+50; })
          .attr("width", function(d) { return d.width; })
          .attr("height", function(d) { return d.height; })
          // .style("fill", "fff")
          // .transition()
          // .duration(1000)
          .style("fill", function(d){ return colorScale(d.value);})
          // .style("stroke", "#fff")
          .on("mouseover", function(d){

            tooltip.style("visibility","visible")
                  .attr("x",d.x+70)
                  .attr("y",d.y+70)
                  .attr("font-size","20px")
                  .text(d.value);})
          .on("mouseout",function(d){tooltip.style("visibility","hidden");});

          grid.append("g")
            .attr("transform", "translate(0," + 50 + ")")
            .call(d3.axisRight(x)
          .ticks(6));

          grid.append("text")
              .attr("transform", "translate(" + (280) + " ,"+(600)+")")
              .style("text-anchor", "middle")
              .text("HEAT-MAP");

          grid.append("g")
            .attr("transform", "translate("+50+",0)")
            .call(d3.axisBottom(x)
          .ticks(6));

          function gridData() {
            var data = new Array();
            var xpos = 1;
            var ypos = 1;
            var width = 100;
            var height = 100;
            var click = 0;
            var value = 0;


            for (var row = 0; row < 5; row++) {
              data.push( new Array() );
              var rowData = dataset[row];
              // console.log(rowData);

            var element = d3.map(rowData);
            var elementValues = element.values();
              // console.log(elementValues);

              for (var column = 0; column < 5; column++) {

                data[row].push({
                  x: xpos,
                  y: ypos,
                  width: width,
                  height: height,
                  value: elementValues[column]

                })

                xpos += width;
              }

              xpos = 1;

              ypos += height;
            }

            console.log(data);
            return data;
          }

});




// OLD STUFF

// const margin = { top: 50, right: 0, bottom: 100, left: 100 },
//     width = 960 - margin.left - margin.right,
//     height = 900 - margin.top - margin.bottom,
//     gridSize = Math.floor(width / 10),
//     legendElementWidth = gridSize*2,
//     buckets = 9,
//     colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
//     makeKeys = ["Airbus", "Boeing", "Bombardier", "Embraer", "McDonnell\nDouglas"],
//     times = ["Standing", "Taxi", "Takeoff", "Climb", "Cruise", "Descent", "Maneuvering", "Approach", "Go-Around", "Landing"];
//     dataset = "data.tsv";
//
// const svg = d3.select("#chart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// const dayLabels = svg.selectAll(".dayLabel")
//     .data(makeKeys)
//     .enter().append("text")
//       .text(function (d) { return d; })
//       .attr("x", 0)
//       .attr("y", (d, i) => i * gridSize)
//       .style("text-anchor", "end")
//       .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
//       .attr("class", (d, i) => ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));
//
// const timeLabels = svg.selectAll(".timeLabel")
//     .data(times)
//     .enter().append("text")
//       .text((d) => d)
//       .attr("x", (d, i) => i * gridSize)
//       .attr("y", 0)
//       .style("text-anchor", "middle")
//       .attr("transform", "translate(" + gridSize / 2 + ", -6)")
//       .attr("class", (d, i) => ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));
//
// const type = (d) => {
//   return {
//     day: +d.day,
//     hour: +d.hour,
//     value: +d.value
//   };
// };
//
// const heatmapChart = function(tsvFile) {
//   d3.tsv(tsvFile, type, (error, data) => {
//     const colorScale = d3.scaleQuantile()
//       .domain([0, buckets - 1, d3.max(data, (d) => d.value)])
//       .range(colors);
//
//     const cards = svg.selectAll(".hour")
//         .data(data, (d) => d.day+':'+d.hour);
//
//     cards.append("title");
//
//     cards.enter().append("rect")
//         .attr("x", (d) => (d.hour - 1) * gridSize)
//         .attr("y", (d) => (d.day - 1) * gridSize)
//         .attr("rx", 4)
//         .attr("ry", 4)
//         .attr("class", "hour bordered")
//         .attr("width", gridSize)
//         .attr("height", gridSize)
//         .style("fill", colors[0])
//       .merge(cards)
//         .transition()
//         .duration(1000)
//         .style("fill", (d) => colorScale(d.value));
//
//     cards.select("title").text((d) => d.value);
//
//     cards.exit().remove();
//
//     const legend = svg.selectAll(".legend")
//         .data([0].concat(colorScale.quantiles()), (d) => d);
//
//     const legend_g = legend.enter().append("g")
//         .attr("class", "legend")
//         .attr("tr");
//
//     legend_g.append("rect")
//       .attr("x", (d, i) => legendElementWidth * i)
//       .attr("y", height)
//       .attr("width", legendElementWidth)
//       .attr("height", gridSize / 2)
//       .style("fill", (d, i) => colors[i]);
//
//     legend_g.append("text")
//       .attr("class", "mono")
//       .text((d) => "≥ " + Math.round(d))
//       .attr("x", (d, i) => legendElementWidth * i)
//       .attr("y", height + gridSize);
//
//     legend.exit().remove();
//   });
// };
//
// heatmapChart(dataset);
//
// var svg = d3.select("#flight_phase svg");
//
// var svgWidth = +svg.attr('width');
// var svgHeight = +svg.attr('height');
//
//
// d3.csv("./aircraft_incidents.csv",
//     function(d,i){
//         return {
//             severity: d['Injury_Severity'],
//             make: d['Make'],
//             model: d['Model'],
//             airline: d['Air_Carrier'],
//             weather: d['Weather_Condition'],
//             phase: d['Broad_Phase_of_Flight']
//         };
//     },
//
//     function(error, dataset) {
//         if (error) {console.log(error);}
//
//     });
//
// var svg = d3.select('svg');
//
// var svgWidth = +svg.attr('width');
// var svgHeight = +svg.attr('height');
//
// var padding = {t: 20, r: 40, b: 40, l: 200};
//
// var barChartWidth = 300;
// var barChartHeight = 250;
//
// var barX = d3.scaleLinear().range([120, 290]);
//
// var barXAxis = d3.axisBottom(barX)
//     .ticks(6);
//
// var chartG = svg.append('g')
//     .attr('transform', 'translate('+[padding.l, padding.t]+')');
//
// d3.csv('./aircraft_incidents.csv',
//     function(d) {
//         return {
//     		accident_number: d['Accident_Number'],
//             date: d['Event_Date'],
//     		make: d['Make'],
//     		model: d['Model'],
//     		airline: d['Air_Carrier'],
//     		phase: d['Broad_Phase_of_Flight'],
//             severity: d['Injury_Severity'],
//             damage: d['Aircraft_Damage'],
//             fatal_injuries: +d['Total_Fatal_Injuries'],
//             serious_injuries: +d['Total_Serious_Injuries'],
//             uninjured: +d['Total_Uninjured']
//         };
//     }, function(error, dataset) {
//         if (error) {
//             console.error('Error while loading ./aircraft_incidents.csv dataset.');
//             console.error(error);
//             return;
//         }
//
//         incidents = dataset;
//
//         var phaseData = d3.nest()
//             .key(function(d) {
//                 if (d.phase != "OTHER"
//                         && d.phase != "UNKNOWN"
//                         && d.phase != ""
//                         && d.phase != null) {
//                             return d.phase;
//                         }
//             })
//             .entries(incidents);
//
//         phaseData.sort(function(a, b) {
//             return b.phase - a.phase;
//         });
//
//         console.log(phaseData);
//
//         var fatalData = incidents.filter(function(d) {
//             if (d.severity != "Unavailable"
//                     && d.severity != "Non-Fatal"
//                     && d.severity != "Incident"
//                     && d.severity != ""
//                     && d.phase != null) {
//                 return d;
//             }
//         });
//
//         var fatalByMake = d3.nest()
//             .key(function(d) {
//                 return d.make;
//             })
//             .entries(fatalData);
//
//         console.log(fatalByMake);
//
//         // just hardcode keys here in order of flight phase
//         var phaseDataKeys = [];
//
//         console.log(phaseDataKeys);
//
//         console.log(d3.entries(phaseData));
//         console.log(fatalData.length);
//
//         var fatalPerPhase = d3.nest()
//             .key(function(d) {
//                 return d.phase;
//             })
//             .entries(fatalData);
//
//         console.log(fatalPerPhase);
//
//         var bars = d3.select(chartG);
//
//         // bars.append('rect')
//         //     .attr('class', 'bar-chart-container')
//         //     .attr('width', barChartWidth)
//         //     .attr('height', barChartHeight)
//         //     .style('fill', 'white')
//         //     .style('.stroke-width', 2)
//         //     .style('stroke', '#efefef');
//
//         bars.selectAll('.bars')
//             .data(phaseData)
//             .enter();
//
//         bars.append('rect')
//             .attr('x', 10)
//             .attr('y', -10.5)
//             .attr('height', 6)
//             .attr('width', 50)
//             .attr('fill', 'blue');
//
//     });
