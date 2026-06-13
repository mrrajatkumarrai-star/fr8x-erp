import { getCollection } from "./db.js";

// Currency symbols map
export function fmtAmt(n, cur = 'INR') {
  const sym = cur === 'USD' ? '$' : cur === 'EUR' ? '€' : '₹';
  return sym + (Math.round(n || 0)).toLocaleString('en-IN');
}

export function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

// Global Toast Notifications
export function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    background: var(--bg-card);
    border-left: 4px solid var(--primary);
    box-shadow: var(--shadow-lg);
    padding: 12px 18px;
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    max-width: 380px;
    pointer-events: auto;
    transition: var(--transition);
    border: 1px solid var(--border);
    border-left-width: 4px;
  `;

  let icon = 'ti-info-circle';
  let borderCol = 'var(--primary)';
  if (type === 'success') { icon = 'ti-circle-check'; borderCol = 'var(--success)'; }
  else if (type === 'error') { icon = 'ti-alert-circle'; borderCol = 'var(--danger)'; }
  else if (type === 'warning') { icon = 'ti-alert-triangle'; borderCol = 'var(--warning)'; }

  toast.style.borderLeftColor = borderCol;

  toast.innerHTML = `
    <i class="ti ${icon}" style="font-size:18px; color:${borderCol}; flex-shrink:0;"></i>
    <div style="flex:1; line-height:1.4">${msg}</div>
    <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:2px; display:inline-flex;" id="toast-close-btn">
      <i class="ti ti-x" style="font-size:14px;"></i>
    </button>
  `;

  const closeBtn = toast.querySelector("#toast-close-btn");
  if (closeBtn) {
    closeBtn.onclick = () => toast.remove();
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
  }, 3000);
}

// Global Confirmation Modal
export function showConfirm(msg, onConfirm) {
  const mc = document.getElementById('modal-container');
  if (!mc) return;

  mc.innerHTML = `<div class="modal-bg" style="z-index: 1100;" id="confirm-modal-bg">
    <div class="modal" style="width: 360px; text-align: center; padding: 24px;">
      <div style="margin-bottom: 16px;">
        <div style="width: 52px; height: 52px; background: var(--danger-light); color: var(--danger); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px;">
          <i class="ti ti-alert-triangle"></i>
        </div>
      </div>
      <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Are you sure?</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height:1.5;">${msg}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="btn" id="confirm-cancel-btn">Cancel</button>
        <button class="btn danger" id="confirm-yes-btn">Confirm</button>
      </div>
    </div>
  </div>`;

  document.getElementById('confirm-cancel-btn').onclick = () => {
    mc.innerHTML = '';
  };

  document.getElementById('confirm-yes-btn').onclick = () => {
    mc.innerHTML = '';
    onConfirm();
  };
}

// Report print/preview modal
export function showReportPreview(title, content) {
  const mc = document.getElementById('modal-container');
  if (!mc) return;

  mc.innerHTML = `<div class="modal-bg" id="report-preview-modal">
    <div class="modal" style="width: 620px; max-height: 85vh;">
      <div class="modal-title">${title}<button class="btn sm" id="report-close-btn"><i class="ti ti-x"></i></button></div>
      <div style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); overflow-x: auto; max-height: 50vh; margin-bottom: 16px;">
        <pre style="font-family: monospace; font-size: 12px; color: var(--text-main); margin: 0; line-height: 1.5; white-space: pre-wrap;">${content}</pre>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="btn" id="report-cancel-btn">Close</button>
        <button class="btn pr" id="report-print-btn"><i class="ti ti-printer"></i> Print</button>
      </div>
    </div>
  </div>`;

  const close = () => { mc.innerHTML = ''; };
  document.getElementById('report-close-btn').onclick = close;
  document.getElementById('report-cancel-btn').onclick = close;
  document.getElementById('report-print-btn').onclick = () => {
    window.print();
  };
}

// Searchable selects Autocomplete Dropdowns helper
export function makeSearchableSelect(selectEl) {
  if (!selectEl || selectEl.dataset.searchable) return;
  selectEl.dataset.searchable = "true";
  selectEl.style.display = "none";

  const container = document.createElement('div');
  container.className = 'searchable-select-container';

  const searchInput = document.createElement('input');
  searchInput.className = 'search-select-input';
  searchInput.placeholder = selectEl.options[0]?.text || 'Select option...';
  searchInput.style.cssText = 'width:100%; padding:8px 12px; font-size:13px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-card); color:var(--text-main); outline:none;';

  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  if (selectedOpt && selectedOpt.value !== "") {
    searchInput.value = selectedOpt.text;
  }

  const dropdown = document.createElement('div');
  dropdown.className = 'searchable-select-dropdown';

  function updateList(q = '') {
    dropdown.innerHTML = '';
    const opts = [...selectEl.options];
    let count = 0;
    opts.forEach((opt, idx) => {
      if (opt.value === "" && idx === 0) return;
      if (q && !opt.text.toLowerCase().includes(q.toLowerCase())) return;

      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 12px; font-size:13px; cursor:pointer; color:var(--text-main); transition:background 0.1s;';
      item.innerHTML = opt.text;
      item.onmouseenter = () => { item.style.background = 'var(--bg-hover)'; };
      item.onmouseleave = () => { item.style.background = 'none'; };
      item.onclick = () => {
        selectEl.selectedIndex = idx;
        searchInput.value = opt.text;
        dropdown.style.display = 'none';
        selectEl.dispatchEvent(new Event('change'));
      };
      dropdown.appendChild(item);
      count++;
    });
    if (count === 0) {
      dropdown.innerHTML = '<div style="padding:8px 12px; font-size:12px; color:var(--text-muted);">No results match</div>';
    }
  }

  searchInput.onfocus = () => {
    updateList(searchInput.value);
    dropdown.style.display = 'block';
  };

  searchInput.oninput = () => {
    updateList(searchInput.value);
  };

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
      const selected = selectEl.options[selectEl.selectedIndex];
      searchInput.value = (selected && selected.value !== "") ? selected.text : '';
    }
  });

  container.appendChild(searchInput);
  container.appendChild(dropdown);
  selectEl.parentNode.insertBefore(container, selectEl);
}

// Status Badges CSS map
export function statusBadge(s) {
  const map = {
    'Booking Created': 'b-purple', 'Booking Confirmed': 'b-blue', 'CRO Received': 'b-blue',
    'Empty Released': 'b-amber', 'Container Picked': 'b-amber', 'Stuffing Done': 'b-amber',
    'Gate In': 'b-amber', 'Vessel Sailed': 'b-blue', 'In Transit': 'b-blue', 'Transshipment': 'b-amber',
    'Arrival POD': 'b-green', 'Customs Clearance': 'b-amber', 'DO Released': 'b-green',
    'Delivered': 'b-green', 'Container Returned': 'b-green', 'Closed': 'b-gray',
    'Active': 'b-green', 'Inactive': 'b-gray', 'On Hold': 'b-red',
    'Paid': 'b-green', 'Unpaid': 'b-amber', 'Overdue': 'b-red', 'Draft': 'b-gray',
    'Open': 'b-blue', 'In Progress': 'b-amber', 'Done': 'b-green', 'Cancelled': 'b-gray',
    'Available': 'b-green', 'In Use': 'b-blue', 'Returned': 'b-green', 'Detained': 'b-red'
  };
  return `<span class="badge ${map[s] || 'b-gray'}">${s}</span>`;
}

// Clickable Interconnected Details Overlays
export async function openCustomerDetail(cid) {
  const list = await getCollection("customers");
  const c = list.find(x => x.id === cid);
  if (!c) return;

  const shipments = await getCollection("shipments");
  const invoices = await getCollection("invoices");

  const clientShips = shipments.filter(s => s.customer === c.company);
  const clientInvs = invoices.filter(i => i.customer === c.company);
  const unpaidInvoiced = clientInvs.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0);
  const creditUtil = c.creditLimit > 0 ? Math.round((unpaidInvoiced / c.creditLimit) * 100) : 0;

  const mc = document.getElementById('modal-container');
  if (!mc) return;

  mc.innerHTML = `<div class="modal-bg" onclick="if(event.target===this) { this.remove(); }">
    <div class="modal" style="width:640px; max-height:85vh;">
      <div class="modal-title">${c.company} <span style="font-size:11px;color:var(--text-muted)">(${c.code})</span><button class="btn sm" onclick="document.getElementById('modal-container').innerHTML=''"><i class="ti ti-x"></i></button></div>
      
      <div class="grid3" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-lbl">Outstanding Balance</div>
          <div class="stat-val" style="font-size:16px;color:var(--danger)">${fmtAmt(unpaidInvoiced, c.currency)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Credit Limit</div>
          <div class="stat-val" style="font-size:16px">${fmtAmt(c.creditLimit, c.currency)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Active Shipments</div>
          <div class="stat-val" style="font-size:16px">${clientShips.filter(s => s.status !== 'Closed').length}</div>
        </div>
      </div>
      
      <div style="margin-bottom:16px">
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px">
          <span style="color:var(--text-muted)">Credit Utilization</span>
          <span style="font-weight:600; color:${creditUtil > 80 ? 'var(--danger)' : 'var(--primary)'}">${creditUtil}%</span>
        </div>
        <div class="profit-bar" style="height:10px;"><div class="profit-fill" style="width:${Math.min(100, creditUtil)}%; background:${creditUtil > 80 ? 'var(--danger)' : 'var(--primary)'}"></div></div>
      </div>
      
      <div class="grid2" style="margin-bottom:12px">
        <div>
          <div class="kv-row"><span class="kv-key">Contact</span><span>${c.contactPerson || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Phone</span><span>${c.phone || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Email</span><span>${c.email || '—'}</span></div>
        </div>
        <div>
          <div class="kv-row"><span class="kv-key">Payment Terms</span><span>${c.paymentTerms || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">GST / Tax ID</span><span>${c.gst || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Status</span><span>${statusBadge(c.status)}</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function openVendorDetail(vid) {
  const list = await getCollection("vendors");
  const v = list.find(x => x.id === vid);
  if (!v) return;

  const expenses = await getCollection("expenses");
  const vendorExps = expenses.filter(e => e.vendor === v.company);
  const unpaidLiability = vendorExps.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  const totalLiability = vendorExps.reduce((sum, e) => sum + e.amount, 0);

  const mc = document.getElementById('modal-container');
  if (!mc) return;

  mc.innerHTML = `<div class="modal-bg" onclick="if(event.target===this) { this.remove(); }">
    <div class="modal" style="width:640px; max-height:85vh;">
      <div class="modal-title">${v.company} <span style="font-size:11px;color:var(--text-muted)">(${v.code})</span><button class="btn sm" onclick="document.getElementById('modal-container').innerHTML=''"><i class="ti ti-x"></i></button></div>
      
      <div class="grid3" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-lbl">Outstanding Payables</div>
          <div class="stat-val" style="font-size:16px;color:var(--danger)">${fmtAmt(unpaidLiability)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Total Expenses</div>
          <div class="stat-val" style="font-size:16px">${fmtAmt(totalLiability)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Vendor Type</div>
          <div class="stat-val" style="font-size:16px">${v.vendorType}</div>
        </div>
      </div>
      
      <div class="grid2" style="margin-bottom:12px">
        <div>
          <div class="kv-row"><span class="kv-key">Contact</span><span>${v.contactPerson || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Phone</span><span>${v.phone || '—'}</span></div>
        </div>
        <div>
          <div class="kv-row"><span class="kv-key">Email</span><span>${v.email || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">GST / Tax ID</span><span>${v.gst || '—'}</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function openShipmentDetail(sid) {
  const shipments = await getCollection("shipments");
  const s = shipments.find(x => x.id === sid);
  if (!s) return;

  const mc = document.getElementById('modal-container');
  if (!mc) return;

  mc.innerHTML = `<div class="modal-bg" onclick="if(event.target===this) { this.remove(); }">
    <div class="modal" style="width:580px">
      <div class="modal-title">${s.jobNo} — ${s.customer}<button class="btn sm" onclick="document.getElementById('modal-container').innerHTML=''"><i class="ti ti-x" aria-hidden="true"></i></button></div>
      <div class="grid2" style="gap:8px;margin-bottom:12px">
        <div>
          <div class="kv-row"><span class="kv-key">Type</span><span>${s.type}</span></div>
          <div class="kv-row"><span class="kv-key">Status</span><span>${statusBadge(s.status)}</span></div>
          <div class="kv-row"><span class="kv-key">BL / AWB</span><span>${s.blNo || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">POL → POD</span><span>${s.pol || '—'} → ${s.pod || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Vessel</span><span>${s.vessel || '—'} ${s.voyage || ''}</span></div>
          <div class="kv-row"><span class="kv-key">ETD / ETA</span><span>${fmtDate(s.etd)} / ${fmtDate(s.eta)}</span></div>
        </div>
        <div>
          <div class="kv-row"><span class="kv-key">Shipper</span><span>${s.shipper || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Consignee</span><span>${s.consignee || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Commodity</span><span>${s.commodity || '—'}</span></div>
          <div class="kv-row"><span class="kv-key">GWT / Volume</span><span>${s.grossWeight || 0} kg / ${s.volume || 0} CBM</span></div>
          <div class="kv-row"><span class="kv-key">Packages</span><span>${s.packages || 0}</span></div>
          <div class="kv-row"><span class="kv-key">Container</span><span>${s.containerDetails || '—'}</span></div>
        </div>
      </div>
      <div style="font-size:11px;font-weight:600;margin-bottom:8px;text-transform:uppercase;color:var(--text-muted);">Timeline Events</div>
      <div class="tl-wrap" style="max-height:160px; overflow-y:auto;">
        ${(s.timeline || []).map((t, idx) => `
        <div class="tl-item">
          <div class="tl-dot ${idx === s.timeline.length - 1 ? 'cur' : 'done'}"></div>
          <div class="tl-name">${t.event}</div>
          <div class="tl-meta">${fmtDate(t.date)}${t.user ? ' · ' + t.user : ''} ${t.remarks ? ' — ' + t.remarks : ''}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}
