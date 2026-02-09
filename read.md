# Pencil.dev Sync for Figma



> ⚠️ **Alpha Release** — This plugin was built through vibe coding by Martin Dubois from [QuatreCentQuatre](https://quatrecentquatre.com) to explore and test workflows between [Pencil](https://pencil.dev) and Figma. Depending on reception and usage, this project may be maintained long-term or evolve from prototype to production-ready status.



A Figma plugin to import and export `.pen` files from [pencil.dev](https://pencil.dev), enabling bidirectional sync between your Pencil designs and Figma projects.



## ✨ Features



- **📥 Import** `.pen` files into Figma with full structure preservation

- **🖼️ Local images** support via folder upload

- **🧩 Components** support with instances and overrides

- **🌍 Multilingual** UI (English / French, auto-detected)

- **📍 Positioning** — Choose where to place imports on your canvas



upcoming:

- **📤 Export** Figma elements back to `.pen` format (for now use Pencil's paste from Figma feature)

- **🔄 Bidirectional sync** via `pencilId` metadata stored in Figma nodes



## 🚀 Installation



### Manual Installation (Development)



1. **Download or clone this repository**



2. **Import into Figma**:

- Open Figma Desktop

- Go to **Plugins** → **Development** → **Import plugin from manifest...**

- Select the `manifest.json` file from this folder



3. **Run the plugin**:

- **Plugins** → **Development** → **Pencil.dev Sync**



## 📖 Usage



### Importing a .pen file



1. Open the plugin

2. Stay on the **📥 Import** tab

3. Drag & drop your `.pen` file or click to select

4. If your design has local images, click **Select images folder** and choose the folder containing your images

5. Click **Next →**

6. Navigate to where you want the import on your Figma canvas

7. Click **📍 Place here**



### Exporting to .pen



1. Open the plugin

2. Switch to the **📤 Export** tab

3. Choose export mode:

- **Export selection** — Only selected elements

- **Export synced elements** — All elements previously imported from a `.pen` file

4. Click **📤 Export**

5. A `.pen` file will be downloaded



## 🎨 Supported Elements



| Pencil Type | Figma Conversion |

|-------------|------------------|

| `frame` | Frame (or Component if `reusable: true`) |

| `ref` | Component Instance |

| `text` | Text with styles |

| `rectangle` | Rectangle |

| `ellipse` / `circle` | Ellipse |

| `image` | Frame with image fill |

| `group` | Group |

| `line` | Line |

| `vector` / `path` | Vector |



### Supported Properties



- **Layout**: `vertical`, `horizontal`, `none` (auto-layout)

- **Dimensions**: Fixed, `fill_container`, `hug_contents`

- **Flexbox**: `justifyContent`, `alignItems`, `gap`

- **Padding**: Number, `[vertical, horizontal]`, or `[top, right, bottom, left]`

- **Color variables**: `$red`, `$white`, etc. (via `variables` object)

- **Fills**: Hex, rgb, rgba, and color tokens

- **Strokes**: `{ thickness: 1, fill: "$black" }`

- **Corner radius**: Number or array of 4 values

- **Text**: `content`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `textAlign`

- **Components**: `reusable: true` creates Figma Components

- **Instances**: `type: "ref"` with `ref: "<componentId>"` and `descendants` overrides



## 🔄 Sync Mechanism



When importing, each element stores its Pencil ID as invisible metadata:



```javascript

figmaNode.setPluginData('pencilId', 'xvJuI');

figmaNode.setPluginData('pencilSync', 'true');

```



This enables:

- Finding elements by their original Pencil ID

- Re-exporting with preserved IDs for Pencil to match

- Tracking which elements are part of the sync



## 📁 .pen File Format



The plugin supports the native pencil.dev format:



```json

{

"version": "2.6",

"variables": {

"white": { "type": "color", "value": "#FFFFFF" },

"red": { "type": "color", "value": "#FF5046" }

},

"children": [

{

"type": "frame",

"id": "header1",

"name": "Header",

"reusable": true,

"width": "fill_container",

"height": 80,

"fill": "$white",

"layout": "horizontal",

"padding": [0, 80],

"justifyContent": "space_between",

"alignItems": "center",

"children": [...]

},

{

"type": "ref",

"id": "headerInstance1",

"ref": "header1",

"name": "Header Instance",

"descendants": {

"titleText": { "content": "New Title" }

}

}

]

}

```



## 🐛 Known Limitations



- **Images**: Local images require manual folder selection; URLs must be absolute

- **Fonts**: Falls back to Inter if a font is not available. Italic fonts are attempted but may fall back to regular style

- **Complex vectors**: Some SVG path commands may be approximated (arcs converted to lines)

- **Nested components**: Deep nesting may have edge cases

- **Icon fonts**: Rendered as placeholder rectangles since Figma doesn't support icon fonts natively

- **Theme variables**: Theme context is analyzed but not yet applied to variable resolution

- **Unknown element types**: Elements like "prompt" are skipped with a warning



## 🔧 Recent Fixes (v2.5.1)



- Fixed color parsing errors when color values are objects

- Improved font loading with better error handling and italic font support

- Enhanced icon font rendering with proper placeholder frames

- Added support for "prompt" element type (skipped with warning)

- Better error messages for failed node creation

- Improved SVG path conversion with better validation

- Added input validation for pen file structure



## 🔧 Development



### Project Structure



```

figma-pencil-importer/

├── manifest.json # Plugin configuration

├── code.js # Main logic

├── ui.html # User interface

├── example.pen # Example file

└── README.md # This file

```



### Testing Changes



1. Edit the source files

2. In Figma, right-click the plugin → **Run Last Plugin** or relaunch from the menu



## 📝 Changelog



### v0.1.1-alpha

- Improved handling of nested components



### v0.1.0-alpha

- Initial alpha release

- Import/Export functionality

- Component and instance support

- Local image upload

- Bidirectional sync via pluginData

- English/French localization

- Canvas positioning for imports



## 👨‍💻 Author



**Martin Dubois** — [QuatreCentQuatre](https://quatrecentquatre.com)



Built with Claude (Anthropic) through vibe coding sessions.



## 📄 License



MIT License — See LICENSE file for details.



## 🔗 Links



- [Pencil.dev](https://pencil.dev) — The design tool for IDEs

- [QuatreCentQuatre](https://quatrecentquatre.com) — Digital agency

- [Figma Plugin API](https://www.figma.com/plugin-docs/)

Show less