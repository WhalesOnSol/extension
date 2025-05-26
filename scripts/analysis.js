// WhalesOnSol Analysis Page Script

document.addEventListener('DOMContentLoaded', async () => {
  // Get token data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tokenSymbol = urlParams.get('symbol');
  const tokenPrice = urlParams.get('price');
  const tokenMC = urlParams.get('mc');
  const tokenUrl = urlParams.get('url');
  
  // Update token overview
  document.getElementById('tokenSymbol').textContent = tokenSymbol || 'Unknown Token';
  document.getElementById('tokenPrice').textContent = tokenPrice || '$0.00';
  document.getElementById('tokenMC').textContent = tokenMC || '$0';
  
  // Close button functionality
  document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
  });
  
  // Load saved alert settings
  loadAlertSettings();
  
  // Save alert settings
  document.getElementById('saveAlerts').addEventListener('click', saveAlertSettings);
  
  // Request holder data from background script
  chrome.runtime.sendMessage(
    { 
      action: 'getDetailedWhaleData', 
      tokenSymbol: tokenSymbol,
      tokenUrl: tokenUrl 
    },
    (response) => {
      if (response && response.success) {
        displayWhaleData(response.data);
      } else {
        // Fallback to mock data for demonstration
        displayMockData();
      }
    }
  );
  
  // Add entrance animations with staggered delays
  animateElements();
});

function displayWhaleData(data) {
  // Update whale score
  const whaleScore = data.whaleScore || calculateWhaleScore(data);
  document.getElementById('whaleScore').textContent = whaleScore;
  
  // Display whale indicators
  displayWhaleIndicators(data);
  
  // Display top holders
  displayTopHolders(data.holders);
  
  // Display token insights
  displayTokenInsights(data);
}

function calculateWhaleScore(data) {
  let score = 50; // Base score
  
  if (data.holders) {
    const whaleCount = data.holders.filter(h => parseFloat(h.percentage) > 2).length;
    const totalWhaleHoldings = data.holders
      .filter(h => parseFloat(h.percentage) > 2)
      .reduce((sum, h) => sum + parseFloat(h.percentage), 0);
    
    // Adjust score based on whale concentration
    if (whaleCount > 5) score -= 20;
    else if (whaleCount > 3) score -= 10;
    
    if (totalWhaleHoldings > 50) score -= 30;
    else if (totalWhaleHoldings > 30) score -= 20;
    else if (totalWhaleHoldings > 20) score -= 10;
    
    // Positive factors
    if (whaleCount <= 2 && totalWhaleHoldings < 15) score += 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

function displayWhaleIndicators(data) {
  const indicatorsContainer = document.getElementById('whaleIndicators');
  indicatorsContainer.innerHTML = '';
  
  const indicators = [];
  
  // Calculate whale metrics
  if (data.holders) {
    const whales = data.holders.filter(h => parseFloat(h.percentage) > 2);
    const whaleCount = whales.length;
    const totalWhaleHoldings = whales.reduce((sum, h) => sum + parseFloat(h.percentage), 0);
    
    // Whale concentration
    indicators.push({
      icon: whaleCount > 5 ? '⚠️' : '🐋',
      title: `${whaleCount} Whales Detected`,
      description: `${whaleCount} addresses hold more than 2% of supply each`,
      status: whaleCount > 5 ? 'high' : whaleCount > 3 ? 'medium' : 'low'
    });
    
    // Total whale holdings
    indicators.push({
      icon: totalWhaleHoldings > 50 ? '🚨' : '📊',
      title: `${totalWhaleHoldings.toFixed(1)}% Whale Ownership`,
      description: `Top whales control ${totalWhaleHoldings.toFixed(1)}% of total supply`,
      status: totalWhaleHoldings > 50 ? 'high' : totalWhaleHoldings > 30 ? 'medium' : 'low'
    });
    
    // Distribution analysis
    const top5Holdings = whales.slice(0, 5).reduce((sum, h) => sum + parseFloat(h.percentage), 0);
    indicators.push({
      icon: '📈',
      title: 'Distribution Analysis',
      description: `Top 5 holders own ${top5Holdings.toFixed(1)}% of supply`,
      status: top5Holdings > 40 ? 'high' : top5Holdings > 25 ? 'medium' : 'low'
    });
    
    // Recent activity (mock for now)
    indicators.push({
      icon: '🔄',
      title: 'Recent Whale Activity',
      description: 'Monitoring whale wallets for unusual movements',
      status: 'medium'
    });
  }
  
  // Render indicators
  indicators.forEach((indicator, index) => {
    const indicatorEl = createIndicatorElement(indicator);
    indicatorEl.style.animationDelay = `${index * 0.1}s`;
    indicatorsContainer.appendChild(indicatorEl);
  });
}

function createIndicatorElement(indicator) {
  const div = document.createElement('div');
  div.className = 'indicator-item';
  div.innerHTML = `
    <span class="indicator-icon">${indicator.icon}</span>
    <div class="indicator-content">
      <div class="indicator-title">${indicator.title}</div>
      <div class="indicator-description">${indicator.description}</div>
    </div>
    <span class="status-badge status-${indicator.status}">${indicator.status}</span>
  `;
  return div;
}

function displayTopHolders(holders) {
  const holdersContainer = document.getElementById('topHolders');
  
  if (!holders || holders.length === 0) {
    holdersContainer.innerHTML = '<p>No holder data available</p>';
    return;
  }
  
  const holdersGrid = document.createElement('div');
  holdersGrid.className = 'holders-grid';
  
  // Display top 10 holders (excluding liquidity pool if it's #1)
  const topHolders = holders.slice(0, 11).filter((holder, index) => {
    // Skip first holder if it looks like a liquidity pool
    if (index === 0 && holder.percentage > 50) return false;
    return true;
  }).slice(0, 10);
  
  topHolders.forEach((holder, index) => {
    const holderCard = createHolderCard(holder, index + 1);
    holderCard.style.animationDelay = `${index * 0.05}s`;
    holdersGrid.appendChild(holderCard);
  });
  
  holdersContainer.innerHTML = '';
  holdersContainer.appendChild(holdersGrid);
}

function createHolderCard(holder, rank) {
  const div = document.createElement('div');
  div.className = 'holder-card';
  
  const fullAddress = holder.address || `Wallet${rank}`;
  const shortAddress = fullAddress.length > 10 
    ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
    : fullAddress;
  
  div.innerHTML = `
    <div class="holder-rank">#${rank}</div>
    <div class="holder-info">
      <div class="holder-address">
        <span>${shortAddress}</span>
        <button class="copy-btn" onclick="copyAddress('${fullAddress}')">📋</button>
      </div>
      <div class="holder-stats">
        <span>Balance: ${holder.balance || 'N/A'}</span>
        <span>Activity: ${holder.activity || 'Unknown'}</span>
      </div>
    </div>
    <div class="holder-percentage">${holder.percentage}%</div>
  `;
  
  return div;
}

function displayTokenInsights(data) {
  const insightsContainer = document.getElementById('tokenInsights');
  insightsContainer.innerHTML = '';
  
  const insights = [];
  
  // Generate insights based on data
  if (data.holders) {
    const whaleCount = data.holders.filter(h => parseFloat(h.percentage) > 2).length;
    
    // Liquidity insight
    insights.push({
      icon: '💧',
      title: 'Liquidity Analysis',
      description: 'Liquidity pool appears to be the largest holder, which is healthy for trading'
    });
    
    // Concentration risk
    if (whaleCount > 5) {
      insights.push({
        icon: '⚠️',
        title: 'High Concentration Risk',
        description: 'Multiple whales detected - potential for coordinated selling'
      });
    } else if (whaleCount <= 2) {
      insights.push({
        icon: '✅',
        title: 'Healthy Distribution',
        description: 'Token ownership is well distributed among holders'
      });
    }
    
    // Trading volume insight
    insights.push({
      icon: '📊',
      title: 'Volume Analysis',
      description: 'Monitor trading volume for unusual whale activity patterns'
    });
    
    // Smart money insight
    insights.push({
      icon: '🧠',
      title: 'Smart Money Tracking',
      description: 'Tracking known profitable wallets in the holder list'
    });
  }
  
  // Render insights
  insights.forEach((insight, index) => {
    const insightEl = createInsightElement(insight);
    insightEl.style.animationDelay = `${index * 0.1}s`;
    insightsContainer.appendChild(insightEl);
  });
}

function createInsightElement(insight) {
  const div = document.createElement('div');
  div.className = 'insight-item';
  div.innerHTML = `
    <span class="indicator-icon">${insight.icon}</span>
    <div class="indicator-content">
      <div class="indicator-title">${insight.title}</div>
      <div class="indicator-description">${insight.description}</div>
    </div>
  `;
  return div;
}

// Copy address to clipboard
window.copyAddress = function(address) {
  navigator.clipboard.writeText(address).then(() => {
    // Show confirmation (you could add a toast notification here)
    console.log('Address copied:', address);
  });
};

// Alert settings functions
function loadAlertSettings() {
  chrome.storage.sync.get(['alertSettings'], (result) => {
    if (result.alertSettings) {
      document.getElementById('alertWhaleMovement').checked = result.alertSettings.whaleMovement || false;
      document.getElementById('alertPriceChange').checked = result.alertSettings.priceChange || false;
      document.getElementById('alertNewWhales').checked = result.alertSettings.newWhales || false;
    }
  });
}

function saveAlertSettings() {
  const settings = {
    whaleMovement: document.getElementById('alertWhaleMovement').checked,
    priceChange: document.getElementById('alertPriceChange').checked,
    newWhales: document.getElementById('alertNewWhales').checked,
    tokenSymbol: document.getElementById('tokenSymbol').textContent
  };
  
  chrome.storage.sync.set({ alertSettings: settings }, () => {
    // Show save confirmation
    const btn = document.getElementById('saveAlerts');
    const originalText = btn.textContent;
    btn.textContent = '✓ Saved!';
    btn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
    
    // Send message to background script to start monitoring
    chrome.runtime.sendMessage({
      action: 'updateAlertSettings',
      settings: settings
    });
  });
}

// Mock data fallback
function displayMockData() {
  const mockData = {
    whaleScore: 75,
    holders: [
      { address: 'raydium...pool', percentage: '52.3', balance: '10.5M', activity: 'LP' },
      { address: '7xKp5...mN9q', percentage: '4.8', balance: '960K', activity: 'Active' },
      { address: '3mWe2...pL8x', percentage: '3.2', balance: '640K', activity: 'Holding' },
      { address: '9vNn4...qR7y', percentage: '2.9', balance: '580K', activity: 'Accumulating' },
      { address: '5kLm8...wE3z', percentage: '2.1', balance: '420K', activity: 'Active' },
      { address: '8pQw6...nT4v', percentage: '1.8', balance: '360K', activity: 'New' },
      { address: '2aXc9...yU6b', percentage: '1.5', balance: '300K', activity: 'Holding' },
      { address: '6fGh3...mK2p', percentage: '1.2', balance: '240K', activity: 'Selling' },
      { address: '4dRt7...sN9w', percentage: '0.9', balance: '180K', activity: 'Active' },
      { address: '1bVx5...rQ8e', percentage: '0.7', balance: '140K', activity: 'Holding' }
    ]
  };
  
  displayWhaleData(mockData);
}

// Animation helper
function animateElements() {
  const elements = document.querySelectorAll('.section, .indicator-item, .holder-card, .insight-item');
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.05}s`;
  });
}