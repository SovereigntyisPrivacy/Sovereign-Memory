import { useState, useEffect, useRef } from 'react';
import { Play, Settings, Image as ImageIcon, Palette, Volume2, Star, Heart, Sun, Moon, Cloud, Zap, Droplet, Flame, Check } from 'lucide-react';

const ICONS = [Star, Heart, Sun, Moon, Cloud, Zap, Droplet, Flame];
const COLORS = ['#FF5252', '#448AFF', '#69F0AE', '#FFD740', '#E040FB', '#18FFFF', '#FFAB40', '#8C9EFF'];
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; 

// ONE global audio context to prevent browser limits
let audioCtx = null;

const playTone = (frequency, type = 'sine', duration = 0.3) => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Browsers suspend audio context if idle; this wakes it up
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Start at a gentle volume, then quickly fade out to prevent audio "popping"
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export default function MemoryGame() {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [pairs, setPairs] = useState(4);
  const [features, setFeatures] = useState({ colors: true, images: true, sounds: true });
  
  const [cards, setCards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState([]);
  const [solvedPairs, setSolvedPairs] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const toggleFeature = (feat) => setFeatures({ ...features, [feat]: !features[feat] });

  const startGame = () => {
    let deck = [];
    for (let i = 0; i < pairs; i++) {
      const cardData = {
        id: i,
        Icon: ICONS[i % ICONS.length],
        color: COLORS[i % COLORS.length],
        freq: FREQUENCIES[i % FREQUENCIES.length]
      };
      deck.push({ ...cardData, uid: `${i}-a` });
      deck.push({ ...cardData, uid: `${i}-b` });
    }
    deck = deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedIndex([]);
    setSolvedPairs([]);
    setIsLocked(false);
    setIsConfiguring(false);
  };

  const handleCardClick = (index) => {
    if (isLocked || flippedIndex.includes(index) || solvedPairs.includes(cards[index].id)) return;

    const clickedCard = cards[index];
    
    if (features.sounds) {
      playTone(clickedCard.freq);
    }

    const newFlipped = [...flippedIndex, index];
    setFlippedIndex(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true); 
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        if (features.sounds) {
          setTimeout(() => playTone(800, 'square', 0.1), 300); 
        }
        setSolvedPairs([...solvedPairs, firstCard.id]);
        setFlippedIndex([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setFlippedIndex([]);
          setIsLocked(false);
        }, 1500);
      }
    }
  };

  if (isConfiguring) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Game Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => toggleFeature('colors')} style={{ borderColor: features.colors ? 'var(--accent)' : '#333' }}>
            <Palette size={32} color={features.colors ? 'var(--accent)' : '#FFF'} />
            Colors: {features.colors ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => toggleFeature('images')} style={{ borderColor: features.images ? 'var(--accent)' : '#333' }}>
            <ImageIcon size={32} color={features.images ? 'var(--accent)' : '#FFF'} />
            Images: {features.images ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => toggleFeature('sounds')} style={{ borderColor: features.sounds ? 'var(--accent)' : '#333' }}>
            <Volume2 size={32} color={features.sounds ? 'var(--accent)' : '#FFF'} />
            Sounds: {features.sounds ? 'ON' : 'OFF'}
          </button>
        </div>
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Number of Matches: {pairs}</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setPairs(Math.max(2, pairs - 1))}>- Less</button>
            <button onClick={() => setPairs(Math.min(8, pairs + 1))}>+ More</button>
          </div>
        </div>
        <button className="primary-btn" onClick={startGame}>
          <Play size={36} color="#000" />
          START GAME
        </button>
      </div>
    );
  }

  const isGameWon = solvedPairs.length === pairs;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Matching Game</h2>
        <button style={{ width: 'auto', padding: '12px', fontSize: '18px' }} onClick={() => setIsConfiguring(true)}>
          <Settings size={24} /> Reset
        </button>
      </div>

      {isGameWon ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Check size={80} color="var(--accent)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '24px' }}>You Won!</h2>
          <button className="primary-btn" onClick={() => setIsConfiguring(true)}>Play Again</button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px', 
          marginBottom: '40px' 
        }}>
          {cards.map((card, index) => {
            const isFlipped = flippedIndex.includes(index) || solvedPairs.includes(card.id);
            const { Icon, color } = card;

            return (
              <div 
                key={card.uid}
                onClick={() => handleCardClick(index)}
                style={{
                  height: '140px',
                  backgroundColor: isFlipped ? (features.colors ? color : 'var(--surface)') : '#333',
                  border: isFlipped && features.colors ? 'none' : '4px solid #555',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}
              >
                {isFlipped && features.images && (
                  <Icon size={64} color={features.colors ? '#000' : 'var(--text-main)'} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
