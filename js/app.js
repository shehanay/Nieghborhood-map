var $wikiElem = $('#wikipedia-links');
$wikiElem.text("");



var initialRestaurants = [{

        name: 'Erqa',
        latlngLoc: {
            lat: 24.696498,
            lng: 46.583576
        },
        markerLoc: true,
        URL: "https://erqa.com/ ",
        wikiSnippet: '',
        Street: "1090 dairi",
        City: "Riyadh",
        streetViewUrl: "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=",
        streetViewImage: function() {
            return this.streetViewUrl + this.Street + ',' + this.City + '';
        },
        infoWindow: ''

    },
    {

        name: 'bojeri',
        latlngLoc: {
            lat: 24.735787,
            lng: 46.575613
        },
        markerLoc: true,
        URL: "https://bojeri.com/ ",
        wikiSnippet: '',
        Street: "1090 dareah",
        City: "Riyadh",
        streetViewUrl: "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=",
        streetViewImage: function() {
            return this.streetViewUrl + this.Street + ',' + this.City + '';
        },
        infoWindow: ''

    },
    {

        name: 'heteen',
        latlngLoc: {
            lat: 24.771337,
            lng: 46.587696
        },
        markerLoc: true,
        URL: "https://heteen.com/ ",
        wikiSnippet: '',
        Street: "1090 heteen",
        City: "Riyadh",
        streetViewUrl: "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=",
        streetViewImage: function() {
            return this.streetViewUrl + this.Street + ',' + this.City + '';
        },
        infoWindow: ''

    },
    {

        name: 'yasmeen',
        latlngLoc: {
            lat: 24.822450, 
            lng: 46.637821
        },
        markerLoc: true,
        URL: "https://yasmeen.com/ ",
        wikiSnippet: '',
        Street: "1090 yasmeen",
        City: "Riyadh",
        streetViewUrl: "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=",
        streetViewImage: function() {
            return this.streetViewUrl + this.Street + ',' + this.City + '';
        },
        infoWindow: ''

    },
    {

        name: 'nakeel',
        latlngLoc: {
            lat: 24.742654, 
            lng: 46.615849
        },
        markerLoc: true,
        URL: "https://nakeel.com/ ",
        wikiSnippet: '',
        Street: "1090 nakeel",
        City: "Riyadh",
        streetViewUrl: "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=",
        streetViewImage: function() {
            return this.streetViewUrl + this.Street + ',' + this.City + '';
        },
        infoWindow: ''

    }
];

var Restaurant = function(data) {
    var self = this;
    self.name = data.name;
    self.latlngLoc = data.latlngLoc;
    self.markerLoc = data.markerLoc;
    self.URL = data.URL;
    self.street = data.street;
    self.city = data.city;
    self.wikiSnippet = data.wikiSnippet;
    self.distance = ko.observable(data.distance);
    self.infoWindow = data.infoWindow;
    self.streetViewImage = data.streetViewImage();
    this.visible = ko.observable(true);
};
var map, marker;

var ViewModel = function() {
    var self = this;
    this.names = ko.observableArray([]);
    this.markers = ko.observableArray([]);
    this.restaurantList = ko.observableArray([]);
    this.query = ko.observable('');

    initialRestaurants.forEach(function(resLoc) {
        self.restaurantList.push(new Restaurant(resLoc));
    });
    for (var i = 0; i < self.restaurantList().length; i++) {

        marker = new google.maps.Marker({
            map: map,
            position: initialRestaurants[i].latlngLoc,
            title: initialRestaurants[i].name,
            streetAddress: initialRestaurants[i].Street,
            cityAddress: initialRestaurants[i].City,
            url: initialRestaurants[i].URL,
            wikiSnippet: initialRestaurants[i].wikiSnippet,
            streetViewImage: initialRestaurants[i].streetViewImage(),
            draggable: true,
            visible: true

        });




        self.restaurantList()[i].contentString = '<img src="' + self.restaurantList()[i].streetViewImage +
            '" alt="Street View Image of ' + self.restaurantList()[i].title + '"><br><hr style="margin-bottom: 5px"><strong>' +
            self.restaurantList()[i].title + '</strong><br><p>' +
            self.restaurantList()[i].streetAddress + '<br>' +
            self.restaurantList()[i].cityAddress + '<br>' +
            self.restaurantList()[i].wikiSnippet + '<br></p><a class="web-links" href="http://' + self.restaurantList()[i].url +
            '" target="_blank">' + self.restaurantList()[i].url + '</a>';

        var largeInfoWindow = new google.maps.InfoWindow({
            content: initialRestaurants[i].contentString
        });
        marker.addListener('click', handler); 


        if (marker.title === this.restaurantList()[i].name) {
            self.restaurantList()[i].marker = marker;
            self.restaurantList()[i].infoWindow = largeInfoWindow;
        }



    } //end of for loop
    
    function handler() {
        populateInfoWindow(this, largeInfoWindow);
        toggleBounce(this);
    }
    
    var populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            
            infowindow.setContent('<img src="' + marker.streetViewImage +
                '" alt="Street View Image of ' + marker.title + '"><br><hr style="margin-bottom: 5px"><strong>' +
                marker.title + '</strong><br><p>' +
                marker.streetAddress + '<br>' +
                marker.cityAddress + '<br>' +
                marker.wikiSnippet + '<br></p><a class="web-links" href="http://' + marker.url +
                '" target="_blank">' + marker.url + '</a>');

            // Open the infowindow on the correct marker.
           
            infowindow.open(map, marker);
           
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    var toggleBounce = function(marker) {

            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1000);
 
    };

    this.setMarker = function(data) {
        google.maps.event.trigger(data.marker, 'click');
        
    };



    this.filteredResList = ko.computed(function() {
        return ko.utils.arrayFilter(self.restaurantList(), function(resLoc) {
            if (self.query().length === 0 || resLoc.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1) {
               resLoc.marker.setVisible(true);
                return true;
            } else {
               resLoc.marker.setVisible(false);
                return false;
            }
        });
    });

    this.getWikiData = function(data) {
    // If the wikiRequest times out, then display a message with a link to the Wikipedia page.
    var wikiRequestTimeout = setTimeout(function() {
     var msg = 'failed to get wikipedia resources, Please Click here: <a href="';
      var wikiUrl = 'https://en.wikipedia.org/wiki/';

      for(var i=0; i<self.restaurantList().length; i++) {
        $wikiElem.text("failed to get wikipedia resources");
        
      }
    }, 1000);

      
      var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + data.name + '&format=json&callback=wikiCallback';

      $.ajax({
        url: wikiUrl,
        dataType:'jsonp',
        success: function(response){
            data.marker.wikiSnippet = response[2][1];
            
        }
      });

    function handleData(response) {
          
          var articleList = response[1];
          // Go through the list and find the correct item, then add the wikiSnippet data
            articleStr = self.restaurantList()[i];
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
              self.restaurantList().marker.wikiSnippet=response[2][0];


          clearTimeout(wikiRequestTimeout);
        }
    

  };// function getWikiData


   
  for(var i=0 ;i<self.restaurantList().length ; i++)
      {
          self.getWikiData(self.restaurantList()[i]);
      }
  
  
  
}; // end of ViewModel


var styles = [{
    stylers: [{
            hue: "#00ffe6"
        },
        {
            saturation: -20
        }
    ]
}, {
    featureType: "road",
    elementType: "geometry",
    stylers: [{
            lightness: 100
        },
        {
            visibility: "simplified"
        }
    ]
}, {
    featureType: "road",
    elementType: "labels",
    stylers: [{
        visibility: "off"
    }]
}];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {
            lat: 24.712717,
            lng: 46.674213
        },
        styles: styles

    });




    ko.applyBindings(new ViewModel());
}


function googleCallBack() {
    alert("Error Loading The Map");
}