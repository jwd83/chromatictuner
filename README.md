# Chromatic Tuner v0

A fast, accurate, and intuitive web-based chromatic tuner that uses your device's microphone to detect pitch in real-time.

## Features

- **Real-time pitch detection** using autocorrelation algorithm
- **Visual feedback** with note display and cents deviation meter
- **Dark theme** responsive design for desktop and mobile
- **In-tune indicator** turns green when within ±5 cents
- **No dependencies** - pure JavaScript using Web Audio API

## Usage

### Local Development

Since this app uses ES6 modules, you need to run it through a local server. You can use any of these methods:

**Option 1: Python (if installed)**
```bash
python -m http.server 8000
```

**Option 2: Node.js http-server (if you have npm)**
```bash
npx http-server -p 8000
```

**Option 3: PHP (if installed)**
```bash
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

### How to Use

1. Click the **"Start Tuner"** button
2. Allow microphone access when prompted
3. Play a note on your instrument
4. Watch the display show:
   - The detected note (e.g., A4, G#3)
   - The frequency in Hz
   - The cents deviation (-50 to +50)
   - A visual meter showing how sharp or flat you are
5. When you're in tune (within ±5 cents), the display turns green
6. Click **"Stop Tuner"** when done

## Architecture

The application follows the agent-based architecture described in the plan:

- **AudioCaptureAgent** - Manages microphone access and audio stream
- **PitchDetectionAgent** - Analyzes audio using autocorrelation to detect pitch
- **UIAgent** - Updates the DOM with pitch data and visual feedback
- **ApplicationOrchestrator** - Coordinates all agents and manages the application loop

## Browser Support

Requires a modern browser with Web Audio API support:
- Chrome/Edge 74+
- Firefox 25+
- Safari 14.1+

## Reference Pitch

Currently set to A4 = 440 Hz (standard tuning).

## Future Enhancements

- Customizable reference pitch (A=432Hz, etc.)
- Instrument-specific tuning presets (guitar, ukulele, violin)
- Tuning history and analytics
- Calibration settings
