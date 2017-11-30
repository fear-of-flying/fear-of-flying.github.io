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

var svg = d3.select('svg');

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

        // just hardcode keys here in order of flight phase
        var phaseDataKeys = [];

        console.log(phaseDataKeys);

        console.log(d3.entries(phaseData));
        console.log(fatalData.length);

        var fatalPerPhase = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .entries(fatalData);

        console.log(fatalPerPhase);

        var bars = d3.select(chartG);

        // bars.append('rect')
        //     .attr('class', 'bar-chart-container')
        //     .attr('width', barChartWidth)
        //     .attr('height', barChartHeight)
        //     .style('fill', 'white')
        //     .style('.stroke-width', 2)
        //     .style('stroke', '#efefef');

        bars.selectAll('.bars')
            .data(phaseData)
            .enter();

        bars.append('rect')
            .attr('x', 10)
            .attr('y', -10.5)
            .attr('height', 6)
            .attr('width', 50)
            .attr('fill', 'blue');

    });
