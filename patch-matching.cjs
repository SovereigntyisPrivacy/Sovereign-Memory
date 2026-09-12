const fs = require('fs');
let code = fs.readFileSync('src/BrainGames.jsx', 'utf8');

const newMatchingGame = `function MatchingGame({ goBack }) {
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
// ==========================================`;

code = code.replace(/function MatchingGame\(\{ goBack \}\) \{[\s\S]*?\/\/ ==========================================\n\/\/ 3\. PLACEHOLDERS & EXTRA GAMES\n\/\/ ==========================================/m, newMatchingGame);
fs.writeFileSync('src/BrainGames.jsx', code);
console.log("✅ Dynamic Matching Game with AudioContext & Ghost Hints Injected!");
