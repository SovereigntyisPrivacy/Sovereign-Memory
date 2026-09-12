const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Inject the Import
if (!code.includes("import TarotReader")) {
  code = code.replace(/(import.*?['"];\n)/, "$1import TarotReader from './TarotReader';\n");
}

// 2. Inject the Button under Numerology
if (!code.includes("setActiveTab('tarot')")) {
  const tarotButton = `\n        <button onClick={() => setActiveTab('tarot')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginBottom: '16px' }}>
          <span style={{ color: 'var(--accent)', fontSize: '32px' }}>🃏</span> Tarot Reader
        </button>`;
  code = code.replace(/(<button[^>]*onClick={\(\) => setActiveTab\('numerology'\)}[^>]*>.*?<\/button>)/is, "$1" + tarotButton);
}

// 3. Inject the Render Logic
if (!code.includes("activeTab === 'tarot'")) {
  code = code.replace(/(\{activeTab === 'numerology'.*?\})/is, "$1\n      {activeTab === 'tarot' && <TarotReader goHome={() => setActiveTab('home')} />}");
}

fs.writeFileSync('src/App.jsx', code);
console.log("✅ Tarot successfully added to Dashboard!");
