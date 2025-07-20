// Simple linkclump - Z key + drag to open multiple links

const Z_KEY = 90;
let isZPressed = false;
let isDragging = false;
let startX = 0;
let startY = 0;
let selectionBox = null;
let highlightedLinks = [];

// Listen for key events
document.addEventListener('keydown', (e) => {
  if (e.keyCode === Z_KEY && !isZPressed) {
    isZPressed = true;
    document.body.style.userSelect = 'none'; // Prevent text selection
  }
});

document.addEventListener('keyup', (e) => {
  if (e.keyCode === Z_KEY) {
    isZPressed = false;
    isDragging = false;
    document.body.style.userSelect = '';
    removeSelectionBox();
    clearHighlightedLinks();
  }
});

// Mouse events for dragging
document.addEventListener('mousedown', (e) => {
  if (isZPressed && e.button === 0) { // Left mouse button
    isDragging = true;
    startX = e.pageX;
    startY = e.pageY;
    createSelectionBox(startX, startY);
    e.preventDefault();
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging && selectionBox) {
    updateSelectionBox(startX, startY, e.pageX, e.pageY);
    highlightLinksInSelection();
    e.preventDefault();
  }
});

document.addEventListener('mouseup', (e) => {
  if (isDragging && selectionBox) {
    const links = getLinksInSelection();
    if (links.length > 0) {
      chrome.runtime.sendMessage({
        action: 'openTabs',
        urls: links
      });
    }
    
    isDragging = false;
    removeSelectionBox();
    clearHighlightedLinks();
    e.preventDefault();
  }
});

function createSelectionBox(x, y) {
  selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px solid #ff6600;
    background: rgba(255, 102, 0, 0.1);
    z-index: 999999;
    pointer-events: none;
    left: ${x}px;
    top: ${y}px;
    width: 0px;
    height: 0px;
  `;
  document.body.appendChild(selectionBox);
}

function updateSelectionBox(startX, startY, currentX, currentY) {
  if (!selectionBox) return;
  
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function removeSelectionBox() {
  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }
}

function getLinksInSelection() {
  if (!selectionBox) return [];
  
  const rect = selectionBox.getBoundingClientRect();
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;
  
  const selectionArea = {
    left: rect.left + scrollX,
    top: rect.top + scrollY,
    right: rect.right + scrollX,
    bottom: rect.bottom + scrollY
  };
  
  const links = [];
  const allLinks = document.querySelectorAll('a[href]');
  
  for (const link of allLinks) {
    const linkRect = link.getBoundingClientRect();
    const linkArea = {
      left: linkRect.left + scrollX,
      top: linkRect.top + scrollY,
      right: linkRect.right + scrollX,
      bottom: linkRect.bottom + scrollY
    };
    
    // Check if link overlaps with selection
    if (linkArea.left < selectionArea.right &&
        linkArea.right > selectionArea.left &&
        linkArea.top < selectionArea.bottom &&
        linkArea.bottom > selectionArea.top) {
      
      const href = link.href;
      if (href && href.startsWith('http') && !links.includes(href)) {
        links.push(href);
      }
    }
  }
  
  return links;
}

function highlightLinksInSelection() {
  clearHighlightedLinks();
  
  if (!selectionBox) return;
  
  const rect = selectionBox.getBoundingClientRect();
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;
  
  const selectionArea = {
    left: rect.left + scrollX,
    top: rect.top + scrollY,
    right: rect.right + scrollX,
    bottom: rect.bottom + scrollY
  };
  
  const allLinks = document.querySelectorAll('a[href]');
  
  for (const link of allLinks) {
    const linkRect = link.getBoundingClientRect();
    const linkArea = {
      left: linkRect.left + scrollX,
      top: linkRect.top + scrollY,
      right: linkRect.right + scrollX,
      bottom: linkRect.bottom + scrollY
    };
    
    if (linkArea.left < selectionArea.right &&
        linkArea.right > selectionArea.left &&
        linkArea.top < selectionArea.bottom &&
        linkArea.bottom > selectionArea.top) {
      
      const href = link.href;
      if (href && href.startsWith('http')) {
        link.style.backgroundColor = 'rgba(255, 102, 0, 0.3)';
        link.style.outline = '2px solid #ff6600';
        highlightedLinks.push(link);
      }
    }
  }
}

function clearHighlightedLinks() {
  for (const link of highlightedLinks) {
    link.style.backgroundColor = '';
    link.style.outline = '';
  }
  highlightedLinks = [];
}