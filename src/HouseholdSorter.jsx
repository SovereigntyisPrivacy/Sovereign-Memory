import { useState, useEffect } from 'react';
import { Utensils, Bath, Hammer, Briefcase, RefreshCw, Check, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'kitchen', name: 'Kitchen', icon: Utensils, color: '#FF9500' },
  { id: 'bathroom', name: 'Bathroom', icon: Bath, color: '#34A853' },
  { id: 'garage', name: 'Garage', icon: Hammer, color: '#007AFF' },
  { id: 'office', name: 'Office', icon: Briefcase, color: '#AF52DE' }
];

const ITEMS = [
  { name: 'Spatula', category: 'kitchen', icon: '🍳' },
  { name: 'Coffee Mug', category: 'kitchen', icon: '☕' },
  { name: 'Frying Pan', category: 'kitchen', icon: '🥘' },
  { name: 'Toothbrush', category: 'bathroom', icon: '🪥' },
  { name: 'Shampoo', category: 'bathroom', icon: '🧴' },
  { name: 'Towel', category: 'bathroom', icon: '🛁' },
  { name: 'Wrench', category: 'garage', icon: '🔧' },
  { name: 'Power Drill', category: 'garage', icon: '🪛' },
  { name: 'Duct Tape', category: 'garage', icon: '📼' },
  { name: 'Stapler', category: 'office', icon: '📎' },
  { name: 'Envelopes', category: 'office', icon: '✉️' },
  { name: 'Notebook', category: 'office', icon: '📓' }
];

export default function HouseholdSorter() {
  const [currentItem, setCurrentItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null

  const loadNewItem = () => {
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setCurrentItem(randomItem);

    const correctCategory = CATEGORIES.find(c => c.id === randomItem.category);
    let incorrectCategory;
    do {
      incorrectCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    } while (incorrectCategory.id === correctCategory.id);

    // Randomize the order of the two buttons
    const newOptions = Math.random() > 0.5 
      ? [correctCategory, incorrectCategory] 
      : [incorrectCategory, correctCategory];
    
    setOptions(newOptions);
    setFeedback(null);
  };

  useEffect(() => {
    loadNewItem();
  }, []);

  const handleSelection = (categoryId) => {
    if (feedback) return; // Prevent multiple taps

    if (categoryId === currentItem.category) {
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(loadNewItem, 1000);
    } else {
      setFeedback('incorrect');
      setScore(0);
      setTimeout(() => setFeedback(null), 1000); // Let her try again
    }
  };

  if (!currentItem) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '32px' }}>Streak: {score}</h2>
        <button onClick={() => { setScore(0); loadNewItem(); }} style={{ width: 'auto', padding: '12px', backgroundColor: 'transparent' }}>
          <RefreshCw size={28} />
        </button>
      </div>

      {/* The Item to Sort */}
      <div style={{ 
        flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'var(--surface)', borderRadius: '32px', border: '4px solid #555', marginBottom: '32px',
        position: 'relative', overflow: 'hidden'
      }}>
        {feedback === 'correct' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(76, 217, 100, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Check size={120} color="#4CD964" /></div>}
        {feedback === 'incorrect' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 59, 48, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><X size={120} color="#FF3B30" /></div>}
        
        <div style={{ fontSize: '100px', marginBottom: '16px', zIndex: 1 }}>{currentItem.icon}</div>
        <h1 style={{ fontSize: '48px', color: 'var(--accent)', zIndex: 1, textAlign: 'center' }}>{currentItem.name}</h1>
        <p style={{ fontSize: '24px', color: 'var(--text-muted)', marginTop: '16px', zIndex: 1 }}>Where does this belong?</p>
      </div>

      {/* The Binary Choices */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {options.map((cat) => {
          const Icon = cat.icon;
          return (
            <button 
              key={cat.id} 
              onClick={() => handleSelection(cat.id)}
              style={{ 
                flex: 1, height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
                backgroundColor: '#222', border: `4px solid ${cat.color}`, borderRadius: '24px'
              }}
            >
              <Icon size={48} color={cat.color} />
              <span style={{ fontSize: '28px', color: '#FFF', fontWeight: 'bold' }}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
