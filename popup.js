// Popup script
document.getElementById('visitWebsite').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://whalesonsol.com' });
});

document.getElementById('settings').addEventListener('click', (e) => {
  e.preventDefault();
  // In a real extension, this would open settings
  alert('Settings coming soon!');
});

document.getElementById('help').addEventListener('click', (e) => {
  e.preventDefault();
  // In a real extension, this would open help
  alert('Help coming soon!');
});