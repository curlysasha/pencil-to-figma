# Pencil to Figma Converter

A powerful Figma plugin that enables seamless bidirectional conversion between [Pencil.dev](https://pencil.dev) `.pen` files and Figma designs.

## 🎯 What It Does

This plugin bridges the gap between Pencil.dev (a design tool for IDEs) and Figma by:

1. **Importing** `.pen` files into Figma with full structure preservation
2. **Exporting** Figma designs back to `.pen` format
3. **Compressing** design data when creating elements in Figma
4. **Uncompressing** data when exporting back to `.pen` format

## 🔄 How It Works

### The Compression/Decompression Cycle

#### When Importing (.pen → Figma):
The plugin reads the `.pen` file (which contains structured JSON data) and converts it into native Figma elements:

- **Frames** with auto-layout become Figma frames with layout properties
- **Components** marked as `reusable: true` become Figma components
- **Instances** (`type: "ref"`) become component instances
- **Text, shapes, vectors** are converted to their Figma equivalents
- **Variables** (like `$red`, `$white`) are resolved to actual color values
- **Metadata** is stored invisibly on each node using `pluginData` for sync tracking

**Result**: Your Pencil design is now editable in Figma with all structure intact.

#### When Exporting (Figma → .pen):
The plugin reads Figma nodes and converts them back to `.pen` format:

- Figma frames become `frame` elements
- Components become frames with `reusable: true`
- Instances become `ref` elements with override data
- All properties (colors, dimensions, layout) are extracted
- Metadata is preserved for sync tracking

**Result**: Your Figma design is now a `.pen` file that can be used in Pencil.dev.

## ✨ Key Features

### 📥 Import Features
- **Full Structure Preservation**: Maintains hierarchy, components, and instances
- **Auto-Layout Support**: Converts Pencil's layout system to Figma's auto-layout
- **Component System**: Reusable components with instance overrides
- **Image Support**: Upload local images alongside your `.pen` file
- **Variable Resolution**: Resolves color variables like `$primary` to actual values
- **Smart Positioning**: Choose where to place imports on your canvas

### 📤 Export Features
- **Selection Export**: Export only selected elements
- **Page Export**: Export entire pages
- **Synced Elements**: Export only elements that were imported from Pencil
- **Metadata Preservation**: Maintains sync IDs for bidirectional updates

### 🎨 Supported Elements

| Pencil Type | Figma Equivalent | Notes |
|-------------|------------------|-------|
| `frame` | Frame | Supports auto-layout (horizontal/vertical) |
| `ref` | Component Instance | With override support |
| `text` | Text Node | Full typography support |
| `rectangle` | Rectangle | With corner radius, fills, strokes |
| `ellipse`/`circle` | Ellipse | Perfect circles and ellipses |
| `image` | Frame with Image Fill | Requires image upload |
| `vector`/`path` | Vector | SVG path conversion |
| `line` | Line | Horizontal/vertical lines |
| `group` | Frame | Grouping container |
| `icon_font` | Vector | Fetches from CDN (Lucide icons) |

### 🎛️ Supported Properties

#### Layout & Dimensions
- `layout`: `"horizontal"`, `"vertical"`, `"none"`
- `width`/`height`: Fixed numbers, `"fill_container"`, `"hug_contents"`
- `gap`: Spacing between auto-layout children
- `padding`: Single value, `[vertical, horizontal]`, or `[top, right, bottom, left]`
- `justifyContent`: `"start"`, `"center"`, `"end"`, `"space_between"`
- `alignItems`: `"start"`, `"center"`, `"end"`

#### Styling
- `fill`: Hex (`"#FF0000"`), rgb, rgba, or variables (`"$primary"`)
- `stroke`: Object with `thickness` and `fill`
- `cornerRadius`: Single value or array `[topLeft, topRight, bottomRight, bottomLeft]`
- `opacity`: 0-1
- `effect`: Shadows and blurs

#### Typography
- `fontFamily`: Font name (falls back to Inter)
- `fontSize`: Number in pixels
- `fontWeight`: `"Regular"`, `"Bold"`, `"600"`, etc.
- `fontStyle`: `"italic"`
- `lineHeight`: Multiplier (e.g., 1.5)
- `textAlign`: `"left"`, `"center"`, `"right"`
- `content`: Text content

#### Components
- `reusable: true`: Creates a Figma component
- `type: "ref"`: Creates an instance
- `ref`: ID of component to instance
- `descendants`: Override properties for instance children

## 🚀 Installation

### From Figma Community (Coming Soon)
Search for "Pencil to Figma" in the Figma Community plugins.

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/ethantheDeveloper220/pencil-to-figma.git
   ```

2. Open Figma Desktop

3. Go to **Plugins** → **Development** → **Import plugin from manifest...**

4. Select the `manifest.json` file from the cloned folder

5. Run via **Plugins** → **Development** → **Pencil.dev Sync**

## 📖 Usage Guide

### Importing a .pen File

1. **Open the plugin** in Figma
2. Stay on the **📥 Import** tab
3. **Upload your .pen file**:
   - Drag & drop the file, or
   - Click the drop zone to browse
4. **(Optional) Upload images**:
   - Click "Select images folder"
   - Choose the folder containing your design's images
5. **Review the analysis**:
   - See element counts, components, layout types
6. Click **Next →**
7. **Position on canvas**:
   - Navigate to where you want the design
   - Click **📍 Place here**

### Exporting to .pen

#### Export Selection
1. Select elements in Figma
2. Open plugin → **📤 Export** tab
3. Choose "Export selection"
4. Click **📤 Export**

#### Export Page
1. Go to **Plugins** → **Pencil.dev Sync** → **Export page to .pen**
2. File downloads automatically

## 🔧 Technical Details

### Data Compression in Figma

When importing, the plugin "compresses" the `.pen` data by:
- Converting layout strings to Figma's layout modes
- Resolving variables to actual values
- Normalizing dimensions (converting `"hug_contents"` to `layoutSizingHorizontal: "HUG"`)
- Storing original IDs as invisible metadata

### Data Decompression on Export

When exporting, the plugin "decompresses" by:
- Reading Figma's native properties
- Converting back to Pencil's format
- Extracting metadata for sync tracking
- Rebuilding the component/instance relationships

### Sync Mechanism

Each imported element stores metadata:
```javascript
node.setPluginData('pencilId', 'uniqueId123');
node.setPluginData('pencilSync', 'true');
```

This enables:
- **Round-trip editing**: Import → Edit in Figma → Export → Edit in Pencil
- **Selective export**: Only export synced elements
- **Update tracking**: Know which elements came from Pencil

### .pen File Format Example

```json
{
  "version": "2.7",
  "variables": {
    "primary": { "type": "color", "value": "#0066FF" },
    "spacing": { "type": "number", "value": 16 }
  },
  "children": [
    {
      "type": "frame",
      "id": "button1",
      "name": "Button",
      "reusable": true,
      "layout": "horizontal",
      "padding": [12, 24],
      "gap": 8,
      "fill": "$primary",
      "cornerRadius": 8,
      "children": [
        {
          "type": "text",
          "content": "Click me",
          "fill": "#FFFFFF",
          "fontSize": 14,
          "fontWeight": "600"
        }
      ]
    }
  ]
}
```

## 🐛 Known Limitations

- **Fonts**: Falls back to Inter if font unavailable
- **Complex SVG paths**: Some arc commands approximated as lines
- **Icon fonts**: Only Lucide icons supported via CDN
- **Image URLs**: Must be absolute or uploaded locally
- **Gradients**: Converted to solid fallback colors
- **Deep nesting**: Very deep component nesting may have edge cases

## 🛠️ Development

### Project Structure
```
pencil-to-figma/
├── code.js              # Main plugin logic (2500+ lines)
├── manifest.json        # Plugin configuration
├── ui.html              # User interface
├── test files/          # Example .pen files
└── README.md            # This file
```

### Key Functions

- `importPenFile()`: Main import orchestrator
- `convertPenToFigmaFormat()`: Normalizes .pen data
- `createNode()`: Converts elements to Figma nodes
- `exportToPen()`: Converts Figma to .pen format
- `parseColor()`: Handles color variables and formats
- `convertSvgPathToFigma()`: SVG path conversion

### Testing
Use the example files in `test files/` to test import functionality.

## 📝 Changelog

### v2.5 (Current)
- Improved SVG path handling
- Better gradient detection and fallback
- Enhanced icon font support (Lucide CDN)
- Fixed color parsing for object values
- Better error handling and validation

### v2.0
- Added export functionality
- Component instance support
- Variable resolution system

### v1.0
- Initial release
- Basic import functionality

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly with various .pen files
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details.

## 🔗 Links

- [Pencil.dev](https://pencil.dev) - Design tool for IDEs
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Report Issues](https://github.com/ethantheDeveloper220/pencil-to-figma/issues)

## 👨‍💻 Author

Built with ❤️ for the design-to-code community.

---

**Note**: This plugin enables a unique workflow where designers can work in both Pencil.dev (closer to code) and Figma (traditional design tool), with seamless conversion between the two formats.
