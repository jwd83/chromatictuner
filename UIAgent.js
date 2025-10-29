/**
 * UIAgent - The Visual Communicator
 * Updates the DOM with pitch detection data and provides visual feedback
 */
export class UIAgent {
    constructor() {
        this.noteDisplay = document.getElementById('noteDisplay');
        this.frequencyDisplay = document.getElementById('frequencyDisplay');
        this.centsValue = document.getElementById('centsValue');
        this.centsIndicator = document.getElementById('centsIndicator');
        this.statusMessage = document.getElementById('statusMessage');
        
        this.inTuneThreshold = 5; // cents
        
        // Smoothing state
        this.smoothedFrequency = null;
        this.smoothedCents = 0;
        this.smoothingFactor = 0.7; // Higher = more smoothing
    }

    /**
     * Update the display with new pitch data
     * @param {Object} pitchData - {frequency, note, cents}
     */
    updateDisplay(pitchData) {
        if (!pitchData) {
            this.showNoSignal();
            return;
        }

        const { frequency, note, cents } = pitchData;
        
        // Apply smoothing to frequency
        if (this.smoothedFrequency === null) {
            this.smoothedFrequency = frequency;
        } else {
            this.smoothedFrequency = this.smoothingFactor * this.smoothedFrequency + 
                                     (1 - this.smoothingFactor) * frequency;
        }
        
        // Apply smoothing to cents
        this.smoothedCents = this.smoothingFactor * this.smoothedCents + 
                             (1 - this.smoothingFactor) * cents;

        // Update displays with smoothed values
        this.noteDisplay.textContent = note;
        this.frequencyDisplay.textContent = `${Math.round(this.smoothedFrequency * 10) / 10} Hz`;
        
        // Update cents value with smoothed value
        const displayCents = Math.round(this.smoothedCents);
        const centsSign = displayCents > 0 ? '+' : '';
        this.centsValue.textContent = `${centsSign}${displayCents}`;
        
        // Update cents indicator position (map -50 to +50 cents to 0% to 100%)
        const clampedCents = Math.max(-50, Math.min(50, displayCents));
        const percentage = ((clampedCents + 50) / 100) * 100;
        this.centsIndicator.style.left = `${percentage}%`;
        
        // Visual feedback for in-tune (based on smoothed cents)
        const isInTune = Math.abs(displayCents) <= this.inTuneThreshold;
        
        if (isInTune) {
            this.noteDisplay.classList.add('in-tune');
            this.noteDisplay.classList.remove('out-of-tune');
            this.centsIndicator.classList.add('in-tune');
        } else {
            this.noteDisplay.classList.add('out-of-tune');
            this.noteDisplay.classList.remove('in-tune');
            this.centsIndicator.classList.remove('in-tune');
        }
    }

    /**
     * Show a "no signal" state when no pitch is detected
     */
    showNoSignal() {
        this.noteDisplay.textContent = '--';
        this.frequencyDisplay.textContent = '-- Hz';
        this.centsValue.textContent = '0';
        this.centsIndicator.style.left = '50%';
        this.noteDisplay.classList.remove('in-tune', 'out-of-tune');
        this.centsIndicator.classList.remove('in-tune');
        
        // Reset smoothing state
        this.smoothedFrequency = null;
        this.smoothedCents = 0;
    }

    /**
     * Update the status message
     * @param {string} message - Status message to display
     * @param {string} type - Message type: 'info', 'success', 'error'
     */
    setStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.classList.remove('error', 'success');
        
        if (type === 'error') {
            this.statusMessage.classList.add('error');
        } else if (type === 'success') {
            this.statusMessage.classList.add('success');
        }
    }

    /**
     * Reset the display to initial state
     */
    reset() {
        this.showNoSignal();
        this.setStatus('Click "Start Tuner" to begin', 'info');
    }
}
