import { useState, useEffect } from 'react';
import {  ArrowLeft, Sparkles, Mic, Share2, Layers, BookOpen, Calendar as CalIcon, Save, List, Clock, Search, Trash2, ChevronDown, ChevronUp, User  } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

const MAJOR_ARCANA = [
  { id: 0, name: "0 - The Fool", num: 0, sign: "Uranus (Air)", meaning: "New beginnings, spontaneity, and a leap of faith into the unknown." },
  { id: 1, name: "I - The Magician", num: 1, sign: "Mercury", meaning: "Manifestation, resourcefulness, and utilizing your inner power." },
  { id: 2, name: "II - The High Priestess", num: 2, sign: "Moon", meaning: "Intuition, sacred knowledge, and the divine feminine mysteries." },
  { id: 3, name: "III - The Empress", num: 3, sign: "Venus", meaning: "Abundance, nurturing, nature, and motherly love." },
  { id: 4, name: "IV - The Emperor", num: 4, sign: "Aries", meaning: "Structure, stability, rules, and fatherly authority." },
  { id: 5, name: "V - The Hierophant", num: 5, sign: "Taurus", meaning: "Spiritual wisdom, tradition, and seeking guidance." },
  { id: 6, name: "VI - The Lovers", num: 6, sign: "Gemini", meaning: "Love, harmony, relationships, and values alignment." },
  { id: 7, name: "VII - The Chariot", num: 7, sign: "Cancer", meaning: "Control, willpower, success, and moving forward." },
  { id: 8, name: "VIII - Strength", num: 8, sign: "Leo", meaning: "Courage, persuasion, influence, and inner compassion." },
  { id: 9, name: "IX - The Hermit", num: 9, sign: "Virgo", meaning: "Soul-searching, introspection, and inner guidance." },
  { id: 10, name: "X - Wheel of Fortune", num: 1, sign: "Jupiter", meaning: "Karma, life cycles, destiny, and turning points. (10 reduces to 1)" },
  { id: 11, name: "XI - Justice", num: 2, sign: "Libra", meaning: "Fairness, truth, cause and effect, and law. (11 reduces to 2)" },
  { id: 12, name: "XII - The Hanged Man", num: 3, sign: "Neptune (Water)", meaning: "Pause, surrender, letting go, and new perspectives. (12 reduces to 3)" },
  { id: 13, name: "XIII - Death", num: 4, sign: "Scorpio", meaning: "Endings, change, transformation, and transition. (13 reduces to 4)" },
  { id: 14, name: "XIV - Temperance", num: 5, sign: "Sagittarius", meaning: "Balance, moderation, patience, and purpose. (14 reduces to 5)" },
  { id: 15, name: "XV - The Devil", num: 6, sign: "Capricorn", meaning: "Shadow self, attachment, addiction, and restriction. (15 reduces to 6)" },
  { id: 16, name: "XVI - The Tower", num: 7, sign: "Mars", meaning: "Sudden upheaval, broken pride, and revelation. (16 reduces to 7)" },
  { id: 17, name: "XVII - The Star", num: 8, sign: "Aquarius", meaning: "Hope, faith, purpose, renewal, and spirituality. (17 reduces to 8)" },
  { id: 18, name: "XVIII - The Moon", num: 9, sign: "Pisces", meaning: "Illusion, fear, anxiety, subconscious, and intuition. (18 reduces to 9)" },
  { id: 19, name: "XIX - The Sun", num: 1, sign: "Sun", meaning: "Positivity, fun, warmth, success, and vitality. (19 reduces to 1)" },
  { id: 20, name: "XX - Judgement", num: 2, sign: "Pluto (Fire)", meaning: "Rebirth, inner calling, and absolution. (20 reduces to 2)" },
  { id: 21, name: "XXI - The World", num: 3, sign: "Saturn (Earth)", meaning: "Completion, integration, accomplishment, and travel. (21 reduces to 3)" }
];


const MINOR_ARCANA = [
  { id: 22, name: "Ace of Wands", num: 1, sign: "Fire", meaning: "Inspiration, new opportunities, growth, and potential." },
  { id: 23, name: "Two of Wands", num: 2, sign: "Fire", meaning: "Future planning, progress, decisions, and discovery." },
  { id: 24, name: "Three of Wands", num: 3, sign: "Fire", meaning: "Preparation, foresight, enterprise, and expansion." },
  { id: 25, name: "Four of Wands", num: 4, sign: "Fire", meaning: "Celebration, joy, harmony, relaxation, and homecoming." },
  { id: 26, name: "Five of Wands", num: 5, sign: "Fire", meaning: "Conflict, disagreements, competition, and tension." },
  { id: 27, name: "Six of Wands", num: 6, sign: "Fire", meaning: "Success, public recognition, progress, and self-confidence." },
  { id: 28, name: "Seven of Wands", num: 7, sign: "Fire", meaning: "Challenge, competition, protection, and perseverance." },
  { id: 29, name: "Eight of Wands", num: 8, sign: "Fire", meaning: "Movement, fast paced change, action, and alignment." },
  { id: 30, name: "Nine of Wands", num: 9, sign: "Fire", meaning: "Resilience, courage, persistence, and test of faith." },
  { id: 31, name: "Ten of Wands", num: 10, sign: "Fire", meaning: "Burden, extra responsibility, hard work, and completion." },
  { id: 32, name: "Page of Wands", num: 11, sign: "Fire", meaning: "Inspiration, ideas, discovery, and limitless potential." },
  { id: 33, name: "Knight of Wands", num: 12, sign: "Fire", meaning: "Energy, passion, inspired action, and adventure." },
  { id: 34, name: "Queen of Wands", num: 13, sign: "Fire", meaning: "Courage, confidence, independence, and social butterfly." },
  { id: 35, name: "King of Wands", num: 14, sign: "Fire", meaning: "Natural-born leader, vision, entrepreneur, and honor." },

  { id: 36, name: "Ace of Cups", num: 1, sign: "Water", meaning: "Love, new relationships, compassion, and creativity." },
  { id: 37, name: "Two of Cups", num: 2, sign: "Water", meaning: "Unified love, partnership, mutual attraction, and harmony." },
  { id: 38, name: "Three of Cups", num: 3, sign: "Water", meaning: "Celebration, friendship, creativity, and collaborations." },
  { id: 39, name: "Four of Cups", num: 4, sign: "Water", meaning: "Meditation, contemplation, apathy, and reevaluation." },
  { id: 40, name: "Five of Cups", num: 5, sign: "Water", meaning: "Regret, failure, disappointment, and pessimism." },
  { id: 41, name: "Six of Cups", num: 6, sign: "Water", meaning: "Revisiting the past, childhood memories, innocence, and joy." },
  { id: 42, name: "Seven of Cups", num: 7, sign: "Water", meaning: "Opportunities, choices, wishful thinking, and illusion." },
  { id: 43, name: "Eight of Cups", num: 8, sign: "Water", meaning: "Disappointment, abandonment, withdrawal, and escapism." },
  { id: 44, name: "Nine of Cups", num: 9, sign: "Water", meaning: "Contentment, satisfaction, gratitude, and wish come true." },
  { id: 45, name: "Ten of Cups", num: 10, sign: "Water", meaning: "Divine love, blissful relationships, harmony, and alignment." },
  { id: 46, name: "Page of Cups", num: 11, sign: "Water", meaning: "Creative opportunities, intuitive messages, curiosity, and possibility." },
  { id: 47, name: "Knight of Cups", num: 12, sign: "Water", meaning: "Creativity, romance, charm, imagination, and beauty." },
  { id: 48, name: "Queen of Cups", num: 13, sign: "Water", meaning: "Compassionate, caring, emotionally stable, intuitive, and in flow." },
  { id: 49, name: "King of Cups", num: 14, sign: "Water", meaning: "Emotionally balanced, compassionate, diplomatic, and supportive." },

  { id: 50, name: "Ace of Swords", num: 1, sign: "Air", meaning: "Breakthroughs, new ideas, mental clarity, and success." },
  { id: 51, name: "Two of Swords", num: 2, sign: "Air", meaning: "Difficult decisions, weighing up options, an impasse, and avoidance." },
  { id: 52, name: "Three of Swords", num: 3, sign: "Air", meaning: "Heartbreak, emotional pain, sorrow, grief, and hurt." },
  { id: 53, name: "Four of Swords", num: 4, sign: "Air", meaning: "Rest, relaxation, meditation, contemplation, and recuperation." },
  { id: 54, name: "Five of Swords", num: 5, sign: "Air", meaning: "Conflict, disagreements, competition, defeat, and winning at all costs." },
  { id: 55, name: "Six of Swords", num: 6, sign: "Air", meaning: "Transition, change, rite of passage, and releasing baggage." },
  { id: 56, name: "Seven of Swords", num: 7, sign: "Air", meaning: "Betrayal, deception, getting away with something, and acting strategically." },
  { id: 57, name: "Eight of Swords", num: 8, sign: "Air", meaning: "Negative thoughts, self-imposed restriction, imprisonment, and victim mentality." },
  { id: 58, name: "Nine of Swords", num: 9, sign: "Air", meaning: "Anxiety, worry, fear, depression, and nightmares." },
  { id: 59, name: "Ten of Swords", num: 10, sign: "Air", meaning: "Painful endings, deep wounds, betrayal, loss, and crisis." },
  { id: 60, name: "Page of Swords", num: 11, sign: "Air", meaning: "New ideas, curiosity, thirst for knowledge, and new ways of communicating." },
  { id: 61, name: "Knight of Swords", num: 12, sign: "Air", meaning: "Ambitious, action-oriented, driven to succeed, and fast-thinking." },
  { id: 62, name: "Queen of Swords", num: 13, sign: "Air", meaning: "Independent, unbiased judgement, clear boundaries, and direct communication." },
  { id: 63, name: "King of Swords", num: 14, sign: "Air", meaning: "Mental clarity, intellectual power, authority, and truth." },

  { id: 64, name: "Ace of Pentacles", num: 1, sign: "Earth", meaning: "A new financial or career opportunity, manifestation, and abundance." },
  { id: 65, name: "Two of Pentacles", num: 2, sign: "Earth", meaning: "Multiple priorities, time management, prioritization, and adaptability." },
  { id: 66, name: "Three of Pentacles", num: 3, sign: "Earth", meaning: "Teamwork, collaboration, learning, and implementation." },
  { id: 67, name: "Four of Pentacles", num: 4, sign: "Earth", meaning: "Saving money, security, conservatism, scarcity, and control." },
  { id: 68, name: "Five of Pentacles", num: 5, sign: "Earth", meaning: "Financial loss, poverty, isolation, worry, and illness." },
  { id: 69, name: "Six of Pentacles", num: 6, sign: "Earth", meaning: "Giving, receiving, sharing wealth, generosity, and charity." },
  { id: 70, name: "Seven of Pentacles", num: 7, sign: "Earth", meaning: "Long-term view, sustainable results, perseverance, and investment." },
  { id: 71, name: "Eight of Pentacles", num: 8, sign: "Earth", meaning: "Apprenticeship, repetitive tasks, mastery, and skill development." },
  { id: 72, name: "Nine of Pentacles", num: 9, sign: "Earth", meaning: "Abundance, luxury, self-sufficiency, and financial independence." },
  { id: 73, name: "Ten of Pentacles", num: 10, sign: "Earth", meaning: "Wealth, financial security, family, long-term success, and contribution." },
  { id: 74, name: "Page of Pentacles", num: 11, sign: "Earth", meaning: "Manifestation, financial opportunity, skill development, and earthly beginnings." },
  { id: 75, name: "Knight of Pentacles", num: 12, sign: "Earth", meaning: "Hard work, productivity, routine, conservatism, and method." },
  { id: 76, name: "Queen of Pentacles", num: 13, sign: "Earth", meaning: "Nurturing, practical, providing financially, and a working parent." },
  { id: 77, name: "King of Pentacles", num: 14, sign: "Earth", meaning: "Wealth, business, leadership, security, discipline, and abundance." }
];

const TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export default function TarotReader({ goHome }) {
  const [view, setView] = useState('menu'); 
  const [drawnCard, setDrawnCard] = useState(null);
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [notes, setNotes] = useState('');
  const [readingSubject, setReadingSubject] = useState('Myself');
  const [readingQuestion, setReadingQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sovereign_tarot_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const getDerivedElement = (name) => {
    if (!name) return '?';
    const n = name.toLowerCase();
    if (n.includes('wands')) return 'Fire';
    if (n.includes('cups')) return 'Water';
    if (n.includes('swords')) return 'Air';
    if (n.includes('pentacles') || n.includes('coins')) return 'Earth';
    const fireMajors = ['emperor', 'strength', 'wheel', 'temperance', 'tower', 'sun', 'judgement'];
    const waterMajors = ['priestess', 'chariot', 'hanged', 'death', 'moon'];
    const airMajors = ['fool', 'magician', 'lovers', 'justice', 'star'];
    const earthMajors = ['empress', 'hierophant', 'hermit', 'devil', 'world'];
    if (fireMajors.some(m => n.includes(m))) return 'Fire';
    if (waterMajors.some(m => n.includes(m))) return 'Water';
    if (airMajors.some(m => n.includes(m))) return 'Air';
    if (earthMajors.some(m => n.includes(m))) return 'Earth';
    return '?'; 
  };

  const getTrueAstrology = (card) => {
    if (card.sign && !['Fire', 'Water', 'Earth', 'Air'].includes(card.sign)) return card.sign;
    const n = card.name.toLowerCase();
    if (n.includes('ace ') || n.includes('page ') || n.includes('knight ') || n.includes('queen ') || n.includes('king ')) return null;
    let num = '';
    if (n.includes('two') || n.includes(' 2')) num = '2';
    if (n.includes('three') || n.includes(' 3')) num = '3';
    if (n.includes('four') || n.includes(' 4')) num = '4';
    if (n.includes('five') || n.includes(' 5')) num = '5';
    if (n.includes('six') || n.includes(' 6')) num = '6';
    if (n.includes('seven') || n.includes(' 7')) num = '7';
    if (n.includes('eight') || n.includes(' 8')) num = '8';
    if (n.includes('nine') || n.includes(' 9')) num = '9';
    if (n.includes('ten') || n.includes(' 10')) num = '10';
    let suit = '';
    if (n.includes('wand')) suit = 'Wands';
    if (n.includes('cup')) suit = 'Cups';
    if (n.includes('sword')) suit = 'Swords';
    if (n.includes('pentacle') || n.includes('coin')) suit = 'Pentacles';
    const key = num + ' of ' + suit;
    const DECAN_MAP = {
      "2 of Wands": "Mars in Aries", "3 of Wands": "Sun in Aries", "4 of Wands": "Venus in Aries",
      "5 of Wands": "Saturn in Leo", "6 of Wands": "Jupiter in Leo", "7 of Wands": "Mars in Leo",
      "8 of Wands": "Mercury in Sagittarius", "9 of Wands": "Moon in Sagittarius", "10 of Wands": "Saturn in Sagittarius",
      "2 of Cups": "Venus in Cancer", "3 of Cups": "Mercury in Cancer", "4 of Cups": "Moon in Cancer",
      "5 of Cups": "Mars in Scorpio", "6 of Cups": "Sun in Scorpio", "7 of Cups": "Venus in Scorpio",
      "8 of Cups": "Saturn in Pisces", "9 of Cups": "Jupiter in Pisces", "10 of Cups": "Mars in Pisces",
      "2 of Swords": "Moon in Libra", "3 of Swords": "Saturn in Libra", "4 of Swords": "Jupiter in Libra",
      "5 of Swords": "Venus in Aquarius", "6 of Swords": "Mercury in Aquarius", "7 of Swords": "Moon in Aquarius",
      "8 of Swords": "Jupiter in Gemini", "9 of Swords": "Mars in Gemini", "10 of Swords": "Sun in Gemini",
      "2 of Pentacles": "Jupiter in Capricorn", "3 of Pentacles": "Mars in Capricorn", "4 of Pentacles": "Sun in Capricorn",
      "5 of Pentacles": "Mercury in Taurus", "6 of Pentacles": "Moon in Taurus", "7 of Pentacles": "Saturn in Taurus",
      "8 of Pentacles": "Sun in Virgo", "9 of Pentacles": "Venus in Virgo", "10 of Pentacles": "Mercury in Virgo"
    };
    return DECAN_MAP[key] || null;
  };
  const drawDailyCard = () => {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    setDrawnCard(TAROT_DECK[randomBuffer[0] % TAROT_DECK.length]);
    setNotes(''); setReadingSubject('Myself'); setReadingQuestion('Daily Draw Focus'); setView('daily');
  };

  const togglePhysicalCard = (card) => {
    if (selectedCards.some(c => c.id === card.id)) setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    else setSelectedCards([...selectedCards, card]);
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) setNotes(prev => (prev + ' ' + result.matches[0]).trim());
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const saveReading = () => {
    if (view === 'daily' && !drawnCard) return;
    if (view === 'physical' && selectedCards.length === 0) return alert("Select cards first!");
    const now = new Date();
    const newEntry = {
      id: Date.now(), type: view, subject: readingSubject || 'Myself', question: readingQuestion || '',
      dateStr: view === 'physical' ? readingDate : now.toLocaleDateString(), timeStr: now.toLocaleTimeString(),
      cards: view === 'daily' ? [drawnCard] : selectedCards, notes: notes
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
    let body = `${entry.type === 'daily' ? 'Daily Tarot Draw' : 'Physical Tarot Reading'}\nDate: ${entry.dateStr}\nReading For: ${entry.subject}\n`;
    if (entry.question) body += `Question/Focus: ${entry.question}\n`;
    body += `\nCards Pulled:\n`;
    entry.cards.forEach(c => { 
      const el = c.element || getDerivedElement(c.name);
      const astro = getTrueAstrology(c);
      const displayNum = c.num !== undefined && c.num !== null ? c.num : '?';
      body += `- ${c.name}\n  Meaning: ${c.meaning}\n  Numerology: ${displayNum}`;
      if (astro) body += ` | Astrology: ${astro}`;
      body += ` | Element: ${el}\n\n`; 
    });
    body += `My Interpretation:\n${entry.notes || "No notes added."}`;
    window.location.href = `mailto:?subject=Tarot Reading Log&body=${encodeURIComponent(body)}`;
  };

  const exportCurrentReading = () => {
    if (view === 'daily' && !drawnCard) return;
    if (view === 'physical' && selectedCards.length === 0) return alert("Select cards first!");
    const cardsToExport = view === 'daily' ? [drawnCard] : selectedCards;
    let body = `${view === 'daily' ? 'Daily Tarot Draw' : 'Physical Tarot Reading'}\nDate: ${view === 'physical' ? readingDate : new Date().toLocaleDateString()}\nReading For: ${readingSubject || 'Myself'}\n`;
    if (readingQuestion) body += `Question/Focus: ${readingQuestion}\n`;
    body += `\nCards Pulled:\n`;
    cardsToExport.forEach(c => { 
      const el = c.element || getDerivedElement(c.name);
      const astro = getTrueAstrology(c);
      const displayNum = c.num !== undefined && c.num !== null ? c.num : '?';
      body += `- ${c.name}\n  Meaning: ${c.meaning}\n  Numerology: ${displayNum}`;
      if (astro) body += ` | Astrology: ${astro}`;
      body += ` | Element: ${el}\n\n`;
    });
    body += `My Interpretation:\n${notes || "No notes added."}`;
    window.location.href = `mailto:?subject=Tarot Reading Log&body=${encodeURIComponent(body)}`;
  };

  const filteredHistory = history.filter(entry => 
    entry.dateStr.includes(searchQuery) || 
    (entry.subject && entry.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.question && entry.question.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const MetadataTags = ({ card }) => {
    const el = card.element || getDerivedElement(card.name);
    const astro = getTrueAstrology(card);
    const displayNum = card.num !== undefined && card.num !== null ? card.num : '?';
    return (
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>NUM</span><span style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>{displayNum}</span></div>
        {astro && <div style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>ASTROLOGY</span><span style={{ color: '#93C5FD', fontSize: '16px', fontWeight: 'bold' }}>{astro}</span></div>}
        <div style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>ELEMENT</span><span style={{ color: '#4ADE80', fontSize: '16px', fontWeight: 'bold' }}>{el}</span></div>
      </div>
    );
  };
  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
          <h2 style={{ margin: 0, color: '#FF9500', fontSize: '26px' }}>My Grimoire</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', padding: '12px 16px', borderRadius: '16px', border: '2px solid #555', marginBottom: '24px' }}>
          <Search size={24} color="#888" style={{ marginRight: '12px' }} />
          <input type="text" placeholder="Search Readings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontSize: '20px', outline: 'none', width: '100%' }} />
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredHistory.length === 0 ? <p style={{ textAlign: 'center', color: '#888', fontSize: '20px' }}>No readings found.</p> : filteredHistory.map(entry => (
              <div key={entry.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '16px', border: '2px solid #FF9500', overflow: 'hidden' }}>
                <button onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#111', border: 'none', color: '#FFF' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{entry.type === 'daily' ? 'Daily Draw' : 'Physical Reading'}</span>
                    <span style={{ fontSize: '18px', color: '#AAA', marginTop: '4px' }}>{entry.dateStr}</span>
                  </div>
                  {expandedEntry === entry.id ? <ChevronUp size={32} color="#FF9500"/> : <ChevronDown size={32} color="#FF9500"/>}
                </button>
                {expandedEntry === entry.id && (
                  <div style={{ padding: '20px', borderTop: '2px solid #333' }}>
                    <div style={{ fontSize: '20px', color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#222', padding: '12px', borderRadius: '12px' }}><User size={24} color="#FF9500"/> <strong>For:</strong> {entry.subject}</div>
                    {entry.question && <div style={{ fontSize: '20px', color: '#FFF', marginBottom: '20px', backgroundColor: '#222', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #93C5FD' }}><strong style={{ color: '#93C5FD' }}>Focus:</strong><br/><span style={{ fontStyle: 'italic' }}>"{entry.question}"</span></div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {entry.cards.map(c => (
                        <div key={c.id} style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #FF9500' }}>
                          <div style={{ color: '#FF9500', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>{c.name}</div>
                          <div style={{ color: '#E0E0E0', fontSize: '18px' }}>{c.meaning}</div>
                          <MetadataTags card={c} />
                        </div>
                      ))}
                    </div>
                    {entry.notes && <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #FFD700' }}><div style={{ color: '#CCC', fontSize: '18px', fontWeight: 'bold' }}>Interpretation:</div><p style={{ color: '#FFF', fontSize: '20px', fontStyle: 'italic', margin: 0 }}>"{entry.notes}"</p></div>}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => deleteEntry(entry.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '12px', padding: '16px', color: '#FF3B30', fontSize: '20px', fontWeight: 'bold' }}><Trash2 size={24} /> Delete</button>
                      <button onClick={() => exportSingleEntry(entry)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '16px', color: '#3B82F6', fontSize: '20px', fontWeight: 'bold' }}><Share2 size={24} /> Export</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px', overflowY: 'auto' }}>
      {view === 'menu' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Home</button>
            <h2 style={{ color: '#FF9500', margin: 0, fontSize: '26px' }}>Tarot</h2>
          </div>
          <div style={{ backgroundColor: '#222', border: '2px dashed #FF9500', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
            <Sparkles size={32} color="#FF9500" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '24px', fontStyle: 'italic', color: '#FFF', margin: 0, fontFamily: 'serif' }}>"We partake of the High Priestess every time we read the cards."</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
            <button onClick={drawDailyCard} style={{ backgroundColor: '#1E1E1E', border: '4px solid #FF9500', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}><Layers size={48} color="#FF9500" /><div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Daily Card</div><div style={{ fontSize: '18px', color: '#AAA' }}>Pull a digital card</div></div></button>
            <button onClick={() => { setView('physical'); setSelectedCards([]); setNotes(''); setReadingSubject('Myself'); setReadingQuestion(''); }} style={{ backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}><BookOpen size={48} color="#FFF" /><div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Physical Reading</div><div style={{ fontSize: '18px', color: '#CCC' }}>Record your deck</div></div></button>
            <button onClick={() => { setView('history'); setSearchQuery(''); }} style={{ backgroundColor: '#1E3A8A', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}><List size={48} color="#FFF" /><div style={{ textAlign: 'left' }}><div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>My Grimoire</div><div style={{ fontSize: '18px', color: '#CCC' }}>View past readings</div></div></button>
          </div>
        </>
      )}

      {(view === 'daily' || view === 'physical') && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}><ArrowLeft size={24} /> Back</button>
            <h2 style={{ color: '#FF9500', margin: 0, fontSize: '22px' }}>{view === 'daily' ? 'Daily Draw' : 'Physical Reading'}</h2>
          </div>

          {view === 'physical' && (
            <>
              <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '20px', border: '2px solid #555', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}><Calendar size={32} color="#FF9500" /><input type="date" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} style={{ flexGrow: 1, backgroundColor: 'transparent', color: '#FFF', border: 'none', fontSize: '24px', outline: 'none' }} /></div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#FFF' }}>Question / Focus (Optional):</h3>
              <input type="text" value={readingQuestion} onChange={(e) => setReadingQuestion(e.target.value)} placeholder="e.g. Focus for today?" style={{ width: '100%', backgroundColor: '#222', border: '2px solid #555', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '16px', marginBottom: '24px', outline: 'none', boxSizing: 'border-box' }} />
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>1. Select Cards Pulled:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                {TAROT_DECK.map(card => {
                  const isSelected = selectedCards.some(c => c.id === card.id);
                  return <button key={card.id} onClick={() => togglePhysicalCard(card)} style={{ backgroundColor: isSelected ? '#FF9500' : '#111', color: isSelected ? '#000' : '#FFF', border: isSelected ? '2px solid #FF9500' : '2px solid #444', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold', minHeight: '80px' }}>{card.name.split(' - ')[1] || card.name}</button>;
                })}
              </div>
            </>
          )}

          {view === 'daily' && (
             <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#FFF' }}>Question / Focus (Optional):</h3>
                <input type="text" value={readingQuestion} onChange={(e) => setReadingQuestion(e.target.value)} placeholder="Daily Draw Focus" style={{ width: '100%', backgroundColor: '#222', border: '2px solid #555', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '16px', outline: 'none', boxSizing: 'border-box' }} />
             </div>
          )}

          {((view === 'physical' && selectedCards.length > 0) || view === 'daily') && (
            <>
              {view === 'daily' && drawnCard && (
                <div style={{ backgroundColor: '#1E1E1E', border: '2px solid #FF9500', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: '#FF9500', fontSize: '32px', marginBottom: '16px', marginTop: 0 }}>{drawnCard.name}</h3>
                  <p style={{ color: '#FFF', fontSize: '22px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{drawnCard.meaning}</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><MetadataTags card={drawnCard} /></div>
                </div>
              )}

              {view === 'physical' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#FFF' }}>2. Card Meanings:</h3>
                  {selectedCards.map(c => (
                    <div key={c.id} style={{ backgroundColor: '#1E1E1E', padding: '20px', borderRadius: '16px', borderLeft: '6px solid #FF9500' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF9500', marginBottom: '8px' }}>{c.name}</div>
                      <div style={{ fontSize: '18px', color: '#E0E0E0', marginBottom: '12px' }}>{c.meaning}</div>
                      <MetadataTags card={c} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#FFF' }}>Reading For:</h3>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', padding: '12px 16px', borderRadius: '16px', border: '2px solid #555' }}><User size={28} color="#FF9500" style={{ marginRight: '12px' }} /><input type="text" value={readingSubject} onChange={(e) => setReadingSubject(e.target.value)} placeholder="Myself, Friend..." style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontSize: '22px', width: '100%', outline: 'none' }} /></div>
              </div>

              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>My Interpretation:</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tap to type, or hit Dictate..." style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />
              <button onClick={toggleDictation} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}><Mic size={28} color={isListening ? '#000' : '#FF9500'} /> {isListening ? 'Listening...' : 'Dictate'}</button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button onClick={exportCurrentReading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}><Share2 size={28} /> Export Full Reading</button>
                <button onClick={saveReading} style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: '2px solid #555', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}><Save size={24} /> Save to Grimoire</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
