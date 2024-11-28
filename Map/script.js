class AppletCard {
    constructor(title, icon, description, link, status = "Available", sightings, lat, lng) {
        this.title = title;
        this.icon = icon;
        this.description = description;
        this.link = link;
        this.status = status;
        this.sightings = sightings;
        this.lat = lat;  // Store latitude for the marker
        this.lng = lng;  // Store longitude for the marker
    }

    createCard(map) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card applet-card';
        cardDiv.innerHTML = `
            <div class="card" data-bs-toggle="tooltip" title="${this.description}">
                <a href="${this.link}" style="text-decoration: none; color: inherit;">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-4">
                                <img src="${this.icon}" class="applet-icon rounded float-start">
                            </div>
                            <div class="col-8">
                                <h5 class="card-title">${this.title}</h5>
                                <p class="card-status">${this.status}</p>
                                <p class="card-text">${this.description}</p>
                                <p class="card-sightings"># of Sightings: ${this.sightings}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;

        cardDiv.addEventListener('click', () => {
            // When the applet card is clicked, add/update the marker on the map
            map.clearMarkers();  // Clear existing markers
            map.addMarker(this.lat, this.lng, this.title, this.icon);  // Add new marker
        });

        return cardDiv;
    }
}

class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = [];  // Store markers for later removal
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
        this.markers.push(marker);  // Save the marker to the array
    }

    clearMarkers() {
        // Remove all markers from the map
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];  // Clear the markers array
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
            const appletCard = new AppletCard(applet.title, applet.icon, applet.description, applet.link, applet.status, applet.sightings, applet.lat, applet.lng);
            const cardElement = appletCard.createCard(this.map);
            this.container.appendChild(cardElement);
        });

        this.initializeTooltips();
    }

    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(this.container.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
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
myMap.loadMarkersFromJson('yes.json');

// Initialize the renderer
const appletRenderer = new AppletRenderer('applet-container1', 'searchApplet', myMap);
appletRenderer.fetchAppletData('data.json');