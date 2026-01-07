/* Register service worker and handle install UI */
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      var swUrl = (document.baseURI || '/') + 'sw.js';
      // Ensure we don't end up with double base paths
      try {
        var scope = new URL('.', document.baseURI).pathname;
        swUrl = scope + 'sw.js';
      } catch (e) {}
      navigator.serviceWorker.register(swUrl).catch(function(err) {
        console.debug('SW registration failed:', err);
      });
    });
  }

  var deferredPrompt;
  var installBtn = document.getElementById('installButton');

  // iOS detection
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
    checkAndShowOverlay();
  });

  // Force button visibility on iOS Safari if not already standalone
  if (isIOS && !isStandalone && installBtn) {
    installBtn.hidden = false;
    checkAndShowOverlay();
  }

  function checkAndShowOverlay() {
    var dismissed = localStorage.getItem('pwa_overlay_dismissed');
    if (dismissed || isStandalone) return;

    // Only show on first 3 chapters (Chapter 1, 2, 3)
    var path = window.location.pathname;
    var isEarlyChapter = /\/(01|02|03)-/.test(path) || path === '/' || path === '/index.html';
    
    if (isEarlyChapter) {
      setTimeout(showDownloadOverlay, 2000); // Show after 2 seconds
    }
  }

  function showDownloadOverlay() {
    if (document.getElementById('downloadOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'downloadOverlay';
    overlay.className = 'download-overlay';
    
    var content = '';
    if (isIOS) {
      content = `
        <div class="overlay-content">
          <button class="overlay-close">×</button>
          <h2>Download this book</h2>
          <p>Read offline anytime by adding this book to your home screen.</p>
          <div class="ios-instructions">
            Tap the <strong>Share</strong> icon <img src="/assets/icons/ios-share.svg" style="display:inline;width:20px;margin:0 2px;vertical-align:middle" alt="share"> then <strong>"Add to Home Screen"</strong>.
          </div>
          <button class="btn-primary overlay-dismiss-btn">Maybe Later</button>
        </div>
      `;
    } else {
      content = `
        <div class="overlay-content">
          <button class="overlay-close">×</button>
          <h2>Download this book</h2>
          <p>Get the full experience. Read offline anytime like a native app.</p>
          <button class="btn-primary overlay-install-btn">Download Now</button>
          <button class="overlay-dismiss-link">Maybe Later</button>
        </div>
      `;
    }

    overlay.innerHTML = content;
    document.body.appendChild(overlay);

    var close = function() {
      overlay.classList.add('fade-out');
      localStorage.setItem('pwa_overlay_dismissed', 'true');
      setTimeout(function() { overlay.remove(); }, 500);
    };

    overlay.querySelector('.overlay-close').addEventListener('click', close);
    var dismissBtn = overlay.querySelector('.overlay-dismiss-btn') || overlay.querySelector('.overlay-dismiss-link');
    if (dismissBtn) dismissBtn.addEventListener('click', close);

    var installBtnAction = overlay.querySelector('.overlay-install-btn');
    if (installBtnAction && deferredPrompt) {
      installBtnAction.addEventListener('click', function() {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function() {
          close();
        });
      });
    }
  }

  // Handle the existing nav/drawer button
  if (installBtn) {
    installBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (isIOS && !isStandalone) {
        showDownloadOverlay();
      }
    });
  }
})();

