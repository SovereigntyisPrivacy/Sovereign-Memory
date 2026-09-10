import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Mic, Plus, ArrowLeft, Mail, Delete, Trash2 } from 'lucide-react';
import CryptoJS from 'crypto-js';

const MOTIVATION = [
  "You've got this.",
  "Don't give up.",
  "I believe in you.",
  "If you can't believe in yourself, believe in the me that believes in you.",
  "Your words matter. Take your time.",
  "I am so proud of you.",
  "Every day is a new page."
];

const COLORS = ['#FFFFFF', '#FFD54F', '#81C784', '#64B5F6', '#F48FB1'];
const EMOJIS = ['😊', '😌', '😢', '😡', '❤️', '🌟'];

export default function SecureJournal() {
  const [isLocked, setIsLocked] = useState(true);
  const [pinMode, setPinMode] = useState('login');
  const [pinInput, setPinInput] = useState('');
  const [errorPulse, setErrorPulse] = useState(false);
  
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null); 
  const [quote, setQuote] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const savedCipher = localStorage.getItem('sovereign_journal_aes');
    if (!savedCipher) setPinMode('setup');
  }, []);

  const triggerError = () => {
    setErrorPulse(true);
    setPinInput('');
    setTimeout(() => setErrorPulse(false), 500);
  };

  const unlockJournal = () => {
    if (pinMode === 'setup') {
      if (pinInput.length !== 4) return triggerError();
      const initialData = CryptoJS.AES.encrypt(JSON.stringify([]), pinInput).toString();
      localStorage.setItem('sovereign_journal_aes', initialData);
      setEntries([]);
      setIsLocked(false);
      return;
    }
    try {
      const savedCipher = localStorage.getItem('sovereign_journal_aes');
      const bytes = CryptoJS.AES.decrypt(savedCipher, pinInput);
      const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setEntries(decrypted);
      setIsLocked(false);
    } catch (error) {
      triggerError();
    }
  };

  const handlePinTap = (num) => { if (pinInput.length < 4) setPinInput(pinInput + num); };

  const persistEntries = (list) => {
    const cipherText = CryptoJS.AES.encrypt(JSON.stringify(list), pinInput).toString();
    localStorage.setItem('sovereign_journal_aes', cipherText);
    setEntries(list);
  };

  const updateActiveEntry = (field, value) => {
    const updated = entries.map(e => e.id === activeEntryId ? { ...e, [field]: value } : e);
    persistEntries(updated);
  };

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    persistEntries(updated);
    setActiveEntryId(null);
  };

  const createNewEntry = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      text: '',
      color: '#FFFFFF',
      emoji: '😊',
      exported: false // Protects new entries from being deleted tomorrow
    };
    const updatedList = [newEntry, ...entries];
    persistEntries(updatedList);
    setQuote(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    setActiveEntryId(newEntry.id);
  };

  const openEntry = (id) => {
    setQuote("Reviewing your thoughts...");
    setActiveEntryId(id);
  };

  // THE EXPORT SAFEGUARD
  const exportToEmail = () => {
    if (entries.length === 0) return;
    let text = "My Private Journal Backup\n\n";
    
    // Mark all current entries as successfully exported
    const updatedEntries = entries.map(e => {
      text += `--- ${e.date} ${e.emoji || ''} ---\n${e.text}\n\n`;
      return { ...e, exported: true };
    });
    
    persistEntries(updatedEntries);
    window.location.href = `mailto:?subject=Journal Backup&body=${encodeURIComponent(text)}`;
  };

  const toggleDictation = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setEntries(prevEntries => {
           const active = prevEntries.find(e => e.id === activeEntryId);
           const newText = active.text ? active.text + ' ' + transcript.trim() : transcript.trim();
           const updated = prevEntries.map(e => e.id === activeEntryId ? { ...e, text: newText } : e);
           const cipherText = CryptoJS.AES.encrypt(JSON.stringify(updated), pinInput).toString();
           localStorage.setItem('sovereign_journal_aes', cipherText);
           return updated;
        });
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Please use keyboard dictation.");
    }
  };

  if (isLocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Lock size={64} color="var(--accent)" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>{pinMode === 'setup' ? 'Create a 4-Digit PIN' : 'Enter Your PIN'}</h2>
          <div style={{ fontSize: '64px', letterSpacing: '16px', height: '100px', color: 'var(--text-main)', transform: errorPulse ? 'translateX(-10px)' : 'translateX(0)', transition: 'transform 0.1s' }}>
            {pinInput.padEnd(4, '_').split('').map((char, i) => <span key={i}>{char === '_' ? '_' : '*'}</span>)}
          </div>
          {pinInput.length === 4 && <button className="primary-btn" onClick={unlockJournal} style={{ marginTop: '24px', padding: '16px 40px', justifyContent: 'center' }}><Unlock size={28} /> Unlock</button>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => <button key={num} onClick={() => handlePinTap(num)} style={{ height: '80px', justifyContent: 'center', fontSize: '40px', backgroundColor: '#333' }}>{num}</button>)}
          <button onClick={() => setPinInput(pinInput.slice(0, -1))} style={{ height: '80px', justifyContent: 'center', backgroundColor: 'var(--error)' }}><Delete size={36} color="#000" /></button>
          <button onClick={() => handlePinTap(0)} style={{ height: '80px', justifyContent: 'center', fontSize: '40px', backgroundColor: '#333' }}>0</button>
          <div />
        </div>
      </div>
    );
  }

  const activeEntry = entries.find(e => e.id === activeEntryId);
  
  // LOGIC TO PROTECT OLD JOURNALS
  const isToday = activeEntry ? activeEntry.date.startsWith(new Date().toLocaleDateString()) : false;
  const canDelete = activeEntry ? (activeEntry.exported || isToday) : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      
      {!activeEntryId && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button className="primary-btn" onClick={createNewEntry} style={{ flex: 2, justifyContent: 'center' }}><Plus size={28} /> New Entry</button>
            <button onClick={exportToEmail} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#333', border: '2px solid var(--accent)' }}><Mail size={28} color="var(--accent)" /> Export</button>
          </div>
          <button onClick={() => { setIsLocked(true); setPinInput(''); }} style={{ marginBottom: '24px', justifyContent: 'center', backgroundColor: 'var(--surface)', color: 'var(--error)' }}><Lock size={24} /> Lock Journal Now</button>

          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Your journal is empty.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  onClick={() => openEntry(entry.id)}
                  style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '2px solid #444', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px', color: 'var(--accent)' }}>{entry.date}</span>
                    <span style={{ fontSize: '36px' }}>{entry.emoji || '📝'}</span>
                  </div>
                  <p style={{ fontSize: '24px', color: entry.color || '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.text || "No text yet..."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeEntryId && activeEntry && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-color)', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={() => setActiveEntryId(null)} style={{ width: 'auto', padding: '16px 24px', backgroundColor: '#333', border: 'none', borderRadius: '16px' }}>
              <ArrowLeft size={28} /> Back
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: 'bold' }}>{activeEntry.date.split(' ')[0]}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '16px' }}>{activeEntry.date.split(' ').slice(1).join(' ')}</div>
            </div>
            
            {/* CONDITIONAL TRASH CAN */}
            {canDelete ? (
              <button onClick={() => deleteEntry(activeEntry.id)} style={{ width: 'auto', padding: '16px', backgroundColor: 'transparent', border: '2px solid var(--error)', borderRadius: '16px', color: 'var(--error)' }}>
                <Trash2 size={28} />
              </button>
            ) : (
              <div style={{ width: '64px' }} /> /* Invisible spacer to keep the date perfectly centered */
            )}
          </div>

          <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', border: '2px dashed var(--accent)' }}>
            <p style={{ fontSize: '22px', color: 'var(--accent)', fontStyle: 'italic' }}>"{quote}"</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {EMOJIS.map(emo => (
              <button key={emo} onClick={() => updateActiveEntry('emoji', emo)} style={{ minWidth: '70px', height: '70px', fontSize: '40px', backgroundColor: activeEntry.emoji === emo ? 'var(--accent)' : 'var(--surface)', padding: '0', justifyContent: 'center', borderRadius: '16px', border: 'none' }}>
                {emo}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            {COLORS.map(col => (
              <button key={col} onClick={() => updateActiveEntry('color', col)} style={{ minWidth: '70px', height: '70px', backgroundColor: col, border: activeEntry.color === col ? '6px solid var(--accent)' : '2px solid #555', padding: '0', borderRadius: '16px' }} />
            ))}
          </div>

          <textarea 
            value={activeEntry.text}
            onChange={(e) => updateActiveEntry('text', e.target.value)}
            placeholder="Tap to type, or hit Dictate to speak your mind..."
            style={{ flexGrow: 1, padding: '24px', fontSize: '28px', borderRadius: '24px', backgroundColor: 'var(--surface)', color: activeEntry.color || '#FFF', border: 'none', marginBottom: '24px', resize: 'none', lineHeight: '1.5', minHeight: '250px' }}
          />

          <button onClick={toggleDictation} style={{ height: '100px', flexShrink: 0, backgroundColor: isListening ? 'var(--error)' : 'var(--surface)', border: isListening ? 'none' : '4px solid var(--accent)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '32px' }}>
            <Mic size={40} color={isListening ? '#000' : 'var(--accent)'} />
            <span style={{ color: isListening ? '#000' : '#FFF', fontWeight: 'bold' }}>
              {isListening ? 'Listening... Tap to stop' : 'Tap to Dictate'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
