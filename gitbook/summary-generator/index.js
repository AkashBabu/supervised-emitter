const glob = require('glob-fs')({ gitignore: true });
const files = glob.readdirSync('gitbook/**/*.md');

console.log('files:', files);

