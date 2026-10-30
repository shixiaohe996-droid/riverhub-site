const { chromium } = require('playwright-core');
const path = require('node:path');
(async () => {
  if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to an installed Chromium executable.');
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    for (const [source, output] of [['resume/index.html', 'shixiaohe-resume.pdf'], ['resume/en.html', 'shixiaohe-resume-en.pdf']]) {
      const page = await browser.newPage();
      await page.goto('file://' + path.resolve(source));
      await page.emulateMedia({ media: 'print' });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.locator('.resume-page').evaluateAll(pages => pages.map(p => ({ height: p.clientHeight, content: p.scrollHeight })));
      if (overflow.length !== 2 || overflow.some(p => p.content > p.height + 1)) throw new Error(`${source}: page overflow ${JSON.stringify(overflow)}`);
      await page.pdf({ path: path.resolve('assets', output), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
      console.log(`${output}: 2 source pages, no overflow`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
