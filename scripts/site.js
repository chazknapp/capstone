// scripts/site.js
(() => {
  const decades = ["1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];
  const $ = (id) => document.getElementById(id);

  /* ------------------------ Centroids help popup ------------------------ */
  function mountCentroidsPopup() {
    if (document.getElementById('centroidsHelp')) return;
    const box = document.createElement('div');
    box.id = 'centroidsHelp';
    box.className = 'info-popup';
    box.innerHTML = `
      <div class="info-header">
        <h3>About centroids</h3>
        <button class="info-close" title="Close">×</button>
      </div>
      <div class="info-body">
        <p>
          Each centroid marks the spatial center of tornado activity for a decade,
          computed from the first five years of that decade to keep periods comparable
          — for example 1950–1954, 1960–1964, …, 2020–2024.
        </p>
        <ul>
          <li>Dots represent decade centers,</li>
          <li>Connected dots show the long-term path,</li>
          <li>East–southeast drift visualizes a shifting corridor of activity.</li>
        </ul>
      </div>`;
    document.body.appendChild(box);
    box.querySelector('.info-close')?.addEventListener('click', () => box.classList.remove('show'));
    box.addEventListener('keydown', e => { if (e.key === 'Escape') box.classList.remove('show'); });
  }
  function showCentroidsPopup() {
    mountCentroidsPopup();
    const box = document.getElementById('centroidsHelp');
    if (!box) return;
    box.classList.add('show');
    clearTimeout(box._hideTimer);
    box._hideTimer = setTimeout(() => box.classList.remove('show'), 12000);
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

    const a = $('decadeA'), b = $('decadeB');
    if (a) a.value = '1950s';
    if (b) { b.value = ''; b.disabled = true; }
  }

  /* ------------------------ Mode tabs ------------------------ */
  function wireTabs() {
    const tabs = document.querySelectorAll('.mode-tabs .tab');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.EsriApp?.setMode(btn.dataset.mode);
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

    $('chkCentroids')?.addEventListener('change', e => {
      const on = e.target.checked;
      window.EsriApp?.enableCentroids(on);
      if (on) showCentroidsPopup();
    });

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

    tabButtons.forEach(b => b.addEventListener('click', () => showPane(b.dataset.pane)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) drawer.classList.remove('open');
    });
  }

  /* ------------------------ Boot ------------------------ */
  document.addEventListener('DOMContentLoaded', async () => {
    // Always show the welcome overlay (mandatory each visit)
    const overlay = $('welcomeOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.body.classList.add('overlay-open'); // prevent background scroll
    }
    // Make Explore work immediately
    $('btnExploreOverlay')?.addEventListener('click', () => {
      if (overlay) overlay.style.display = 'none';
      document.body.classList.remove('overlay-open');
    });

    // Wire UI
    populateDecadeSelects();
    wireTabs();
    wireControls();
    wireDrawer();

    // Reset toggles
    const chkCentroids = $('chkCentroids'); if (chkCentroids) chkCentroids.checked = false;
    const chkPath = $('chkCentroidPath'); if (chkPath) chkPath.checked = false;
    const chkSwipe = $('chkSwipe'); if (chkSwipe) chkSwipe.checked = false;
    const decadeB = $('decadeB'); if (decadeB) { decadeB.value = ''; decadeB.disabled = true; }

    // Initialize the map behind the overlay (don't block the Explore button)
    try {
      if (window.EsriApp?.init) await window.EsriApp.init();
    } catch (err) {
      console.error('Esri init failed:', err);
    }
  });
})();
