// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(earthquakeData) {

  // Creating map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
  });

  // Adding tile layer
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: API_KEY
  }).addTo(myMap);

  // Function returning marker Style
  function markerStyle(feature) {
    return {color: "#222222",
      fillColor: getColor(feature.properties.mag),
      weight: 0.1,
      fillOpacity: 0.7, 
      radius: feature.properties.mag * 2
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


  // Creating a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    // Circle Marker
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Calling style function
    style: markerStyle,
    // Calling onEachFeature function
    onEachFeature: onEachFeature
    
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

});
