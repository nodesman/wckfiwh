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
  });

  // Force button visibility on iOS Safari if not already standalone
  if (isIOS && !isStandalone && installBtn) {
    installBtn.hidden = false;
  }

  function showIOSDownloadHint() {
    var hint = document.createElement('div');
    hint.className = 'install-hint';
    hint.innerHTML = '<span>To download this book: Tap <strong>Share</strong> and then <strong>"Add to Home Screen"</strong>.</span><button style="background:none;border:0;color:inherit;margin-left:10px;font-weight:bold;cursor:pointer">×</button>';
    document.body.appendChild(hint);

    var dismiss = function() {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 0.5s';
      setTimeout(function() { hint.remove(); }, 500);
    };

    hint.querySelector('button').addEventListener('click', dismiss);
    setTimeout(dismiss, 10000);
  }

  if (installBtn) {
    installBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        installBtn.disabled = true;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
          installBtn.disabled = false;
          if (choiceResult.outcome === 'accepted') {
            installBtn.hidden = true;
          }
          deferredPrompt = null;
        });
      } else if (isIOS && !isStandalone) {
        showIOSDownloadHint();
      }
    });
  }
})();

