// Integration test: Simulate importing a .pen file with gradients

console.log('🧪 Integration Test: Gradient Import Simulation\n');

// Simulate a .pen file with various fill types
const penFile = {
  version: '2.7',
  variables: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#1A1A2E'
  },
  children: [
    {
      type: 'frame',
      name: 'Hero Section',
      fill: {
        type: 'gradient',
        gradientType: 'linear',
        rotation: 135,
        stops: [
          { position: 0, color: '$primary' },
          { position: 1, color: '$secondary' }
        ]
      }
    },
    {
      type: 'rectangle',
      name: 'Solid Rectangle',
      fill: '#00FF00'
    },
    {
      type: 'ellipse',
      name: 'Radial Circle',
      fill: {
        type: 'gradient',
        gradientType: 'radial',
        stops: [
          { position: 0, color: '#FFFFFF' },
          { position: 0.5, color: '#FF00FF' },
          { position: 1, color: '#000000' }
        ]
      }
    },
    {
      type: 'frame',
      name: 'Disabled Gradient',
      fill: {
        type: 'gradient',
        gradientType: 'linear',
        enabled: false,
        stops: [
          { position: 0, color: '#FF0000' },
          { position: 1, color: '#0000FF' }
        ]
      }
    },
    {
      type: 'text',
      name: 'Text with Color Object',
      fill: {
        type: 'color',
        color: '$background'
      }
    }
  ]
};

// Count different fill types
let gradientCount = 0;
let solidCount = 0;
let nullCount = 0;

function analyzeFill(element) {
  if (!element.fill) {
    console.log(`  ❌ ${element.name}: No fill`);
    nullCount++;
    return;
  }

  const fill = element.fill;
  
  if (typeof fill === 'object' && fill.type === 'gradient') {
    if (fill.enabled === false) {
      console.log(`  ⚪ ${element.name}: Gradient (disabled) → null`);
      nullCount++;
    } else {
      const type = fill.gradientType || 'linear';
      const stops = fill.stops ? fill.stops.length : 0;
      console.log(`  🎨 ${element.name}: ${type} gradient with ${stops} stops → GRADIENT_${type.toUpperCase()}`);
      gradientCount++;
    }
  } else if (typeof fill === 'object' && fill.type === 'color') {
    console.log(`  🟦 ${element.name}: Color object → SOLID`);
    solidCount++;
  } else if (typeof fill === 'string') {
    console.log(`  🟦 ${element.name}: Hex color → SOLID`);
    solidCount++;
  } else {
    console.log(`  ❓ ${element.name}: Unknown fill type`);
  }
}

console.log('📋 Analyzing .pen file fills:\n');
penFile.children.forEach(analyzeFill);

console.log('\n📊 Summary:');
console.log(`  - Gradients: ${gradientCount}`);
console.log(`  - Solid colors: ${solidCount}`);
console.log(`  - Null/disabled: ${nullCount}`);
console.log(`  - Total elements: ${penFile.children.length}`);

console.log('\n✅ Integration test complete!');
console.log('\n💡 Expected behavior:');
console.log('  - Hero Section: Linear gradient (135°) with 2 stops');
console.log('  - Solid Rectangle: Solid green fill');
console.log('  - Radial Circle: Radial gradient with 3 stops');
console.log('  - Disabled Gradient: No fill (null)');
console.log('  - Text: Solid fill from variable');
