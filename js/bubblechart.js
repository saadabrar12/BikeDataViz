var svg = d3.select("svg");

var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
var polyline;
var GPS_routes;
polylines = L.layerGroup();

var padding = { t: 60, r: 40, b: 30, l: 120 };

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var xscale = d3.scaleLinear().range([padding.l, chartWidth]);
var yscale = d3.scaleLinear().range([chartHeight, chartHeight / 2 + padding.t]);
var yscale2 = d3.scaleLinear().range([chartHeight / 2, padding.t]);
var rscale = d3.scaleSqrt().range([0, 12]);
var colorScale = d3.scaleQuantize().range(["#d64d3f", "#96ac3d"]);

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
    //console.log("Hello");
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
    if (+row["Duration (min)"] < 12000) {
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
    }
  }),
  d3.json("./data/route_id_locations.json"),
]).then(function (data) {
  var route_info = data[0];
  GPS_routes = data[1];
  //draw;
  drawChart(route_info, GPS_routes);
});

var legendColor = d3
  .scaleOrdinal()
  .domain(["Bike", "Pedelec"])
  .range(d3.schemeSet2);

function scaleBikeDuration(duration) {
  return yscale(duration);
}

function scalePedelecDuration(duration) {
  return yscale2(duration);
}

function scaleDistance(distance) {
  return xscale(distance);
}

function drawChart(route_info, GPS_routes) {
  svg.call(
    d3
      .brush()
      .extent([
        [padding.l, padding.t],
        [chartWidth, chartHeight],
      ])
      .on("start brush", updateChart)
      .on("end", brushend)
  );
  // Adding x-axis
  distanceExtent = d3.extent(route_info, function (d) {
    return +d.distance;
  });
  xscale.domain(distanceExtent);
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(0," + (svgHeight - 70) + ")")
    .call(d3.axisBottom(xscale).ticks(15));

  //Adding Y-axis
  //var durationMax = d3.max(route_info, function (d) {
  //  return +d.duration;
  //});

  DurationExtent = d3.extent(route_info, function (d) {
    return +d.duration;
  });
  yscale.domain(DurationExtent);

  d3.select("svg")
    .append("g")
    .attr("transform", "translate(100,0)")
    .call(d3.axisLeft(yscale).ticks(6));

  //Adding y-axis 2
  yscale2.domain(DurationExtent);
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(100,0)")
    .transition()
    .duration(750)
    .call(d3.axisLeft(yscale2).ticks(6));

  //Adding size for cost
  CostExtent = d3.extent(route_info, function (d) {
    return +d.cost;
  });
  rscale.domain(CostExtent);

  //color Scale
  colorScale.domain;

  routeG = svg.selectAll(".route").data(route_info);

  var routeEnter = routeG
    .enter()
    .append("g")
    .attr("transform", function (route) {
      if (route.type === "Bike") {
        return (
          "translate(" +
          scaleDistance(route.distance) +
          "," +
          scaleBikeDuration(route.duration) +
          ")"
        );
      } else {
        return (
          "translate(" +
          scaleDistance(route.distance) +
          "," +
          scalePedelecDuration(route.duration) +
          ")"
        );
      }
    });

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Duration (minutes)")
    .attr("transform", "translate(" + [chartWidth / 2, svgHeight - 30] + ")")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Duration (minutes")
    .attr(
      "transform",
      "translate(" + [30, svgHeight / 4 + 70] + ") rotate(-90)"
    )
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .text("Distance Travelled (miles)")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr(
      "transform",
      "translate(" + [30, (svgHeight * 3) / 4 + 50] + ") rotate(-90)"
    )
    .style("fill", "black");

  var circleEnter = routeEnter
    .append("circle")
    .attr("r", function (d) {
      return rscale(+d.cost);
    })
    .style("fill", function (d) {
      return legendColor(d.type);
      //if (d.type === "Bike") return "#d64d3f";
      //else return "#96ac3d";
    });

  circleEnter
    .on("mouseover", function (d) {
      //console.log(this)
      tooltip.show(d);
      if (GPS_routes[d.routeId]) {
        polyline = L.polyline(GPS_routes[d.routeId], { weight: 8 }).addTo(map2);
      }
    })
    .on("mouseout", function (d) {
      d3.select(this).call(tooltip.hide);
      if (polyline) map2.removeLayer(polyline);
    });

  svg
    .selectAll("labels")
    .data(["Bike", "Pedelec"])
    .enter()
    .append("text")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("x", 1300)
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
    //console.log("Hl");
    //Removing previous mappings
    polylines.removeFrom(map2);
    polylines.clearLayers();
    circleEnter.classed("selected", function (d) {
      if (
        isBrushed(
          extent,
          scaleDistance(d.distance),
          scaleBikeDuration(d.duration),
          scalePedelecDuration(d.duration)
        )
      ) {
        if (GPS_routes[d.routeId]) {
          polylines.addLayer(L.polyline(GPS_routes[d.routeId], { weight: 8 }));
          polylines.addTo(map2);
        }
        return true;
      } else {
        return false;
      }
    });
  }

  // A function that return TRUE or FALSE according if a dot is in the selection or not
  function isBrushed(brush_coords, cx, cy, cy2) {
    var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
    //console.log(cx);
    //console.log(cy2);
    return (
      x0 <= cx &&
      cx <= x1 &&
      ((y0 <= cy && cy <= y1) || (y0 <= cy2 && cy2 <= y1))
    ); // This return TRUE or FALSE depending on if the points is in the selected area
  }
  function brushend() {
    if (!d3.event.selection) {
      //console.log("Hey");
      polylines.removeFrom(map2);
    }
  }
}
