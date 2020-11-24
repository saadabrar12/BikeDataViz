var s = "Abner Clay Park";
var e = "Abner Clay Park";
var t = "Pedelec";
var m = 0;
var v = 420;
var heat;
var markers = [];
var popups = [];

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

var myIcon = L.icon({
  iconUrl: "small-bike-512.png",
  iconSize: [35, 35],
  iconAnchor: [12, 35],
  popupAnchor: [0, -30],
  shadowSize: [68, 95],
  shadowAnchor: [22, 94],
});

d3.select("#timeslide").on("input", function () {
  m = +this.value;
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
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map);

//var heat = L.heatLayer(quakePoints, {
//  radius: 20,
//  blur: 15,
//  maxZoom: 17,
//}).addTo(map);
//console.log(quakePoints);

var heatmapData;

Promise.all([d3.json("heatmap.json")]).then(function (data) {
  heatmapData = data[0];
  //console.log("Hello!");
  //RouteDetails = data[1];
  //console.log(RouteDetails);
  drawHeatmap();
  drawMarkers();
});

function drawMarkers() {
  //var markerSource = L.marker(mapMarkers[s]).addTo(map);
  //var srcPopup = markerSource.bindPopup(s);
  //srcPopup.openPopup();
  //var markerDestination = L.marker(mapMarkers[e]);
  //var destPopup = markerDestination.bindPopup(e);
  //destPopup.openPopup();
  for (let [k, v] of Object.entries(mapMarkers)) {
    var marker = L.marker(v, { icon: myIcon }).addTo(map);
    var popup = marker.bindPopup(k);
    //console.log(popup);
    markers.push(marker);
    popups.push(popup);
    //popup.openPopup();
  }
  //for (var i = 0; i < markers.length; i++) {
  //  console.log(popups[i]);
  //markers[i].bindPopup("Popup content");
  //  markers[i].on("mouseover", function (e) {
  //    popups[i].openPopup();
  //  });
  //  markers[i].on("mouseout", function (e) {
  //    popups[i].closePopup();
  //  });
  //}
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
  //console.log(
  //  monthFilteredData["place_pairs"][21 * (startLoc - 1) + endLoc - 1]["Start"]
  //);
  //console.log(
  //  monthFilteredData["place_pairs"][21 * (startLoc - 1) + endLoc - 1]["End"]
  //);
  return monthFilteredData["place_pairs"][v + 21 * (startLoc - 1) + endLoc - 1][
    "Locations"
  ];
}

function drawHeatmap() {
  //console.log(heatmapData["dict"][m]);

  locations = extractLocation(heatmapData["dict"][m]);

  drawMarkers();

  if (heat != null) {
    //console.log("Eikhane");
    heat.setLatLngs(locations);
  } else {
    heat = L.heatLayer(locations, {
      radius: 6,
      blur: 5,
      maxZoom: 19,
    }).addTo(map);
  }
}
