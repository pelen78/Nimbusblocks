// game.js
import { PIECES, COLORS } from "./pieces.js";
import { audio } from "./audio.js";
import { UI } from "./ui.js";
import { MissionSystem } from "./missions.js";

const COLS = 12;
const ROWS = 22;
const BLOCK_SIZE = 24;

export class Game {
    constructor() {
        this.canvas = document.getElementById("tetris");
        this.ctx = this.canvas.getContext("2d");
        this.nextCanvas = document.getElementById("nextPiece");
        this.nextCtx = this.nextCanvas.getContext("2d");
        this.holdCanvas = document.getElementById("holdPiece");
        this.holdCtx = this.holdCanvas ? this.holdCanvas.getContext("2d") : null;

        this.resizeCanvas();

        this.ui = new UI(this);
        this.missions = new MissionSystem();

        this.arena = this.createMatrix(COLS, ROWS);

        this.player = {
            pos: { x: 0, y: 0 },
            matrix: null,
            color: null,
            shapeId: null,
            pieceQ: [],
            hold: null,
            canHold: true,
            didRotate: false
        };

        // Fill queue
        this.refillQueue();

        this.renderPos = { x: 0, y: 0 };

        this.score = 0;
        this.segmentsCleared = 0;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.isRunning = false;
        this.isPaused = false;

        this.inputHandler = this.handleInput.bind(this);
        document.addEventListener("keydown", this.inputHandler);

        // Bindings
        const startBtn = document.getElementById("startButton");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                console.log("Start button clicked");
                this.start();
            });
        } else {
            console.error("Start button not found!");
        }

        document.getElementById("pauseButton")?.addEventListener("click", () => this.togglePause());
        document.getElementById("resumeButton")?.addEventListener("click", () => this.togglePause());
    }

    resizeCanvas() {
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        this.canvas.style.width = `${COLS * BLOCK_SIZE}px`;
        this.canvas.style.height = `${ROWS * BLOCK_SIZE}px`;

        this.nextCanvas.width = 6 * BLOCK_SIZE;
        this.nextCanvas.height = 16 * BLOCK_SIZE;
    }

    createMatrix(w, h) {
        const m = [];
        while (h--) m.push(new Array(w).fill(0));
        return m;
    }

    start() {
        console.log("Game Start Triggered");
        try {
            this.arena.forEach(row => row.fill(0));
            this.score = 0;
            this.segmentsCleared = 0;
            this.dropInterval = 1000;
            this.isRunning = true;
            this.isPaused = false;

            this.missions = new MissionSystem();
            this.player.pieceQ = [];
            this.player.hold = null;
            this.player.canHold = true;
            this.refillQueue();

            this.spawnPiece();

            this.ui.hideScreens();
            this.ui.updateHUD({ score: 0, mission: this.missions.activeMission });
            this.drawQueue();

            try {
                audio.startMusic();
                audio.playSound("mission_complete");
            } catch (err) {
                console.warn("Audio start failed:", err);
            }

            this.update();
            console.log("Game Loop Started");
        } catch (e) {
            console.error("Error in Game.start:", e);
        }
    }

    refillQueue() {
        const shapes = Object.keys(PIECES);
        while (this.player.pieceQ.length < 5) {
            const shapeId = shapes[Math.floor(Math.random() * shapes.length)];
            this.player.pieceQ.push({
                shapeId,
                rotations: PIECES[shapeId],
                color: COLORS[shapeId]
            });
        }
    }

    spawnPiece() {
        const next = this.player.pieceQ.shift();
        this.refillQueue();

        this.player.matrix = next.rotations[0]; // Default 0 rotation
        this.player.rotations = next.rotations; // Store all rotations
        this.player.rotIndex = 0;
        this.player.color = next.color;
        this.player.shapeId = next.shapeId;

        this.player.pos.y = 0;
        this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);

        this.renderPos.x = this.player.pos.x;
        this.renderPos.y = this.player.pos.y;
        this.player.didRotate = false;
        this.player.canHold = true;

        if (this.collide(this.arena, this.player)) {
            this.gameOver();
        }
        this.drawQueue();
    }

    collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = { color: player.color, shapeId: player.shapeId };
                }
            });
        });
        audio.playSound("land");

        // Check missions related to dropping pieces
        if (this.checkMission(this.missions.onPieceLock(player.didRotate))) return;
    }

    rotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;

        const nextIdx = (this.player.rotIndex + dir + 4) % 4;
        const nextMatrix = this.player.rotations[nextIdx];

        const oldMatrix = this.player.matrix;
        this.player.matrix = nextMatrix;

        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                // Rotate failed, revert
                this.player.matrix = oldMatrix;
                this.player.pos.x = pos;
                return;
            }
        }
        this.player.rotIndex = nextIdx;
        this.player.didRotate = true;
        audio.playSound("rotate");
    }

    move(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= dir;
        } else {
            audio.playSound("move");
        }
    }

    drop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.checkClears();
            this.spawnPiece();
        }
        this.dropCounter = 0;
    }

    hardDrop() { // "Nimbus Shift" essentially if aiming for perfection, but let's keep standard hard drop
        while (!this.collide(this.arena, this.player)) {
            this.player.pos.y++;
        }
        this.player.pos.y--;
        this.merge(this.arena, this.player);
        this.checkClears();
        this.spawnPiece();
    }

    holdPiece() {
        if (!this.player.canHold) return; // One swap per turn

        const current = {
            shapeId: this.player.shapeId,
            rotations: this.player.rotations,
            color: this.player.color
        };

        if (!this.player.hold) {
            this.player.hold = current;
            this.spawnPiece(); // Get next from queue
        } else {
            const swap = this.player.hold;
            this.player.hold = current;

            // Set swapped piece as active
            this.player.matrix = swap.rotations[0];
            this.player.rotations = swap.rotations;
            this.player.rotIndex = 0;
            this.player.color = swap.color;
            this.player.shapeId = swap.shapeId;

            this.player.pos.y = 0;
            this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
            this.player.didRotate = false;
        }

        this.player.canHold = false;
        this.drawHold();
    }

    checkClears() {
        // Rule: Clear any filled 2-row band segment of width >= 7 contiguous cells.
        // Strategy: Scan every row. If index i and i+1 have a matching valid segment, mark it.

        let clearedBlocksTotal = 0;
        let segmentsFound = 0;
        const arenaCopy = this.arena.map(r => r.map(c => c)); // Deep enough copy

        // We need to mark blocks for removal.
        const toRemove = this.createMatrix(COLS, ROWS);

        for (let y = 0; y < ROWS - 1; y++) {
            // Check row y and y+1
            let run = 0;
            for (let x = 0; x < COLS; x++) {
                let filled = (this.arena[y][x] !== 0) && (this.arena[y + 1][x] !== 0);

                if (filled) {
                    run++;
                } else {
                    if (run >= 7) {
                        // Mark this segment
                        for (let k = 0; k < run; k++) {
                            toRemove[y][x - 1 - k] = 1;
                            toRemove[y + 1][x - 1 - k] = 1;
                        }
                        segmentsFound++;
                    }
                    run = 0;
                }
            }
            if (run >= 7) {
                // Mark this segment (edge case end of row)
                for (let k = 0; k < run; k++) {
                    toRemove[y][COLS - 1 - k] = 1;
                    toRemove[y + 1][COLS - 1 - k] = 1;
                }
                segmentsFound++;
            }
        }

        if (segmentsFound === 0) {
            // Send 0 to keep combo logic alive (reset it)
            this.missions.resetCombo();
            return;
        }

        // Remove marked blocks
        let blocksRemoved = 0;
        let colorsCleared = {};

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (toRemove[y][x]) {
                    const cell = this.arena[y][x];
                    if (cell && cell.shapeId) {
                        colorsCleared[cell.shapeId] = (colorsCleared[cell.shapeId] || 0) + 1;
                    }
                    this.arena[y][x] = 0;
                    blocksRemoved++;
                }
            }
        }

        // Gravity: Apply cascading gravity
        // Iterate cols, move blocks down into empty spaces
        for (let x = 0; x < COLS; x++) {
            let writeY = ROWS - 1;
            for (let readY = ROWS - 1; readY >= 0; readY--) {
                if (this.arena[readY][x] !== 0) {
                    const val = this.arena[readY][x];
                    this.arena[readY][x] = 0;
                    this.arena[writeY][x] = val;
                    writeY--;
                }
            }
        }

        if (blocksRemoved > 0) {
            audio.playSound("clear");
            this.score += blocksRemoved * 50 * (segmentsFound);
            this.ui.updateHUD({ score: this.score });

            // Check Missions
            // 1. Blocks Cleared
            if (this.checkMission(this.missions.onBlockClear(blocksRemoved))) return;
            // 2. Segment Cleared
            if (this.checkMission(this.missions.onSegmentClear(segmentsFound))) return;
            // 3. Color Cleared
            for (let shapeId in colorsCleared) {
                // We pass count per color. Mission system handles if it matches target.
                // Note: MissionSystem needs color HEX or ID? Let's use ID.
                // Update mission check logic to use ID.
            }
        }
    }

    checkMission(completed) {
        if (completed) {
            audio.playSound("mission_complete");
            this.ui.showMissionComplete("Mission Complete!");
            setTimeout(() => {
                this.missions.nextMission();
                this.ui.updateHUD({ mission: this.missions.activeMission });
                this.ui.hideScreens(); // Hide overlay
            }, 2000);
            return true;
        }
        this.ui.updateHUD({ mission: this.missions.activeMission, score: this.score });
        return false;
    }

    gameOver() {
        this.isRunning = false;
        audio.playSound("gameover");
        audio.stopMusic();
        this.ui.showScreen("gameOver");
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.ui.showScreen("pause");
            audio.stopMusic();
        } else {
            this.ui.hideScreens();
            audio.startMusic();
        }
    }

    update(time = 0) {
        if (!this.isRunning || this.isPaused) {
            this.lastTime = time;
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;

        // Update mission time
        if (this.missions.updateTime()) {
            this.checkMission(true);
        }
        this.ui.updateHUD({ mission: this.missions.activeMission });

        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }

        // Lerp
        const lerpSpeed = 0.2;
        this.renderPos.x += (this.player.pos.x - this.renderPos.x) * lerpSpeed;
        this.renderPos.y += (this.player.pos.y - this.renderPos.y) * lerpSpeed;

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        // Clear
        this.ctx.fillStyle = "#020617"; // Dark slate
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Grid
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i <= COLS; i++) {
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, this.canvas.height);
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * BLOCK_SIZE);
        }
        this.ctx.stroke();

        // Draw Arena
        this.drawMatrix(this.arena, { x: 0, y: 0 });

        // Draw Player
        if (this.player.matrix) {
            this.drawMatrix(this.player.matrix, this.renderPos, this.player.color);
            // Ghost piece? Optional polish.
        }
    }

    drawQueue() {
        this.nextCtx.fillStyle = "#0f172a";
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        let yOffset = 1;
        this.player.pieceQ.slice(0, 3).forEach(piece => {
            const matrix = piece.rotations[0];
            // Center X
            const xOffset = (6 - matrix[0].length) / 2;
            this.drawMatrixOnCtx(this.nextCtx, matrix, { x: xOffset, y: yOffset }, piece.color);
            yOffset += 5; // Pentomino height is 5
        });
    }

    drawHold() {
        if (!this.holdCtx) return;
        this.holdCtx.fillStyle = "#0f172a";
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

        if (this.player.hold) {
            const matrix = this.player.hold.rotations[0];
            const xOffset = (6 - matrix[0].length) / 2;
            const yOffset = (6 - matrix.length) / 2;
            this.drawMatrixOnCtx(this.holdCtx, matrix, { x: xOffset, y: yOffset }, this.player.hold.color);
        }
    }

    drawMatrix(matrix, offset, overrideColor = null) {
        this.drawMatrixOnCtx(this.ctx, matrix, offset, overrideColor);
    }

    drawMatrixOnCtx(ctx, matrix, offset, overrideColor = null) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // If value is object (from arena), extract color
                    const color = overrideColor || (typeof value === 'object' ? value.color : value);
                    if (color) {
                        this.drawGlassBlock(ctx, (x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, color);
                    }
                }
            });
        });
    }

    drawGlassBlock(ctx, x, y, color) {
        const size = BLOCK_SIZE;
        const pad = 1.5;

        ctx.save();
        // Base
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85; // Translucent
        ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
        ctx.globalAlpha = 1.0;

        // Glow / Shadow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        // Top highlight
        const grad = ctx.createLinearGradient(x, y, x, y + size);
        grad.addColorStop(0, "rgba(255,255,255,0.7)");
        grad.addColorStop(0.4, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(x + pad, y + pad, size - pad * 2, size / 2);

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + pad, y + pad, size - pad * 2, size - pad * 2);

        ctx.restore();
    }

    handleInput(event) {
        if (!this.isRunning || this.isPaused) return;

        switch (event.code) {
            case "ArrowLeft": this.move(-1); break;
            case "ArrowRight": this.move(1); break;
            case "ArrowDown": this.drop(); break;
            case "ArrowUp": this.rotate(1); break;
            case "Space": this.hardDrop(); break;
            case "KeyC": // Hold key (Shift often used but C makes sense too)
            case "ShiftLeft":
                this.holdPiece();
                break;
        }
    }
}

const game = new Game();
