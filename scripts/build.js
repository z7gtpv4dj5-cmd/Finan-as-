// Compila src/app.jsx -> app.bundle.js (ES5, JSX -> React.createElement)
const fs = require('fs');
const path = require('path');
const ts = require(process.env.TS_PATH || 'typescript');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/app.jsx'), 'utf8');
const out = ts.transpileModule(src, {
  fileName: 'app.jsx',
  reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES5, jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, allowJs: true, ignoreDeprecations: '6.0', removeComments: false },
});
if (out.diagnostics && out.diagnostics.length) {
  out.diagnostics.forEach((d) => console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n')));
  process.exit(1);
}
fs.writeFileSync(path.join(root, 'app.bundle.js'), out.outputText);
console.log('app.bundle.js', out.outputText.length, 'bytes');
