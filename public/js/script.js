const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },

    (error) => {
      console.error("Error getting location:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Track Device",
}).addTo(map);

const markers = {};

socket.on("receive-location", (location) => {
  const { id, latitude, longitude } = location;
  const offset = (id.charCodeAt(0) % 5) * 0.0005;
  const adjustedLongitude = longitude + offset;
  const adjustedLatitude = latitude + offset;
  
  map.setView([adjustedLatitude, adjustedLongitude]);

  if (markers[id]) {
    markers[id].setLatLng([adjustedLatitude, adjustedLongitude]);
  } else {
    markers[id] = new L.marker([adjustedLatitude, adjustedLongitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
