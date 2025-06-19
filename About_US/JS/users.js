/**
 * Team Manager - Gestisce la sezione team dinamicamente da JSON 
 */
/**
 * Team Manager - Gestisce la sezione team dinamicamente da JSON
 */
class TeamManager {
    constructor(jsonPath = 'JS/Users.json') {
        this.jsonPath = jsonPath;
        this.data = null;
    }

    /**
     * Inizializza il team manager
     */
    async init() {
        try {
            await this.loadData();
            this.renderTeamSection();
            this.initializeAnimations();
        } catch (error) {
            console.error('Errore durante l\'inizializzazione del Team Manager:', error);
        }
    }

    /**
     * Carica tutti i dati dal file JSON unificato
     */
    async loadData() {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Errore durante il caricamento dei dati:', error);
            throw error;
        }
    }

    /**
     * Renderizza l'intera sezione team
     */
    renderTeamSection() {
        const existingTeamSection = document.querySelector('.team-section');
        if (!existingTeamSection) {
            console.error('Sezione team non trovata');
            return;
        }

        const teamGrid = this.createTeamGrid();
        const teamGridContainer = existingTeamSection.querySelector('.team-grid');
        if (teamGridContainer) {
            teamGridContainer.innerHTML = teamGrid;
        }
    }

    /**
     * Crea la griglia dei membri del team
     * Usa solo i dati necessari per il team dalla sezione users
     */
    createTeamGrid() {
        return this.data.users.map(user => this.createTeamMemberCard(user)).join('');
    }

    /**
     * Crea una card per un membro del team
     * Estrae solo name, description, avatar, komootUrl dai dati completi
     */
    createTeamMemberCard(user) {
        return `
            <div class="team-member">
                <div class="avatar">
                    <img src="Img/${user.avatar}" alt="Avatar ${user.name}" />
                </div>
                <h3 class="member-name">${user.name}</h3>
                <p>${user.description}</p>
                <a href="${user.komootUrl}" target="_blank" rel="noopener noreferrer" class="member-link">
                    Visualizza Profilo Komoot
                </a>
            </div>
        `;
    }

    /**
     * Inizializza le animazioni per i membri del team
     */
    initializeAnimations() {
        const teamMembers = document.querySelectorAll('.team-member');

        // Aggiungi effetti hover
        teamMembers.forEach(member => {
            member.addEventListener('mouseenter', function () {
                this.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 147, 251, 0.2))';
            });

            member.addEventListener('mouseleave', function () {
                this.style.background = 'rgba(255, 255, 255, 0.5)';
            });
        });
    }
}

// Inizializzazione quando il DOM è carico
document.addEventListener('DOMContentLoaded', () => {
    const teamManager = new TeamManager();
    teamManager.init();
});