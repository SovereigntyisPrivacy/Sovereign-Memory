const fs = require('fs');
let code = fs.readFileSync('src/TarotReader.jsx', 'utf8');

const minorCode = `
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
`;

if (!code.includes('MINOR_ARCANA')) {
  code = code.replace(/export default function TarotReader/, minorCode + "\nexport default function TarotReader");
  code = code.replaceAll('MAJOR_ARCANA', 'TAROT_DECK');
  fs.writeFileSync('src/TarotReader.jsx', code);
  console.log("✅ 56 Minor Arcana successfully injected!");
}
