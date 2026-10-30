const { chromium } = require('playwright-core');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765';
const output = process.env.QA_OUTPUT || '/tmp/riverhub-review';
const results = [];
(async () => {
  if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to an installed Chromium executable.');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    for (const width of [1180, 768, 390]) for (const lang of ['', 'en/']) {
      const context = await browser.newContext({ viewport: { width, height: 757 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      await page.route('https://**', route => route.abort()); // Analytics and external sites are outside this local regression.
      await page.goto(base + '/' + lang, { waitUntil: 'networkidle' });
      const initial = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, services: document.querySelector('#services').offsetTop }));
      assert(initial.width <= width, `${lang} ${width}: horizontal page overflow`);
      assert.equal(await page.locator('.featured-grid .work').count(), 3);
      const order = await page.locator('.featured-grid .work').evaluateAll(cards => cards.every(card => card.querySelector('.work-shot').getBoundingClientRect().top < card.querySelector('.work-body').getBoundingClientRect().top));
      assert(order, 'Every case image should precede its text');
      // Load lazy images before checking pixels or taking a full-page screenshot.
      await page.locator('img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      const broken = await page.locator('img').evaluateAll(imgs => imgs.filter(img => !img.naturalWidth).map(img => img.src));
      assert.deepEqual(broken, [], 'Images must resolve');
      await page.screenshot({ path: path.join(output, `home-${lang ? 'en' : 'zh'}-${width}.png`), fullPage: true });
      const lightAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      if (lightAudit.violations.length) results.push({ width, lang, theme: 'light', accessibility: lightAudit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
      const captionsFit = await page.locator('.work-shot .cover-caption').evaluateAll(captions => captions.length === 5 && captions.every(c => c.getBoundingClientRect().bottom <= c.parentElement.getBoundingClientRect().bottom + 1));
      assert(captionsFit, 'Every project must have a visible concept caption');
      const coversFit = await page.locator('.work-shot img').evaluateAll(imgs => imgs.every(img => {
        const box = img.getBoundingClientRect();
        return Math.abs(box.width / box.height - img.naturalWidth / img.naturalHeight) < .01;
      }));
      assert(coversFit, 'Project covers must retain their full landscape composition');
      const theme = await page.locator('html').getAttribute('data-theme');
      await page.locator('#theme-toggle').click();
      assert.notEqual(await page.locator('html').getAttribute('data-theme'), theme);
      assert.equal(await page.evaluate(() => localStorage.getItem('theme')), 'dark');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      if (axe.violations.length) results.push({ width, lang, accessibility: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
      await page.locator('img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      if (width === 1180) await page.screenshot({ path: path.join(output, `home-${lang ? 'en' : 'zh'}-dark.png`), fullPage: true });
      await page.locator('#theme-toggle').click();
      if (width < 1100) {
        const menu = page.locator('#mobile-menu-toggle');
        await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        assert(await menu.evaluate(el => el === document.activeElement));
        await menu.click(); await page.locator('.nav-link[href="#services"]').click();
        assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        assert.equal(new URL(page.url()).hash, '#services');
      }
      // Exercise actual clipboard when supported by the browser, plus a deterministic denial case.
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const copy = page.locator('.btn-copy-contact').first();
      const copyValue = await copy.getAttribute('data-copy');
      await copy.click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), copyValue);
      assert.match(await page.locator('#toast').innerText(), /Copied|已复制/);
      await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('test permission denied')) }));
      await copy.click();
      await page.waitForFunction(() => !/Copied|已复制/.test(document.querySelector('#toast').textContent));
      assert((await page.locator('#toast').innerText()).includes(copyValue));
      if (!lang) {
        const details = page.locator('.tech-details');
        assert.equal(await details.getAttribute('open'), null);
        assert.equal(await page.locator('#terminal-input').isVisible(), false);
        await details.locator('summary').click();
        assert(await page.locator('#terminal-input').isVisible());
        const tab = page.locator('.topo-node').first(); await tab.focus(); await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('.topo-node').nth(1).getAttribute('aria-selected'), 'true');
        await page.locator('#terminal-input').fill('help'); await page.locator('#terminal-input').press('Enter');
        await page.waitForFunction(() => document.querySelector('#terminal-logs-list').textContent.includes('Available commands'));
        await page.locator('.cmd-chip[data-cmd="clear"]').click();
        await page.waitForFunction(() => document.querySelector('#terminal-logs-list').textContent.includes('TERMINAL CLEARED'));
        await details.locator('summary').click();
        assert.equal(await page.locator('#terminal-input').isVisible(), false);
        await page.goto(base + '/#terminal', { waitUntil: 'networkidle' });
        assert(await page.locator('#terminal-input').isVisible(), 'Direct deep link opens details');
        await page.locator('.hero-cta a[href="#work"]').click();
        await page.goBack(); assert.equal(new URL(page.url()).hash, '#terminal');
      }
      // Primary local navigation and browser history.
      await page.goto(base + '/' + lang);
      await page.locator('.hero-cta a[href="#work"]').click(); assert.equal(new URL(page.url()).hash, '#work');
      await page.locator('.work-links a[href="/work/ciftopay/"]').click();
      assert.equal(new URL(page.url()).pathname, '/work/ciftopay/');
      await page.goBack(); assert.equal(new URL(page.url()).hash, '#work');
      const pdf = await context.request.get(base + (lang ? '/assets/shixiaohe-resume-en.pdf' : '/assets/shixiaohe-resume.pdf'));
      assert.equal(pdf.status(), 200); assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
      assert.deepEqual(errors, [], `${lang} ${width}: runtime/local network errors`);
      results.push({ width, lang: lang || 'zh', ...initial, interactions: 'passed', images: 'passed', runtime: 'passed' });
      await context.close();
      console.log(`${lang || 'zh'} ${width}px: layout, images, theme, menu, clipboard, navigation and applicable demos passed`);
    }
    for (const mode of ['disabled', 'blocked']) for (const lang of ['', 'en/']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled', viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      if (mode === 'blocked') await page.route('**/main.js*', r => r.abort());
      await page.route('https://**', r => r.abort());
      await page.goto(base + '/' + lang);
      assert.equal(await page.locator('.hero-copy').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert(await page.locator('.hero-cta a[href="#work"]').isVisible());
      assert(await page.locator('.nav-link[href="#work"]').isVisible());
      await page.locator('.nav-link[href="#work"]').click(); assert.equal(new URL(page.url()).hash, '#work');
      if (!lang) {
        await page.locator('.tech-details > summary').click(); assert(await page.locator('#terminal-input').isVisible());
      }
      results.push({ mode, lang: lang || 'zh', fallback: 'passed' }); await context.close();
    }
    // Every secondary HTML route loads with the shared CSS, JS and local icon sprite.
    const paths = fs.readdirSync('.', { recursive: true }).filter(p => p.endsWith('.html') && !p.startsWith('node_modules/') && !['index.html', 'en/index.html'].includes(p));
    for (const route of paths) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.route('https://**', r => r.abort());
      const response = await page.goto(base + '/' + route, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200); assert.deepEqual(errors, []);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(width <= 390, `${route}: mobile overflow ${width}`);
      await page.close();
    }
    results.push({ secondaryPages: paths.length, status: 'passed' });
  } finally { await browser.close(); fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2)); }
  const violations = results.filter(r => r.accessibility);
  if (violations.length) { console.error('Accessibility findings saved in browser-results.json'); process.exitCode = 1; }
})().catch(error => { console.error(error); process.exitCode = 1; });
