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

let snakeData = []; // Will store the snake data after fetching

let selectedSnake = null; // Store the selected snake object

// Select DOM elements
const reportSightingBtn = document.getElementById('reportSightingBtn');
const snakeLibrary = document.getElementById('snakeLibrary');
const snakeModal = document.getElementById('snakeModal');
const closeModalBtn = document.querySelector('.close');
const modalSnakeLibrary = document.getElementById('modalSnakeLibrary');
const sightingForm = document.getElementById('sightingForm');
const selectedSnakeDetails = document.getElementById('selectedSnakeDetails');

// Fetch snake data from data.json file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        snakeData = data.snakes; // Assuming data.json contains a "snakes" key
        renderSnakeLibrary(); // Render the snake library once data is fetched
    })
    .catch(error => console.log('Error loading snake data:', error));

// Function to render snake cards in the main library
function renderSnakeLibrary() {
    snakeLibrary.innerHTML = ''; // Clear previous snake cards

    snakeData.forEach(snake => {
        const snakeCard = document.createElement('div');
        snakeCard.classList.add('snake-card');
        snakeCard.innerHTML = `
            <img src="${snake.icon}" alt="${snake.title}">
            <p>${snake.title}</p>
        `;
        snakeCard.addEventListener('click', () => openModal(snake));
        snakeLibrary.appendChild(snakeCard);
    });
}

// Function to open the modal and display snake details
function openModal(snake) {
    selectedSnake = snake;  // Store selected snake
    renderModalSnakeLibrary();  // Render the modal with snake options
    snakeModal.style.display = 'block';  // Show modal

    // Show selected snake details in the modal
    selectedSnakeDetails.innerHTML = `
        <h3>${snake.title}</h3>
        <p>${snake.description}</p>
        <p>Status: ${snake.status}</p>
    `;
}

// Function to close the modal
closeModalBtn.addEventListener('click', () => {
    snakeModal.style.display = 'none';
});

// Function to render snakes in the modal for selection
function renderModalSnakeLibrary() {
    modalSnakeLibrary.innerHTML = ''; // Clear previous modal content

    snakeData.forEach(snake => {
        const snakeCard = document.createElement('div');
        snakeCard.classList.add('snake-card');
        snakeCard.innerHTML = `
            <img src="${snake.icon}" alt="${snake.title}">
            <p>${snake.title}</p>
        `;
        snakeCard.addEventListener('click', () => {
            selectedSnake = snake;  // Set selected snake
            selectedSnakeDetails.innerHTML = `
                <h3>${snake.title}</h3>
                <p>${snake.description}</p>
                <p>Status: ${snake.status}</p>
            `;
        });
        modalSnakeLibrary.appendChild(snakeCard);
    });
}

// Handle form submission for reporting the sighting
sightingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedSnake) {
        alert('Please select a snake!');
        return;
    }

    const location = document.getElementById('location').value;
    if (!location) {
        alert('Please provide a location.');
        return;
    }

    // Log the sighting data (could be sent to a server or stored in localStorage)
    console.log('Sighting Reported:', {
        snake: selectedSnake,
        location: location
    });

    // Reset form and close the modal
    sightingForm.reset();
    snakeModal.style.display = 'none';
});

// Initialize by opening the modal when the user wants to report a sighting
reportSightingBtn.addEventListener('click', () => {
    snakeModal.style.display = 'block'; // Open the modal
});