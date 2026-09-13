import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useState } from 'react';
import { CheckSquare, Hash, Brain, Clock, Lock, Phone, Layers } from 'lucide-react';
import DailyTasks from './DailyTasks';
import NumerologyWorkbench from './NumerologyWorkbench';
import MedicationManager from './MedicationManager';
import SecureJournal from './SecureJournal';
import FamilyDirectory from './FamilyDirectory';
import TarotReader from './TarotReader';
import RuneWorkbench from './RuneWorkbench';
import BrainGames from './BrainGames';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (activeTab === 'home') CapApp.exitApp();
    });
    return () => { listener.remove(); };
  }, [activeTab]);


  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px', boxSizing: 'border-box' }}>
      
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
          
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFF', textAlign: 'center', margin: '0 0 8px 0' }}>Sovereign Memory</h1>
          
          <div style={{ textAlign: 'center', marginBottom: '24px', border: '3px solid #FFCC00', borderRadius: '16px', padding: '32px 16px', backgroundColor: '#222' }}>
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#FF3B30', textShadow: '2px 2px 0px #FFCC00', lineHeight: '1.2', margin: '0 0 12px 0' }}>
              ❤️❤️ I love<br/>you mom.
            </div>
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>❤️❤️</div>
            <div style={{ fontSize: '28px', color: '#FFCC00', fontStyle: 'italic', fontWeight: 'bold', marginBottom: '24px' }}>
              Forever and<br/>always. ✨
            </div>
            <div style={{ fontSize: '22px', color: '#FFF', lineHeight: '1.4', fontWeight: '500' }}>
              May this help you<br/>bring joy back to your<br/>interests. 🌻💛
            </div>
          </div>

          <button onClick={() => setActiveTab('tasks')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CheckSquare size={32} color="var(--accent)" /> Daily Tasks
          </button>
          
          <button onClick={() => setActiveTab('numerology')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Hash size={32} color="var(--accent)" /> Numerology
          </button>

          <button onClick={() => setActiveTab('tarot')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Layers size={32} color="var(--accent)" /> Tarot Reader
          </button>

          <button onClick={() => setActiveTab('brain')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Brain size={32} color="var(--accent)" /> Brain Games
          </button>

          <button onClick={() => setActiveTab('meds')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Clock size={32} color="var(--accent)" /> Medications
          </button>

          <button onClick={() => setActiveTab('journal')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Lock size={32} color="var(--accent)" /> Private Journal
          </button>

          <button onClick={() => setActiveTab('family')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Phone size={32} color="var(--accent)" /> Call Family
          </button>
        <button onClick={() => setActiveTab('runes')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px', color: 'var(--accent)', width: '32px', textAlign: 'center' }}>ᚱ</div> Elder Runes
        </button>
        </div>
      )}

      {activeTab === 'tasks' && <DailyTasks goHome={() => setActiveTab('home')} />}
      {activeTab === 'numerology' && <NumerologyWorkbench goHome={() => setActiveTab('home')} />}
      {activeTab === 'tarot' && <TarotReader goHome={() => setActiveTab('home')} />}
      {activeTab === 'brain' && <BrainGames goHome={() => setActiveTab('home')} />}
      {activeTab === 'meds' && <MedicationManager goHome={() => setActiveTab('home')} />}
      {activeTab === 'journal' && <SecureJournal goHome={() => setActiveTab('home')} />}
      {activeTab === 'family' && <FamilyDirectory goHome={() => setActiveTab('home')} />}
      {activeTab === 'runes' && <RuneWorkbench goHome={() => setActiveTab('home')} />}
    </div>
  );
}
