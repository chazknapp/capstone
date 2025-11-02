// scripts/site.js
(() => {
  const decades = ["1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];
  const $ = (id) => document.getElementById(id);

  /* ------------------------ Proposal: lazy-load (robust) ------------------------ */
  let _proposalLoaded = false;
  async function loadProposalOnce() {
    if (_proposalLoaded) return;

    // Try multiple candidate paths: relative, nested, and absolute.
    const baseDir = location.pathname.replace(/[^/]+$/, ''); // e.g. /site/ or /
    const candidates = [
      'content/about.html',
      './content/about.html',
      baseDir + 'content/about.html',
      '/content/about.html'
    ];

    let html = null, tried = [];
    for (const p of candidates) {
      try {
        const res = await fetch(p, { cache: 'no-cache' });
        tried.push(p + ` [${res.status}]`);
        if (res.ok) { html = await res.text(); break; }
      } catch {
        tried.push(p + ' [fetch error]');
      }
    }

    const pane = $('proposalPane');
    if (!pane) return;

    if (html) {
      pane.innerHTML = `<article class="about">${html}</article>`;
      _proposalLoaded = true;
    } else {
      pane.innerHTML = `
        <p style="color:#b00; margin:0 0 .5rem 0;">
          Couldn't load <code>content/about.html</code>.
        </p>
        <details style="font-size:12px; color:#555;">
          <summary>Details</summary>
          <pre style="white-space:pre-wrap; margin:6px 0 0 0;">Tried:\n${tried.join('\n')}</pre>
        </details>
        <p style="font-size:12px; color:#555; margin:.5rem 0 0 0;">
          Serve over HTTP (not file://) and ensure the file exists at <code>/content/about.html</code>.
          Check capitalization on Linux (content vs Content).
        </p>`;
      console.error('Proposal load failed. Tried:\n' + tried.join('\n'));
    }
  }

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
        // App will auto-load A=1950s for the selected mode
        window.EsriApp?.setMode(btn.dataset.mode);
      });
    });
    // Intentionally DO NOT select a tab on load.
  }

  /* ------------------------ Map controls ------------------------ */
  function wireControls() {
    // One opacity slider affects the active mode
    $('opacity')?.addEventListener('input', e =>
      window.EsriApp?.setOpacityForActive(parseFloat(e.target.value)));

    // Decade A/B drive the active mode
    $('decadeA')?.addEventListener('change', e =>
      window.EsriApp?.setDecadeA(e.target.value));
    $('decadeB')?.addEventListener('change', e =>
      window.EsriApp?.setDecadeB(e.target.value));

    // Swipe gating for B
    const chkSwipe = $('chkSwipe');
    const decadeB = $('decadeB');
    chkSwipe?.addEventListener('change', () => {
      if (chkSwipe.checked) {
        decadeB.disabled = false;
      } else {
        decadeB.value = '';
        decadeB.disabled = true;
        window.EsriApp?.setDecadeB('');   // clears B and kills swipe if active
      }
      window.EsriApp?.refreshSwipe();
    });

    // Centroids / Path (default OFF)
    $('chkCentroids')?.addEventListener('change', e =>
      window.EsriApp?.enableCentroids(e.target.checked));
    $('chkCentroidPath')?.addEventListener('change', e =>
      window.EsriApp?.enablePath(e.target.checked));

    // Clear → reset to clean basemap (stay on map view)
    $('btnClear')?.addEventListener('click', () => {
      window.EsriApp?.clearToBasemap?.();
    });
  }

  /* ------------------------ Drawer (Stats | About | Proposal) ------------------------ */
  function wireDrawer() {
    const drawer = $('drawer');
    const btnStats = $('btnStats');
    const btnAbout = $('btnAbout');
    const btnProposal = $('btnProposal');
    const btnClose = $('drawerClose');

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

    async function toggleDrawerFor(paneId) {
      const current = Object.entries(panes).find(([id, el]) => el?.classList.contains('active'))?.[0];
      if (isOpen() && current === paneId) {
        drawer.classList.remove('open');        // clicking same button closes
      } else {
        if (paneId === 'proposalPane') await loadProposalOnce(); // lazy-load Proposal
        showPane(paneId);
        drawer.classList.add('open');           // open or switch while open
      }
    }

    btnStats?.addEventListener('click', () => toggleDrawerFor('statsPane'));
    btnAbout?.addEventListener('click', () => toggleDrawerFor('aboutPane'));
    btnProposal?.addEventListener('click', () => toggleDrawerFor('proposalPane'));
    btnClose?.addEventListener('click', () => drawer.classList.remove('open'));

    // Drawer tabs at top: switch pane, keep drawer open
    tabButtons.forEach(b => {
      b.addEventListener('click', async () => {
        if (b.dataset.pane === 'proposalPane') await loadProposalOnce(); // ensure loaded
        showPane(b.dataset.pane);
      });
    });

    // ESC closes drawer
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

    // UI defaults on load
    const chkCentroids = $('chkCentroids'); if (chkCentroids) chkCentroids.checked = false;
    const chkPath = $('chkCentroidPath'); if (chkPath) chkPath.checked = false;
    const chkSwipe = $('chkSwipe'); if (chkSwipe) chkSwipe.checked = false;
    const decadeB = $('decadeB'); if (decadeB) { decadeB.value = ''; decadeB.disabled = true; }

    // Home → Map: init basemap only (no layers)
    $('btnExplore')?.addEventListener('click', async () => {
      $('home')?.classList.remove('active');
      $('mapview')?.classList.add('active');
      await window.EsriApp?.init();
    });
  });
})();

