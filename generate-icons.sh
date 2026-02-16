#!/bin/bash

# Icon Generator for Mobile Devices
# This script helps generate the required icon sizes for iOS and Android
# Prerequisites: ImageMagick or a similar tool for image conversion

echo "🎨 Mobile Icon Generator for Fondation Jardin Majorelle"
echo "======================================================="
echo ""
echo "This script will help you generate mobile app icons."
echo ""

# Check if source logo exists
if [ -f "public/logo.svg" ]; then
    LOGO="public/logo.svg"
elif [ -f "public/logo.png" ]; then
    LOGO="public/logo.png"
elif [ -f "src/assets/logo.png" ]; then
    echo "Found logo in src/assets, copying to public/"
    cp src/assets/logo.png public/logo.png
    LOGO="public/logo.png"
else
    echo "❌ Error: No logo file found"
    echo "Please add logo.svg or logo.png to the public directory"
    exit 1
fi

echo "📁 Using logo: $LOGO"

echo "📱 Required Icons:"
echo "  - apple-touch-icon.png (180x180) - iOS home screen"
echo "  - icon-192.png (192x192) - Android home screen"
echo "  - icon-512.png (512x512) - Android splash screen"
echo ""

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found - generating icons..."
    echo ""
    
    # Generate iOS icon
    echo "📱 Generating apple-touch-icon.png (180x180)..."
    convert "$LOGO" -resize 180x180 -background "#7dafab" -flatten public/apple-touch-icon.png
    
    # Generate Android icons
    echo "📱 Generating icon-192.png (192x192)..."
    convert "$LOGO" -resize 192x192 -background "#7dafab" -flatten public/icon-192.png
    
    echo "📱 Generating icon-512.png (512x512)..."
    convert "$LOGO" -resize 512x512 -background "#7dafab" -flatten public/icon-512.png
    
    echo ""
    echo "✅ All icons generated successfully!"
    echo ""
    echo "Generated files:"
    ls -lh public/apple-touch-icon.png public/icon-192.png public/icon-512.png
    
elif command -v magick &> /dev/null; then
    echo "✅ ImageMagick (magick) found - generating icons..."
    echo ""
    
    # Generate iOS icon
    echo "📱 Generating apple-touch-icon.png (180x180)..."
    magick "$LOGO" -resize 180x180 -background "#7dafab" -flatten public/apple-touch-icon.png
    
    # Generate Android icons
    echo "📱 Generating icon-192.png (192x192)..."
    magick "$LOGO" -resize 192x192 -background "#7dafab" -flatten public/icon-192.png
    
    echo "📱 Generating icon-512.png (512x512)..."
    magick "$LOGO" -resize 512x512 -background "#7dafab" -flatten public/icon-512.png
    
    echo ""
    echo "✅ All icons generated successfully!"
    echo ""
    echo "Generated files:"
    ls -lh public/apple-touch-icon.png public/icon-192.png public/icon-512.png
    
else
    echo "⚠️  ImageMagick not found. Please install it or use an online tool."
    echo ""
    echo "Installation options:"
    echo ""
    echo "  macOS:    brew install imagemagick"
    echo "  Ubuntu:   sudo apt-get install imagemagick"
    echo "  Windows:  Download from https://imagemagick.org/script/download.php"
    echo ""
    echo "Alternatively, use online tools:"
    echo "  - https://realfavicongenerator.net/"
    echo "  - https://www.favicon-generator.org/"
    echo "  - https://favicon.io/"
    echo ""
    echo "Required sizes:"
    echo "  - 180x180px (save as: public/apple-touch-icon.png)"
    echo "  - 192x192px (save as: public/icon-192.png)"
    echo "  - 512x512px (save as: public/icon-512.png)"
fi

echo ""
echo "📝 Next steps:"
echo "  1. Verify icons are generated in the public/ directory"
echo "  2. Test on mobile devices"
echo "  3. Add to home screen to test PWA functionality"
echo ""
