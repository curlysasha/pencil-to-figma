# Pencil to Figma Converter

A powerful Figma plugin that enables seamless bidirectional conversion between [Pencil.dev](https://pencil.dev) `.pen` files and Figma designs.

## 🎬 Demo

Watch the plugin in action:

![Demo Video](./video/2026-02-08%2021-56-09.mp4)

> **Video**: See how to import a `.pen` file, analyze its structure, and place it on the Figma canvas in seconds.

## 🌟 Platform Support

This plugin works across all Figma platforms:
- ✅ **Figma Desktop App** (Windows, macOS, Linux)
- ✅ **Figma Web App** (Browser-based) (Soon)
- ✅ **FigJam** (Collaborative whiteboarding)

## 🎯 What It Does

This plugin bridges the gap between Pencil.dev (a design tool for IDEs) and Figma by:

1. **Importing** `.pen` files into Figma with full structure preservation
2. **Exporting** Figma designs back to `.pen` format
3. **Compressing** design data when creating elements in Figma
4. **Uncompressing** data when exporting back to `.pen` format

## 💡 Why Use This Plugin?

### For Designers
- **Work in your preferred tool**: Design in Pencil.dev (closer to code) or Figma (traditional design)
- **No vendor lock-in**: Move designs freely between platforms
- **Preserve structure**: Components, instances, and auto-layout survive the conversion
- **Collaborate better**: Share designs with teams using different tools

### For Developers
- **Design-to-code workflow**: Import Pencil designs directly into Figma for handoff
- **Version control**: `.pen` files are JSON, perfect for Git
- **Programmatic design**: Create designs in code (Pencil) and visualize in Figma
- **Rapid prototyping**: Iterate in code, preview in Figma

### For Teams
- **Unified workflow**: Bridge the gap between design and development
- **Asset reusability**: Components work across both platforms
- **Flexible tooling**: Choose the right tool for each task
- **Seamless handoff**: Designers and developers speak the same language

## 🔄 How It Works

### The Magic Behind the Conversion

Think of this plugin as a **translator** between two design languages. Here's what happens under the hood:

#### 📥 When Importing (.pen → Figma):

1. **Parse**: The plugin reads your `.pen` file (structured JSON)
2. **Analyze**: Detects components, instances, layouts, and element types
3. **Convert**: Transforms Pencil's format into Figma's native structure:
   - `layout: "horizontal"` → Figma Auto-Layout (horizontal)
   - `width: "fill_container"` → `layoutSizingHorizontal: "FILL"`
   - `$primary` variable → Actual color value `#0066FF`
   - `reusable: true` → Figma Component
   - `type: "ref"` → Component Instance
4. **Create**: Builds actual Figma nodes with all properties applied
5. **Tag**: Stores invisible metadata on each element for sync tracking
6. **Position**: Places everything on your canvas at the exact coordinates

**Result**: Your Pencil design is now fully editable in Figma with all structure, components, and styling intact.

#### 📤 When Exporting (Figma → .pen):

1. **Scan**: Reads selected Figma nodes or entire page
2. **Extract**: Pulls out all properties (colors, dimensions, layout modes)
3. **Convert**: Transforms Figma's format back to Pencil's structure:
   - Auto-Layout (horizontal) → `layout: "horizontal"`
   - `layoutSizingHorizontal: "FILL"` → `width: "fill_container"`
   - Figma Component → `reusable: true`
   - Component Instance → `type: "ref"` with overrides
4. **Rebuild**: Reconstructs the component/instance relationships
5. **Package**: Creates a `.pen` JSON file ready for Pencil.dev

**Result**: Your Figma design is now a `.pen` file that can be used in Pencil.dev or version controlled with your code.

### Data Compression Explained

**"Compression"** means converting verbose Figma properties into Pencil's compact format:
- Figma's `layoutMode: "HORIZONTAL"` + `primaryAxisAlignItems: "MIN"` → Pencil's `layout: "horizontal"` + `justifyContent: "start"`
- Figma's color object `{r: 1, g: 0, b: 0}` → Pencil's hex `"#FF0000"`

**"Decompression"** means expanding Pencil's compact format into Figma's detailed properties:
- Pencil's `"hug_contents"` → Figma's `layoutSizingHorizontal: "HUG"` + proper resizing
- Pencil's `$primary` → Resolved color value from variables object
3. **Convert**: Transforms Pencil's format into Figma's native structure
   - `layout: "horizontal"` → Figma Auto-Layout (horizontal)
   - `width: "fill_container"` → `layoutSizingHorizontal: "FILL"`
   - `$primary` variable → Actual color value `#0066FF`
   - `reusable: true` → Figma Component
4. **Create**: Builds actual Figma nodes (frames, text, shapes, vectors)
5. **Tag**: Stores invisible metadata on each node for sync tracking
6. **Position**: Places everything on your canvas with preserved coordinates

**Result**: Your Pencil design is now fully editable in Figma with all structure, components, and styling intact.

#### 📤 When Exporting (Figma → .pen):

1. **Traverse**: Walks through selected Figma nodes or entire page
2. **Extract**: Reads all properties (colors, dimensions, layout modes)
3. **Convert**: Transforms Figma's structure back to Pencil format
   - Auto-Layout (horizontal) → `layout: "horizontal"`
   - `layoutSizingHorizontal: "FILL"` → `width: "fill_container"`
   - Figma Component → `reusable: true`
   - Component Instance → `type: "ref"` with overrides
4. **Package**: Bundles everything into a clean JSON structure
5. **Download**: Saves as a `.pen` file ready for Pencil.dev

**Result**: Your Figma design is now a `.pen` file that can be opened, edited, and version-controlled in Pencil.dev.

### 🔐 The Sync Mechanism

Each imported element gets a hidden "passport" that tracks its origin:

```javascript
// Invisible metadata stored on every node
node.setPluginData('pencilId', 'button_primary_123');
node.setPluginData('pencilSync', 'true');
```

This enables:
- **Round-trip editing**: Import → Edit in Figma → Export → Edit in Pencil → Repeat
- **Selective export**: Only export elements that came from Pencil
- **Update tracking**: Know exactly which elements are synced
- **Conflict resolution**: Match elements across platforms by ID

## ✨ Key Features

### 📥 Import Features
- **Full Structure Preservation**: Maintains hierarchy, components, and instances
- **Auto-Layout Support**: Converts Pencil's layout system to Figma's auto-layout
- **Component System**: Reusable components with instance overrides
- **Image Support**: Upload local images alongside your `.pen` file
- **Variable Resolution**: Resolves color variables like `$primary` to actual values
- **Smart Positioning**: Choose where to place imports on your canvas
- **File Analysis**: Preview element counts, component stats before importing

### 📤 Export Features
- **Selection Export**: Export only selected elements
- **Page Export**: Export entire pages
- **Synced Elements**: Export only elements that were imported from Pencil
- **Metadata Preservation**: Maintains sync IDs for bidirectional updates
- **Menu Commands**: Quick export via right-click menu

### 🎨 Platform Support

This plugin works across all Figma platforms:

- ✅ **Figma Desktop App** (Windows, macOS, Linux)
- ✅ **Figma Web App** (Browser-based)
- ✅ **FigJam** (Whiteboarding tool)

> **Note**: Some features like network requests (icon fetching) work best in the desktop app due to browser security restrictions.

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

## 🚧 Upcoming Features

We're actively working on these enhancements:

### Coming Soon
- 🖼️ **Advanced Image Support**: Automatic image detection and embedding
- 🎨 **SVG Auto-Detection**: Smart detection and conversion of complex SVG paths
- 🌈 **Gradient Support**: Full gradient import/export (linear, radial, conic)
- 🔤 **Extended Icon Libraries**: Support for Material Icons, Font Awesome, and custom icon sets
- 🔄 **Live Sync**: Real-time updates between Pencil and Figma
- 📦 **Batch Operations**: Import/export multiple files at once
- 🎯 **Smart Mapping**: AI-assisted element matching for updates

### Under Consideration
- 🔌 **VS Code Extension**: Direct integration with Pencil.dev in VS Code
- 🌐 **Cloud Sync**: Store and sync designs via cloud storage
- 📱 **Mobile Preview**: Preview designs on mobile devices
- 🎨 **Theme Support**: Import/export design tokens and themes

## 🐛 Known Limitations

- **Fonts**: Falls back to Inter if font unavailable
- **Complex SVG paths**: Some arc commands approximated as lines
- **Icon fonts**: Currently only Lucide icons supported via CDN
- **Image URLs**: Must be absolute or uploaded locally (auto-detection coming soon)
- **Gradients**: Currently converted to solid fallback colors (full support coming soon)
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
