import { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Save, Trash2, Share2, Plus, Lock, ChevronUp, ChevronDown, Edit3, BookOpen, History as HistoryIcon, Home, Key } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import CryptoJS from 'crypto-js';

const MOODS = ['😊', '😌', '🥺', '😡', '💖'];
const COLORS = ['#222222', '#3A2E2E', '#2A3B2A', '#1C2A3A', '#3A1C3A'];
const DATA_FILE = 'secure_journal_vault.aes';
const PIN_FILE = 'secure_journal_pin.hash';

export default function SecureJournal({ goHome }) {
  const [view, setView] = useState('auth'); 
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);
  
  const [pinInput, setPinInput] = useState('');
  const [userPin, setUserPin] = useState(null); 
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    checkPinSetup();
  }, []);

  useEffect(() => {
    
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'history' && typeof goHome === 'function') goHome();
      else if (view !== 'auth' && view !== 'setup') setView('history');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const checkPinSetup = async () => {
    try {
      await Filesystem.readFile({ path: PIN_FILE, directory: Directory.Documents, encoding: Encoding.UTF8 });
      setView('auth');
    } catch (e) {
      setView('setup');
    }
  };

  const handlePinSetup = async () => {
    if (pinInput.length < 4) { setPinError('PIN must be at least 4 digits'); return; }
    const hashed = CryptoJS.SHA256(pinInput).toString();
    await Filesystem.writeFile({ path: PIN_FILE, data: hashed, directory: Directory.Documents, encoding: Encoding.UTF8 });
    const emptyVault = CryptoJS.AES.encrypt(JSON.stringify([]), pinInput).toString();
    await Filesystem.writeFile({ path: DATA_FILE, data: emptyVault, directory: Directory.Documents, encoding: Encoding.UTF8 });
    setUserPin(pinInput);
    setView('history');
    setPinInput('');
  };

  const handleLogin = async () => {
    try {
      const { data: storedHash } = await Filesystem.readFile({ path: PIN_FILE, directory: Directory.Documents, encoding: Encoding.UTF8 });
      const inputHash = CryptoJS.SHA256(pinInput).toString();
      if (storedHash === inputHash) {
        setUserPin(pinInput);
        await loadVault(pinInput);
        setView('history');
        setPinInput('');
        setPinError('');
      } else {
        setPinError('Incorrect PIN');
        setPinInput('');
      }
    } catch (e) {
      setPinError('Authentication error');
    }
  };

  const handleChangePin = async () => {
    if (pinInput.length < 4) { setPinError('New PIN must be at least 4 digits'); return; }
    const newHash = CryptoJS.SHA256(pinInput).toString();
    await Filesystem.writeFile({ path: PIN_FILE, data: newHash, directory: Directory.Documents, encoding: Encoding.UTF8 });
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(entries), pinInput).toString();
    await Filesystem.writeFile({ path: DATA_FILE, data: encryptedData, directory: Directory.Documents, encoding: Encoding.UTF8 });
    setUserPin(pinInput);
    setView('history');
    setPinInput('');
    alert("PIN changed & Vault re-encrypted!");
  };

  const loadVault = async (key) => {
    try {
      const { data: encryptedData } = await Filesystem.readFile({ path: DATA_FILE, directory: Directory.Documents, encoding: Encoding.UTF8 });
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setEntries(decryptedData);
    } catch (e) {
      setEntries([]);
    }
  };

  const saveVault = async (newEntries) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(newEntries), userPin).toString();
    await Filesystem.writeFile({ path: DATA_FILE, data: encryptedData, directory: Directory.Documents, encoding: Encoding.UTF8 });
    setEntries(newEntries);
  };
  const createNew = () => { setActiveEntry({ id: Date.now(), timestamp: Date.now(), text: '', mood: '😊', color: '#222222' }); setView('new'); };
  const openEntry = (entry) => { setActiveEntry({ ...entry }); setView('edit'); };

  const saveEntry = async () => {
    if (!activeEntry.text.trim()) { alert("Cannot save an empty entry."); return; }
    const isNew = !entries.some(e => e.id === activeEntry.id);
    const updated = isNew ? [activeEntry, ...entries] : entries.map(e => e.id === activeEntry.id ? activeEntry : e);
    await saveVault(updated);
    setView('history');
  };

  const deleteEntry = async (id) => {
    if (window.confirm("Permanently delete this entry?")) {
      const updated = entries.filter(e => e.id !== id);
      await saveVault(updated);
      setView('history');
    }
  };

  const exportAndDelete = async (entry) => {
    if (!window.confirm("This will export the entry AS AN AES ENCRYPTED STRING and permanently erase it from this device. Continue?")) return;
    const dateStr = new Date(entry.timestamp).toLocaleString();
    const payload = JSON.stringify(entry);
    const ciphertext = CryptoJS.AES.encrypt(payload, userPin).toString();
    const body = `SECURE JOURNAL EXPORT\nDate: ${dateStr}\n\nWARNING: THIS IS AES-256 ENCRYPTED. YOU NEED YOUR PIN TO DECRYPT THIS TEXT.\n\n-----BEGIN AES MESSAGE-----\n${ciphertext}\n-----END AES MESSAGE-----`;
    window.location.href = `mailto:?subject=Encrypted Sovereign Journal Entry&body=${encodeURIComponent(body)}`;
    setTimeout(async () => {
       const updated = entries.filter(e => e.id !== entry.id);
       await saveVault(updated);
       setView('history');
    }, 1500);
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak your journal entry...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) setActiveEntry(prev => ({ ...prev, text: (prev.text + ' ' + result.matches[0]).trim() }));
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  if (view === 'auth' || view === 'setup' || view === 'change_pin') {
    const title = view === 'setup' ? "Set Fort Knox PIN" : (view === 'change_pin' ? "Enter New PIN" : "Enter PIN to Decrypt");
    const action = view === 'setup' ? handlePinSetup : (view === 'change_pin' ? handleChangePin : handleLogin);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '24px', paddingBottom: '24px', alignItems: 'center', justifyContent: 'center' }}>
        {view === 'change_pin' ? (
          <button onClick={() => setView('history')} style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={28} /> Back</button>
        ) : (
          <button onClick={goHome} style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '16px', color: '#000', fontSize: '20px', fontWeight: 'bold', border: 'none', zIndex: 50 }}><Home size={28} /> Home</button>
        )}
        <Lock size={64} color="#FF9500" style={{ marginBottom: '24px' }} />
        <h2 style={{ color: '#FFF', fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>{title}</h2>
        {pinError && <div style={{ color: '#FF3B30', fontSize: '20px', marginBottom: '12px', fontWeight: 'bold' }}>{pinError}</div>}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: pinInput.length > i ? '#FF9500' : '#333', border: '2px solid #FF9500' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '350px', width: '100%' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => setPinInput(prev => prev.length < 8 ? prev + num : prev)} style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '24px', color: '#FFF', fontSize: '40px', fontWeight: 'bold', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{num}</button>)}
          <button onClick={() => setPinInput('')} style={{ backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '24px', color: '#FF3B30', fontSize: '24px', fontWeight: 'bold', height: '90px' }}>CLR</button>
          <button onClick={() => setPinInput(prev => prev.length < 8 ? prev + '0' : prev)} style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '24px', color: '#FFF', fontSize: '40px', fontWeight: 'bold', height: '90px' }}>0</button>
          <button onClick={action} style={{ backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', height: '90px' }}>GO</button>
        </div>
      </div>
    );
  }
  const renderHistory = () => (
    <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {entries.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px' }}>Vault is empty.</p> : entries.map(entry => {
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
                {isExpanded ? <ChevronUp size={28} color="#FFF" /> : <ChevronDown size={28} color="#FFF" />}
              </div>
            </button>
            {isExpanded && (
              <div style={{ padding: '24px', borderTop: '2px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <p style={{ color: '#FFF', fontSize: '26px', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-wrap' }}>{entry.text || "Empty entry..."}</p>
                {isLocked ? (
                  <button onClick={() => exportAndDelete(entry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#112244', border: '4px solid #3B82F6', borderRadius: '24px', color: '#3B82F6', fontSize: '24px', fontWeight: 'bold', padding: '16px', padding: '20px' }}><Share2 size={32} /> AES Export & Erase</button>
                ) : (
                  <button onClick={() => openEntry(entry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '24px', padding: '16px', padding: '20px' }}><Edit3 size={32} /> Edit Entry</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const isEntryLocked = activeEntry ? (Date.now() - activeEntry.timestamp) > 8 * 60 * 60 * 1000 : false;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => { setView('auth'); setUserPin(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF3B30', padding: '16px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><Lock size={24} /> Lock</button>
        <button onClick={() => { setPinInput(''); setView('change_pin'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><Key size={24} /> Change PIN</button>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '16px', color: '#000', fontSize: '20px', fontWeight: 'bold', border: 'none' }}><Home size={24} /></button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={createNew} style={{ flex: 1, backgroundColor: view === 'new' || view === 'edit' ? '#FF9500' : '#222', color: view === 'new' || view === 'edit' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><BookOpen size={24} /> {view === 'edit' ? 'Edit Entry' : 'New Entry'}</button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><HistoryIcon size={24} /> Vault History</button>
      </div>

      {view === 'history' && renderHistory()}

      {(view === 'new' || view === 'edit') && activeEntry && (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ backgroundColor: '#111', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FF9500', margin: 0 }}>"Your words matter. Take your time."</p>
            {isEntryLocked && <p style={{ fontSize: '18px', color: '#FF3B30', margin: '12px 0 0 0', fontWeight: 'bold' }}>🔒 This entry is locked and can only be exported and erased.</p>}
          </div>

          {!isEntryLocked && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {MOODS.map(m => <button key={m} onClick={() => setActiveEntry({...activeEntry, mood: m})} style={{ fontSize: '36px', padding: '16px', backgroundColor: activeEntry.mood === m ? '#FF9500' : '#222', borderRadius: '16px', border: 'none', minWidth: '80px' }}>{m}</button>)}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {COLORS.map(c => <button key={c} onClick={() => setActiveEntry({...activeEntry, color: c})} style={{ width: '60px', height: '60px', backgroundColor: c, border: activeEntry.color === c ? '4px solid #FF9500' : '2px solid #444', borderRadius: '16px', flexShrink: 0 }} />)}
              </div>
            </>
          )}

          <textarea value={activeEntry.text} onChange={e => setActiveEntry({...activeEntry, text: e.target.value})} readOnly={isEntryLocked} placeholder="Write your heart out..." style={{ width: "100%", flexGrow: 1, minHeight: '30vh', fontSize: "32px", padding: "24px", lineHeight: "1.6", borderRadius: "24px", backgroundColor: activeEntry.color || "#222", color: "#FFF", border: "2px solid #FF9500", outline: "none", boxSizing: "border-box", resize: "none", marginBottom: "24px", opacity: isEntryLocked ? 0.8 : 1 }} />

          {!isEntryLocked ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '24px', color: isListening ? '#000' : '#FFF', fontSize: '24px', fontWeight: 'bold', padding: '16px' }}><Mic size={28} color={isListening ? '#000' : '#FF9500'} /></button>
              <button onClick={saveEntry} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', padding: '16px' }}><Save size={28} /></button>
              <button onClick={() => deleteEntry(activeEntry.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '24px', color: '#FF3B30', fontSize: '24px', fontWeight: 'bold', padding: '16px' }}><Trash2 size={28} /></button>
            </div>
          ) : (
            <button onClick={() => exportAndDelete(activeEntry)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#112244', border: '4px solid #3B82F6', borderRadius: '24px', color: '#3B82F6', fontSize: '28px', fontWeight: 'bold', padding: '20px', padding: '24px' }}><Share2 size={32} /> AES Export & Erase</button>
          )}
        </div>
      )}
    </div>
  );
}
