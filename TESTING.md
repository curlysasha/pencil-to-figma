# Testing Guide for Figma Pencil Plugin

## Quick Test

1. **Open Figma Desktop**
2. **Load the plugin**: Plugins → Development → Pencil.dev Sync
3. **Import a test file**: Use `test files/untitled.pen` or `test files/pencil-welcome.pen`

## What to Test

### Basic Import
- [ ] Plugin UI loads without errors
- [ ] Can select and load a .pen file
- [ ] File analysis shows correct statistics
- [ ] Can navigate to canvas and place import
- [ ] Import completes successfully

### Text Rendering
- [ ] Text nodes are created with correct content
- [ ] Fonts load properly (or fall back to Inter)
- [ ] Italic text is handled correctly
- [ ] Text colors are applied

### Icon Fonts
- [ ] Icon font elements are rendered as placeholders
- [ ] Placeholders have correct dimensions
- [ ] Icon metadata is stored in plugin data

### Colors
- [ ] Hex colors (#FFFFFF) work
- [ ] RGB colors work
- [ ] Variable colors ($--foreground) work
- [ ] Transparent colors are handled
- [ ] Invalid colors don't crash the plugin

### Vectors
- [ ] SVG paths are converted to Figma vectors
- [ ] Simple paths (M, L, Z) work
- [ ] Complex paths (C, Q) work
- [ ] Failed paths show placeholders

### Layout
- [ ] Auto-layout frames are created correctly
- [ ] Horizontal and vertical layouts work
- [ ] Padding and gap are applied
- [ ] Nested layouts work

### Components
- [ ] Reusable frames become components
- [ ] Component instances are created
- [ ] Instance overrides are applied

### Error Handling
- [ ] Unknown element types are skipped with warnings
- [ ] Failed nodes don't stop the entire import
- [ ] Error messages are clear and helpful
- [ ] Console shows useful debugging information

## Expected Console Output

When importing successfully, you should see:
```
Pencil.dev Sync Plugin v2.5 loaded
Creating nodes from pen data. Top-level children count: X
Creating top-level node 0: [name] (type: [type]), has X children
Appended [name] to page. Node has X children
...
```

## Known Warnings (Expected)

These warnings are normal and expected:
- "Unknown element type: prompt" - Prompt elements are not yet supported
- "Failed to parse geometry for [name]" - Some complex SVG paths may not convert perfectly
- "Icon font placeholder created for [name]" - Icon fonts are rendered as placeholders

## Error Scenarios to Test

1. **Invalid pen file**: Try importing a non-JSON file
2. **Missing fonts**: Import file with fonts not installed on your system
3. **Complex vectors**: Import file with complex SVG paths
4. **Large files**: Import file with 100+ elements

## Performance

- Imports should complete in < 5 seconds for files with < 100 elements
- Large files (500+ elements) may take 10-30 seconds
- Progress is shown in console logs

## Reporting Issues

If you encounter issues, please provide:
1. The pen file that caused the issue (if possible)
2. Console error messages
3. Figma version
4. Operating system
5. Steps to reproduce
