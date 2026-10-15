// Runs automatically on `npm version <patch|minor|major>`.
// Copies the version from package.json into the page footer.
const fs = require('fs');
const { version } = require('../package.json');
const file = __dirname + '/../index.html';
const html = fs.readFileSync(file, 'utf8');
const out = html.replace(/(<span id="app-version">)[^<]*(<\/span>)/, `$1${version}$2`);
fs.writeFileSync(file, out);
console.log('Page footer set to v' + version);
