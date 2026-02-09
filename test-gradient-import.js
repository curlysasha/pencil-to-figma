// Test gradient import to see what's broken
// This simulates importing a pen file with gradients

// Simulate the parseColor function from code.js
function extractGradientFallbackColor(gradientObject) {
  if (!gradientObject || typeof gradientObject !== 'object') {
    return null;
  }

  const possibleStopProperties = ['stops', 'colors', 'colorStops', 'gradientStops'];
  
  for (let i = 0; i < possibleStopProperties.length; i++) {
    const propName = possibleStopProperties[i];
    const stops = gradientObject[propName];
    
    if (stops && Array.isArray(stops) && stops.length > 0) {
      const firstStop = stops[0];
      
      if (firstStop && typeof firstStop === 'object') {
        if (firstStop.color !== undefined) {
          return firstStop.color;
        }
        return firstStop;
      } else if (firstStop !== undefined && firstStop !== null) {
        return firstStop;
      }
    }
  }

  return null;
}

function parseColor(colorValue, variables, context) {
  console.log(`[parseColor] Input:`, JSON.stringify(colorValue), `Context: ${context}`);
  
  if (!colorValue) return null;

  if (typeof colorValue === 'object' && colorValue.enabled === false) {
    console.log(`[parseColor] Disabled fill, returning null`);
    return null;
  }

  if (typeof colorValue === 'object' && colorValue.type === 'color') {
    colorValue = colorValue.color;
    console.log(`[parseColor] Unwrapped color object to:`, colorValue);
  }

  if (typeof colorValue === 'object' && colorValue.type === 'gradient') {
    if (colorValue.enabled === false) {
      console.log(`[parseColor] Gradient disabled, returning null`);
      return null;
    }
    
    const gradientType = colorValue.gradientType || 'unknown';
    console.log(`[parseColor] Detected gradient (type: ${gradientType})`);
    
    const fallbackColor = extractGradientFallbackColor(colorValue);
    console.log(`[parseColor] Extracted fallback color:`, fallbackColor);
    
    if (fallbackColor === null) {
      console.warn(`[parseColor] No color stops in gradient`);
      return null;
    }
    
    console.warn(`[parseColor] Applying gradient fallback`);
    colorValue = fallbackColor;
    
    if (typeof colorValue === 'object' && colorValue.type === 'color') {
      colorValue = colorValue.color;
      console.log(`[parseColor] Unwrapped fallback color object to:`, colorValue);
    }
  }

  if (typeof colorValue === 'object') {
    console.warn(`[parseColor] Invalid color value (still an object):`, JSON.stringify(colorValue));
    return null;
  }

  console.log(`[parseColor] Final color value:`, colorValue);
  
  if (colorValue === 'transparent') {
    return null;
  }

  if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
    return { type: 'SOLID', color: colorValue };
  }

  return null;
}

// Test cases
console.log('\n=== Test 1: Simple gradient ===');
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
const result1 = parseColor(gradient1, {}, 'Test Element 1');
console.log('Result:', JSON.stringify(result1));

console.log('\n=== Test 2: Gradient with enabled=false ===');
const gradient2 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: false,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
const result2 = parseColor(gradient2, {}, 'Test Element 2');
console.log('Result:', JSON.stringify(result2));

console.log('\n=== Test 3: Color object with enabled=false ===');
const color3 = {
  type: 'color',
  color: '#FF0000',
  enabled: false
};
const result3 = parseColor(color3, {}, 'Test Element 3');
console.log('Result:', JSON.stringify(result3));

console.log('\n=== Test 4: Simple hex color ===');
const color4 = '#00FF00';
const result4 = parseColor(color4, {}, 'Test Element 4');
console.log('Result:', JSON.stringify(result4));

console.log('\n=== Test 5: Color object (enabled) ===');
const color5 = {
  type: 'color',
  color: '#0000FF'
};
const result5 = parseColor(color5, {}, 'Test Element 5');
console.log('Result:', JSON.stringify(result5));
