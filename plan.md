# Project Plan: Chromatic Tuner SPA

## 1. Project Overview

**Goal:** To create a fast, accurate, and intuitive single-page application (SPA) that allows musicians to tune their instruments. The app will use the device's microphone to capture audio, analyze the pitch in real-time, and provide clear visual feedback on the note being played and its accuracy (sharp, flat, or in tune). the page should have a dark theme and be responsive for both desktop and mobile use.

**Target Audience:** Musicians of all levels, from beginners to professionals, who need a reliable and accessible digital tuner.

**Core Features:**
*   Real-time pitch detection via microphone.
*   Display of the closest musical note (e.g., A, G#, Fb).
*   Visual indicator for cents deviation (how sharp or flat the note is).
*   A responsive and clean user interface that works on both desktop and mobile devices.
*   (Future Scope) Reference pitch customization (e.g., A=440Hz, A=432Hz).
*   (Future Scope) Pre-set tuning modes for common instruments (Guitar, Ukulele, Violin).

## 2. Core Technologies

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Audio API:** Web Audio API (`getUserMedia`, `AnalyserNode`)
*   **Pitch Detection:** JavaScript implementation of an algorithm (e.g., YIN, Autocorrelation) or a lightweight library (e.g., `pitchfinder`).
*   **Build Tool (Optional):** Vite or Webpack for development and bundling.
*   **UI Framework (Optional):** A lightweight framework like Svelte or Preact could be used, but vanilla JS is sufficient for this scope.

## 3. The Agents (Core Application Modules)

This project is broken down into four conceptual agents. Each agent has a distinct role and set of responsibilities.

---

### Agent: AudioCaptureAgent

**Role:** The Microphone Manager

**Goal:** To reliably and efficiently capture raw audio data from the user's microphone and make it available for processing.

**Backstory:** This agent is the frontline of our application. It's the first point of contact with the outside world, bravely requesting microphone permissions and handling the complexities of the audio stream so the other agents don't have to.

**Key Responsibilities:**
-   [ ] Request microphone permissions from the user using `navigator.mediaDevices.getUserMedia()`.
-   [ ] Handle permission denial gracefully with a user-friendly message.
-   [ ] Create and manage a `MediaStreamAudioSourceNode` from the Web Audio API.
-   [ ] Create an `AnalyserNode` to perform Fast Fourier Transform (FFT) on the audio stream.
-   [ ] Provide a method to get the time-domain and/or frequency-domain data from the `AnalyserNode`.
-   [ ] Manage the audio stream lifecycle (start/stop).

**Dependencies:**
-   Web Audio API
-   User's device hardware (microphone)

---

### Agent: PitchDetectionAgent

**Role:** The Ear of the App

**Goal:** To analyze raw audio data and accurately determine the fundamental frequency and the closest corresponding musical note.

**Backstory:** This agent is the brain of the operation. It listens to the complex waveform provided by the `AudioCaptureAgent` and, using sophisticated algorithms, deciphers the exact pitch. It translates the physics of sound into the language of music.

**Key Responsibilities:**
-   [ ] Implement or integrate a pitch detection algorithm (e.g., YIN is recommended for accuracy).
-   [ ] Receive raw audio data (time-domain samples) from the `AudioCaptureAgent`.
-   [ ] Process the data to find the fundamental frequency (in Hz).
-   [ ] Convert the detected frequency to the nearest musical note (e.g., C4, G#3).
-   [ ] Calculate the "cents" deviation from the perfect note (e.g., +10 cents sharp, -5 cents flat).
-   [ ] Provide a clean data object: `{ frequency: 440.5, note: 'A4', cents: 2 }`.

**Dependencies:**
-   `AudioCaptureAgent` (for audio data)
-   A mathematical pitch detection algorithm/library.

---

### Agent: UIAgent

**Role:** The Visual Communicator

**Goal:** To present the pitch detection data to the user in a clear, responsive, and visually appealing way.

**Backstory:** This agent is the artist and the diplomat. It takes the cold, hard data from the `PitchDetectionAgent` and transforms it into an intuitive interface. It ensures the user knows exactly what note they're playing and how to get it in tune, all with a smooth and delightful experience.

**Key Responsibilities:**
-   [ ] Create the HTML structure for the tuner display (note name, cents display, visual meter/needle).
-   [ ] Style the application with CSS, including a large, legible note display and a clear visual indicator for sharp/flat.
-   [ ] Implement a smooth animation for the visual meter (e.g., a needle that swings or a block that moves).
-   [ ] Provide visual feedback for "in-tune" (e.g., the display turns green).
-   [ ] Display status messages (e.g., "Allow microphone access", "Listening...").
-   [ ] (Future) Create UI elements for settings (reference pitch, instrument modes).

**Dependencies:**
-   `PitchDetectionAgent` (for data to display)
-   `ApplicationOrchestrator` (to know when to update)

---

### Agent: ApplicationOrchestrator

**Role:** The Conductor

**Goal:** To initialize the application, manage the state, and coordinate the communication between all other agents.

**Backstory:** This agent is the manager who ensures everything runs like a well-oiled machine. It doesn't do the heavy lifting itself, but it knows who to talk to and when. It starts the process, passes messages between agents, and handles the overall application flow.

**Key Responsibilities:**
-   [ ] Initialize the application on page load.
-   [ ] Instantiate the `AudioCaptureAgent`, `PitchDetectionAgent`, and `UIAgent`.
-   [ ] Set up the main application loop (e.g., using `requestAnimationFrame`).
-   [ ] In the loop:
    -   Request audio data from `AudioCaptureAgent`.
    -   Pass that data to `PitchDetectionAgent` for analysis.
    -   Receive the parsed pitch data (note, cents).
    -   Pass the pitch data to `UIAgent` to update the display.
-   [ ] Handle application-level errors (e.g., microphone not found).
-   [ ] Manage global application state (e.g., is the tuner active?).

**Dependencies:**
-   All other agents (`AudioCaptureAgent`, `PitchDetectionAgent`, `UIAgent`)

## 4. Development Workflow

**Phase 1: Core Logic & Proof of Concept**
1.  Set up the basic HTML file and scripts.
2.  Implement the `AudioCaptureAgent` to successfully get microphone access and log audio data to the console.
3.  Implement the `PitchDetectionAgent` with a basic algorithm. Log the detected frequency and note to the console.
4.  Use the `ApplicationOrchestrator` to connect the two and run a detection loop.

**Phase 2: UI Implementation & Integration**
1.  Build the static UI with HTML and CSS.
2.  Implement the `UIAgent`'s update functions.
3.  Connect the `ApplicationOrchestrator` to the `UIAgent` so the console output now updates the visual display in real-time.
4.  Refine the animations and visual feedback.

**Phase 3: Refinement & Feature Polish**
1.  Add error handling for microphone permissions.
2.  Improve the performance and accuracy of the pitch detection.
3.  Make the UI responsive for mobile and desktop viewports.
4.  Add a settings panel for reference frequency (A=440Hz).

**Phase 4: Deployment**
1.  Optimize assets and code.
2.  Test on various browsers (Chrome, Firefox, Safari) and devices.
3.  Deploy to a static hosting service (e.g., Netlify, Vercel, GitHub Pages).

## 5. Success Metrics

-   **Accuracy:** The tuner should correctly identify notes with an accuracy of within +/- 5 cents under normal conditions.
-   **Latency:** The delay between a sound being made and the UI updating should be less than 150ms.
-   **Usability:** A new user should be able to understand and use the tuner without instructions.
-   **Performance:** The application should run smoothly without causing excessive CPU load on the user's device.