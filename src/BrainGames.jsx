import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Brain } from 'lucide-react';

const EMOJIS = ['🌸', '🦋', '🌞', '🍀', '🍎', '🧩', '💎', '🦉'];

export default function BrainGames({ goHome }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Back
        </button>
        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '26px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={28} /> Brain Games
        </h2>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px', border: '2px solid var(--accent)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#FFF' }}>Memory Match</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '18px' }}>Moves: {moves} | Matches: {solved.length / 2} / 8</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexGrow: 1 }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          return (
            <button 
              key={card.id} 
              onClick={() => handleCardClick(index)}
              style={{ 
                backgroundColor: isFlipped ? '#FFF' : 'var(--accent)', 
                borderRadius: '16px', 
                fontSize: '40px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                border: 'none',
                minHeight: '80px',
                boxShadow: isFlipped ? 'inset 0 4px 8px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s'
              }}
            >
              {isFlipped ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>

      <button onClick={initializeGame} style={{ marginTop: '24px', backgroundColor: '#1E3A8A', color: '#FFF', padding: '20px', borderRadius: '20px', fontSize: '24px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%' }}>
        <RefreshCw size={28} /> Restart Game
      </button>
    </div>
  );
}
