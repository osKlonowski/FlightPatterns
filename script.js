let routes;
let data = [];
let coordinates;
let names = [];
let coNames = [];
let airplanes;
let currentAirplane = 0;
let white;
let orange;

//Setting Options for the Map Visualization
const options = {
  lat: 0,
  lng: 0,
  zoom: 1.5,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

const mappa = new Mappa('Leaflet');

//Preloading all of the necessary files
function preload() {
  routes = loadTable('routes.csv', 'csv', 'header');
  coordinates = loadJSON('coordinates.json');
}

//Main Setup Function
function setup() {
  canvas = createCanvas(800, 600);
  trainMap = mappa.tileMap(options);
  trainMap.overlay(canvas);

  // fill(200, 20, 20);

  airplanes = new AirplaneSystem();
  stroke(10);
  white = color(255, 255, 255);
  orange = color(255, 170, 37, 170);
  //Print the row count for each file
  // console.log(routes.getRowCount() + ' total rows in routes');
  // console.log(routes.getColumnCount() + ' total columns in routes');
  // console.log(airports.getRowCount() + ' total rows in aiports')
  // console.log(airports.getColumnCount() + ' total columns in airports');

}

function draw() {
  // clear();
  // airplanes.destroyTheEarth();
  // airplanes.showLanded();
  //Print the departure and arrival airport from the routes.csv with their coordinates
  d3.csv("routes.csv").then(function(data) {
    for (var i = 0; i < routes.getRowCount(); i++) {
      //For the Origin Airport
      let OriginAirport = data[i].AER;
      let latlonO = coordinates[OriginAirport];
      if (latlonO) {
        var latO = latlonO['latitude'];
        var lonO = latlonO['longitude'];
      }
      // airplanes.addAirplane(latO, lonO);
      // currentAirplane++;
      const Origin = trainMap.latLngToPixel(latO, lonO);
      ellipse(Origin.x, Origin.y, 4, 4);

      // if (random() > 0.7) {
      //     airplanes.addAirplane(data.getString(currentAirplane, 'reclat'), data.getString(currentAirplane, 'reclong'));
      //     currentAirplane++;
      //   }

      // For the Destination Airport
      let DestAirport = data[i].KZN;
      let latlonD = coordinates[DestAirport];
      if (latlonD) {
        var latD = latlonD['latitude'];
        var lonD = latlonD['longitude'];
      }

      const Destination = trainMap.latLngToPixel(latD, lonD);
      ellipse(Destination.x, Destination.y, 4, 4);
      line(Origin.x, Origin.y, Destination.x, Destination.y);

      //Pushing all names with coordinates to an array
      // coNames.push(OriginAirport, latO, lonO, DestAirport, latD, lonD);
      //Pushing all names to an array
      // names.push(OriginAirport, DestAirport);
      // console.log("The Origin Airport is " + OriginAirport + " and its coordinates are " + latO + " " + lonO);
      // console.log("The Destination Airport is " + DestAirport + " and its coordinates are " + latD + " " + lonD);
    }
    // console.log("Completed the RunThrough");
  });
}

// Airplane class
const Airplane = function (lat, lng) {
  this.origin = createVector(random(0, 800) , 600 + random(500,1000));
  this.destination = createVector(0, 0);
  this.lat = lat;
  this.lng = lng;
  this.delta = 0;
};

//Airplane System
var AirplaneSystem = function() {
  this.airplanes = [];
  this.landedAirplanes = [];
};

Airplane.prototype.run = function() {
  this.update();
  this.display();
};

AirplaneSystem.prototype.addAirplane = function(lat, lng) {
  this.airplanes.push(new Airplane(lat, lng));
};

Airplane.prototype.update = function(){
  this.pixelPos = trainMap.latLngToPixel(this.lat, this.lng);
  this.destination.x = this.pixelPos.x;
  this.destination.y = this.pixelPos.y;
  this.position = this.origin.lerp(this.destination, this.delta);
  this.delta > 0.15 ? this.delta += 0.05 : this.delta += 0.001;
};

Airplane.prototype.display = function(){
  strokeWeight(2);
  fill(orange);
  ellipse(this.position.x, this.position.y, 7, 7);
};

Airplane.prototype.landed = function(){
  if (this.delta > 1) {
    // Explossion
    for(var e = 11; e > 1; e--){
      fill(lerpColor(orange, white, e/11));
      ellipse(this.position.x, this.position.y, 7 + e/2 , 7 + e/2);
    }
    return true;
  } else {
    return false;
  }
};

AirplaneSystem.prototype.addAirplane = function(lat, lng) {
  this.airplanes.push(new Airplane(lat, lng));
};

AirplaneSystem.prototype.showLanded = function(lat, lng) {
  this.landedAirplanes.forEach(function(airplane){
    var p = trainMap.latLngToPixel(airplane[0], airplane[1]);
    fill(255, 170, 37, 100);
    ellipse(p.x, p.y, 6, 6);
  })
};

AirplaneSystem.prototype.destroyTheEarth = function() {
  for (var i = this.airplanes.length - 1; i >= 0; i--) {
    var m = this.airplanes[i];
    m.run();
    if (m.landed()) {
      this.landedAirplanes.push([m.lat, m.lng]);
      this.airplanes.splice(i, 1);
    }
  }
};
