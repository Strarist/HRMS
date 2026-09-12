const fs = require('fs');
const path = require('path');

const root = path.join('D:', 'HRMS', 'hrms-frontend-spc', 'src');
const toastModule = path.join(root, 'utils', 'toast.js');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(jsx?|tsx?)$/.test(entry.name) || entry.name === 'toast.js') continue;
    let content = fs.readFileSync(full, 'utf8');
    if (!content.includes("from 'react-hot-toast'") && !content.includes('from "react-hot-toast"')) {
      continue;
    }
    // Keep named imports like { Toaster } from react-hot-toast
    if (/import\s*\{[^}]+\}\s*from\s*['"]react-hot-toast['"]/.test(content) &&
        !/import\s+toast\s+from\s*['"]react-hot-toast['"]/.test(content)) {
      continue;
    }
    let rel = path.relative(path.dirname(full), toastModule).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    rel = rel.replace(/\.js$/, '');
    const next = content
      .replace(/import\s+toast\s+from\s*['"]react-hot-toast['"]/g, `import toast from '${rel}'`);
    if (next !== content) {
      fs.writeFileSync(full, next);
      console.log('updated', path.relative(root, full));
    }
  }
}

walk(root);
console.log('done');
