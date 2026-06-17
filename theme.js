(function () {
  function cur() { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
  function set(t) { document.documentElement.dataset.theme = t; try { localStorage.theme = t; } catch (e) {} render(); }
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var btn;
  function render() { if (btn) btn.innerHTML = cur() === 'dark' ? SUN : MOON; }
  function init() {
    btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'alternar tema claro/escuro');
    btn.addEventListener('click', function () { set(cur() === 'dark' ? 'light' : 'dark'); });
    document.body.appendChild(btn);
    render();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
