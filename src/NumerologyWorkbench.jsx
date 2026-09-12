import { useState, useEffect } from 'react';
import { Home, Sparkles, Calculator, User, Users, Edit3, Save, History as HistoryIcon, Trash2, Share2, Moon, Star } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

const NUMEROLOGY_DATA = {
  1: { meaning: "The Leader: Fiercely independent, creative, and meant to pioneer new paths.", planet: "Sun", sign: "Leo" },
  2: { meaning: "The Peacemaker: Highly intuitive, diplomatic, and deeply values harmony.", planet: "Moon", sign: "Cancer" },
  3: { meaning: "The Communicator: Expressive, artistic, and brings joy and optimism to those around you.", planet: "Jupiter", sign: "Sagittarius" },
  4: { meaning: "The Builder: Practical, grounded, and the reliable foundation others depend on.", planet: "Uranus", sign: "Aquarius" },
  5: { meaning: "The Free Spirit: Craves adventure, freedom, and is highly adaptable to change.", planet: "Mercury", sign: "Gemini & Virgo" },
  6: { meaning: "The Nurturer: A natural caregiver, deeply protective, and values family and home.", planet: "Venus", sign: "Taurus & Libra" },
  7: { meaning: "The Seeker: Analytical, spiritual, and constantly searching for truth and inner wisdom.", planet: "Neptune", sign: "Pisces" },
  8: { meaning: "The Powerhouse: Driven, ambitious, and meant to master the material and financial world.", planet: "Saturn", sign: "Capricorn" },
  9: { meaning: "The Humanitarian: Compassionate, deeply empathetic, and meant to serve the greater good.", planet: "Mars", sign: "Aries & Scorpio" },
  11: { meaning: "The Illuminator (Master): Highly intuitive, a spiritual messenger, and carries immense inner strength.", planet: "Uranus / Neptune", sign: "Aquarius / Pisces" },
  22: { meaning: "The Master Builder (Master): You have the unique ability to turn grand dreams into tangible realities.", planet: "Pluto", sign: "Scorpio" },
  33: { meaning: "The Master Teacher (Master): An avatar of pure compassion, meant to uplift and heal humanity.", planet: "Venus", sign: "Libra" }
};

export default function NumerologyWorkbench({ goHome }) {
  const [view, setView] = useState('mine'); // 'mine', 'other', 'history'
  
  const [myBday, setMyBday] = useState('');
  const [isEditingMine, setIsEditingMine] = useState(false);
  
  const [otherName, setOtherName] = useState('');
  const [otherBday, setOtherBday] = useState('');
  const [otherLifePath, setOtherLifePath] = useState(null);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedBday = localStorage.getItem('sovereign_my_bday');
    if (savedBday) setMyBday(savedBday);

    const savedHistory = localStorage.getItem('sovereign_num_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const calculateLifePath = (dateString) => {
    if (!dateString) return null;
    const digits = dateString.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
  };

  const saveMyBday = () => {
    if (!myBday) return;
    localStorage.setItem('sovereign_my_bday', myBday);
    setIsEditingMine(false);
  };

  const saveReadingToHistory = (type) => {
    const isMine = type === 'mine';
    const lp = isMine ? calculateLifePath(myBday) : otherLifePath;
    const name = isMine ? "My Path" : (otherName || "Unknown Friend");
    const date = isMine ? myBday : otherBday;

    if (!lp) return;

    const newEntry = {
      id: Date.now(),
      type: type,
      name: name,
      birthdate: date,
      lifePath: lp,
      savedAt: new Date().toLocaleDateString()
    };

    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('sovereign_num_history', JSON.stringify(updated));
    alert("Reading saved to History!");
  };

  const deleteReading = (id) => {
    if (window.confirm("Delete this reading?")) {
      const updated = history.filter(h => h.id !== id);
      setHistory(updated);
      localStorage.setItem('sovereign_num_history', JSON.stringify(updated));
    }
  };

  const exportReading = (entry) => {
    const data = NUMEROLOGY_DATA[entry.lifePath] || { meaning: "A unique path.", planet: "?", sign: "?" };
    const body = `Numerology Reading: ${entry.name}\nBirthdate: ${entry.birthdate}\n\nLife Path Number: ${entry.lifePath}\nRuling Planet: ${data.planet}\nAstrological Sign: ${data.sign}\n\nMeaning: ${data.meaning}`;
    window.location.href = `mailto:?subject=Numerology Reading: ${entry.name}&body=${encodeURIComponent(body)}`;
  };

  const ReadingCard = ({ lifePath, name }) => {
    const data = NUMEROLOGY_DATA[lifePath] || { meaning: "A beautiful and unique path awaits you.", planet: "Unknown", sign: "Unknown" };
    return (
      <div style={{ backgroundColor: '#1E3A8A', padding: '32px 24px', borderRadius: '24px', border: '2px solid #1c3b5e', textAlign: 'center', marginTop: '24px' }}>
        <div style={{ color: '#93C5FD', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
          {name}'s Life Path
        </div>
        <div style={{ color: '#FFF', fontSize: '72px', fontWeight: 'bold', margin: '16px 0', textShadow: '0px 4px 12px rgba(0,0,0,0.5)' }}>
          {lifePath}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#112244', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#93C5FD', fontWeight: 'bold' }}>
            <Moon size={20} /> {data.planet}
          </div>
          <div style={{ backgroundColor: '#112244', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', fontWeight: 'bold' }}>
            <Star size={20} /> {data.sign}
          </div>
        </div>

        <p style={{ color: '#E0E0E0', fontSize: '22px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
          "{data.meaning}"
        </p>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('mine')} style={{ flex: 1, backgroundColor: view === 'mine' ? '#FF9500' : '#222', color: view === 'mine' ? '#000' : '#FFF', padding: '12px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <User size={24} /> My Path
        </button>
        <button onClick={() => setView('other')} style={{ flex: 1, backgroundColor: view === 'other' ? '#FF9500' : '#222', color: view === 'other' ? '#000' : '#FFF', padding: '12px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Users size={24} /> Another
        </button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '12px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <HistoryIcon size={24} /> History
        </button>
      </div>

      {view === 'mine' && (
        <>
          {(!myBday || isEditingMine) ? (
            <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444' }}>
              <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Enter Your Birthdate:</h2>
              <input 
                type="date" value={myBday} onChange={(e) => setMyBday(e.target.value)}
                style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '28px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              />
              <button onClick={saveMyBday} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
                Lock in My Path
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsEditingMine(true)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#112244', border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', zIndex: 10 }}>
                <Edit3 size={24} />
              </button>
              <ReadingCard lifePath={calculateLifePath(myBday)} name="My" />
              <button onClick={() => saveReadingToHistory('mine')} style={{ width: '100%', marginTop: '16px', backgroundColor: '#2E7D32', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <Save size={24} /> Save to History
              </button>
            </div>
          )}
        </>
      )}

      {view === 'other' && (
        <>
          <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444' }}>
            <h2 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '22px' }}>Name:</h2>
            <input 
              type="text" value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="e.g. Sarah"
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '16px', borderRadius: '12px', border: '2px solid #555', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <h2 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '22px' }}>Birthdate:</h2>
            <input 
              type="date" value={otherBday} onChange={(e) => setOtherBday(e.target.value)}
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '16px', borderRadius: '12px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <button onClick={() => setOtherLifePath(calculateLifePath(otherBday))} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <Calculator size={28} /> Calculate
            </button>
          </div>

          {otherLifePath && (
            <div>
              <ReadingCard lifePath={otherLifePath} name={otherName || "Friend"} />
              <button onClick={() => saveReadingToHistory('other')} style={{ width: '100%', marginTop: '16px', backgroundColor: '#2E7D32', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <Save size={24} /> Save to History
              </button>
            </div>
          )}
        </>
      )}

      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No saved readings.</p> : 
            history.map(entry => {
              const data = NUMEROLOGY_DATA[entry.lifePath] || { planet: '?', sign: '?' };
              return (
                <div key={entry.id} style={{ backgroundColor: '#222', border: '2px solid #444', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{entry.name}</div>
                      <div style={{ color: '#888', fontSize: '18px' }}>Bday: {entry.birthdate}</div>
                    </div>
                    <div style={{ backgroundColor: '#FF9500', color: '#000', fontSize: '28px', fontWeight: 'bold', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {entry.lifePath}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16px', color: '#93C5FD' }}><strong>Planet:</strong> {data.planet}</div>
                    <div style={{ fontSize: '16px', color: '#FFD700' }}><strong>Sign:</strong> {data.sign}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => exportReading(entry)} style={{ flex: 1, backgroundColor: '#112244', border: '2px solid #3B82F6', color: '#3B82F6', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Share2 size={20} /> Export
                    </button>
                    <button onClick={() => deleteReading(entry.id)} style={{ backgroundColor: 'transparent', border: '2px solid #FF3B30', color: '#FF3B30', padding: '12px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
