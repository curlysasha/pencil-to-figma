# Installation Guide - Pencil.dev Sync for Figma

## ✅ Plugin Files Created

Your Figma plugin has been successfully created with the following files:

- `manifest.json` - Plugin configuration
- `code.js` - Main plugin logic (handles .pen file parsing and Figma node creation)
- `ui.html` - User interface
- `read.md` - Documentation (already existed)
- `test files/` - Sample .pen files for testing

## 🚀 How to Install the Plugin in Figma

### Step 1: Open Figma Desktop
You **must** use Figma Desktop (not the web version) to install development plugins.

### Step 2: Import the Plugin
1. Open Figma Desktop
2. Click on the **Plugins** menu in the top menu bar
3. Go to **Plugins** → **Development** → **Import plugin from manifest...**
4. Navigate to `C:\Users\EthFR\Music\pencli dev to figma\`
5. Select the `manifest.json` file
6. Click **Open**

### Step 3: Run the Plugin
1. In any Figma file, go to **Plugins** → **Development** → **Pencil.dev Sync**
2. The plugin UI will appear!

## 📖 How to Use the Plugin

### Importing a .pen File

1. **Open the plugin** (Plugins → Development → Pencil.dev Sync)
2. Stay on the **📥 Import** tab
3. **Drag & drop** your `.pen` file or click the drop zone to browse
4. *(Optional)* If your design has images, click **Select images folder** and choose the folder
5. Click **Next →**
6. **Navigate** in Figma to where you want to place the design
7. Click **📍 Place here**

The plugin will create all the elements from your .pen file with:
- ✅ Frames and auto-layout
- ✅ Components and instances
- ✅ Text with proper styling
- ✅ Colors and variables
- ✅ Strokes and effects
- ✅ Images (if folder provided)

### Exporting to .pen (Basic)

1. Open the plugin
2. Switch to the **📤 Export** tab
3. Choose export mode:
   - **Export selection** - Only selected elements
   - **Export synced elements** - All previously imported elements
4. Click **📤 Export**
5. A `.pen` file will be downloaded

## 🧪 Testing with Sample Files

Test the plugin with the included sample files:

- `test files/pencil-welcome.pen` - Complex design system components
- `test files/untitled.pen` - Another test file

### Quick Test:
1. Run the plugin in Figma
2. Import `test files/pencil-welcome.pen`
3. Place it on your canvas
4. You should see a complete design system with buttons, inputs, and components!

## 🎨 Supported Features

### Element Types
- ✅ Frames (with auto-layout)
- ✅ Rectangles
- ✅ Ellipses/Circles
- ✅ Text
- ✅ Images
- ✅ Lines
- ✅ Vectors/Paths
- ✅ Groups
- ✅ Components (`reusable: true`)
- ✅ Instances (`type: "ref"`)

### Properties
- ✅ Layout: `horizontal`, `vertical`, `none`
- ✅ Dimensions: Fixed, `fill_container`, `hug_contents`
- ✅ Flexbox: `justifyContent`, `alignItems`, `gap`
- ✅ Padding: Number or arrays
- ✅ Color variables: `$variable-name`
- ✅ Fills: Hex, RGB, RGBA, color tokens
- ✅ Strokes: Thickness, alignment, colors
- ✅ Corner radius: Number, arrays, or variables
- ✅ Text properties: Font, size, weight, alignment
- ✅ Effects: Shadows (drop and inner)
- ✅ Component overrides

## 🐛 Troubleshooting

### Plugin doesn't appear in menu
- Make sure you're using **Figma Desktop**, not the web version
- Try restarting Figma

### Import fails
- Check that your .pen file is valid JSON
- Make sure it has a `version` and `children` property
- Try with the sample files first

### Images don't load
- Make sure you selected the correct images folder
- Image filenames in the .pen file must match the actual files
- Images must be in common formats (PNG, JPG, etc.)

### Fonts not available
- The plugin will fallback to "Inter" if a font is not installed
- Install missing fonts in your system before importing

## 📝 Next Steps

1. **Test the plugin** with the sample files
2. **Import your own .pen files** from Pencil.dev
3. **Customize components** in Figma after import
4. **Export back to .pen** to sync changes (basic export only for now)

## 🔄 Making Changes to the Plugin

If you want to modify the plugin:

1. Edit `code.js` or `ui.html`
2. In Figma, right-click the plugin name in the menu
3. Select **Run Last Plugin** or relaunch from the menu
4. Your changes will be reflected immediately

## 📚 Resources

- [Pencil.dev](https://pencil.dev) - The design tool for IDEs
- [Figma Plugin API Docs](https://www.figma.com/plugin-docs/)
- Original README: `read.md`

---

**Enjoy using Pencil.dev Sync for Figma! 🎉**
