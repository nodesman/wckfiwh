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

  window.addEventListener('beforeinstallprompt', function(e) {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', function() {
      if (!deferredPrompt) return;
      installBtn.disabled = true;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choiceResult) {
        installBtn.disabled = false;
        if (choiceResult.outcome === 'accepted') {
          installBtn.hidden = true;
        }
        deferredPrompt = null;
      });
    });
  }

  // iOS guidance: show subtle hint if on iPhone/iPad Safari
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isIOS && !isStandalone) {
    // Create a lightweight hint near the footer
    var hint = document.createElement('div');
    hint.className = 'install-hint';
    hint.textContent = 'Tip: Add to Home Screen via Share → Add to Home Screen';
    document.body.appendChild(hint);
    setTimeout(function(){ hint.remove(); }, 10000);
  }
})();

