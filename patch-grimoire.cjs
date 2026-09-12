const fs = require('fs');
let code = fs.readFileSync('src/TarotReader.jsx', 'utf8');

// 1. Ensure all new icons are imported
code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { ArrowLeft, Sparkles, Mic, Share2, Layers, BookOpen, Calendar as CalIcon, Save, List, Clock, Search, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react';");

// 2. Extract the massive Tarot Dictionary to keep it safe
const deckMatch = code.match(/([\s\S]*?)export default function TarotReader/);
const deckDefinitions = deckMatch[1];

// 3. The completely upgraded Tarot Component with History/Search/Subject features
const newComponent = `export default function TarotReader({ goHome }) {
  const [view, setView] = useState('menu'); 
  const [drawnCard, setDrawnCard] = useState(null);
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [notes, setNotes] = useState('');
  const [readingSubject, setReadingSubject] = useState('Myself');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);
  
  // New States for Grimoire UI
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sovereign_tarot_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const drawDailyCard = () => {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomIndex = randomBuffer[0] % TAROT_DECK.length;
    
    setDrawnCard(TAROT_DECK[randomIndex]);
    setNotes('');
    setReadingSubject('Myself');
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
      subject: readingSubject || 'Myself',
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

  const deleteEntry = (id) => {
    if(window.confirm("Delete this reading permanently?")) {
      const updated = history.filter(e => e.id !== id);
      setHistory(updated);
      localStorage.setItem('sovereign_tarot_history', JSON.stringify(updated));
    }
  };

  const exportSingleEntry = (entry) => {
    let body = \`\${entry.type === 'daily' ? 'Daily Tarot Draw' : 'Physical Tarot Reading'}\\nDate: \${entry.dateStr}\\nReading For: \${entry.subject}\\n\\nCards Pulled:\\n\`;
    entry.cards.forEach(c => { body += \`- \${c.name}\\n  Meaning: \${c.meaning}\\n  Numerology: \${c.num} | Sign: \${c.sign}\\n\\n\`; });
    body += \`My Interpretation:\\n\${entry.notes || "No notes added."}\`;
    window.location.href = \`mailto:?subject=Tarot Reading Log&body=\${encodeURIComponent(body)}\`;
  };

  const filteredHistory = history.filter(entry => 
    entry.dateStr.includes(searchQuery) || 
    (entry.subject && entry.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <h2 style={{ margin: 0, color: '#FF9500', fontSize: '26px' }}>My Grimoire</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', padding: '12px 16px', borderRadius: '16px', border: '2px solid #555', marginBottom: '24px' }}>
          <Search size={24} color="#888" style={{ marginRight: '12px' }} />
          <input type="text" placeholder="Search by Date (2026...) or Name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontSize: '20px', outline: 'none', width: '100%' }} />
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '20px', marginTop: '40px' }}>No readings found.</p>
          ) : (
            filteredHistory.map(entry => (
              <div key={entry.id} style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '2px solid #FF9500', overflow: 'hidden' }}>
                <button onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#111', border: 'none', color: '#FFF' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{entry.type === 'daily' ? 'Daily Draw' : 'Physical Reading'}</span>
                    <span style={{ fontSize: '18px', color: '#AAA', marginTop: '4px' }}>{entry.dateStr}</span>
                  </div>
                  {expandedEntry === entry.id ? <ChevronUp size={32} color="#FF9500"/> : <ChevronDown size={32} color="#FF9500"/>}
                </button>

                {expandedEntry === entry.id && (
                  <div style={{ padding: '20px', borderTop: '2px solid #333' }}>
                    <div style={{ fontSize: '20px', color: '#FFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#222', padding: '12px', borderRadius: '12px' }}>
                      <User size={24} color="#FF9500"/> <strong>Reading For:</strong> {entry.subject}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {entry.cards.map(c => (
                        <div key={c.id} style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px' }}>
                          <div style={{ color: '#FF9500', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>{c.name}</div>
                          <div style={{ color: '#E0E0E0', fontSize: '18px', lineHeight: '1.4' }}>{c.meaning}</div>
                        </div>
                      ))}
                    </div>

                    {entry.notes && (
                      <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #FF9500' }}>
                        <div style={{ color: '#CCC', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Interpretation:</div>
                        <p style={{ color: '#FFF', fontSize: '20px', fontStyle: 'italic', margin: 0, lineHeight: '1.4' }}>"{entry.notes}"</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => deleteEntry(entry.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '12px', padding: '16px', color: '#FF3B30', fontSize: '20px', fontWeight: 'bold' }}>
                        <Trash2 size={24} /> Delete
                      </button>
                      <button onClick={() => exportSingleEntry(entry)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '16px', color: '#3B82F6', fontSize: '20px', fontWeight: 'bold' }}>
                        <Share2 size={24} /> Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Helper component for Subject Input
  const SubjectInput = () => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#FFF' }}>Reading For:</h3>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', padding: '12px 16px', borderRadius: '16px', border: '2px solid #555' }}>
        <User size={28} color="#FF9500" style={{ marginRight: '12px' }} />
        <input type="text" value={readingSubject} onChange={(e) => setReadingSubject(e.target.value)} placeholder="Myself, A Friend, etc..." style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontSize: '22px', width: '100%', outline: 'none' }} />
      </div>
    </div>
  );

  if (view === 'daily' || view === 'physical') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <h2 style={{ color: '#FF9500', margin: 0, fontSize: '22px' }}>{view === 'daily' ? 'Daily Draw' : 'Physical Reading'}</h2>
        </div>

        {view === 'physical' && (
          <>
            <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '20px', border: '2px solid #555', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <CalIcon size={32} color="#FF9500" />
              <input type="date" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} style={{ flexGrow: 1, backgroundColor: 'transparent', color: '#FFF', border: 'none', fontSize: '24px', outline: 'none' }} />
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>1. Select Cards Pulled:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              {TAROT_DECK.map(card => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <button key={card.id} onClick={() => togglePhysicalCard(card)} style={{ backgroundColor: isSelected ? '#FF9500' : '#111', color: isSelected ? '#000' : '#FFF', border: isSelected ? '2px solid #FF9500' : '2px solid #444', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
                    {card.name.split(' - ')[1] || card.name}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {((view === 'physical' && selectedCards.length > 0) || view === 'daily') && (
          <>
            {view === 'daily' && (
              <div style={{ backgroundColor: 'var(--surface)', border: '2px solid #FF9500', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#FF9500', fontSize: '32px', marginBottom: '16px', marginTop: 0 }}>{drawnCard.name}</h3>
                <p style={{ color: '#FFF', fontSize: '22px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{drawnCard.meaning}</p>
                <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#111', padding: '16px', borderRadius: '16px' }}>
                  <div><div style={{ color: '#888', fontSize: '16px', textTransform: 'uppercase' }}>Num</div><div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.num}</div></div>
                  <div><div style={{ color: '#888', fontSize: '16px', textTransform: 'uppercase' }}>Sign</div><div style={{ color: '#93C5FD', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.sign}</div></div>
                </div>
              </div>
            )}

            {view === 'physical' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#FFF' }}>2. Card Meanings:</h3>
                {selectedCards.map(c => (
                  <div key={c.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '16px', borderLeft: '6px solid #FF9500' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF9500', marginBottom: '8px' }}>{c.name}</div>
                    <div style={{ fontSize: '18px', color: '#E0E0E0', marginBottom: '12px' }}>{c.meaning}</div>
                  </div>
                ))}
              </div>
            )}

            <SubjectInput />

            <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>My Interpretation:</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tap to type, or hit Dictate..." style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none', marginBottom: '20px' }} />
            <button onClick={toggleDictation} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>
              <Mic size={28} color={isListening ? '#000' : '#FF9500'} /> {isListening ? 'Listening...' : 'Dictate'}
            </button>
            
            <button onClick={saveReading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Save size={28} /> Save to Grimoire
            </button>
          </>
        )}
      </div>
    );
  }

  // The Main Menu
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Home
        </button>
        <h2 style={{ color: '#FF9500', margin: 0, fontSize: '26px' }}>Tarot Workbench</h2>
      </div>
      <div style={{ backgroundColor: '#222', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
        <Sparkles size={32} color="#FF9500" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FFF', margin: 0, lineHeight: '1.4', fontFamily: 'serif' }}>
          "We partake of the High Priestess every time we read the cards."
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
        <button onClick={drawDailyCard} style={{ backgroundColor: 'var(--surface)', border: '4px solid #FF9500', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(255, 149, 0, 0.2)' }}>
          <Layers size={48} color="#FF9500" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Draw Daily Card</div><div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Pull a digital card for today</div></div>
        </button>
        <button onClick={() => { setView('physical'); setSelectedCards([]); setNotes(''); setReadingSubject('Myself'); }} style={{ backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
          <BookOpen size={48} color="#FFF" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Physical Reading</div><div style={{ fontSize: '18px', color: '#CCC' }}>Record your own deck</div></div>
        </button>
        <button onClick={() => { setView('history'); setSearchQuery(''); }} style={{ backgroundColor: '#1E3A8A', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
          <List size={48} color="#FFF" />
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>My Grimoire</div><div style={{ fontSize: '18px', color: '#CCC' }}>View past saved readings</div></div>
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/TarotReader.jsx', deckDefinitions + newComponent);
console.log("✅ Advanced Grimoire UI successfully injected!");
