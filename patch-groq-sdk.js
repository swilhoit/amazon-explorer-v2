const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'node_modules/groq-sdk/core.mjs');

let content = fs.readFileSync(filePath, 'utf8');

// Remove all existing process-related imports and declarations
content = content.replace(/import\s+process\s+from\s+['"]process\/browser['"];?/g, '');
content = content.replace(/import\s+processPolyfill\s+from\s+['"]process['"];?/g, '');
content = content.replace(/const\s+process\s*=[\s\S]*?;/g, '');

// Add our new process import and declaration at the top of the file
const newContent = `
import processPolyfill from 'process';
const process = typeof window !== 'undefined' ? (window.process || processPolyfill) : processPolyfill;

${content.trim()}
`;

fs.writeFileSync(filePath, newContent);

console.log('groq-sdk patched successfully');
console.log('Patched content:', newContent);