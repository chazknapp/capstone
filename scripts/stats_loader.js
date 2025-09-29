// scripts/stats_loader.js
window.App = window.App || {};
(function () {
  const pane = document.getElementById('statsPane');
  if (!pane) return;

  // (Optional) keys -> paragraph copy (kept in case you want unique text later)
  const DESCRIPTIONS = {
    counts_region:
      "Tornado counts have decreased in parts of the central/southern Great Plains while increasing across the Midwest and Southeast, indicating an eastward shift in activity.",
    ef_decade:
      "The EF-scale distribution shows relatively fewer weak events in the Plains relative to growing shares in the Southeast/Midwest, consistent with a spatial shift in risk.",
    casualties:
      "Casualties cluster on fewer, more active days in the Southeast and southern Midwest—reflecting higher exposure and more nocturnal/cool-season events.",
    seasonality:
      "Cool-season (fall/winter) activity has grown in the eastern U.S., while traditional spring peaks in the Plains have weakened, shifting overall seasonality eastward.",
    regression:
      "Regression diagnostics suggest large-scale environments—moisture/CAPE and low-level shear—are increasingly favorable east of the Plains in recent decades.",
    decade_summary:
      "Aggregated decade-level metrics summarizing counts, intensities, and seasonality illustrate the long-term transition away from the classic ‘Tornado Alley’.",
    regional_totals:
      "Regional totals by decade highlight declines through the central Plains and increases in Dixie Alley and parts of the Midwest.",
    regression_summary:
      "Model coefficients and fit statistics for the trend analysis; note the significant positive trends in the Southeast against negative/neutral trends in the Plains."
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

