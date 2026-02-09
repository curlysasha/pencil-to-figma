# Pen Format to Figma JSON Mapping Guide

## Overview
This document explains how to convert Pencil.dev (.pen) design files to Figma-compatible format.

## Layout Detection

### Auto-Layout Detection Rules
A frame should be treated as auto-layout if ANY of these conditions are true:

1. **Explicit layout property:**
   - `layout: "horizontal"` → Figma `layoutMode: "HORIZONTAL"`
   - `layout: "vertical"` → Figma `layoutMode: "VERTICAL"`
   - `layout: "none"` → Figma `layoutMode: "NONE"` (absolute positioning)

2. **Implicit auto-layout (has layout properties but no explicit layout field):**
   - Has `justifyContent` property → Auto-layout (default to horizontal)
   - Has `alignItems` property → Auto-layout (default to horizontal)
   - Has `gap` property → Auto-layout (default to horizontal)
   - Has `padding` property AND other layout props → Auto-layout

### Layout Direction Inference
If no explicit `layout` field but has layout properties:
- Check `flexDirection: "column"` → Vertical
- Check `flexDirection: "row"` → Horizontal
- Default → Horizontal

## Property Mappings

### Alignment Properties

#### justifyContent (Primary Axis)
Pen format uses CSS flexbox values:
- `"start"` → Figma `primaryAxisAlignItems: "MIN"`
- `"center"` → Figma `primaryAxisAlignItems: "CENTER"`
- `"end"` → Figma `primaryAxisAlignItems: "MAX"`
- `"space_between"` → Figma `primaryAxisAlignItems: "SPACE_BETWEEN"`
- `undefined` → Default to `"MIN"` (start)

#### alignItems (Counter Axis)
Pen format uses CSS flexbox values:
- `"start"` → Figma `counterAxisAlignItems: "MIN"`
- `"center"` → Figma `counterAxisAlignItems: "CENTER"`
- `"end"` → Figma `counterAxisAlignItems: "MAX"`
- `undefined` → Default to `"MIN"` (start)

### Dimension Properties

#### Width/Height Values
- `"fill_container"` → Figma `layoutSizingHorizontal: "FILL"`
- `"hug_contents"` → Figma `layoutSizingHorizontal: "HUG"`
- `"fit_content"` or `"fit_content(0)"` → Figma `layoutSizingVertical: "HUG"`
- Numeric value (e.g., `402`) → Figma `layoutSizingHorizontal: "FIXED"` + `resize(402, ...)`
- `undefined` for auto-layout → Default to `"HUG"`

### Spacing Properties

#### gap
- Direct mapping: Pen `gap: 12` → Figma `itemSpacing: 12`

#### padding
Pen format uses array notation (CSS-style):
- `[top, right, bottom, left]` → Set individual padding values
- `[vertical, horizontal]` → top/bottom = vertical, left/right = horizontal
- `[all]` → All sides same value
- Single number → All sides same value

## Positioning Rules

### When to Set x,y Coordinates

1. **Top-level frames (no parent):**
   - Always set x,y if present in pen file
   - These are positioned on the canvas

2. **Children of absolute-positioned frames (`layout: "none"`):**
   - Set x,y if present in pen file
   - These use absolute positioning within parent

3. **Children of auto-layout frames:**
   - DO NOT set x,y (even if present in pen file)
   - Position is controlled by parent's layout properties
   - Setting x,y will be ignored by Figma

### layoutPositioning Property
For elements that need absolute positioning within auto-layout parent:
- Set `layoutPositioning: "ABSOLUTE"` on the child
- Then x,y can be set explicitly
- Useful for overlays, badges, etc.

## Conversion Flow

### Step 1: Detect Layout Mode
```javascript
function detectLayoutMode(element) {
  // Explicit layout
  if (element.layout === 'horizontal') return 'HORIZONTAL';
  if (element.layout === 'vertical') return 'VERTICAL';
  if (element.layout === 'none') return 'NONE';
  
  // Implicit auto-layout
  const hasLayoutProps = element.justifyContent || 
                         element.alignItems || 
                         element.gap !== undefined;
  
  if (hasLayoutProps) {
    // Check direction hints
    if (element.flexDirection === 'column') return 'VERTICAL';
    if (element.flexDirection === 'row') return 'HORIZONTAL';
    return 'HORIZONTAL'; // Default
  }
  
  return 'NONE'; // Absolute positioning
}
```

### Step 2: Convert Properties
```javascript
function convertElement(element) {
  const converted = { ...element };
  
  // Detect and set layout
  if (element.type === 'frame') {
    converted.layout = detectLayoutMode(element);
    
    // Add defaults for auto-layout
    if (converted.layout !== 'none') {
      if (!converted.justifyContent) converted.justifyContent = 'start';
      if (!converted.alignItems) converted.alignItems = 'start';
      if (!converted.width) converted.width = 'hug_contents';
      if (!converted.height) converted.height = 'hug_contents';
    }
  }
  
  // Don't add x,y if not present in source
  // Children of auto-layout naturally don't have x,y
  
  return converted;
}
```

### Step 3: Create Figma Nodes
```javascript
async function createFrame(element, parentNode) {
  const frame = figma.createFrame();
  
  // Set layout mode FIRST
  frame.layoutMode = mapLayoutMode(element.layout);
  
  // Handle dimensions based on layout mode
  if (frame.layoutMode !== 'NONE') {
    // Auto-layout: store sizing for deferred application
    // Will be applied AFTER children are added
  } else {
    // Absolute: set dimensions directly
    frame.resize(width, height);
  }
  
  // Set position ONLY if not in auto-layout parent
  const isInAutoLayout = parentNode?.layoutMode !== 'NONE';
  if (!isInAutoLayout && element.x !== undefined) {
    frame.x = element.x;
    frame.y = element.y;
  }
  
  // Set layout properties
  if (frame.layoutMode !== 'NONE') {
    frame.itemSpacing = element.gap || 0;
    frame.primaryAxisAlignItems = mapJustifyContent(element.justifyContent);
    frame.counterAxisAlignItems = mapAlignItems(element.alignItems);
    // ... padding, etc.
  }
  
  return frame;
}
```

### Step 4: Apply Deferred Sizing
```javascript
// After appendChild, apply FILL/HUG/FIXED sizing
if (parentNode.layoutMode !== 'NONE') {
  if (element.width === 'fill_container') {
    childNode.layoutSizingHorizontal = 'FILL';
  } else if (element.width === 'hug_contents') {
    childNode.layoutSizingHorizontal = 'HUG';
  } else if (typeof element.width === 'number') {
    childNode.layoutSizingHorizontal = 'FIXED';
  }
  // Same for height
}
```

## Common Issues and Solutions

### Issue: Elements in wrong position
**Cause:** Setting x,y on children of auto-layout frames
**Solution:** Only set x,y for absolute-positioned elements

### Issue: Frames wrong size
**Cause:** Setting resize() before applying HUG/FILL
**Solution:** Apply layoutSizing AFTER children are added

### Issue: justifyContent/alignItems undefined
**Cause:** Not setting defaults for inferred auto-layout
**Solution:** Always set defaults when layout is detected

### Issue: Children not being converted
**Cause:** Deep copy including children, then recursing
**Solution:** Shallow copy properties, recurse on children separately

## Testing Checklist

- [ ] Top-level frames positioned correctly (x,y applied)
- [ ] Auto-layout frames have correct direction (horizontal/vertical)
- [ ] Children of auto-layout NOT positioned with x,y
- [ ] FILL/HUG/FIXED sizing applied correctly
- [ ] Alignment properties (justifyContent/alignItems) working
- [ ] Gap and padding applied correctly
- [ ] Nested auto-layout frames work correctly
- [ ] Mixed absolute and auto-layout positioning works
