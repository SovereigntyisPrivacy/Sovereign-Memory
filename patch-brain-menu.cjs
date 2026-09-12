const fs = require('fs');
let code = fs.readFileSync('src/BrainGames.jsx', 'utf8');

// Ensure the necessary icons are imported
if (!code.includes('Type, Hash')) {
  code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { Home, Copy, Music, Grid as GridIcon, Leaf, Volume2, Play, Settings, Type, Hash, ArrowLeft } from 'lucide-react';");
}

// Add the routing logic
if (!code.includes('activeGame === \'words\'')) {
  code = code.replace(/if \(activeGame === 'botanical'\) return <BotanicalSorter goBack=\{\(\) => setActiveGame\('menu'\)} \/>;/, "if (activeGame === 'botanical') return <BotanicalSorter goBack={() => setActiveGame('menu')} />;\n  if (activeGame === 'words') return <WordScramble goBack={() => setActiveGame('menu')} />;\n  if (activeGame === 'math') return <QuickMath goBack={() => setActiveGame('menu')} />;\n");
}

// Add the buttons to the menu
const extraButtons = `
        <button onClick={() => setActiveGame('words')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Type size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Word Scramble</div>
        </button>
        <button onClick={() => setActiveGame('math')} style={{ backgroundColor: '#222', borderRadius: '16px', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px', border: 'none' }}>
          <Hash size={36} color="#FF9500" />
          <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold' }}>Quick Math</div>
        </button>
      </div>`;

if (!code.includes('Word Scramble')) {
  code = code.replace(/<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/, "</button>" + extraButtons + "\n    </div>\n  );\n}");
}

// Add the Game Components at the bottom
const gameComponents = `
function WordScramble({ goBack }) {
  const WORDS = [{ s: 'L I M A Y F', a: 'FAMILY', opts: ['FAMILY', 'FILMY', 'FLAME'] }, { s: 'E A C E P', a: 'PEACE', opts: ['PACE', 'PEACE', 'PIECE'] }, { s: 'E H R A T', a: 'HEART', opts: ['EARTH', 'HEART', 'HEAT'] }];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleGuess = (guess) => { if (guess === WORDS[idx].a) setScore(s => s + 1); setIdx((idx + 1) % WORDS.length); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '24px', color: '#FF9500' }}>Score: {score}</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFF', letterSpacing: '4px', textAlign: 'center' }}>{WORDS[idx].s}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {WORDS[idx].opts.map(opt => <button key={opt} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#222', color: '#FFF', border: '2px solid #FF9500', borderRadius: '20px', padding: '24px', fontSize: '28px', fontWeight: 'bold' }}>{opt}</button>)}
        </div>
      </div>
    </div>
  );
}

function QuickMath({ goBack }) {
  const [score, setScore] = useState(0);
  const generateQ = () => { const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1; const ans = a + b; return { q: \`\${a} + \${b}\`, ans, opts: [ans, ans + 1, ans - 2].sort(() => Math.random() - 0.5) }; };
  const [data, setData] = useState(generateQ());

  const handleGuess = (guess) => { if (guess === data.ans) setScore(s => s + 1); setData(generateQ()); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px', borderRadius: '12px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>← Back to Games</button>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
        <div style={{ fontSize: '24px', color: '#FF9500' }}>Score: {score}</div>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#FFF' }}>{data.q}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%' }}>
          {data.opts.map((opt, i) => <button key={i} onClick={() => handleGuess(opt)} style={{ backgroundColor: '#222', color: '#FFF', border: '2px solid #FF9500', borderRadius: '20px', padding: '32px 0', fontSize: '32px', fontWeight: 'bold' }}>{opt}</button>)}
        </div>
      </div>
    </div>
  );
}
`;

if (!code.includes('function WordScramble')) {
  fs.writeFileSync('src/BrainGames.jsx', code + "\n" + gameComponents);
} else {
  fs.writeFileSync('src/BrainGames.jsx', code);
}
console.log("✅ Brain Games fully merged!");
