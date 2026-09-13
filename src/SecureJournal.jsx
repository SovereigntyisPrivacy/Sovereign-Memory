import { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Save, Trash2, Share2, Plus, Lock } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const MOODS = ['😊', '😌', '🥺', '😡', '💖'];
const COLORS = ['#222222', '#3A2E2E', '#2A3B2A', '#1C2A3A', '#3A1C3A'];

export default function SecureJournal({ goHome }) {
  const [view, setView] = useState('list');
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_journal');
    if (saved) setEntries(JSON.parse(saved));
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'list' && typeof goHome === 'function') goHome();
      else setView('list');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const createNew = () => {
    setActiveEntry({ id: Date.now(), timestamp: Date.now(), text: '', mood: '😊', color: '#222222' });
    setView('edit');
  };

  const openEntry = (entry) => {
    setActiveEntry({ ...entry });
    setView('edit');
  };

  const saveEntry = () => {
    if (!activeEntry.text.trim()) return;
    const isNew = !entries.some(e => e.id === activeEntry.id);
    const updated = isNew ? [activeEntry, ...entries] : entries.map(e => e.id === activeEntry.id ? activeEntry : e);
    setEntries(updated);
    localStorage.setItem('sovereign_journal', JSON.stringify(updated));
    setView('list');
  };

  const deleteEntry = (id) => {
    if (window.confirm("Permanently delete this entry?")) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('sovereign_journal', JSON.stringify(updated));
      setView('list');
    }
  };

  const exportAndDelete = (entry) => {
    if (!window.confirm("This will export the entry to your email app and permanently erase it from this device. Continue?")) return;
    const dateStr = new Date(entry.timestamp).toLocaleString();
    const body = `Journal Entry - ${dateStr}\nMood: ${entry.mood}\n\n${entry.text}`;
    window.location.href = `mailto:?subject=Sovereign Journal Entry&body=${encodeURIComponent(body)}`;
    
    setTimeout(() => {
       const updated = entries.filter(e => e.id !== entry.id);
       setEntries(updated);
       localStorage.setItem('sovereign_journal', JSON.stringify(updated));
       setView('list');
    }, 1500);
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak your journal entry...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) {
        setActiveEntry(prev => ({ ...prev, text: (prev.text + ' ' + result.matches[0]).trim() }));
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };
  if (view === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px 24px', borderRadius: '16px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', border: 'none', minHeight: '90px' }}><ArrowLeft size={32} /> Home</button>
          <h2 style={{ color: '#FF9500', margin: 0, fontSize: '32px' }}>Journal</h2>
        </div>
        
        <button onClick={createNew} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '24px', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', minHeight: '90px', marginBottom: '32px' }}><Plus size={36} /> New Entry</button>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px' }}>No entries yet.</p> : entries.map(entry => {
            const isLocked = (Date.now() - entry.timestamp) > 8 * 60 * 60 * 1000;
            return (
              <button key={entry.id} onClick={() => openEntry(entry)} style={{ width: '100%', backgroundColor: entry.color || '#222', border: '2px solid #444', borderRadius: '24px', padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '32px' }}>{entry.mood}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     {isLocked && <Lock size={20} color="#FF3B30" />}
                     <span style={{ color: '#AAA', fontSize: '18px' }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ color: '#FFF', fontSize: '22px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{entry.text || "Empty entry..."}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const isLocked = activeEntry ? (Date.now() - activeEntry.timestamp) > 8 * 60 * 60 * 1000 : false;
  const dateObj = new Date(activeEntry.timestamp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px 24px', borderRadius: '16px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', border: 'none', minHeight: '90px' }}><ArrowLeft size={32} /> Back</button>
        <div style={{ textAlign: 'right', color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>
           <div>{dateObj.toLocaleDateString()}</div>
           <div>{dateObj.toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#111', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FF9500', margin: 0 }}>"Your words matter. Take your time."</p>
        {isLocked && <p style={{ fontSize: '18px', color: '#FF3B30', margin: '12px 0 0 0', fontWeight: 'bold' }}>🔒 This entry is locked and can only be exported and erased.</p>}
      </div>

      {!isLocked && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {MOODS.map(m => <button key={m} onClick={() => setActiveEntry({...activeEntry, mood: m})} style={{ fontSize: '36px', padding: '16px', backgroundColor: activeEntry.mood === m ? '#FF9500' : '#222', borderRadius: '16px', border: 'none', minWidth: '80px' }}>{m}</button>)}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            {COLORS.map(c => <button key={c} onClick={() => setActiveEntry({...activeEntry, color: c})} style={{ width: '60px', height: '60px', backgroundColor: c, border: activeEntry.color === c ? '4px solid #FF9500' : '2px solid #444', borderRadius: '16px', flexShrink: 0 }} />)}
          </div>
        </>
      )}

      <textarea 
        value={activeEntry.text} 
        onChange={e => setActiveEntry({...activeEntry, text: e.target.value})} 
        readOnly={isLocked}
        placeholder="Write your heart out..." 
        style={{ width: "100%", minHeight: "45vh", fontSize: "32px", padding: "24px", lineHeight: "1.6", borderRadius: "24px", backgroundColor: activeEntry.color || "#222", color: "#FFF", border: "2px solid #FF9500", outline: "none", boxSizing: "border-box", resize: "none", marginBottom: "24px", opacity: isLocked ? 0.8 : 1 }} 
      />

      {!isLocked ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '24px', color: isListening ? '#000' : '#FFF', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Mic size={36} color={isListening ? '#000' : '#FF9500'} /></button>
          <button onClick={saveEntry} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Save size={36} /></button>
          <button onClick={() => deleteEntry(activeEntry.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '24px', color: '#FF3B30', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Trash2 size={36} /></button>
        </div>
      ) : (
        <button onClick={() => exportAndDelete(activeEntry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#112244', border: '4px solid #3B82F6', borderRadius: '24px', color: '#3B82F6', fontSize: '28px', fontWeight: 'bold', minHeight: '100px', padding: '24px' }}>
          <Share2 size={40} /> Export & Erase
        </button>
      )}
    </div>
  );
}
