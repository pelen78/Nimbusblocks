// ui.js
// UI Manager for Nimbus Block 2.0

export class UI {
    constructor(game) {
        this.game = game;

        // HUD Elements
        this.scoreEl = document.getElementById("score");
        this.missionDescEl = document.getElementById("missionDesc");
        this.progressBar = document.getElementById("missionProgressBar");
        this.progressText = document.getElementById("missionProgressText");

        // Screens
        this.screens = {
            start: document.getElementById("startOverlay"),
            gameOver: document.getElementById("gameOverOverlay"),
            pause: document.getElementById("pauseOverlay"),
            mission: document.getElementById("missionOverlay")
        };

        // Show start initially
        this.showScreen("start");
    }

    updateHUD(state) {
        if (state.score !== undefined && this.scoreEl) {
            this.scoreEl.textContent = state.score.toLocaleString();
        }

        if (state.mission) {
            const m = state.mission;
            if (this.missionDescEl) this.missionDescEl.textContent = m.desc;

            // Calc percentage
            let pct = 0;
            if (m.target > 0) pct = (this.game.missions.progress / m.target) * 100;
            if (pct > 100) pct = 100;

            if (this.progressBar) this.progressBar.style.width = `${pct}%`;
            if (this.progressText) this.progressText.textContent = `${this.game.missions.progress} / ${m.target}`;
        }
    }

    showScreen(name) {
        Object.values(this.screens).forEach(el => {
            if (el) el.classList.add("hidden");
        });
        const target = this.screens[name];
        if (target) target.classList.remove("hidden");
    }

    /*
     * For mission completion, we flash the overlay but don't stop the render loop
     * effectively (Game handles pause if desired, but typically we want flow).
     * Actually, let's keep it overlapping.
     */
    showMissionComplete(msg) {
        const el = this.screens.mission;
        if (el) {
            el.querySelector("h2").textContent = "MISSION COMPLETE";
            el.querySelector("p").textContent = msg;
            el.classList.remove("hidden");
            // Auto hide handled by Game class timeout
        }
    }

    hideScreens() {
        Object.values(this.screens).forEach(el => {
            if (el) el.classList.add("hidden");
        });
    }
}
