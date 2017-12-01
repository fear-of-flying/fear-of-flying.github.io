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
            LatLng: [+d['Latitude'], +d['Longitude']],
            location: [d['Location']]
        };
    }, function(error, dataset) {
        if (error) {
            console.error(error);
            return;
        }
        data = dataset;

        for (var i =0; i < data.length; i++) {
            var d = data[i];

            //unknown lat long
            if (d.LatLng[0] == 0 && d.LatLng[1] == 0)
                continue;

            var size = 10 + 2* (((d.fatal_injuries / 349) * 12) + ((d.serious_injuries / 349) * 12));

            var myIcon = L.icon({
                iconUrl: (d.severity.substring(0,5) == 'Fatal' ? '/img/red.png'
                    : d.severity == 'Incident' ? '/img/yellow.png' : "/img/orange.png"),
                iconSize: [size, size]
            });

            L.marker(d.LatLng, {icon: myIcon}).addTo(myMap).bindPopup("<h5>"+d.location+"</h5><table><thead>"
             + "<tr><td align=\"right\"><b>Date | </b></td><td>"+d.date+"</td></tr></thead>"
             + "<tbody><tr><td align=\"right\"><b>Make & Model | </b></td><td>"+d.make+" "+d.model+"</td></tr></tbody>"
             + "<tbody><tr><td align=\"right\"><b>Airline | </b></td><td>"+(d.airline == "" ? "Unknown" : d.airline.indexOf('(') != -1
                ? d.airline.substring(0, d.airline.indexOf('(')) : d.airline)+"</td></tr></tbody>"
             
             + "<tbody><tr><td align=\"right\"><b>Total Fatalities | </b></td><td>"+d.fatal_injuries+"</td></tr></tbody>"
             + "<tbody><tr><td align=\"right\"><b>Total Injured | </b></td><td>"+d.serious_injuries+"</td></tr></tbody>"
             + "<tbody><tr><td align=\"right\"><b>Aircraft Damage | </b></td><td>"+(d.damage == "" ? "Unknown" : d.damage)+"</td></tr></tbody></table>");
        }

        myMap.on('zoomend', updateLayers);
        updateLayers();

    });

function updateLayers(){
    nodeLinkG.selectAll('.grid-node')
        .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
        .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
};