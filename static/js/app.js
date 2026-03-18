// ── CLOCK ──────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function fpUpdateClock() {
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2,'0');
  const m = String(now.getUTCMinutes()).padStart(2,'0');
  const s = String(now.getUTCSeconds()).padStart(2,'0');
  document.getElementById('fp-time').textContent = `${h}:${m}:${s} UTC`;
  const d = String(now.getUTCDate()).padStart(2,'0');
  document.getElementById('fp-date').textContent =
    `${d}${MONTHS[now.getUTCMonth()]}${now.getUTCFullYear()}`;
}
fpUpdateClock();
setInterval(fpUpdateClock, 1000);

// ── TABS ───────────────────────────────────────────────
const TAB_NAMES = ['plan','route','fuel','wx','output'];

function fpShowTab(name) {
  TAB_NAMES.forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('fp-hidden', t !== name);
  });
  document.querySelectorAll('.fp-tab').forEach((btn, i) => {
    btn.classList.toggle('active', TAB_NAMES[i] === name);
  });
  if (name === 'output') fpGenerate();
}

// ── WAYPOINTS ─────────────────────────────────────────
let waypoints = [];
let wptIdCounter = 1;

function fpAddWaypoint(fix='', airway='', alt='', ete='', fuel='', notes='') {
  const id = wptIdCounter++;
  waypoints.push({ id, fix, airway, alt, ete, fuel, notes });
  fpRenderWaypoints();
}

function fpRemoveWaypoint(id) {
  waypoints = waypoints.filter(w => w.id !== id);
  fpRenderWaypoints();
}

function fpUpdateWpt(id, field, value) {
  const wpt = waypoints.find(w => w.id === id);
  if (wpt) wpt[field] = value;
}

function fpRenderWaypoints() {
  const container = document.getElementById('fp-waypoints');
  if (waypoints.length === 0) {
    container.innerHTML = '<div style="font-family:var(--fp-mono);font-size:11px;color:var(--fp-muted);padding:14px 0;text-align:center;">No waypoints — click Add Waypoint to begin.</div>';
    return;
  }
  container.innerHTML = waypoints.map((w, idx) => `
    <div class="fp-route-row">
      <span class="fp-wpt-num">${String(idx + 1).padStart(2,'0')}</span>
      <input class="fp-input" style="padding:5px 7px;font-size:12px" value="${escHtml(w.fix)}"
        placeholder="FIX" maxlength="8"
        oninput="fpUpdateWpt(${w.id},'fix',this.value)">
      <input class="fp-input" style="padding:5px 7px;font-size:12px" value="${escHtml(w.airway)}"
        placeholder="J146 / DCT"
        oninput="fpUpdateWpt(${w.id},'airway',this.value)">
      <input class="fp-input" style="padding:5px 7px;font-size:12px;text-align:right" value="${escHtml(w.alt)}"
        placeholder="35000" type="number"
        oninput="fpUpdateWpt(${w.id},'alt',this.value)">
      <input class="fp-input" style="padding:5px 7px;font-size:12px" value="${escHtml(w.ete)}"
        placeholder="00:45"
        oninput="fpUpdateWpt(${w.id},'ete',this.value)">
      <input class="fp-input" style="padding:5px 7px;font-size:12px;text-align:right" value="${escHtml(w.fuel)}"
        placeholder="12.5" type="number" step="0.1"
        oninput="fpUpdateWpt(${w.id},'fuel',this.value)">
      <input class="fp-input" style="padding:5px 7px;font-size:12px;text-transform:none" value="${escHtml(w.notes)}"
        placeholder="Optional notes"
        oninput="fpUpdateWpt(${w.id},'notes',this.value)">
      <button class="fp-btn-icon" onclick="fpRemoveWaypoint(${w.id})" title="Remove waypoint">✕</button>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Seed sample waypoints
fpAddWaypoint('ROKNE', 'ROKNE3', '35000', '00:12', '14', '');
fpAddWaypoint('HIRAC', 'DCT',    '35000', '00:28', '33', '');
fpAddWaypoint('ELMOO', 'J54',    '35000', '00:52', '62', '');

// ── FUEL CALC ──────────────────────────────────────────
function fpCalcFuel() {
  const fob = parseFloat(document.getElementById('fp-fob').value);
  const ff  = parseFloat(document.getElementById('fp-ff').value);
  const res = parseFloat(document.getElementById('fp-res').value) || 45;
  const ete = document.getElementById('fp-ete').value;

  if (!fob || !ff || !ete) return;
  const parts = ete.split(':');
  const eteMins = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  if (!eteMins) return;

  const tripFuel = (eteMins / 60) * ff;
  const resFuel  = (res / 60) * ff;
  const extra    = fob - tripFuel - resFuel;
  const endurance = fob / ff;

  document.getElementById('fp-trip-fuel').textContent = tripFuel.toFixed(1) + ' gal';
  document.getElementById('fp-res-fuel').textContent  = resFuel.toFixed(1)  + ' gal';

  const efEl = document.getElementById('fp-extra-fuel');
  efEl.textContent  = extra.toFixed(1) + ' gal';
  efEl.style.color  = extra >= 0 ? 'var(--fp-green)' : 'var(--fp-red)';

  const eh = Math.floor(endurance);
  const em = Math.round((endurance - eh) * 60);
  document.getElementById('fp-endurance').textContent = `${eh}h ${String(em).padStart(2,'0')}m`;

  const bar = document.getElementById('fp-fuel-bar');
  const pct = Math.min(100, Math.round((fob / (tripFuel + resFuel)) * 100));
  bar.style.width      = Math.min(100, Math.round((fob / Math.max(fob, tripFuel + resFuel)) * 100)) + '%';
  bar.style.background = extra >= 0 ? 'var(--fp-green)' : 'var(--fp-red)';

  const statusEl = document.getElementById('fp-fuel-status');
  statusEl.style.color = extra >= 0 ? 'var(--fp-green)' : 'var(--fp-red)';
  statusEl.textContent = extra >= 0
    ? `FUEL ADEQUATE — ${extra.toFixed(1)} gal extra after reserve`
    : `WARNING: INSUFFICIENT FUEL — SHORT BY ${Math.abs(extra).toFixed(1)} gal`;

  document.getElementById('fp-fuel-summary').style.display = 'block';
  fpCalcWeight();
}

// ── WEIGHT CALC ────────────────────────────────────────
function fpCalcWeight() {
  const bew = parseFloat(document.getElementById('fp-bew').value);
  const pax = parseFloat(document.getElementById('fp-pax-wt').value);
  const bag = parseFloat(document.getElementById('fp-bag-wt').value) || 0;
  const fob = parseFloat(document.getElementById('fp-fob').value) || 0;

  if (!bew || !pax) return;

  const fuelWt = fob * 6;
  const ramp   = bew + pax + bag + fuelWt;

  document.getElementById('fp-ramp-wt').textContent = ramp.toLocaleString() + ' lbs';
  document.getElementById('fp-fuel-wt').textContent = fuelWt.toLocaleString() + ' lbs';

  const mtowEl = document.getElementById('fp-mtow-status');
  if (ramp < 2550) {
    mtowEl.textContent  = '✓ Within Limits';
    mtowEl.style.color  = 'var(--fp-green)';
  } else if (ramp < 3000) {
    mtowEl.textContent  = '⚠ Verify MTOW';
    mtowEl.style.color  = 'var(--fp-accent2)';
  } else {
    mtowEl.textContent  = '✗ Likely Over MTOW';
    mtowEl.style.color  = 'var(--fp-red)';
  }
  document.getElementById('fp-weight-summary').style.display = 'block';
}

// ── GENERATE PLAN ─────────────────────────────────────
function fpGenerate() {
  const g = id => (document.getElementById(id)?.value || '').trim();

  const dep      = (g('fp-dep')      || '????').toUpperCase();
  const dest     = (g('fp-dest')     || '????').toUpperCase();
  const altn     = (g('fp-altn')     || '').toUpperCase();
  const callsign = (g('fp-callsign') || 'UNKNOWN').toUpperCase();
  const actype   = (g('fp-actype')   || '????').toUpperCase();
  const wake     = document.getElementById('fp-wake').value;
  const rules    = document.getElementById('fp-rules').value;
  const fltype   = document.getElementById('fp-fltype').value;
  const equip    = (g('fp-equip')    || 'S').toUpperCase();
  const etdRaw   = g('fp-etd').replace(':','') || '0000';
  const eteRaw   = g('fp-ete').replace(':','') || '0000';
  const alt      = (g('fp-alt')      || '????').toUpperCase();
  const tas      = g('fp-tas') || '0';
  const route    = (g('fp-route')    || 'DCT').toUpperCase();
  const sid      = (g('fp-sid')      || '').toUpperCase();
  const star     = (g('fp-star')     || '').toUpperCase();
  const pic      = g('fp-pic')       || 'NOT PROVIDED';
  const souls    = g('fp-souls')     || '1';
  const remarks  = g('fp-remarks');
  const fob      = parseFloat(g('fp-fob')) || 0;
  const ff       = parseFloat(g('fp-ff')) || 0;

  // Endurance string
  let enduranceStr = '0000';
  if (fob && ff) {
    const e = fob / ff;
    const eh = String(Math.floor(e)).padStart(2,'0');
    const em = String(Math.round((e - Math.floor(e)) * 60)).padStart(2,'0');
    enduranceStr = eh + em;
  }

  const now = new Date();
  const dd  = String(now.getUTCDate()).padStart(2,'0');
  const mon = MONTHS[now.getUTCMonth()];
  const yr  = now.getUTCFullYear();
  const yy  = String(yr).slice(2);

  // Update summary strip
  document.getElementById('out-dep').textContent  = dep;
  document.getElementById('out-dest').textContent = dest;
  document.getElementById('out-ete').textContent  = eteRaw.slice(0,2)+':'+eteRaw.slice(2);
  document.getElementById('out-etd').textContent  = etdRaw.slice(0,2)+':'+etdRaw.slice(2)+'Z';
  document.getElementById('out-alt').textContent  = alt;

  // ICAO FPL block
  const icaoFpl =
`(FPL
-${callsign}/${wake}
-${fltype}${rules}
-${actype}/${wake}-${equip}
-${dep}${etdRaw}
-N${String(parseInt(tas)||0).padStart(4,'0')}${alt} ${route}
-${dest}${eteRaw} ${altn}
-PBN/B1 DOF/${dd}${mon.slice(0,3)}${yy} REG/${callsign} EET/${dep}0000
 SEL/ABCD RVR/75 OPR/${pic.toUpperCase()} SOULS/${souls}
 E/${enduranceStr}${remarks ? ' RMK/'+remarks.toUpperCase() : ''})`;

  // FAA 7233-1 block
  const faaForm =
`
${'─'.repeat(56)}
  FAA FLIGHT PLAN — FORM 7233-1
${'─'.repeat(56)}
  AIRCRAFT ID         : ${callsign}
  AIRCRAFT TYPE       : ${actype}/${wake}
  FLIGHT RULES        : ${rules}
  TYPE OF FLIGHT      : ${fltype}
  SPECIAL EQUIPMENT   : ${equip}
  DEPARTURE           : ${dep}   ${etdRaw.slice(0,2)}:${etdRaw.slice(2)} Z
  DESTINATION         : ${dest}
  ALTERNATE           : ${altn || 'NONE'}
  CRUISE ALTITUDE     : ${alt}
  TRUE AIRSPEED       : ${tas} KT
  SID                 : ${sid || 'NONE'}
  STAR                : ${star || 'NONE'}
  ROUTE OF FLIGHT     : ${route}
  EST EN ROUTE TIME   : ${eteRaw.slice(0,2)}H ${eteRaw.slice(2)}M
  FUEL ENDURANCE      : ${enduranceStr.slice(0,2)}H ${enduranceStr.slice(2)}M
  SOULS ON BOARD      : ${souls}
  PILOT IN COMMAND    : ${pic.toUpperCase()}
  DATE                : ${dd} ${mon} ${yr}${remarks ? '\n  REMARKS             : '+remarks.toUpperCase() : ''}
${'─'.repeat(56)}`;

  // Waypoint log
  let wptStr = '';
  if (waypoints.length > 0) {
    wptStr = '\n\n  WAYPOINT LOG:\n  ' + '─'.repeat(54) + '\n';
    wptStr += '  #   FIX      AIRWAY    ALT        ETE    FUEL\n';
    wptStr += '  ' + '─'.repeat(54) + '\n';
    waypoints.forEach((w, i) => {
      const num    = String(i + 1).padStart(2,'0');
      const fix    = (w.fix    || '—').toUpperCase().padEnd(8);
      const airway = (w.airway || 'DCT').toUpperCase().padEnd(9);
      const wAlt   = String(w.alt   || '—').padEnd(10);
      const wEte   = String(w.ete   || '—').padEnd(6);
      const wFuel  = w.fuel ? w.fuel + ' gal' : '—';
      const notes  = w.notes ? `  (${w.notes})` : '';
      wptStr += `  ${num}. ${fix} ${airway} ${wAlt} ${wEte} ${wFuel}${notes}\n`;
    });
  }

  document.getElementById('fp-plan-output').textContent =
    icaoFpl + '\n' + faaForm + wptStr;
}

// ── COPY TO CLIPBOARD ─────────────────────────────────
function fpCopyPlan() {
  const text = document.getElementById('fp-plan-output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btns = document.querySelectorAll('.fp-btn-secondary');
    btns.forEach(btn => {
      if (btn.textContent.includes('Copy')) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = 'var(--fp-green)';
        btn.style.borderColor = 'var(--fp-green)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 1800);
      }
    });
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ── SEED TODAY'S DATE ─────────────────────────────────
(function seedDate() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2,'0');
  const dd    = String(today.getDate()).padStart(2,'0');
  const depDateEl = document.getElementById('fp-depdate');
  if (depDateEl) depDateEl.value = `${yyyy}-${mm}-${dd}`;
})();

// ── INITIAL RENDER ────────────────────────────────────
fpRenderWaypoints();
