const { HtmlValidate } = require('html-validate');
const fs = require('node:fs');
const validator = new HtmlValidate({ elements: ['html5'], rules: {
  'close-order': 'error', 'no-dup-id': 'error', 'element-permitted-content': 'error',
  'element-required-attributes': 'error', 'void-content': 'error', 'attr-quotes': 'error', 'no-dup-attr': 'error'
} });
(async () => {
  const files = fs.readdirSync('.', { recursive: true }).filter(p => p.endsWith('.html') && !p.split('/').some(s => s === 'node_modules' || s === '.git'));
  let errors = 0;
  for (const file of files) {
    const report = await validator.validateFile(file);
    for (const result of report.results) for (const m of result.messages) {
      console.error(`${file}:${m.line}:${m.column} ${m.ruleId}: ${m.message}`);
      errors++;
    }
  }
  console.log(`HTML: ${files.length} pages, ${errors} errors`);
  if (errors) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
