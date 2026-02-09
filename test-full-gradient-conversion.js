// Test full gradient conversion to Figma format

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

function convertToFigmaGradient(gradientObject, variables, context) {
  if (!gradientObject || typeof gradientObject !== 'object') {
    return null;
  }

  const gradientType = gradientObject.gradientType || 'linear';
  
  const possibleStopProperties = ['stops', 'colors', 'colorStops', 'gradientStops'];
  let stops = null;
  
  for (let i = 0; i < possibleStopProperties.length; i++) {
    const propName = possibleStopProperties[i];
    if (gradientObject[propName] && Array.isArray(gradientObject[propName])) {
      stops = gradientObject[propName];
      break;
    }
  }
  
  if (!stops || stops.length === 0) {
    return null;
  }
  
  const figmaStops = [];
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    let colorValue = stop.color || stop;
    let position = stop.position !== undefined ? stop.position : (i / (stops.length - 1));
    
    if (typeof colorValue === 'object' && colorValue.type === 'color') {
      colorValue = colorValue.color;
    }
    
    let rgb = null;
    
    if (typeof colorValue === 'string') {
      const resolved = resolveVariable(colorValue, variables);
      if (resolved.startsWith('#')) {
        rgb = hexToRgb(resolved);
      } else if (resolved.startsWith('rgb')) {
        rgb = parseRgb(resolved);
      }
    }
    
    if (!rgb) {
      console.warn('[convertToFigmaGradient] Could not parse color stop:', colorValue);
      continue;
    }
    
    figmaStops.push({
      position: position,
      color: rgb
    });
  }
  
  if (figmaStops.length === 0) {
    return null;
  }
  
  const figmaGradient = {
    type: gradientType === 'radial' ? 'GRADIENT_RADIAL' : 'GRADIENT_LINEAR',
    gradientStops: figmaStops
  };
  
  if (gradientType === 'linear') {
    const rotation = gradientObject.rotation || 0;
    const angleRad = (rotation * Math.PI) / 180;
    
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    figmaGradient.gradientTransform = [
      [cos, -sin, 0.5 - 0.5 * cos + 0.5 * sin],
      [sin, cos, 0.5 - 0.5 * sin - 0.5 * cos]
    ];
  } else {
    figmaGradient.gradientTransform = [
      [1, 0, 0],
      [0, 1, 0]
    ];
  }
  
  console.log('[convertToFigmaGradient] Converted ' + gradientType + ' gradient with ' + figmaStops.length + ' stops');
  
  return figmaGradient;
}

// Test cases
console.log('\n=== Test 1: Linear gradient (0 degrees) ===');
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 0,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
const result1 = convertToFigmaGradient(gradient1, {}, 'Test 1');
console.log(JSON.stringify(result1, null, 2));

console.log('\n=== Test 2: Linear gradient (90 degrees) ===');
const gradient2 = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 90,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 0.5, color: '#00FF00' },
    { position: 1, color: '#0000FF' }
  ]
};
const result2 = convertToFigmaGradient(gradient2, {}, 'Test 2');
console.log(JSON.stringify(result2, null, 2));

console.log('\n=== Test 3: Radial gradient ===');
const gradient3 = {
  type: 'gradient',
  gradientType: 'radial',
  stops: [
    { position: 0, color: '#FFFFFF' },
    { position: 1, color: '#000000' }
  ]
};
const result3 = convertToFigmaGradient(gradient3, {}, 'Test 3');
console.log(JSON.stringify(result3, null, 2));

console.log('\n=== Test 4: Gradient with variables ===');
const gradient4 = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 45,
  stops: [
    { position: 0, color: '$primary' },
    { position: 1, color: '$secondary' }
  ]
};
const variables = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4'
};
const result4 = convertToFigmaGradient(gradient4, variables, 'Test 4');
console.log(JSON.stringify(result4, null, 2));

console.log('\n=== Test 5: Gradient without positions (auto-calculate) ===');
const gradient5 = {
  type: 'gradient',
  gradientType: 'linear',
  stops: [
    { color: '#FF0000' },
    { color: '#00FF00' },
    { color: '#0000FF' }
  ]
};
const result5 = convertToFigmaGradient(gradient5, {}, 'Test 5');
console.log(JSON.stringify(result5, null, 2));

console.log('\n✅ All gradient conversion tests completed!');
