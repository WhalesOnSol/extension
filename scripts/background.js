// Background script for WhalesOnSol
console.log('WhalesOnSol background script loaded');

// Store for holder data
const holderDataStore = {};

// Store for alert monitoring
const alertMonitors = {};

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('WhalesOnSol extension installed!');
  
  // Set default settings
  chrome.storage.sync.set({
    alertsEnabled: true,
    whaleThreshold: 2.0, // 2% of supply
    priceAlerts: true,
    alerts: {}
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getWhaleData':
      // Return mock data for now
      const mockWhaleData = generateMockWhaleData(request.tokenSymbol);
      sendResponse(mockWhaleData);
      break;
      
    case 'storeHolderData':
      // Store holder data for analysis page
      holderDataStore[request.tokenSymbol] = {
        holders: request.holders,
        timestamp: Date.now()
      };
      sendResponse({ success: true });
      break;
      
    case 'getDetailedWhaleData':
      // Return stored holder data for analysis page
      const data = holderDataStore[request.tokenSymbol];
      if (data && data.holders) {
        sendResponse({ 
          success: true, 
          data: {
            holders: data.holders,
            whaleScore: calculateWhaleScore(data.holders)
          }
        });
      } else {
        sendResponse({ success: false });
      }
      break;
      
    case 'openAnalysisPage':
      // Open analysis page in new tab
      chrome.tabs.create({ 
        url: chrome.runtime.getURL(request.url),
        active: true 
      });
      sendResponse({ success: true });
      break;
      
    case 'quickSetAlert':
      // Quick alert setup
      const alertKey = `alert_${request.tokenSymbol}`;
      chrome.storage.sync.get(['alerts'], (result) => {
        const alerts = result.alerts || {};
        alerts[alertKey] = {
          tokenSymbol: request.tokenSymbol,
          tokenUrl: request.tokenUrl,
          whaleMovement: true,
          priceChange: true,
          newWhales: true,
          enabled: true,
          createdAt: Date.now()
        };
        chrome.storage.sync.set({ alerts }, () => {
          startAlertMonitoring(request.tokenSymbol, request.tokenUrl);
          sendResponse({ success: true });
        });
      });
      return true; // Keep channel open for async response
      
    case 'updateAlertSettings':
      // Update alert settings from analysis page
      const settings = request.settings;
      const key = `alert_${settings.tokenSymbol}`;
      chrome.storage.sync.get(['alerts'], (result) => {
        const alerts = result.alerts || {};
        alerts[key] = {
          ...alerts[key],
          ...settings,
          updatedAt: Date.now()
        };
        chrome.storage.sync.set({ alerts });
        if (settings.whaleMovement || settings.priceChange || settings.newWhales) {
          startAlertMonitoring(settings.tokenSymbol, alerts[key].tokenUrl);
        } else {
          stopAlertMonitoring(settings.tokenSymbol);
        }
      });
      break;
      
    case 'showNotification':
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'WhalesOnSol Alert',
        message: request.message,
        priority: 2
      });
      break;
  }
});

// Generate mock whale data
function generateMockWhaleData(tokenSymbol) {
  const scores = [65, 72, 78, 82, 85, 89, 92];
  const randomScore = scores[Math.floor(Math.random() * scores.length)];
  
  const whaleCount = Math.floor(Math.random() * 5) + 1;
  const supplyPercentage = (Math.random() * 20 + 5).toFixed(1);
  const recentActivity = Math.random() > 0.5 ? 'accumulation' : 'distribution';
  const activityPercentage = (Math.random() * 5 + 0.5).toFixed(1);
  
  return {
    score: randomScore,
    whales: {
      count: whaleCount,
      totalSupplyHeld: supplyPercentage,
      largestHolder: (parseFloat(supplyPercentage) / whaleCount).toFixed(1)
    },
    recentActivity: {
      type: recentActivity,
      amount: activityPercentage,
      timeframe: '24h'
    },
    risk: randomScore < 70 ? 'high' : randomScore < 85 ? 'medium' : 'low',
    alerts: generateAlerts(randomScore, whaleCount, recentActivity)
  };
}

// Generate relevant alerts based on data
function generateAlerts(score, whaleCount, activity) {
  const alerts = [];
  
  if (whaleCount >= 3) {
    alerts.push({
      type: 'warning',
      title: `${whaleCount} Whales Detected`,
      message: 'Multiple large holders identified'
    });
  }
  
  if (score > 85) {
    alerts.push({
      type: 'success',
      title: 'Healthy Distribution',
      message: 'Token has good holder diversity'
    });
  } else if (score < 70) {
    alerts.push({
      type: 'danger',
      title: 'High Concentration Risk',
      message: 'Few wallets control large supply'
    });
  }
  
  if (activity === 'accumulation') {
    alerts.push({
      type: 'info',
      title: 'Whale Accumulation',
      message: 'Large holders are buying'
    });
  } else {
    alerts.push({
      type: 'warning',
      title: 'Whale Distribution',
      message: 'Large holders are selling'
    });
  }
  
  return alerts;
}

// Calculate whale score from holder data
function calculateWhaleScore(holders) {
  if (!holders || holders.length === 0) return 50;
  
  let score = 50; // Base score
  const whales = holders.filter(h => parseFloat(h.percentage) > 2);
  const whaleCount = whales.length;
  const totalWhaleHoldings = whales.reduce((sum, h) => sum + parseFloat(h.percentage), 0);
  
  // Adjust score based on whale concentration
  if (whaleCount > 5) score -= 20;
  else if (whaleCount > 3) score -= 10;
  
  if (totalWhaleHoldings > 50) score -= 30;
  else if (totalWhaleHoldings > 30) score -= 20;
  else if (totalWhaleHoldings > 20) score -= 10;
  
  // Positive factors
  if (whaleCount <= 2 && totalWhaleHoldings < 15) score += 20;
  
  return Math.max(0, Math.min(100, score));
}

// Start monitoring for alerts
function startAlertMonitoring(tokenSymbol, tokenUrl) {
  console.log(`Starting alert monitoring for ${tokenSymbol}`);
  
  // Clear existing monitor if any
  if (alertMonitors[tokenSymbol]) {
    clearInterval(alertMonitors[tokenSymbol]);
  }
  
  // Check every 5 minutes (in production, this would be more sophisticated)
  alertMonitors[tokenSymbol] = setInterval(() => {
    checkForAlerts(tokenSymbol, tokenUrl);
  }, 5 * 60 * 1000); // 5 minutes
  
  // Initial check
  checkForAlerts(tokenSymbol, tokenUrl);
}

// Stop monitoring for alerts
function stopAlertMonitoring(tokenSymbol) {
  console.log(`Stopping alert monitoring for ${tokenSymbol}`);
  if (alertMonitors[tokenSymbol]) {
    clearInterval(alertMonitors[tokenSymbol]);
    delete alertMonitors[tokenSymbol];
  }
}

// Check for alert conditions
function checkForAlerts(tokenSymbol, tokenUrl) {
  chrome.storage.sync.get(['alerts'], (result) => {
    const alertKey = `alert_${tokenSymbol}`;
    const alertSettings = result.alerts?.[alertKey];
    
    if (!alertSettings || !alertSettings.enabled) return;
    
    // In production, this would fetch real data from the token page
    // For now, simulate some alert conditions
    const mockConditions = [
      {
        type: 'whaleMovement',
        triggered: Math.random() > 0.8,
        message: `🐋 Large whale movement detected for ${tokenSymbol}! A wallet moved 3.5% of supply.`
      },
      {
        type: 'priceChange',
        triggered: Math.random() > 0.9,
        message: `📈 Price alert for ${tokenSymbol}! Token is up 15% in the last hour.`
      },
      {
        type: 'newWhales',
        triggered: Math.random() > 0.95,
        message: `🆕 New whale alert for ${tokenSymbol}! A new wallet acquired 2.8% of supply.`
      }
    ];
    
    mockConditions.forEach(condition => {
      if (alertSettings[condition.type] && condition.triggered) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: 'WhalesOnSol Alert',
          message: condition.message,
          priority: 2,
          requireInteraction: true
        });
      }
    });
  });
}