// Unit tests for gradient detection in parseColor function
// Tests Requirements: 1.1, 1.2, 1.3

// Copy the functions to test
function extractGradientFallbackColor(gradientObject) {
  if (!gradientObject || typeof gradientObject !== 'object') {
    return null;
  }

  // Check multiple possible property names for color stops
  const possibleStopProperties = ['stops', 'colors', 'colorStops', 'gradientStops'];
  
  for (let i = 0; i < possibleStopProperties.length; i++) {
    const propName = possibleStopProperties[i];
    const stops = gradientObject[propName];
    
    // Check if stops exist and is an array
    if (stops && Array.isArray(stops) && stops.length > 0) {
      const firstStop = stops[0];
      
      // Extract color from the first stop
      // The stop might be an object with a 'color' property, or just a color value
      if (firstStop && typeof firstStop === 'object') {
        // Check for color property in the stop object
        if (firstStop.color !== undefined) {
          return firstStop.color;
        }
        // If the stop object doesn't have a color property, it might be the color itself
        // (though this is unusual, handle it gracefully)
        return firstStop;
      } else if (firstStop !== undefined && firstStop !== null) {
        // If the first stop is not an object, it might be a direct color value
        return firstStop;
      }
    }
  }

  // No valid stops found
  return null;
}

function formatColorForLogging(colorValue) {
  // Handle null/undefined
  if (colorValue === null) {
    return 'null';
  }
  if (colorValue === undefined) {
    return 'undefined';
  }

  // Handle objects
  if (typeof colorValue === 'object') {
    try {
      const jsonStr = JSON.stringify(colorValue);
      // Truncate to ~100 characters
      if (jsonStr.length > 100) {
        return jsonStr.substring(0, 100) + '... (truncated)';
      }
      return jsonStr;
    } catch (e) {
      // Handle circular references or other stringify errors
      return '[object (unstringifiable)]';
    }
  }

  // For strings and other primitives, return as-is with type info
  const typeInfo = typeof colorValue;
  if (typeInfo === 'string') {
    return colorValue;
  }
  
  // For other types (number, boolean, etc.), include type
  return `${colorValue} (${typeInfo})`;
}

function parseColor(colorValue, variables) {
  if (!colorValue) return null;

  // Handle disabled fills
  if (typeof colorValue === 'object' && colorValue.enabled === false) {
    return null;
  }

  // Handle color objects
  if (typeof colorValue === 'object' && colorValue.type === 'color') {
    colorValue = colorValue.color;
  }

  // Handle gradient objects
  if (typeof colorValue === 'object' && colorValue.type === 'gradient') {
    // Check enabled flag for gradients
    if (colorValue.enabled === false) {
      console.log('[parseColor] Gradient with enabled=false, returning null');
      return null;
    }
    
    // Log gradient detection
    const gradientType = colorValue.gradientType || 'unknown';
    console.log('[parseColor] Detected gradient object (type: ' + gradientType + ')');
    
    // Extract fallback color from gradient
    const fallbackColor = extractGradientFallbackColor(colorValue);
    
    if (fallbackColor === null) {
      console.warn('[parseColor] Warning: Gradient has no color stops, returning null');
      return null;
    }
    
    // Log warning that gradient fallback is being applied
    console.warn('[parseColor] Warning: Gradient fallback applied (' + gradientType + ' gradient)');
    
    // Process the extracted color value through existing color parsing logic
    colorValue = fallbackColor;
    
    // If the fallback color is itself a color object, unwrap it
    if (typeof colorValue === 'object' && colorValue.type === 'color') {
      colorValue = colorValue.color;
    }
    // Continue processing below (will handle variables, etc.)
  }

  // If still an object after unwrapping, it's invalid
  if (typeof colorValue === 'object') {
    // Check if object has a type property
    const objectType = colorValue.type;
    const typeInfo = objectType ? " with type '" + objectType + "'" : '';
    const formattedValue = formatColorForLogging(colorValue);
    console.warn('[parseColor] Warning: Invalid color value (object' + typeInfo + '): ' + formattedValue);
    return null;
  }

  const resolved = resolveVariable(colorValue, variables);

  // Ensure resolved is a string
  if (typeof resolved !== 'string') {
    console.warn('Color resolution failed, not a string:', resolved);
    return null;
  }

  // Handle transparent
  if (resolved === 'transparent') {
    return null;
  }

  if (resolved.startsWith('#')) {
    return { type: 'SOLID', color: hexToRgb(resolved) };
  }

  // Handle rgb/rgba
  if (resolved.startsWith('rgb')) {
    return { type: 'SOLID', color: parseRgb(resolved) };
  }

  return null;
}

function resolveVariable(value, variables) {
  if (typeof value !== 'string') return value;

  if (value.startsWith('$')) {
    const varName = value.substring(1).replace(/^--/, '');
    if (variables && variables[varName]) {
      const variable = variables[varName];
      return variable.value || variable;
    }
  }

  return value;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function parseRgb(rgb) {
  const values = rgb.match(/\d+/g);
  if (values) {
    return {
      r: parseInt(values[0]) / 255,
      g: parseInt(values[1]) / 255,
      b: parseInt(values[2]) / 255
    };
  }
  return { r: 0, g: 0, b: 0 };
}

// Test helpers
function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log('✓ PASS:', testName);
    return true;
  } else {
    console.log('✗ FAIL:', testName);
    console.log('  Expected:', expected);
    console.log('  Actual:', actual);
    return false;
  }
}

function assert(condition, testName) {
  if (condition) {
    console.log('✓ PASS:', testName);
    return true;
  } else {
    console.log('✗ FAIL:', testName);
    return false;
  }
}

// Run tests
console.log('\n=== Testing Gradient Detection in parseColor ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Gradient object with enabled: false returns null
totalTests++;
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: false,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
if (assertEqual(parseColor(gradient1, {}), null, 'Gradient with enabled=false returns null')) {
  passedTests++;
}

// Test 2: Gradient object with enabled: true is detected and fallback is applied
totalTests++;
const gradient2 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
// Should extract first stop color and return solid fill
const expected2 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(gradient2, {}), expected2, 'Gradient with enabled=true applies fallback')) {
  passedTests++;
}

// Test 3: Gradient object with enabled: undefined is detected and fallback is applied
totalTests++;
const gradient3 = {
  type: 'gradient',
  gradientType: 'radial',
  stops: [
    { position: 0, color: '#00FF00' },
    { position: 1, color: '#FFFF00' }
  ]
};
// enabled is undefined, should be processed and apply fallback
const expected3 = { type: 'SOLID', color: { r: 0, g: 1, b: 0 } };
if (assertEqual(parseColor(gradient3, {}), expected3, 'Gradient with enabled=undefined applies fallback')) {
  passedTests++;
}

// Test 4: Linear gradient is detected with correct type and fallback is applied
totalTests++;
const gradient4 = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 45,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
// Should extract first stop and return solid fill
const expected4 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(gradient4, {}), expected4, 'Linear gradient applies fallback')) {
  passedTests++;
}

// Test 5: Radial gradient is detected with correct type and fallback is applied
totalTests++;
const gradient5 = {
  type: 'gradient',
  gradientType: 'radial',
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
// Should extract first stop and return solid fill
const expected5 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(gradient5, {}), expected5, 'Radial gradient applies fallback')) {
  passedTests++;
}

// Test 6: Gradient without gradientType property still applies fallback
totalTests++;
const gradient6 = {
  type: 'gradient',
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
// Should log "unknown" gradient type but still apply fallback
const expected6 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(gradient6, {}), expected6, 'Gradient without gradientType applies fallback')) {
  passedTests++;
}

// Test 7: Non-gradient object is not affected
totalTests++;
const colorObj = {
  type: 'color',
  color: '#FF0000'
};
const expected7 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(colorObj, {}), expected7, 'Color object is still processed correctly')) {
  passedTests++;
}

// Test 8: Regular hex color still works
totalTests++;
if (assertEqual(parseColor('#00FF00', {}), { type: 'SOLID', color: { r: 0, g: 1, b: 0 } }, 'Hex color still works')) {
  passedTests++;
}

// Test 9: Disabled non-gradient object returns null
totalTests++;
const disabledObj = {
  type: 'color',
  enabled: false,
  color: '#FF0000'
};
if (assertEqual(parseColor(disabledObj, {}), null, 'Disabled color object returns null')) {
  passedTests++;
}

// Test 10: Gradient with enabled explicitly set to true
totalTests++;
const gradient10 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  stops: [
    { position: 0, color: '#FF0000' }
  ]
};
const expected10 = { type: 'SOLID', color: { r: 1, g: 0, b: 0 } };
if (assertEqual(parseColor(gradient10, {}), expected10, 'Gradient with enabled=true is processed')) {
  passedTests++;
}

// Test 11: Gradient with no color stops returns null
totalTests++;
const gradient11 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: []
};
if (assertEqual(parseColor(gradient11, {}), null, 'Gradient with no color stops returns null')) {
  passedTests++;
}

// Test 12: Gradient with missing stops property returns null
totalTests++;
const gradient12 = {
  type: 'gradient',
  gradientType: 'linear'
};
if (assertEqual(parseColor(gradient12, {}), null, 'Gradient with missing stops returns null')) {
  passedTests++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log('Passed:', passedTests, '/', totalTests);
console.log('Failed:', totalTests - passedTests);

if (passedTests === totalTests) {
  console.log('\n✅ All tests passed!');
} else {
  console.log('\n❌ Some tests failed');
}
