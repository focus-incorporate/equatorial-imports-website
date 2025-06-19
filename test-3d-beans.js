#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotDir = path.join(__dirname, 'test-results', 'puppeteer-3d-tests');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Test configuration
const TEST_CONFIG = {
  url: 'http://localhost:3000',
  coffeePageUrl: 'http://localhost:3000/coffee',
  waitForInitialization: 10000, // 10 seconds for Three.js to initialize
  animationWaitTime: 3000, // 3 seconds between animation checks
  scrollTestDuration: 5000, // 5 seconds of scrolling test
  viewportWidth: 1920,
  viewportHeight: 1080
};

class ThreeDBeansTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      startTime: new Date(),
      tests: [],
      consoleLogs: [],
      errors: [],
      warnings: [],
      performance: {},
      screenshots: []
    };
  }

  async initialize() {
    console.log('🚀 Starting 3D Coffee Beans Test Suite...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for visual debugging
      defaultViewport: null,
      args: [
        `--window-size=${TEST_CONFIG.viewportWidth},${TEST_CONFIG.viewportHeight}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--enable-gpu-rasterization'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: TEST_CONFIG.viewportWidth,
      height: TEST_CONFIG.viewportHeight
    });

    // Set up console monitoring
    this.page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date()
      };
      
      this.testResults.consoleLogs.push(logEntry);
      
      if (msg.type() === 'error') {
        this.testResults.errors.push(logEntry);
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        this.testResults.warnings.push(logEntry);
        console.log('⚠️ Console Warning:', msg.text());
      } else if (msg.text().includes('Three.js') || msg.text().includes('WebGL') || msg.text().includes('React Three Fiber')) {
        console.log('🎮 3D Related Log:', msg.text());
      }
    });

    // Monitor page errors
    this.page.on('pageerror', (error) => {
      this.testResults.errors.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      console.log('💥 Page Error:', error.message);
    });

    console.log('✅ Browser initialized with WebGL support');
  }

  async navigateAndWaitForLoad() {
    console.log('📍 Navigating to homepage...');
    const startTime = Date.now();
    
    await this.page.goto(TEST_CONFIG.url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const navigationTime = Date.now() - startTime;
    console.log(`⏱️ Page loaded in ${navigationTime}ms`);
    
    // Wait for Three.js and 3D components to initialize
    console.log('⏳ Waiting for 3D components to initialize...');
    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.waitForInitialization));
    
    this.testResults.performance.navigationTime = navigationTime;
    this.testResults.tests.push({
      name: 'Page Navigation',
      status: 'passed',
      duration: navigationTime,
      timestamp: new Date()
    });
  }

  async check3DCanvasPresence() {
    console.log('🎨 Checking for 3D Canvas element...');
    
    const canvasInfo = await this.page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      const threeCanvas = Array.from(canvases).find(canvas => 
        canvas.getContext('webgl') || canvas.getContext('webgl2')
      );
      
      if (threeCanvas) {
        const context = threeCanvas.getContext('webgl') || threeCanvas.getContext('webgl2');
        return {
          found: true,
          width: threeCanvas.width,
          height: threeCanvas.height,
          contextType: context ? (context.constructor.name || 'WebGL') : 'unknown',
          renderer: context ? context.getParameter(context.RENDERER) : 'unknown',
          vendor: context ? context.getParameter(context.VENDOR) : 'unknown'
        };
      }
      return { found: false };
    });
    
    if (canvasInfo.found) {
      console.log('✅ 3D Canvas found!');
      console.log(`   Dimensions: ${canvasInfo.width}x${canvasInfo.height}`);
      console.log(`   Context: ${canvasInfo.contextType}`);
      console.log(`   Renderer: ${canvasInfo.renderer}`);
      console.log(`   Vendor: ${canvasInfo.vendor}`);
      
      this.testResults.tests.push({
        name: '3D Canvas Detection',
        status: 'passed',
        details: canvasInfo,
        timestamp: new Date()
      });
    } else {
      console.log('❌ No 3D Canvas found!');
      this.testResults.tests.push({
        name: '3D Canvas Detection',
        status: 'failed',
        error: 'No WebGL canvas element detected',
        timestamp: new Date()
      });
    }
    
    return canvasInfo.found;
  }

  async checkForThreeJsElements() {
    console.log('🔍 Checking for Three.js and React Three Fiber elements...');
    
    const threeJsInfo = await this.page.evaluate(() => {
      // Check for Three.js global
      const hasThreeJS = typeof window.THREE !== 'undefined';
      
      // Check for React Three Fiber components
      const fallingBeansDiv = document.querySelector('.fixed.inset-0.pointer-events-none.z-0');
      const hasR3FContainer = !!fallingBeansDiv;
      
      // Check for any WebGL-related errors in console
      const canvases = document.querySelectorAll('canvas');
      const webglCanvas = Array.from(canvases).find(canvas => {
        const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return ctx !== null;
      });
      
      return {
        hasThreeJS,
        hasR3FContainer,
        hasWebGLCanvas: !!webglCanvas,
        canvasCount: canvases.length,
        fallingBeansContainer: hasR3FContainer ? {
          classes: fallingBeansDiv.className,
          childCount: fallingBeansDiv.children.length
        } : null
      };
    });
    
    console.log('Three.js Detection Results:');
    console.log(`   Three.js Global: ${threeJsInfo.hasThreeJS ? '✅' : '❌'}`);
    console.log(`   R3F Container: ${threeJsInfo.hasR3FContainer ? '✅' : '❌'}`);
    console.log(`   WebGL Canvas: ${threeJsInfo.hasWebGLCanvas ? '✅' : '❌'}`);
    console.log(`   Total Canvases: ${threeJsInfo.canvasCount}`);
    
    if (threeJsInfo.fallingBeansContainer) {
      console.log(`   Container Classes: ${threeJsInfo.fallingBeansContainer.classes}`);
      console.log(`   Container Children: ${threeJsInfo.fallingBeansContainer.childCount}`);
    }
    
    this.testResults.tests.push({
      name: 'Three.js Component Detection',
      status: threeJsInfo.hasR3FContainer && threeJsInfo.hasWebGLCanvas ? 'passed' : 'failed',
      details: threeJsInfo,
      timestamp: new Date()
    });
    
    return threeJsInfo;
  }

  async takeScreenshot(name, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(screenshotDir, filename);
    
    console.log(`📸 Taking screenshot: ${name}`);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: options.fullPage || false,
      ...options
    });
    
    this.testResults.screenshots.push({
      name,
      filename,
      filepath,
      timestamp: new Date()
    });
    
    console.log(`   Saved: ${filename}`);
    return filepath;
  }

  async testAnimationSmoothness() {
    console.log('🎬 Testing animation smoothness...');
    
    const animationData = [];
    const testDuration = 6000; // 6 seconds
    const sampleInterval = 500; // Sample every 500ms
    
    for (let i = 0; i < testDuration / sampleInterval; i++) {
      const frameData = await this.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        
        // Get canvas content as data URL to detect changes
        try {
          const dataURL = canvas.toDataURL();
          return {
            timestamp: Date.now(),
            hasContent: dataURL.length > 1000, // Rough check for actual content
            dataHash: dataURL.substring(0, 100) // First 100 chars as simple hash
          };
        } catch (e) {
          return { timestamp: Date.now(), error: e.message };
        }
      });
      
      if (frameData) {
        animationData.push(frameData);
      }
      
      await new Promise(resolve => setTimeout(resolve, sampleInterval));
    }
    
    // Analyze animation data
    const uniqueFrames = new Set(animationData.map(f => f.dataHash)).size;
    const hasAnimation = uniqueFrames > 1;
    
    console.log(`   Animation Analysis:`);
    console.log(`   Samples taken: ${animationData.length}`);
    console.log(`   Unique frames: ${uniqueFrames}`);
    console.log(`   Animation detected: ${hasAnimation ? '✅' : '❌'}`);
    
    this.testResults.tests.push({
      name: 'Animation Smoothness Test',
      status: hasAnimation ? 'passed' : 'failed',
      details: {
        samples: animationData.length,
        uniqueFrames,
        hasAnimation,
        testDuration
      },
      timestamp: new Date()
    });
    
    return hasAnimation;
  }

  async testScrollPerformance() {
    console.log('📜 Testing scroll performance with 3D animations...');
    
    const scrollTestStart = Date.now();
    const scrollMetrics = [];
    
    // Get initial scroll position
    const initialScroll = await this.page.evaluate(() => window.scrollY);
    
    // Perform scrolling test
    for (let i = 0; i < 10; i++) {
      const scrollStart = Date.now();
      
      // Scroll down
      await this.page.evaluate(() => {
        window.scrollBy(0, 200);
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const scrollEnd = Date.now();
      const currentScroll = await this.page.evaluate(() => window.scrollY);
      
      scrollMetrics.push({
        iteration: i,
        duration: scrollEnd - scrollStart,
        scrollPosition: currentScroll,
        timestamp: new Date()
      });
    }
    
    // Scroll back to top
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    const avgScrollTime = scrollMetrics.reduce((acc, m) => acc + m.duration, 0) / scrollMetrics.length;
    const maxScrollTime = Math.max(...scrollMetrics.map(m => m.duration));
    
    console.log(`   Average scroll time: ${avgScrollTime.toFixed(2)}ms`);
    console.log(`   Max scroll time: ${maxScrollTime}ms`);
    console.log(`   Performance: ${avgScrollTime < 50 ? '✅ Excellent' : avgScrollTime < 100 ? '⚠️ Good' : '❌ Poor'}`);
    
    this.testResults.tests.push({
      name: 'Scroll Performance Test',
      status: avgScrollTime < 100 ? 'passed' : 'failed',
      details: {
        averageScrollTime: avgScrollTime,
        maxScrollTime,
        scrollMetrics,
        totalTestDuration: Date.now() - scrollTestStart
      },
      timestamp: new Date()
    });
    
    this.testResults.performance.scrollPerformance = {
      averageScrollTime: avgScrollTime,
      maxScrollTime
    };
  }

  async testCoffeePage() {
    console.log('☕ Testing Coffee page...');
    
    await this.page.goto(TEST_CONFIG.coffeePageUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if page loaded successfully
    const pageTitle = await this.page.title();
    console.log(`   Coffee page title: ${pageTitle}`);
    
    // Take screenshot of coffee page
    await this.takeScreenshot('coffee-page', { fullPage: true });
    
    this.testResults.tests.push({
      name: 'Coffee Page Navigation',
      status: 'passed',
      details: { title: pageTitle },
      timestamp: new Date()
    });
  }

  async runComprehensiveTest() {
    try {
      await this.initialize();
      
      // Test 1: Navigation and loading
      await this.navigateAndWaitForLoad();
      
      // Test 2: Take initial screenshot
      await this.takeScreenshot('homepage-initial', { fullPage: true });
      
      // Test 3: Check for 3D canvas
      const hasCanvas = await this.check3DCanvasPresence();
      
      // Test 4: Check Three.js components
      const threeJsInfo = await this.checkForThreeJsElements();
      
      // Test 5: Take screenshot of hero section with 3D beans
      await this.takeScreenshot('homepage-hero-with-3d-beans');
      
      // Test 6: Animation smoothness test
      if (hasCanvas) {
        await this.testAnimationSmoothness();
      }
      
      // Wait and take another screenshot to capture animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('homepage-animation-capture');
      
      // Test 7: Scroll performance
      await this.testScrollPerformance();
      
      // Test 8: Coffee page
      await this.testCoffeePage();
      
      // Go back to homepage for final checks
      await this.page.goto(TEST_CONFIG.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Final screenshot
      await this.takeScreenshot('homepage-final', { fullPage: true });
      
      console.log('✅ All tests completed!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.errors.push({
        type: 'test-suite-error',
        text: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
    }
  }

  async generateReport() {
    this.testResults.endTime = new Date();
    this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
    
    const reportPath = path.join(screenshotDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    // Generate human-readable report
    const humanReportPath = path.join(screenshotDir, 'test-report.md');
    const humanReport = this.generateHumanReport();
    fs.writeFileSync(humanReportPath, humanReport);
    
    console.log('\n📊 TEST REPORT GENERATED');
    console.log(`   JSON Report: ${reportPath}`);
    console.log(`   Human Report: ${humanReportPath}`);
    console.log(`   Screenshots: ${screenshotDir}`);
    
    return { reportPath, humanReportPath };
  }

  generateHumanReport() {
    const passedTests = this.testResults.tests.filter(t => t.status === 'passed').length;
    const failedTests = this.testResults.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.testResults.tests.length;
    
    let report = `# 3D Coffee Beans Test Report\n\n`;
    report += `**Test Date:** ${this.testResults.startTime.toISOString()}\n`;
    report += `**Duration:** ${Math.round(this.testResults.duration / 1000)}s\n`;
    report += `**Results:** ${passedTests}/${totalTests} tests passed\n\n`;
    
    report += `## Test Results Summary\n\n`;
    report += `- ✅ Passed: ${passedTests}\n`;
    report += `- ❌ Failed: ${failedTests}\n`;
    report += `- 🚨 Errors: ${this.testResults.errors.length}\n`;
    report += `- ⚠️ Warnings: ${this.testResults.warnings.length}\n\n`;
    
    report += `## Individual Test Results\n\n`;
    this.testResults.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      report += `${status} **${test.name}**\n`;
      if (test.details) {
        report += `   Details: ${JSON.stringify(test.details, null, 2)}\n`;
      }
      if (test.error) {
        report += `   Error: ${test.error}\n`;
      }
      report += `\n`;
    });
    
    if (this.testResults.errors.length > 0) {
      report += `## Console Errors\n\n`;
      this.testResults.errors.forEach(error => {
        report += `- **${error.type}:** ${error.text}\n`;
        if (error.stack) {
          report += `  \`\`\`\n  ${error.stack}\n  \`\`\`\n`;
        }
      });
      report += `\n`;
    }
    
    if (this.testResults.warnings.length > 0) {
      report += `## Console Warnings\n\n`;
      this.testResults.warnings.forEach(warning => {
        report += `- ${warning.text}\n`;
      });
      report += `\n`;
    }
    
    report += `## Performance Metrics\n\n`;
    if (this.testResults.performance.navigationTime) {
      report += `- **Page Load Time:** ${this.testResults.performance.navigationTime}ms\n`;
    }
    if (this.testResults.performance.scrollPerformance) {
      report += `- **Average Scroll Time:** ${this.testResults.performance.scrollPerformance.averageScrollTime.toFixed(2)}ms\n`;
      report += `- **Max Scroll Time:** ${this.testResults.performance.scrollPerformance.maxScrollTime}ms\n`;
    }
    report += `\n`;
    
    report += `## Screenshots\n\n`;
    this.testResults.screenshots.forEach(screenshot => {
      report += `- **${screenshot.name}**: ${screenshot.filename}\n`;
    });
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const testSuite = new ThreeDBeansTestSuite();
  
  try {
    await testSuite.runComprehensiveTest();
    const reports = await testSuite.generateReport();
    
    console.log('\n🎉 3D Coffee Beans Test Suite Completed!');
    console.log('\n📋 QUICK SUMMARY:');
    
    const passedTests = testSuite.testResults.tests.filter(t => t.status === 'passed').length;
    const totalTests = testSuite.testResults.tests.length;
    const errorCount = testSuite.testResults.errors.length;
    const warningCount = testSuite.testResults.warnings.length;
    
    console.log(`   Tests: ${passedTests}/${totalTests} passed`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Warnings: ${warningCount}`);
    console.log(`   Screenshots: ${testSuite.testResults.screenshots.length} captured`);
    
    if (errorCount === 0 && passedTests === totalTests) {
      console.log('\n✅ ALL TESTS PASSED - 3D Animation Implementation is Working!');
    } else {
      console.log('\n⚠️ Some issues detected - Check the detailed report for more information');
    }
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  } finally {
    await testSuite.cleanup();
  }
}

// Run the test suite
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ThreeDBeansTestSuite;