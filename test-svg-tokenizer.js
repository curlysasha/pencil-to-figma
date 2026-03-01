// Test for SVG path tokenizer fix
// Tests the bug where "M9.187 0" was being incorrectly tokenized

function tokenizeSvgPath(path) {
  const tokens = [];
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    // Skip whitespace and commas
    if (/[\s,]/.test(char)) {
      i++;
      continue;
    }

    // Check for command letter
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // Parse number (including negative, decimals, scientific notation)
    let numStr = '';
    
    // Handle negative sign
    if (char === '-') {
      numStr += char;
      i++;
    }
    
    // Parse digits and decimal point
    let hasDecimal = false;
    let hasExponent = false;
    
    while (i < path.length) {
      const c = path[i];
      
      if (/[0-9]/.test(c)) {
        numStr += c;
        i++;
      } else if (c === '.' && !hasDecimal && !hasExponent) {
        numStr += c;
        hasDecimal = true;
        i++;
      } else if (/[eE]/.test(c) && !hasExponent && numStr.length > 0) {
        // Scientific notation
        numStr += c;
        hasExponent = true;
        i++;
        // Check for sign after exponent
        if (i < path.length && /[+-]/.test(path[i])) {
          numStr += path[i];
          i++;
        }
      } else {
        // End of number
        break;
      }
    }
    
    if (numStr.length > 0 && numStr !== '-') {
      tokens.push(parseFloat(numStr));
    } else if (numStr === '-') {
      // Lone minus sign, skip it
      console.warn('Lone minus sign in path, skipping');
    }
  }

  return tokens;
}

// Test helper
function assertEqual(actual, expected, testName) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log('✓ PASS:', testName);
    return true;
  } else {
    console.log('✗ FAIL:', testName);
    console.log('  Expected:', expectedStr);
    console.log('  Actual:', actualStr);
    return false;
  }
}

console.log('\n=== Testing SVG Path Tokenizer Fix ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: The bug case - "M9.187" should tokenize as ["M", 9.187]
totalTests++;
const result1 = tokenizeSvgPath('M9.187 0');
if (assertEqual(result1, ['M', 9.187, 0], 'M9.187 0 (the bug case)')) {
  passedTests++;
}

// Test 2: Another bug case from errors - "M7.07104"
totalTests++;
const result2 = tokenizeSvgPath('M7.07104 5.5');
if (assertEqual(result2, ['M', 7.07104, 5.5], 'M7.07104 5.5')) {
  passedTests++;
}

// Test 3: Command with integer immediately after - "M12"
totalTests++;
const result3 = tokenizeSvgPath('M12 8');
if (assertEqual(result3, ['M', 12, 8], 'M12 8')) {
  passedTests++;
}

// Test 4: Command with zero - "M0"
totalTests++;
const result4 = tokenizeSvgPath('M0 0');
if (assertEqual(result4, ['M', 0, 0], 'M0 0')) {
  passedTests++;
}

// Test 5: Normal path with spaces
totalTests++;
const result5 = tokenizeSvgPath('M 10 20 L 30 40');
if (assertEqual(result5, ['M', 10, 20, 'L', 30, 40], 'M 10 20 L 30 40 (with spaces)')) {
  passedTests++;
}

// Test 6: Path with negative numbers
totalTests++;
const result6 = tokenizeSvgPath('M10-5L-3 4');
if (assertEqual(result6, ['M', 10, -5, 'L', -3, 4], 'M10-5L-3 4 (negative numbers)')) {
  passedTests++;
}

// Test 7: Path with multiple decimals
totalTests++;
const result7 = tokenizeSvgPath('M1.5.5L2.3.7');
if (assertEqual(result7, ['M', 1.5, 0.5, 'L', 2.3, 0.7], 'M1.5.5L2.3.7 (multiple decimals)')) {
  passedTests++;
}

// Test 8: Complex path from actual error
totalTests++;
const result8 = tokenizeSvgPath('M9.187 0l-2.81 6.376');
if (assertEqual(result8, ['M', 9.187, 0, 'l', -2.81, 6.376], 'M9.187 0l-2.81 6.376 (complex path)')) {
  passedTests++;
}

// Test 9: Path with commas
totalTests++;
const result9 = tokenizeSvgPath('M10,20L30,40');
if (assertEqual(result9, ['M', 10, 20, 'L', 30, 40], 'M10,20L30,40 (with commas)')) {
  passedTests++;
}

// Test 10: Path with scientific notation
totalTests++;
const result10 = tokenizeSvgPath('M1e-5 2e-3');
if (assertEqual(result10, ['M', 1e-5, 2e-3], 'M1e-5 2e-3 (scientific notation)')) {
  passedTests++;
}

// Test 11: Lowercase commands
totalTests++;
const result11 = tokenizeSvgPath('m10.5 20.3l5 10');
if (assertEqual(result11, ['m', 10.5, 20.3, 'l', 5, 10], 'm10.5 20.3l5 10 (lowercase)')) {
  passedTests++;
}

// Test 12: Close path command
totalTests++;
const result12 = tokenizeSvgPath('M0 0L10 10Z');
if (assertEqual(result12, ['M', 0, 0, 'L', 10, 10, 'Z'], 'M0 0L10 10Z (with Z)')) {
  passedTests++;
}

// Test 13: Cubic bezier
totalTests++;
const result13 = tokenizeSvgPath('M0 0C10 10 20 20 30 30');
if (assertEqual(result13, ['M', 0, 0, 'C', 10, 10, 20, 20, 30, 30], 'M0 0C10 10 20 20 30 30 (cubic)')) {
  passedTests++;
}

// Test 14: Quadratic bezier
totalTests++;
const result14 = tokenizeSvgPath('M0 0Q10 10 20 20');
if (assertEqual(result14, ['M', 0, 0, 'Q', 10, 10, 20, 20], 'M0 0Q10 10 20 20 (quadratic)')) {
  passedTests++;
}

// Test 15: Arc command
totalTests++;
const result15 = tokenizeSvgPath('M0 0A10 10 0 0 1 20 20');
if (assertEqual(result15, ['M', 0, 0, 'A', 10, 10, 0, 0, 1, 20, 20], 'M0 0A10 10 0 0 1 20 20 (arc)')) {
  passedTests++;
}

// Test 16: Very small decimals
totalTests++;
const result16 = tokenizeSvgPath('M0.001 0.002');
if (assertEqual(result16, ['M', 0.001, 0.002], 'M0.001 0.002 (small decimals)')) {
  passedTests++;
}

// Test 17: Large numbers
totalTests++;
const result17 = tokenizeSvgPath('M135.58105 200.123');
if (assertEqual(result17, ['M', 135.58105, 200.123], 'M135.58105 200.123 (large numbers)')) {
  passedTests++;
}

// Test 18: Mixed case commands
totalTests++;
const result18 = tokenizeSvgPath('M10 20l5 5L20 30');
if (assertEqual(result18, ['M', 10, 20, 'l', 5, 5, 'L', 20, 30], 'M10 20l5 5L20 30 (mixed case)')) {
  passedTests++;
}

// Test 19: Horizontal and vertical lines
totalTests++;
const result19 = tokenizeSvgPath('M0 0H10V10');
if (assertEqual(result19, ['M', 0, 0, 'H', 10, 'V', 10], 'M0 0H10V10 (H and V)')) {
  passedTests++;
}

// Test 20: Smooth curves
totalTests++;
const result20 = tokenizeSvgPath('M0 0S10 10 20 20T30 30');
if (assertEqual(result20, ['M', 0, 0, 'S', 10, 10, 20, 20, 'T', 30, 30], 'M0 0S10 10 20 20T30 30 (S and T)')) {
  passedTests++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log('Passed:', passedTests, '/', totalTests);
console.log('Failed:', totalTests - passedTests);

if (passedTests === totalTests) {
  console.log('\n✅ All tests passed! The tokenizer bug is fixed.');
} else {
  console.log('\n❌ Some tests failed. The tokenizer needs more work.');
}
