# 3D Coffee Beans Test Report

**Test Date:** 2025-06-19T06:11:41.601Z
**Duration:** 34s
**Results:** 4/6 tests passed

## Test Results Summary

- ✅ Passed: 4
- ❌ Failed: 2
- 🚨 Errors: 3
- ⚠️ Warnings: 0

## Individual Test Results

✅ **Page Navigation**

✅ **3D Canvas Detection**
   Details: {
  "found": true,
  "width": 1920,
  "height": 1080,
  "contextType": "WebGL2RenderingContext",
  "renderer": "WebKit WebGL",
  "vendor": "WebKit"
}

✅ **Three.js Component Detection**
   Details: {
  "hasThreeJS": false,
  "hasR3FContainer": true,
  "hasWebGLCanvas": true,
  "canvasCount": 1,
  "fallingBeansContainer": {
    "classes": "fixed inset-0 pointer-events-none z-0 opacity-50",
    "childCount": 1
  }
}

❌ **Animation Smoothness Test**
   Details: {
  "samples": 12,
  "uniqueFrames": 1,
  "hasAnimation": false,
  "testDuration": 6000
}

❌ **Scroll Performance Test**
   Details: {
  "averageScrollTime": 201.6,
  "maxScrollTime": 203,
  "scrollMetrics": [
    {
      "iteration": 0,
      "duration": 202,
      "scrollPosition": 117,
      "timestamp": "2025-06-19T06:12:06.557Z"
    },
    {
      "iteration": 1,
      "duration": 201,
      "scrollPosition": 248.5,
      "timestamp": "2025-06-19T06:12:06.761Z"
    },
    {
      "iteration": 2,
      "duration": 201,
      "scrollPosition": 378.5,
      "timestamp": "2025-06-19T06:12:06.964Z"
    },
    {
      "iteration": 3,
      "duration": 202,
      "scrollPosition": 523.5,
      "timestamp": "2025-06-19T06:12:07.168Z"
    },
    {
      "iteration": 4,
      "duration": 201,
      "scrollPosition": 653.5,
      "timestamp": "2025-06-19T06:12:07.371Z"
    },
    {
      "iteration": 5,
      "duration": 201,
      "scrollPosition": 784,
      "timestamp": "2025-06-19T06:12:07.573Z"
    },
    {
      "iteration": 6,
      "duration": 202,
      "scrollPosition": 914.5,
      "timestamp": "2025-06-19T06:12:07.777Z"
    },
    {
      "iteration": 7,
      "duration": 201,
      "scrollPosition": 1045,
      "timestamp": "2025-06-19T06:12:07.980Z"
    },
    {
      "iteration": 8,
      "duration": 203,
      "scrollPosition": 1189,
      "timestamp": "2025-06-19T06:12:08.185Z"
    },
    {
      "iteration": 9,
      "duration": 202,
      "scrollPosition": 1320.5,
      "timestamp": "2025-06-19T06:12:08.388Z"
    }
  ],
  "totalTestDuration": 2037
}

✅ **Coffee Page Navigation**
   Details: {
  "title": "Coffee Collection - Daniel's Blend & Viaggio Espresso | Equatorial Imports"
}

## Console Errors

- **error:** THREE.WebGLRenderer: A WebGL context could not be created. Reason:  Canvas has an existing context of a different type
- **error:** THREE.WebGLRenderer: A WebGL context could not be created. Reason:  Canvas has an existing context of a different type
- **error:** THREE.WebGLRenderer: A WebGL context could not be created. Reason:  Canvas has an existing context of a different type

## Performance Metrics

- **Page Load Time:** 2735ms
- **Average Scroll Time:** 201.60ms
- **Max Scroll Time:** 203ms

## Screenshots

- **homepage-initial**: 2025-06-19T06-11-55-652Z-homepage-initial.png
- **homepage-hero-with-3d-beans**: 2025-06-19T06-11-56-225Z-homepage-hero-with-3d-beans.png
- **homepage-animation-capture**: 2025-06-19T06-12-06-077Z-homepage-animation-capture.png
- **coffee-page**: 2025-06-19T06-12-12-339Z-coffee-page.png
- **homepage-final**: 2025-06-19T06-12-14-971Z-homepage-final.png
