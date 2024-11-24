class AppletCard {
    constructor(title, icon, description, link) {
        this.title = title;
        this.icon = icon;
        this.description = description;
        this.link = link;
    }
    createCard() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card applet-card';
        cardDiv.innerHTML = `
            <div class="card"  data-bs-toggle="tooltip" title="${this.description}">
                <a href="${this.link}" style="text-decoration: none; color: inherit;">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-4">
                                <img src="${this.icon}" class="applet-icon rounded float-start">
                            </div>
                            <div class="col-8">
                                <h5 class="card-title">${this.title}</h5>
                                <p class="card-text">${this.description}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
        return cardDiv;
    }
}

class AppletRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.appletData = [];
        this.filteredData = [];
    }

    fetchAppletData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.appletData = data;
                this.filteredData = data;  // No filtering needed
                this.renderApplets(this.filteredData);  // Render all applets
            })
            .catch(error => console.error('Error loading applet data:', error));
    }

    renderApplets(data) {
        this.container.innerHTML = ''; // Clear the container before appending new content
        data.forEach(applet => {
            const appletCard = new AppletCard(applet.title, applet.icon, applet.description, applet.link);
            const cardElement = appletCard.createCard();
            this.container.appendChild(cardElement);
        });
        this.initializeTooltips(); // Initialize tooltips if any
    }

    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(this.container.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl); // Initialize Bootstrap tooltips
        });
    }
}

// Initialize the AppletRenderer and fetch applet data
const appletRenderer = new AppletRenderer('applet-container');
appletRenderer.fetchAppletData('data.json');