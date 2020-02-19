var seasonSelector = d3.select('#season')

selectValue = ''
load = 0
list = ''
roses_and_picks = ''

seasonSelector
  .selectAll("option")
  .data(['Peter W. (2020)','Hannah B. (2019)'])
  .enter()
  .append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) {
        return d[0].toUpperCase() + d.slice(1,d.length);
    })

    seasonSelector.on('change',function() {

        var selectValue = d3.select(this)
            .property('value');

        // clearing existing html/d3 elements when toggling between seasons

        list = ''
        names = ''
        roses_and_picks = ''
        load = 1

        d3.select("#bach-picks-table tbody").remove();
        d3.select("#bach-picks-table thead").remove();

        d3.select("#ranking-table tbody").remove();
        d3.select("#ranking-table thead").remove();  

        d3.select("#compare-picks").select("svg").remove();   
        d3.select('#second_contender').empty()

        document.getElementById("nameDropdown").innerHTML = null; 

        document.getElementById("second_contender").innerHTML = null; 
        document.getElementById("first_contender").innerHTML = null; 
        document.getElementById("name").innerHTML = null;
        document.getElementById("demographic-perf").innerHTML = null;
        document.getElementById("Similarity").innerHTML = null;

        loadSeasonData(selectValue);
      
    })

function loadSeasonData(value) {

    if(value == "Hannah B. (2019)"){
        
        ///////////////////////////////////////
        //
        // these are the men
        //
        ///////////////////////////////////////

        contestants = ["Brian", "Cam", "Chasen", "Connor J.", "Connor S.", "Daron", "Devin", "Dustin", "Dylan", "Garrett", "Grant",
            "Hunter", "Jed", "Joe", "Joey J.", "John Paul Jones", "Jonathan", "Kevin", "Luke P.", "Luke S.", "Matt Donald",
            "Matteo", "Matthew", "Mike", "Peter", "Ryan", "Scott", "Thomas", "Tyler C.", "Tyler G."]

        var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1cI78iHZaqsk9i3QPYZnbaIy_ZIFK0xct1yC4XItZZkk/pubhtml"

        function renderSpreadsheetData() {
            Tabletop.init({
                key: publicSpreadsheetUrl,
                callback: draw,
                simpleSheet: true
            })
        }
        renderSpreadsheetData();

        // linking to demographic plot

        var linkElement = document.createElement('a');
        linkElement.href = "https://raw.githubusercontent.com/GWarrenn/bachelor-ette/master/results/demo_plot.png";

        var elem = document.createElement("img");
        elem.setAttribute("src", "https://raw.githubusercontent.com/GWarrenn/bachelor-ette/master/results/demo_plot.png");

        linkElement.appendChild(elem);

        document.getElementById("demographic-perf").appendChild(linkElement);

    } 

    else if(value == "Peter W. (2020)"){

        ///////////////////////////////////////
        //
        // these are the women
        //
        ///////////////////////////////////////

		contestants = ["Alayah","Avonlea","Alexa","Courtney","Deandra","Eunice","Hannah Ann","Jade",
			"Jasmine","Jenna","Kiarra","Katrina","Kelley","Kelsey","Kylie","Lauren","Lexi","Madison",
			"Maurissa","Megan","Mykenna","Natasha","Payton","Sarah","Savannah","Shiann","Sydney","Tammy",
			"Victoria F.","Victoria P."]

        var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1ddMCPXJQC7wH47mHngIYbIyGMl9Qaoto05DiQ9Shl_g/pubhtml"
 
        var linkElement = document.createElement('a');
        linkElement.href = "https://raw.githubusercontent.com/Cathy347Le/bach-pool/master/images/demo_plot.png";

        var elem = document.createElement("img");
        elem.setAttribute("src", "https://raw.githubusercontent.com/Cathy347Le/bach-pool/master/images/demo_plot.png");

        linkElement.appendChild(elem);

        document.getElementById("demographic-perf").appendChild(linkElement);

		function renderSpreadsheetData() {
            Tabletop.init({
                key: publicSpreadsheetUrl,
                callback: draw,
                simpleSheet: true
            })
        }

        renderSpreadsheetData();

    } 
}

window.addEventListener('load', function() {
    loadSeasonData("Peter W. (2020)")
})  

function draw(data, tabletop) {

    ///////////////////////////////////////
    //
    // load pick data
    //
    ///////////////////////////////////////

    results = tabletop.sheets("picks")
    main_data = results.elements

    ///////////////////////////////////////
    //
    // load weekly results -- rose order
    //
    ///////////////////////////////////////

    weekly_results = tabletop.sheets("weekly results")
    rose_order = weekly_results.elements

    var max = _.maxBy(rose_order, function (o) {
        return parseInt(o.week);
    })

    most_recent_rose_order = rose_order.filter(function (a) {
        return a.week == max.week;
    });

    //reshaping our wide data to long

    long_data = [];
    main_data.forEach(function (row) {
        // Loop through all of the columns, and for each column
        // make a new row
        Object.keys(row).forEach(function (colname) {
            // Ignore 'State' and 'Value' columns
            if (colname == "What is your first and last name?") {
                return
            }
            else if (new Set(contestants).has(colname)) {
                long_data.push({ "Name": row["What is your first and last name?"], "pick_rank": row[colname], "pick_name": colname });
            }
        });
    });

    long_data.forEach(function (n) {
        n.pick_rank = +n.pick_rank
    })

    roses_and_picks = _.map(long_data, function (obj) {
        return _.assign(obj, _.find(most_recent_rose_order, {
            name: obj.pick_name
        }));
    });

    roses_and_picks.forEach(function (d) {
        d.rose_order = +d.rose_order
    })

    UserPicks(roses_and_picks)

    matchUp(long_data)

    ///////////////////////////////////////
    //
    // load weekly rankings -- for table
    //
    ///////////////////////////////////////

    rankings_over_time = tabletop.sheets("weekly rankings")
    ranking_data = rankings_over_time.elements

    var weeks = [...new Set(ranking_data.map(item => item.week))];
    var current_week_ranks = ranking_data.filter(function (d) { return d.week == Math.max(...weeks) })

    document.getElementById("last_updated").innerHTML = "Data last updated: " + current_week_ranks[0]['last updated']

    rankingTable(ranking_data)

}

function UserPicks(data) {

    list = _.uniqBy(long_data, function (e) {
        return e.Name;
    });

    var names = _.map(list, 'Name').sort();

    var dropDown = d3.select('#nameDropdown')

    dropDown
        .selectAll("option")
        .data(names)
        .enter()
        .append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) {
            return d[0].toUpperCase() + d.slice(1, d.length);
        })
        .on("change", onchange)

    dropDown.on('change', function () {

        var selectValue = d3.select(this)
            .property('value');

        updateTable(long_data, selectValue);

    })

    // now get average contestant ranks to be merged in later

    avg_ranks = _(long_data)
        .groupBy('pick_name')
        .map((pick_name, id) => ({
            pick_name: id,
            avg_rank: _.meanBy(pick_name, 'pick_rank'),
        }))
        .value()

    avg_ranks = _.orderBy(avg_ranks, ['avg_rank'], ['asc']);

    adjusted_rank = 1

    avg_ranks.forEach(function (i) {
        i.adjusted_rank = adjusted_rank
        adjusted_rank = i.adjusted_rank + 1
    })

    merged_data = _.map(long_data, function (obj) {
        return _.assign(obj, _.find(avg_ranks, {
            pick_name: obj.pick_name
        }));
    });

    var updateTable = function (data, filter_param) {

        document.getElementById("name").innerHTML = "Bachelorette Picks for: <b>" + filter_param + "</b>"

        d3.select("#bach-picks-table tbody").remove();
        d3.select("#bach-picks-table thead").remove();

        data.forEach(function (d) {
            d.eliminated_fmt = d.eliminated == 1 ? d.rose_order : d.rose_order + " (RO)";
        });

        var table = d3.select('#bach-picks-table')
            .append('table')

        var thead = table.append('thead')
        var tbody = table.append('tbody');

        data = _.orderBy(data, ['pick_rank'], ['asc']);

        display_cols = ['Contestant Name', 'Contestant Rank', 'Avg. Contestant Rank', 'Final Rose Order¹']
        columns = ['pick_name', 'pick_rank', 'adjusted_rank', 'eliminated_fmt']

        filtered_data = data.filter(function (a) { return a.Name == filter_param; });

        //// append the header row
        thead.append('tr')
            .selectAll('th')
            .data(display_cols).enter()
            .append('th')
            .text(function (column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(filtered_data)
            .enter()
            .append('tr');

        rows.exit().remove();

        eliminated = filtered_data.filter(function (a) { return a.eliminated == "1"; });

        color = d3.scaleOrdinal()
            .domain(eliminated)
            .range("#FF0000", "#FF0000");

        // create a cell in each row for each column
        cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return { column: column, value: row[column] };
                });
            })
            .enter()
            .append('td')
            .style("background-color", function (d) { if (d.column == "pick_name") return color(+d.value); })
            .text(function (d) { return d.value; });

        cells.exit().remove();

    }

    temp_filter = names[0]

    updateTable(merged_data, temp_filter)

}

function matchUp(data) {

    var dullOpacity = 0.1;
    var brightOpacity = 0.3;
    var transitionDuration = 1000;

    list = _.uniqBy(data, function (e) {
        return e.Name;
    });

    var names = _.map(list, 'Name');
    names = names.sort()

    var sel1 = names[Math.floor(Math.random() * names.length)];

    console.log(sel1)

    names = names.sort(function (x, y) { return x == sel2 ? -1 : y == sel2 ? 1 : 0; });

    first_contender = d3.select('#first_contender').attr("value", sel1)

    first_contender
        .selectAll("option")
        .data(names)
        .enter()
        .append("option")
        .attr("value", function (d) { return d; })
        .property("selected", function(d){ return d === sel1; })
        .text(function (d) {
            return d[0].toUpperCase() + d.slice(1, d.length);
        })

    first_contender.on('change', function () {
        sel1 = d3.select(this)
            .property('value');
        comparePicks(data, sel1, sel2)

    })

    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    var new_names = names.remove(first_contender)

    var sel2 = new_names[Math.floor(Math.random() * new_names.length)];

    new_names = new_names.sort(function (x, y) { return x == sel2 ? -1 : y == sel2 ? 1 : 0; });

    var second_contender = d3.select('#second_contender')

    second_contender
        .selectAll("option")
        .data(new_names)
        .enter()
        .append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) {
            return d[0].toUpperCase() + d.slice(1, d.length);
        })

    second_contender.on('change', function () {
        sel2 = d3.select(this)
            .property('value');

        comparePicks(data, sel1, sel2)
    })

    var comparePicks = function (data, cand1, cand2) {

        var colorScatter = d3.scaleLinear()
            .domain([-30, 30])
            .range(["#FF3232", "#90ff8e"]);

        d3.select("#compare-picks svg").remove()

        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = 750 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // set the ranges
        x_scatter = d3.scaleLinear().range([0, width]);
        y_scatter = d3.scaleLinear().range([height, 0]);

        compare_picks_plot = d3.select("#compare-picks").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 20)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        cand1_data = data.filter(function (a) {
            return a.Name == sel1;
        });

        cand1_data = _.map(cand1_data, item => {
            let newItem = _.clone(item);
            newItem.cand_1_pick = newItem.pick_rank
            newItem.cand_1_name = newItem.Name

            return newItem;
        });

        cand1 = cand1_data[0].cand_1_name

        cand2_data = data.filter(function (a) {
            return a.Name == sel2;
        });

        cand2_data = _.map(cand2_data, item => {
            let newItem = _.clone(item);
            newItem.cand_2_pick = newItem.pick_rank
            newItem.cand_2_name = newItem.Name
            return newItem;
        });

        cand2 = cand2_data[0].cand_2_name
        cand2_name = cand2_data[0].cand_2_pick

        comb = _.map(cand1_data, function (obj) {
            return _.assign(obj, _.find(cand2_data, {
                pick_name: obj.pick_name
            }));
        });

        comb.forEach(function (d, i) {

            d.cand_1_pick = +d.cand_1_pick
            d.cand_2_pick = +d.cand_2_pick
            d.diff = d.cand_1_pick - d.cand_2_pick

        });

        ///////////////////////////////////////
        //
        // Linear regression to determine pick similarity
        //
        ///////////////////////////////////////

        linearRegression = ss.linearRegression(comb.map(d => [d.cand_1_pick, d.cand_2_pick]))
        linearRegressionLine = ss.linearRegressionLine(linearRegression)

        xCoordinates = [0, 30];

        xCoordinates = xCoordinates.map(d => ({
            x: +d,                         
            y: linearRegressionLine(+d)
        }));

        document.getElementById("Similarity").innerHTML = "Picks for <b>" + cand1 + "</b> & <b>" + cand2 + "</b> are " + Math.floor((linearRegression.m) * 100) + "% similar*";

        x_scatter.domain(d3.extent(comb, function (d) { return d.cand_1_pick; })).nice();
        y_scatter.domain(d3.extent(comb, function (d) { return d.cand_2_pick; })).nice();

        compare_picks_plot.append("line")
            .attr("class", "regression")
            .attr("x1", x_scatter(xCoordinates[0].x))
            .attr("y1", y_scatter(xCoordinates[0].y))
            .attr("x2", x_scatter(xCoordinates[1].x))
            .attr("y2", y_scatter(xCoordinates[1].y));    

        compare_picks_plot.selectAll(".dot")
            .data(comb)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("stroke", "black")
            .attr("opacity", .7)
            .attr("r", 5)
            .attr("cx", function (d) { return x_scatter(d.cand_1_pick); })
            .attr("cy", function (d) { return y_scatter(d.cand_2_pick); })
            .style("fill", function (d) { return colorScatter(d.diff); })
            .on("mouseover", function (d) {
                showPickName(d)
            })
            .on("mouseout", function (d) {
                hidePickName(d)
            })

        compare_picks_plot.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x_scatter));

        // text label for the x axis
        compare_picks_plot.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 10) + ")")
            .style("text-anchor", "middle")
            .style("font", "12px arial")
            .text(cand1);

        compare_picks_plot.append("g")
            .call(d3.axisLeft(y_scatter));

        // text label for the y axis
        compare_picks_plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font", "12px arial")
            .text(cand2);
    }

    comparePicks(data, sel1, sel2)

    function showPickName(d) {
        var tooltipWidth = d.Name.length * 12;

        var tooltip = compare_picks_plot.append('g')
            .attr('class', 'tooltip');

        var tooltipRect = tooltip.append('rect')
            .attr('width', 0)
            .attr('height', 60)
            .attr('fill', 'black')
            .attr('rx', 3)
            .attr('ry', 3)
            .style('opacity', 0)
            .attr('x', x_scatter(d.cand_1_pick))
            .attr('y', y_scatter(d.cand_2_pick) - 30)
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 0.5)
            .attr('width', tooltipWidth)
            .attr('y', y_scatter(d.cand_2_pick) - 60);

        var tooltipName = tooltip.append('text')
            .attr('fill', 'white')
            .style('opacity', 0)
            .attr('x', x_scatter(d.cand_1_pick) + 5)
            .attr('y', y_scatter(d.cand_2_pick) - 20)
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 1)
            .attr('y', y_scatter(d.cand_2_pick) - 42)
            .text("Contestant: " + d.pick_name);

        var tooltipScore = tooltip.append('text')
            .attr('fill', 'white')
            .style('opacity', 0)
            .attr('x', x_scatter(d.cand_1_pick) + 5)
            .attr('y', y_scatter(d.cand_2_pick) - 20)
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 1)
            .attr('y', y_scatter(d.cand_2_pick) - 28)
            .text(d.cand_1_name + " Ranking: " + d.cand_1_pick);

        var tooltipStanding = tooltip.append('text')
            .attr('fill', 'white')
            .style('opacity', 0)
            .attr('x', x_scatter(d.cand_1_pick) + 5)
            .attr('y', y_scatter(d.cand_2_pick) - 20)
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 1)
            .attr('y', y_scatter(d.cand_2_pick) - 14)
            .text(d.cand_2_name + " Ranking: " + d.cand_2_pick);

    }

    function hidePickName(d) {
        compare_picks_plot.selectAll('.tooltip text')
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 0);
        compare_picks_plot.selectAll('.tooltip rect')
            .transition()
            .duration(transitionDuration / 2)
            .style('opacity', 0)
            .attr('y', function () {
                return +d3.select(this).attr('y') + 40;
            })
            .attr('width', 0)
            .attr('height', 0);
        compare_picks_plot.select('.tooltip').transition().delay(transitionDuration / 2).remove();
    }
}

function rankingTable(tabledata) {

    rank_data = Object.create(tabledata);

    // format the data
    rank_data.forEach(function (d) {
        d.standing = +d.standing
        d.Score = +d.Score
        d.week = d.week
        //d.Correct_fmt = +d.Correct_fmt
    });

    console.log(rank_data)

    var weeks = [...new Set(rank_data.map(item => item.week))];

    var this_week = Math.max(...weeks)

    var current_week_ranks = rank_data.filter(function (d) { return d.week == this_week })
    var previous_week_ranks = rank_data.filter(function (d) { return d.week == this_week - 1 })

    previous_week_ranks.forEach(function (d) {
        d.prev_Score = +d.Score
        d.prev_rank = +d.standing
    });

	console.log(current_week_ranks)

    Object.keys(previous_week_ranks).forEach(o => {
        previous_week_ranks.forEach(p =>
            delete p['Score']
        )
        previous_week_ranks.forEach(p =>
            delete p['week']
        )
        previous_week_ranks.forEach(p =>
            delete p['standing']
        )
    });

    current_week_ranks = _.map(current_week_ranks, function (obj) {
        return _.assign(obj, _.find(previous_week_ranks, {
            Name: obj.Name
        }));
    });

    if(this_week > 1){
	    current_week_ranks.forEach(function (d) {
	        d.change_score = Math.round((+d.Score - +d.prev_Score) * 100) / 100
	        d.change_standing = +d.prev_rank - +d.standing

	        d.change_standing = d.change_standing > 0 ? "+" + d.change_standing : d.change_standing;
	    });
	}
	else{
	    current_week_ranks.forEach(function (d) {
	        d.change_score = 0
	        d.change_standing = 0

	        d.change_standing = 0
	    });		
	}

    d3.select("#ranking-table tbody").remove();
    d3.select("#ranking-table thead").remove();

    var table = d3.select('#ranking-table')
        .append('table')

    var thead = table.append('thead')
    var tbody = table.append('tbody');

    rank_data = _.orderBy(current_week_ranks, ['standing'], ['asc']);

    display_cols = ['Name', 'Score', 'Rank', 'Rank Change Since Last Week']
    columns = ['Name', 'Score', 'standing', 'change_standing']

    //// append the header row
    thead.append('tr')
        .selectAll('th')
        .data(display_cols).enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(rank_data)
        .enter()
        .append('tr');

    rows.exit().remove();

    min = _.minBy(rank_data, function (o) {
        return o.change_score;
    })

    min_change = min["change_score"]
    min_change2 = min["change_standing"]

    max = _.maxBy(rank_data, function (o) {
        return o.change_score;
    })

    max_change = max["change_score"]
    max_change2 = max["change_standing"]

    color = d3.scaleLinear()
        .domain([max["Score"], -.5])
        .range(["#71e554", "#ffffff"]);

    score_change = d3.scaleLinear()
        .domain([min_change, max_change])
        .range(["#FFA07A", "#c6efce"]);

    rank_change = d3.scaleLinear()
        .domain([min_change2, max_change2])
        .range(["#FFA07A", "#c6efce"]);

    var sequentialScale = d3.scaleSequential()
        .domain([min_change, max_change])
        .interpolator(d3.interpolatePiYG);

    var sequentialScale2 = d3.scaleSequential()
        .domain([-10, 10])
        .interpolator(d3.interpolatePiYG);

    back_to_number = d3.format(".4r")

    // create a cell in each row for each column
    cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] };
            });
        })
        .enter()
        .append('td')
        .style("background-color", function (d) { if (d.column == "Score") return color(+d.value); return d.value })
        .style("background-color", function (d) { if (d.column == "change_standing") return sequentialScale2(+d.value); return d.value })
        .style("fill-opacity", function (d) { if(d.column == "change_standing") return .5})
        .text(function (d) { return d.value; });

    cells.exit().remove();
}