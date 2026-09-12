const fs = require('fs');
let code = fs.readFileSync('src/BrainGames.jsx', 'utf8');

// 1. Remove the Sorter Menu Routing
code = code.replace(/if \(activeGame === 'household'\) return <HouseholdSorter goBack=\{\(\) => setActiveGame\('menu'\)} \/>;\n\s*/g, '');
code = code.replace(/if \(activeGame === 'botanical'\) return <BotanicalSorter goBack=\{\(\) => setActiveGame\('menu'\)} \/>;\n\s*/g, '');

// 2. Remove the Sorter Menu Buttons
code = code.replace(/<button onClick=\{\(\) => setActiveGame\('household'\)\}[\s\S]*?<\/button>\n\s*/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveGame\('botanical'\)\}[\s\S]*?<\/button>\n\s*/, '');

// 3. Overwrite the Old Games with the New Expanded Versions
const expandedGames = `// ==========================================
// 3. EXPANDED GAMES
// ==========================================
function WordScramble({ goBack }) {
  const WORDS = [
    'FAMILY', 'PEACE', 'HEART', 'SMILE', 'FRIEND', 'GARDEN', 'SPRING', 'WINTER', 'SUMMER', 'AUTUMN',
    'COFFEE', 'BAKING', 'PUZZLE', 'BLANKET', 'PILLOW', 'GUITAR', 'MELODY', 'RHYTHM', 'FOREST', 'STREAM',
    'CANDLE', 'LANTERN', 'MIRROR', 'WINDOW', 'JOURNAL', 'MEMORY', 'WISDOM', 'GENTLE', 'BREEZE', 'SUNSET',
    'LAUGH', 'HUG', 'COMFORT', 'HEALING', 'BEAUTY', 'NATURE', 'SUNSHINE', 'DAWN', 'TWILIGHT', 'STARLIGHT'
  ];
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const generateWord = () => {
    const target = WORDS[Math.floor(Math.random() * WORDS.length)];
    let scram = target.split('').sort(() => Math.random() - 0.5).join('');
    while (scram === target) scram = target.split('').sort(() => Math.random() - 0.5).join('');
    
    let fakes = [];
    while (fakes.length < 2) {
      const fake = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (fake !== target && !fakes.includes(fake)) fakes.push(fake);
    }
    setWord(target);
    setScrambled(scram.split('').join(' '));
    setOptions([target, ...fakes].sort(() => Math.random() - 0.5));
    setFeedback('');
  };

  useEffect(() => { generateWord(); }, []);

  const handleGuess = (guess) => { 
    if (guess === word) {
      setScore(s => s + 1); 
      generateWord(); 
    } else {
      const msgs = ["Try again!", "Don't worry, you got this!", "Almost!", "Take your time, try another."];
      setFeedback(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <div style={{ fontSize: '28px', color: '#FF9500', fontWeight: 'bold' }}>Score: {score}</div>
        <div style={{ minHeight: '34px', fontSize: '24px', color: '#FF9500', fontWeight: 'bold', textAlign: 'center', fontStyle: 'italic' }}>{feedback}</div>
        
        <div style={{ fontSize: '50px', fontWeight: 'bold', color: '#FFF', letterSpacing: '8px', textAlign: 'center', backgroundColor: '#222', padding: '32px 16px', borderRadius: '24px', width: '100%', border: '4px dashed #FF9500' }}>
          {scrambled}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '16px' }}>
          {options.map(opt => (
            <button key={opt} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#111', color: '#FFF', border: '2px solid #555', borderRadius: '20px', padding: '24px', fontSize: '32px', fontWeight: 'bold' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickMath({ goBack }) {
  const [score, setScore] = useState(0);
  const [data, setData] = useState({ q: '', ans: 0, opts: [] });
  const [feedback, setFeedback] = useState('');

  const generateQ = () => { 
    const types = ['+', '-', 'x'];
    const op = types[Math.floor(Math.random() * types.length)];
    let a, b, ans;
    
    if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; ans = a + b; }
    if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a) + 1; ans = a - b; }
    if (op === 'x') { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; ans = a * b; }
    
    let fakes = [ans + (Math.floor(Math.random() * 3) + 1), ans - (Math.floor(Math.random() * 3) + 1)];
    if (fakes[0] === fakes[1]) fakes[1] += 2; // Prevent duplicate fake answers
    
    setData({ q: \`\${a} \${op} \${b}\`, ans, opts: [ans, ...fakes].sort(() => Math.random() - 0.5) });
    setFeedback('');
  };

  useEffect(() => { generateQ(); }, []);

  const handleGuess = (guess) => { 
    if (guess === data.ans) {
      setScore(s => s + 1); 
      generateQ(); 
    } else {
      const msgs = ["Try again!", "Don't worry, you got this!", "Oops! Try another one.", "Take your time!"];
      setFeedback(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <div style={{ fontSize: '28px', color: '#FF9500', fontWeight: 'bold' }}>Score: {score}</div>
        <div style={{ minHeight: '34px', fontSize: '24px', color: '#FF9500', fontWeight: 'bold', textAlign: 'center', fontStyle: 'italic' }}>{feedback}</div>
        
        <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#FFF', backgroundColor: '#222', padding: '32px', borderRadius: '24px', border: '4px dashed #FF9500', width: '100%', textAlign: 'center' }}>
          {data.q}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '16px' }}>
          {data.opts.map((opt, i) => (
            <button key={i} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#111', color: '#FFF', border: '2px solid #555', borderRadius: '20px', padding: '24px', fontSize: '36px', fontWeight: 'bold' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

// Replace everything after placeholder comment
code = code.replace(/\/\/ ==========================================\n\/\/ 3\. PLACEHOLDERS & EXTRA GAMES\n\/\/ ==========================================[\s\S]*/, expandedGames);

fs.writeFileSync('src/BrainGames.jsx', code);
console.log("✅ Games updated! Sorters removed, Math & Words fully expanded.");
