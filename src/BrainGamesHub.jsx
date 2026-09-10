import { useState } from 'react';
import { Copy, Music, LayoutGrid, Leaf, ArrowLeft } from 'lucide-react';
import MemoryGame from './MemoryGame';
import BotanicalSorter from './BotanicalSorter';
import SequenceEcho from './SequenceEcho';
import HouseholdSorter from './HouseholdSorter';

export default function BrainGamesHub() {
  const [activeGame, setActiveGame] = useState('menu');

  const renderGame = () => {
    switch(activeGame) {
      case 'matching': return <MemoryGame />;
      case 'sorter': return <BotanicalSorter />;
      case 'echo': return <SequenceEcho />;
      case 'household': return <HouseholdSorter />;
      default: return null;
    }
  };

  if (activeGame !== 'menu') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <button 
          className="primary-btn" 
          style={{ width: 'auto', padding: '12px 24px', marginBottom: '24px', fontSize: '20px' }} 
          onClick={() => setActiveGame('menu')}
        >
          <ArrowLeft size={24} color="#000" /> Back to Games
        </button>
        <div style={{ flexGrow: 1 }}>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Brain Games</h2>
      <div className="grid-menu">
        <button onClick={() => setActiveGame('matching')}>
          <Copy size={48} color="var(--accent)" />
          Matching Game
        </button>
        
        <button onClick={() => setActiveGame('echo')}>
          <Music size={48} color="var(--accent)" />
          Sequence Echo
        </button>
        
        <button onClick={() => setActiveGame('household')}>
          <LayoutGrid size={48} color="var(--accent)" />
          Household Sorter
        </button>

        <button onClick={() => setActiveGame('sorter')}>
          <Leaf size={48} color="var(--accent)" />
          Botanical Sorter
        </button>
      </div>
    </div>
  );
}
