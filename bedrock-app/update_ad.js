const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages/tarot');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && !['money.tsx', 'compatibility.tsx', 'horoscope.tsx'].includes(f));

for (const f of files) {
    const fullPath = path.join(dir, f);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. handleStartDraw 에서 canDraw 체크 제거
    content = content.replace(
        /const handleStartDraw = \(\) => \{\n\s*if \(!canDraw\) \{\n\s*setShowDrawModal\(true\);\n\s*return;\n\s*\}\n\s*setStep\('([^']+)'\);\n\s*\};/,
        `const handleStartDraw = () => {\n    setStep('$1');\n  };\n\n  const proceedToResult = (cards: any[]) => {\n    setStep('result');\n    recordDraw();\n    generateReading ? generateReading(cards) : (fetchReading ? fetchReading(cards) : null);\n  };`
    );

    // 2. handleCardSelect 에서 canDraw 체크 추가
    content = content.replace(
        /const cards = getRandomCards\(([\d]+)\);\n\s*setDrawnCards\(cards\);\n\s*setStep\('result'\);\n\s*recordDraw\(\);\n\s*([a-zA-Z]+)\(cards\);/g,
        `const cards = getRandomCards($1);\n        setDrawnCards(cards);\n        if (!canDraw) {\n          setShowDrawModal(true);\n        } else {\n          proceedToResult(cards);\n        }`
    );

    // 3. DrawAgainModal 의 onDrawAgain 속성 변경
    content = content.replace(
        /onDrawAgain=\{?\(\) => \{\s*setShowDrawModal\(false\);\s*grantExtraDraw\(\);\s*reset\(\);\s*\}\}?/g,
        `onDrawAgain={() => { setShowDrawModal(false); grantExtraDraw(); proceedToResult(drawnCards); }}`
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${f}`);
}
