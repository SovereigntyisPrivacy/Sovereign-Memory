import { useState, useEffect } from 'react';
import { Home, Sparkles, Calculator, User, Users, Edit3, Save } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

export default function NumerologyWorkbench({ goHome }) {
  const [view, setView] = useState('mine'); // 'mine' or 'other'
  
  const [myBday, setMyBday] = useState('');
  const [isEditingMine, setIsEditingMine] = useState(false);
  
  const [otherBday, setOtherBday] = useState('');
  const [otherLifePath, setOtherLifePath] = useState(null);

  useEffect(() => {
    // Automatically load her saved birthday when she opens the app
    const saved = localStorage.getItem('sovereign_my_bday');
    if (saved) setMyBday(saved);

    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const saveMyBday = () => {
    if (!myBday) return;
    localStorage.setItem('sovereign_my_bday', myBday);
    setIsEditingMine(false);
  };

  const calculateLifePath = (dateString) => {
    if (!dateString) return null;
    const digits = dateString.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
  };

  const getMeaning = (num) => {
    const meanings = {
      1: "The Leader: You are fiercely independent, creative, and meant to pioneer new paths.",
      2: "The Peacemaker: You are highly intuitive, diplomatic, and deeply value harmony and relationships.",
      3: "The Communicator: You are expressive, artistic, and bring joy and optimism to those around you.",
      4: "The Builder: You are practical, grounded, and the reliable foundation that others depend on.",
      5: "The Free Spirit: You crave adventure, freedom, and are highly adaptable to change.",
      6: "The Nurturer: You are a natural caregiver, deeply protective, and value family and home.",
      7: "The Seeker: You are analytical, spiritual, and constantly searching for truth and inner wisdom.",
      8: "The Powerhouse: You are driven, ambitious, and meant to master the material and financial world.",
      9: "The Humanitarian: You are compassionate, deeply empathetic, and meant to serve the greater good.",
      11: "The Illuminator (Master Number): You are highly intuitive, a spiritual messenger, and carry immense inner strength. As Shakti flows through all living things, so does your infinite power.",
      22: "The Master Builder (Master Number): You have the unique ability to turn grand dreams into tangible realities.",
      33: "The Master Teacher (Master Number): You are an avatar of pure compassion, meant to uplift and heal humanity."
    };
    return meanings[num] || "A beautiful and unique path awaits you.";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ backgroundColor: '#222', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <Sparkles size={40} color="#FF9500" style={{ marginBottom: '12px' }} />
        <h1 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '32px' }}>Numerology</h1>
        <p style={{ fontSize: '20px', color: '#CCC', margin: 0, lineHeight: '1.4' }}>
          Discover the energetic blueprint of a life journey.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('mine')} style={{ flex: 1, backgroundColor: view === 'mine' ? '#FF9500' : '#222', color: view === 'mine' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <User size={24} /> My Path
        </button>
        <button onClick={() => setView('other')} style={{ flex: 1, backgroundColor: view === 'other' ? '#FF9500' : '#222', color: view === 'other' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Users size={24} /> Read Another
        </button>
      </div>

      {/* MY PATH VIEW */}
      {view === 'mine' && (
        <>
          {(!myBday || isEditingMine) ? (
            <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444' }}>
              <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Enter Your Birthdate:</h2>
              <input 
                type="date" 
                value={myBday} 
                onChange={(e) => setMyBday(e.target.value)}
                style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '28px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              />
              <button onClick={saveMyBday} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <Save size={28} /> Lock in My Path
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', backgroundColor: '#2E7D32', padding: '32px 24px', borderRadius: '24px', border: '2px solid #1c4a1e', textAlign: 'center' }}>
              <button onClick={() => setIsEditingMine(true)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', border: 'none', color: '#A5D6A7' }}>
                <Edit3 size={28} />
              </button>
              <div style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>My Life Path</div>
              <div style={{ color: '#FFF', fontSize: '72px', fontWeight: 'bold', margin: '16px 0', textShadow: '0px 4px 12px rgba(0,0,0,0.5)' }}>
                {calculateLifePath(myBday)}
              </div>
              <p style={{ color: '#E0E0E0', fontSize: '22px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                {getMeaning(calculateLifePath(myBday))}
              </p>
            </div>
          )}
        </>
      )}

      {/* READ ANOTHER VIEW */}
      {view === 'other' && (
        <>
          <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444', marginBottom: '24px' }}>
            <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Enter Their Birthdate:</h2>
            <input 
              type="date" 
              value={otherBday} 
              onChange={(e) => setOtherBday(e.target.value)}
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '28px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <button onClick={() => setOtherLifePath(calculateLifePath(otherBday))} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <Calculator size={28} /> Calculate
            </button>
          </div>

          {otherLifePath && (
            <div style={{ backgroundColor: '#1E3A8A', padding: '32px 24px', borderRadius: '24px', border: '2px solid #1c3b5e', textAlign: 'center' }}>
              <div style={{ color: '#93C5FD', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Their Life Path</div>
              <div style={{ color: '#FFF', fontSize: '72px', fontWeight: 'bold', margin: '16px 0', textShadow: '0px 4px 12px rgba(0,0,0,0.5)' }}>
                {otherLifePath}
              </div>
              <p style={{ color: '#E0E0E0', fontSize: '22px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                {getMeaning(otherLifePath)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
