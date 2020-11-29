var aggchartData;
var linechartData;
var colchartData;

var prev_month="April";
var new_month="April";

var margin = {top: 20, right: 20, bottom: 30, left: 100},
width = 800 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var x,y, xAxis, yAxis, color;
var svg;

Promise.all([d3.json("aggchartdata.json")]).then(function (data) {
    aggchartData = data[0];
    console.log("Hello!");
    console.log(aggchartData['4']);
    


    var x0  = d3.scaleBand().rangeRound([0, width], .5);
    var x1  = d3.scaleBand()
                .padding(0.25);
    var y   = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis;

    var yAxis = d3.axisLeft().scale(y);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#svg1')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var monthnames;
    var typenames;



    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    xAxis = d3.axisBottom().scale(x0)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            .tickValues(aggchartData.map(d=>d.month));
    monthnames = aggchartData.map(function(d) { return d.month; });
    typenames  = aggchartData[0].values.map(function(d) { return d.Type; });
    console.log(monthnames);
    x0.domain(monthnames);
    x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(aggchartData, function(key) { return d3.max(key.values, function(d) { return d.count; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','1')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");


    var slice = svg.selectAll(".slice")
        .data(aggchartData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.month) + ",0)"; })
        .on("mouseover", function(d) {

            //new_month =d3.select(this).datum().month;
            //console.log(new_month)
            //drawlinechart(new_month);
            
        });
    
    slice.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.Type); })
                .style("fill", function(d) { return color(d.Type) })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return height - y(0); })
            .on("mouseover", function(d) {

                new_month =d3.select(this.parentNode).datum().month;
                console.log(new_month)
                if(new_month!= prev_month){
                    drawlinechart(new_month);
                    prev_month=new_month;
                }
                d3.select(this).style("fill", d3.rgb(color(d.Type)).darker(2));
                
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", color(d.Type));
            });
    
    
        slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });
    
        //Legend
        var legend = svg.selectAll(".legend")
            .data(aggchartData[0].values.map(function(d) { return d.Type; }).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");
        
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return color(d); });
        
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {return d; });
        
        legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
        


});
  
Promise.all([d3.json("barchartdata.json")]).then(function (data) {
    linechartData = data[0];
    console.log("Hello!");
    
    
    x  = d3.scaleBand().rangeRound([0, width], .5);//().range([0,width]);

    y   = d3.scaleLinear().rangeRound([height, 0]);

    
    
    color = d3.scaleOrdinal(d3.schemeCategory10);

    svg = d3.select('#svg2')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var hournames=linechartData[0].values[0].values.map(function(d) { return d.hour; });
    x.domain(hournames);
    xAxis = d3.axisBottom().scale(x)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            .tickValues(hournames);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "yaxis")

    drawlinechart(new_month);

  
});

function drawlinechart(month){
    
    
    months=linechartData.map(function(d) { return d.month; });
    function month_id(d,i){return +i;}
    //console.log(months.indexOf("April"))
    selected_month=linechartData[months.indexOf(month)]
    
    
    var typenames=selected_month.values.map(function(d) { return d.type; });
    
    y.domain([0, d3.max(selected_month.values, d=>  d3.max(d.values, key=>key.count))]);
    

   yAxis = d3.axisLeft().scale(y);

   svg.selectAll(".yaxis")
   .style('opacity','1')
    .transition()
    .duration(2000)
    .call(yAxis);
    

    var groups = svg.selectAll("foo")
        .data(selected_month.values)
    //    .enter()
    //    .append("g");
    
    //console.log(linechartData[0].values[0][0]);
    var line = d3.line()
        .x(function(d) { return x(d.hour); })
        .y(function(d) { return y(d.count); });
   
        
   this.svg.selectAll('path')
    
    .transition()
    .duration(700)
    .attr("stroke-width", 0)        
    .remove();
   var lines = groups
    .enter()
    .append("path")
    .attr("class","foo")
    .merge(groups)
    .transition()
    .duration(2000)
    .attr("d", d => line(d.values))
    .attr("fill", "none")
    .attr("stroke", (d, i) => color(i))
    .attr("stroke-width", 2.5)
    
}

Promise.all([d3.json("colchartdata.json")]).then(function (data) {
    colchartData = data[0];
    console.log("Hello!");
    console.log(colchartData);
    
    var data = colchartData[0].values;

    data.forEach(function(d) {
        //console.log(d.values[0].incoming)
        d.total = d.incoming+d.outgoing;
        //d.total = d3.sum(d.values[0], k => k.incoming+k.outgoing)
        return d;
    })

    monthnames = colchartData.map(function(d) { return d.month; });
    var groups =   data.map(function(d) { return d.Start; });
    var subgroups= d3.keys(data[0]).slice(1,3)
    console.log(subgroups);
    
    console.log(groups);
    
    y  = d3.scaleBand()
        .rangeRound([height, 0], .5)
        .padding(0.1)
		.paddingOuter(0.2)
		.paddingInner(0.2);//().range([0,width]);

    x   = d3.scaleLinear().rangeRound([0, width]);

  
    
    svg = d3.select('#svg3')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    
    //x0.domain(monthnames);
    //x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
    y.domain(groups);

    color = d3.scaleOrdinal(d3.schemeCategory10).domain(subgroups);

    
    //var hournames=linechartData[0].values[0].values.map(function(d) { return d.hour; });
    
    xAxis = d3.axisBottom().scale(x)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            //.tickValues(hournames);

    
    svg.append("g")
        .attr("class", "yaxis")
    yAxis = d3.axisLeft().scale(y)
            .tickValues(groups);

    //svg.selectAll(".yaxis").transition().duration(10)
    //    .call(d3.axisLeft(y).tickSizeOuter(0))


    svg.selectAll(".yaxis")
        .style('opacity','1')
         .transition()
         .duration(2000)
         .call(yAxis);
        

    x.domain([0, d3.max(data, d => d.total)]).nice();
    
    
    data.sort((a, b) => d3.descending(a.total, b.total))
    console.log(data);

    var stackedData = d3.stack()
        .keys(subgroups)
        (data)
    
    console.log(stackedData);
    svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function(d) { console.log(d.key); return color(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("y", function(d) { return y(d.data.Start)})	    //.attr("x", function(d) { return x(d.data.State); })
      .attr("x", function(d) { return x(d[0]); })			    //.attr("y", function(d) { return y(d[1]); })	
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })	//.attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("height", y.bandwidth());						    //.attr("width", x.bandwidth());	
      console.log(this);
    /*

    var group = svg.selectAll("g.layer")
            .data(d3.stack().keys(placenames)(data), d => d.key)
    
    console.log(group);

    group.exit().remove();

    group.enter().insert("g", ".yaxis").append("g")
			.classed("layer", true)
            .attr("fill", d => color(d.key));
            
    var bars = svg.selectAll("g.layer").selectAll("rect")
    .data(d => d, e => e.data.values);

    console.log(bars);

    //console.log(this);

    //console.log(x(d[0]));
    




    bars.exit().remove()

    bars.enter().append("rect")
			.attr("height", y.bandwidth())
			.merge(bars)
		.transition().duration(10)
			.attr("y", function(d){ 
                console.log(d.data.place);
                y(d.data.place)})
			.attr("x", d => x(d[0]))
			.attr("width", d => x(d[1]) - x(d[0]))



    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.selectAll(".x axis").transition().duration(10)
        .call(d3.axisTop(x).ticks(null, "s"))

    //drawlinechart(new_month);

    /*
    var keys = csv.columns.slice(2);

	var year   = [...new Set(csv.map(d => d.Year))]
	var states = [...new Set(csv.map(d => d.State))]

	var options = d3.select("#year").selectAll("option")
		.data(year)
	.enter().append("option")
		.text(d => d)

	var svg = d3.select("#chart"),
		margin = {top: 35, left: 35, bottom: 0, right: 15},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	var y = d3.scaleBand()
		.range([margin.top, height - margin.bottom])
		.padding(0.1)
		.paddingOuter(0.2)
		.paddingInner(0.2)

	var x = d3.scaleLinear()
		.range([margin.left, width - margin.right])

	var yAxis = svg.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.attr("class", "y-axis")

	var xAxis = svg.append("g")
		.attr("transform", `translate(0,${margin.top})`)
		.attr("class", "x-axis")

	var z = d3.scaleOrdinal()
		.range(["steelblue", "darkorange", "lightblue"])
		.domain(keys);

	update(d3.select("#year").property("value"), 0)

	function update(input, speed) {

		var data = csv.filter(f => f.Year == input)

		data.forEach(function(d) {
			d.total = d3.sum(keys, k => +d[k])
			return d
		})

		x.domain([0, d3.max(data, d => d.total)]).nice();

		svg.selectAll(".x-axis").transition().duration(speed)
			.call(d3.axisTop(x).ticks(null, "s"))

		data.sort(d3.select("#sort").property("checked")
			? (a, b) => b.total - a.total
			: (a, b) => states.indexOf(a.State) - states.indexOf(b.State))

		y.domain(data.map(d => d.State));

		svg.selectAll(".y-axis").transition().duration(speed)
			.call(d3.axisLeft(y).tickSizeOuter(0))

		var group = svg.selectAll("g.layer")
			.data(d3.stack().keys(keys)(data), d => d.key)

		group.exit().remove()

		group.enter().insert("g", ".y-axis").append("g")
			.classed("layer", true)
			.attr("fill", d => z(d.key));

		var bars = svg.selectAll("g.layer").selectAll("rect")
			.data(d => d, e => e.data.State);

		bars.exit().remove()

		bars.enter().append("rect")
			.attr("height", y.bandwidth())
			.merge(bars)
		.transition().duration(speed)
			.attr("y", d => y(d.data.State))
			.attr("x", d => x(d[0]))
			.attr("width", d => x(d[1]) - x(d[0]))

		var text = svg.selectAll(".text")
			.data(data, d => d.State);

		text.exit().remove()

		text.enter().append("text")
			.attr("class", "text")
			.attr("text-anchor", "start")
			.merge(text)
		.transition().duration(speed)
			.attr("y", d => y(d.State) + y.bandwidth() / 2)
			.attr("x", d => x(d.total) + 5)
			.text(d => d.total)
	}

	var select = d3.select("#year")
		.on("change", function() {
			update(this.value, 750)
		})

	var checkbox = d3.select("#sort")
		.on("click", function() {
			update(select.property("value"), 750)
		})
    

/*
    var x0  = d3.scaleBand().rangeRound([0, width], .5);
    var x1  = d3.scaleBand()
                .padding(0.25);
    var y   = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis;

    var yAxis = d3.axisLeft().scale(y);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#svg1')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var monthnames;
    var typenames;



    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    xAxis = d3.axisBottom().scale(x0)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            .tickValues(aggchartData.map(d=>d.month));
    monthnames = aggchartData.map(function(d) { return d.month; });
    typenames  = aggchartData[0].values.map(function(d) { return d.Type; });
    console.log(monthnames);
    x0.domain(monthnames);
    x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(aggchartData, function(key) { return d3.max(key.values, function(d) { return d.count; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','1')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");


    var slice = svg.selectAll(".slice")
        .data(aggchartData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.month) + ",0)"; })
        .on("mouseover", function(d) {

            //new_month =d3.select(this).datum().month;
            //console.log(new_month)
            //drawlinechart(new_month);
            
        });
    
    slice.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.Type); })
                .style("fill", function(d) { return color(d.Type) })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return height - y(0); })
            .on("mouseover", function(d) {

                new_month =d3.select(this.parentNode).datum().month;
                console.log(new_month)
                if(new_month!= prev_month){
                    drawlinechart(new_month);
                    prev_month=new_month;
                }
                d3.select(this).style("fill", d3.rgb(color(d.Type)).darker(2));
                
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", color(d.Type));
            });
    
    
        slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });
    
        //Legend
        var legend = svg.selectAll(".legend")
            .data(aggchartData[0].values.map(function(d) { return d.Type; }).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");
        
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return color(d); });
        
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {return d; });
        
        legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
        
*/

});
