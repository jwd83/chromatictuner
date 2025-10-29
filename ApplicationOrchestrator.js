import { AudioCaptureAgent } from './AudioCaptureAgent.js';
import { PitchDetectionAgent } from './PitchDetectionAgent.js';
import { UIAgent } from './UIAgent.js';

/**
 * ApplicationOrchestrator - The Conductor
 * Coordinates all agents and manages the application state
 */
export class ApplicationOrchestrator {
    constructor() {
        this.audioCaptureAgent = null;
        this.pitchDetectionAgent = null;
        this.uiAgent = new UIAgent();
        
        this.isRunning = false;
        this.animationFrameId = null;
        
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        
        this.setupEventListeners();
    }

    /**
     * Set up button event listeners
     */
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.stopButton.addEventListener('click', () => this.stop());
    }

    /**
     * Start the tuner
     */
    async start() {
        if (this.isRunning) return;

        try {
            this.uiAgent.setStatus('Requesting microphone access...', 'info');
            this.startButton.disabled = true;

            // Initialize audio capture
            this.audioCaptureAgent = new AudioCaptureAgent();
            await this.audioCaptureAgent.initialize();

            // Initialize pitch detection with the correct sample rate
            const sampleRate = this.audioCaptureAgent.getSampleRate();
            this.pitchDetectionAgent = new PitchDetectionAgent(sampleRate);

            // Update UI
            this.uiAgent.setStatus('Listening...', 'success');
            this.stopButton.disabled = false;

            // Start the detection loop
            this.isRunning = true;
            this.detectionLoop();

        } catch (error) {
            console.error('Failed to start tuner:', error);
            
            let errorMessage = 'Failed to start tuner. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Microphone access denied.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No microphone found.';
            } else {
                errorMessage += error.message;
            }
            
            this.uiAgent.setStatus(errorMessage, 'error');
            this.startButton.disabled = false;
            this.cleanup();
        }
    }

    /**
     * Stop the tuner
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.cleanup();
        
        this.uiAgent.reset();
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
    }

    /**
     * Main detection loop using requestAnimationFrame
     */
    detectionLoop() {
        if (!this.isRunning) return;

        // Get audio data
        const audioData = this.audioCaptureAgent.getAudioData();

        if (audioData) {
            // Detect pitch
            const pitchData = this.pitchDetectionAgent.detectPitch(audioData);
            
            // Update UI
            this.uiAgent.updateDisplay(pitchData);
        }

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.detectionLoop());
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.audioCaptureAgent) {
            this.audioCaptureAgent.stop();
            this.audioCaptureAgent = null;
        }

        this.pitchDetectionAgent = null;
    }
}
