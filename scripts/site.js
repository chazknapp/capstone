// scripts/site.js
(() => {
  const decades = ["1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];
  const $ = (id) => document.getElementById(id);

  /* ------------------------ Decade selects ------------------------ */
  function populateDecadeSelects() {
    const add = (id, opts) => {
      const sel = $(id);
      if (!sel || sel.options.length) return;
      opts.forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        sel.appendChild(o);
      });
    };
    add('decadeA', decades);
    add('decadeB', decades);

    // Defaults: A = 1950s, B = disabled until swipe
    const a = $('decadeA'), b = $('decadeB');
    if (a) a.value = '1950s';
    if (b) { b.value = ''; b.disabled = true; }
  }

  /* ------------------------ Mode tabs (no auto-load at home) ------------------------ */
  function wireTabs() {
    const tabs = document.querySelectorAll('.mode-tabs .tab');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.EsriApp?.setMode(btn.dataset.mode); // app defaults A to 1950s
      });
    });
  }

  /* ------------------------ Map controls ------------------------ */
  function wireControls() {
    $('opacity')?.addEventListener('input', e =>
      window.EsriApp?.setOpacityForActive(parseFloat(e.target.value)));

    $('decadeA')?.addEventListener('change', e =>
      window.EsriApp?.setDecadeA(e.target.value));

    $('decadeB')?.addEventListener('change', e =>
      window.EsriApp?.setDecadeB(e.target.value));

    const chkSwipe = $('chkSwipe');
    const decadeB = $('decadeB');
    chkSwipe?.addEventListener('change', () => {
      if (chkSwipe.checked) {
        decadeB.disabled = false;
      } else {
        decadeB.value = '';
        decadeB.disabled = true;
        window.EsriApp?.setDecadeB('');
      }
      window.EsriApp?.refreshSwipe();
    });

    $('chkCentroids')?.addEventListener('change', e =>
      window.EsriApp?.enableCentroids(e.target.checked));

    $('chkCentroidPath')?.addEventListener('change', e =>
      window.EsriApp?.enablePath(e.target.checked));

    $('btnClear')?.addEventListener('click', () => {
      window.EsriApp?.clearToBasemap?.();
    });
  }

  /* ------------------------ Drawer: Stats | About | Proposal ------------------------ */
  function wireDrawer() {
    const drawer = $('drawer');
    const btnStats = $('btnStats');
    const btnAbout = $('btnAbout');
    const btnClose = $('drawerClose');

    // If you have a footer button for proposal, wire it here
    const btnProposal = $('btnProposal');

    const panes = {
      statsPane: $('statsPane'),
      aboutPane: $('aboutPane'),
      proposalPane: $('proposalPane')
    };

    const tabButtons = document.querySelectorAll('.drawer-tabs button');
    const isOpen = () => drawer.classList.contains('open');

    function showPane(paneId) {
      Object.values(panes).forEach(p => p?.classList.remove('active'));
      panes[paneId]?.classList.add('active');
      tabButtons.forEach(b => b.classList.toggle('active', b.dataset.pane === paneId));
    }

    function toggleDrawerFor(paneId) {
      const current = Object.entries(panes).find(([id, el]) => el?.classList.contains('active'))?.[0];
      if (isOpen() && current === paneId) {
        drawer.classList.remove('open');
      } else {
        showPane(paneId);
        drawer.classList.add('open');
      }
    }

    btnStats?.addEventListener('click', () => toggleDrawerFor('statsPane'));
    btnAbout?.addEventListener('click', () => toggleDrawerFor('aboutPane'));
    btnProposal?.addEventListener('click', () => toggleDrawerFor('proposalPane'));
    btnClose?.addEventListener('click', () => drawer.classList.remove('open'));

    tabButtons.forEach(b => {
      b.addEventListener('click', () => {
        showPane(b.dataset.pane);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) drawer.classList.remove('open');
    });
  }

  /* ------------------------ Boot ------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    populateDecadeSelects();
    wireTabs();
    wireControls();
    wireDrawer();

    const chkCentroids = $('chkCentroids'); if (chkCentroids) chkCentroids.checked = false;
    const chkPath = $('chkCentroidPath'); if (chkPath) chkPath.checked = false;
    const chkSwipe = $('chkSwipe'); if (chkSwipe) chkSwipe.checked = false;
    const decadeB = $('decadeB'); if (decadeB) { decadeB.value = ''; decadeB.disabled = true; }

    $('btnExplore')?.addEventListener('click', async () => {
      $('home')?.classList.remove('active');
      $('mapview')?.classList.add('active');
      await window.EsriApp?.init();
    });
  });
})();
