#!/bin/bash
# This script would normally use ImageMagick or similar to resize images
# For now, we'll use the same image for all sizes

cp whalenotext.png icon16.png
cp whalenotext.png icon32.png
cp whalenotext.png icon48.png
cp whalenotext.png icon128.png

echo "Icons generated! Note: For production, you should properly resize these images to:"
echo "- icon16.png: 16x16 pixels"
echo "- icon32.png: 32x32 pixels"
echo "- icon48.png: 48x48 pixels"
echo "- icon128.png: 128x128 pixels"