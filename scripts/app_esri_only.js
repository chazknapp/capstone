// scripts/app_esri_only.js
(function () {
  'use strict';

  // -------------------------------------------------------------
  //  State
  // -------------------------------------------------------------
  let view = null, map = null, swipe = null;
  let mode = null;                              // start blank; user picks a tab

  let kdeOpacity = 0.85, tesOpacity = 0.9, ptsOpacity = 0.9;

  const AGOL = {
    // ---- KDE (raster tiles) ----
    KDE_TILES: {
      "1950s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_19502/MapServer",
      "1960s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_19602/MapServer",
      "1970s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_19702/MapServer",
      "1980s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_19802/MapServer",
      "1990s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_19902/MapServer",
      "2000s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_20002/MapServer",
      "2010s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_20102/MapServer",
      "2020s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/KDE_20202/MapServer"
    },

    // ---- Tessellation (vector tiles for display) ----
    TESSEL_TILES: {
      "1950s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_19502/VectorTileServer",
      "1960s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_19602/VectorTileServer",
      "1970s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_19702/VectorTileServer",
      "1980s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_19802/VectorTileServer",
      "1990s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1990/VectorTileServer",
      "2000s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_20002/VectorTileServer",
      "2010s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_20102/VectorTileServer",
      "2020s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_20202/VectorTileServer"
    },

    // ---- Tessellation FeatureServer for CLICK popups (use your layer URL) ----
    TESSEL_ATTRS: {
      // If you publish more decades, add them here. This one is confirmed:
      "1950s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1950F/FeatureServer",
      "1960s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1960F/FeatureServer",
      "1970s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1970F/FeatureServer",
      "1980s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1980F/FeatureServer",
      "1990s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_1990F/FeatureServer",
      "2000s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_2000F/FeatureServer",
      "2010s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_2010F/FeatureServer",
      "2020s": "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/tor_tessellation_2020F/FeatureServer"
    },

    // ---- Points (vector tiles or feature layers) ----
    POINTS_TILES: {
      "1950s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/points1950/VectorTileServer",
      "1960s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/points1960s/VectorTileServer",
      "1970s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/points1970s2/VectorTileServer",
      "1980s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/points1980s2/VectorTileServer",
      "1990s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/points1990s2/VectorTileServer",
      "2000s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/pointsT2000s2/VectorTileServer",
      "2010s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/pointsT2010s2/VectorTileServer",
      "2020s": "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/pointsT2020s2/VectorTileServer"
    },

    // ---- Centroids + path ----
    CENTROIDS: "https://tiles.arcgis.com/tiles/arEmNCTACQWsn5zF/arcgis/rest/services/tornado_centroids2/VectorTileServer",
    CENTROID_PATH: "https://services5.arcgis.com/arEmNCTACQWsn5zF/arcgis/rest/services/centroid_path/FeatureServer/0"
  };

  // -------------------------------------------------------------
  //  DOM + helpers
  // -------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const lyrById = (id) => map?.allLayers?.find(l => l.id === id) || null;
  const removeIf = (id) => { const L = lyrById(id); if (L) map.remove(L); };
  function getIdsByMode(){ if(mode==="KDE") return{A:"kdeA",B:"kdeB"}; if(mode==="TES") return{A:"tesA",B:"tesB"}; return{A:"ptsA",B:"ptsB"}; }
  function topify(id){ const L=lyrById(id); if(L) try{ map.reorder(L,map.allLayers.length-1);}catch{} }

  // Keep B decade in sync with swipe toggle
  function syncBSelectWithSwipe(){
    const swipeChk = $('chkSwipe');
    const selB = $('decadeB');
    if (!selB) return;
    if (swipeChk?.checked) {
      selB.disabled = false;
    } else {
      selB.disabled = true;
      selB.value = "";
      selB.selectedIndex = -1;
      // remove any B layer and swipe widget
      removeIf("kdeB"); removeIf("tesB"); removeIf("ptsB");
      killSwipe();
    }
  }

  // -------------------------------------------------------------
  //  UI styles (zoom pos, hint, popup table) + A/B labels
  // -------------------------------------------------------------
  let swipeLabelA = null, swipeLabelB = null;

  function ensureUIStyles(){
    if (document.getElementById('uiTweaksStyles')) return;
    const css = document.createElement('style');
    css.id = 'uiTweaksStyles';
    css.textContent = `
      /* A/B badges (only visible when swipe is active) */
      .swipe-label{
        background: rgba(17,17,17,.75);
        color:#fff; font-weight:700; font-size:12px; line-height:1;
        padding:4px 6px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,.2);
      }
      #singleMap .esri-ui-top-left    .swipe-label{ margin-top:6px; }
      #singleMap .esri-ui-bottom-left .swipe-label{ margin-bottom:6px; }

      /* Move zoom down-right so it clears footer */
      #singleMap .esri-ui-bottom-right{
        bottom: 10px !important;
        right: 18px !important;
      }
      #singleMap .esri-ui-bottom-right .esri-component{
        margin-bottom: 8px;
      }

      /* Optional: hide attribution strip */
      #singleMap .esri-attribution{ display: none !important; }

      /* Compact popup table + hint card */
      .esri-popup__main-container{ max-width: 280px; }
      .esri-popup__content .attr-mini{ width:100%; border-collapse:collapse; font-size:12px; }
      .esri-popup__content .attr-mini th{ text-align:left; font-weight:600; padding:2px 6px 2px 0; }
      .esri-popup__content .attr-mini td{ padding:2px 0; }
      .esri-popup__content .attr-mini tr+tr td,
      .esri-popup__content .attr-mini tr+tr th{ border-top:1px solid #eee; }

      .mode-hint{
        position: fixed; top: 64px; right: 12px; z-index: 25;
        max-width: 280px; padding: 10px 12px;
        border:1px solid rgba(17,17,17,.15);
        background: rgba(255,255,255,.92);
        backdrop-filter: saturate(140%) blur(2px);
        border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,.12);
        font-size:13px; line-height:1.35; color:#111; display:none;
      }
      .mode-hint.show{ display:block; }
      .mode-hint .mh-close{
        position:absolute; top:4px; right:6px; border:none; background:transparent;
        font-size:16px; line-height:1; cursor:pointer; color:#111; opacity:.65;
      }
      .mode-hint .mh-close:hover{ opacity:1; }
    `;
    document.head.appendChild(css);
  }

  function createSwipeLabels(){
    if (swipeLabelA && swipeLabelB) return;
    ensureUIStyles();
    swipeLabelA = document.createElement('div');
    swipeLabelA.className = 'swipe-label';
    swipeLabelA.textContent = 'A';
    swipeLabelB = document.createElement('div');
    swipeLabelB.className = 'swipe-label';
    swipeLabelB.textContent = 'B';
    view.ui.add(swipeLabelA, 'top-left');
    view.ui.add(swipeLabelB, 'bottom-left');
    hideSwipeLabels();
  }
  function showSwipeLabels(){ if(!swipeLabelA||!swipeLabelB) createSwipeLabels(); swipeLabelA.style.display='block'; swipeLabelB.style.display='block'; }
  function hideSwipeLabels(){ if(swipeLabelA) swipeLabelA.style.display='none'; if(swipeLabelB) swipeLabelB.style.display='none'; }

  // -------------------------------------------------------------
  //  Swipe
  // -------------------------------------------------------------
  function killSwipe() {
    if (!swipe || !view) { hideSwipeLabels(); return; }
    view.ui.remove(swipe);
    swipe.destroy();
    swipe = null;
    hideSwipeLabels();
  }

  function refreshSwipe() {
    const want = $('chkSwipe')?.checked;
    const { A, B } = getIdsByMode();
    const LA = lyrById(A), LB = lyrById(B);

    if (!want || !LA || !LB) { killSwipe(); return; }

    require(["esri/widgets/Swipe"], (Swipe) => {
      if (!swipe) {
        swipe = new Swipe({
          view,
          leadingLayers: [LA],
          trailingLayers: [LB],
          direction: "vertical",
          position: 50
        });
        view.ui.add(swipe);
      } else {
        swipe.leadingLayers = [LA];
        swipe.trailingLayers = [LB];
      }
      showSwipeLabels(); // labels visible only when swipe is active
    });
  }

  function hideModeLayers(){
    const {A,B}=getIdsByMode();
    removeIf(A); removeIf(B);
    killSwipe();
  }

  // -------------------------------------------------------------
  //  Tessellation CLICK (FeatureLayer for attributes)
  // -------------------------------------------------------------
  const tesAttrsId = "tesAttrs";
  let tesAttrsLV = null;

  function removeTesAttrs(){
    const L = lyrById(tesAttrsId);
    if (L) map.remove(L);
    tesAttrsLV = null;
  }

  // Small HTML table for popup (uses field aliases when available)
function buildTableHTML(attrs, preferredNames = ["NAME","DECADE","TOR_COUNT","INJURIES","DEATHS"], aliasMap = {}) {
  const keys = Object.keys(attrs || {});
  const preferred = preferredNames.filter(f => keys.includes(f));
  const others = keys
    .filter(k => !preferred.includes(k))
    .filter(k => !/^objectid$/i.test(k) && !/^shape/i.test(k))
    .sort();

  const order = [...preferred, ...others];
  const rows = order.map(k => {
    const label = aliasMap[k] || k;                // <— alias if present
    let v = attrs[k];
    if (typeof v === "number") v = v.toLocaleString();
    if (v == null) v = "";
    return `<tr><th>${label}</th><td>${v}</td></tr>`;
  }).join("");

  return `<table class="attr-mini"><tbody>${rows}</tbody></table>`;
}


  function _attachTesAttrs(url){
  require(["esri/layers/FeatureLayer"], (FeatureLayer)=>{
    removeTesAttrs();

    const fl = new FeatureLayer({
      id: tesAttrsId,
      url,
      outFields: ["*"],
      opacity: 0.001,     // invisible but clickable
      popupEnabled: true
    });

    map.add(fl); topify(tesAttrsId);

    // Build alias map once the layer schema is loaded
    fl.load().then(() => {
      const aliasMap = Object.fromEntries(
        (fl.fields || []).map(f => [f.name, f.alias || f.name])
      );

      const preferred = ["NAME","DECADE","TOR_COUNT","INJURIES","DEATHS"]; // field NAMES (not aliases)
      fl.popupTemplate = {
        title: "{NAME}",   // title text stays bound to the NAME field value
        content: (evt) => {
          const a = evt.graphic?.attributes || {};
          return `<div style="min-width:220px">${buildTableHTML(a, preferred, aliasMap)}</div>`;
        }
      };
    });

    view.whenLayerView(fl).then(lv => { tesAttrsLV = lv; });
  });
}


  // Accept base FeatureServer URL and try /0 → /1 → /2 to find the real layer
  function setTESAttrsDecade(decade){
    let base = AGOL.TESSEL_ATTRS?.[decade];
    if(!base){ removeTesAttrs(); return; }

    if(/\/FeatureServer\/\d+$/i.test(base)){ _attachTesAttrs(base); return; }

    const cands = [
      base.replace(/\/FeatureServer\/?$/i,"/FeatureServer/0"),
      base.replace(/\/FeatureServer\/?$/i,"/FeatureServer/1"),
      base.replace(/\/FeatureServer\/?$/i,"/FeatureServer/2")
    ];
    require(["esri/layers/FeatureLayer"], (FeatureLayer)=>{
      const tryNext = (i)=>{
        if(i>=cands.length){ removeTesAttrs(); return; }
        const test = new FeatureLayer({ url: cands[i] });
        test.load().then(()=> _attachTesAttrs(cands[i])).catch(()=> tryNext(i+1));
      };
      tryNext(0);
    });
  }

  // One global click handler (no hover)
  let _clickBound = false;
  function bindTesClick(){
    if(_clickBound) return; _clickBound = true;
    view.popup.autoOpenEnabled = false; // manual on click

    view.on("click", async (evt) => {
      if (mode !== "TES") return;
      const fl = lyrById(tesAttrsId);
      if (!fl) { view.popup.close(); return; }

      try {
        const hit = await view.hitTest(evt, { include: [fl] });
        const g = hit?.results?.[0]?.graphic;
        if (g) {
          view.popup.open({
            location: evt.mapPoint,
            features: [g],
            updateLocationEnabled: true
          });
        } else {
          view.popup.close(); // click empty space closes
        }
      } catch (e) {
        console.warn("hitTest error:", e);
      }
    });
  }

  // -------------------------------------------------------------
  //  Mode hint card
  // -------------------------------------------------------------
  const MODE_TEXT = {
    KDE: `<strong>KDE (Kernel Density)</strong><br/>Smoothed “heat” surface showing where tornadoes concentrate within the chosen decade. Use A Decade (and optional Swipe) to compare.`,
    TES: `<strong>Tessellation</strong><br/>Aggregates tornado counts & casualties to grid cells for the chosen decade. <em>Click</em> a cell to see counts.`,
    PTS: `<strong>Points</strong><br/>Individual tornado reports for the chosen decade (symbolized by EF rating).`
  };

  function ensureHintDOM(){
    if(document.getElementById('modeHint')) return;
    ensureUIStyles();
    const div = document.createElement('div');
    div.id = 'modeHint';
    div.className = 'mode-hint';
    div.innerHTML = `
      <button class="mh-close" aria-label="Close">×</button>
      <div class="mh-body"></div>
    `;
    document.body.appendChild(div);
    div.querySelector('.mh-close').addEventListener('click', ()=> div.classList.remove('show'));
  }

  function showModeHint(which){
    ensureHintDOM();
    const el = document.getElementById('modeHint');
    el.querySelector('.mh-body').innerHTML = MODE_TEXT[which] || '';
    el.classList.add('show');
  }

  // -------------------------------------------------------------
  //  INIT
  // -------------------------------------------------------------
  async function init(){
    // wait for AMD loader
    await new Promise(r=>{ if(window.require) return r(); const t=setInterval(()=>{ if(window.require){clearInterval(t); r();}},20); });

    return new Promise((resolve,reject)=>{
      require(["esri/Map","esri/views/MapView"], (EsriMap, MapView)=>{
        try{
          map = new EsriMap({ basemap:"hybrid" });
          view = new MapView({
            container:"singleMap",
            map,
            center:[-96.9,37.6],
            zoom:4,
            constraints:{ snapToZoom:false }
          });

          view.when(()=>{
            // UI padding + zoom placement
            view.padding = { top: 64, bottom: 56, left: 12, right: 12 };
            try { view.ui.move("zoom", "bottom-right"); } catch {}

            ensureUIStyles();
            createSwipeLabels();   // hidden until swipe is active
            hideSwipeLabels();

            // Wire swipe check to keep B-select in sync
            $('chkSwipe')?.addEventListener('change', () => {
              syncBSelectWithSwipe();
              refreshSwipe();
            });
            // Make sure B starts disabled (since swipe is initially off)
            syncBSelectWithSwipe();

            // Click-to-popup for Tess
            bindTesClick();
            ensureHintDOM();

            mode = null;           // start blank
            resolve();
          });
        }catch(e){ reject(e); }
      });
    });
  }

  // -------------------------------------------------------------
  //  MODE + SETTERS
  // -------------------------------------------------------------
  function setMode(next){
    if(mode === next) { showModeHint(next); return; }

    // leaving TES → remove attribute click layer
    if(mode === "TES") removeTesAttrs();

    if(mode) hideModeLayers(); // clear A/B + swipe from previous mode
    mode = next;

    // Load A for the new mode (defaults to 1950s if select empty). B stays empty.
    const a = $('decadeA')?.value || "1950s";
    setDecadeA(a || "1950s");

    // entering TES → sync attribute layer to A decade
    if(mode === "TES") setTESAttrsDecade(a || "1950s");

    refreshSwipe();            // only works when B is set + swipe checked
    showModeHint(next);
  }

  function setDecadeA(decade){
    if(!decade) return;

    if(mode === "KDE"){
      setKDE("A", decade);
    } else if (mode === "TES") {
      setTES("A", decade);
      setTESAttrsDecade(decade); // keep click layer in sync
    } else if (mode === "PTS") {
      setPTS("A", decade);
    }
  }

  function setDecadeB(decade){
    const { B } = getIdsByMode();
    if(!decade){ removeIf(B); refreshSwipe(); return; } // clear B + swipe

    if(mode === "KDE") setKDE("B", decade);
    else if (mode === "TES") setTES("B", decade);
    else if (mode === "PTS") setPTS("B", decade);
  }

  function setOpacityForActive(v){
    if(mode === "KDE"){ kdeOpacity=v; ["kdeA","kdeB"].forEach(id=>{ const L=lyrById(id); if(L) L.opacity=v; }); }
    else if(mode === "TES"){ tesOpacity=v; ["tesA","tesB"].forEach(id=>{ const L=lyrById(id); if(L) L.opacity=v; }); }
    else if(mode === "PTS"){ ptsOpacity=v; ["ptsA","ptsB"].forEach(id=>{ const L=lyrById(id); if(L) L.opacity=v; }); }
  }

  // KDE (TileLayer)
  function setKDE(which, decade){
    const id = which==="A" ? "kdeA" : "kdeB";
    const url = AGOL.KDE_TILES[decade]; if(!url) return;
    require(["esri/layers/TileLayer"], (TileLayer)=>{
      removeIf(id);
      const layer = new TileLayer({ id, url, opacity: kdeOpacity });
      map.add(layer); refreshSwipe();
    });
  }

  // Tessellation (VectorTileLayer)
  function setTES(which, decade){
    const id = which==="A" ? "tesA" : "tesB";
    const url = AGOL.TESSEL_TILES[decade]; if(!url) return;
    require(["esri/layers/VectorTileLayer"], (VectorTileLayer)=>{
      removeIf(id);
      const vt = new VectorTileLayer({ id, url, opacity: tesOpacity });
      map.add(vt); refreshSwipe();
    });
  }

  // Points (VectorTileLayer or FeatureLayer)
  function setPTS(which, decade){
    const id = which==="A" ? "ptsA" : "ptsB";
    const url = AGOL.POINTS_TILES[decade]; if(!url) return;
    require(["esri/layers/VectorTileLayer","esri/layers/FeatureLayer"], (VectorTileLayer, FeatureLayer)=>{
      removeIf(id);
      const isFS = /\/FeatureServer/i.test(url);
      const L = isFS ? new FeatureLayer({ id, url, opacity: ptsOpacity })
                     : new VectorTileLayer({ id, url, opacity: ptsOpacity });
      map.add(L); refreshSwipe();
    });
  }

  // Centroids + Path
  function enableCentroids(on){
    if(on){
      require(["esri/layers/VectorTileLayer"], (VectorTileLayer)=>{
        if(!lyrById("centroids")){
          const vt = new VectorTileLayer({ id:"centroids", url:AGOL.CENTROIDS, opacity:1 });
          map.add(vt); topify("centroids");
        }
      });
    } else removeIf("centroids");
  }

  function enablePath(on){
    if(on){
      require(["esri/layers/FeatureLayer"], (FeatureLayer)=>{
        if(!lyrById("centroidPath")){
          const fl = new FeatureLayer({ id:"centroidPath", url:AGOL.CENTROID_PATH, opacity:1 });
          map.add(fl); topify("centroidPath");
        }
      });
    } else removeIf("centroidPath");
  }

  // -------------------------------------------------------------
  //  Clear to clean map page (stay on map; no Home nav)
  // -------------------------------------------------------------
  function clearToBasemap(){
    // Remove operational layers (keeps basemap)
    try { map?.removeAll(); } catch {}

    // Turn off swipe and disable B select
    const s = $('chkSwipe'); if (s) s.checked = false;
    killSwipe();
    syncBSelectWithSwipe();

    // Uncheck centroids/path toggles
    const c = $('chkCentroids'); if (c) c.checked = false;
    const p = $('chkCentroidPath'); if (p) p.checked = false;

    // Deselect tabs and hide mode controls (so UI looks blank)
    document.querySelectorAll('.mode-tabs .tab').forEach(b => b.classList.remove('active'));
    const kde = $('kdeControls'); if (kde) kde.style.display = 'none';
    const tes = $('tesControls'); if (tes) tes.style.display = 'none';
    const pts = $('ptsControls'); if (pts) pts.style.display = 'none';

    // Close UI chrome
    view?.popup?.close();
    $('modeHint')?.classList.remove('show');
    $('drawer')?.classList.remove('open');

    // Reset internal mode; remain on map page
    mode = null;
  }

  // -------------------------------------------------------------
  //  Public API
  // -------------------------------------------------------------
  window.EsriApp = {
    init,
    setMode,
    setDecadeA, setDecadeB,
    setOpacityForActive,
    refreshSwipe,
    enableCentroids, enablePath,
    setTESAttrsDecade,           // exported in case you need it elsewhere
    clearToBasemap               // ← wire your Clear button to this
  };
})();
