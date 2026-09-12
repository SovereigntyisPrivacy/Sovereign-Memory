import { useState, useEffect } from 'react';
import { Home, Sparkles, Calculator } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

export default function NumerologyWorkbench({ goHome }) {
  const [birthdate, setBirthdate] = useState('');
  const [lifePath, setLifePath] = useState(null);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const calculateLifePath = () => {
    if (!birthdate) return;
    
    // Strip hyphens and add all digits
    const digits = birthdate.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    // Keep reducing until we hit a single digit OR a master number (11, 22, 33)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    
    setLifePath(sum);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ backgroundColor: '#222', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
        <Sparkles size={40} color="#FF9500" style={{ marginBottom: '12px' }} />
        <h1 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '32px' }}>Numerology</h1>
        <p style={{ fontSize: '20px', color: '#CCC', margin: 0, lineHeight: '1.4' }}>
          Discover the energetic blueprint of your life journey.
        </p>
      </div>

      <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444', marginBottom: '24px' }}>
        <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Enter Birthdate:</h2>
        <input 
          type="date" 
          value={birthdate} 
          onChange={(e) => setBirthdate(e.target.value)}
          style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '28px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
        />
        <button onClick={calculateLifePath} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <Calculator size={28} /> Calculate Path
        </button>
      </div>

      {lifePath && (
        <div style={{ backgroundColor: '#2E7D32', padding: '32px 24px', borderRadius: '24px', border: '2px solid #1c4a1e', textAlign: 'center', animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Life Path Number</div>
          <div style={{ color: '#FFF', fontSize: '72px', fontWeight: 'bold', margin: '16px 0', textShadow: '0px 4px 12px rgba(0,0,0,0.5)' }}>
            {lifePath}
          </div>
          <p style={{ color: '#E0E0E0', fontSize: '22px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
            {getMeaning(lifePath)}
          </p>
        </div>
      )}
    </div>
  );
}
