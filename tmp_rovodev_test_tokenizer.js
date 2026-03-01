// Test tokenizer function
function tokenizeSvgPath(path) {
  const tokens = [];
  let current = '';

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (/\s|,/.test(char)) {
      // Whitespace or comma - finalize current token
      if (current) {
        tokens.push(isNaN(current) ? current : parseFloat(current));
        current = '';
      }
    } else if (/[MmLlHhVvCcSsQqTtAaZz]/.test(char)) {
      // Command letter
      if (current) {
        tokens.push(isNaN(current) ? current : parseFloat(current));
        current = '';
      }
      tokens.push(char);
    } else if (char === '-' && current && !/[eE]$/.test(current)) {
      // Negative sign (new number)
      if (current) {
        tokens.push(parseFloat(current));
      }
      current = char;
    } else if (char === '.' && current.includes('.')) {
      // Second decimal point means new number
      tokens.push(parseFloat(current));
      current = '0.';
    } else {
      current += char;
    }
  }

  // Don't forget the last token
  if (current) {
    tokens.push(isNaN(current) ? current : parseFloat(current));
  }

  return tokens;
}

// Test with failing paths
const testPaths = [
  "M9.187 0l-2.81 6.376-6.377 2.811 6.377 2.811 2.81 6.378 2.812-6.377 6.376-2.811-6.376-2.811-2.812-6.377z",
  "M7.07104 3.53555l-3.53552 0-3.53552 0m3.53552-3.53555l0 3.53555 0 3.53549",
  "M0 0l6 6 6-6",
  "M12 0"
];

testPaths.forEach((path, idx) => {
  console.log(`\n=== Test ${idx + 1}: ${path.substring(0, 50)}...`);
  const tokens = tokenizeSvgPath(path);
  console.log('Tokens:', tokens);
  console.log('Token count:', tokens.length);
  console.log('First 10 tokens:', tokens.slice(0, 10));
});
