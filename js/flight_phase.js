var svg = d3.select('#flight_phase svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 40, b: 40, l: 200};

var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var phases = ["STANDING", "TAXI", "TAKEOFF", "CLIMB", "CRUISE", "DESCENT",
                "MANEUVERING", "APPROACH", "GO-AROUND", "LANDING"];

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

            console.log("Phases Array:")
            console.log(phaseData);

            var fatalInjData = incidents.filter(function(d) {
                if (d.fatal_injuries > 0) {
                    return d;
                }
            });

            console.log("Fatal Injuries Array:")
            console.log(fatalInjData);

            var serInjData = incidents.filter(function(d) {
                if (d.serious_injuries > 0) {
                    return d;
                }
            });

            console.log("Serious Injuries Array:")
            console.log(serInjData);

            var uninjData = incidents.filter(function(d) {
                if (d.uninjured > 0) {
                    return d;
                }
            });

            console.log("Uninjured Array:")
            console.log(uninjData);

            var fatalStanding = new Array();
            var fatalTaxi = new Array();
            var fatalTakeoff = new Array();
            var fatalClimb = new Array();
            var fatalCruise = new Array();
            var fatalDescent = new Array();
            var fatalManeuvering = new Array();
            var fatalApproach = new Array();
            var fatalGoAround = new Array();
            var fatalLanding = new Array();

            // phases.forEach(function(d) {
            //     console.log(d);
            //     fatalInjData.forEach(function(v) {
            //         if (v.phase == d) {
            //             var percent = v.fatal_injuries / (v.fatal_injuries + v.serious_injuries + v.uninjured);
            //             percent *= 100;
            //             if (v.phase == phases[0]) {
            //                 if (fatalStanding.length == 0) {
            //                     fatalStanding.push(phases[0]);
            //                 }
            //                 fatalStanding.push(percent);
            //             } else if (v.phase == phases[1]) {
            //                 if (fatalTaxi.length == 0) {
            //                     fatalTaxi.push(phases[1]);
            //                 }
            //                 fatalTaxi.push(percent);
            //             } else if (v.phase == phases[2]) {
            //                 if (fatalTakeoff.length == 0) {
            //                     fatalTakeoff.push(phases[2]);
            //                 }
            //                 fatalTakeoff.push(percent);
            //             } else if (v.phase == phases[3]) {
            //                 if (fatalClimb.length == 0) {
            //                     fatalClimb.push(phases[3]);
            //                 }
            //                 fatalClimb.push(percent);
            //             } else if (v.phase == phases[4]) {
            //                 if (fatalCruise.length == 0) {
            //                     fatalCruise.push(phases[4]);
            //                 }
            //                 fatalCruise.push(percent);
            //             } else if (v.phase == phases[5]) {
            //                 if (fatalDescent.length == 0) {
            //                     fatalDescent.push(phases[5]);
            //                 }
            //                 fatalDescent.push(percent);
            //             } else if (v.phase == phases[6]) {
            //                 if (fatalManeuvering.length == 0) {
            //                     fatalManeuvering.push(phases[6]);
            //                 }
            //                 fatalManeuvering.push(percent);
            //             } else if (v.phase == phases[7]) {
            //                 if (fatalApproach.length == 0) {
            //                     fatalApproach.push(phases[7]);
            //                 }
            //                 fatalApproach.push(percent);
            //             } else if (v.phase == phases[8]) {
            //                 if (fatalGoAround.length == 0) {
            //                     fatalGoAround.push(phases[8]);
            //                 }
            //                 fatalGoAround.push(percent);
            //             } else if (v.phase == phases[9]) {
            //                 if (fatalLanding.length == 0) {
            //                     fatalLanding.push(phases[9]);
            //                 }
            //                 fatalLanding.push(percent);
            //             }
            //         }
            //     });
            // });
            //
            // var fatalPercent = [fatalStanding, fatalTaxi, fatalTakeoff, fatalClimb, fatalCruise,
            //                     fatalDescent, fatalManeuvering, fatalApproach, fatalGoAround, fatalLanding];
            // console.log(fatalPercent);

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

            console.log("Fatalities Per Phase:");
            console.log(fatalPerPhase);

            var fatalInjPercData = new Array();
            var serInjPercData = new Array();
            var uninjPercData = new Array();

            var fatalByPhasePercData = new Array();

            phases.forEach(function(d) {
                fatalPerPhase.forEach(function(v) {
                    var avgFatalInjTotal = 0;

                    if (v.key == d) {
                        var avgTotal = v.value.avgFatalInj + v.value.avgSerInj + v.value.avgUninj;
                        var avgFatalInjTotal;

                        var avgFatalInjPerc = (v.value.avgFatalInj / avgTotal) * 100;
                        var avgSerInjPerc = (v.value.avgSerInj / avgTotal) * 100;
                        var avgUninjPerc = (v.value.avgUninj / avgTotal) * 100;

                        console.log(v.value.avgFatalInj);

                        fatalInjPercData.push(avgFatalInjPerc);
                        serInjPercData.push(avgSerInjPerc);
                        uninjPercData.push(avgUninjPerc);

                        // var avgFatalByPhasePerc = v.value.avgFatalInj /
                    }
                });
            });

            console.log(fatalInjPercData);
            console.log(serInjPercData);
            console.log(uninjPercData);

            var serInjPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return {
                    "fatalInjCount": d3.sum(v, function(d) {
                        return d.fatal_injuries;
                    }),
                    "seriousInjCount": d3.sum(v, function(d) {
                        return d.serious_injuries;
                    }),
                    "uninjCount": d3.sum(v, function(d) {
                        return d.uninjured;
                    })
                };
            })
            .entries(serInjData);

            console.log("Serious Injuries Per Phase:");
            console.log(serInjPerPhase);

            var uninjPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return {
                    "fatalInjCount": d3.sum(v, function(d) {
                        return d.fatal_injuries;
                    }),
                    "seriousInjCount": d3.sum(v, function(d) {
                        return d.serious_injuries;
                    }),
                    "uninjCount": d3.sum(v, function(d) {
                        return d.uninjured;
                    })
                };
            })
            .entries(uninjData);

            console.log("Uninjured Per Phase:");
            console.log(uninjPerPhase);

            console.log(uninjPerPhase[0]);


    });
