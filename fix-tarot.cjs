const fs = require('fs');
let code = fs.readFileSync('src/TarotReader.jsx', 'utf8');

// 1. Revert the top declaration back to MAJOR_ARCANA so they don't collide
code = code.replace('const TAROT_DECK = [', 'const MAJOR_ARCANA = [');

// 2. Fix the merge line at the bottom to properly combine Major and Minor
code = code.replace('const TAROT_DECK = [...TAROT_DECK, ...MINOR_ARCANA];', 'const TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];');

fs.writeFileSync('src/TarotReader.jsx', code);
console.log("✅ Tarot syntax error fixed!");
