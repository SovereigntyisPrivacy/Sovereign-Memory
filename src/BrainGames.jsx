import { useState, useEffect } from 'react';
import { Home, Copy, Music, Grid as GridIcon, Leaf, Volume2, Play, Settings, Type, Hash, ArrowLeft } from 'lucide-react';

export default function BrainGames({ goHome }) {
  const [activeGame, setActiveGame] = useState('menu');

  if (activeGame === 'matching') return <MatchingGame goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'sequence') return <SequenceEcho goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'household') return <HouseholdSorter goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'botanical') return <BotanicalSorter goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'words') return <WordScramble goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'math') return <QuickMath goBack={() => setActiveGame('menu')} />;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
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

function SequenceEcho({ goBack }) {
  const [score, setScore] = useState(0);
  
  // Exact colors from your screenshot
  const COLORS = ['#7A2828', '#2E5A2C', '#1C3B5E', '#8B7515']; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        ← Back to Games
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ color: '#FFF', margin: 0, fontSize: '36px' }}>Score: {score}</h2>
        <button style={{ backgroundColor: '#333', padding: '16px', borderRadius: '16px', border: 'none', color: '#FFF' }}>
          <Volume2 size={32} />
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '32px', color: '#CCC', fontWeight: 'bold', marginBottom: '32px', lineHeight: '1.4' }}>
        Watch the pattern,<br/>then copy it.
      </div>

      <button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', backgroundColor: '#FF9500', padding: '24px', borderRadius: '20px', color: '#000', fontSize: '36px', fontWeight: 'bold', border: 'none', width: '100%', marginBottom: '32px' }}>
        <Play size={36} fill="#000" /> Start Game
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexGrow: 1 }}>
        {COLORS.map((col, idx) => (
          <button key={idx} style={{ backgroundColor: col, borderRadius: '32px', border: 'none', width: '100%', height: '100%', minHeight: '160px' }} />
        ))}
      </div>
    </div>
  );
}

function MatchingGame({ goBack }) {
  const [view, setView] = useState('settings'); // 'settings' or 'board'

  if (view === 'settings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
        <button onClick={goBack} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
          ← Back to Games
        </button>
        <h1 style={{ color: '#FFF', fontSize: '36px', margin: '0 0 24px 0' }}>Game Settings</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <span style={{ color: '#FF9500' }}>🎨</span> Colors: ON
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <span style={{ color: '#FF9500' }}>🖼️</span> Images: ON
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#222', border: '2px solid #FF9500', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '32px', fontWeight: 'bold' }}>
            <Volume2 size={36} color="#FF9500" /> Sounds: ON
          </button>
        </div>

        <h2 style={{ color: '#FFF', fontSize: '28px', textAlign: 'center', marginBottom: '16px' }}>Number of Matches: 4</h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button style={{ flex: 1, backgroundColor: '#333', color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '24px' }}>- Less</button>
          <button style={{ flex: 1, backgroundColor: '#333', color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '24px' }}>+ More</button>
        </div>

        <button onClick={() => setView('board')} style={{ backgroundColor: '#FF9500', color: '#000', fontSize: '36px', fontWeight: 'bold', border: 'none', borderRadius: '20px', padding: '24px', width: '100%', marginTop: 'auto' }}>
          Play
        </button>
      </div>
    );
  }

  // The Board View (18516.jpg)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <h1 style={{ color: '#FFF', fontSize: '42px', margin: 0, lineHeight: '1.2' }}>Matching<br/>Game</h1>
        <button onClick={() => setView('settings')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <Settings size={24} /> Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexGrow: 1 }}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ backgroundColor: '#333', borderRadius: '20px', width: '100%', minHeight: '120px', border: '2px solid #444' }} />
        ))}
      </div>
    </div>
  );
}

function HouseholdSorter({ goBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#FFF', fontSize: '32px', textAlign: 'center', marginBottom: '24px' }}>Household Sorter</h2>
      <p style={{ color: '#AAA', fontSize: '20px', textAlign: 'center', marginBottom: '40px' }}>Tap an item, then tap the room it belongs in.</p>
      <button onClick={goBack} style={{ backgroundColor: '#FF9500', padding: '20px 40px', borderRadius: '16px', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none' }}>Back to Menu</button>
    </div>
  );
}

function BotanicalSorter({ goBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#FFF', fontSize: '32px', textAlign: 'center', marginBottom: '24px' }}>Botanical Sorter</h2>
      <p style={{ color: '#AAA', fontSize: '20px', textAlign: 'center', marginBottom: '40px' }}>Sort the plants by type or color.</p>
      <button onClick={goBack} style={{ backgroundColor: '#FF9500', padding: '20px 40px', borderRadius: '16px', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none' }}>Back to Menu</button>
    </div>
  );
}


function WordScramble({ goBack }) {
  const WORDS = [{ s: 'L I M A Y F', a: 'FAMILY', opts: ['FAMILY', 'FILMY', 'FLAME'] }, { s: 'E A C E P', a: 'PEACE', opts: ['PACE', 'PEACE', 'PIECE'] }, { s: 'E H R A T', a: 'HEART', opts: ['EARTH', 'HEART', 'HEAT'] }];
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
