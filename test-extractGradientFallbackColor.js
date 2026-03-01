// Unit tests for extractGradientFallbackColor function
// Tests Requirements: 2.1, 2.2, 2.4, 5.1, 5.2

// Copy the function to test
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

// Test helper
function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAILED:', message);
    return false;
  } else {
    console.log('✅ PASSED:', message);
    return true;
  }
}

function assertEqual(actual, expected, message) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  if (!passed) {
    console.error('❌ FAILED:', message);
    console.error('  Expected:', expected);
    console.error('  Actual:', actual);
    return false;
  } else {
    console.log('✅ PASSED:', message);
    return true;
  }
}

// Run tests
console.log('\n=== Testing extractGradientFallbackColor ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Extract color from 'stops' property
totalTests++;
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient1), '#FF0000', 'Extract color from stops property')) {
  passedTests++;
}

// Test 2: Extract color from 'colors' property
totalTests++;
const gradient2 = {
  type: 'gradient',
  gradientType: 'radial',
  colors: [
    { position: 0, color: 'rgb(255, 0, 0)' },
    { position: 1, color: 'rgb(0, 0, 255)' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient2), 'rgb(255, 0, 0)', 'Extract color from colors property')) {
  passedTests++;
}

// Test 3: Extract color from 'colorStops' property
totalTests++;
const gradient3 = {
  type: 'gradient',
  gradientType: 'linear',
  colorStops: [
    { position: 0, color: '#00FF00' },
    { position: 1, color: '#FFFF00' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient3), '#00FF00', 'Extract color from colorStops property')) {
  passedTests++;
}

// Test 4: Extract color from 'gradientStops' property
totalTests++;
const gradient4 = {
  type: 'gradient',
  gradientType: 'radial',
  gradientStops: [
    { position: 0, color: 'rgba(255, 0, 0, 0.5)' },
    { position: 1, color: 'rgba(0, 0, 255, 0.5)' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient4), 'rgba(255, 0, 0, 0.5)', 'Extract color from gradientStops property')) {
  passedTests++;
}

// Test 5: Handle empty stops array
totalTests++;
const gradient5 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: []
};
if (assertEqual(extractGradientFallbackColor(gradient5), null, 'Return null for empty stops array')) {
  passedTests++;
}

// Test 6: Handle missing stops property
totalTests++;
const gradient6 = {
  type: 'gradient',
  gradientType: 'linear'
};
if (assertEqual(extractGradientFallbackColor(gradient6), null, 'Return null for missing stops property')) {
  passedTests++;
}

// Test 7: Handle null input
totalTests++;
if (assertEqual(extractGradientFallbackColor(null), null, 'Return null for null input')) {
  passedTests++;
}

// Test 8: Handle undefined input
totalTests++;
if (assertEqual(extractGradientFallbackColor(undefined), null, 'Return null for undefined input')) {
  passedTests++;
}

// Test 9: Handle non-object input
totalTests++;
if (assertEqual(extractGradientFallbackColor('not an object'), null, 'Return null for non-object input')) {
  passedTests++;
}

// Test 10: Handle stops with direct color values (not objects)
totalTests++;
const gradient10 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: ['#FF0000', '#0000FF']
};
if (assertEqual(extractGradientFallbackColor(gradient10), '#FF0000', 'Extract direct color value from stops')) {
  passedTests++;
}

// Test 11: Handle stop object without color property
totalTests++;
const gradient11 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, value: '#FF0000' },
    { position: 1, value: '#0000FF' }
  ]
};
const result11 = extractGradientFallbackColor(gradient11);
if (assert(result11 !== null && typeof result11 === 'object', 'Return stop object when no color property found')) {
  passedTests++;
}

// Test 12: Handle stops that is not an array
totalTests++;
const gradient12 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: 'not an array'
};
if (assertEqual(extractGradientFallbackColor(gradient12), null, 'Return null when stops is not an array')) {
  passedTests++;
}

// Test 13: Handle gradient with only one stop
totalTests++;
const gradient13 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '#FF0000' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient13), '#FF0000', 'Extract color from single stop')) {
  passedTests++;
}

// Test 14: Handle stop with color object (nested color object)
totalTests++;
const gradient14 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: { type: 'color', color: '#FF0000' } },
    { position: 1, color: '#0000FF' }
  ]
};
const result14 = extractGradientFallbackColor(gradient14);
if (assert(result14 !== null && typeof result14 === 'object', 'Return nested color object')) {
  passedTests++;
}

// Test 15: Handle stop with null color
totalTests++;
const gradient15 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: null },
    { position: 1, color: '#0000FF' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient15), null, 'Return null when first stop color is null')) {
  passedTests++;
}

// Test 16: Handle stop with undefined color
totalTests++;
const gradient16 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: undefined },
    { position: 1, color: '#0000FF' }
  ]
};
const result16 = extractGradientFallbackColor(gradient16);
if (assert(result16 !== null && typeof result16 === 'object', 'Return stop object when color is undefined')) {
  passedTests++;
}

// Test 17: Handle variable reference in color
totalTests++;
const gradient17 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '$red' },
    { position: 1, color: '$blue' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient17), '$red', 'Extract variable reference from stop')) {
  passedTests++;
}

// Test 18: Prioritize 'stops' over other property names
totalTests++;
const gradient18 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '#FF0000' }
  ],
  colors: [
    { position: 0, color: '#00FF00' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient18), '#FF0000', 'Prioritize stops property over colors')) {
  passedTests++;
}

// Test 19: Handle malformed gradient object with extra properties
totalTests++;
const gradient19 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  rotation: 45,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 0.5, color: '#00FF00' },
    { position: 1, color: '#0000FF' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient19), '#FF0000', 'Extract color from gradient with extra properties')) {
  passedTests++;
}

// Test 20: Handle stop with zero position
totalTests++;
const gradient20 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 0.5, color: '#00FF00' }
  ]
};
if (assertEqual(extractGradientFallbackColor(gradient20), '#FF0000', 'Extract color from stop with position 0')) {
  passedTests++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passedTests}/${totalTests}`);
console.log(`Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️ Some tests failed. Please review the output above.');
}
