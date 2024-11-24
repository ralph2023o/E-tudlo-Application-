class LeafletMap {

    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
    }

    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 100,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    addMarker(lat, lng, message, imageUrl) {
        const customIcon = L.icon({
            iconUrl: 'download.jpg', // Path to your custom marker image
            iconSize: [32, 32], // Size of the icon
            iconAnchor: [16, 32], 
            popupAnchor: [0, -32]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

        const popupContent = `
            <div>
                <img src="${imageUrl}" alt="Popup Image" style="width: 100%; max-width: 200px; height: auto;"/>
                <p>${message}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
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

const myMap = new LeafletMap('map', [8.360004, 124.868419], 12);
myMap.loadMarkersFromJson('yes.json');