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

        console.log(incidents);

        var totalInjuries = d3.nest()
            .key(function(d) {
                return d.phase;
            })
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.fatal_injuries;
                });
            })
            .entries(incidents);

        console.log(totalInjuries);

        // var bars = cell.selectAll('.bars')
        //     .data(totalInjuries[])

    });
