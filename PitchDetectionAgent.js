/**
 * PitchDetectionAgent - The Ear of the App
 * Analyzes audio data and detects pitch using autocorrelation algorithm
 */
export class PitchDetectionAgent {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
        this.minFrequency = 82;  // E2 (lowest guitar string)
        this.maxFrequency = 1047; // C6 (high range)
        this.noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.referenceFrequency = 440; // A4
    }

    /**
     * Detect pitch from audio buffer using autocorrelation
     * @param {Float32Array} buffer - Time-domain audio samples
     * @returns {Object|null} - {frequency, note, cents} or null if no pitch detected
     */
    detectPitch(buffer) {
        // Find the fundamental frequency using autocorrelation
        const frequency = this.autoCorrelate(buffer);
        
        if (frequency === -1 || frequency < this.minFrequency || frequency > this.maxFrequency) {
            return null;
        }

        // Convert frequency to note and cents
        const noteData = this.frequencyToNote(frequency);
        
        return {
            frequency: Math.round(frequency * 10) / 10,
            note: noteData.note,
            cents: noteData.cents
        };
    }

    /**
     * Autocorrelation algorithm for pitch detection
     * @param {Float32Array} buffer - Audio samples
     * @returns {number} - Detected frequency in Hz, or -1 if not detected
     */
    autoCorrelate(buffer) {
        const SIZE = buffer.length;
        let bestOffset = -1;
        let bestCorrelation = 0;
        let rms = 0;

        // Calculate RMS (Root Mean Square) to check if signal is loud enough
        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);

        // Signal too weak - lower threshold for better detection
        if (rms < 0.005) {
            return -1;
        }

        // Normalize the buffer
        const normalizedBuffer = new Float32Array(SIZE);
        for (let i = 0; i < SIZE; i++) {
            normalizedBuffer[i] = buffer[i] / rms;
        }

        // Calculate autocorrelation
        const minOffset = Math.floor(this.sampleRate / this.maxFrequency);
        const maxOffset = Math.floor(this.sampleRate / this.minFrequency);
        
        for (let offset = minOffset; offset < maxOffset && offset < SIZE / 2; offset++) {
            let correlation = 0;

            for (let i = 0; i < SIZE - offset; i++) {
                correlation += normalizedBuffer[i] * normalizedBuffer[i + offset];
            }

            // Normalize correlation
            correlation = correlation / (SIZE - offset);

            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        }

        // Check if we found a good enough correlation
        if (bestCorrelation > 0.1 && bestOffset !== -1) {
            // Refine offset using parabolic interpolation
            const shift = this.parabolicInterpolation(normalizedBuffer, bestOffset);
            return this.sampleRate / (bestOffset + shift);
        }

        return -1;
    }

    /**
     * Parabolic interpolation for more accurate frequency detection
     * @param {Float32Array} buffer - Audio samples
     * @param {number} offset - Detected offset
     * @returns {number} - Refined offset adjustment
     */
    parabolicInterpolation(buffer, offset) {
        const x0 = offset - 1;
        const x2 = offset + 1;
        
        if (x0 < 0 || x2 >= buffer.length) {
            return 0;
        }

        const y0 = this.correlationAtOffset(buffer, x0);
        const y1 = this.correlationAtOffset(buffer, offset);
        const y2 = this.correlationAtOffset(buffer, x2);

        const a = (y0 + y2 - 2 * y1) / 2;
        if (a === 0) return 0;

        return (y0 - y2) / (2 * a);
    }

    /**
     * Calculate correlation at a specific offset
     * @param {Float32Array} buffer - Audio samples
     * @param {number} offset - Offset to test
     * @returns {number} - Correlation value
     */
    correlationAtOffset(buffer, offset) {
        let correlation = 0;
        const SIZE = buffer.length;

        for (let i = 0; i < SIZE - offset; i++) {
            correlation += buffer[i] * buffer[i + offset];
        }

        return correlation / (SIZE - offset);
    }

    /**
     * Convert frequency to musical note and cents deviation
     * @param {number} frequency - Frequency in Hz
     * @returns {Object} - {note, cents}
     */
    frequencyToNote(frequency) {
        // Calculate the note number (MIDI-like)
        const noteNum = 12 * (Math.log(frequency / this.referenceFrequency) / Math.log(2));
        const noteNumRounded = Math.round(noteNum);
        
        // Calculate cents deviation from the nearest note
        const cents = Math.round((noteNum - noteNumRounded) * 100);
        
        // Get the note name
        const noteIndex = (noteNumRounded + 69) % 12; // 69 is A4 in MIDI
        const octave = Math.floor((noteNumRounded + 69) / 12) - 1;
        const noteName = this.noteStrings[noteIndex < 0 ? noteIndex + 12 : noteIndex];
        
        return {
            note: `${noteName}${octave}`,
            cents: cents
        };
    }

    /**
     * Update the sample rate (useful when audio context sample rate is known)
     * @param {number} sampleRate - New sample rate
     */
    setSampleRate(sampleRate) {
        this.sampleRate = sampleRate;
    }
}
