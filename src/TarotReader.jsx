import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Mic, Share2, Layers, BookOpen, Calendar as CalIcon } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

const TAROT_DECK = [
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

const TAROT_DECK = [...TAROT_DECK, ...MINOR_ARCANA];

export default function TarotReader({ goHome }) {
  const [view, setView] = useState('menu'); // 'menu', 'daily', 'physical'
  const [drawnCard, setDrawnCard] = useState(null);
  
  // Custom Reading State
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'menu' && goHome) goHome();
      else setView('menu');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const drawDailyCard = () => {
    const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
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
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your interpretation...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        setNotes(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } 
    finally { setIsListening(false); }
  };

  const exportReading = () => {
    let body = "";
    if (view === 'daily' && drawnCard) {
      body = `Daily Tarot Draw\nDate: ${new Date().toLocaleDateString()}\n\nCard: ${drawnCard.name}\nMeaning: ${drawnCard.meaning}\nNumerology: ${drawnCard.num}\nSign/Planet: ${drawnCard.sign}\n\nMy Thoughts:\n${notes || "No notes added."}`;
    } else if (view === 'physical' && selectedCards.length > 0) {
      body = `Physical Tarot Reading\nDate: ${readingDate}\n\nCards Pulled:\n`;
      selectedCards.forEach(c => {
        body += `- ${c.name}\n  Meaning: ${c.meaning}\n  Numerology: ${c.num} | Sign: ${c.sign}\n\n`;
      });
      body += `My Interpretation:\n${notes || "No notes added."}`;
    } else {
      return alert("Nothing to export yet.");
    }
    window.location.href = `mailto:?subject=Tarot Reading Log&body=${encodeURIComponent(body)}`;
  };

  // --- VIEW 1: DASHBOARD MENU ---
  if (view === 'menu') {
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
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Draw Daily Card</div>
              <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Pull a quick digital card for today</div>
            </div>
          </button>

          <button onClick={() => { setView('physical'); setSelectedCards([]); setNotes(''); }} style={{ backgroundColor: '#2E7D32', border: 'none', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
            <BookOpen size={48} color="#FFF" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#FFF' }}>Log Physical Reading</div>
              <div style={{ fontSize: '18px', color: '#CCC' }}>Record cards pulled from your own deck</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DAILY DIGITAL DRAW ---
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
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '16px', textTransform: 'uppercase' }}>Numerology</div>
                <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.num}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '16px', textTransform: 'uppercase' }}>Sign/Planet</div>
                <div style={{ color: '#93C5FD', fontSize: '24px', fontWeight: 'bold' }}>{drawnCard.sign}</div>
              </div>
            </div>
          </div>

          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#FFF' }}>My Interpretation:</h3>
          <textarea 
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Tap to type, or hit Dictate..."
            style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none' }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleDictation} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? 'var(--accent)' : '#333', border: '2px solid var(--accent)', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Mic size={28} color={isListening ? '#000' : 'var(--accent)'} /> {isListening ? 'Listening...' : 'Dictate'}
            </button>
            <button onClick={exportReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Share2 size={24} /> Export
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: PHYSICAL READING LOG ---
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
        <input 
          type="date" 
          value={readingDate} 
          onChange={(e) => setReadingDate(e.target.value)} 
          style={{ flexGrow: 1, backgroundColor: 'transparent', color: '#FFF', border: 'none', fontSize: '24px', outline: 'none' }}
        />
      </div>

      <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>1. Select Cards Pulled:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {TAROT_DECK.map(card => {
          const isSelected = selectedCards.some(c => c.id === card.id);
          return (
            <button key={card.id} onClick={() => togglePhysicalCard(card)} style={{ backgroundColor: isSelected ? 'var(--accent)' : '#111', color: isSelected ? '#000' : '#FFF', border: isSelected ? '2px solid var(--accent)' : '2px solid #444', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              {card.name.split(' - ')[1]} {/* Just show the name like "The Fool" for cleaner buttons */}
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
                <div style={{ display: 'flex', gap: '16px', fontSize: '16px' }}>
                  <span style={{ color: '#FFD700' }}><strong>Num:</strong> {c.num}</span>
                  <span style={{ color: '#93C5FD' }}><strong>Sign:</strong> {c.sign}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#FFF' }}>3. My Interpretation:</h3>
          <textarea 
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Tap to type, or hit Dictate..."
            style={{ width: '100%', minHeight: '160px', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '20px', border: '2px solid #555', resize: 'none', marginBottom: '20px' }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleDictation} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isListening ? 'var(--accent)' : '#333', border: '2px solid var(--accent)', borderRadius: '16px', padding: '20px', color: isListening ? '#000' : '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Mic size={28} color={isListening ? '#000' : 'var(--accent)'} /> Dictate
            </button>
            <button onClick={exportReading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Share2 size={24} /> Export Log
            </button>
          </div>
        </>
      )}
    </div>
  );
}
