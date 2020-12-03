var svg = d3.select("#svg1");

var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
var polyline;
var GPS_routes;
polylines = L.layerGroup();

var padding = { t: 20, r: 20, b: 30, l: 100 };

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight / 2 - padding.t - padding.b;

var xscale = d3.scaleLog().base(2).rangeRound([padding.l, chartWidth]);
var yscale = d3.scaleLog().base(2).rangeRound([chartHeight, padding.t]);
var rscale = d3.scaleSqrt().range([2, 12]);

var map2 = L.map("routemap").setView([37.56032167, -77.46614], 13);
mapLink2 = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink2 + " Contributors",
  maxZoom: 18,
}).addTo(map2);

var tooltip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-12, 0])
  .html(function (d) {
    //polyline = L.polyline(GPS_routes[d.routeId], { weight: 10 }).addTo(map2);
    //console.log(d);
    var avaliable = "No";
    if (GPS_routes[d.routeId]) {
      avaliable = "Yes";
    }
    return (
      "<h5>" +
      d.routeId +
      "</h5><table><thead><tr><td>Start</td><td>End</td><td>RFID</td><td>Membership</td><td>Avaliability of GPS Data</td></tr></thead>" +
      "<tbody><tr><td>" +
      d.start +
      "</td><td>" +
      d.end +
      "</td><td>" +
      d.rfidType +
      "</td><td>" +
      d.membership +
      "</td><td>" +
      avaliable +
      "</td></tr></tbody>" +
      "<thead><tr><td>Distance</td><td colspan='2'>Duration</td><td>Cost</td></tr></thead>" +
      "<tbody><tr><td>" +
      d.distance +
      "</td><td colspan='2'>" +
      d.duration +
      "</td><td>" +
      d.cost +
      "</td></tr></tbody></table>"
    );
  });

svg.call(tooltip);

Promise.all([
  d3.csv("./data/route_reports.csv", function (row) {
    //if (+row["Duration (min)"] < 12000 && +row["Duration (min)"] > 1000) {
    var routes = {
      routeId: row["Route ID"],
      cost: +row["Cost"],
      distance: +row["Distance"],
      type: row["Type"],
      duration: +row["Duration (min)"],
      membership: row["Membership"],
      rfidType: row["RFID"],
      start: row["Start"],
      end: row["End"],
    };
    return routes;
    //}
  }),
  d3.json("./data/route_id_locations.json"),
]).then(function (data) {
  var route_info = data[0];
  GPS_routes = data[1];

  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + (svgHeight - 30) + ")");

  drawChart(route_info, GPS_routes);
});

var legendColor = d3
  .scaleOrdinal(d3.schemeCategory10)
  .domain(["Bike", "Pedelec"]);

function drawChart(route_info, GPS_routes) {
  var sumstat = d3
    .nest() // nest function allows to group the calculation per level of a factor
    .key(function (d) {
      return d.type;
    })
    .entries(route_info);

  //console.log(sumstat);

  allKeys = sumstat.map(function (d) {
    return d.key;
  });

  //console.log(allKeys);

  var trellisG = svg
    .selectAll(".trellis")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("class", "trellis")
    .attr("transform", function (d, i) {
      // Use indices to space out the trellis groups in 2x2 matrix
      //var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
      //console.log(i);
      var ty = (i % 2) * (chartHeight + padding.t + padding.b) + padding.t;
      return "translate(" + 0 + "," + ty + ")";
    });

  // Adding x-axis
  distanceExtent = d3.max(route_info, function (d) {
    return +d.distance;
  });
  xscale.domain([0.1, distanceExtent]);

  //Adding Y-axis
  //var durationMax = d3.max(route_info, function (d) {
  //  return +d.duration;
  //});

  DurationExtent = d3.max(route_info, function (d) {
    return +d.duration;
  });
  yscale.domain([0.1, DurationExtent]);
  xscale.clamp(true);
  yscale.clamp(true);

  var xGrid = d3
    .axisTop(xscale)
    .tickSize(-chartHeight, padding.l + padding.l, padding.l)
    .tickFormat("");

  trellisG.append("g").attr("class", "grid").call(xGrid);

  var yGrid = d3
    .axisLeft(yscale)
    .tickSize(-chartWidth, padding.l, padding.l)
    .tickFormat("");

  trellisG.append("g").attr("class", "grid").call(yGrid);

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Distance Travelled (min)")
    .attr("transform", "translate(" + [chartWidth / 2, svgHeight - 5] + ")")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Duration (minutes)")
    .attr(
      "transform",
      "translate(" + [30, svgHeight / 4 + 70] + ") rotate(-90)"
    )
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Duration (minutes)")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr(
      "transform",
      "translate(" + [30, (svgHeight * 3) / 4 + 50] + ") rotate(-90)"
    )
    .style("fill", "black");

  svg
    .selectAll("g.xaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(d3.axisBottom(xscale));

  //svg.selectAll("g.yaxis")
  trellisG
    .append("g")
    .attr("class", "yaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .attr("transform", "translate(" + (padding.l - 10) + "," + 0 + ")")
    .call(d3.axisLeft(yscale));
  trellisG.call(
    d3
      .brush()
      .extent([
        [padding.l, 0],
        [chartWidth, chartHeight],
      ])
      //.on("start brush", updateChart)
      .on("end", brushend)
  );
  //Adding size for cost
  CostExtent = d3.extent(route_info, function (d) {
    return +d.cost;
  });
  rscale.domain(CostExtent);

  var routeG = trellisG.selectAll(".route").data(function (d) {
    //console.log(d.values);
    return [d.values];
  });

  routeG.enter().append("g").classed("route", true);

  var circleEnter = trellisG
    .selectAll(".route")
    .selectAll("circle")
    .data(function (d) {
      return d;
    });

  var circles = circleEnter
    .enter()
    .append("circle")
    .merge(circleEnter)
    .classed("circles", true)
    //.enter()
    .attr("r", function (d) {
      //console.log(d)
      return rscale(+d.cost);
    })
    //.attr("cx", function (d) { return xscale(d.distance); } )
    //.attr("cy", function (d) { return yscale(d.duration); } )
    .style("fill", function (d) {
      //console.log(d.type);
      return legendColor(d.type);
    });

  trellisG
    .selectAll("circle")
    .transition()
    .delay(function (d, i) {
      return i * 0.5;
    })
    .duration(1000)
    .attr("cx", function (d) {
      return xscale(d.distance);
    })
    .attr("cy", function (d) {
      return yscale(d.duration);
    })
    .filter(function (d) {
      return GPS_routes[d.routeId];
    })
    .style("stroke", "red")
    .attr("stroke-width", 1)
    .attr("opacity", 0.7);

  circles
    .on("mouseover", function (d) {
      //console.log(legendColor(d.type));
      tooltip.show(d);
      if (GPS_routes[d.routeId]) {
        polyline = L.polyline(GPS_routes[d.routeId], {
          weight: 8,
          opacity: 0.6,
          linecap: "round",
          color: legendColor(d.type),
        });
        map2.flyToBounds(polyline.getBounds());
        polyline.addTo(map2);
        //var group = new L.featureGroup(polyline);
        //console.log(group);
        //console.log(group.getBounds());
      }
    })
    .on("mouseout", function (d) {
      d3.select(this).call(tooltip.hide);
      if (polyline) map2.removeLayer(polyline);
    });

  routeG.exit().remove();

  svg
    .selectAll("labels")
    .data(["Bike", "Pedelec"])
    .enter()
    .append("text")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("x", 520)
    .attr("y", function (d, i) {
      return 30 + i * 25;
    })
    .style("fill", function (d) {
      return legendColor(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  function updateChart() {
    extent = d3.event.selection;
    
    //Removing previous mappings
    polylines.removeFrom(map2);
    polylines.clearLayers();
    circles.classed("selected", function (d) {
      //console.log("Hl");

      if (
        isBrushed(
          extent,
          xscale(d.distance),
          yscale(d.duration)
          //scalePedelecDuration(d.duration)
        )
      ) {
        if (GPS_routes[d.routeId]) {
          polyline = L.polyline(GPS_routes[d.routeId], {
            weight: 8,
            opacity: 0.6,
            linecap: "round",
            color: legendColor(d.type),
          });
          map2.flyToBounds(polyline.getBounds());
          //polyline.addTo(map2);
          polylines.addLayer(polyline);
          polylines.addTo(map2);
        }
        return true;
      } else {
        return false;
      }
    });
  }

  // A function that return TRUE or FALSE according if a dot is in the selection or not
  function isBrushed(brush_coords, cx, cy) {
    var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
    //console.log(cx);
    //console.log(cy2);
    return (
      x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 //|| (y0 <= cy2 && cy2 <= y1))
    ); // This return TRUE or FALSE depending on if the points is in the selected area
  }
  function brushend() {
    updateChart();
    if (!d3.event.selection) {
      polylines.removeFrom(map2);
    }
  }
}
