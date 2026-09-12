import { useState, useEffect } from 'react';
import { Home, Copy, Music, Grid as GridIcon, Leaf, Volume2, Play, Settings, Type, Hash, ArrowLeft } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

export default function BrainGames({ goHome }) {
  const [activeGame, setActiveGame] = useState('menu');

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (activeGame === 'menu' && typeof goHome === 'function') goHome();
      else setActiveGame('menu');
    });
    return () => { listener.remove(); };
  }, [activeGame, goHome]);

  if (activeGame === 'matching') return <MatchingGame goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'sequence') return <SequenceEcho goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'household') return <HouseholdSorter goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'botanical') return <BotanicalSorter goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'words') return <WordScramble goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'math') return <QuickMath goBack={() => setActiveGame('menu')} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>
      
      <h1 style={{ color: '#FFF', fontSize: '36px', margin: '0 0 24px 0' }}>Brain Games</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={() => setActiveGame('matching')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Copy size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Matching Game</div>
        </button>
        <button onClick={() => setActiveGame('sequence')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Music size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Sequence Echo</div>
        </button>
        <button onClick={() => setActiveGame('household')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <GridIcon size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Household<br/>Sorter</div>
        </button>
        <button onClick={() => setActiveGame('botanical')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Leaf size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Botanical Sorter</div>
        </button>
        <button onClick={() => setActiveGame('words')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Type size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Word Scramble</div>
        </button>
        <button onClick={() => setActiveGame('math')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Hash size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Quick Math</div>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 1. SEQUENCE ECHO (SLOW SIMON SAYS)
// ==========================================
function SequenceEcho({ goBack }) {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flashIdx, setFlashIdx] = useState(null);
  const [message, setMessage] = useState("Watch the pattern,\nthen copy it.");

  const BASE_COLORS = ['#7A2828', '#2E5A2C', '#1C3B5E', '#8B7515']; // Red, Green, Blue, Yellow
  const FLASH_COLORS = ['#FF6B6B', '#4DFF4D', '#6B6BFF', '#FFDF00']; // Bright versions

  const playSequence = async (seq) => {
    setIsPlaying(true);
    setMessage("Watch carefully...");
    await new Promise(r => setTimeout(r, 1000)); // Pause before starting
    
    for (let i = 0; i < seq.length; i++) {
      setFlashIdx(seq[i]);
      await new Promise(r => setTimeout(r, 900)); // Very slow flash
      setFlashIdx(null);
      await new Promise(r => setTimeout(r, 400)); // Gap between flashes
    }
    
    setIsPlaying(false);
    setMessage("Your turn!\nCopy the pattern.");
  };

  const startGame = () => {
    const nextColor = Math.floor(Math.random() * 4);
    setSequence([nextColor]);
    setPlayerStep(0);
    setScore(0);
    setGameActive(true);
    playSequence([nextColor]);
  };

  const handleTap = async (idx) => {
    if (!gameActive || isPlaying) return;

    // Flash the tapped color
    setFlashIdx(idx);
    setTimeout(() => setFlashIdx(null), 300);

    if (idx !== sequence[playerStep]) {
      // Wrong Tap
      setGameActive(false);
      const feedback = score >= 3 ? "Good job!" : "Don't worry!";
      setMessage(`${feedback}\n9/10 people can't get past 7.`);
      return;
    }

    // Right Tap
    const nextStep = playerStep + 1;
    if (nextStep === sequence.length) {
      // Sequence completed
      setScore(s => s + 1);
      setPlayerStep(0);
      const nextColor = Math.floor(Math.random() * 4);
      const newSeq = [...sequence, nextColor];
      setSequence(newSeq);
      setTimeout(() => playSequence(newSeq), 1200); // Give a beat before next round
    } else {
      setPlayerStep(nextStep);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        ← Back to Games
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#FFF', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>Score:</h2>
          <div style={{ color: '#FFF', fontSize: '36px', fontWeight: 'bold' }}>{score}</div>
        </div>
        <button style={{ backgroundColor: '#333', padding: '16px 24px', borderRadius: '16px', border: 'none', color: '#FFF' }}>
          <Volume2 size={32} />
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '28px', color: '#CCC', fontWeight: 'bold', marginBottom: '32px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre-line' }}>
        {message}
      </div>

      {!gameActive && (
        <button onClick={startGame} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', backgroundColor: '#FF9500', padding: '24px', borderRadius: '20px', color: '#000', fontSize: '36px', fontWeight: 'bold', border: 'none', width: '100%', marginBottom: '32px' }}>
          <Play size={36} fill="#000" /> Start Game
        </button>
      )}
      {gameActive && <div style={{ height: '90px', marginBottom: '32px' }} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexGrow: 1, paddingBottom: '24px' }}>
        {BASE_COLORS.map((col, idx) => (
          <button 
            key={idx} 
            onClick={() => handleTap(idx)}
            style={{ 
              backgroundColor: flashIdx === idx ? FLASH_COLORS[idx] : col, 
              borderRadius: '32px', 
              border: flashIdx === idx ? '4px solid #FFF' : 'none', 
              width: '100%', 
              height: '100%', 
              minHeight: '160px',
              transition: 'background-color 0.2s'
            }} 
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. MATCHING GAME (UI SHELL RESTORED)
// ==========================================
function MatchingGame({ goBack }) {
  const [view, setView] = useState('settings');
  const [settings, setSettings] = useState({ colors: true, images: true, sounds: true, numMatches: 4 });
  const [cards, setCards] = useState([]);
  const [flippedIdxs, setFlippedIdxs] = useState([]);
  const [solvedIds, setSolvedIds] = useState([]);
  const [moves, setMoves] = useState(0);

  const ALL_EMOJIS = ['🌸','🦋','🌞','🍀','🍎','🧩','💎','🦉','🐱','🌻','🎈','🍓','🚗','🎸','🍕','⭐'];

  const playSound = (type) => {
    if (!settings.sounds) return;
    if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = window.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'match') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'mismatch') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  };

  const startGame = () => {
    const selectedEmojis = ALL_EMOJIS.slice(0, settings.numMatches);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, isMarked: false }));
    setCards(deck);
    setFlippedIdxs([]);
    setSolvedIds([]);
    setMoves(0);
    setView('board');
  };

  const handleCardClick = (idx) => {
    if (flippedIdxs.length === 2 || flippedIdxs.includes(idx) || solvedIds.includes(idx)) return;
    
    playSound('flip');
    const newFlipped = [...flippedIdxs, idx];
    setFlippedIdxs(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const match1 = newFlipped[0];
      const match2 = newFlipped[1];

      if (cards[match1].emoji === cards[match2].emoji) {
        playSound('match');
        setSolvedIds(prev => [...prev, match1, match2]);
        setFlippedIdxs([]);
      } else {
        playSound('mismatch');
        // Give a hint! Mark the FIRST card clicked so it stays dimly visible
        setCards(prev => prev.map((c, i) => i === match1 ? { ...c, isMarked: true } : c));
        setTimeout(() => setFlippedIdxs([]), 1000);
      }
    }
  };

  if (view === 'settings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
        <button onClick={goBack} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
          ← Back to Games
        </button>
        <h1 style={{ color: '#FFF', fontSize: '36px', margin: '0 0 24px 0' }}>Game Settings</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setSettings({...settings, colors: !settings.colors})} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <span style={{ color: '#FF9500', filter: settings.colors ? 'none' : 'grayscale(100%)' }}>🎨</span> Colors: {settings.colors ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setSettings({...settings, images: !settings.images})} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <span style={{ color: '#FF9500', filter: settings.images ? 'none' : 'grayscale(100%)' }}>🖼️</span> Images: {settings.images ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setSettings({...settings, sounds: !settings.sounds})} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <Volume2 size={36} color={settings.sounds ? "#FF9500" : "#666"} /> Sounds: {settings.sounds ? 'ON' : 'OFF'}
          </button>
        </div>

        <h2 style={{ color: '#FFF', fontSize: '28px', textAlign: 'center', marginBottom: '16px' }}>Number of Matches: {settings.numMatches}</h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setSettings({...settings, numMatches: Math.max(2, settings.numMatches - 1)})} style={{ flex: 1, backgroundColor: '#333', color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '24px' }}>- Less</button>
          <button onClick={() => setSettings({...settings, numMatches: Math.min(16, settings.numMatches + 1)})} style={{ flex: 1, backgroundColor: '#333', color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '24px' }}>+ More</button>
        </div>

        <button onClick={startGame} style={{ backgroundColor: '#FF9500', color: '#000', fontSize: '36px', fontWeight: 'bold', border: 'none', borderRadius: '20px', padding: '24px', width: '100%', marginTop: 'auto' }}>
          Play
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '42px', margin: 0, lineHeight: '1.2' }}>Matching<br/>Game</h1>
          <div style={{ color: '#AAA', fontSize: '18px', marginTop: '4px' }}>Moves: {moves} | Found: {solvedIds.length / 2} / {settings.numMatches}</div>
        </div>
        <button onClick={() => setView('settings')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <Settings size={24} /> Reset
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexGrow: 1, paddingBottom: '24px', alignContent: 'start' }}>
        {cards.map((c, i) => {
          const isFlipped = flippedIdxs.includes(i) || solvedIds.includes(i);
          return (
            <button 
              key={i} 
              onClick={() => handleCardClick(i)}
              style={{ 
                backgroundColor: isFlipped ? '#FFF' : '#333', 
                borderRadius: '16px', 
                width: '100%', 
                aspectRatio: '1/1',
                border: isFlipped ? '4px solid #FF9500' : '2px solid #444',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: settings.numMatches > 8 ? '32px' : '48px',
                transition: 'all 0.3s'
              }}
            >
              {isFlipped ? (settings.images ? c.emoji : '') : (c.isMarked && settings.images ? <span style={{opacity: 0.3}}>{c.emoji}</span> : '')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. PLACEHOLDERS & EXTRA GAMES
// ==========================================
function HouseholdSorter({ goBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#FFF', fontSize: '32px', textAlign: 'center', marginBottom: '24px' }}>Household Sorter</h2>
      <button onClick={goBack} style={{ backgroundColor: '#FF9500', padding: '20px 40px', borderRadius: '16px', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none' }}>Back to Menu</button>
    </div>
  );
}

function BotanicalSorter({ goBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#FFF', fontSize: '32px', textAlign: 'center', marginBottom: '24px' }}>Botanical Sorter</h2>
      <button onClick={goBack} style={{ backgroundColor: '#FF9500', padding: '20px 40px', borderRadius: '16px', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none' }}>Back to Menu</button>
    </div>
  );
}

function WordScramble({ goBack }) {
  const WORDS = [{ s: 'L I M A Y F', a: 'FAMILY', opts: ['FAMILY', 'FILMY', 'FLAME'] }, { s: 'E A C E P', a: 'PEACE', opts: ['PACE', 'PEACE', 'PIECE'] }];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleGuess = (guess) => { if (guess === WORDS[idx].a) setScore(s => s + 1); setIdx((idx + 1) % WORDS.length); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '24px', color: '#FF9500' }}>Score: {score}</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFF', letterSpacing: '4px', textAlign: 'center' }}>{WORDS[idx].s}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {WORDS[idx].opts.map(opt => <button key={opt} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#222', color: '#FFF', border: '2px solid #FF9500', borderRadius: '20px', padding: '24px', fontSize: '28px', fontWeight: 'bold' }}>{opt}</button>)}
        </div>
      </div>
    </div>
  );
}

function QuickMath({ goBack }) {
  const [score, setScore] = useState(0);
  const generateQ = () => { const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1; const ans = a + b; return { q: `${a} + ${b}`, ans, opts: [ans, ans + 1, ans - 2].sort(() => Math.random() - 0.5) }; };
  const [data, setData] = useState(generateQ());

  const handleGuess = (guess) => { if (guess === data.ans) setScore(s => s + 1); setData(generateQ()); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '24px', color: '#FF9500' }}>Score: {score}</div>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#FFF' }}>{data.q}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%' }}>
          {data.opts.map((opt, i) => <button key={i} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#222', color: '#FFF', border: '2px solid #FF9500', borderRadius: '20px', padding: '32px 0', fontSize: '32px', fontWeight: 'bold' }}>{opt}</button>)}
        </div>
      </div>
    </div>
  );
}
