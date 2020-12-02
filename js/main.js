var s = "Pleasants Park-Oregon Hill";
var e = "Brown's Island";
var t = "Bike";
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
  // Update chart with the selected category of letters
  drawHeatmap();
}

function onEndChanged() {
  var select = d3.select("#EndAttrSelector").node();
  // Get current value of select element
  e = select.options[select.selectedIndex].value;
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
mapMarkers = {
  "Monroe Park": [37.5466, 77.4505],
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
};

//prettier-ignore
var startLocMap = {
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
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});
//var heat = L.heatLayer(quakePoints, {
//  radius: 20,
//  blur: 15,
//  maxZoom: 17,
//}).addTo(map);
//console.log(quakePoints);

var heatmapData;

Promise.all([d3.json("./data/heatmap.json")]).then(function (data) {
  heatmapData = data[0];
  //console.log("Hello!");
  //RouteDetails = data[1];
  //console.log(RouteDetails);
  drawHeatmap();
  drawMarkers();
});

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

function extractLocation(monthFilteredData) {
  startLoc = startLocMap[s];
  endLoc = endLocMap[e];
  if (t === "Bike") {
    //console.log("KireBhai!");
    v = 0;
  } else {
    v = 420;
  }

  console.log("extract location");
  var old =
    monthFilteredData["place_pairs"][v + 21 * (startLoc - 1) + endLoc - 1][
      "Locations"
    ];

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
  return resample;
}

function drawHeatmap() {
  console.log(heatmapData["dict"][month]);

  locations = extractLocation(heatmapData["dict"][month]);

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
