var svg = d3.select('#flight_phase svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 40, b: 40, l: 200};

var chartG = svg.append('g');

var phases = ["STANDING", "TAKEOFF", "CLIMB", "CRUISE", "DESCENT",
                 "APPROACH", "MANEUVERING", "GO-AROUND", "LANDING", "TAXI"];

for (var i = 0; i < phases.length; i++) {
  var x = 200 + i*320;

  var img = chartG.append('image')
    .attr('class', 'phase_img')
    .attr('href', '/img/'+phases[i]+'.png')
    .attr('transform', 'scale(0.25,0.25) translate('+[x, 350]+')');
}

d3.csv('./aircraft_incidents.csv',
    function(d) {
        return {
    		// accident_number: d['Accident_Number'],
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

            var fatalPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return {
                    "avgFatalInj": d3.mean(v, function(d) {
                        return d.fatal_injuries;
                    }),
                    "avgSerInj": d3.mean(v, function(d) {
                        return d.serious_injuries;
                    }),
                    "avgUninj": d3.mean(v, function(d, i) {
                        return d.uninjured;
                    })
                };
            })
            .entries(incidents);

            // console.log("Fatalities Per Phase:");
            // console.log(fatalPerPhase);

            var avgPhaseFatalTotal = 0;

            phases.forEach(function(d) {
                fatalPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseFatalTotal += v.value.avgFatalInj;
                    }
                })
            });

            //console.log(avgPhaseFatalTotal);

            var avgPhaseFatalPercData = new Array();

            phases.forEach(function(d) {
                fatalPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseFatalPercData.push((v.value.avgFatalInj / avgPhaseFatalTotal) * 100);
                    }
                });
            });

            console.log(avgPhaseFatalPercData);

            var serInjPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return {
                    "avgFatalInj": d3.sum(v, function(d) {
                        return d.fatal_injuries;
                    }),
                    "avgSerInj": d3.sum(v, function(d) {
                        return d.serious_injuries;
                    }),
                    "avgUninj": d3.sum(v, function(d) {
                        return d.uninjured;
                    })
                };
            })
            .entries(incidents);

            // console.log("Serious Injuries Per Phase:");
            // console.log(serInjPerPhase);

            var avgPhaseSerInjTotal = 0;

            phases.forEach(function(d) {
                serInjPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseSerInjTotal += v.value.avgSerInj;
                    }
                })
            });

            //console.log(avgPhaseSerInjTotal);

            var avgPhaseSerInjPercData = new Array();

            phases.forEach(function(d) {
                serInjPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseSerInjPercData.push((v.value.avgSerInj / avgPhaseSerInjTotal) * 100);
                    }
                });
            });

            //console.log(avgPhaseSerInjPercData);

            var uninjPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return {
                    "avgFatalInj": d3.sum(v, function(d) {
                        return d.fatal_injuries;
                    }),
                    "avgSerInj": d3.sum(v, function(d) {
                        return d.serious_injuries;
                    }),
                    "avgUninj": d3.sum(v, function(d) {
                        return d.uninjured;
                    })
                };
            })
            .entries(incidents);

            // console.log("Uninjured Per Phase:");
            // console.log(uninjPerPhase);

            var avgPhaseUninjTotal = 0;

            phases.forEach(function(d) {
                uninjPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseUninjTotal += v.value.avgUninj;
                    }
                })
            });

            //console.log(avgPhaseUninjTotal);

            var avgPhaseUninjPercData = new Array();

            phases.forEach(function(d) {
                uninjPerPhase.forEach(function(v) {
                    if (v.key == d) {
                        avgPhaseUninjPercData.push((v.value.avgUninj / avgPhaseUninjTotal) * 100);
                    }
                });
            });

            //console.log(avgPhaseUninjPercData);

            var fatalInjPercData = new Array();
            var serInjPercData = new Array();
            var uninjPercData = new Array();

            phases.forEach(function(d) {
                fatalPerPhase.forEach(function(v) {
                    var avgFatalInjTotal = 0;

                    if (v.key == d) {
                        var avgTotal = v.value.avgFatalInj + v.value.avgSerInj + v.value.avgUninj;

                        var avgFatalInjPerc = (v.value.avgFatalInj / avgTotal) * 100;
                        var avgSerInjPerc = (v.value.avgSerInj / avgTotal) * 100;
                        var avgUninjPerc = (v.value.avgUninj / avgTotal) * 100;

                        //console.log(v.value.avgFatalInj);

                        fatalInjPercData.push(avgFatalInjPerc);
                        serInjPercData.push(avgSerInjPerc);
                        uninjPercData.push(avgUninjPerc);
                    }
                });
            });

            // console.log(fatalInjPercData);
            // console.log(serInjPercData);
            // console.log(uninjPercData);

            function gridData() {
                var data = new Array();
                var xpos = 1;
                var ypos = 1;
                var width = 80;
                var height = 80;
                var click = 0;
                var value = 0;

                for (var row = 0; row < 2; row++) {
                    data.push(new Array());

                    for (var column = 0; column < 10; column++) {
                        if (row == 0) {
                            data[row].push({
                                type: "fatal",
                                x: xpos,
                                y: ypos,
                                width: width,
                                height: height,
                                value: avgPhaseFatalPercData[column]
                            })
                            xpos += width;
                        } else if (row == 1) {
                            data[row].push({
                                type: "serious",
                                x: xpos,
                                y: ypos,
                                width: width,
                                height: height,
                                value: avgPhaseSerInjPercData[column]
                            })
                            xpos += width;
                        }
                    }
                    xpos = 1;
                    ypos += height;
                }
                //console.log(data);
                return data;
            }

            var gridData = gridData();

            var margin = {top: 100, right: 20, bottom: 50, left: 100},
                width = 900 - margin.left - margin.right,
                height = 900 - margin.top - margin.bottom;

            var fatalPercMax = d3.max(avgPhaseFatalPercData, function(d) { return d; });

            var fatalX = d3.scaleLinear().range([0, 500])
                        .domain([0, fatalPercMax]);

            var serInjMax = d3.max(avgPhaseSerInjPercData, function(d) { return d; });

            var serInjX = d3.scaleLinear().range([0, 500])
                        .domain([0, serInjMax]);

            var uninjMax = d3.max(avgPhaseSerInjPercData, function(d) { return d; });

            var uninjX = d3.scaleLinear().range([0, 500])
                        .domain([0, uninjMax]);

            // console.log(avgPhaseFatalPercData);
            // console.log(avgPhaseSerInjPercData);

            // svg.attr("width", width )
            //     .attr("height", height )
            //     .append("g")
            //     .attr("transform",
            //           "translate(" + margin.left + "," + margin.top + ")");

            var fatalColors = ["#ffe6e6", "#ffb3b3", "#ff8080", "#cc0000"];
            var serInjColors = ["#ffd1b3", "#ffb380", "#ff944d", "#ff751a"];
            var uninjColors = ["#e6ffe6", "#b3ffb3", "80ff80", "00cc00"];

            var fatalColorScale = d3.scaleQuantile()
                .domain([0, fatalPercMax])
                .range(fatalColors);
            var serInjColorScale = d3.scaleQuantile()
                .domain([0, serInjMax])
                .range(serInjColors);

            var row = chartG.selectAll(".row")
                .data(gridData)
                .enter().append("g")
                .attr("class", "row");

            var tooltip = chartG.append("text").attr("class", "toolTip");

            var column = row.selectAll(".square")
                .data(function(d) { return d; })
                .enter().append("rect")
                .attr("class", 'square')
                .attr("x", function(d) { return d.x+50; })
                .attr("y", function(d) { return d.y+150; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", function(d) { return d.width; })
                .attr("height", function(d) { return d.height; })
                .style("fill", "#fff")
                .style("stroke", "#fff")

                column.on('mouseover', function(d, i) {
                    //console.log(d);
                    select(d,i);
                    // var highlightClass = (d.key).replace(/\s/g, "");
                    // d3.selectAll('.highlight').classed('notSelected', true);
                    // d3.selectAll('.highlight.' + highlightClass)
                    //     .classed('notSelected', false)
                    //     .classed('selected', true);
                }).on('mouseout', function(d) {
                    chartG.selectAll('.square.hidden').classed('hidden', false);
                    chartG.selectAll('.percentText').remove();
                    // d3.selectAll('.highlight')
                    //     .classed('notSelected', false)
                    //     .classed('selected', false);

                })

                column.transition().duration(1000)
                .style("fill", function(d) {
                    if (d.type == "fatal") {
                        return fatalColorScale(d.value);
                    } else if (d.type == "serious") {
                        return serInjColorScale(d.value);
                    }
                })
    });

function select(d) {
  var o = null;
  chartG.selectAll('.square')
    .classed('hidden', function(other, j) {
      if (d.x != other.x) {
        return true;
      } else if (d.x == other.x && d.y != other.y) {
        o = other;
        return false;
      }
      return false;
    })

  chartG.append('text')
    .text(Number(d.value).toFixed(1) + '%')
    .attr('class', 'percentText')
    .attr('text-anchor', 'middle')
    .attr('x', d.x + 90)
    .attr('y', d.y + 200)
    //.on('mouseover', select(d));

  chartG.append('text')
    .text(Number(o.value).toFixed(1) + '%')
    .attr('class', 'percentText')
    .attr('text-anchor', 'middle')
    .attr('x', o.x + 90)
    .attr('y', o.y + 200)
    //.on('mouseover', select(o));
}

