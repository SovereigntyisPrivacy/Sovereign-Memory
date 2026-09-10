import { useState } from 'react';
import { Play, Settings, Check, Droplet, Sun, Wind, Sparkles } from 'lucide-react';

import { OILS_AND_HERBS } from "./botanicalData";

export default function BotanicalSorter() {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [gameItems, setGameItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorPulse, setErrorPulse] = useState(false);

  const startGame = () => {
    const shuffled = [...OILS_AND_HERBS].sort(() => Math.random() - 0.5);
    setGameItems(shuffled);
    setCurrentIndex(0);
    setShowSuccess(false);
    setIsConfiguring(false);
  };

  const handleSort = (selectedType) => {
    if (showSuccess) return; // Prevent double taps while animating
    
    const currentItem = gameItems[currentIndex];
    if (selectedType === currentItem.type) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentIndex(currentIndex + 1);
      }, 1500); // Very generous delay to process success
    } else {
      setErrorPulse(true);
      setTimeout(() => setErrorPulse(false), 500);
    }
  };

  if (isConfiguring) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Botanical Sorter</h2>
        <p style={{ marginBottom: '32px', fontSize: '20px', color: 'var(--text-muted)' }}>
          Sort the oils and herbs into their traditional uses.
        </p>
        <button className="primary-btn" onClick={startGame}>
          <Play size={36} color="#000" />
          START SORTING
        </button>
      </div>
    );
  }

  if (currentIndex >= gameItems.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Check size={80} color="var(--accent)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '24px' }}>All Sorted!</h2>
        <button className="primary-btn" onClick={() => setIsConfiguring(true)}>Sort Again</button>
      </div>
    );
  }

  const currentItem = gameItems[currentIndex];
  const { icon: ItemIcon, color, name, description } = currentItem;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Sorting ({currentIndex + 1} of {gameItems.length})</h2>
        <button style={{ width: 'auto', padding: '12px', fontSize: '18px' }} onClick={() => setIsConfiguring(true)}>
          <Settings size={24} /> Reset
        </button>
      </div>

      {/* The Massive Focus Card */}
      <div 
        style={{
          flexGrow: 1,
          backgroundColor: showSuccess ? color : 'var(--surface)',
          border: '4px solid',
          borderColor: showSuccess ? color : '#555',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '24px',
          transition: 'all 0.3s ease',
          transform: errorPulse ? 'translateX(-10px)' : 'translateX(0)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
        }}
      >
        <ItemIcon size={80} color={showSuccess ? '#000' : color} style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '40px', textAlign: 'center', color: showSuccess ? '#000' : 'var(--text-main)', marginBottom: '16px' }}>
          {name}
        </h1>
        
        {/* Rich info display area */}
        <div style={{ 
          fontSize: '20px', 
          textAlign: 'center', 
          color: showSuccess ? '#222' : 'var(--text-muted)', 
          lineHeight: '1.5',
          maxWidth: '90%'
        }}>
          {description || "A classic botanical extract."}
        </div>

        {showSuccess && (
          <div style={{ marginTop: '24px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={32} /> <span style={{ fontSize: '28px', fontWeight: 'bold' }}>Correct!</span>
          </div>
        )}
      </div>

      {/* Massive Sorting Buttons */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={() => handleSort('Relaxing')}
          style={{ height: '100px', backgroundColor: '#3949AB', justifyContent: 'center', fontSize: '28px', padding: '8px' }}
        >
          Relaxing
        </button>
        <button 
          onClick={() => handleSort('Energizing')}
          style={{ height: '100px', backgroundColor: '#FB8C00', justifyContent: 'center', fontSize: '28px', color: '#000', padding: '8px' }}
        >
          Energizing
        </button>
      </div>
    </div>
  );
}
