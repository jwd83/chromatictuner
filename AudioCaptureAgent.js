/**
 * AudioCaptureAgent - The Microphone Manager
 * Handles microphone access, Web Audio API setup, and audio stream management
 */
export class AudioCaptureAgent {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.stream = null;
        this.bufferLength = 0;
        this.dataArray = null;
    }

    /**
     * Initialize the audio context and request microphone access
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                    latency: 0
                } 
            });

            // Create microphone source
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 8192;  // Even larger FFT for better low-frequency resolution
            this.analyser.smoothingTimeConstant = 0;  // No smoothing for more responsive detection

            // Connect nodes
            this.microphone.connect(this.analyser);

            // Set up data array for time-domain data
            this.bufferLength = this.analyser.fftSize;
            this.dataArray = new Float32Array(this.bufferLength);

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            throw error;
        }
    }

    /**
     * Get the current time-domain audio data
     * @returns {Float32Array} Audio samples
     */
    getAudioData() {
        if (this.analyser && this.dataArray) {
            this.analyser.getFloatTimeDomainData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }

    /**
     * Get the sample rate of the audio context
     * @returns {number} Sample rate in Hz
     */
    getSampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : 44100;
    }

    /**
     * Stop the audio capture and clean up resources
     */
    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.dataArray = null;
    }

    /**
     * Check if the agent is currently active
     * @returns {boolean}
     */
    isActive() {
        return this.audioContext !== null && this.audioContext.state === 'running';
    }
}
