# WhalesOnSol Chrome Extension 🐋

Real-time whale wallet detection for Axiom tokens!

## 🚀 Features

- **Automatic Token Detection**: Scrapes token name, price, and market cap from Axiom pages
- **Whale Score**: Visual 0-100 score indicating token health
- **Live Alerts**: See whale accumulation/distribution in real-time
- **Beautiful UI**: Matches the WhalesOnSol website theme with smooth animations

## 📦 Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension is now installed!

## 🎯 How to Use

1. Visit any token page on [axiom.trade](https://axiom.trade)
2. The WhalesOnSol widget will automatically appear in the bottom right
3. View the whale score and recent activity
4. Click buttons to see detailed analysis or set alerts

## 🛠 Technical Details

### DOM Scraping
The extension intelligently scrapes:
- Token symbol from the main heading
- Current price from price elements
- Market cap from stats sections

### Whale Data
- Scrapes axiom holder data for wallets with big solana balances
- Takes the top 1-5 whale wallets detected
- Displays accumulation/distribution trends
- Color-codes risk levels (green/yellow/red)

### Files Structure
```
extension/
├── manifest.json          # Extension configuration
├── scripts/
│   ├── content.js        # Main content script
│   └── background.js     # Background service worker
├── styles/
│   └── content.css       # Widget styles
├── popup.html            # Extension popup
├── popup.js              # Popup functionality
└── images/
    └── icon.svg          # Extension icon
```

## 🎨 Widget Design

- **Ocean gradient background** matching website theme
- **Animated score circle** with color-coded risk
- **Glass morphism effects** for modern look
- **Smooth slide-in animation** on load
- **Responsive design** for all screen sizes

## 🔧 For Developers

To modify the extension:

1. Edit files in the `extension` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the WhalesOnSol extension
4. Reload the Axiom page to see changes

### Adding Real API

Replace the mock data in `background.js`:
```javascript
// Instead of generateMockWhaleData()
const response = await fetch(`YOUR_API/whale-data/${tokenSymbol}`);
const whaleData = await response.json();
```

## 📝 Notes

- Only works on axiom.trade domain
- Requires Chrome browser

## 🚨 Icons Note

For production, you'll need to generate PNG icons:
- 16x16px (icon16.png)
- 32x32px (icon32.png)  
- 48x48px (icon48.png)
- 128x128px (icon128.png)

You can use the provided icon.svg as a base.
