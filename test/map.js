var map = L.map('map', {center: [39.981192, -75.155399], zoom: 10});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
map.doubleClickZoom.disable();
    
// Create an Empty Popup
var popup = L.popup();
    
// Write function to set Properties of the Popup
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// Listen for a click event on the Map element
map.on('click', onMapClick);
            
// Set function for color ramp, you can use a better palette
function setColorFunc(density){
    return density > 50 ? '#78281F' :
        density > 40 ? '#E74C3C' :
        density > 30 ? '#EC7063' :
        density > 20 ? '#F1948A' :
        density > 10 ? '#F5B7B1' :
        density > 0 ? '#FADBD8' :
                        '#BFC9CA';
};

// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.num_bll_5p),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Now Defining functions for mouse hovering
function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Define what happens on mouseout:
function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeatureFunc(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    layer.bindPopup('Blood lead level: '+feature.properties.num_bll_5p);
}


var neighborhoodsLayer = null;
// load GeoJSON from an external file
$.getJSON("blood_lead.geojson",function(data){
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,
        onEachFeature: onEachFeatureFunc,
    }).addTo(map);
});

// Add Scale Bar to Map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');            
    div.innerHTML += '<b>Number of people with Lead level below 5%</b><br />';
    div.innerHTML += 'by census tract<br />';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #78281F"></i><p>50+</p>';
    div.innerHTML += '<i style="background: #E74C3C"></i><p>40-50</p>';
    div.innerHTML += '<i style="background: #EC7063"></i><p>30-40</p>';
    div.innerHTML += '<i style="background: #F1948A"></i><p>20-30</p>';
    div.innerHTML += '<i style="background: #F5B7B1"></i><p>10-20</p>';
    div.innerHTML += '<i style="background: #FADBD8"></i><p>0-10</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #BFC9CA"></i><p>No Data</p>';
    
    // Return the Legend div containing the HTML content
    return div;
};

// Add Legend to Map
legend.addTo(map);