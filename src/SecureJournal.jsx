import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trash2, Mic, Lock, ShieldCheck, Save, Share2, Book, Clock, List, Key } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';
import CryptoJS from 'crypto-js';

export default function SecureJournal({ goHome }) {
  const [view, setView] = useState('lock'); // 'lock', 'dashboard', 'history', 'editor', 'changePin'
  const [passcode, setPasscode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);

  const [entryText, setEntryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState('😊');
  const [bgColor, setBgColor] = useState('#222222');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const originalTextRef = useRef('');
  
  // Dynamic PIN Loading (Defaults to 1995 if none is saved)
  const [savedPin, setSavedPin] = useState('1995');

  useEffect(() => {
    const storedPin = localStorage.getItem('sovereign_journal_pin');
    if (storedPin) setSavedPin(storedPin);

    const saved = localStorage.getItem('sovereign_journal_v2');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = (newEntries) => {
    localStorage.setItem('sovereign_journal_v2', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString());
      setTimeStr(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'lock' && goHome) goHome();
      else if (view === 'dashboard') setView('lock');
      else if (view === 'history' || view === 'editor' || view === 'changePin') setView('dashboard');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const handlePinTap = (num, isChanging = false) => {
    if (isChanging) {
      if (newPin.length < 4) setNewPin(newPin + num);
    } else {
      if (passcode.length < 4) setPasscode(passcode + num);
    }
  };

  const handleUnlock = () => {
    if (passcode === savedPin) {
      setView('dashboard');
      setPasscode('');
    } else {
      alert("Incorrect PIN.");
      setPasscode('');
    }
  };

  const confirmPinChange = () => {
    if (newPin.length === 4) {
      localStorage.setItem('sovereign_journal_pin', newPin);
      setSavedPin(newPin);
      alert("PIN successfully changed!");
      setView('dashboard');
      setNewPin('');
    } else {
      alert("PIN must be exactly 4 digits.");
    }
  };

  const openNewEntry = () => {
    setActiveEntryId(null); setEntryText(''); setMood('😊'); setBgColor('#222222'); setView('editor');
  };

  const openExistingEntry = (entry) => {
    setActiveEntryId(entry.id); setEntryText(entry.text); setMood(entry.mood); setBgColor(entry.bgColor); setView('editor');
  };

  const saveCurrentEntry = () => {
    if (!entryText.trim()) return;
    const now = Date.now();
    if (activeEntryId) {
      saveEntries(entries.map(e => e.id === activeEntryId ? { ...e, text: entryText, mood, bgColor } : e));
    } else {
      const newEntry = { id: now.toString(), text: entryText, mood, bgColor, timestamp: now, dateStr: new Date().toLocaleDateString(), timeStr: new Date().toLocaleTimeString() };
      saveEntries([newEntry, ...entries]);
      setActiveEntryId(newEntry.id);
    }
    alert("Entry securely saved.");
  };

  const deleteCurrentEntry = () => {
    if (activeEntryId) saveEntries(entries.filter(e => e.id !== activeEntryId));
    setView('history');
  };

  const exportAES = () => {
    if (entries.length === 0) return alert("No entries to export yet.");
    const dataString = JSON.stringify(entries);
    const ciphertext = CryptoJS.AES.encrypt(dataString, savedPin).toString();
    
    // PIN SCRUBBED FROM EMAIL BODY
    const body = `AES ENCRYPTED JOURNAL BACKUP:\n\n${ciphertext}\n\n(Decrypt using your secret PIN)`;
    window.location.href = `mailto:?subject=Secure Encrypted Journal Backup&body=${encodeURIComponent(body)}`;
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your entry...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        setEntryText(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  // --- VIEW 1: SECURE LOCK SCREEN ---
  if (view === 'lock') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none', alignSelf: 'flex-start', marginBottom: '24px' }}>
          <ArrowLeft size={24} /> Back
        </button>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '3px solid var(--accent)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <Lock size={64} color="var(--accent)" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#FFF', fontSize: '28px', marginBottom: '8px' }}>Private Journal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>Enter PIN to decrypt</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: i < passcode.length ? 'var(--accent)' : '#444', border: '2px solid #666' }} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePinTap(num.toString())} style={{ height: '70px', fontSize: '32px', backgroundColor: '#333', color: '#FFF', borderRadius: '16px', border: 'none' }}>{num}</button>)}
              <button onClick={() => setPasscode('')} style={{ height: '70px', fontSize: '18px', backgroundColor: 'var(--error)', color: '#000', borderRadius: '16px', border: 'none', fontWeight: 'bold' }}>Clear</button>
              <button onClick={() => handlePinTap('0')} style={{ height: '70px', fontSize: '32px', backgroundColor: '#333', color: '#FFF', borderRadius: '16px', border: 'none' }}>0</button>
              <button onClick={handleUnlock} style={{ height: '70px', backgroundColor: 'var(--accent)', color: '#000', borderRadius: '16px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><ShieldCheck size={32} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CHANGE PIN SCREEN ---
  if (view === 'changePin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <button onClick={() => { setView('dashboard'); setNewPin(''); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none', alignSelf: 'flex-start', marginBottom: '24px' }}>
          <ArrowLeft size={24} /> Cancel
        </button>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '3px solid #93C5FD', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <Key size={64} color="#93C5FD" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#FFF', fontSize: '28px', marginBottom: '8px' }}>Change PIN</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>Enter your new 4-digit PIN</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: i < newPin.length ? '#93C5FD' : '#444', border: '2px solid #666' }} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePinTap(num.toString(), true)} style={{ height: '70px', fontSize: '32px', backgroundColor: '#333', color: '#FFF', borderRadius: '16px', border: 'none' }}>{num}</button>)}
              <button onClick={() => setNewPin('')} style={{ height: '70px', fontSize: '18px', backgroundColor: 'var(--error)', color: '#000', borderRadius: '16px', border: 'none', fontWeight: 'bold' }}>Clear</button>
              <button onClick={() => handlePinTap('0', true)} style={{ height: '70px', fontSize: '32px', backgroundColor: '#333', color: '#FFF', borderRadius: '16px', border: 'none' }}>0</button>
              <button onClick={confirmPinChange} style={{ height: '70px', backgroundColor: '#93C5FD', color: '#000', borderRadius: '16px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><ShieldCheck size={32} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={() => setView('lock')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <Lock size={24} /> Lock App
          </button>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '26px' }}>Dashboard</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
          <button onClick={openNewEntry} style={{ backgroundColor: '#2E7D32', color: '#FFF', padding: '32px', borderRadius: '24px', fontSize: '28px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <Book size={40} /> Write New Entry
          </button>
          <button onClick={() => setView('history')} style={{ backgroundColor: 'var(--surface)', color: '#FFF', padding: '32px', borderRadius: '24px', fontSize: '28px', fontWeight: 'bold', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <List size={40} color="var(--accent)" /> View History
          </button>
          <button onClick={exportAES} style={{ backgroundColor: '#1E3A8A', color: '#FFF', padding: '32px', borderRadius: '24px', fontSize: '28px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <Share2 size={40} /> Export (AES Encrypted)
          </button>
          <button onClick={() => setView('changePin')} style={{ backgroundColor: '#333', color: '#FFF', padding: '24px', borderRadius: '24px', fontSize: '24px', fontWeight: 'bold', border: '2px dashed #93C5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <Key size={32} color="#93C5FD" /> Change PIN
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 4: HISTORY ARCHIVE ---
  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Dashboard
          </button>
          <h2 style={{ margin: 0, color: 'var(--accent)' }}>My History</h2>
        </div>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '20px', marginTop: '40px' }}>No entries found.</p>
          ) : (
            entries.map(entry => {
              const locked = (Date.now() - entry.timestamp > 86400000); // 24 hours
              return (
                <button key={entry.id} onClick={() => openExistingEntry(entry)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: entry.bgColor, padding: '20px', borderRadius: '20px', border: locked ? '2px solid #555' : '2px solid var(--accent)', textAlign: 'left' }}>
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{entry.mood}</div>
                    <div style={{ color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>{entry.dateStr}</div>
                    <div style={{ color: '#CCC', fontSize: '16px' }}>{entry.timeStr}</div>
                  </div>
                  {locked && <Clock size={28} color="#888" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 5: THE EDITOR ---
  const activeEntry = entries.find(e => e.id === activeEntryId);
  const isPast24Hours = activeEntry && (Date.now() - activeEntry.timestamp > 86400000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => { if(!isPast24Hours && entryText.trim()) saveCurrentEntry(); setView(activeEntryId ? 'history' : 'dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Back
        </button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: 'bold' }}>{activeEntryId ? activeEntry.dateStr : dateStr}</div>
          <div style={{ color: '#AAA', fontSize: '14px' }}>{activeEntryId ? activeEntry.timeStr : timeStr}</div>
        </div>
      </div>

      <div style={{ border: '2px dashed var(--accent)', borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--accent)', fontSize: '20px', fontStyle: 'italic', margin: 0 }}>
          {isPast24Hours ? "This entry is 24 hours old and securely locked." : "\"Your words matter. Take your time.\""}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', opacity: isPast24Hours ? 0.5 : 1 }}>
        {['😊', '😌', '😢', '😠', '💖'].map(m => (
          <button key={m} onClick={() => !isPast24Hours && setMood(m)} style={{ flex: 1, height: '60px', fontSize: '32px', backgroundColor: mood === m ? 'var(--accent)' : '#222', borderRadius: '14px', border: 'none' }}>{m}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', opacity: isPast24Hours ? 0.5 : 1 }}>
        {['#222222', '#3B2F2F', '#1B3B2B', '#1B2A4A', '#3B1B38'].map(c => (
          <button key={c} onClick={() => !isPast24Hours && setBgColor(c)} style={{ flex: 1, height: '50px', backgroundColor: c, borderRadius: '14px', border: bgColor === c ? '3px solid var(--accent)' : '2px solid #444' }} />
        ))}
      </div>

      <textarea 
        readOnly={isPast24Hours}
        value={entryText}
        onChange={(e) => setEntryText(e.target.value)}
        placeholder={isPast24Hours ? "Locked." : "Tap to type, or hit Dictate..."}
        style={{ flexGrow: 1, width: '100%', minHeight: '180px', backgroundColor: bgColor, color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none', marginBottom: '20px' }}
      />

      {!isPast24Hours && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={toggleDictation} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? 'var(--accent)' : '#333', border: '2px solid var(--accent)', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
            <Mic size={24} color={isListening ? '#000' : 'var(--accent)'} /> {isListening ? 'Listening...' : 'Dictate'}
          </button>
          <button onClick={saveCurrentEntry} style={{ flex: 1, backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', color: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Save size={28} />
          </button>
          <button onClick={deleteCurrentEntry} style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--error)', borderRadius: '16px', color: 'var(--error)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Trash2 size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
