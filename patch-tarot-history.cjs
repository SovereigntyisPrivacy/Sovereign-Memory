const fs = require('fs');
let code = fs.readFileSync('src/TarotReader.jsx', 'utf8');

// 1. Update Imports for new Icons
code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { ArrowLeft, Sparkles, Mic, Share2, Layers, BookOpen, Calendar as CalIcon, Save, List, Clock } from 'lucide-react';");

// 2. Extract the massive Tarot Dictionary to keep it safe
const deckMatch = code.match(/([\s\S]*?)export default function TarotReader/);
const deckDefinitions = deckMatch[1];

// 3. The completely upgraded Tarot Component
const newComponent = `export default function TarotReader({ goHome }) {
  const [view, setView] = useState('menu'); 
  const [drawnCard, setDrawnCard] = useState(null);
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sovereign_tarot_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'menu' && goHome) goHome();
      else setView('menu');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const drawDailyCard = () => {
    // True Cryptographic Randomness for the perfect pull
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomIndex = randomBuffer[0] % TAROT_DECK.length;
    
    setDrawnCard(TAROT_DECK[randomIndex]);
    setNotes('');
    setView('daily');
  };

  const togglePhysicalCard = (card) => {
    if (selectedCards.some(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak your interpretation...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) setNotes(prev => (prev + ' ' + result.matches[0]).trim());
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const saveReading = () => {
    if (view === 'daily' && !drawnCard) return;
    if (view === 'physical' && selectedCards.length === 0) return alert("Select cards first!");
    
    const now = new Date();
    const newEntry = {
      id: Date.now(),
      type: view,
      dateStr: view === 'physical' ? readingDate : now.toLocaleDateString(),
      timeStr: now.toLocaleTimeString(),
      cards: view === 'daily' ? [drawnCard] : selectedCards,
      notes: notes
    };
    const updatedHistory = [newEntry, ...history];
    localStorage.setItem('sovereign_tarot_history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    alert("Reading secured in your Grimoire!");
    setView('history');
  };

  const exportReading = () => {
    let body = "";
    if (view === 'daily' && drawnCard) {
      body = \`Daily Tarot Draw\\nDate: \${new Date().toLocaleDateString()}\\n\\nCard: \${drawnCard.name}\\nMeaning: \${drawnCard.meaning}\\nNumerology: \${drawnCard.num}\\nSign/Planet: \${drawnCard.sign}\\n\\nMy Thoughts:\\n\${notes || "No notes added."}\`;
    } else if (view === 'physical' && selectedCards.length > 0) {
      body = \`Physical Tarot Reading\\nDate: \${readingDate}\\n\\nCards Pulled:\\n\`;
      selectedCards.forEach(c => { body += \`- \${c.name}\\n  Meaning: \${c.meaning}\\n  Numerology: \${c.num} | Sign: \${c.sign}\\n\\n\`; });
      body += \`My Interpretation:\\n\${notes || "No notes added."}\`;
    } else { return alert("Nothing to export yet."); }
    window.location.href = \`mailto:?subject=Tarot Reading Log&body=\${encodeURIComponent(body)}\`;
  };

  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '26px' }}>My Grimoire</h2>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '20px', marginTop: '40px' }}>No readings saved yet.</p>
          ) : (
            history.map(entry => (
              <div key={entry.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '20px', border: '2px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
                  <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '20px' }}>{entry.type === 'daily' ? 'Daily Draw' : 'Physical Reading'}</span>
                  <span style={{ color: '#CCC', fontSize: '18px' }}>{entry.dateStr}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {entry.cards.map(c => <span key={c.id} style={{ backgroundColor: '#222', padding: '8px 12px', borderRadius: '8px', color: 'var(--accent)', fontWeight: 'bold' }}>{c.name.split(' - ')[1] || c.name}</span>)}
                </div>
                {entry.notes && <p style={{ color: '#E0E0E0', fontSize: '18px', fontStyle: 'italic', margin: 0 }}>"{entry.notes}"</p>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'daily') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--accent)', fontSize: '32px', marginBottom: '16px', marginTop: 0 }}>{drawnCard.name}</h3>
            <p style={{ color: '#FFF', fontSize: '22px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{drawnCard.meaning}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#111', padding: '16px', borderRadius: '16px' }}>
              <div><div style={{ color: 'var(--text-muted)', fontSize: '16px', textTransform: 'uppercase' }}>Numerology</div><div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.num}</div></div>
              <div><div style={{ color: 'var(--text-muted)', fontSize: '16px', textTransform: 'uppercase' }}>Sign/Element</div><div style={{ color: '#93C5FD', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.sign}</div></div>
            </div>
          </div>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#FFF' }}>My Interpretation:</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tap to type, or hit Dictate..." style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none' }} />
          <button onClick={toggleDictation} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? 'var(--accent)' : '#333', border: '2px solid var(--accent)', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            <Mic size={28} color={isListening ? '#000' : 'var(--accent)'} /> {isListening ? 'Listening...' : 'Dictate'}
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={saveReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
              <Save size={24} /> Save
            </button>
            <button onClick={exportReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#1E3A8A', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
              <Share2 size={24} /> Export
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'physical') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '22px' }}>Physical Reading</h2>
        </div>
        <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '20px', border: '2px solid #555', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CalIcon size={32} color="var(--accent)" />
          <input type="date" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} style={{ flexGrow: 1, backgroundColor: 'transparent', color: '#FFF', border: 'none', fontSize: '24px', outline: 'none' }} />
        </div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>1. Select Cards Pulled:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {TAROT_DECK.map(card => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            return (
              <button key={card.id} onClick={() => togglePhysicalCard(card)} style={{ backgroundColor: isSelected ? 'var(--accent)' : '#111', color: isSelected ? '#000' : '#FFF', border: isSelected ? '2px solid var(--accent)' : '2px solid #444', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
                {card.name.split(' - ')[1] || card.name}
              </button>
            );
          })}
        </div>
        {selectedCards.length > 0 && (
          <>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>2. Card Meanings:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {selectedCards.map(c => (
                <div key={c.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '16px', borderLeft: '6px solid var(--accent)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '8px' }}>{c.name}</div>
                  <div style={{ fontSize: '18px', color: '#E0E0E0', marginBottom: '12px' }}>{c.meaning}</div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '16px' }}><span style={{ color: '#FFD700' }}><strong>Num:</strong> {c.num}</span><span style={{ color: '#93C5FD' }}><strong>Sign/Element:</strong> {c.sign}</span></div>
                </div>
              ))}
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>3. My Interpretation:</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tap to type, or hit Dictate..." style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none', marginBottom: '20px' }} />
            <button onClick={toggleDictation} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? 'var(--accent)' : '#333', border: '2px solid var(--accent)', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>
              <Mic size={28} color={isListening ? '#000' : 'var(--accent)'} /> {isListening ? 'Listening...' : 'Dictate'}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
                <Save size={24} /> Save
              </button>
              <button onClick={exportReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#1E3A8A', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
                <Share2 size={24} /> Export
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Home
        </button>
        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '26px' }}>Tarot Workbench</h2>
      </div>
      <div style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)', border: '2px dashed #93C5FD', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
        <Sparkles size={32} color="#93C5FD" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FFF', margin: 0, lineHeight: '1.4', fontFamily: 'serif' }}>
          "We partake of the High Priestess every time we read the cards."
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
        <button onClick={drawDailyCard} style={{ backgroundColor: 'var(--surface)', border: '4px solid var(--accent)', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2)' }}>
          <Layers size={48} color="var(--accent)" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Draw Daily Card</div><div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Pull a digital card for today</div></div>
        </button>
        <button onClick={() => { setView('physical'); setSelectedCards([]); setNotes(''); }} style={{ backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
          <BookOpen size={48} color="#FFF" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Log Physical Reading</div><div style={{ fontSize: '18px', color: '#CCC' }}>Record cards from your own deck</div></div>
        </button>
        <button onClick={() => setView('history')} style={{ backgroundColor: '#1E3A8A', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
          <List size={48} color="#FFF" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>My Grimoire</div><div style={{ fontSize: '18px', color: '#CCC' }}>View past saved readings</div></div>
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/TarotReader.jsx', deckDefinitions + newComponent);
console.log("✅ Tarot History, Save buttons, and Crypto Randomness injected!");
