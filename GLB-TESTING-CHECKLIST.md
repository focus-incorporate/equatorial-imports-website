# GLB Coffee Bean Models Testing Checklist

## Overview
The website now loads actual GLB 3D models instead of geometric shapes. Test to ensure the models are loading and animating properly.

## GLB Files Location
- **File 1**: `/images/Falling coffee beans.glb` (2.7MB)
- **File 2**: `/images/coffee beans falling mid-air.glb` (3.8MB)

## Manual Testing Steps

### 1. Basic Page Load Test
- [ ] Navigate to `http://localhost:3000`
- [ ] Wait for page to fully load (watch for loading indicators)
- [ ] Check if page renders without errors

### 2. Network Tab Inspection
Open browser Developer Tools (F12) → Network tab:
- [ ] Filter by "glb" or "media" to see GLB requests
- [ ] Look for requests to both GLB files:
  - `Falling coffee beans.glb`
  - `coffee beans falling mid-air.glb`
- [ ] Check HTTP status codes (should be 200 OK)
- [ ] Verify file sizes match expected (2.7MB and 3.8MB)

### 3. Console Error Checking
Open Developer Tools → Console tab:
- [ ] Look for any GLB loading errors
- [ ] Check for Three.js warnings or errors
- [ ] Look for WebGL context errors
- [ ] Note any GLTF/GLB related messages

### 4. 3D Visual Inspection
Look at the hero section background:
- [ ] Can you see 3D coffee bean models falling?
- [ ] Do the models look like actual coffee beans (not geometric shapes)?
- [ ] Are there multiple beans with different models?
- [ ] Do the beans appear to have realistic textures/materials?

### 5. Animation Testing
Watch the 3D scene for 30+ seconds:
- [ ] Are the coffee beans falling from top to bottom?
- [ ] Do they rotate naturally while falling?
- [ ] Do they reset/loop when reaching the bottom?
- [ ] Is there variety in timing and positioning?
- [ ] Do different beans use different GLB models?

### 6. Performance Check
Monitor while 3D scene is running:
- [ ] Is the page responsive during animation?
- [ ] Does scrolling work smoothly?
- [ ] Are there any frame rate issues?
- [ ] CPU usage reasonable in Task Manager?

### 7. Screenshot Documentation
Take screenshots of:
- [ ] Network tab showing GLB requests/responses
- [ ] Console tab (capture any relevant messages)
- [ ] Homepage with 3D beans visible
- [ ] Animation in progress (beans falling)

## Expected Results

### ✅ Success Indicators
- Both GLB files requested and loaded (HTTP 200)
- 3D coffee bean models visible falling and rotating
- Realistic coffee bean shapes instead of geometric primitives
- Smooth animation loop with variety
- No critical console errors
- Models appear with proper lighting and materials

### ❌ Failure Indicators
- GLB files not requested (404 errors in network)
- Console errors mentioning GLB/GLTF loading failures
- No 3D models visible (blank or geometric shapes only)
- Animation not working (static models)
- WebGL context lost or initialization errors
- Page crashes or becomes unresponsive

## Automated Testing Command
You can also run the automated test:
```bash
node test-glb-loading.js
```

## Troubleshooting

### If GLB files aren't loading:
1. Check if files exist in `/public/images/`
2. Verify file permissions
3. Check dev server is serving static files correctly
4. Try accessing files directly: `http://localhost:3000/images/Falling coffee beans.glb`

### If models appear as geometric shapes:
1. GLB files may be corrupted
2. Three.js GLTFLoader may have failed
3. Check console for specific error messages
4. Verify file format is actually GLB/GLTF

### If no 3D scene at all:
1. Three.js/React Three Fiber may not be initialized
2. WebGL might not be supported
3. Check if Canvas element is present in DOM
4. Verify component is properly imported and rendered

## File Structure Expected
```
public/
  images/
    ├── Falling coffee beans.glb          (2.7MB)
    ├── coffee beans falling mid-air.glb  (3.8MB)
    └── ...

src/
  components/
    3d/
      ├── FallingBeans.tsx                (Main GLB loader)
      ├── FallingBeansClient.tsx          (Client wrapper)
      └── ...
```

## Report Template
After testing, report:

**GLB Loading Status:**
- [ ] Files requested: ✅/❌
- [ ] Files loaded successfully: ✅/❌
- [ ] Models visible: ✅/❌
- [ ] Animation working: ✅/❌

**Console Errors:** [List any errors]

**Screenshots:** [Attach screenshots]

**Performance Notes:** [Any performance issues]

**Overall Assessment:** [Working/Needs fixes]