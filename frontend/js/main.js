document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const shortenerForm = document.getElementById('shortener-form');
  const urlInput = document.getElementById('url-input');
  const submitBtn = document.getElementById('submit-btn');
  const btnSpinner = document.getElementById('btn-spinner');
  const formErrorMsg = document.getElementById('form-error-msg');
  
  const resultSection = document.getElementById('result-section');
  const shortenedUrlText = document.getElementById('shortened-url-text');
  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const qrToggleBtn = document.getElementById('qr-toggle-btn');
  const qrContainer = document.getElementById('qr-container');
  const qrCanvas = document.getElementById('qr-canvas');
  const originalUrlPreview = document.getElementById('original-url-preview');
  const viewStatsBtn = document.getElementById('view-stats-btn');
  
  const analyticsSection = document.getElementById('analytics-section');
  const analyticsShortId = document.getElementById('analytics-short-id');
  const totalClicksCount = document.getElementById('total-clicks-count');
  const devicePctDesktop = document.getElementById('device-pct-desktop');
  const deviceBarDesktop = document.getElementById('device-bar-desktop');
  const devicePctMobile = document.getElementById('device-pct-mobile');
  const deviceBarMobile = document.getElementById('device-bar-mobile');
  const devicePctTablet = document.getElementById('device-pct-tablet');
  const deviceBarTablet = document.getElementById('device-bar-tablet');
  const browserDistributionList = document.getElementById('browser-distribution-list');
  const osDistributionList = document.getElementById('os-distribution-list');
  const activityLogBody = document.getElementById('activity-log-body');

  let currentShortId = '';
  let qrInstance = null;

  // Dynamic API Base URL detection
  const API_BASE_URL = window.location.port === '3000' ? '' : 'http://localhost:3000';

  /* ==========================================================================
     Theme Management
     ========================================================================== */
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  /* ==========================================================================
     URL Shortening Form Handler
     ========================================================================== */
  shortenerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset states
    formErrorMsg.style.display = 'none';
    formErrorMsg.textContent = '';
    
    const originalUrl = urlInput.value.trim();
    if (!originalUrl) return;

    // Show loading state
    submitBtn.disabled = true;
    urlInput.disabled = true;
    btnSpinner.style.display = 'inline-block';
    
    try {
      const response = await fetch(`${API_BASE_URL}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originalUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Success
      currentShortId = data.shortId;
      shortenedUrlText.textContent = data.shortenedUrl;
      originalUrlPreview.textContent = data.originalUrl;
      originalUrlPreview.href = data.originalUrl;
      
      // Hide analytics section if showing statistics for another link
      analyticsSection.classList.add('hidden');
      qrContainer.classList.add('hidden');

      // Display results card
      resultSection.classList.remove('hidden');
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Generate QR Code instance
      generateQRCode(data.shortenedUrl);
      
    } catch (err) {
      formErrorMsg.textContent = err.message;
      formErrorMsg.style.display = 'block';
    } finally {
      // Hide loading state
      submitBtn.disabled = false;
      urlInput.disabled = false;
      btnSpinner.style.display = 'none';
    }
  });

  /* ==========================================================================
     Result Actions (Copy & QR Toggle)
     ========================================================================== */
  copyBtn.addEventListener('click', async () => {
    const textToCopy = shortenedUrlText.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Copy visual feedback
      copyBtn.classList.add('copied');
      copyBtnText.textContent = 'Copied!';
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtnText.textContent = 'Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  });

  qrToggleBtn.addEventListener('click', () => {
    qrContainer.classList.toggle('hidden');
    if (!qrContainer.classList.contains('hidden')) {
      qrContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  const generateQRCode = (url) => {
    if (qrInstance) {
      qrInstance.value = url;
    } else {
      qrInstance = new QRious({
        element: qrCanvas,
        value: url,
        size: 150,
        background: '#ffffff',
        foreground: '#0f172a'
      });
    }
  };

  /* ==========================================================================
     Analytics & Reporting Dashboard
     ========================================================================== */
  viewStatsBtn.addEventListener('click', async () => {
    if (!currentShortId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/url/analytics/${currentShortId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics.');
      }

      renderAnalytics(data);
      
      // Reveal & scroll to dashboard
      analyticsSection.classList.remove('hidden');
      setTimeout(() => {
        analyticsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      alert(err.message);
    }
  });

  const renderAnalytics = (data) => {
    // Set Header Short ID Info
    analyticsShortId.textContent = data.shortId;
    
    // Set Clicks counter
    totalClicksCount.textContent = data.visits.toLocaleString();

    const totalVisits = data.visits || 1; // avoid division by zero

    // 1. Render Devices
    const dStats = data.deviceStats || { Mobile: 0, Tablet: 0, Desktop: 0 };
    const mobilePct = Math.round((dStats.Mobile / totalVisits) * 100) || 0;
    const tabletPct = Math.round((dStats.Tablet / totalVisits) * 100) || 0;
    const desktopPct = Math.round((dStats.Desktop / totalVisits) * 100) || 0;

    devicePctDesktop.textContent = `${desktopPct}%`;
    deviceBarDesktop.style.width = `${desktopPct}%`;

    devicePctMobile.textContent = `${mobilePct}%`;
    deviceBarMobile.style.width = `${mobilePct}%`;

    devicePctTablet.textContent = `${tabletPct}%`;
    deviceBarTablet.style.width = `${tabletPct}%`;

    // 2. Render Browsers
    renderStatList(browserDistributionList, data.browserStats, totalVisits);

    // 3. Render OS
    renderStatList(osDistributionList, data.osStats, totalVisits);

    // 4. Render Table Logs
    activityLogBody.innerHTML = '';
    const history = data.history || [];
    
    if (history.length === 0) {
      activityLogBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-state">No click logs recorded yet. Visit the shortened link to test tracking!</td>
        </tr>
      `;
    } else {
      history.forEach((visit) => {
        const tr = document.createElement('tr');
        
        // Format timestamp nicely
        const dateObj = new Date(visit.timestamp);
        const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Hide details if IP address is blank or local
        const ipText = visit.ipAddress === '::1' || visit.ipAddress === '127.0.0.1' ? 'Localhost (Self)' : visit.ipAddress;
        
        tr.innerHTML = `
          <td>${formattedDate}</td>
          <td><span class="footer-tag">${escapeHtml(visit.device || 'Desktop')}</span></td>
          <td>${escapeHtml(visit.browser || 'Unknown')}</td>
          <td>${escapeHtml(visit.os || 'Unknown')}</td>
          <td><code>${escapeHtml(ipText || 'Anonymous')}</code></td>
        `;
        activityLogBody.appendChild(tr);
      });
    }
  };

  // Helper function to render browser/OS lists dynamically
  const renderStatList = (container, statsObject, totalVisits) => {
    container.innerHTML = '';
    
    if (!statsObject || Object.keys(statsObject).length === 0) {
      container.innerHTML = '<p class="empty-state">No data recorded yet.</p>';
      return;
    }

    // Sort key-value pairs by click count descending
    const sortedStats = Object.entries(statsObject)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4); // Limit to top 4

    sortedStats.forEach(([name, count]) => {
      const pct = Math.round((count / totalVisits) * 100) || 0;
      
      const row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML = `
        <div class="dist-header">
          <span>${escapeHtml(name)}</span>
          <span class="dist-percentage">${pct}% (${count})</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    });
  };

  // Simple HTML escaping helper to prevent XSS injection in analytical displays
  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
});
