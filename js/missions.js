// missions.js
// Mission Logic for Nimbus Block 2.0

export const TIERS = {
    EASY: [
        { id: "e1", type: "score", target: 500, desc: "Score 500 Points" },
        { id: "e2", type: "clear_blocks", target: 20, desc: "Clear 20 Blocks Total" },
        { id: "e3", type: "survive_time", target: 45, desc: "Survive 45 Seconds" },
        { id: "e4", type: "segment", target: 3, desc: "Clear 3 Segments" }
    ],
    MEDIUM: [
        { id: "m1", type: "combo", target: 2, desc: "Perform a 2-Chain Combo" },
        { id: "m2", type: "score", target: 2000, desc: "Score 2,000 Points" },
        { id: "m3", type: "color_clear", target: 10, color: "fist", desc: "Clear 10 Fuchsia Blocks", colorHex: "#e879f9" },
        { id: "m4", type: "no_rotate", target: 5, desc: "Land 5 Pieces without Rotating" }
    ],
    HARD: [
        { id: "h1", type: "perfection", target: 3, desc: "Clear 3 Segments Perfectly (7-wide)" },
        { id: "h2", type: "survive_score", target: 5000, desc: "Score 5,000 in one run" },
        { id: "h3", type: "clear_blocks", target: 100, desc: "Clear 100 Blocks" },
        { id: "h4", type: "combo", target: 3, desc: "Perform a 3-Chain Combo" }
    ]
};

export class MissionSystem {
    constructor() {
        this.activeMission = null;
        this.progress = 0;
        this.tierIndex = 0; // 0=Easy, 1=Med, 2=Hard
        this.missionQueue = [];
        this.generateQueue();
        this.nextMission();

        // State tracking for complex missions
        this.startTime = Date.now();
        this.comboCounter = 0;
        this.noRotateCounter = 0;
    }

    generateQueue() {
        // Simple linear progression for now: mix of easy -> med -> hard
        this.missionQueue = [
            ...this.shuffle(TIERS.EASY).slice(0, 3),
            ...this.shuffle(TIERS.MEDIUM).slice(0, 3),
            ...this.shuffle(TIERS.HARD).slice(0, 3)
        ];
    }

    shuffle(array) {
        return array.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    nextMission() {
        if (this.missionQueue.length > 0) {
            this.activeMission = this.missionQueue.shift();
            this.progress = 0;
            this.startTime = Date.now();
            this.comboCounter = 0;
            this.noRotateCounter = 0;
            return this.activeMission;
        } else {
            // Endless fallback
            this.activeMission = { id: "endless", type: "score", target: 10000, desc: "Bonus: Score 10,000" };
            this.progress = 0;
            return this.activeMission;
        }
    }

    // Event hooks
    onBlockClear(count, colorName) {
        if (!this.activeMission) return false;

        let completed = false;

        if (this.activeMission.type === "clear_blocks") {
            this.progress += count;
        } else if (this.activeMission.type === "color_clear" && colorName === this.activeMission.color) {
            this.progress += count;
        }

        return this.checkCompletion();
    }

    onSegmentClear(count) {
        if (this.activeMission.type === "segment") {
            this.progress += 1;
        } else if (this.activeMission.type === "perfection" && count === 14) { // 2x7 = 14
            this.progress += 1;
        }

        // Combos
        if (count > 0) {
            this.comboCounter++;
            if (this.activeMission.type === "combo" && this.comboCounter >= this.activeMission.target) {
                this.progress = this.activeMission.target;
            }
        } else {
            this.comboCounter = 0;
        }

        return this.checkCompletion();
    }

    onPieceLock(didRotate) {
        if (this.activeMission.type === "no_rotate") {
            if (!didRotate) {
                this.progress++;
            } else {
                this.progress = 0; // Reset streak
            }
        }
        return this.checkCompletion();
    }

    onScore(points) {
        if (this.activeMission.type === "score" || this.activeMission.type === "survive_score") {
            this.progress += points;
        }
        return this.checkCompletion();
    }

    updateTime() {
        if (this.activeMission.type === "survive_time") {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.progress = Math.floor(elapsed);
        }
        return this.checkCompletion();
    }

    checkCompletion() {
        if (!this.activeMission) return false;
        if (this.progress >= this.activeMission.target) {
            return true;
        }
        return false;
    }

    resetCombo() {
        this.comboCounter = 0;
    }
}
