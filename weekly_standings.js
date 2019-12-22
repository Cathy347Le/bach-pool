var dt = new Date();
document.getElementById("datetime").innerHTML = dt.toLocaleString();

//load data from google sheet doc
window.addEventListener('load', function() {

	console.log(d3.select('#season'))

	var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1cI78iHZaqsk9i3QPYZnbaIy_ZIFK0xct1yC4XItZZkk/pubhtml';

	function renderSpreadsheetData() {
		Tabletop.init( { key: publicSpreadsheetUrl,
					 callback: draw,
					 simpleSheet: true } )
	}

	function draw(data, tabletop) {


		spaghetti = tabletop.sheets("weekly rankings")
		spaghetti_data = spaghetti.elements

		var chartEl = document.querySelector('#chart');
		var rect = chartEl.getBoundingClientRect();
		document.querySelector('.loading').style.display = 'none';
		weeklyStandings(spaghetti_data, rect.width, rect.height);	

	}

	renderSpreadsheetData();
})	


function weeklyStandings(chart_data, width, height) {

	var dullOpacity = 0.1;
	var brightOpacity = 0.3;
	var transitionDuration = 1000;

	var margin = {
		top: 50,
		left: 50,
		right: 100,
		bottom: 50
	};

	width = 1000 - margin.left - margin.right,
	height = 1500 - margin.top - margin.bottom;

	var chart = d3.select('#chart')
		.attr('width', width)
		.attr('height', height);

	const weeks_all = [...new Set(chart_data.map(item => item.week))];	
	//weeks = d3.map(chart_data, function(d) { return d.week; }).keys().map(function(d) { return Number(d); });	

	function bouncer(arr) {
	var notAllowed = ["",false,null,0,undefined,NaN];
	  for (i = 0; i < arr.length; i++){
	      for (j=0; j<notAllowed.length;j++) {
	         arr = arr.filter(function(val) {
	               return val !== notAllowed[j];
	              });
	  }
	 }
	return arr;
	}

	const weeks = bouncer(weeks_all)

	teams = chart_data.map(function(d) { return d.Name});

	most_recent_week = Math.max(...weeks)
	most_recent_week_result = chart_data.filter(function(d) { return d.week == most_recent_week })

	function sortByDateAscending(a, b) {
	    // Dates will be cast to numbers automagically:
	    return a.standing - b.standing;
	}

	most_recent_week_result = most_recent_week_result.sort(sortByDateAscending);

	current_leader = most_recent_week_result[0].Name

	//prev_week = most_recent_week - 1
	//prev_week_data = chart_data.filter(function(d) { return d.week == prev_week })

	//prev_week_data = prev_week_data.map(function(a) {
	//	a.prev_week_standing = a.standing;
	//	a.prev_week = a.week;
	//});	

	//change = _(prev_week_data) // start sequence
	//	.keyBy('Name') // create a dictionary of the 1st array
	//	.mergeWith(_.keyBy(most_recent_week_result, 'Name')) // create a dictionary of the 2nd array, and merge it to the 1st
	//	.values() // turn the combined dictionary to array
		//.value() 

	//change_in_time = _.map(prev_week_data, function(obj) {
	//					return _.assign(obj, _.find(most_recent_week_result, {
	//						Name : obj.Name 
	//					}));
	//				});

	document.getElementById("current_leader").innerHTML = "Current Leader (as of week " + most_recent_week + ")" + ": <b>" + current_leader + "</b>"

	// week
	var x = d3.scaleLinear()
		.range([margin.left , width - margin.right])
		.domain([1,12]);

	num_rows = chart_data.filter(function(d) { return d.week == "1" }).length	

	// position
	var y = d3.scaleLinear()
		.range([margin.top, height - margin.bottom])
		.domain([1, num_rows]);

	var y2 = d3.scaleBand()
		.range([margin.top, height - margin.bottom])

	var xAxis = d3.axisTop()
		.ticks(weeks.length)
		.tickFormat(function(d) { return 'Week ' + d })
		.scale(x);

	var yAxis = d3.axisLeft()
		.ticks(10)
		.scale(y);

	var yAxisRight = d3.axisRight()
		//.tickFormat(data.map(function(d) { return d.Name}))
		//.ticks(65)
		.scale(y2);	
	
	//y2.domain(data.map(function(d) { return d.Name}))

	// show weeks
	chart.append('g')
		.attr('class', 'axis x-axis')
		.transition()
		.duration(transitionDuration)
		.attr('transform', 'translate(0,' + ((margin.top/2) - 5) + ')')
		.call(xAxis)
		.selectAll('text')
		.attr('dy', 2)

	// show position
	chart.append('g')
		.attr('class', 'axis y-axis')
		.attr('transform', 'translate(' + x(.75) + ', 0)')
		.transition()
		.duration(transitionDuration)
		.call(yAxis)
	
	chart.append('text')
		//.attr("x", 15)
		.attr("y", 15)
		.attr("transform", "rotate(-90)")
		.attr("fill", "#000")
		.text("Standing");

	chart.append("g")				
		.attr('class', 'axis y-axis')
		.attr("id", "yaxis")
		.attr("transform", "translate(" + (width - 105) + " ,0)")
		.call(yAxisRight)

	chart.selectAll(".text")
		.data(chart_data)
		.enter()
		.filter(function(d) {
			return d.week == most_recent_week
		})
		.append("text")
		.attr("class", "text")
		.attr("x", 750)
		.attr("y", function(d) { return y(d.standing) + 5 ; })
		.text(function(d) { return d.Name;})
		.on("mouseover", function(type) {
			d3.selectAll(".text")
				.style("opacity", 0.1);
			d3.select(this)
				.style("opacity", 1);
			d3.selectAll(".dot")
				.style("opacity", 0.1)
				.filter(function(d) { 
					return d.Name == type.Name; })
				.style("opacity", 1);
			d3.selectAll(".line")
				.style("opacity", 0.1)
				.filter(function(d) { 
					return d.key == type.Name; })
				.style("opacity", 1);

			showTooltip(type)

		})	
		.on("click", function(type) {
			d3.selectAll(".text")
				.style("opacity", 0.1);
			d3.select(this)
				.style("opacity", 1);
			d3.selectAll(".dot")
				.style("opacity", 0.1)
				.filter(function(d) { 
					return d.Name == type.Name; })
				.style("opacity", 1);
		})	
		.on("mouseout", function(type) {
			d3.selectAll(".text")
				.style("opacity", 1);
			d3.selectAll("circle")
				.style("opacity", 1);		
			d3.selectAll(".line")
				.style("opacity", 1);

			hideTooltip(type)				
		})

	var valueline = d3.line()
		.curve(d3.curveCardinal)
		.x(function(d) { return x(d.week); })
		.y(function(d) { return y(d.standing); });	

	chart_data.forEach(function(d) {
		d.standing = +d.standing;
		d.week = +d.week;
	});

	nest = d3.nest()
		.key(function(d){
			return d.Name;
		})
		.sortValues (function(a,b) { return a.week > b.week ? 1 : -1; })
		.entries(chart_data)

	chart.selectAll(".line")
		.data(nest)
		.enter()
		.append("path")
		.attr("class", "line")
		.style("opacity", 0.75)
		.attr("d", function(d){
				return valueline(d.values)
			});	

	chart.selectAll(".dot")
        .data(chart_data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return x(d.week); })
        .attr("cy", function (d) { return y(d.standing); })
        .attr("r", 5)
		.on("mouseover", function(d) {		
			showTooltip(d)
		})					
		.on("mouseout", function(d) {		
			hideTooltip(d)	
		})		

	function showTooltip(d) {
		var tooltipWidth = d.Name.length * 12;
		
		var tooltip = chart.append('g')
		  .attr('class', 'tooltip');
		
		var tooltipRect = tooltip.append('rect')
		  .attr('width', 0)
		  .attr('height', 60)
		  .attr('fill', 'black')
		  .attr('rx', 3)
		  .attr('ry', 3)
		  .style('opacity', 0)
		  .attr('x', x(d.week))
		  .attr('y', y(d.standing) - 30)
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 0.5)
		  .attr('width', tooltipWidth)
		  .attr('y', y(d.standing) - 60);
		
		var tooltipName = tooltip.append('text')
		  .attr('fill', 'white')
		  .style('opacity', 0)
		  .attr('x', x(d.week) + 5)
		  .attr('y', y(d.standing) - 20)
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 1)
		  .attr('y', y(d.standing) - 42)
		  .text("Name: " + d.Name);

		var tooltipScore = tooltip.append('text')
		  .attr('fill', 'white')
		  .style('opacity', 0)
		  .attr('x', x(d.week) + 5)
		  .attr('y', y(d.standing) - 20)
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 1)
		  .attr('y', y(d.standing) - 28)
		  .text("Score: "  + d.Score);

		var tooltipStanding = tooltip.append('text')
		  .attr('fill', 'white')
		  .style('opacity', 0)
		  .attr('x', x(d.week) + 5)
		  .attr('y', y(d.standing) - 20)
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 1)
		  .attr('y', y(d.standing) - 14)
		  .text("Rank: "  + d.standing);

	}

	function hideTooltip(d) {
		chart.selectAll('.tooltip text')
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 0);
		chart.selectAll('.tooltip rect')
		  .transition()
		  .duration(transitionDuration/2)
		  .style('opacity', 0)
		  .attr('y', function() {
		    return +d3.select(this).attr('y') + 40;
		  })
		  .attr('width', 0)
		  .attr('height', 0);
		chart.select('.tooltip').transition().delay(transitionDuration/2).remove();
	}		
}
