var aggchartData;
var linechartData;
var colchartData;

var prev_month = "April";
var new_month = "April";

var margin = { top: 50, right: 20, bottom: 30, left: 100 },
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var x, y, xAxis, yAxis, color;
var svg;

var bar_x, y, bar_xAxis, bar_yAxis, bar_color;
var bar_svg;

Promise.all([d3.json("./data/aggchartdata.json")]).then(function (data) {
  aggchartData = data[0];
  console.log("Hello!");
  console.log(aggchartData["4"]);

  var x0 = d3.scaleBand().rangeRound([0, width], 0.5);
  var x1 = d3.scaleBand().padding(0.25);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  var xAxis;

  var yAxis = d3.axisLeft().scale(y);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  var svg = d3
    .select("#svg1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var monthnames;
  var typenames;

  svg.select(".y").transition().duration(500).delay(1300).style("opacity", "1");

  xAxis = d3
    .axisBottom()
    .scale(x0)
    //.tickFormat(d3.timeFormat("Month %V"))
    .tickValues(aggchartData.map((d) => d.month));
  monthnames = aggchartData.map(function (d) {
    return d.month;
  });
  typenames = aggchartData[0].values.map(function (d) {
    return d.Type;
  });
  console.log(monthnames);
  x0.domain(monthnames);
  x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
  y.domain([
    0,
    d3.max(aggchartData, function (key) {
      return d3.max(key.values, function (d) {
        return d.count;
      });
    }),
  ]);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .style("opacity", "1")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Value");

  var slice = svg
    .selectAll(".slice")
    .data(aggchartData)
    .enter()
    .append("g")
    .attr("class", "g")
    .attr("transform", function (d) {
      return "translate(" + x0(d.month) + ",0)";
    })
    .on("mouseover", function (d) {
      //new_month =d3.select(this).datum().month;
      //console.log(new_month)
      //drawlinechart(new_month);
    });

  slice
    .selectAll("rect")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("rect")
    .attr("width", x1.bandwidth())
    .attr("x", function (d) {
      return x1(d.Type);
    })
    .style("fill", function (d) {
      return color(d.Type);
    })
    .attr("y", function (d) {
      return y(0);
    })
    .attr("height", function (d) {
      return height - y(0);
    })
    .on("mouseover", function (d) {
      new_month = d3.select(this.parentNode).datum().month;
      console.log(new_month);
      if (new_month != prev_month) {
        drawlinechart(new_month);
        drawbarchart(new_month);
        prev_month = new_month;
      }
      d3.select(this).style("fill", d3.rgb(color(d.Type)).darker(2));
    })
    .on("mouseout", function (d) {
      d3.select(this).style("fill", color(d.Type));
    });

  slice
    .selectAll("rect")
    .transition()
    .delay(function (d) {
      return Math.random() * 1000;
    })
    .duration(1000)
    .attr("y", function (d) {
      return y(d.count);
    })
    .attr("height", function (d) {
      return height - y(d.count);
    });

  //Legend
  var legend = svg
    .selectAll(".legend")
    .data(
      aggchartData[0].values
        .map(function (d) {
          return d.Type;
        })
        .reverse()
    )
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    })
    .style("opacity", "0");

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function (d) {
      return color(d);
    });

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      return d;
    });

  legend
    .transition()
    .duration(500)
    .delay(function (d, i) {
      return 1300 + 100 * i;
    })
    .style("opacity", "1");
});

Promise.all([d3.json("./data/barchartdata.json")]).then(function (data) {
  linechartData = data[0];
  console.log("Hello!");

  x = d3.scaleBand().rangeRound([0, width], 0.5); //().range([0,width]);

  y = d3.scaleLinear().rangeRound([height, 0]);

  color = d3.scaleOrdinal(d3.schemeCategory10);

  svg = d3
    .select("#svg2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var hournames = linechartData[0].values[0].values.map(function (d) {
    return d.hour;
  });
  x.domain(hournames);
  xAxis = d3
    .axisBottom()
    .scale(x)
    //.tickFormat(d3.timeFormat("Month %V"))
    .tickValues(hournames);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g").attr("class", "yaxis");

  drawlinechart(new_month);
});

function drawlinechart(month) {
  months = linechartData.map(function (d) {
    return d.month;
  });
  function month_id(d, i) {
    return +i;
  }
  //console.log(months.indexOf("April"))
  selected_month = linechartData[months.indexOf(month)];

  var typenames = selected_month.values.map(function (d) {
    return d.type;
  });

  y.domain([
    0,
    d3.max(selected_month.values, (d) => d3.max(d.values, (key) => key.count)),
  ]);

  yAxis = d3.axisLeft().scale(y);

  svg
    .selectAll(".yaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(yAxis);

  var groups = svg.selectAll("foo").data(selected_month.values);
  //    .enter()
  //    .append("g");

  //console.log(linechartData[0].values[0][0]);
  var line = d3
    .line()
    .x(function (d) {
      return x(d.hour);
    })
    .y(function (d) {
      return y(d.count);
    });

  this.svg
    .selectAll("path")

    .transition()
    .duration(700)
    .attr("stroke-width", 0)
    .remove();
  var lines = groups
    .enter()
    .append("path")
    .attr("class", "foo")
    .merge(groups)
    .transition()
    .duration(2000)
    .attr("d", (d) => line(d.values))
    .attr("fill", "none")
    .attr("stroke", (d, i) => color(i))
    .attr("stroke-width", 2.5);
}

Promise.all([d3.json("./data/colchartdata.json")]).then(function (data) {
  colchartData = data[0];
  console.log("Hello!");
  console.log(colchartData);

  bar_y = d3
    .scaleBand()
    .rangeRound([height, 0], 0.5)
    .padding(0.1)
    .paddingOuter(0.2)
    .paddingInner(0.2); //().range([0,width]);

  bar_x = d3.scaleLinear().rangeRound([0, width]);

  bar_svg = d3
    .select("#svg3")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  bar_svg.append("g").attr("class", "yaxis");
  bar_yAxis = d3.axisLeft().scale(bar_y);

  bar_xAxis = d3.axisBottom().scale(bar_x);

  bar_svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")");

  drawbarchart(new_month);
});

function drawbarchart(month) {
  var bar_data = colchartData[months.indexOf(month)].values;
  console.log(bar_data);

  bar_data.forEach(function (d) {
    //console.log(d.values[0].incoming)
    //d.incoming=Math.abs(d.incoming);
    d.total = Math.abs(d.incoming) + d.outgoing;

    d.incoming = -Math.abs(d.incoming);
    //d.total = d3.sum(d.values[0], k => k.incoming+k.outgoing)
    return d;
  });

  bar_data = bar_data.sort((a, b) => d3.ascending(a.total, b.total));
  console.log(bar_data);

  var groups = bar_data.map(function (d) {
    return d.Start;
  });
  var subgroups = d3.keys(bar_data[0]).slice(1, 3);
  console.log(subgroups);

  console.log(groups);

  //svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

  //x0.domain(monthnames);
  //x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
  bar_y.domain(groups);

  bar_color = d3
    .scaleOrdinal(d3.schemeCategory10)
    .range(["green", "red"])
    .domain(subgroups);

  //var hournames=linechartData[0].values[0].values.map(function(d) { return d.hour; });

  //.call(d3.axisBottom(bar_xAxis).tickSizeOuter(0));

  //svg.selectAll(".yaxis").transition().duration(2000)
  //		.call(bar_yAxis.tickSizeOuter(0))
  //.tickValues(groups);

  //svg.selectAll(".yaxis").transition().duration(10)
  //    .call(d3.axisLeft(y).tickSizeOuter(0))

  bar_svg
    .selectAll("g.yaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(bar_yAxis.ticks(null, "s"));

  //x.domain(d3.extent(data, function(d) { return d.annual_growth; }));

  bar_x
    .domain([
      d3.min(bar_data, (d) => d.incoming),
      d3.max(bar_data, (d) => d.outgoing),
    ])
    .nice();

  bar_svg
    .selectAll("g.xaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(bar_xAxis);

  //bar_xAxis = d3.axisBottom().scale(d3.scaleLinear().domain([0,d3.max(data, d => d.total)]).rangeRound([0, width]));
  //.tickFormat(d3.timeFormat("Month %V"))
  //.tickValues([0,d3.max()]);

  //bar_svg.selectAll(".yaxis")
  //.remove()
  //.transition().duration(2000)
  //    .call(bar_xAxis.ticks(null, "s"))

  //.call(bar_xAxis);

  var stackedData = d3
    .stack()
    .keys(subgroups.reverse())
    .offset(d3.stackOffsetDiverging)(bar_data);

  //bar_svg.selectAll("g").exit().remove()
  console.log(stackedData);

  //var bar_groups_g=bar_svg.append("g").attr("class","dash")

  //console.log(bar_groups_g.selectAll("dash"))
  //bar_groups_g.selectAll("dash").exit().remove();
  var bar_groups = bar_svg.selectAll(".dash").data(stackedData);

  bar_groups.exit().remove();

  bar_groups
    .enter()
    .append("g")
    .classed("dash", true)
    .attr("fill", function (d) {
      console.log(d.key);
      return bar_color(d.key);
    });

  var bars = bar_svg
    .selectAll(".dash")
    //.enter().append("g")
    .selectAll("rect")
    .data(function (d) {
      return d;
    });
  //bars.selectAll("g.rect").exit().remove();
  //bars.selectAll("g.foo").exit().remove();
  //bars.selectAll("g").exit().remove();
  bars
    .enter()
    .append("rect")
    .merge(bars)
    .transition()
    .duration(2000)
    .attr("y", function (d) {
      return bar_y(d.data.Start);
    }) //.attr("x", function(d) { return x(d.data.State); })
    .attr("height", bar_y.bandwidth())
    .attr("x", function (d) {
      return bar_x(d[0]);
    }) //.attr("y", function(d) { return y(d[1]); })
    .attr("width", function (d) {
      return bar_x(d[1]) - bar_x(d[0]);
    }); //.attr("height", function(d) { return y(d[0]) - y(d[1]); })

  bars.exit().remove();

  //.attr("width", x.bandwidth());
  //console.log(this);
  //Legend
  var legend = bar_svg
    .selectAll(".legend")
    .data(subgroups.reverse())
    .enter()
    .append("g")
    .attr("class", "legend")
    //.attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
    .style("opacity", "0");

  legend
    .append("rect")
    .attr("y", -20)
    .attr("x", function (d, i) {
      return margin.left + i * 70 - 30;
    })
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function (d) {
      return bar_color(d);
    });

  legend
    .append("text")
    .attr("y", -20)
    .attr("x", function (d, i) {
      return margin.left + i * 70 - 70;
    })
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function (d) {
      return d;
    });

  legend
    .transition()
    .duration(500)
    .delay(function (d, i) {
      return 2000;
    })
    .style("opacity", "1");
    
}
