// Storing our dataset URLs
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Perform a GET request to the query URL for Earthquake Data
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


// Tectonic Plates Data
// ---------------------------------------------------------
// Perform a GET request to the Tectonic Plates URL
d3.json(tectonicPlatesUrl, function(platesData) {
  // Creating a geoJSON layer with the retrieved data
  window.faultLines = L.geoJson(platesData, {
    // Style each feature 
    style: function(feature) {
      return {
        color: "orange",
        fillOpacity: 0,
        weight: 1.5
      };
    }

  });
});



// Earthquake Data
// ---------------------------------------------------------
function createFeatures(earthquakeData) {

  // Function returning marker Style
  function markerStyle(feature) {
    return {color: "#222222",
      fillColor: getColor(feature.properties.mag),
      weight: 0.1,
      fillOpacity: 0.9, 
      radius: feature.properties.mag * 3
    }
  }

  // Function returning Color according to magnitude
  function getColor(d) {
      return d > 5 ? '#EA0F0F' :
            d > 4  ? '#D57A29' :
            d > 3  ? '#FF9933' :
            d > 2  ? '#FFC300' :
            d > 1   ? '#FFFF66' :
            d > 0  ? '#99E600' :
                      '#FFEDA0';
    }


  // On each feature a popup describing the place and time and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p> Magnitude: " 
      + feature.properties.mag + "</p>");

    layer.on({
      mouseover: function(event) {
      this.openPopup();
      },
      mouseout: function(event) {
        this.closePopup();
      }
    });
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: markerStyle,
    onEachFeature: onEachFeature
  });


  // Define streetmap and darkmap layers
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 18,
  minZoom: 2,
  zoomOffset: -1,
  id: "light-v10",
  accessToken: API_KEY
});


  var satelliteMap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
    tileSize: 512,
    maxZoom: 18,
    minZoom: 2,
    zoomOffset: -1
  });


  var outdoorsMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    minZoom: 2,
    zoomOffset: -1
  });


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [satelliteMap, earthquakes, faultLines]
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "<span class='mapOptions'>Satellite</span>": satelliteMap,
    "<span class='mapOptions'>Grayscale</span>": lightMap,
    "<span class='mapOptions'>Outdoors</span>": outdoorsMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "<span class='mapOptions'>Fault Lines</span>": faultLines,
    "<span class='mapOptions'>Earthquakes</span>": earthquakes
  };


  // Creating a layer control and Passing in our baseMaps and overlayMaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);

  // Adding Legend to the Map
  var legend = L.control({position: 'bottomright'});
	legend.onAdd = function (myMap) {
		var div = L.DomUtil.create('div', 'info legend'),
			limits = [0, 1, 2, 3, 4, 5],
			labels = [],
			from, to;
		for (var i = 0; i < limits.length; i++) {
			from = limits[i];
			to = limits[i + 1];

			labels.push(
				'<i style="background:' + getColor(from +1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'))
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};
	legend.addTo(myMap);  

}
