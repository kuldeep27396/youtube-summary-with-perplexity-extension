# 🎨 Logo Usage Guide

## Your Professional Logo

You have an excellent logo design (`logo.png`) that perfectly represents your extension:

- **Visual Identity**: Clean "P" letterform with YouTube play button integration
- **Colors**: YouTube red (#FF0000) with black/white contrast
- **Style**: Modern, professional, instantly recognizable
- **Symbolism**: Combines Perplexity (P) + YouTube (play button) seamlessly

## How to Generate Extension Icons

### Method 1: Using the Icon Generator (Recommended)
1. Open `create_icons.html` in your browser
2. Click "Choose File" and select `logo.png`
3. Click "Load Image" 
4. Download all three generated icons:
   - `icon16.png` (toolbar)
   - `icon48.png` (extension management)
   - `icon128.png` (Chrome Web Store)

### Method 2: Manual Resize
If you prefer using image editing software:
- Resize `logo.png` to exactly 16x16, 48x48, and 128x128 pixels
- Maintain aspect ratio and center the image
- Save as PNG format with transparency if needed

## Icon Placement in Extension

The icons are referenced in `manifest.json`:
```json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png", 
  "128": "icon128.png"
}
```

## Chrome Web Store Assets

Your professional logo can also be used for:

### Promotional Images
- **Small Tile** (440x280): Use logo + tagline
- **Large Tile** (920x680): Logo + feature showcase
- **Marquee** (1400x560): Hero banner with benefits

### Screenshots
- Show the logo in the browser toolbar
- Display the extension popup with consistent branding
- Feature the logo in marketing materials

## Brand Consistency

### Colors
- **Primary Red**: #FF0000 (YouTube red)
- **Secondary Black**: #000000 
- **Accent White**: #FFFFFF
- **Background**: Clean, minimal

### Typography
- Keep text clean and modern
- Use sans-serif fonts
- Maintain readability at all sizes

### Logo Usage Rules
- ✅ Use on white/light backgrounds for best contrast
- ✅ Maintain minimum size of 16x16 for digital use
- ✅ Keep proportions intact
- ❌ Don't distort or stretch the logo
- ❌ Don't change the colors
- ❌ Don't add effects or shadows

## File Organization

```
your-extension/
├── logo.png              # Source logo (high resolution)
├── icon16.png             # Generated 16x16 icon
├── icon48.png             # Generated 48x48 icon  
├── icon128.png            # Generated 128x128 icon
├── create_icons.html      # Icon generator tool
└── LOGO_USAGE.md         # This guide
```

## Marketing Usage

Your logo works great for:
- Chrome Web Store listing
- Social media posts
- Documentation headers
- GitHub repository branding
- Blog posts and articles
- Presentation slides

## Next Steps

1. **Generate Icons**: Use `create_icons.html` to create all required sizes
2. **Test Extension**: Load extension with new icons to verify they look good
3. **Store Assets**: Create promotional images using your logo
4. **Consistency**: Use the same logo across all marketing materials

---

**Your logo perfectly captures the essence of the extension - bridging YouTube content with AI analysis!** 🎯