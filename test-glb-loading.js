const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testGLBLoading() {
  console.log('🧪 Testing GLB Coffee Bean Loading...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Track network requests
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    if (request.url().includes('.glb')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
      console.log(`📥 GLB Request: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('.glb')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        timestamp: Date.now()
      });
      console.log(`📦 GLB Response: ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  // Track console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      timestamp: Date.now()
    });
    
    // Log relevant console messages
    if (text.includes('GLB') || text.includes('Three') || text.includes('GLTF') || text.includes('coffee') || text.includes('error') || text.includes('warn')) {
      console.log(`📝 Console [${msg.type()}]: ${text}`);
    }
  });
  
  try {
    console.log('🌍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for potential 3D content to load
    console.log('⏳ Waiting 15 seconds for GLB models to load...');
    await page.waitForTimeout(15000);
    
    // Take screenshot of initial state
    const screenshotDir = path.join(__dirname, 'test-results', 'glb-tests');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: path.join(screenshotDir, `${timestamp}-homepage-with-glb.png`),
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${timestamp}-homepage-with-glb.png`);
    
    // Check for canvas element (indicates 3D scene)
    const canvasCount = await page.evaluate(() => {
      return document.querySelectorAll('canvas').length;
    });
    
    // Check for Three.js errors
    const threeJSErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && (
        msg.text.includes('Three') || 
        msg.text.includes('GLTF') || 
        msg.text.includes('GLB') ||
        msg.text.includes('WebGL')
      )
    );
    
    // Analyze results
    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        pageLoaded: true,
        canvasElementsFound: canvasCount,
        glbRequestsFound: requests.length,
        glbResponsesSuccessful: responses.filter(r => r.status === 200).length,
        glbRequestsFailed: responses.filter(r => r.status !== 200).length,
        threeJSErrors: threeJSErrors.length,
        totalConsoleMessages: consoleMessages.length
      },
      glbRequests: requests,
      glbResponses: responses,
      consoleErrors: threeJSErrors,
      allConsoleMessages: consoleMessages.filter(msg => 
        msg.text.includes('GLB') || 
        msg.text.includes('Three') || 
        msg.text.includes('GLTF') ||
        msg.text.includes('error') ||
        msg.text.includes('warn')
      )
    };
    
    // Save detailed report
    fs.writeFileSync(
      path.join(screenshotDir, `${timestamp}-glb-test-report.json`),
      JSON.stringify(report, null, 2)
    );
    
    // Generate readable report
    console.log('\n📊 GLB LOADING TEST RESULTS:');
    console.log('═══════════════════════════════════');
    console.log(`✅ Page loaded: ${report.testResults.pageLoaded}`);
    console.log(`🎨 Canvas elements found: ${report.testResults.canvasElementsFound}`);
    console.log(`📥 GLB requests made: ${report.testResults.glbRequestsFound}`);
    console.log(`✅ GLB responses successful: ${report.testResults.glbResponsesSuccessful}`);
    console.log(`❌ GLB requests failed: ${report.testResults.glbRequestsFailed}`);
    console.log(`⚠️  Three.js errors: ${report.testResults.threeJSErrors}`);
    
    console.log('\n📁 GLB FILES REQUESTED:');
    requests.forEach(req => {
      const response = responses.find(res => res.url === req.url);
      const status = response ? response.status : 'No response';
      const size = response && response.size ? `${Math.round(response.size / 1024)}KB` : 'Unknown size';
      console.log(`  • ${req.url} - Status: ${status} - Size: ${size}`);
    });
    
    if (threeJSErrors.length > 0) {
      console.log('\n❌ THREE.JS ERRORS FOUND:');
      threeJSErrors.forEach(error => {
        console.log(`  • ${error.text}`);
      });
    }
    
    if (report.testResults.glbRequestsFound === 0) {
      console.log('\n⚠️  WARNING: No GLB files were requested. The 3D component may not be loading.');
    } else if (report.testResults.glbResponsesSuccessful === 0) {
      console.log('\n❌ ERROR: GLB files were requested but none loaded successfully.');
    } else if (report.testResults.glbResponsesSuccessful === 2) {
      console.log('\n🎉 SUCCESS: Both GLB files loaded successfully!');
    }
    
    console.log(`\n📋 Full report saved to: ${screenshotDir}/${timestamp}-glb-test-report.json`);
    console.log(`📸 Screenshot saved to: ${screenshotDir}/${timestamp}-homepage-with-glb.png`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    const errorTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'glb-tests', `${errorTimestamp}-error.png`),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testGLBLoading().catch(console.error);