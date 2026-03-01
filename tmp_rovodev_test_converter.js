// Test the full conversion function
function tokenizeSvgPath(path) {
  const tokens = [];
  let current = '';

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (/\s|,/.test(char)) {
      if (current) {
        tokens.push(isNaN(current) ? current : parseFloat(current));
        current = '';
      }
    } else if (/[MmLlHhVvCcSsQqTtAaZz]/.test(char)) {
      if (current) {
        tokens.push(isNaN(current) ? current : parseFloat(current));
        current = '';
      }
      tokens.push(char);
    } else if (char === '-' && current && !/[eE]$/.test(current)) {
      if (current) {
        tokens.push(parseFloat(current));
      }
      current = char;
    } else if (char === '.' && current.includes('.')) {
      tokens.push(parseFloat(current));
      current = '0.';
    } else {
      current += char;
    }
  }

  if (current) {
    tokens.push(isNaN(current) ? current : parseFloat(current));
  }

  return tokens;
}

function convertSvgPathToFigma(pathData) {
  if (!pathData || typeof pathData !== 'string') return null;

  try {
    const tokens = tokenizeSvgPath(pathData);
    if (!tokens || tokens.length === 0) return null;

    const pathSegments = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let i = 0;

    const fmt = (n) => {
      const rounded = Math.round(n * 1000000) / 1000000;
      return rounded;
    };

    while (i < tokens.length) {
      const token = tokens[i];

      if (typeof token === 'string') {
        const command = token;
        const isRelative = command === command.toLowerCase();
        const cmd = command.toUpperCase();

        i++;

        switch (cmd) {
          case 'M': {
            const x = parseFloat(tokens[i++]) || 0;
            const y = parseFloat(tokens[i++]) || 0;
            const absX = isRelative ? currentX + x : x;
            const absY = isRelative ? currentY + y : y;
            pathSegments.push(`M ${fmt(absX)} ${fmt(absY)}`);
            currentX = absX;
            currentY = absY;
            startX = absX;
            startY = absY;

            while (i < tokens.length && typeof tokens[i] === 'number') {
              const lx = parseFloat(tokens[i++]) || 0;
              const ly = parseFloat(tokens[i++]) || 0;
              const absLX = isRelative ? currentX + lx : lx;
              const absLY = isRelative ? currentY + ly : ly;
              pathSegments.push(`L ${fmt(absLX)} ${fmt(absLY)}`);
              currentX = absLX;
              currentY = absLY;
            }
            break;
          }

          case 'L': {
            while (i < tokens.length && typeof tokens[i] === 'number') {
              const x = parseFloat(tokens[i++]) || 0;
              const y = parseFloat(tokens[i++]) || 0;
              const absX = isRelative ? currentX + x : x;
              const absY = isRelative ? currentY + y : y;
              pathSegments.push(`L ${fmt(absX)} ${fmt(absY)}`);
              currentX = absX;
              currentY = absY;
            }
            break;
          }

          case 'Z': {
            pathSegments.push('Z');
            currentX = startX;
            currentY = startY;
            break;
          }

          default:
            console.warn('Unsimplified command:', command);
            i++;
            break;
        }
      } else {
        i++;
      }
    }

    if (pathSegments.length === 0 || !pathSegments[0].startsWith('M')) {
      console.warn('Invalid path result:', pathSegments);
      return null;
    }

    return pathSegments.join(' ');

  } catch (e) {
    console.warn('Error converting SVG path:', e.message);
    return null;
  }
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
  const result = convertSvgPathToFigma(path);
  console.log('Result:', result);
  console.log('Result length:', result ? result.length : 0);
  console.log('First 100 chars:', result ? result.substring(0, 100) : 'null');
});
