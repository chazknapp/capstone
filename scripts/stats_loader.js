// scripts/stats_loader.js
window.App = window.App || {};
(function () {
  const pane = document.getElementById('statsPane');
  if (!pane) return;

  // (Optional) keys -> paragraph copy (kept in case you want unique text later)
  const DESCRIPTIONS = {
      counts_region: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">Counts by Decade &amp; Region</h3>',
      '<p>',
      'This chart shows how tornado totals change by decade in the Midwest, Plains, and Southeast.',
      ' In the early record the Plains led the nation, but since the 2010s activity has shifted',
      ' east.', 
      '</p>', 
      '<p class="takeaway"><em>The dashed lines show the long-term regression trend for each region.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>Southeast: +36.7 per decade</strong> - the sharpest rise, driven by more cool-season and nocturnal events.</li>',
      '<li><strong>Midwest: +22.3 per decade</strong> - a steady climb, especially across the Ohio Valley and lower Great Lakes.</li>',
      '<li><strong>Plains: +7.4 per decade</strong> - nearly flat compared to the east; the historical dominance has leveled off.</li>',
      '</ul>',
      '<strong>Overall: counts now rival or exceed the Plains in the Southeast, confirming a broader, east-shifting corridor of risk.</strong>', 
      '</p>',  
      '<p class="takeaway"><em>The classic “Tornado Alley” is stretching toward the Mississippi Valley.</em></p>',
      '</div>'
    ].join(''),

      ef_decade: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">% Strong Tornadoes (EF ≥ 3) by Decade</h3>',
      '<p>',
      'This chart shows how the share of <strong>strong tornadoes</strong> — rated EF3 or higher — has changed since the 1950s.',
      ' Even though overall tornado counts have increased, especially in the Southeast and Midwest, the <em>percentage</em> of strong tornadoes has dropped steadily everywhere.',
      ' The dashed regression lines summarize the decline per decade, labeled as <strong>“pp/dec”</strong> meaning <em>percentage points per decade</em>.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>–0.67 pp/dec — Midwest</strong> — the steepest decline, showing that strong tornadoes now make up far less of the total compared to mid-century.</li>',
      '<li><strong>–0.58 pp/dec — Southeast</strong> — a similar decrease, despite higher total tornado counts in recent decades.</li>',
      '<li><strong>–0.42 pp/dec — Plains</strong> — a consistent downward slope, showing fewer strong storms relative to the region’s historical peak years.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: the percentage of very strong tornadoes has declined across all regions.',
      ' This doesn’t mean storms are safer — it reflects better detection of smaller tornadoes and subtle environmental changes that favor more frequent but generally weaker events.</em></p>',
      '</div>'
    ].join(''),

      casualties: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">Tornado Casualties (Deaths + Injuries) by Decade</h3>',
      '<p>',
      'This chart stacks <strong>injuries</strong> and <strong>deaths</strong> to show total casualties by decade for each region.',
      ' Values are totals (injuries + deaths), not rates. Bars are grouped by region so you can compare their trajectories through time.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>Midwest:</strong> a very high peak in the <strong>1960s</strong>, followed by a large drop and relatively low, stable decades from the 1980s onward.</li>',
      '<li><strong>Plains:</strong> higher totals in the <strong>1950s–1970s</strong>, then a steady decline, consistent with better warnings and fewer large-casualty outbreaks.</li>',
      '<li><strong>Southeast:</strong> persistently elevated totals into the <strong>2000s–2010s</strong>, reflecting greater exposure and vulnerability even as other regions trend lower.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: casualty totals have generally fallen in the Midwest and Plains after mid-century peaks, while the Southeast remains comparatively high in recent decades.',
      ' This speaks to human impact and exposure; it does not by itself measure tornado severity.</em></p>',
      '</div>'
    ].join(''),
    
      decade_summary: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">Decade Summary (Plains + Midwest + Southeast)</h3>',
      '<p>',
      'This table condenses nearly 75 years of tornado records, combining all three major regions to show long-term changes in activity, strength, and human impact.',
      ' Each row represents one decade of combined totals and averages, highlighting the major trends shaping modern Tornado Alley.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>Rising counts:</strong> total tornado reports increased from <strong>4,600</strong> in the 1950s to over <strong>12,000</strong> in the 2000s, largely due to better detection and reporting coverage.</li>',
      '<li><strong>Weaker intensity:</strong> the share of strong (EF≥3) tornadoes dropped from about <strong>45%</strong> in the 1950s to just <strong>12%</strong> by the 2020s, a clear long-term decline in relative strength.</li>',
      '<li><strong>Casualty shift:</strong> combined deaths and injuries peaked in the <strong>1960s–1970s</strong> (17,000–19,000 total) and have fallen sharply since, reflecting better warning systems and building standards.</li>',
      '<li><strong>Track length:</strong> storms in earlier decades were generally longer-lived — averaging <strong>10–12 miles</strong> — compared to 2–4 miles in most recent decades.</li>',
      '<li><strong>Path area:</strong> average track footprints have become smaller overall, but with occasional large outliers (e.g., 2011 Joplin, 2013 Moore), causing modern “short but wide” signatures.</li>',
      '<li><strong>Recent moderation:</strong> the 2010s and 2020s show fewer total tornadoes than the 2000s but still significant impacts — a balance of more frequent minor events and fewer catastrophic outbreaks.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: tornadoes have become more common in the record but generally weaker and less deadly.',
      ' The data reflects improved detection, changing environments, and population growth near impact zones — painting a story of evolving risk rather than simple decline.</em></p>',
      '</div>'
    ].join(''),


      regional_totals: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">Regional Totals (1950–2020s)</h3>',
      '<p>',
      'This table compares tornado totals, strength, and casualties across the Plains, Midwest, and Southeast from 1950 through the 2020s.',
      ' It highlights how storm frequency, intensity, and human impact vary sharply by region — revealing where the most people are affected and where risk has evolved most.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>Plains:</strong> the most tornado-rich region overall with <strong>26,609 total events</strong>, but only <strong>18.9% strong (EF≥3)</strong>. Casualties are relatively lower (<strong>≈21,000 total</strong>), reflecting vast open terrain and long-standing warning infrastructure.</li>',
      '<li><strong>Midwest:</strong> fewer total tornadoes (<strong>18,531</strong>) but a much higher proportion of strong ones (<strong>23.7%</strong>), producing nearly <strong>30,000 casualties</strong>. The Midwest’s dense population and frequent urban proximity elevate the per-storm risk.</li>',
      '<li><strong>Southeast:</strong> stands out as the most human-impacted region with <strong>43,934 casualties</strong> — over twice the Plains total — including <strong>2,817 deaths</strong> and <strong>41,000+ injuries</strong>. Despite fewer tornadoes (<strong>22,274</strong>), it matches the Midwest in intensity share (<strong>23.7%</strong>) and experiences more fatal outcomes due to population density, tree cover, and nocturnal outbreaks.</li>',
      '<li><strong>Intensity balance:</strong> while the Plains still dominate in raw tornado numbers, both the Midwest and Southeast show stronger storms relative to total counts, suggesting more severe local impacts per event.</li>',
      '<li><strong>Human exposure:</strong> the Southeast’s high casualty burden demonstrates how geography and demography, rather than storm count alone, now define the most dangerous tornado region in the U.S.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: these totals show a clear transition — Tornado Alley’s traditional heart in the Plains remains active,',
      ' but the Southeast has become the nation’s most hazardous corridor for human impacts, blending strong storms with vulnerable landscapes and year-round risk.</em></p>',
      '</div>'
    ].join(''),

      regression_summary: [
      '<div class="stat-desc">',
      '<h3 class="desc-title">Regression Summary of Tornado Trends (1950–2020s)</h3>',
      '<p>',
      'This table summarizes long-term statistical trends in tornado behavior for the Plains, Midwest, and Southeast using regression slopes calculated per decade.',
      ' Each slope represents the rate of change in frequency, strength, or seasonal timing over roughly seven decades of record.',
      ' Values labeled as <strong>(%pt/dec)</strong> mean <em>percentage points per decade</em> — showing how much a share (like the percentage of strong or cool-season tornadoes) changes each decade.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>Plains:</strong> shows minimal change in total frequency (<strong>+7.4 per decade</strong>, R²=0.03), but a moderate increase in <strong>cool-season storms</strong> (+0.17 %pt/dec, R²=0.58) and a steady decline in <strong>strong tornadoes</strong> (–0.42 %pt/dec, R²=0.84).</li>',
      '<li><strong>Midwest:</strong> moderate growth in overall frequency (<strong>+22.3 per decade</strong>, R²=0.54) and a slight uptick in cool-season share (+0.10 %pt/dec, R²=0.19), coupled with the <strong>steepest drop in strong-tornado proportion</strong> (–0.67 %pt/dec, R²=0.94).</li>',
      '<li><strong>Southeast:</strong> the most pronounced increase in frequency (<strong>+36.7 per decade</strong>, R²=0.64), nearly flat seasonality change (+0.03 %pt/dec, R²=0.04), and a consistent decrease in strong tornado share (–0.58 %pt/dec, R²=0.89).</li>',
      '<li><strong>Correlation strength (R²):</strong> higher R² values indicate a more reliable trend — especially for the decline in strong tornadoes, which exceeds 0.8 in every region, showing a robust long-term signal.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: regression trends show that tornado activity is not just moving eastward - it is <strong>changing in character</strong>.',
      ' The Plains see more off-season storms, the Midwest’s tornadoes are weakening but still frequent, and the Southeast is emerging as the most consistently active and hazardous region.</em></p>',
      '</div>'
    ].join(''),
  };

  const cards = Array.from(pane.querySelectorAll('.card'));
  const items = cards.map(c => ({
    type: c.dataset.type,         // "graph" | "table"
    src: c.dataset.src,           // image or table html
    key: c.dataset.key || '',     // optional key for DESCRIPTIONS
    caption: c.dataset.caption || ''
  }));

  // Build structured thumbnails with captions (single row of 8)
  items.forEach((it, i) => {
    const card = cards[i];
    const isTable = it.type === 'table';
    card.classList.toggle('table', isTable);
    card.innerHTML = '';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (!isTable) thumb.style.backgroundImage = `url("${it.src}")`;
    else thumb.textContent = 'Table';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = it.caption || (isTable ? 'Table' : 'Graph');

    card.appendChild(thumb);
    card.appendChild(label);
  });

  // Click any card -> open lightbox
  pane.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const idx = cards.indexOf(card);
    if (idx >= 0) openLightbox(idx);
  });

  function openLightbox(startIndex) {
    // Close drawer behind the lightbox
    App.Drawer?.close?.();

    const wrap = document.createElement('div');
    wrap.className = 'lb-wrap';
    wrap.innerHTML = `
      <div class="lb-body">
        <div class="lb-header">
          <button class="lb-back" title="Back">← Back</button>
          <button class="lb-close" title="Close">✕</button>
        </div>
        <div class="lb-content"></div>
        <div class="lb-strip"></div>
      </div>`;
    document.body.appendChild(wrap);

    const content = wrap.querySelector('.lb-content');
    const strip = wrap.querySelector('.lb-strip');

    function render(i) {
      const it = items[i];
      const placeholder =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pulvinar, quam vitae vulputate suscipit, nulla justo lacinia lorem, vitae consequat eros enim nec erat. Mauris finibus volutpat nulla nec dictum. Sed id metus id felis cursus ultricies non vitae erat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras mattis mi eget dui fringilla, non fermentum arcu lacinia. Vivamus at urna purus. Pellentesque dictum dignissim eros, vel tristique lorem ultrices vitae. Vestibulum euismod risus ac ligula imperdiet, nec sollicitudin mauris commodo. Donec ut turpis eu diam dictum malesuada a ut arcu.";

      content.innerHTML = `
        <div class="lb-caption">${it.caption || ''}</div>
        <div class="lb-content">
          <div class="lb-media"></div>
          <div class="lb-descbox">${DESCRIPTIONS[it.key] || placeholder}</div>
        </div>
      `;

      const mediaBox = content.querySelector('.lb-media');
      if (it.type === 'graph') {
        const img = new Image();
        img.src = it.src;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        mediaBox.appendChild(img);
      } else {
        const iframe = document.createElement('iframe');
        iframe.src = it.src;
        iframe.style.width = '100%';
        iframe.style.height = '70vh';
        iframe.style.border = '1px solid #e5e7eb';
        mediaBox.appendChild(iframe);
      }

      // Build filmstrip thumbnails (not the main gallery)
      strip.innerHTML = '';
      items.forEach((s, j) => {
        const t = document.createElement('div');
        t.className = 'lb-thumb' + (j === i ? ' active' : '');
        if (s.type === 'graph') {
          t.style.backgroundImage = `url("${s.src}")`;
        } else {
          t.textContent = 'Table';
        }
        t.title = s.caption || '';
        t.addEventListener('click', () => render(j));
        strip.appendChild(t);
      });
    }

    wrap.querySelector('.lb-back').onclick = () => {
      document.body.removeChild(wrap);
      App.Drawer?.open?.('statsPane'); // bring drawer back
    };
    wrap.querySelector('.lb-close').onclick = () => {
      document.body.removeChild(wrap);
    };

    render(startIndex);
  }
})();











