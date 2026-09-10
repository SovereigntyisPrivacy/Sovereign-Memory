import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const COLORS = [
  { id: 0, hex: '#FF3B30', highlight: '#FF8A84', freq: 261.63 }, // C4
  { id: 1, hex: '#4CD964', highlight: '#A3F0B0', freq: 329.63 }, // E4
  { id: 2, hex: '#007AFF', highlight: '#80BFFF', freq: 392.00 }, // G4
  { id: 3, hex: '#FFCC00', highlight: '#FFE680', freq: 523.25 }  // C5
];

export default function SequenceEcho() {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    oscillator.start();
    oscillator.stop(audioCtxRef.current.currentTime + 0.5);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const startGame = async () => {
    initAudio();
    setIsPlaying(true);
    setScore(0);
    const firstStep = Math.floor(Math.random() * 4);
    const newSeq = [firstStep];
    setSequence(newSeq);
    await playSequence(newSeq);
  };

  const playSequence = async (seq) => {
    setIsShowingSequence(true);
    await sleep(800);
    for (let i = 0; i < seq.length; i++) {
      const colorId = seq[i];
      setActiveButton(colorId);
      playTone(COLORS[colorId].freq);
      await sleep(600); // Slower, relaxed pace
      setActiveButton(null);
      await sleep(400);
    }
    setIsShowingSequence(false);
    setPlayerStep(0);
  };

  const handleTap = async (colorId) => {
    if (isShowingSequence || !isPlaying) return;
    
    setActiveButton(colorId);
    playTone(COLORS[colorId].freq);
    setTimeout(() => setActiveButton(null), 300);

    if (colorId === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);
      
      if (nextStep === sequence.length) {
        setScore(sequence.length);
        const nextSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSequence);
        await sleep(1000);
        await playSequence(nextSequence);
      }
    } else {
      // Wrong tap - gentle reset
      setIsPlaying(false);
      setSequence([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '32px' }}>Score: {score}</h2>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{ width: 'auto', padding: '12px', backgroundColor: 'transparent', border: '2px solid #555' }}
        >
          {soundEnabled ? <Volume2 size={32} /> : <VolumeX size={32} color="var(--error)" />}
        </button>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {!isPlaying ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '28px', color: 'var(--text-muted)', marginBottom: '32px' }}>
              {score > 0 ? "Great job! Try again?" : "Watch the pattern, then copy it."}
            </h3>
            <button className="primary-btn" onClick={startGame} style={{ padding: '24px 48px', fontSize: '32px', justifyContent: 'center', width: '100%' }}>
              <Play size={36} fill="#000" /> Start Game
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '32px', color: isShowingSequence ? 'var(--accent)' : '#FFF' }}>
              {isShowingSequence ? 'Watch...' : 'Your Turn!'}
            </h3>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', opacity: !isPlaying && score === 0 ? 0.3 : 1 }}>
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleTap(color.id)}
              disabled={isShowingSequence || !isPlaying}
              style={{
                height: '180px',
                backgroundColor: activeButton === color.id ? color.highlight : color.hex,
                border: 'none',
                borderRadius: '32px',
                boxShadow: activeButton === color.id ? `0 0 40px ${color.hex}` : '0 8px 16px rgba(0,0,0,0.4)',
                transform: activeButton === color.id ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.1s ease-out'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
