const fs = require('fs');
const path = require('path');
const groups = require('./options.dev/groups');

console.log('Creating dist/groups.js...');

const outputPath = path.resolve(path.join(__dirname, 'dist'), 'groups.js');

let content = 'fbDevInterest.ALL_GROUPS = ';
content += JSON.stringify(groups.map(g => g.id).sort(), null, 2);
content += ';'

fs.writeFileSync(outputPath, content);
