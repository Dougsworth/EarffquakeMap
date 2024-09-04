import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";

import "./index.css"; // Ensure this is imported at the top of index.js

// Use the path to your icon from the `public` folder
const customIcon = new L.Icon({
  iconUrl: "/sumn.png", // Path to the image in the public folder
  iconSize: [35, 35], // Customize the icon size
  iconAnchor: [17, 35], // Customize the anchor point
  popupAnchor: [0, -35], // Position of the popup relative to the icon
});

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [year, setYear] = useState("1950"); // Default year filter starts at 1950
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1950-01-01&endtime=2010-12-31&minlatitude=17.5&maxlatitude=19.0&minlongitude=-78.5&maxlongitude=-75.0"
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedEarthquakes = data.features.map((eq) => {
          return {
            id: eq.id,
            place: eq.properties.place,
            magnitude: eq.properties.mag,
            time: new Date(eq.properties.time), // Convert timestamp to Date object
            depth: eq.geometry.coordinates[2], // Depth of the earthquake
            coordinates: [
              eq.geometry.coordinates[1],
              eq.geometry.coordinates[0],
            ], // [lat, lon]
          };
        });
        setEarthquakes(parsedEarthquakes);
      })
      .catch((error) =>
        console.error("Error fetching earthquake data:", error)
      );
  }, []);

  // Update filtered earthquakes whenever the year changes
  useEffect(() => {
    const filtered = earthquakes.filter(
      (eq) => eq.time.getFullYear().toString() === year
    );
    setFilteredEarthquakes(filtered);
  }, [year, earthquakes]);

  // Handle button click for displaying popup after 3 clicks
  const handleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
    if (clickCount + 1 === 3) {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        setShowPopup(true);
        document.body.classList.remove("fade-out");
      }, 1000);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Earthquake Map of Jamaica (1950-2010)</h1>

      {/* Year filter and button container */}
      <div className="filter-button-container">
        <div className="filter-container">
          <label htmlFor="year-select">Filter by year:</label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 61 }, (_, i) => (
              <option key={1950 + i} value={1950 + i}>
                {1950 + i}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleClick} className="action-button">
          Click me x 3
        </button>
      </div>

      <MapContainer
        center={[18.1096, -77.2975]} // Jamaica coordinates
        zoom={8} // More zoomed-in view
        style={{ height: "600px", width: "100%", borderRadius: "10px" }} // Styled map
        className="styled-map"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://carto.com/">CARTO</a>'
        />

        {/* Render filtered earthquake markers */}
        {filteredEarthquakes.map((eq) => (
          <Marker
            key={eq.id}
            position={eq.coordinates} // Corrected coordinates for Leaflet
            icon={customIcon} // Use the custom icon here
          >
            <Popup>
              <strong>Location:</strong> {eq.place}
              <br />
              <strong>Magnitude:</strong> {eq.magnitude}
              <br />
              <strong>Time:</strong> {eq.time.toLocaleString()}
              <br />
              <strong>Depth:</strong> {eq.depth} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Conditional Popup with fireworks */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2>Thank you for being here, Arii! 💖</h2>
            <p>Kisses! 😘</p>
            <div className="fireworks-container">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
