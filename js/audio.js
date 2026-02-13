// audio.js
// Nimbus Block 2.0 Audio System

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicNodes = [];
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }

    startMusic() {
        this.init();
        if (this.ctx.state === "suspended") this.ctx.resume();
        this.stopMusic();
        this.playAmbientLoop();
    }

    stopMusic() {
        this.musicNodes.forEach(n => {
            try { n.stop(); n.disconnect(); } catch (e) { }
        });
        this.musicNodes = [];
    }

    playAmbientLoop() {
        // Generative Ambient: 
        // Two sine waves detuned, plus a filtered noise layer for texture
        const t = this.ctx.currentTime;

        // Pad 1
        const osc1 = this.ctx.createOscillator();
        osc1.frequency.value = 130.81; // C3
        osc1.type = "sine";

        const osc2 = this.ctx.createOscillator();
        osc2.frequency.value = 196.00; // G3
        osc2.type = "sine";

        const gain1 = this.ctx.createGain();
        gain1.gain.value = 0.1;

        // Auto-panning
        const panner = this.ctx.createStereoPanner();
        const panLfo = this.ctx.createOscillator();
        panLfo.frequency.value = 0.1;
        panLfo.connect(panner.pan);
        panLfo.start();

        osc1.connect(gain1);
        osc2.connect(gain1);
        gain1.connect(panner);
        panner.connect(this.masterGain);

        osc1.start();
        osc2.start();

        this.musicNodes.push(osc1, osc2, panLfo, gain1);
    }

    playSound(type) {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx.state === "suspended") this.ctx.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        switch (type) {
            case "move":
                // Soft click
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case "rotate":
                // Glassy ping
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.linearRampToValueAtTime(800, t + 0.1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case "land":
                // Thud
                osc.type = "triangle";
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case "clear":
                // Success chord
                this.playTone(523.25, t, 0.4);
                this.playTone(659.25, t + 0.1, 0.4);
                this.playTone(783.99, t + 0.2, 0.4);
                break;

            case "mission_complete":
                // Grand sparkle
                this.playTone(440, t, 0.6, "square");
                this.playTone(880, t + 0.1, 0.6, "sine");
                this.playTone(1760, t + 0.2, 0.8, "sine");
                break;

            case "gameover":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.linearRampToValueAtTime(50, t + 1.5);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.linearRampToValueAtTime(0, t + 1.5);
                osc.start(t);
                osc.stop(t + 1.5);
                break;
        }
    }

    playTone(freq, time, dur, type = "sine") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.start(time);
        osc.stop(time + dur);
    }
}

export const audio = new AudioSystem();
