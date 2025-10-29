import { ApplicationOrchestrator } from './ApplicationOrchestrator.js';

/**
 * Main application entry point
 * Initializes the ApplicationOrchestrator when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const orchestrator = new ApplicationOrchestrator();
    console.log('Chromatic Tuner initialized');
});
