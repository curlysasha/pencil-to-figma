// Test for context parameter in parseColor function
// This test verifies that the context parameter is properly included in log messages

// Mock console.warn to capture log messages
const originalWarn = console.warn;
const originalLog = console.log;
let capturedWarnings = [];
let capturedLogs = [];

console.warn = function(...args) {
  capturedWarnings.push(args.join(' '));
  originalWarn.apply(console, args);
};

console.log = function(...args) {
  capturedLogs.push(args.join(' '));
  originalLog.apply(console, args);
};

// Helper functions from code.js
function extractGradientFallbackColor(gradientObject) {
  if (!gradientObject || typeof gradientObject !== 'object') {
    return null;
  }

  const possibleStopProperties = ['stops', 'colors', 'colorStops', 'gradientStops'];
  
  for (let i = 0; i < possibleStopProperties.length; i++) {
    const propName = possibleStopProperties[i];
    if (gradientObject[propName] && Array.isArray(gradientObject[propName])) {
      const stops = gradientObject[propName];
      if (stops.length > 0) {
        const firstStop = stops[0];
        return firstStop.color || firstStop;
      }
    }
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

function parseRgb(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1]) / 255,
      g: parseInt(match[2]) / 255,
      b: parseInt(match[3]) / 255
    };
  }
  return { r: 0, g: 0, b: 0 };
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

// parseColor function with context parameter
function parseColor(colorValue, variables, context) {
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
      const msg = '[parseColor] Gradient with enabled=false, returning null' + (context ? " for element '" + context + "'" : '');
      console.log(msg);
      return null;
    }
    
    // Log gradient detection
    const gradientType = colorValue.gradientType || 'unknown';
    const detectMsg = '[parseColor] Detected gradient object (type: ' + gradientType + ')' + (context ? " for element '" + context + "'" : '');
    console.log(detectMsg);
    
    // Extract fallback color from gradient
    const fallbackColor = extractGradientFallbackColor(colorValue);
    
    if (fallbackColor === null) {
      const noStopsMsg = '[parseColor] Warning: Gradient has no color stops, returning null' + (context ? " for element '" + context + "'" : '');
      console.warn(noStopsMsg);
      return null;
    }
    
    // Log warning that gradient fallback is being applied
    const fallbackMsg = '[parseColor] Warning: Gradient fallback applied (' + gradientType + ' gradient)' + (context ? " for element '" + context + "'" : '');
    console.warn(fallbackMsg);
    
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
    const invalidMsg = '[parseColor] Warning: Invalid color value (object' + typeInfo + '): ' + formattedValue + (context ? " for element '" + context + "'" : '');
    console.warn(invalidMsg);
    return null;
  }

  const resolved = resolveVariable(colorValue, variables);

  // Ensure resolved is a string
  if (typeof resolved !== 'string') {
    const resolveMsg = '[parseColor] Warning: Color resolution failed, not a string' + (context ? " for element '" + context + "'" : '');
    console.warn(resolveMsg, resolved);
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

// Test cases
console.log('\n=== Testing Context Parameter in parseColor ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Gradient with context parameter
totalTests++;
capturedWarnings = [];
capturedLogs = [];
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
parseColor(gradient1, {}, 'myButton');
if (capturedWarnings.some(msg => msg.includes("for element 'myButton'"))) {
  console.log('✓ PASS: Context parameter appears in warning message');
  passedTests++;
} else {
  console.log('✗ FAIL: Context parameter missing from warning message');
  console.log('  Captured warnings:', capturedWarnings);
}

// Test 2: Gradient without context parameter
totalTests++;
capturedWarnings = [];
capturedLogs = [];
const gradient2 = {
  type: 'gradient',
  gradientType: 'radial',
  enabled: true,
  stops: [
    { position: 0, color: '#00FF00' }
  ]
};
parseColor(gradient2, {});
if (capturedWarnings.some(msg => !msg.includes("for element '"))) {
  console.log('✓ PASS: No context in message when context not provided');
  passedTests++;
} else {
  console.log('✗ FAIL: Unexpected context in message');
  console.log('  Captured warnings:', capturedWarnings);
}

// Test 3: Invalid color object with context
totalTests++;
capturedWarnings = [];
capturedLogs = [];
const invalidObj = {
  type: 'unknown',
  value: 'something'
};
parseColor(invalidObj, {}, 'headerBg');
if (capturedWarnings.some(msg => msg.includes("for element 'headerBg'"))) {
  console.log('✓ PASS: Context appears in invalid object warning');
  passedTests++;
} else {
  console.log('✗ FAIL: Context missing from invalid object warning');
  console.log('  Captured warnings:', capturedWarnings);
}

// Test 4: Gradient with no stops and context
totalTests++;
capturedWarnings = [];
capturedLogs = [];
const gradient3 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: []
};
parseColor(gradient3, {}, 'emptyGradient');
if (capturedWarnings.some(msg => msg.includes("for element 'emptyGradient'"))) {
  console.log('✓ PASS: Context appears in no stops warning');
  passedTests++;
} else {
  console.log('✗ FAIL: Context missing from no stops warning');
  console.log('  Captured warnings:', capturedWarnings);
}

// Test 5: Gradient detection log includes context
totalTests++;
capturedWarnings = [];
capturedLogs = [];
const gradient4 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  stops: [
    { position: 0, color: '#FF0000' }
  ]
};
parseColor(gradient4, {}, 'testElement');
if (capturedLogs.some(msg => msg.includes("for element 'testElement'"))) {
  console.log('✓ PASS: Context appears in gradient detection log');
  passedTests++;
} else {
  console.log('✗ FAIL: Context missing from gradient detection log');
  console.log('  Captured logs:', capturedLogs);
}

// Restore console functions
console.warn = originalWarn;
console.log = originalLog;

console.log('\n=== Test Summary ===');
console.log('Passed:', passedTests, '/', totalTests);
console.log('Failed:', totalTests - passedTests);

if (passedTests === totalTests) {
  console.log('\n✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed\n');
  process.exit(1);
}
