import { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Save, Trash2, Share2, Plus, Lock, ChevronUp, ChevronDown, Edit3, BookOpen, History as HistoryIcon, Home } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const MOODS = ['😊', '😌', '🥺', '😡', '💖'];
const COLORS = ['#222222', '#3A2E2E', '#2A3B2A', '#1C2A3A', '#3A1C3A'];

export default function SecureJournal({ goHome }) {
  const [view, setView] = useState('history'); 
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_journal');
    if (saved) setEntries(JSON.parse(saved));
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'history' && typeof goHome === 'function') goHome();
      else setView('history');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const createNew = () => {
    setActiveEntry({ id: Date.now(), timestamp: Date.now(), text: '', mood: '😊', color: '#222222' });
    setView('new');
  };

  const openEntry = (entry) => {
    setActiveEntry({ ...entry });
    setView('edit');
  };

  const saveEntry = () => {
    if (!activeEntry.text.trim()) {
       alert("Cannot save an empty entry.");
       return;
    }
    const isNew = !entries.some(e => e.id === activeEntry.id);
    const updated = isNew ? [activeEntry, ...entries] : entries.map(e => e.id === activeEntry.id ? activeEntry : e);
    setEntries(updated);
    localStorage.setItem('sovereign_journal', JSON.stringify(updated));
    setView('history');
  };

  const deleteEntry = (id) => {
    if (window.confirm("Permanently delete this entry?")) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('sovereign_journal', JSON.stringify(updated));
      setView('history');
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
       setView('history');
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
  const renderHistory = () => (
    <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {entries.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px' }}>No entries yet.</p> : entries.map(entry => {
        const isLocked = (Date.now() - entry.timestamp) > 8 * 60 * 60 * 1000;
        const isExpanded = expandedEntry === entry.id;
        const dateObj = new Date(entry.timestamp);

        return (
          <div key={entry.id} style={{ backgroundColor: entry.color || '#222', border: '2px solid #444', borderRadius: '24px', overflow: 'hidden' }}>
            <button onClick={() => setExpandedEntry(isExpanded ? null : entry.id)} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '42px' }}>{entry.mood}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{dateObj.toLocaleDateString()}</span>
                  <span style={{ color: '#CCC', fontSize: '20px' }}>{dateObj.toLocaleTimeString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isLocked && <Lock size={28} color="#FF3B30" />}
                {isExpanded ? <ChevronUp size={36} color="#FFF" /> : <ChevronDown size={36} color="#FFF" />}
              </div>
            </button>

            {isExpanded && (
              <div style={{ padding: '24px', borderTop: '2px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <p style={{ color: '#FFF', fontSize: '26px', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-wrap' }}>
                  {entry.text || "Empty entry..."}
                </p>
                
                {isLocked ? (
                  <button onClick={() => exportAndDelete(entry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#112244', border: '4px solid #3B82F6', borderRadius: '24px', color: '#3B82F6', fontSize: '24px', fontWeight: 'bold', minHeight: '90px', padding: '20px' }}>
                    <Share2 size={32} /> Export & Erase
                  </button>
                ) : (
                  <button onClick={() => openEntry(entry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '24px', minHeight: '90px', padding: '20px' }}>
                    <Edit3 size={32} /> Edit Entry
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={createNew} style={{ flex: 1, backgroundColor: view === 'new' || view === 'edit' ? '#FF9500' : '#222', color: view === 'new' || view === 'edit' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} /> {view === 'edit' ? 'Edit Entry' : 'New Entry'}
        </button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon size={24} /> History
        </button>
      </div>

      {view === 'history' && renderHistory()}

      {(view === 'new' || view === 'edit') && activeEntry && (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ backgroundColor: '#111', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FF9500', margin: 0 }}>"Your words matter. Take your time."</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {MOODS.map(m => <button key={m} onClick={() => setActiveEntry({...activeEntry, mood: m})} style={{ fontSize: '36px', padding: '16px', backgroundColor: activeEntry.mood === m ? '#FF9500' : '#222', borderRadius: '16px', border: 'none', minWidth: '80px' }}>{m}</button>)}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            {COLORS.map(c => <button key={c} onClick={() => setActiveEntry({...activeEntry, color: c})} style={{ width: '60px', height: '60px', backgroundColor: c, border: activeEntry.color === c ? '4px solid #FF9500' : '2px solid #444', borderRadius: '16px', flexShrink: 0 }} />)}
          </div>

          <textarea 
            value={activeEntry.text} 
            onChange={e => setActiveEntry({...activeEntry, text: e.target.value})} 
            placeholder="Write your heart out..." 
            style={{ width: "100%", flexGrow: 1, minHeight: '30vh', fontSize: "32px", padding: "24px", lineHeight: "1.6", borderRadius: "24px", backgroundColor: activeEntry.color || "#222", color: "#FFF", border: "2px solid #FF9500", outline: "none", boxSizing: "border-box", resize: "none", marginBottom: "24px" }} 
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '24px', color: isListening ? '#000' : '#FFF', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Mic size={36} color={isListening ? '#000' : '#FF9500'} /></button>
            <button onClick={saveEntry} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Save size={36} /></button>
            <button onClick={() => deleteEntry(activeEntry.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '24px', color: '#FF3B30', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Trash2 size={36} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
