var svg = d3.select("#make_model svg");


// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

padding = {t:20, l:100, r:20, b:20};

var chartG = svg.append('g')
	.attr('transform', 'translate('+[padding.l, padding.t]+')');

var squaresG = chartG.append('g')
	.attr('transform', 'translate('+[padding.l, 0]+')');

var active = -1;


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
			.domain([0, makes.length-1])
			.range([0, svgHeight/5]);
		
		var squares = squaresG.selectAll('.square')
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
			
		var textNode = chartG.selectAll('g textNode')
			.data(makes)

		var textNode = textNode.enter()
			.append('g')
			.attr('class', 'textNode')
			.attr('transform', function(d,i) {
				return 'translate('+[-d.length*9 + 80, yScale(i)-4.5]+')'
			})
			.on('click', function(d,i) {expandMake(d,i)});


		textNode.append('rect')
			.attr('class', 'textBox')
			.style('fill', '#c1f0f0')
			.attr('stroke-width', 0.1)
			.style('stroke', '#000000')
			.attr('width', function(d) {return d.length*9})
			.attr('height', '20')
			
			
		textNode.append('text')
			.attr('class', 'makeText')
			.text(function(d) {return d;})
			.attr('text-anchor', 'end')
			.attr('transform', function(d,i) {
				return 'translate('+[d.length*8.7, 15]+')'
			});
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
	chartG.selectAll('.modelNode').remove();
	chartG.selectAll('.plane_img').remove();

	if (active == i) {
		active = -1;
		closeMake();
		return;
	}

	active = i;
	models = d3.map(d3.nest()
		.key(function(d) {return d.make})
		.entries(data)[i].values,
		function(d) {return d.model}).keys();

	var push = models.length * 60 + 50;

	//reset counts for histogram
	make_count = {};
	model_count = {};

	modelYScale = d3.scaleLinear()
		.domain([0,models.length-1])
		.range([yScale(i)+50, yScale(i)+push - 50]);

	//transition bars
	var squares = squaresG.selectAll('.square')
		.transition()
    	.duration(500)
		.attr('transform', function(d) {
			var t = modelBins(d);
			return 'translate('+[t[0], makes.indexOf(d.make) > i 
				? t[1] + push : t[1]]+')'
		});

	//move labels

	var textNode = chartG.selectAll('.textNode')
		.transition()
    	.duration(500)
		.attr('transform', function(d,idx) {
			return 'translate('+[-d.length*9 + 80, idx > i ? yScale(idx)-4.5 +  push : yScale(idx)-4.5]+')'
		});

	//plane images
	for(var j = 0; j < models.length; j++) {
		var img = chartG.append('image')
		.attr('class', 'plane_img')
		.attr('xlink:href', 'img/'+models[j]+'.PNG')
		.attr('transform', 'scale(0.5,0.5) translate('+[-100, yScale(i)]+')')

		img.transition()
    	.duration(750)
    	.attr('transform', 'scale(0.5,0.5) translate('+[-100, 20 + 2*modelYScale(j)-4.5]+')')
		// .attr('y', 20 + 2*modelYScale(j)-4.5)
		// .attr('x', -100);
	}

	//make labels for models

	var modelNode = chartG.selectAll('g modelNode')
			.data(models)

	var modelNode = modelNode.enter()
		.append('g')
		.attr('class', 'modelNode')
		.attr('transform', function(d,idx) {
			return 'translate('+[-d.length*9 + 80, yScale(i)-4.5]+')'
		})
		.on('click', function(d,i) {expandMake(d,i)});
			
	modelNode.append('rect')
		.style('fill', '#ffffff')
		.attr('stroke-width', 0.1)
		.style('stroke', '#000000')
		.attr('width', function(d) {return d.length*9.5})
		.attr('height', '20');

	modelNode.append('text')
		.text(function(d) {return d;})
		.attr('text-anchor', 'end')
		.attr('transform', function(d,i) {
			return 'translate('+[d.length*8.7, 15]+')'
		});



	modelNode
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			return 'translate('+[-d.length*9 + 80, modelYScale(idx)-4.5]+')'
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

function closeMake() {
	//reset counts for histogram
	make_count = {};

	//transition bars
	var squares = chartG.selectAll('.square')
		.transition()
    	.duration(750)
		.attr('transform', function(d) {
			var t = makeBins(d);
			return 'translate('+[t[0], t[1]]+')'
		});

	//move labels
	var textNode = chartG.selectAll('.textNode')
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			return 'translate('+[-d.length*9 + 80, yScale(idx)-4.5]+')'
		});
}
