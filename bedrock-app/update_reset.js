const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages/tarot');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf-8');
  
  // Replace `onPress={() => setShowDrawModal(true)}` with `onPress={reset}`
  if (content.match(/onPress=\{\(\)\s*=>\s*setShowDrawModal\(true\)\}/g)) {
    content = content.replace(/onPress=\{\(\)\s*=>\s*setShowDrawModal\(true\)\}/g, 'onPress={reset}');
    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated ' + file);
  }
});
