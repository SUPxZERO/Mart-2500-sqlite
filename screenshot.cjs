const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  
  // Use existing session if possible, or we might be redirected to login
  await page.goto('http://127.0.0.1:8000/pos', { waitUntil: 'networkidle2' });
  
  // Check if we are on login page
  const url = page.url();
  if (url.includes('login')) {
      await page.type('#email', 'admin@example.com');
      await page.type('#password', 'password');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.goto('http://127.0.0.1:8000/pos', { waitUntil: 'networkidle2' });
  }

  await page.screenshot({ path: 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\321eb16e-0ee3-4440-97ce-abf2c91e2938\\screenshot_pos.png' });
  await browser.close();
})();
