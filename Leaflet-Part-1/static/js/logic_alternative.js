// Storing the API data as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Performing a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Sending the data.features to the createFeatures function
  createFeatures(data.features);
});

// Declaring function to create features from earthquake data
function createFeatures(earthquakeData) {

    // Creating a GeoJSON layer for the earthquake data
    let earthquakes = L.geoJSON(earthquakeData, {
        // Declaring function to create a circle for each point
        pointToLayer: function (feature, latlng) {
            // Using the same steps to find color and size
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2]; 

            // Deciding the circle color based on depth ranges
            let color;
            if (depth <= 10) {
                color = "green";
            } else if (depth <= 30) {
                color = "lightgreen";
            } else if (depth <= 50) {
                color = "yellow";
            } else if (depth <= 70) {
                color = "orange";
            } else if (depth <= 90) {
                color = "darkorange";
            } else {
                color = "red";
            }

            // Finding the circle size based on magnitude
            let radius = magnitude * 25000; // Adjusting size

            // Returning a new circle with the size and color
            return L.circle(latlng, {
                stroke: false, // Not showing the outline
                fillOpacity: 0.7, // Making it semi-transparent
                color: color, // Setting the outline color
                fillColor: color, // Setting the fill color
                radius: radius // Setting the radius
            });
        }
    });

    // Sending the earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Declaring function to create the map with the earthquake layer
function createMap(earthquakes) {
    // Creating the base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Creating a baseMaps object
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Creating an overlay object for the earthquakes
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Creating the map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Creating a layer control and adding it to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Declaring function to create a legend
    let legend = L.control({ position: 'bottomright' }); // Positioning the legend

    // Adding a function to the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'); // Creating a div for the legend
        div.style.backgroundColor = "white"; // Setting the background color to white
        div.style.padding = "10px"; // Adding some padding
        div.style.borderRadius = "5px"; // Rounding the corners
        div.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.5)"; // Adding a shadow for better visibility

        let grades = [0, 10, 30, 50, 70, 90]; // Defining depth ranges
        let colors = ["green", "lightgreen", "yellow", "orange", "darkorange", "red"]; // Defining colors for ranges

        // Looping through the grades and adding them to the legend
        for (let i = 0; i < grades.length; i++) {
            // Creating a small square for color representation
            div.innerHTML += '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' + 
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'); // Adding range text
        }

        return div; // Returning the div for the legend
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}
