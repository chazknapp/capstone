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
      ' In the early record the Plains led the nation, but since the 1990s activity has shifted',
      ' east. The dashed lines show the long-term regression trend for each region.',
      '</p>',
      '<ul class="bullets">',
      '<li><strong>+36.7 per decade — Southeast</strong> — the sharpest rise, driven by more cool-season and nocturnal events.</li>',
      '<li><strong>+22.3 per decade — Midwest</strong> — a steady climb, especially across the Ohio Valley and lower Great Lakes.</li>',
      '<li><strong>+7.4 per decade — Plains</strong> — nearly flat compared to the east; the historical dominance has leveled off.</li>',
      '</ul>',
      '<p class="takeaway"><em>Overall: counts now rival or exceed the Plains in the Southeast, confirming a broader, east-shifting corridor of risk — the classic “Tornado Alley” is stretching toward the Mississippi Valley.</em></p>',
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
    
    decade_summary:
      "This table summarizes how tornado patterns have evolved across the Plains, Midwest, and Southeast since the 1950s. Tornado counts rose sharply through the late 20th century, peaking in the 2000s with more than 12,000 events, before leveling off in recent decades. At the same time, the percentage of strong tornadoes (EF3 or higher) has dropped from about 45% in the 1950s to near 12% today, showing a long-term decline in intensity. Casualties were highest in the 1960s and 1970s during major outbreak years but have generally decreased thanks to improved forecasting and warning systems. Track lengths and path areas were greater in earlier decades, while modern storms tend to be shorter but occasionally wider and more erratic. Overall, the data reveals a clear shift toward more frequent but weaker tornadoes, with continued high impacts as activity migrates east into more densely populated regions.",
    regional_totals:
      "The regional totals underscore the eastward redistribution of tornado activity and impacts. The Plains, long considered the core of Tornado Alley, recorded the highest number of tornadoes overall (26,609), but with a lower share of strong events (18.9%) and fewer total casualties (21,291) compared to other regions. The Midwest experienced fewer tornadoes (18,531) but nearly one in four reached strong intensity (23.7%), contributing to almost 30,000 casualties. The Southeast, however, stands out as the most human-impacted region: although its total tornado count (22,274) is lower than the Plains, it shares the same high percentage of strong tornadoes (23.7%) and far exceeds all regions in casualties—over 43,000 in total, including 2,817 deaths and more than 41,000 injuries. These numbers make clear that while the Plains remain tornado-rich, the Southeast’s dense population, frequent outbreaks, and year-round exposure now make it the most dangerous region for human impacts.",
    regression_summary:
      "The regression summary captures three defining tornado trends across the Plains, Midwest, and Southeast from the 1950s through the 2020s. In the Plains, tornado frequency shows minimal growth (+7 per decade, R²=0.03) but a notable seasonal shift toward more cool-season storms (+0.17 points per decade, R²=0.58) and a steady decline in strong tornadoes (–0.42 points, R²=0.84). The Midwest exhibits moderate growth in frequency (+22 per decade, R²=0.54) and a slight cool-season increase (+0.10 points, R²=0.19), paired with the steepest drop in strong tornado share (–0.67 points, R²=0.94). The Southeast displays the strongest rise in frequency (+37 per decade, R²=0.64) but little change in seasonality (+0.03 points, R²=0.04), while also showing a consistent decline in strong tornadoes (–0.58 points, R²=0.89). Taken together, these results confirm that tornado activity is not only shifting eastward but also evolving in character—cool-season storms are becoming more common in the Plains, intensity is declining in the Midwest, and the Southeast is emerging as the most active and persistent risk zone."
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







