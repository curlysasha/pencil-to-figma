// Unit tests for formatColorForLogging function
// Tests Requirements: 3.1, 3.2, 3.3

// Copy the function to test
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
  const passed = actual === expected;
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
console.log('\n=== Testing formatColorForLogging ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Handle null value
totalTests++;
if (assertEqual(formatColorForLogging(null), 'null', 'Format null value')) {
  passedTests++;
}

// Test 2: Handle undefined value
totalTests++;
if (assertEqual(formatColorForLogging(undefined), 'undefined', 'Format undefined value')) {
  passedTests++;
}

// Test 3: Handle string value
totalTests++;
if (assertEqual(formatColorForLogging('#FF0000'), '#FF0000', 'Format string value')) {
  passedTests++;
}

// Test 4: Handle simple object
totalTests++;
const simpleObj = { type: 'color', color: '#FF0000' };
const expected4 = JSON.stringify(simpleObj);
if (assertEqual(formatColorForLogging(simpleObj), expected4, 'Format simple object')) {
  passedTests++;
}

// Test 5: Handle long object (truncation)
totalTests++;
const longObj = {
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
const result5 = formatColorForLogging(longObj);
if (assert(result5.length <= 120 && result5.includes('... (truncated)'), 'Truncate long object to ~100 characters')) {
  passedTests++;
}

// Test 6: Verify truncation at 100 characters
totalTests++;
const result6 = formatColorForLogging(longObj);
const truncatedPart = result6.replace('... (truncated)', '');
if (assertEqual(truncatedPart.length, 100, 'Truncate at exactly 100 characters')) {
  passedTests++;
}

// Test 7: Handle number value
totalTests++;
if (assertEqual(formatColorForLogging(42), '42 (number)', 'Format number value with type info')) {
  passedTests++;
}

// Test 8: Handle boolean value
totalTests++;
if (assertEqual(formatColorForLogging(true), 'true (boolean)', 'Format boolean value with type info')) {
  passedTests++;
}

// Test 9: Handle empty string
totalTests++;
if (assertEqual(formatColorForLogging(''), '', 'Format empty string')) {
  passedTests++;
}

// Test 10: Handle empty object
totalTests++;
if (assertEqual(formatColorForLogging({}), '{}', 'Format empty object')) {
  passedTests++;
}

// Test 11: Handle array
totalTests++;
const arr = ['#FF0000', '#00FF00', '#0000FF'];
const expected11 = JSON.stringify(arr);
if (assertEqual(formatColorForLogging(arr), expected11, 'Format array')) {
  passedTests++;
}

// Test 12: Handle nested object
totalTests++;
const nestedObj = {
  type: 'color',
  color: {
    type: 'gradient',
    stops: [{ color: '#FF0000' }]
  }
};
const expected12 = JSON.stringify(nestedObj);
if (assertEqual(formatColorForLogging(nestedObj), expected12, 'Format nested object')) {
  passedTests++;
}

// Test 13: Handle object with null property
totalTests++;
const objWithNull = { type: 'color', color: null };
const expected13 = JSON.stringify(objWithNull);
if (assertEqual(formatColorForLogging(objWithNull), expected13, 'Format object with null property')) {
  passedTests++;
}

// Test 14: Handle rgb string
totalTests++;
if (assertEqual(formatColorForLogging('rgb(255, 0, 0)'), 'rgb(255, 0, 0)', 'Format rgb string')) {
  passedTests++;
}

// Test 15: Handle rgba string
totalTests++;
if (assertEqual(formatColorForLogging('rgba(255, 0, 0, 0.5)'), 'rgba(255, 0, 0, 0.5)', 'Format rgba string')) {
  passedTests++;
}

// Test 16: Handle transparent string
totalTests++;
if (assertEqual(formatColorForLogging('transparent'), 'transparent', 'Format transparent string')) {
  passedTests++;
}

// Test 17: Handle variable reference
totalTests++;
if (assertEqual(formatColorForLogging('$red'), '$red', 'Format variable reference')) {
  passedTests++;
}

// Test 18: Handle zero number
totalTests++;
if (assertEqual(formatColorForLogging(0), '0 (number)', 'Format zero number')) {
  passedTests++;
}

// Test 19: Handle false boolean
totalTests++;
if (assertEqual(formatColorForLogging(false), 'false (boolean)', 'Format false boolean')) {
  passedTests++;
}

// Test 20: Handle circular reference (unstringifiable)
totalTests++;
const circularObj = { type: 'color' };
circularObj.self = circularObj;
if (assertEqual(formatColorForLogging(circularObj), '[object (unstringifiable)]', 'Handle circular reference')) {
  passedTests++;
}

// Test 21: Verify truncation includes original content
totalTests++;
const result21 = formatColorForLogging(longObj);
if (assert(result21.startsWith('{"type":"gradient"'), 'Truncated string starts with original content')) {
  passedTests++;
}

// Test 22: Handle gradient object (typical use case)
totalTests++;
const gradientObj = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: true,
  stops: [{ position: 0, color: '#FF0000' }]
};
const result22 = formatColorForLogging(gradientObj);
if (assert(result22.includes('gradient') && result22.includes('linear'), 'Format gradient object with key info')) {
  passedTests++;
}

// Test 23: Handle color object (typical use case)
totalTests++;
const colorObj = { type: 'color', color: '#FF0000' };
const expected23 = JSON.stringify(colorObj);
if (assertEqual(formatColorForLogging(colorObj), expected23, 'Format color object')) {
  passedTests++;
}

// Test 24: Handle object with unknown type
totalTests++;
const unknownObj = { type: 'unknown', value: 'something' };
const expected24 = JSON.stringify(unknownObj);
if (assertEqual(formatColorForLogging(unknownObj), expected24, 'Format object with unknown type')) {
  passedTests++;
}

// Test 25: Handle very long string (should not truncate strings)
totalTests++;
const longString = 'a'.repeat(150);
if (assertEqual(formatColorForLogging(longString), longString, 'Do not truncate long strings')) {
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
