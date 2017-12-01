var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var atlLatLng = new L.LatLng(0, 0);
var myMap = L.map('map').setView(atlLatLng, 1);


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 8,
    minZoom: 2,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA'
}).addTo(myMap);


var svgLayer = L.svg();
svgLayer.addTo(myMap);



var svg = d3.select('#map').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d.accident_number+"</h5><table><thead><tr><td>0-60 mph (s)</td><td>Power (hp)</td><td>Cylinders</td><td>Year</td></tr></thead>"
             + "<tbody><tr><td>"+d.accident_number+"</td><td>"+d.accident_number+"</td><td>"+d.accident_number+"</td><td>"+d.accident_number+"</td></tr></tbody>"
             + "<thead><tr><td>Economy (mpg)</td><td colspan='2'>Displacement (cc)</td><td>Weight (lb)</td></tr></thead>"
             + "<tbody><tr><td>"+d.accident_number+"</td><td colspan='2'>"+d.accident_number+"</td><td>"+d.accident_number+"</td></tr></tbody></table>"
    });
    
svg.call(toolTip);

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
            uninjured: +d['Total_Uninjured'],
            LatLng: [+d['Latitude'], +d['Longitude']]
        };
    }, function(error, dataset) {
        if (error) {
            console.error(error);
            return;
        }
        data = dataset;

        // for (var i =0; i < data.length; i++) {
        //     d = data[i];
        //     var circle = L.circle(d.LatLng, {
        //         // fillColor: '#ffffff',
        //         // color: (d.severity.substring(0,5) == 'Fatal' ? '#800000'
        //         // : d.severity == 'Incident' ? "#ffc61a" : "#e67300"),
        //         // fillOpacity: 0.4,
        //         radius: 4 + ((d.fatal_injuries / 349) * 12) + ((d.serious_injuries / 349) * 12)
        //     }).addTo(myMap);

        //     console.log(circle.getRadius());
        // }

        nodeLinkG.selectAll('.grid-node')
            .data(data)
            .enter().append('circle')
            .attr('class', 'grid-node')
            .style('fill', function(d) {return d.severity.substring(0,5) == 'Fatal' ? '#800000'
                : d.severity == 'Incident' ? "#ffc61a" : "#e67300"})
            .style('stroke', '#ffffff')
            .style('fill-opacity', 0.4)
            .attr('r', function(d) {return 4 + ((d.fatal_injuries / 349) * 12) + ((d.serious_injuries / 349) * 12)})
            .on('click', console.log('b'));
            // .on('mouseover', console.log('hi'))
            // .on('mouseout', toolTip.hide);

        myMap.on('zoomend', updateLayers);
        updateLayers();

    });

function updateLayers(){
    nodeLinkG.selectAll('.grid-node')
        .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
        .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
};