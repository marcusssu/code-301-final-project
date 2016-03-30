$(document).ready(function() {
  localData(init);
});

var map;
var mapElement;
var pos = {};
var posMarker;
var currentMarkers = [];

function init() {
  var mapOptions = makeMapOptions();

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

  mapElement = document.getElementById('map');
  map = new google.maps.Map(mapElement, mapOptions);
  // COMMENT: Looking to add a event listener to the map to potentially pan to and redraw new markers
  map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
    console.log(e.latLng.lng());
  });

  // markCurrentLocation(function() {
  //   renderPlaces(snapData.all);
  // });

  initSearches();
  addMarker({Latitude: 47.6198, Longitude: -122.3528}, map, function () {});
  addListItem({Store_Name: "hi"}, function() {});
}

//COMMENT: Looking to add a event listener to the map to potentially pan to and redraw new markers
function placeMarkerAndPanTo(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  marker.setVisible(false);
  map.panTo(latLng);
  console.log('Current Location is: ' + latLng);
  clearCurrentMarkers();
  var panToLocationMarker = sortByDistance(latLng.lat(), latLng.lng(), snapData.all);
  setStoreList(panToLocationMarker);
  setMarkers(panToLocationMarker);
}

function markCurrentLocation(cb) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      posMarker = new google.maps.Marker({
        position: pos,
        animation: google.maps.Animation.BOUNCE,
        //COMMENT: We're appending the object info to a new customInfo field. This will behelpful for comparing to DOM objects, etc.
        customInfo: pos
      });
      posMarker.setMap(map);
      //COMMENT: Adding an event listener. This is a temp example, but we can leverage this for cooler things...
      google.maps.event.addListener(posMarker, 'click', function() {
        console.log('Current Location is: lat:' + position.coords.latitude + ", lng:" + position.coords.longitude);
      });
      cb();
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
};

function sortByDistance(myLatitude, myLongitude, world) {
  var distances = [];
  for (var i = 0; i < world.length; i++) {
    var place = world[i];
    var distance = Math.sqrt(Math.pow(myLatitude - place.Latitude, 2) + Math.pow(myLongitude - place.Longitude, 2)); // Uses Euclidean distance
    distances.push({
      distance: distance,
      place: place
    });
  }
  // Return the distances, sorted
  return distances.sort(function(a, b) {
    return a.distance - b.distance; // Switch the order of this subtraction to sort the other way
  }).slice(0, 10).map(function (dist) {
    return dist.place;
  }); // Gets the first ten places, according to their distance
}

function addMarker(place, map, listener) {
  var marker = new google.maps.Marker({
    position: {
      lat: place.Latitude,
      lng: place.Longitude
    },
    clickable: true,
    map: map,
    animation: google.maps.Animation.DROP,
  });

  marker.setMap(map);
  currentMarkers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
    console.log('Marker Name: ' + this.customInfo.Store_Name);
    listener();
  });

  return marker;
}

var makeListItem = Handlebars.compile($('#storeListView-template').text());

function addListItem(place, listener) {
  $('#slide-bar .text-container').append(makeListItem(place));
}

/* 
function setPlaces(places) {
  // renders places both in the store list and on the map
  var distances = sortByDistance(pos.lat, pos.lng, places);
  setStoreList(distances);
  setMarkers(distances);
}

function setStoreList(places) {
  $('#slide-bar .text-container').html('');

  $('#slide-bar').find('.text-container').empty();

  var toHtml = Handlebars.compile($('#storeListView-template').text());
  places.forEach(function(a) {
    $('#slide-bar .text-container').append(toHtml(a));
  });
};

function clearCurrentMarkers() {
  currentMarkers.forEach(function (m) {
    m.setMap(null);
  });

  currentMarkers = [];
}

function setMarkers(places) {
  clearCurrentMarkers();

  places.forEach(function(snapLocation) {
    var marker = new google.maps.Marker({
      position: {
        lat: snapLocation.Latitude,
        lng: snapLocation.Longitude
      },
      clickable: true,
      map: map,
      animation: google.maps.Animation.DROP,
      //COMMENT: We're appending the object info to a new customInfo field. This will behelpful for comparing to DOM objects, etc.
      customInfo: snapLocation
    });
    marker.setMap(map);
    currentMarkers.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
      console.log('Marker Name: ' + this.customInfo.Store_Name);
      //COMMENT: repositions the map on this marker... we can remove if peeps dont like it...
      map.setCenter(this.getPosition());
    });
  });
}
*/

function makeMapOptions() {
  return {
    center: new google.maps.LatLng(47.6067, -122.3325),
    zoom: 15,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.DEFAULT,
    },
    disableDoubleClickZoom: true,
    mapTypeControl: false,
    scaleControl: false,
    scrollwheel: true,
    panControl: true,
    streetViewControl: false,
    draggable: true,
    overviewMapControl: false,
    overviewMapControlOptions: {
      opened: false,
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#e9e9e9"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{
        "color": "#f5f5f5"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#ffffff"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#ffffff"
      }, {
        "lightness": 29
      }, {
        "weight": 0.2
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{
        "color": "#ffffff"
      }, {
        "lightness": 18
      }]
    }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "color": "#ffffff"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#f5f5f5"
      }, {
        "lightness": 21
      }]
    }, {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{
        "color": "#dedede"
      }, {
        "lightness": 21
      }]
    }, {
      "elementType": "labels.text.stroke",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#ffffff"
      }, {
        "lightness": 16
      }]
    }, {
      "elementType": "labels.text.fill",
      "stylers": [{
        "saturation": 36
      }, {
        "color": "#333333"
      }, {
        "lightness": 40
      }]
    }, {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{
        "color": "#f2f2f2"
      }, {
        "lightness": 19
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#fefefe"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#fefefe"
      }, {
        "lightness": 17
      }, {
        "weight": 1.2
      }]
    }],
  };
}
