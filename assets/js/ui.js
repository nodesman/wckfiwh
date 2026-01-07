// Drawer / hamburger toggle + backdrop and ARIA updates
(function() {
  var drawer = document.getElementById('drawer');
  var backdrop = document.getElementById('backdrop');
  var openBtn = document.getElementById('hamburger');
  var closeBtn = document.getElementById('drawerClose');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('drawer-open');
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // Handle responsive behavior
  var mediaQuery = window.matchMedia('(min-width: 1024px)');
  
  function handleScreenChange(e) {
    if (e.matches) {
      // Desktop: Reset mobile toggle states
      if (drawer) drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.remove('drawer-open');
      if (backdrop) backdrop.hidden = true;
      // We don't remove 'open' class from drawer as it might be used for styling, 
      // but strictly speaking our CSS handles the visibility. 
      // Cleanest is to close the "mobile" drawer logic.
      if (drawer) drawer.classList.remove('open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    } else {
      // Mobile: Restore accessibility state if strictly closed
      // If we just transitioned from desktop, drawer is technically "closed" in mobile sense
      if (drawer && !drawer.classList.contains('open')) {
        drawer.setAttribute('aria-hidden', 'true');
      }
    }
  }

  // Initial check
  handleScreenChange(mediaQuery);
  // Listen for changes
  mediaQuery.addEventListener('change', handleScreenChange);
})();

// Lightbox logic
(function() {
  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close">&times;</button><img src="" alt="">';
  document.body.appendChild(lightbox);

  var lbImg = lightbox.querySelector('img');
  var lbClose = lightbox.querySelector('.lightbox-close');

  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('.lightbox')) {
      lbImg.src = e.target.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox || e.target === lbImg) closeLightbox();
  });
})();

// Sharing logic
(function() {
  function shareContent(title, text, url) {
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url })
        .catch(function() { /* silence error */ });
    } else {
      // Fallback: Copy to clipboard
      var dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.value = url;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      alert('Link copied to clipboard');
    }
  }

  // Add share button to nav
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var shareBtn = document.createElement('button');
    shareBtn.className = 'share-page-btn';
    shareBtn.setAttribute('aria-label', 'Share this page');
    shareBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="display:block;"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>';
    nav.insertBefore(shareBtn, nav.firstChild);
    shareBtn.addEventListener('click', function() {
      shareContent(document.title, "Check out this guide on Strategic Privacy & Social Autonomy", window.location.href);
    });
  }

  // Add share anchors to headings
  var headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .content-panel h1, .content-panel h2');
  headings.forEach(function(h) {
    if (!h.id) {
      h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    var anchor = document.createElement('button');
    anchor.className = 'heading-share';
    anchor.innerHTML = '#';
    anchor.setAttribute('aria-label', 'Share this section');
    h.appendChild(anchor);

    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var url = window.location.origin + window.location.pathname + '#' + h.id;
      shareContent(document.title + ' - ' + h.innerText.replace('#', '').trim(), "Reading: " + h.innerText.replace('#', '').trim(), url);
    });
  });
})();

