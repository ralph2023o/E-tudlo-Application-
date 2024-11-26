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
function fetchSnakeData() {
    fetch('snakes.json')  // Make sure the JSON file is correct
        .then(response => response.json())
        .then(data => {
            populateSnakeSelector(data);  // Populate the dropdown with snake names
        })
        .catch(error => {
            console.error('Error fetching snake data:', error);
        });
}

// Populate the snake selector dropdown with snake names
function populateSnakeSelector(snakes) {
    const snakeSelect = document.getElementById('snake');
    snakes.forEach(snake => {
        const option = document.createElement('option');
        option.value = snake.title.toLowerCase();  // Use snake name in lowercase for matching
        option.textContent = snake.title;          // Display the snake title in the dropdown
        snakeSelect.appendChild(option);
    });
}

// Display snake details when selected
function displaySnakeDetails() {
    const selectedSnakeTitle = document.getElementById('snake').value;
    const snakeDetails = document.getElementById('snake-details');
    
    if (!selectedSnakeTitle) {
        snakeDetails.style.display = 'none';  // Hide details if no snake is selected
        return;
    }

    fetch('snakes.json')  // Fetch the JSON data again to get the selected snake's details
        .then(response => response.json())
        .then(snakes => {
            const selectedSnake = snakes.find(snake => snake.title.toLowerCase() === selectedSnakeTitle);
            
            if (selectedSnake) {
                // Update the modal with selected snake details
                document.getElementById('snake-title').textContent = selectedSnake.title;
                document.getElementById('snake-status').textContent = selectedSnake.status;
                document.getElementById('snake-description').textContent = selectedSnake.description;
                document.getElementById('snake-link').href = selectedSnake.link;
                document.getElementById('snake-link').textContent = 'Learn more about ' + selectedSnake.title;
                document.getElementById('snake-icon').src = selectedSnake.icon;
                document.getElementById('snake-icon').alt = selectedSnake.title + " image";

                // Show the snake details section
                snakeDetails.style.display = 'block';
            }
        })
        .catch(error => console.error('Error displaying snake details:', error));
}

// Close modal function
function closeModal() {
    document.querySelector('.modal').style.display = 'none';
}

// Open modal function (for example, triggered by a button)
function openModal() {
    document.querySelector('.modal').style.display = 'block';
    fetchSnakeData();  // Fetch data when modal is opened
}