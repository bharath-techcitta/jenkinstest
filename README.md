# jenkinstest — PulseCount Modern Click & Counter Studio

> **Author**: bharath

PulseCount is a responsive React web application that provides a tactile click-counter experience with instant +1 reactions, Web Audio synthesizer effects, milestone confetti celebrations, and real-time activity metrics.

## 🚀 Features

- **Tactile +1 Click Engine**: Giant glowing button with 3D press response and floating `+1` particle animations radiating from cursor position.
- **Configurable Steps**: Choose between `+1`, `+5`, `+10`, and `+50` increments.
- **Micro-interactions & Audio**: Integrated lag-free sound effects synthesized via the Web Audio API with an easy mute toggle.
- **Milestone Rewards**: Confetti bursts when reaching achievements (10, 25, 50, 100, 250, 500, 1,000+).
- **Ranks & Titles**: Dynamic progression badges from *Novice Clicker* up to *Grandmaster*.
- **Live Statistics**:
  - Real-time Clicks Per Second (CPS) tracking.
  - All-time highest streak / record saved in `localStorage`.
  - Total lifetime clicks counter.
- **Dark / Light Modes**: Sleek glassmorphism aesthetic with seamless theme toggle.
- **Keyboard Shortcuts**:
  - `Space` / `Enter`: Click +1
  - `↓` / `-`: Decrement (-1)
  - `R`: Reset dialog
  - `M`: Toggle sound
  - `T`: Toggle theme
  - `?`: Shortcuts dialog

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Vanilla CSS (Glassmorphism & Design Tokens)**
- **Lucide Icons**
- **Canvas Confetti**
- **Web Audio API**

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

### 3. Production Build
```bash
npm run build
```
The output will be generated in the `dist/` directory ready for deployment.
