class AppletCard {
    constructor(title, icon, description, link, status = "Available", sightings, locations) {
        this.title = title;
        this.icon = icon;
        this.description = description;
        this.link = link;
        this.status = status;
        this.sightings = sightings;
        this.locations = locations;  // Array of {lat, lng} objects
    }

    createCard(map) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card applet-card';
        cardDiv.innerHTML = `
            <div class="card" data-bs-toggle="tooltip" title="${this.description}">
                <a href="${this.link}" style="text-decoration: none; color: inherit;" class="applet-link">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-4">
                                <img src="${this.icon}" class="applet-icon rounded float-start">
                            </div>
                            <div class="col-8">
                                <p class="card-title">${this.title}<p>
                                <p class="card-status">${this.status}</p>
                                <p class="card-text">${this.description}</p>
                                <p class="card-sightings"># of Sightings: ${this.sightings}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;

        // Handle the click event for each applet
        cardDiv.addEventListener('click', (event) => {
            event.preventDefault();  // Prevent the link from being followed

            // Clear previous markers related to this applet
            map.clearAppletMarkers();

            // Create an array to hold the lat/lng of all the locations
            const latLngs = [];

            // Loop through locations and add all markers for this applet
            this.locations.forEach(location => {
                map.addMarker(location.lat, location.lng, this.title, this.icon);
                latLngs.push([location.lat, location.lng]);  // Add each location to latLngs
            });

            // If there are locations, auto-zoom to fit all the markers
            if (latLngs.length > 0) {
                const bounds = L.latLngBounds(latLngs);  // Create a LatLngBounds from all locations
                map.map.fitBounds(bounds);  // Auto-zoom and center map to fit bounds
            }
        });

        return cardDiv;
    }
}
class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = [];  // All markers
        this.appletMarkers = [];  // Markers for the current applet
    }

    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 100,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    addMarker(lat, lng, message, imageUrl) {
        const marker = L.marker([lat, lng]).addTo(this.map);
        const popupContent = `
            <div>
                <img src="${imageUrl}" alt="Popup Image" style="width: 100%; max-width: 200px; height: auto;"/>
                <p>${message}</p>
            </div>
        `;
        marker.bindPopup(popupContent);
        this.appletMarkers.push(marker);  // Keep track of markers for this applet
    }

    clearAppletMarkers() {
        // Remove only the markers related to the current applet
        this.appletMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.appletMarkers = [];  // Reset the applet markers
    }

    updateMarkers(lat, lng, title, icon) {
        this.clearAppletMarkers();
        this.addMarker(lat, lng, title, icon);
        this.map.setView([lat, lng], 15);
    }

    loadMarkersFromJson(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.forEach(marker => {
                    this.addMarker(marker.latitude, marker.longitude, marker.message, marker.imageUrl);
                });
            })
            .catch(error => console.error('Error loading markers:', error));
    }
} 


class AppletRenderer {
    constructor(containerId, searchInputId, map) {
        this.container = document.getElementById(containerId);
        this.searchInput = document.getElementById(searchInputId);
        this.appletData = [];
        this.filteredData = [];
        this.map = map;
        this.searchInput.addEventListener('input', () => this.filterApplets());
    }

    fetchAppletData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.appletData = data;
                this.filteredData = data;
                this.renderApplets(this.filteredData);
            })
            .catch(error => console.error('Error loading applet data:', error));
    }

    renderApplets(data) {
        this.container.innerHTML = '';
        data.forEach(applet => {
            const appletCard = new AppletCard(
                applet.title, 
                applet.icon, 
                applet.description, 
                applet.link, 
                applet.status, 
                applet.sightings, 
                applet.locations // Pass the locations array here
            );
            const cardElement = appletCard.createCard(this.map);
            this.container.appendChild(cardElement);
        });
    }

    filterApplets() {
        const query = this.searchInput.value.toLowerCase();
        this.filteredData = this.appletData.filter(applet =>
            applet.title.toLowerCase().includes(query) ||
            applet.description.toLowerCase().includes(query)
        );
        this.renderApplets(this.filteredData);
    }
}

// Initialize the map
const myMap = new LeafletMap('map', [8.360004, 124.868419], 15);

// Optionally load markers from a JSON file
myMap.loadMarkersFromJson('data.json');

// Initialize AppletRenderer and fetch data
const appletRenderer = new AppletRenderer('applet-container1', 'searchApplet', myMap);
appletRenderer.fetchAppletData('data.json');