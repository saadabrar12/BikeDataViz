var svg = d3.select("svg");

var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
var padding = { t: 60, r: 40, b: 30, l: 120 };

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var xscale = d3.scaleLinear().range([padding.l, chartWidth]);
var yscale = d3
  .scaleSymlog()
  .rangeRound([chartHeight, chartHeight / 2 + padding.t]);
var yscale2 = d3.scaleSymlog().rangeRound([chartHeight / 2, padding.t]);
var rscale = d3.scaleSqrt().range([2, 8]);

//prettier-ignore
var mapMarkers = {
  "Monroe Park": [37.5466, -77.4505],
  "Canal Walk": [37.533294, -77.432861],
  "Pleasants Park-Oregon Hill": [37.5402883, -77.45134145],
  "Broad & Lombardy": [37.55365954, -77.455663],
  "Abner Clay Park": [37.5487795, -77.44260818],
  "Jefferson Ave": [37.53477623, -77.41931267],
  "Biotech Park": [37.545892, -77.434531],
  "Broad & Harrison": [37.5460623, -77.4424587],
  "City Hall": [37.54098825, -77.43296116],
  "Brown's Island": [37.53541383, -77.44306472],
  "Center Stage": [37.54132293, -77.43719779],
  "Sydney Park": [37.54698042, -77.45654494],
  "Petronius Jones Park-Randolph": [37.54484103, -77.46495903],
  "Kanawha Plaza": [37.53711659, -77.43928492],
  "Science Museum": [37.56028749, -77.46618211],
  "Scott's Addition": [37.56822212, -77.47182548],
  "Broad & Hermitage": [37.55367891, -77.45568931],
  "Main Library": [37.54276275, -77.44239662],
  "Warehouse": [37.5109, -77.4574],
  "Downtown YMCA": [37.544360,-77.443670],
};

//X-axis
xAxisG = svg
  .append("g")
  .attr("class", "xaxis")
  .attr("transform", "translate(0," + (svgHeight - 50) + ")");

yAxisG1 = svg
  .append("g")
  .attr("class", "yaxis1")
  .attr("transform", "translate(100,0)");

yAxisG2 = svg
  .append("g")
  .attr("class", "yaxis2")
  .attr("transform", "translate(100,0)");

var tooltip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-12, 0])
  .html(function (d) {
    //polyline = L.polyline(GPS_routes[d.routeId], { weight: 10 }).addTo(map2);
    //console.log("Hello");
    return (
      "<h5>" +
      d.routeId +
      "</h5><table><thead><tr><td>Start</td><td>End</td><td>RFID</td><td>Membership</td></tr></thead>" +
      "<tbody><tr><td>" +
      d.start +
      "</td><td>" +
      d.end +
      "</td><td>" +
      d.rfidType +
      "</td><td>" +
      d.membership +
      "</td></tr></tbody>" +
      "<thead><tr><td>Distance</td><td colspan='2'>Duration</td><td>Cost</td><td>Type</td</tr></thead>" +
      "<tbody><tr><td>" +
      d.distance +
      "</td><td colspan='2'>" +
      d.duration +
      "</td><td>" +
      d.cost +
      "</td><td>" +
      d.type +
      "</td></tr>/</tbody></table>"
    );
  });

svg.call(tooltip);

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

var s = "All";
var e = "All";
var t = "All";
var month = 0;
var v = 420;
var heat;
var stationChanged = true;

var YearMonths = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

d3.select("#timeslide").on("input", function () {
  month = +this.value;
  document.getElementById("range").innerHTML = YearMonths[+this.value];
  drawHeatmap();
});

function onStartChanged() {
  var select = d3.select("#StartAttrSelector").node();
  // Get current value of select element
  s = select.options[select.selectedIndex].value;
  //console.log(mapMarkers[s]);
  if (s !== "All" && e !== "All") {
    map.flyToBounds(L.latLngBounds(mapMarkers[s], mapMarkers[e]));
  }
  // Update chart with the selected category of letters
  drawHeatmap();
}

function onEndChanged() {
  var select = d3.select("#EndAttrSelector").node();
  // Get current value of select element
  e = select.options[select.selectedIndex].value;
  if (s !== "All" && e !== "All") {
    map.flyToBounds(L.latLngBounds(mapMarkers[s], mapMarkers[e]));
  }
  drawHeatmap();
  //console.log(end);
  // Update chart with the selected category of letters
  //updateChart(category);
}

function onTypeChanged() {
  var select = d3.select("#BikeAttrSelector").node();
  t = select.options[select.selectedIndex].value;
  console.log(t);
  drawHeatmap();
}

//prettier-ignore
var startLocMap = {
  "All": 0,
  "Monroe Park": 1,
  "Canal Walk": 2,
  "Pleasants Park-Oregon Hill": 3,
  "Broad & Lombardy": 4,
  "Abner Clay Park": 5,
  "Jefferson Ave": 6,
  "Biotech Park": 7,
  "Broad & Harrison": 8,
  "City Hall": 9,
  "Brown's Island": 10,
  "Center Stage": 11,
  "Sydney Park": 12,
  "Petronius Jones Park-Randolph": 13,
  "Kanawha Plaza": 14,
  "Science Museum": 15,
  "Scott's Addition": 16,
  "Undetermined": 17,
  "Broad & Hermitage": 18,
  "Warehouse": 19,
  "Main Library": 20,
};
//prettier-ignore
var endLocMap = {
  "All": 0,
  "Broad & Harrison": 1,
  "Brown's Island": 2,
  "Monroe Park": 3,
  "Biotech Park": 4,
  "Broad & Lombardy": 5,
  "City Hall": 6,
  "Sydney Park": 7,
  "Pleasants Park-Oregon Hill": 8,
  "Kanawha Plaza": 9,
  "Canal Walk": 10,
  "Abner Clay Park": 11,
  "Jefferson Ave": 12,
  "Center Stage": 13,
  "Science Museum": 14,
  "Broad & Hermitage": 15,
  "Undetermined": 16,
  "Petronius Jones Park-Randolph": 17,
  "Scott's Addition": 18,
  "Warehouse": 19,
  "Downtown YMCA": 20,
  "Main Library": 21,
};

var map = L.map("map").setView([37.56032167, -77.46614], 13);
mapLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map);

//Datasets
var heatmapData;
var route_info;

Promise.all([
  d3.json("./data/heatmap.json"),
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
]).then(function (data) {
  heatmapData = data[0];

  route_info = data[1];
  //console.log(route_info);
  //GPS_routes = data[2];
  //console.log("Hello!");
  //RouteDetails = data[1];
  //console.log(RouteDetails);
  initBubblechart();
  drawHeatmap();
  drawMarkers();
});

function initBubblechart() {
  svg
    .append("text")
    .attr("class", "axis-label")
    .transition()
    .duration(2000)
    .text("Distance (miles)")
    .attr("transform", "translate(" + [chartWidth / 2, svgHeight - 20] + ")")
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .transition()
    .duration(2000)
    .text("Duration (min)")
    .attr(
      "transform",
      "translate(" + [30, svgHeight / 4 + 70] + ") rotate(-90)"
    )
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .style("fill", "black");

  svg
    .append("text")
    .attr("class", "axis-label")
    .transition()
    .duration(2000)
    .text("Duration (min)")
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .attr(
      "transform",
      "translate(" + [30, (svgHeight * 3) / 4 + 20] + ") rotate(-90)"
    )
    .style("fill", "black");

  svg
    .selectAll("labels")
    .data(["Bike", "Pedelec"])
    .enter()
    .append("text")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("x", 800)
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
}

var normalIcon = L.icon({
  iconUrl: "./img/small-bike-512.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, 0],
});
var startIcon = L.icon({
  iconUrl: "./img/start.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, 0],
});
var endIcon = L.icon({
  iconUrl: "./img/end.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, 0],
});
var bothIcon = L.icon({
  iconUrl: "./img/both.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, 0],
});

var currentMarker = "";
var allMarkers = [];
function updateIcon() {
  allMarkers.forEach(function (item, idx) {
    var name = item.id;
    var target = item.m;
    //console.log('updating icon');
    //console.log(item);
    if (s == name && e == name) {
      target.setIcon(bothIcon);
    } else if (s == name) {
      target.setIcon(startIcon);
    } else if (e == name) {
      target.setIcon(endIcon);
    } else {
      target.setIcon(normalIcon);
    }
  });
}

function userSetStart() {
  if (s != currentMarker) {
    s = currentMarker;
    stationChanged = true;
    updateIcon();
    drawHeatmap();
  } else {
    console.log("set start: no change");
  }
}

function userSetEnd() {
  if (e != currentMarker) {
    e = currentMarker;
    stationChanged = true;
    updateIcon();
    drawHeatmap();
  } else {
    console.log("set end: no change");
  }
}

function drawMarkers() {
  //var markerSource = L.marker(mapMarkers[s]).addTo(map);
  //var srcPopup = markerSource.bindPopup(s);
  //srcPopup.openPopup();
  //var markerDestination = L.marker(mapMarkers[e]);
  //var destPopup = markerDestination.bindPopup(e);
  //destPopup.openPopup();
  var popcontent =
    "<p id='id0'> content0 </p>\
  <button type='button' class='btn btn-primary btn-sm' onclick='userSetStart()'>Set as start</button>\
  <button type='button' class='btn btn-primary btn-sm' onclick='userSetEnd()'>Set as end</button>\
  ";

  var stationID = 0;

  for (let [k, v] of Object.entries(mapMarkers)) {
    var marker = L.marker(v, { icon: normalIcon }).addTo(map);
    allMarkers.push({ m: marker, id: k });
    //var popup = marker.bindPopup(k);
    var p = popcontent.replace("id0", stationID).replace("content0", k);
    var popup = L.popup().setContent(p);
    marker.bindPopup(popup);
    marker.on("click", function (e) {
      currentMarker = k;
      console.log(currentMarker);
    });
    //popup.openPopup();
  }
  updateIcon();
}

function dist(a, b) {
  var s = (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
  return Math.sqrt(s);
}
function norm(v) {
  var len = dist(v, [0, 0]);
  return [v[0] / len, v[1] / len];
}

function addLocations(monthlyLocData, startLoc, endLoc, v) {
  var locs = [];
  var routeIDs = [];
  //console.log(monthlyLocData);
  //console.log(v);
  if (startLoc === 0 && endLoc === 0) {
    monthlyLocData.forEach((element) => {
      locs = locs.concat(element["Locations"]);
      routeIDs = routeIDs.concat(element["Route IDs"]);
    });
  } else if (endLoc === 0) {
    monthlyLocData.forEach((element) => {
      if (element["Start"] === s) {
        routeIDs = routeIDs.concat(element["Route IDs"]);
        locs = locs.concat(element["Locations"]);
      }
    });
  } else if (startLoc === 0) {
    monthlyLocData.forEach((element) => {
      if (element["End"] === e) {
        routeIDs = routeIDs.concat(element["Route IDs"]);
        locs = locs.concat(element["Locations"]);
      }
    });
  } else {
    if (v === -1) {
      routeIDs =
        monthlyLocData[0 + 21 * (startLoc - 1) + endLoc - 1]["Route IDs"];
      locs = monthlyLocData[0 + 21 * (startLoc - 1) + endLoc - 1]["Locations"];
      routeIDs = routeIDs.concat(
        monthlyLocData[420 + 21 * (startLoc - 1) + endLoc - 1]["Route IDs"]
      );
      locs = locs.concat(
        monthlyLocData[420 + 21 * (startLoc - 1) + endLoc - 1]["Locations"]
      );
    } else {
      routeIDs = monthlyLocData[21 * (startLoc - 1) + endLoc - 1]["Route IDs"];
      locs = monthlyLocData[21 * (startLoc - 1) + endLoc - 1]["Locations"];
    }
  }
  return [routeIDs, locs];
}

function extractLocation(monthFilteredData) {
  startLoc = startLocMap[s];
  endLoc = endLocMap[e];
  if (t === "Bike") {
    typefiltered = monthFilteredData["place_pairs"].slice(0, 420);
    v = 0;
  } else if (t === "Pedelec") {
    typefiltered = monthFilteredData["place_pairs"].slice(421, 840);
    v = 420;
  } else {
    //All chosen
    typefiltered = monthFilteredData["place_pairs"];
    v = -1;
  }

  //console.log("extract location");

  location_info = addLocations(typefiltered, startLoc, endLoc, v);

  //Route IDs
  routeids = location_info[0];
  //console.log(routeids);

  //Location data
  var old = location_info[1];

  if (old.length < 1) return [];

  var resample = [];
  var i = 0,
    j = 0;
  var step = 10.1e-6; // minD = 1e-8;
  var last = [old[j][0], old[j][1]];

  //console.log(old.length);
  for (i = 0; i < old.length; ++i) {
    //console.log(old[i]);
    var x = old[i][0];
    var y = old[i][1];
    var d = dist(last, [x, y]);
    if (d > step) {
      var d1 = dist([x, y], last);
      var dir = norm([x - last[0], y - last[1]]);
      while (d1 > 0) {
        resample.push([last[0], last[1], old[i][3]]);
        last[0] += dir[0] * step;
        last[1] += dir[1] * step;
        d1 -= step;
      }
    }
    // end of loop
  }
  console.log("GPS array size " + resample.length);
  return [resample, routeids];
}

function drawHeatmap() {
  //console.log(heatmapData["dict"][month]);

  extractedvals = extractLocation(heatmapData["dict"][month]);
  locations = extractedvals[0];
  routeids = extractedvals[1];
  if (typeof locations === "undefined") locations = [];
  if (typeof routeids === "undefined") routeids = [];

  updateChart(routeids);
  console.log(locations);

  drawMarkers();
  if (heat != null) {
    //console.log("Eikhane");
    heat.setLatLngs(locations);
  } else {
    heat = L.heatLayer(locations, {
      radius: 3,
      blur: 5.5,
      maxZoom: 18,
    }).addTo(map);
  }
}

function extractRouteInfo(route_ids) {
  if (route_ids == null) return null;
  return route_info.filter((r) => route_ids.includes(r.routeId));
}

function updateChart(routeids) {
  // Adding x-axis
  data = extractRouteInfo(routeids);
  //console.log(data);

  distanceExtent = d3.extent(data, function (d) {
    return +d.distance;
  });
  xscale.domain(distanceExtent);

  svg
    .selectAll("g.xaxis")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(d3.axisBottom(xscale));

  DurationExtent = d3.extent(data, function (d) {
    return +d.duration;
  });
  yscale.domain(DurationExtent);
  svg
    .selectAll("g.yaxis1")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(d3.axisLeft(yscale).ticks(7));

  yscale2.domain(DurationExtent);
  svg
    .selectAll("g.yaxis2")
    .style("opacity", "1")
    .transition()
    .duration(2000)
    .call(d3.axisLeft(yscale2).ticks(7));

  CostExtent = d3.extent(data, function (d) {
    return +d.cost;
  });
  //console.log(CostExtent);
  rscale.domain(CostExtent);

  var dots = svg.selectAll("circle").data(data);

  var dotsEnter = dots
    .enter()
    .append("circle")
    .classed("circle", "true")
    .on("mouseover", function (d) {
      //console.log(legendColor(d.type));
      tooltip.show(d);
    })
    .on("mouseout", function (d) {
      d3.select(this).call(tooltip.hide);
      //if (polyline) map2.removeLayer(polyline);
    });

  dots
    .merge(dotsEnter)
    .attr("transform", function (route) {
      //console.log(this);
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
    })
    .attr("r", function (d) {
      //console.log("Cost" + d.cost);
      //console.log("Calculated val:" + rscale(+d.cost));
      return rscale(+d.cost);
    })
    .style("fill", function (d) {
      //console.log(d.type);
      //console.log("color:" + legendColor(d.type));
      return legendColor(d.type);
      //if (d.type === "Bike") return "#d64d3f";
      //else return "#96ac3d";
    });
  dots.exit().remove();
}
