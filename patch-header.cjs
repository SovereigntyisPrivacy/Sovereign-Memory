const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const newHeader = `<div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '16px' }}>
          <Shield size={64} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '40px', fontWeight: '900', margin: 0, color: '#FFF', letterSpacing: '1px' }}>Sovereign Memory</h1>
          <p style={{ fontSize: '20px', color: 'var(--accent)', marginTop: '12px', fontStyle: 'italic', lineHeight: '1.4', padding: '0 10px' }}>
            "I love you mom. I hope this app brings joy back to the things you love" 💖
          </p>
        </div>`;

// Safely replaces the generic header with your custom one
code = code.replace(/<div style=\{\{ textAlign: 'center', marginBottom: '24px' \}\}>[\s\S]*?<\/div>/, newHeader);

fs.writeFileSync('src/App.jsx', code);
console.log("✅ Custom title and beautiful message successfully restored!");
