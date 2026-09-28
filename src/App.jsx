import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Minus,
  Plus,
  Zap,
  Award,
  Flame,
  HelpCircle,
  X,
  TrendingUp,
} from 'lucide-react';
import { sound } from './utils/audio';
import './App.css';

// Milestones for celebrations
const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Dynamic Rank titles based on count
function getRank(count) {
  if (count >= 1000) return { title: 'Grandmaster', icon: Award };
  if (count >= 500) return { title: 'Hyper Dynamo', icon: Flame };
  if (count >= 250) return { title: 'Speed Titan', icon: Zap };
  if (count >= 100) return { title: 'Centurion', icon: Award };
  if (count >= 50) return { title: 'Pace Master', icon: TrendingUp };
  if (count >= 25) return { title: 'Rapid Tapper', icon: Zap };
  if (count >= 10) return { title: 'Rising Star', icon: Sparkles };
  return { title: 'Novice Clicker', icon: Sparkles };
}

// Next milestone computation
function getNextMilestone(count) {
  for (const m of MILESTONES) {
    if (m > count) return m;
  }
  return count + 1000;
}

export default function App() {
  // Persistent state
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('pulse_count');
    return saved !== null ? Math.max(0, parseInt(saved, 10) || 0) : 0;
  });

  const [totalClicks, setTotalClicks] = useState(() => {
    const saved = localStorage.getItem('pulse_total_clicks');
    return saved !== null ? parseInt(saved, 10) || 0 : 0;
  });

  const [highestStreak, setHighestStreak] = useState(() => {
    const saved = localStorage.getItem('pulse_highest');
    return saved !== null ? parseInt(saved, 10) || 0 : 0;
  });

  const [step, setStep] = useState(1);
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('pulse_sound_muted') === 'true');
  const [particles, setParticles] = useState([]);
  const [isPulse, setIsPulse] = useState(false);
  const [cps, setCps] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // CPS Click tracking queue
  const clickTimestamps = useRef([]);
  const pulseTimeoutRef = useRef(null);

  // Lock to plain white light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('pulse_theme', 'light');
  }, []);

  // Sync sound muted status
  useEffect(() => {
    sound.enabled = !soundMuted;
    localStorage.setItem('pulse_sound_muted', soundMuted ? 'true' : 'false');
  }, [soundMuted]);

  // Save count & records
  useEffect(() => {
    localStorage.setItem('pulse_count', count.toString());
    if (count > highestStreak) {
      setHighestStreak(count);
      localStorage.setItem('pulse_highest', count.toString());
    }
  }, [count, highestStreak]);

  useEffect(() => {
    localStorage.setItem('pulse_total_clicks', totalClicks.toString());
  }, [totalClicks]);

  // Periodic CPS calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      clickTimestamps.current = clickTimestamps.current.filter((t) => now - t <= 2000);
      const rate = clickTimestamps.current.length > 0 ? (clickTimestamps.current.length / 2).toFixed(1) : '0.0';
      setCps(rate);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Particle spawn function
  const spawnParticle = (clientX, clientY, text = `+${step}`) => {
    const id = Date.now() + Math.random();
    const driftX = (Math.random() - 0.5) * 60;

    // Use center of screen if coordinates are missing (e.g. keyboard press)
    const posX = clientX ?? window.innerWidth / 2;
    const posY = clientY ?? window.innerHeight / 2;

    setParticles((prev) => [...prev.slice(-15), { id, x: posX, y: posY, text, driftX }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  };

  // Milestone Celebration trigger
  const triggerMilestoneCelebration = (reached) => {
    sound.playMilestone();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Main Increment Action (+1 or +step)
  const handleIncrement = useCallback(
    (e) => {
      let clientX, clientY;
      if (e && e.clientX && e.clientY) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setCount((prev) => {
        const nextVal = prev + step;

        // Check if a milestone was crossed
        const crossed = MILESTONES.find((m) => prev < m && nextVal >= m);
        if (crossed) {
          triggerMilestoneCelebration(crossed);
        } else {
          sound.playClick(1 + Math.min(step * 0.05, 0.4));
        }

        return nextVal;
      });

      setTotalClicks((prev) => prev + 1);
      clickTimestamps.current.push(Date.now());

      // Pulse animation trigger
      setIsPulse(true);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => setIsPulse(false), 160);

      // Spawn floating visual particle
      spawnParticle(clientX, clientY, `+${step}`);
    },
    [step]
  );

  // Decrement Action (-1)
  const handleDecrement = useCallback(() => {
    setCount((prev) => {
      if (prev <= 0) return 0;
      sound.playClick(0.85);
      return Math.max(0, prev - step);
    });
  }, [step]);

  // Reset Action
  const handleReset = () => {
    setCount(0);
    sound.playReset();
    setShowResetConfirm(false);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if focus is inside an input/modal
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown' || e.key === '-') {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === 'r' || e.key === 'R') {
        setShowResetConfirm(true);
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundMuted((prev) => !prev);
      } else if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowResetConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement, handleDecrement]);

  // Progress to next milestone
  const nextMilestone = getNextMilestone(count);
  const prevMilestone = MILESTONES.slice().reverse().find((m) => m <= count) || 0;
  const milestoneProgress = Math.min(
    100,
    Math.round(((count - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
  );

  const currentRank = getRank(count);
  const RankIcon = currentRank.icon;

  return (
    <>
      {/* Floating Click Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="floating-plus"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            '--drift-x': `${p.driftX}px`,
          }}
        >
          {p.text}
        </span>
      ))}

      <div className="app-container">
        {/* Navigation & Header */}
        <header className="app-header">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="brand-title">PulseCount</h1>
              <div className="brand-subtitle">Interactive Click & Tapper Studio</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              id="sound-toggle-btn"
              className={`icon-btn ${!soundMuted ? 'active' : ''}`}
              onClick={() => setSoundMuted((prev) => !prev)}
              title={soundMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
              aria-label="Toggle Sound"
            >
              {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button
              id="shortcuts-btn"
              className="icon-btn"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts (?)"
              aria-label="Shortcuts"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </header>

        {/* Main App Workspace */}
        <main className="main-content">
          {/* Hero Counter Display */}
          <section className="counter-hero" aria-label="Current Counter Display">
            <div className="level-badge">
              <RankIcon size={14} />
              <span>{currentRank.title}</span>
            </div>

            <div className="count-label">Current Count</div>

            <div className="count-number-wrapper">
              <div
                id="main-count-display"
                className={`count-number ${isPulse ? 'pulse' : ''}`}
              >
                {count.toLocaleString()}
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            <div className="progress-container">
              <div className="progress-header">
                <span>
                  Next Goal: <strong>{nextMilestone.toLocaleString()}</strong>
                </span>
                <span>{milestoneProgress}%</span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={milestoneProgress} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="progress-fill"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
          </section>

          {/* Big Interactive Click Button */}
          <section className="clicker-zone" aria-label="Click Zone">
            <button
              id="primary-click-btn"
              className="big-click-btn"
              onClick={handleIncrement}
              aria-label={`Click to add ${step}`}
            >
              <span className="btn-plus-icon">+{step}</span>
              <span className="btn-caption">TAP OR CLICK</span>
            </button>

            {/* Step Increment Selector */}
            <div className="step-selector-wrap" role="group" aria-label="Step increment multiplier">
              <span className="step-label">Step:</span>
              {[1, 5, 10, 50].map((val) => (
                <button
                  key={val}
                  id={`step-chip-${val}`}
                  className={`step-chip ${step === val ? 'active' : ''}`}
                  onClick={() => setStep(val)}
                  aria-pressed={step === val}
                >
                  +{val}
                </button>
              ))}
            </div>

            {/* Secondary Controls: Decrement and Reset */}
            <div className="action-buttons">
              <button
                id="decrement-btn"
                className="action-btn"
                onClick={handleDecrement}
                disabled={count === 0}
                style={{ opacity: count === 0 ? 0.45 : 1 }}
                title="Subtract (Arrow Down)"
              >
                <Minus size={16} />
                <span>-{step}</span>
              </button>

              <button
                id="reset-btn"
                className="action-btn danger"
                onClick={() => setShowResetConfirm(true)}
                title="Reset Counter (R)"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </section>

          {/* Statistics Grid */}
          <section className="stats-grid" aria-label="Activity Statistics">
            <div className="stat-card">
              <div className="stat-icon">
                <Zap size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value" id="cps-display">{cps}</div>
                <div className="stat-label">Clicks / Sec</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Flame size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value" id="highest-display">{highestStreak.toLocaleString()}</div>
                <div className="stat-label">Highest Record</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Sparkles size={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value" id="total-clicks-display">{totalClicks.toLocaleString()}</div>
                <div className="stat-label">Total Clicks</div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer info & shortcut reminder */}
        <footer className="app-footer">
          <div className="shortcut-pill">
            <span>Tip: Press</span>
            <kbd className="key-kbd">Space</kbd>
            <span>or</span>
            <kbd className="key-kbd">Enter</kbd>
            <span>to click +{step} rapidly</span>
          </div>
          <div>PulseCount &copy; {new Date().getFullYear()} &bull; Fast, lightweight React app</div>
        </footer>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reset Counter?</h2>
              <button
                className="icon-btn"
                onClick={() => setShowResetConfirm(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Are you sure you want to reset your current count of <strong>{count.toLocaleString()}</strong> back to 0? Your highest record ({highestStreak}) will remain safe.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                className="action-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                id="confirm-reset-btn"
                className="action-btn danger"
                onClick={handleReset}
              >
                <Check size={16} />
                <span>Yes, Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Keyboard Shortcuts</h2>
              <button
                className="icon-btn"
                onClick={() => setShowShortcuts(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="shortcut-list">
              <div className="shortcut-row">
                <span>Add +{step} (Click)</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <kbd className="key-kbd">Space</kbd>
                  <kbd className="key-kbd">Enter</kbd>
                </div>
              </div>
              <div className="shortcut-row">
                <span>Subtract -{step}</span>
                <kbd className="key-kbd">&darr; or -</kbd>
              </div>
              <div className="shortcut-row">
                <span>Reset Counter</span>
                <kbd className="key-kbd">R</kbd>
              </div>
              <div className="shortcut-row">
                <span>Toggle Sound Effects</span>
                <kbd className="key-kbd">M</kbd>
              </div>
              <div className="shortcut-row">
                <span>Close Dialog</span>
                <kbd className="key-kbd">Esc</kbd>
              </div>
            </div>

            <button
              className="action-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowShortcuts(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
