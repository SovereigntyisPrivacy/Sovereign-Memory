import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Brain, Type, Hash, Eye, Grid } from 'lucide-react';

export default function BrainGames({ goHome }) {
  const [activeGame, setActiveGame] = useState('menu');

  if (activeGame === 'memory') return <MemoryMatch goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'words') return <WordScramble goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'math') return <QuickMath goBack={() => setActiveGame('menu')} />;
  if (activeGame === 'odd') return <OddOneOut goBack={() => setActiveGame('menu')} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Home
        </button>
        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '26px' }}>Brain Games</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'center' }}>
        <button onClick={() => setActiveGame('memory')} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Grid size={40} color="var(--accent)" />
          <div style={{ textAlign: 'left', color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>Memory Match</div>
        </button>
        <button onClick={() => setActiveGame('words')} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Type size={40} color="var(--accent)" />
          <div style={{ textAlign: 'left', color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>Word Scramble</div>
        </button>
        <button onClick={() => setActiveGame('math')} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Hash size={40} color="var(--accent)" />
          <div style={{ textAlign: 'left', color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>Quick Math</div>
        </button>
        <button onClick={() => setActiveGame('odd')} style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Eye size={40} color="var(--accent)" />
          <div style={{ textAlign: 'left', color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>Odd One Out</div>
        </button>
      </div>
    </div>
  );
}

const EMOJIS = ['🌸', '🦋', '🌞', '🍀', '🍎', '🧩', '💎', '🦉'];

function MemoryMatch({ goBack }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled); setFlipped([]); setSolved([]); setMoves(0);
  };

  useEffect(() => { initializeGame(); }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setSolved(prev => [...prev, newFlipped[0], newFlipped[1]]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
        <h2 style={{ color: '#FFF', margin: '0 0 0 16px', fontSize: '24px' }}>Memory Match</h2>
      </div>
      <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '18px' }}>Moves: {moves} | Matches: {solved.length / 2} / 8</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexGrow: 1 }}>
        {cards.map((c, i) => {
          const isFlipped = flipped.includes(i) || solved.includes(i);
          return (
            <button key={c.id} onClick={() => handleCardClick(i)} style={{ backgroundColor: isFlipped ? '#FFF' : 'var(--accent)', borderRadius: '16px', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', minHeight: '70px', boxShadow: isFlipped ? 'inset 0 4px 8px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.3)' }}>
              {isFlipped ? c.emoji : '❓'}
            </button>
          );
        })}
      </div>
      <button onClick={initializeGame} style={{ marginTop: '20px', backgroundColor: '#1E3A8A', color: '#FFF', padding: '20px', borderRadius: '20px', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>Restart</button>
    </div>
  );
}

function WordScramble({ goBack }) {
  const WORDS = [
    { s: 'L I M A Y F', a: 'FAMILY', opts: ['FAMILY', 'FILMY', 'FLAME'] },
    { s: 'E A C E P', a: 'PEACE', opts: ['PACE', 'PEACE', 'PIECE'] },
    { s: 'E H R A T', a: 'HEART', opts: ['EARTH', 'HEART', 'HEAT'] },
    { s: 'D R E G N A', a: 'GARDEN', opts: ['DANGER', 'GARDEN', 'GRAND'] }
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleGuess = (guess) => {
    if (guess === WORDS[idx].a) setScore(s => s + 1);
    setIdx((idx + 1) % WORDS.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
        <h2 style={{ color: '#FFF', margin: '0 0 0 16px', fontSize: '24px' }}>Word Scramble</h2>
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '20px', color: 'var(--accent)' }}>Score: {score}</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFF', letterSpacing: '4px', textAlign: 'center' }}>{WORDS[idx].s}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {WORDS[idx].opts.map(opt => (
            <button key={opt} onClick={() => handleGuess(opt)} style={{ backgroundColor: 'var(--surface)', color: '#FFF', border: '2px solid var(--accent)', borderRadius: '20px', padding: '24px', fontSize: '24px', fontWeight: 'bold' }}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickMath({ goBack }) {
  const [score, setScore] = useState(0);
  const generateQ = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ans = a + b;
    return { q: `${a} + ${b}`, ans, opts: [ans, ans + 1, ans - 2].sort(() => Math.random() - 0.5) };
  };
  const [data, setData] = useState(generateQ());

  const handleGuess = (guess) => {
    if (guess === data.ans) setScore(s => s + 1);
    setData(generateQ());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
        <h2 style={{ color: '#FFF', margin: '0 0 0 16px', fontSize: '24px' }}>Quick Math</h2>
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '20px', color: 'var(--accent)' }}>Score: {score}</div>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#FFF' }}>{data.q}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%' }}>
          {data.opts.map((opt, i) => (
            <button key={i} onClick={() => handleGuess(opt)} style={{ backgroundColor: 'var(--surface)', color: '#FFF', border: '2px solid var(--accent)', borderRadius: '20px', padding: '32px 0', fontSize: '32px', fontWeight: 'bold' }}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OddOneOut({ goBack }) {
  const PAIRS = [['🍎','🍅'], ['🌞','🌻'], ['🐶','🦊'], ['💎','💧'], ['🌳','🥦']];
  const [score, setScore] = useState(0);

  const generateGrid = () => {
    const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const oddIdx = Math.floor(Math.random() * 9);
    return { p, oddIdx };
  };
  const [data, setData] = useState(generateGrid());

  const handleTap = (idx) => {
    if (idx === data.oddIdx) setScore(s => s + 1);
    setData(generateGrid());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
        <h2 style={{ color: '#FFF', margin: '0 0 0 16px', fontSize: '24px' }}>Odd One Out</h2>
      </div>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ fontSize: '20px', color: 'var(--accent)' }}>Score: {score}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '300px' }}>
          {Array(9).fill(0).map((_, i) => (
            <button key={i} onClick={() => handleTap(i)} style={{ backgroundColor: 'var(--surface)', border: '2px solid #555', borderRadius: '16px', height: '90px', fontSize: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {i === data.oddIdx ? data.p[1] : data.p[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
