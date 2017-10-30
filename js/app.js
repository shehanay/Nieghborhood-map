//Create a map variable
var map;
var markers = [];

var marker;

var largeInfoWindow;
var vm;


function initMap() {
    vm = new ViewModel();
    var placeLatlng = {
        lat: 24.725192,
        lng: 46.676960
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: placeLatlng
    });
    largeInfoWindow = new google.maps.InfoWindow();
    ko.applyBindings(vm);
    placeMarkers();
}
var currentPlaces = [{
    geometry: {
        lat: 24.735826,
        lng: 46.575967
    },
    properties: "albujiri"
}, {
    geometry: {
        lat: 25.178411,
        lng: 46.590443
    },
    properties: "althomama"
}];

var placeMarkers = function() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < currentPlaces.length; i++) {
        var position = currentPlaces[i].geometry;
        var title = currentPlaces[i].properties;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        vm.placesList()[i].marker = marker;
        markers.push(marker);
        marker.addListener('click', function() {
            var self = this;
            populateInfoWindow(this, largeInfoWindow);
            toggleBounce(this);
        });
        bounds.extend(markers[i].position);

        function toggleBounce(currentMarker) {
            currentMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                currentMarker.setAnimation(null);
            }, 1400);
        }
    }
    map.fitBounds(bounds);

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                    infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                } else {
                    var infowindowHTML = '<div>' + marker.title + '</div>' + "<img width = '80' src =" + marker.image + ">";
                    infowindow.setContent(infowindowHTML);
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.open(map, marker);
            wikiLinks();

            function wikiLinks() {
                // var $wikiHeaderElem = $('#wikipedia-header');
                var wikiRequestTimeout = setTimeout(function() {
                    $wikiHeaderElem.text("failed to load wikipedia resources");
                }, 4000);
                var wikipediaEndPointUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json';
                $.ajax({
                    url: wikipediaEndPointUrl,
                    data: {
                        "action": "opensearch",
                        "search": marker.title,
                        "format": "json",
                    },
                    dataType: "jsonp",
                    success: function(response) {
                        vm.wikiInfo({
                            title: response[0],
                            url: response[3][0]
                        });
                        clearTimeout(wikiRequestTimeout);
                    }
                });
            }
        }
    }
};
var Place = function(data) {
    this.place = ko.observable(data.geometry);
    this.title = ko.observable(data.properties);
    this.image = ko.observable(data.image);
    this.marker = ko.observable();
};
var ViewModel = function() {
    var self = this;
    this.placesList = ko.observableArray([]);
    this.markers = ko.observableArray([]);
    this.filterTxt = ko.observable("");
    this.wikiInfo = ko.observable();
    currentPlaces.forEach(function(placeItem) {
        self.placesList.push(new Place(placeItem));
    });
    markers.forEach(function(marker, i) {
        self.placesList()[i].markers = marker;
    });
    this.currentPlace = ko.observable(this.placesList()[0]);
    this.placesList.marker = ko.observable(this.placesList()[0]);
    this.changePlace = function(clickedPlace) {
        self.currentPlace(clickedPlace);
    };
    this.setPlace = function(clickedPlace) {
        self.showPlace(clickedPlace);
        google.maps.event.trigger(clickedPlace.marker, 'click');
        map.setCenter(clickedPlace.marker.position);
        map.setZoom(17);
    };
    this.showPlace = function(location) {
        self.currentPlace(location);
    };
    self.filterPlaces = ko.computed(function() {
        var filter = self.filterTxt().toLowerCase();
        if (!filter) {
            for (var i = markers.length - 1; i >= 0; i--) {
                markers[i].setVisible(true);
            }
            return self.placesList();
        } else {
            return ko.utils.arrayFilter(self.placesList(), function(placeItem) {
                var i = currentPlaces.indexOf(placeItem.title());
                if (placeItem.title().toLowerCase().indexOf(filter) === -1) {
                    placeItem.marker.setVisible(false);
                } else {
                    placeItem.marker.setVisible(true);
                }
                return placeItem.title().toLowerCase().indexOf(filter) != -1;
            });
        }
    });
};

function googleSuccess() {
    if (typeof google !== 'undefined') {
        ko.applyBindings(vm);
    } else {
        googleError();
    }
}

function googleError() {
    alert('Google Maps has failed to load. Please contact Google @ google.com.');
}