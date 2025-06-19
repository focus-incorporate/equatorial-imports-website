const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blacklist']
  });
  
  const page = await browser.newPage();
  
  console.log('📱 Navigating to homepage...');
  await page.goto('http://localhost:3001', { 
    waitUntil: 'networkidle0',
    timeout: 15000 
  });
  
  console.log('⏱️  Waiting for 3D scene to initialize...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check WebGL context
  const webglInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'No canvas found';
    
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!ctx) return 'No WebGL context';
    
    return {
      vendor: ctx.getParameter(ctx.VENDOR),
      renderer: ctx.getParameter(ctx.RENDERER),
      version: ctx.getParameter(ctx.VERSION),
      canvasSize: canvas.width + 'x' + canvas.height
    };
  });
  
  console.log('🎮 WebGL Info:', JSON.stringify(webglInfo, null, 2));
  
  // Monitor GLB loading
  const responses = [];
  page.on('response', response => {
    if (response.url().includes('.glb')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 'unknown'
      });
    }
  });
  
  // Wait for GLB files to load
  console.log('🔄 Waiting for GLB models to load...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('📁 GLB Loading Results:');
  responses.forEach(resp => {
    console.log(`  - ${resp.url.split('/').pop()}: ${resp.status} (${resp.size} bytes)`);
  });
  
  // Take multiple screenshots to capture animation
  console.log('📸 Capturing screenshots of enhanced coffee beans...');
  
  for (let i = 1; i <= 4; i++) {
    await page.screenshot({ 
      path: `enhanced-coffee-beans-${i}.png`,
      fullPage: false
    });
    console.log(`✅ Screenshot ${i}/4 saved - Scale 2.5x with enhanced lighting`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Check for 3D elements in DOM
  const threeElements = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const groups = document.querySelectorAll('[data-testid*="three"], group, mesh');
    
    return {
      canvasPresent: !!canvas,
      canvasVisible: canvas ? getComputedStyle(canvas).display !== 'none' : false,
      threeElementsCount: groups.length,
      canvasDimensions: canvas ? {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight
      } : null
    };
  });
  
  console.log('🎨 3D Scene Status:', JSON.stringify(threeElements, null, 2));
  
  await browser.close();
  console.log('✅ Enhanced GLB coffee beans testing completed!');
  console.log('The coffee beans should now be 2.5x larger and much more visible with enhanced lighting!');
})();