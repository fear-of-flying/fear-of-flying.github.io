var svg = d3.select("#main svg");


// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

padding = {t:20, l:100, r:20, b:20};

var chartG = svg.append('g')
	.attr('transform', 'translate('+[padding.l, padding.t]+')');


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

		data = dataset;
		
		makes = d3.map(dataset, function(d) {return d.make;}).keys();
		chartWidth = svgWidth/2;
		xScale = d3.scaleLinear()
			.domain([0, 1215])
			.range([0, chartWidth]);
			
		yScale = d3.scaleLinear()
			.domain([0, makes.length])
			.range([0, svgHeight/2]);
		
		var squares = chartG.selectAll('.square')
			.data(data);
		var squaresEnter = squares.enter()
			.append('rect')
			.attr('class', 'square')
			.attr('width', 2)
			.attr('height', 10)
			.style('fill', '#ffffff')
			.attr('stroke-width', 0.1)
			.style('stroke', '#000000')
			.attr('transform', function(d) {
				var t = makeBins(d);
				return 'translate('+[t[0], t[1]]+')'
			});
			
		var textNode = chartG.selectAll('.textNode')
			.data(makes);
			
		textNode.enter().append('rect')
			.attr('class', 'textBox')
			.style('fill', '#ffffff')
			.attr('stroke-width', 0.1)
			.style('stroke', '#000000')
			.attr('width', function(d) {return d.length*9})
			.attr('height', '20')
			.attr('transform', function(d,i) {
				return 'translate('+[-d.length*9-7, yScale(i)-4.5]+')'
			})
			.on('click', function(d,i) {expandMake(d,i)});
			
		textNode.enter().append('text')
			.attr('class', 'makeText')
			.text(function(d) {return d;})
			.attr('text-anchor', 'end')
			.attr('transform', function(d,i) {
				return 'translate('+[-10, yScale(i) + 10]+')'
			})
			.on('click', function(d,i) {expandMake(d,i)});
	});
	
var make_count = {};
function makeBins(d) {
	var y = yScale(makes.indexOf(d.make));
	
	if (y in make_count) {
				make_count[y] ++;
				x = xScale(make_count[y]);
			} else {
				make_count[y] = 0;
				x = xScale(0);
			}
	
	return [x,y]
}

function expandMake(make,i) {
	models = d3.map(d3.nest()
		.key(function(d) {return d.make})
		.entries(data)[i].values,
		function(d) {return d.model}).keys();

	var push = models.length * 30;

	make_count = {};
	model_count = {};

	modelYScale = d3.scaleLinear()
		.domain([0,models.length])
		.range([yScale(i)+30, yScale(i)+push]);

	var squares = chartG.selectAll('.square')
		.transition()
    	.duration(750)
		.attr('transform', function(d) {
			var t = modelBins(d);
			return 'translate('+[t[0], makes.indexOf(d.make) > i 
				? t[1] + push : t[1]]+')'
		});

	var textBoxes = chartG.selectAll('.textBox')
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			console.log(d);
			return 'translate('+[-d.length*9-7, idx > i ? yScale(idx)-4.5 +  push : yScale(idx)-4.5]+')'
		});

	var makeTexts = chartG.selectAll('.makeText')
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			console.log(d);
			return 'translate('+[-10, idx > i ? yScale(idx) + 10 +  push : yScale(idx) + 10]+')'
		});


}

var model_count = {};
function modelBins(d) {
	var y = models.indexOf(d.model);
	if (y == -1) {return makeBins(d);}

	y = modelYScale(y);
	
	if (y in model_count) {
		model_count[y] ++;
		x = xScale(model_count[y]);
	} else {
		model_count[y] = 0;
		x = xScale(0);
	}
	
	return [x,y]
}
