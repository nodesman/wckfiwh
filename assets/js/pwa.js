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
  var hintDismissed = localStorage.getItem('pwa_hint_dismissed');

  if (isIOS && !isStandalone && !hintDismissed) {
    // Create a lightweight hint near the footer
    var hint = document.createElement('div');
    hint.className = 'install-hint';
    hint.innerHTML = '<span>Tip: Add to Home Screen via Share → Add to Home Screen</span><button style="background:none;border:0;color:inherit;margin-left:10px;font-weight:bold;cursor:pointer">×</button>';
    document.body.appendChild(hint);

    var dismiss = function() {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 0.5s';
      localStorage.setItem('pwa_hint_dismissed', 'true');
      setTimeout(function() { hint.remove(); }, 500);
    };

    hint.querySelector('button').addEventListener('click', dismiss);
    setTimeout(dismiss, 12000); // Auto-hide after 12s and save preference
  }
})();

