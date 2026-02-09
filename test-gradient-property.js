// Property-Based Tests for Gradient Color Handling
// Feature: gradient-color-handling
//
// Property 1: Gradient Detection and Enabled Flag Handling
// **Validates: Requirements 1.1, 1.2, 1.3**
// For any gradient object (linear or radial), the Parser should identify it as a gradient type,
// and if the enabled flag is set to false, return null; otherwise, the gradient should be processed.
//
// Property 2: Gradient Fallback Conversion
// **Validates: Requirements 2.1, 2.2**
// For any gradient object (linear or radial) with enabled true or undefined,
// the Parser should extract the first color stop and return it as a solid Figma_Fill with type 'SOLID'.

// Import fast-check (assuming it's available)
// If running in Node.js: const fc = require('fast-check');
// If running in browser/Figma plugin: include fast-check library

// For this test, we'll use a simplified version that can run in the Figma plugin environment
// You may need to include fast-check library separately

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

  // Handle gradient objects
  if (typeof colorValue === 'object' && colorValue.type === 'gradient') {
    // Check if gradient is enabled (default to true if undefined)
    if (colorValue.enabled === false) {
      return null;
    }
    
    // Extract first color stop as fallback
    const fallbackColor = extractGradientFallbackColor(colorValue);
    if (fallbackColor) {
      // Recursively parse the extracted color
      return parseColor(fallbackColor, variables);
    }
    
    // No valid color stops found
    return null;
  }

  // Handle color objects
  if (typeof colorValue === 'object' && colorValue.type === 'color') {
    colorValue = colorValue.color;
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

// Property-based test generators
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEnabledValue() {
  // Generate random enabled values: true, false, or undefined
  const options = [true, false, undefined];
  return randomChoice(options);
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomBoolean() {
  return Math.random() < 0.5;
}

function randomHexColor() {
  const r = randomInt(0, 255).toString(16).padStart(2, '0');
  const g = randomInt(0, 255).toString(16).padStart(2, '0');
  const b = randomInt(0, 255).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}

function randomRgbColor() {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function randomRgbaColor() {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  const a = (Math.random()).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function randomColorValue() {
  const colorTypes = ['hex', 'rgb', 'rgba'];
  const type = randomChoice(colorTypes);
  
  switch (type) {
    case 'hex':
      return randomHexColor();
    case 'rgb':
      return randomRgbColor();
    case 'rgba':
      return randomRgbaColor();
    default:
      return randomHexColor();
  }
}

function randomColorStop() {
  return {
    position: Math.random(),
    color: randomColorValue()
  };
}

function randomGradientObject() {
  const gradientType = randomChoice(['linear', 'radial']);
  const stopPropertyName = randomChoice(['stops', 'colors', 'colorStops', 'gradientStops']);
  const numStops = randomInt(1, 5);
  const stops = [];
  
  for (let i = 0; i < numStops; i++) {
    stops.push(randomColorStop());
  }
  
  // Sort stops by position
  stops.sort((a, b) => a.position - b.position);
  
  const gradient = {
    type: 'gradient',
    gradientType: gradientType,
    rotation: randomInt(0, 360)
  };
  
  // Randomly include or exclude enabled property
  // If excluded, it should default to true
  if (randomBoolean()) {
    gradient.enabled = randomBoolean() ? true : undefined;
  }
  
  gradient[stopPropertyName] = stops;
  
  return gradient;
}

// Property test: Gradient Detection and Enabled Flag Handling
// Feature: gradient-color-handling, Property 1: Gradient Detection and Enabled Flag Handling
// **Validates: Requirements 1.1, 1.2, 1.3**
//
// Property 1: For any gradient object (linear or radial), the Parser should identify it as a gradient type,
// and if the enabled flag is set to false, return null; otherwise, the gradient should be processed for fallback conversion.
function testGradientDetectionAndEnabledFlag(iterations = 100) {
  console.log('\n=== Property Test: Gradient Detection and Enabled Flag Handling ===');
  console.log(`Running ${iterations} iterations...\n`);
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (let i = 0; i < iterations; i++) {
    // Generate a gradient with random enabled value
    const gradientType = randomChoice(['linear', 'radial']);
    const stopPropertyName = randomChoice(['stops', 'colors', 'colorStops', 'gradientStops']);
    const enabledValue = randomEnabledValue();
    
    const gradient = {
      type: 'gradient',
      gradientType: gradientType,
      rotation: randomInt(0, 360),
      enabled: enabledValue
    };
    
    // Add color stops
    const numStops = randomInt(1, 3);
    const stops = [];
    for (let j = 0; j < numStops; j++) {
      stops.push({
        position: Math.random(),
        color: randomColorValue()
      });
    }
    stops.sort((a, b) => a.position - b.position);
    gradient[stopPropertyName] = stops;
    
    const variables = {};
    const result = parseColor(gradient, variables);
    
    // Verify the property
    let testPassed = true;
    let errorMessage = '';
    
    // Property verification:
    // 1. Gradient is identified (type === 'gradient')
    // 2. If enabled === false, return null
    // 3. If enabled === true or undefined, process the gradient (return SOLID fill or null if no stops)
    
    if (enabledValue === false) {
      // Should return null for disabled gradients
      if (result !== null) {
        testPassed = false;
        errorMessage = `Expected null for gradient with enabled=false, got: ${JSON.stringify(result)}`;
      }
    } else {
      // enabled is true or undefined - gradient should be processed
      // Result should be either a SOLID fill (if stops are valid) or null (if no valid stops)
      if (result !== null) {
        // If not null, must be a valid SOLID fill
        if (result.type !== 'SOLID') {
          testPassed = false;
          errorMessage = `Expected SOLID fill type for enabled gradient, got: ${result.type}`;
        } else if (!result.color || typeof result.color !== 'object') {
          testPassed = false;
          errorMessage = `Expected color object in fill, got: ${JSON.stringify(result.color)}`;
        } else {
          // Verify color values are valid (between 0 and 1)
          const { r, g, b } = result.color;
          if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
            testPassed = false;
            errorMessage = `Color values must be numbers, got: r=${r}, g=${g}, b=${b}`;
          } else if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
            testPassed = false;
            errorMessage = `Color values must be between 0 and 1, got: r=${r}, g=${g}, b=${b}`;
          }
        }
      }
      // If result is null, that's acceptable if there were no valid color stops
    }
    
    if (testPassed) {
      passed++;
    } else {
      failed++;
      failures.push({
        iteration: i + 1,
        gradient: gradient,
        enabledValue: enabledValue,
        result: result,
        error: errorMessage
      });
    }
  }
  
  // Report results
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}/${iterations}`);
  console.log(`Failed: ${failed}/${iterations}`);
  
  if (failed > 0) {
    console.log('\n=== Failures ===');
    failures.forEach(failure => {
      console.log(`\nIteration ${failure.iteration}:`);
      console.log('Enabled value:', failure.enabledValue);
      console.log('Gradient:', JSON.stringify(failure.gradient, null, 2));
      console.log('Result:', JSON.stringify(failure.result, null, 2));
      console.log('Error:', failure.error);
    });
  }
  
  if (passed === iterations) {
    console.log('\n🎉 All property tests passed!');
    return true;
  } else {
    console.log('\n⚠️ Some property tests failed. See details above.');
    return false;
  }
}

// Property test: Gradient Fallback Conversion
function testGradientFallbackConversion(iterations = 100) {
  console.log('\n=== Property Test: Gradient Fallback Conversion ===');
  console.log(`Running ${iterations} iterations...\n`);
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (let i = 0; i < iterations; i++) {
    const gradient = randomGradientObject();
    const variables = {};
    
    // Property: For any gradient object with enabled true or undefined,
    // parseColor should extract the first color stop and return a solid Figma_Fill
    
    const result = parseColor(gradient, variables);
    
    // Get the expected first color
    const stopPropertyNames = ['stops', 'colors', 'colorStops', 'gradientStops'];
    let firstColor = null;
    
    for (let j = 0; j < stopPropertyNames.length; j++) {
      const propName = stopPropertyNames[j];
      if (gradient[propName] && Array.isArray(gradient[propName]) && gradient[propName].length > 0) {
        const firstStop = gradient[propName][0];
        if (firstStop && typeof firstStop === 'object' && firstStop.color) {
          firstColor = firstStop.color;
        }
        break;
      }
    }
    
    // Verify the property
    let testPassed = true;
    let errorMessage = '';
    
    if (gradient.enabled === false) {
      // If gradient is disabled, result should be null
      if (result !== null) {
        testPassed = false;
        errorMessage = 'Expected null for disabled gradient, got: ' + JSON.stringify(result);
      }
    } else {
      // Gradient is enabled (true or undefined)
      if (firstColor) {
        // Should return a solid fill
        if (!result || result.type !== 'SOLID') {
          testPassed = false;
          errorMessage = 'Expected SOLID fill, got: ' + JSON.stringify(result);
        } else if (!result.color || typeof result.color !== 'object') {
          testPassed = false;
          errorMessage = 'Expected color object in fill, got: ' + JSON.stringify(result);
        } else {
          // Verify the color values are valid (between 0 and 1)
          const { r, g, b } = result.color;
          if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) {
            testPassed = false;
            errorMessage = `Invalid color values: r=${r}, g=${g}, b=${b}`;
          }
        }
      } else {
        // No valid color stops, should return null
        if (result !== null) {
          testPassed = false;
          errorMessage = 'Expected null for gradient with no valid stops, got: ' + JSON.stringify(result);
        }
      }
    }
    
    if (testPassed) {
      passed++;
    } else {
      failed++;
      failures.push({
        iteration: i + 1,
        gradient: gradient,
        result: result,
        error: errorMessage
      });
    }
  }
  
  // Report results
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}/${iterations}`);
  console.log(`Failed: ${failed}/${iterations}`);
  
  if (failed > 0) {
    console.log('\n=== Failures ===');
    failures.forEach(failure => {
      console.log(`\nIteration ${failure.iteration}:`);
      console.log('Gradient:', JSON.stringify(failure.gradient, null, 2));
      console.log('Result:', JSON.stringify(failure.result, null, 2));
      console.log('Error:', failure.error);
    });
  }
  
  if (passed === iterations) {
    console.log('\n🎉 All property tests passed!');
    return true;
  } else {
    console.log('\n⚠️ Some property tests failed. See details above.');
    return false;
  }
}

// Run the property tests
console.log('='.repeat(60));
console.log('PROPERTY-BASED TESTS FOR GRADIENT COLOR HANDLING');
console.log('='.repeat(60));

const test1Passed = testGradientDetectionAndEnabledFlag(100);
const test2Passed = testGradientFallbackConversion(100);

console.log('\n' + '='.repeat(60));
console.log('OVERALL RESULTS');
console.log('='.repeat(60));
console.log('Property 1 (Gradient Detection): ' + (test1Passed ? '✅ PASSED' : '❌ FAILED'));
console.log('Property 2 (Gradient Fallback): ' + (test2Passed ? '✅ PASSED' : '❌ FAILED'));

if (test1Passed && test2Passed) {
  console.log('\n🎉 All property-based tests passed!');
} else {
  console.log('\n⚠️ Some property-based tests failed.');
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGradientDetectionAndEnabledFlag,
    testGradientFallbackConversion,
    parseColor,
    extractGradientFallbackColor
  };
}
