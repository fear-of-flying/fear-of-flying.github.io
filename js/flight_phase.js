var svg = d3.select("#flight_phase svg");

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');


d3.csv("./aircraft_incidents.csv", 
    function(d,i){
        return {
            severity: d['Injury_Severity'],
            make: d['Make'],
            model: d['Model'],
            airline: d['Air_Carrier'],
            weather: d['Weather_Condition'],
            phase: d['Broad_Phase_of_Flight']
        };
    },

    function(error, dataset) {
        if (error) {console.log(error);}

    });