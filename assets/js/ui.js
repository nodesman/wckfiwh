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

