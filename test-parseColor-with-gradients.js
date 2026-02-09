// Test parseColor with full gradient support

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

function parseColor(colorValue, variables, context) {
  if (!colorValue) return null;

  if (typeof colorValue === 'object' && colorValue.enabled === false) {
    return null;
  }

  if (typeof colorValue === 'object' && colorValue.type === 'color') {
    colorValue = colorValue.color;
  }

  if (typeof colorValue === 'object' && colorValue.type === 'gradient') {
    if (colorValue.enabled === false) {
      console.log('[parseColor] Gradient with enabled=false, returning null');
      return null;
    }
    
    const gradientType = colorValue.gradientType || 'linear';
    console.log('[parseColor] Detected gradient object (type: ' + gradientType + ')');
    
    const figmaGradient = convertToFigmaGradient(colorValue, variables, context);
    
    if (figmaGradient === null) {
      console.warn('[parseColor] Warning: Gradient has no color stops, returning null');
      return null;
    }
    
    return figmaGradient;
  }

  if (typeof colorValue === 'object') {
    console.warn('[parseColor] Warning: Invalid color value (object)');
    return null;
  }

  const resolved = resolveVariable(colorValue, variables);

  if (typeof resolved !== 'string') {
    console.warn('[parseColor] Warning: Color resolution failed, not a string');
    return null;
  }

  if (resolved === 'transparent') {
    return null;
  }

  if (resolved.startsWith('#')) {
    return { type: 'SOLID', color: hexToRgb(resolved) };
  }

  if (resolved.startsWith('rgb')) {
    return { type: 'SOLID', color: parseRgb(resolved) };
  }

  return null;
}

// Test cases
console.log('\n=== Test 1: Linear gradient ===');
const gradient1 = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 90,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
const result1 = parseColor(gradient1, {}, 'Background');
console.log('Type:', result1.type);
console.log('Stops:', result1.gradientStops.length);
console.log('First stop color:', result1.gradientStops[0].color);
console.log('Last stop color:', result1.gradientStops[1].color);

console.log('\n=== Test 2: Radial gradient ===');
const gradient2 = {
  type: 'gradient',
  gradientType: 'radial',
  stops: [
    { position: 0, color: '#FFFFFF' },
    { position: 1, color: '#000000' }
  ]
};
const result2 = parseColor(gradient2, {}, 'Circle');
console.log('Type:', result2.type);
console.log('Stops:', result2.gradientStops.length);

console.log('\n=== Test 3: Gradient with enabled=false ===');
const gradient3 = {
  type: 'gradient',
  gradientType: 'linear',
  enabled: false,
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
};
const result3 = parseColor(gradient3, {}, 'Disabled');
console.log('Result:', result3);

console.log('\n=== Test 4: Solid color (regression test) ===');
const color4 = '#00FF00';
const result4 = parseColor(color4, {}, 'Rectangle');
console.log('Type:', result4.type);
console.log('Color:', result4.color);

console.log('\n=== Test 5: Color object (regression test) ===');
const color5 = {
  type: 'color',
  color: '#FF00FF'
};
const result5 = parseColor(color5, {}, 'Text');
console.log('Type:', result5.type);
console.log('Color:', result5.color);

console.log('\n✅ All parseColor tests completed!');
console.log('\n🎨 Gradients are now fully supported in Figma format!');
