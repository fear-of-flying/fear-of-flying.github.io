var svg = d3.select('#flight_phase svg');

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 20, r: 40, b: 40, l: 200};

var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

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

            var fatalPerPhase = d3.nest()
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
            .entries(fatalInjData);

            console.log("Fatalities Per Phase:");
            console.log(fatalPerPhase);

            var array = fatalPerPhase.slice(1);
            console.log("FatalPerPhase Sliced:");
            console.log(array);

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

            var phases = [];

    });
