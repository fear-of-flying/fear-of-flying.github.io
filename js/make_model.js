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

updateDescription();

d3.csv("./aircraft_incidents.csv",
	function(d,i){
		return {
			severity: d['Injury_Severity'],
			make: d['Make'],
			model: d['Model'],
			airline: d['Air_Carrier'],
			weather: d['Weather_Condition'],
			phase: d['Broad_Phase_of_Flight'],
            fatal_injuries: +d['Total_Fatal_Injuries'],
            serious_injuries: +d['Total_Serious_Injuries']
		};
	},

	function(error, dataset) {
		if (error) {console.log(error);}

		data = dataset.sort(function(a,b){
			if (a.severity.substring(0,5) == 'Fatal')
				return 1;
			else if (a.severity == 'Incident')
				return -1;
			else if (b.severity.substring(0,5) == 'Fatal')
				return -1;
			else if (b.severity == 'Incident')
				return 1;
			else
				return 0;
		});
		
		makes = d3.map(data, function(d) {return d.make;}).keys();
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
			.style('fill', function(d) {return d.severity.substring(0,5) == 'Fatal' ? '#800000'
                : d.severity == 'Incident' ? "#ffc61a" : "#e67300"})
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
			.style('fill', '#DDE4EA')
			.attr('stroke-width', 0.1)
			.style('stroke', '#000000')
			.attr('width', function(d) {return d.length*9})
			.attr('height', '20')


		textNode.append('text')
			.text(function(d) {return d;})
			.attr('text-anchor', 'end')
			.attr('transform', function(d,i) {
				return 'translate('+[d.length*8.7, 15]+')'
			});

		var countNode = chartG.selectAll('g countNode')
			.data(makes);

		countNode = countNode.enter()
			.append('text')
			.attr('class', 'countNode')	
			.text(function(d,i) {return +make_count[yScale(i)] + 1;})
			.attr('transform', function(d,i) {
				y = yScale(i);
				x = xScale(make_count[y]);
				return 'translate('+[110+x, 10+y]+')'
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

function updateDescription() {
	var p = document.getElementById("make_model_p");
	if (active == -1) {
		//info about color coding geneeral info about why boeing has most
		p.innerHTML = "Below you can see the number of accidents per make."
			+ " The bars represent the number of accidents from the years 1995 to 2016,"
			+ " colored by red for fatal, orange for serious injuries, and yellow for incident."
			+ " Why are Boeing aircrafts are the most likely to be involved in accidents?"
			+ " Click on a plane's make to learn more.";
	} else if (active == 0) {
		p.innerHTML = "Airbus is a multi-national company with European roots."
			+" The company's most commonly flown commercial plane is the A320 designed for short"
			+" and medium ranges.";
	} else if (active == 1) {
		p.innerHTML = "Boeing is probably the most familiar to many Americans as one of the largest employers and exporters in the US."
			+" The 737 is the most produced large jet-powered civilian aircraft."
			+" It has more accidents than any other company's models combined.";
	} else if (active == 2) {
		p.innerHTML = "Blurb about Bombardier"
			+" ....rcial plane is the A320 designed for short"
			+" ....";
	} else if (active == 3) {
		p.innerHTML = "Blurb about MD"
			+" ....rcial plane is the A320 designed for short"
			+" ....";
	} else if (active == 4) {
		p.innerHTML = "Blurb about Embraer"
			+" ....rcial plane is the A320 designed for short"
			+" ....";
	}

}

function expandMake(make,i) {
	chartG.selectAll('.modelNode').remove();
	chartG.selectAll('.plane_img').remove();
	chartG.selectAll('.modelCountNode').remove();

	if (active == i) {
		active = -1;

		closeMake();
		updateDescription();
		return;
	}

	active = i;
	updateDescription();
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


	var countNode = chartG.selectAll('.countNode')
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			y = yScale(idx);
			x = xScale(make_count[y]);
			return 'translate('+[idx == i ? 90 : 110+x, idx > i ? 10 + y + push : 10 + y]+')'
		});

	//plane images
	for(var j = 0; j < models.length; j++) {
		var img = chartG.append('image')
		.attr('class', 'plane_img')
		.attr('xlink:href', 'https://raw.githubusercontent.com/fear-of-flying/fear-of-flying.github.io/master/img/'+models[j]+'.png')
		.attr('transform', 'scale(0.5,0.5) translate('+[-100, yScale(i)]+')');

		img.transition()
    	.duration(750)
    	.attr('transform', 'scale(0.5,0.5) translate('+[-100, 20 + 2*modelYScale(j)-4.5]+')');
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

	var countNode = chartG.selectAll('g modelCountNode')
		.data(models);

	countNode = countNode.enter()
		.append('text')
		.attr('class', 'modelCountNode')	
		.text(function(d,i) {return +model_count[modelYScale(i)] + 1;})
		.attr('transform', function(d,idx) {
			y = yScale(i);
			x = xScale(model_count[modelYScale(idx)]);
			return 'translate('+[110+x, 10+y]+')'
		});

	//animations
	countNode
		.transition()
    	.duration(750)
		.attr('transform', function(d,idx) {
			y = modelYScale(idx);
			x = xScale(model_count[y]);
			return 'translate('+[110+x, 10+y]+')'
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

	var countNode = chartG.selectAll('.countNode')
		.transition()
    	.duration(750)
		.attr('transform', function(d,i) {
			y = yScale(i);
			x = xScale(make_count[y]);
			return 'translate('+[110+x, 10+y]+')'
		});
}
