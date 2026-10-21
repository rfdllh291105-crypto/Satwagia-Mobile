/* ============================================================
   Klinik Satwagia HRIS v3 — Main Application
   ============================================================ */

/* ============================================================
   SEED DATA — 66 KARYAWAN + JOBDESC
   ============================================================ */
const STORAGE_KEY = 'satwagia_hris_v3';
const TOTAL_EMPLOYEES = 66;

const POSITIONS = [
  { name: 'Dokter Hewan',  base: 9000000 },
  { name: 'Perawat Hewan', base: 4500000 },
  { name: 'Resepsionis',   base: 3800000 },
  { name: 'Admin Klinik',  base: 4200000 },
  { name: 'Kasir',         base: 3800000 },
];

const JOBDESCS = {
  'Dokter Hewan':   'Memeriksa, mendiagnosis, dan mengobati hewan; melakukan tindakan medis & operasi; memberikan edukasi ke pemilik hewan; mengawasi kerja perawat hewan; mencatat rekam medis pasien.',
  'Perawat Hewan':  'Membantu dokter hewan dalam tindakan medis; merawat hewan rawat inap; menyiapkan alat & obat; monitoring kondisi pasien; sterilisasi alat; mendampingi pemilik hewan.',
  'Resepsionis':    'Menerima pendaftaran pasien; mengatur jadwal dokter; menjawab telepon & pertanyaan klien; mengelola antrian; konfirmasi kontrol ulang; input data pasien ke sistem.',
  'Admin Klinik':   'Mengelola administrasi cabang; monitoring stok obat & alat; membuat laporan harian cabang; koordinasi dengan kantor pusat; input & update data pasien.',
  'Kasir':          'Memproses pembayaran pasien; menerbitkan struk & invoice; rekapitulasi transaksi harian; tutup kasir; setor keuangan ke finance; pelayanan pembayaran klien.',
};

const FIRSTNAMES = ['Budi','Siti','Agus','Dewi','Rian','Nisa','Fajar','Ayu','Bayu','Rina','Hendra','Putri','Yoga','Lestari','Arif','Wulan','Dimas','Sari','Eko','Maya'];
const LASTNAMES  = ['Santoso','Nurhaliza','Setiawan','Lestari','Pratama','Aulia','Ramadhan','Wulandari','Aditya','Marlina'];

let state = null;

function seedData() {
  const branches = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: 'Cabang ' + (i + 1),
    address: 'Jl. Contoh No.' + (i + 1),
    phone: '021-5550' + (100 + i),
  }));

  const employees = [];
  for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
    const pos = POSITIONS[i % POSITIONS.length];
    const br  = branches[i % 10];
    employees.push({
      id: 'EMP' + String(i + 1).padStart(3, '0'),
      name: FIRSTNAMES[i % FIRSTNAMES.length] + ' ' + LASTNAMES[i % LASTNAMES.length],
      branchId: br.id,
      position: pos.name,
      jobdesc: JOBDESCS[pos.name],
      base: pos.base,
      allowance: 500000,
      bankName: ['BCA', 'Mandiri', 'BNI', 'BRI'][i % 4],
      bankAccount: String(1000000000 + i),
      joinedAt: '2024-' + String((i % 9) + 1).padStart(2, '0') + '-15',
      status: 'active',
    });
  }

  const users = [
    { username: 'superadmin', password: 'admin123',   name: 'Super Admin',      role: 'superadmin' },
    { username: 'hrd',        password: 'hrd123',     name: 'Sarah HRD',        role: 'hrd' },
    { username: 'finance',    password: 'finance123', name: 'Budi Finance',     role: 'finance' },
    { username: 'mgr1',       password: 'mgr123',     name: 'Andi (Cabang 1)',  role: 'manager', branchId: 1 },
    { username: 'mgr2',       password: 'mgr123',     name: 'Rina (Cabang 2)',  role: 'manager', branchId: 2 },
  ];
  employees.forEach(e => users.push({
    username: e.id.toLowerCase(),
    password: 'emp123',
    name: e.name,
    role: 'employee',
    employeeId: e.id,
  }));

  // Absensi 30 hari terakhir (weekday only)
  const attendances = [];
  const today = new Date();
  for (let d = 1; d <= 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const ds = date.toISOString().slice(0, 10);
    employees.forEach((e, idx) => {
      const r = (idx + d * 3) % 12;
      let status = 'hadir', inTime = '08:00', outTime = '17:00', late = 0;
      if (r === 0) { status = 'izin';  inTime = '-'; outTime = '-'; }
      else if (r === 1) { status = 'sakit'; inTime = '-'; outTime = '-'; }
      else if (r === 2) { inTime = '08:15'; late = 15; }
      else if (r === 3) { inTime = '08:30'; late = 30; }
      else if (r === 4) { inTime = '08:45'; late = 45; }
      attendances.push({
        id: 'ATT' + ds.replace(/-/g, '') + e.id,
        empId: e.id, date: ds, inTime, outTime,
        lateMinutes: late, status,
        source: 'workting',
        selfieData: null, gpsIn: null,
        outSelfieData: null, gpsOut: null, outAt: null,
      });
    });
  }

  const overtimeRequests = [];
  employees.slice(0, 20).forEach((e, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i % 15));
    overtimeRequests.push({
      id: 'OT' + String(i + 1).padStart(3, '0'),
      empId: e.id, branchId: e.branchId,
      date: d.toISOString().slice(0, 10),
      hours: [1, 2, 3, 2, 1.5, 4][i % 6],
      reason: ['Closing bulanan','Extra shift','Emergency','Stock opname','Kunjungan luar'][i % 5],
      status: ['approved','approved','pending','pending','rejected'][i % 5],
      approvedBy: i < 2 ? 'Sarah HRD' : null,
      approvedAt: i < 2 ? new Date().toISOString() : null,
      createdAt: d.toISOString(),
    });
  });

  const leaveRequests = employees.slice(0, 12).map((e, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i + 2));
    return {
      id: 'LV' + String(i + 1).padStart(3, '0'),
      empId: e.id, branchId: e.branchId,
      type: ['cuti','izin','sakit'][i % 3],
      startDate: d.toISOString().slice(0, 10),
      endDate: d.toISOString().slice(0, 10),
      reason: ['Keperluan keluarga','Sakit demam','Urusan pribadi'][i % 3],
      status: i % 3 === 0 ? 'approved' : 'pending',
      approvedBy: i % 3 === 0 ? 'Sarah HRD' : null,
      createdAt: d.toISOString(),
    };
  });

  const st = {
    branches, employees, users, attendances,
    overtimeRequests, leaveRequests,
    payrollRuns: [], auditLog: [], currentUser: null, version: 3,
  };

  const prev = new Date();
  prev.setMonth(prev.getMonth() - 1);
  const period = prev.toISOString().slice(0, 7);
  const rows = computeRowsForPeriod(st, period);
  st.payrollRuns.push({
    id: 'PR-' + period, period, rows, status: 'published',
    createdBy: 'Budi Finance',
    createdAt: prev.toISOString(),
    finalizedAt: prev.toISOString(),
    publishedAt: prev.toISOString(),
  });
  st.auditLog.push({ ts: prev.toISOString(), user: 'system', action: 'Seed 66 karyawan + payroll ' + period });
  return st;
}

function computeRowsForPeriod(st, period) {
  return st.employees.map(e => {
    const att = st.attendances.filter(a => a.empId === e.id && a.date.startsWith(period));
    const hadir = att.filter(a => a.status === 'hadir').length;
    const alpha = att.filter(a => a.status !== 'hadir').length;
    const lateMin = att.reduce((s, a) => s + (a.lateMinutes || 0), 0);
    const ots = st.overtimeRequests.filter(o => o.empId === e.id && o.status === 'approved' && o.date.startsWith(period));
    const otHours = ots.reduce((s, o) => s + o.hours, 0);
    const overtimePay = Math.round(otHours * (e.base / 173) * 1.5);
    const lateDeduction = Math.floor(lateMin / 60) * 50000;
    const absenceDeduction = alpha * Math.round(e.base / 22);
    const bpjs = Math.round(e.base * 0.02);
    const pph21 = e.base > 5000000 ? Math.round(e.base * 0.05) : 0;
    const gross = e.base + e.allowance + overtimePay;
    const deductions = lateDeduction + absenceDeduction + bpjs + pph21;
    const net = gross - deductions;
    return {
      empId: e.id, name: e.name, branchId: e.branchId, position: e.position,
      bankName: e.bankName, bankAccount: e.bankAccount,
      base: e.base, allowance: e.allowance,
      otHours, overtimePay,
      lateMinutes: lateMin, lateDeduction,
      hadir, alpha, absenceDeduction, bpjs, pph21,
      gross, deductions, net,
    };
  });
}

/* ============================================================
   PERSISTENCE — dengan fallback quota exceeded
   ============================================================ */
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s.version === 3) return s;
    } catch (e) {}
  }
  const s = seedData();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      const withSelfie = state.attendances
        .filter(a => a.selfieData || a.outSelfieData)
        .sort((a, b) => a.date.localeCompare(b.date));
      let pruned = 0;
      for (const rec of withSelfie) {
        if (pruned >= 30) break;
        if (rec.selfieData) { delete rec.selfieData; pruned++; }
        if (rec.outSelfieData) { delete rec.outSelfieData; pruned++; }
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e2) {
        alert('Storage browser penuh. Reset data lewat Super Admin → Audit Log → Reset.');
      }
    } else {
      console.error(err);
    }
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const branchName = id => (state.branches.find(b => b.id === id) || {}).name || '-';
const empById = id => state.employees.find(e => e.id === id);

function badge(s) {
  const m = {
    hadir: 'bg-green-100 text-green-700',
    izin: 'bg-purple-100 text-purple-700',
    sakit: 'bg-yellow-100 text-yellow-800',
    alpha: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-700',
    finalized: 'bg-purple-100 text-purple-700',
    published: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
  };
  return '<span class="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ' + (m[s] || 'bg-slate-100') + '">' + s + '</span>';
}

function audit(action) {
  state.auditLog.unshift({
    ts: new Date().toISOString(),
    user: state.currentUser ? state.currentUser.name : 'system',
    action,
  });
  if (state.auditLog.length > 200) state.auditLog = state.auditLog.slice(0, 200);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  stopCamera();
}

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function toast(msg, type) {
  const c = type === 'err' ? 'bg-red-600' : (type === 'warn' ? 'bg-yellow-500' : 'bg-purple-600');
  const d = document.createElement('div');
  d.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm ' + c + ' text-white px-4 py-3 rounded-lg shadow-lg text-sm z-[60] text-center md:text-left';
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2500);
}

/* ============================================================
   KAMERA & GPS — UNTUK ABSENSI
   ============================================================ */
let _camStream = null;
let _capturedPhoto = null;
let _currentGps = null;
let _clockType = null;

async function startCameraInto(videoEl) {
  try {
    _camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    videoEl.srcObject = _camStream;
    videoEl.classList.add('mirror');
    return true;
  } catch (e) {
    return false;
  }
}

function stopCamera() {
  if (_camStream) {
    _camStream.getTracks().forEach(t => t.stop());
    _camStream = null;
  }
}

async function startClockCapture(type) {
  _clockType = type;
  _capturedPhoto = null;
  _currentGps = null;
  const isIn = type === 'in';
  const title = isIn ? 'Clock In' : 'Clock Out';
  const btnColor = isIn
    ? 'bg-purple-600 hover:bg-purple-700'
    : 'bg-yellow-400 hover:bg-yellow-500 text-purple-900';

  openModal(
    '<div class="flex items-start justify-between mb-3">' +
      '<div><h3 class="font-bold text-base md:text-lg">📸 ' + title + '</h3>' +
      '<p class="text-xs text-slate-500">Ambil selfie + GPS otomatis</p></div>' +
      '<button onclick="closeModal()" class="p-1 rounded hover:bg-slate-100"><svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="camera-wrap mb-3">' +
      '<video id="camPreview" autoplay playsinline muted></video>' +
      '<img id="photoPreview" class="hidden" alt="selfie">' +
      '<div id="camError" class="hidden absolute inset-0 flex items-center justify-center text-white text-center p-4 text-xs"></div>' +
    '</div>' +
    '<div id="gpsBox" class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 text-sm">' +
      '<div class="flex items-start gap-2"><span class="text-lg">📍</span>' +
      '<div class="flex-1"><p class="text-xs text-slate-500 font-medium">Lokasi GPS</p>' +
      '<p id="gpsText" class="text-sm text-purple-800">Mengambil lokasi...</p></div></div>' +
    '</div>' +
    '<div id="camActionRow" class="flex gap-2">' +
      '<button onclick="captureSelfie()" class="flex-1 ' + btnColor + ' text-white py-3 rounded-lg font-medium shadow">📷 Ambil Foto</button>' +
      '<button onclick="closeModal()" class="flex-1 bg-slate-200 py-3 rounded-lg">Batal</button>' +
    '</div>' +
    '<div id="confirmRow" class="hidden gap-2">' +
      '<button onclick="retakeSelfie()" class="flex-1 bg-slate-200 py-3 rounded-lg">🔄 Ulangi</button>' +
      '<button onclick="confirmClockAction()" class="flex-1 ' + btnColor + ' text-white py-3 rounded-lg font-semibold shadow">✓ Konfirmasi ' + title + '</button>' +
    '</div>'
  );

  const vid = document.getElementById('camPreview');
  const ok = await startCameraInto(vid);
  if (!ok) {
    const errDiv = document.getElementById('camError');
    errDiv.innerHTML = '📵<br>Kamera tidak dapat diakses.<br><span class="text-[10px] opacity-75">Buka via HTTPS (Netlify) atau izinkan kamera. Anda tetap bisa absen dengan placeholder.</span>';
    errDiv.classList.remove('hidden');
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        _currentGps = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) };
        const gt = document.getElementById('gpsText');
        if (gt) gt.innerHTML = '<span class="text-green-600 font-semibold">✓ ' + _currentGps.lat + ', ' + _currentGps.lng + '</span>';
      },
      err => {
        _currentGps = { lat: 'N/A', lng: 'N/A' };
        const gt = document.getElementById('gpsText');
        if (gt) gt.innerHTML = '<span class="text-yellow-600">⚠ GPS gagal (' + err.message + '). Lanjut dengan N/A.</span>';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    _currentGps = { lat: 'N/A', lng: 'N/A' };
    document.getElementById('gpsText').textContent = 'GPS tidak didukung';
  }
}

function captureSelfie() {
  const video = document.getElementById('camPreview');
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;
  const size = Math.min(vw, vh);
  const sx = (vw - size) / 2;
  const sy = (vh - size) / 2;

  if (!video.srcObject || !vw) {
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📷', 100, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('NO CAMERA', 100, 120);
    ctx.font = '11px sans-serif';
    ctx.fillText(new Date().toLocaleString('id-ID'), 100, 140);
  } else {
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 200, 200);
  }
  _capturedPhoto = canvas.toDataURL('image/jpeg', 0.6);

  const img = document.getElementById('photoPreview');
  img.src = _capturedPhoto;
  img.classList.remove('hidden');
  video.classList.add('hidden');
  document.getElementById('camActionRow').classList.add('hidden');
  document.getElementById('confirmRow').classList.remove('hidden');
  document.getElementById('confirmRow').classList.add('flex');
  stopCamera();
}

async function retakeSelfie() {
  _capturedPhoto = null;
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('camPreview').classList.remove('hidden');
  document.getElementById('camActionRow').classList.remove('hidden');
  document.getElementById('confirmRow').classList.add('hidden');
  document.getElementById('confirmRow').classList.remove('flex');
  await startCameraInto(document.getElementById('camPreview'));
}

function confirmClockAction() {
  if (!_capturedPhoto) { toast('Ambil foto dulu', 'err'); return; }
  if (!_currentGps) { toast('Tunggu GPS selesai...', 'warn'); return; }

  const e = me();
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  if (_clockType === 'in') {
    if (state.attendances.find(a => a.empId === e.id && a.date === todayStr)) {
      toast('Sudah clock in hari ini', 'warn');
      closeModal();
      return;
    }
    const late = Math.max(0, (now.getHours() * 60 + now.getMinutes()) - 480);
    state.attendances.push({
      id: 'ATT' + todayStr.replace(/-/g, '') + e.id + '-' + Date.now(),
      empId: e.id, date: todayStr,
      inTime: hhmm, outTime: '-',
      lateMinutes: late, status: 'hadir',
      source: 'self-clockin',
      selfieData: _capturedPhoto, gpsIn: _currentGps,
      outSelfieData: null, gpsOut: null, outAt: null,
    });
    audit('Clock IN ' + e.id + ' @' + hhmm);
    toast('✓ Clock In ' + hhmm + ' tersimpan');
  } else {
    const att = state.attendances.find(a => a.empId === e.id && a.date === todayStr && (!a.outTime || a.outTime === '-'));
    if (!att) {
      toast('Belum clock in / sudah clock out', 'err');
      closeModal();
      return;
    }
    att.outTime = hhmm;
    att.outSelfieData = _capturedPhoto;
    att.gpsOut = _currentGps;
    att.outAt = now.toISOString();
    audit('Clock OUT ' + e.id + ' @' + hhmm);
    toast('✓ Clock Out ' + hhmm + ' tersimpan');
  }
  persist();
  closeModal();
  go('emp-clock');
}

window.showAttendancePhoto = (recId, type) => {
  const rec = state.attendances.find(a => a.id === recId);
  if (!rec) return;
  const photo = type === 'out' ? rec.outSelfieData : rec.selfieData;
  const gps = type === 'out' ? rec.gpsOut : rec.gpsIn;
  const time = type === 'out' ? rec.outTime : rec.inTime;
  const e = empById(rec.empId);
  openModal(
    '<div class="flex justify-between items-start mb-3">' +
      '<div><h3 class="font-bold text-base md:text-lg">📸 Foto ' + type.toUpperCase() + '</h3>' +
      '<p class="text-xs text-slate-500">' + (e ? e.name : '') + ' · ' + rec.date + ' · ' + time + '</p></div>' +
      '<button onclick="closeModal()" class="p-1 rounded hover:bg-slate-100"><svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>' +
    '</div>' +
    (photo
      ? '<img src="' + photo + '" class="w-full max-w-xs mx-auto rounded-xl border-2 border-purple-200 mb-3 shadow">'
      : '<div class="text-center text-slate-400 py-8 bg-slate-50 rounded-xl mb-3 text-sm">📵 Tidak ada foto tersimpan</div>') +
    '<div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 text-sm">' +
      '<p class="text-xs text-slate-500 font-medium mb-1">📍 GPS saat absen</p>' +
      '<p class="text-purple-800 font-mono text-xs">' + (gps ? gps.lat + ', ' + gps.lng : 'Tidak tersedia') + '</p>' +
      (gps && gps.lat !== 'N/A' ? '<a href="https://www.google.com/maps?q=' + gps.lat + ',' + gps.lng + '" target="_blank" class="text-xs text-purple-600 underline mt-1 inline-block">Buka di Google Maps →</a>' : '') +
    '</div>' +
    '<button onclick="closeModal()" class="w-full bg-slate-200 py-2.5 rounded-lg">Tutup</button>'
  );
};

/* ============================================================
   SIDEBAR DRAWER
   ============================================================ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (!sb.classList.contains('-translate-x-full')) {
    closeSidebarDrawer();
  } else {
    sb.classList.remove('-translate-x-full');
    bd.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function closeSidebarDrawer() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-backdrop').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

/* ============================================================
   AUTH
   ============================================================ */
function fillLogin(u, p) {
  document.getElementById('inUser').value = u;
  document.getElementById('inPass').value = p;
}

function doLogin() {
  const u = document.getElementById('inUser').value.trim();
  const p = document.getElementById('inPass').value;
  const usr = state.users.find(x => x.username === u && x.password === p);
  if (!usr) {
    const err = document.getElementById('loginErr');
    err.textContent = 'Username atau password salah.';
    err.classList.remove('hidden');
    return;
  }
  state.currentUser = {
    username: usr.username,
    name: usr.name,
    role: usr.role,
    branchId: usr.branchId || null,
    employeeId: usr.employeeId || null,
  };
  audit('Login sebagai ' + usr.role);
  persist();
  showApp();
}

function doLogout() {
  closeSidebarDrawer();
  audit('Logout');
  state.currentUser = null;
  persist();
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

/* ============================================================
   MENU
   ============================================================ */
const MENUS = {
  superadmin: [
    { k: 'sa-dash',     l: 'Dashboard Sistem', i: '📊' },
    { k: 'sa-users',    l: 'Kelola User',      i: '👤' },
    { k: 'sa-branches', l: 'Kelola Cabang',    i: '🏥' },
    { k: 'sa-master',   l: 'Master Data',      i: '⚙️' },
    { k: 'sa-audit',    l: 'Audit Log',        i: '📜' },
  ],
  hrd: [
    { k: 'hrd-dash',   l: 'Dashboard HR',         i: '📊' },
    { k: 'hrd-emp',    l: 'Data Karyawan',        i: '👥' },
    { k: 'hrd-att',    l: 'Monitoring Absensi',   i: '⏰' },
    { k: 'hrd-ot',     l: 'Approval Lembur',      i: '🕒' },
    { k: 'hrd-leave',  l: 'Approval Cuti/Izin',   i: '📝' },
    { k: 'hrd-report', l: 'Laporan HR',           i: '📈' },
  ],
  finance: [
    { k: 'fin-dash',    l: 'Dashboard Finance', i: '📊' },
    { k: 'fin-payroll', l: 'Payroll Run',       i: '💰' },
    { k: 'fin-publish', l: 'Publish Payslip',   i: '📤' },
    { k: 'fin-bank',    l: 'Bank File',         i: '🏦' },
    { k: 'fin-report',  l: 'Laporan Payroll',   i: '📈' },
  ],
  manager: [
    { k: 'mgr-dash',  l: 'Dashboard Cabang', i: '📊' },
    { k: 'mgr-att',   l: 'Absensi Cabang',   i: '⏰' },
    { k: 'mgr-ot',    l: 'Approval Lembur',  i: '🕒' },
    { k: 'mgr-leave', l: 'Approval Cuti',    i: '📝' },
    { k: 'mgr-team',  l: 'Tim Saya',         i: '👥' },
  ],
  employee: [
    { k: 'emp-dash',    l: 'Dashboard Saya',   i: '📊' },
    { k: 'emp-clock',   l: 'Absensi Saya',     i: '⏰' },
    { k: 'emp-ot',      l: 'Ajukan Lembur',    i: '🕒' },
    { k: 'emp-leave',   l: 'Ajukan Cuti/Izin', i: '📝' },
    { k: 'emp-payslip', l: 'Slip Gaji',        i: '💵' },
    { k: 'emp-profile', l: 'Profil Saya',      i: '👤' },
  ],
};

let activeMenu = null;

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  const u = state.currentUser;
  document.getElementById('hdrName').textContent = u.name;
  document.getElementById('hdrRole').textContent = u.role.toUpperCase() + (u.branchId ? ' · ' + branchName(u.branchId) : '');
  renderSidebar();
  go(MENUS[u.role][0].k);
}

function renderSidebar() {
  const u = state.currentUser;
  document.getElementById('sidebar').innerHTML =
    '<div class="md:hidden flex justify-between items-center mb-3 pb-3 border-b border-purple-100">' +
      '<span class="text-xs text-slate-500">Menu</span>' +
      '<button onclick="closeSidebarDrawer()" class="p-1 rounded hover:bg-purple-50">' +
        '<svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button></div>' +
    MENUS[u.role].map(m =>
      '<button data-menu="' + m.k + '" class="menu-item w-full text-left px-3 py-2.5 md:py-2 rounded-lg text-sm mb-1 hover:bg-purple-50 active:bg-purple-100 ' + (activeMenu === m.k ? 'menu-active' : 'text-slate-700') + '">' +
      '<span class="mr-2">' + m.i + '</span>' + m.l + '</button>'
    ).join('') +
    '<div class="mt-4 pt-4 border-t border-purple-100 text-xs text-slate-400 px-2">© Satwagia HRIS v3</div>';

  document.querySelectorAll('.menu-item').forEach(b => b.onclick = () => {
    go(b.dataset.menu);
    if (window.innerWidth < 768) closeSidebarDrawer();
  });
}

/* ============================================================
   ROUTER
   ============================================================ */
const VIEWS = {};

function go(key) {
  activeMenu = key;
  renderSidebar();
  const fn = VIEWS[key];
  document.getElementById('main').innerHTML = fn ? fn() : '<p>Halaman tidak ditemukan.</p>';
  window.scrollTo(0, 0);
}

/* ============================================================
   SHARED WIDGETS
   ============================================================ */
function statCard(label, val, icon, bg) {
  return '<div class="' + (bg || 'bg-white') + ' border border-purple-100 rounded-xl p-3 md:p-4 shadow-sm"><div class="text-xl md:text-2xl">' + icon + '</div>' +
    '<p class="text-lg md:text-2xl font-bold mt-1 break-words text-purple-900">' + val + '</p><p class="text-[11px] md:text-xs text-slate-500 mt-1">' + label + '</p></div>';
}

function tableHead(cols) {
  return '<thead class="bg-purple-50 text-purple-800 text-xs uppercase"><tr>' +
    cols.map(c => '<th class="text-left py-2 px-3 font-medium">' + c + '</th>').join('') + '</tr></thead>';
}

function scrollHint() {
  return '<p class="md:hidden text-[11px] text-slate-400 mb-1 flex items-center gap-1"><span>👉</span> Geser tabel · Tap foto untuk detail</p>';
}

function photoThumb(recId, type, data) {
  if (!data) return '<span class="text-slate-300 text-xs">—</span>';
  return '<img src="' + data + '" class="w-9 h-9 rounded object-cover border-2 border-purple-200 cursor-pointer" onclick="event.stopPropagation();showAttendancePhoto(\'' + recId + '\',\'' + type + '\')">';
}

/* ============================================================
   SUPER ADMIN VIEWS
   ============================================================ */
VIEWS['sa-dash'] = () => {
  const totalUsers = state.users.length;
  const totalEmp = state.employees.length;
  const totalPending = state.overtimeRequests.filter(o => o.status === 'pending').length +
                       state.leaveRequests.filter(l => l.status === 'pending').length;
  const totalPayroll = state.payrollRuns.filter(p => p.status === 'published')
    .reduce((s, p) => s + p.rows.reduce((a, r) => a + r.net, 0), 0);
  return '<h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-purple-900">Dashboard Sistem</h2>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">' +
      statCard('Total User', totalUsers, '👤', 'bg-purple-50') +
      statCard('Total Cabang', state.branches.length, '🏥', 'bg-white') +
      statCard('Karyawan Klinik', totalEmp, '👥', 'bg-yellow-50') +
      statCard('Request Pending', totalPending, '⏳', 'bg-white') +
    '</div>' +
    '<div class="mb-4 md:mb-6">' + statCard('Total Payroll Published (all-time)', fmt(totalPayroll), '💰', 'bg-gradient-to-br from-purple-50 to-yellow-50') + '</div>' +
    '<div class="bg-white border border-purple-100 rounded-xl p-3 md:p-4 shadow-sm">' +
      '<h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Ringkasan per Role</h3>' +
      '<div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">' +
        ['superadmin','hrd','finance','manager','employee'].map(r => {
          const c = state.users.filter(u => u.role === r).length;
          return '<div class="p-2 bg-purple-50 rounded-lg"><b class="text-xs md:text-sm text-purple-800">' + r + '</b><div class="text-slate-500 text-[11px]">' + c + ' user</div></div>';
        }).join('') +
      '</div>' +
      '<p class="text-xs text-purple-600 mt-3">✓ 66 karyawan klinik (EMP001–EMP066) masing-masing punya akun login sendiri.</p>' +
    '</div>';
};

VIEWS['sa-users'] = () => {
  const rows = state.users.map(u => {
    const isEmp = !!u.employeeId;
    const cls = isEmp ? 'cursor-pointer hover:bg-purple-50' : 'hover:bg-slate-50';
    const onclick = isEmp ? ' onclick="viewEmpDetail(\'' + u.employeeId + '\')"' : '';
    return '<tr class="border-b border-purple-50 ' + cls + '"' + onclick + '><td class="py-2 px-3 font-mono text-xs">' + u.username + '</td>' +
      '<td class="py-2 px-3">' + u.name + '</td><td class="py-2 px-3">' + badge(u.role) + '</td>' +
      '<td class="py-2 px-3 text-slate-500">' + (u.branchId ? branchName(u.branchId) : '-') + '</td>' +
      '<td class="py-2 px-3 text-slate-500">' + (u.employeeId || '-') + '</td></tr>';
  }).join('');
  return '<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">' +
    '<h2 class="text-lg md:text-xl font-bold text-purple-900">Kelola User (' + state.users.length + ')</h2>' +
    '<button onclick="showAllEmpCredentials()" class="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-3 py-2 rounded-lg text-xs font-semibold self-start shadow">🔑 Semua Akun Karyawan</button></div>' +
    scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto max-h-[70vh]"><table class="w-full text-sm">' +
    tableHead(['Username','Nama','Role','Cabang','Karyawan']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.showAllEmpCredentials = () => {
  const rows = state.employees.map(e =>
    '<tr class="border-b border-purple-50"><td class="py-1.5 px-2 font-mono text-xs text-purple-700">' + e.id.toLowerCase() + '</td>' +
    '<td class="py-1.5 px-2 text-xs">emp123</td><td class="py-1.5 px-2 text-xs">' + e.name + '</td>' +
    '<td class="py-1.5 px-2 text-xs text-slate-500">' + e.position + ' · ' + branchName(e.branchId) + '</td></tr>'
  ).join('');
  openModal(
    '<h3 class="font-bold text-base md:text-lg mb-1 text-purple-900">🔑 Akun 66 Karyawan</h3>' +
    '<p class="text-xs text-slate-500 mb-3">Password semua: <b class="font-mono bg-yellow-100 px-1 rounded">emp123</b></p>' +
    '<div class="max-h-[60vh] overflow-y-auto border border-purple-100 rounded"><table class="w-full text-sm">' +
    '<thead class="bg-purple-50 sticky top-0 text-xs uppercase text-purple-800"><tr>' +
      '<th class="text-left py-2 px-2">Username</th><th class="text-left py-2 px-2">Pass</th>' +
      '<th class="text-left py-2 px-2">Nama</th><th class="text-left py-2 px-2">Jabatan</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<button onclick="closeModal()" class="w-full bg-slate-200 py-2.5 rounded-lg mt-3">Tutup</button>'
  );
};

VIEWS['sa-branches'] = () => {
  const rows = state.branches.map(b => {
    const cnt = state.employees.filter(e => e.branchId === b.id).length;
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono">' + b.id + '</td>' +
      '<td class="py-2 px-3 font-medium">' + b.name + '</td><td class="py-2 px-3 text-slate-600">' + b.address + '</td>' +
      '<td class="py-2 px-3">' + b.phone + '</td><td class="py-2 px-3 text-right font-semibold text-purple-700">' + cnt + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Kelola Cabang (' + state.branches.length + ')</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Alamat','Telp','Karyawan']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['sa-master'] = () => {
  const rows = POSITIONS.map(p =>
    '<tr class="border-b border-purple-50 align-top"><td class="py-2 px-3 font-medium text-purple-900">' + p.name + '</td>' +
    '<td class="py-2 px-3 text-right whitespace-nowrap">' + fmt(p.base) + '</td>' +
    '<td class="py-2 px-3 text-xs text-slate-600">' + JOBDESCS[p.name] + '</td></tr>'
  ).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Master Data</h2>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4 mb-4"><h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Jabatan · Gaji Pokok · Jobdesc</h3>' +
    '<div class="overflow-x-auto"><table class="w-full text-sm">' + tableHead(['Jabatan','Gaji','Jobdesc']) + '<tbody>' + rows + '</tbody></table></div></div>' +
    '<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4"><h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Komponen Gaji</h3>' +
    '<ul class="text-xs md:text-sm text-slate-700 space-y-1.5">' +
      '<li>✓ Gaji Pokok (per jabatan)</li><li>✓ Tunjangan Tetap: ' + fmt(500000) + '</li>' +
      '<li>✓ Lembur: (Gaji Pokok/173) × 1.5 × jam lembur</li><li>✓ Potongan Telat: ' + fmt(50000) + '/60 menit</li>' +
      '<li>✓ Potongan Alpha: Gaji Pokok/22 per hari</li><li>✓ BPJS: 2% dari gaji pokok</li>' +
      '<li>✓ PPh21: 5% jika gaji pokok > 5 juta</li></ul></div>';
};

VIEWS['sa-audit'] = () => {
  const rows = state.auditLog.map(l =>
    '<tr class="border-b border-purple-50"><td class="py-2 px-3 text-xs text-slate-500 whitespace-nowrap">' + new Date(l.ts).toLocaleString('id-ID') + '</td>' +
    '<td class="py-2 px-3 whitespace-nowrap">' + l.user + '</td><td class="py-2 px-3">' + l.action + '</td></tr>'
  ).join('') || '<tr><td colspan="3" class="py-4 text-center text-slate-400">Belum ada log.</td></tr>';
  return '<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">' +
    '<h2 class="text-lg md:text-xl font-bold text-purple-900">Audit Log</h2>' +
    '<button onclick="resetData()" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs self-start">Reset Semua Data</button></div>' +
    scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto max-h-[70vh]"><table class="w-full text-sm">' +
    tableHead(['Waktu','User','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.resetData = () => {
  if (confirm('Reset semua data ke kondisi awal?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
};

/* ============================================================
   HRD VIEWS
   ============================================================ */
VIEWS['hrd-dash'] = () => {
  const totalEmp = state.employees.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAtt = state.attendances.filter(a => a.date === todayStr);
  const pendOT = state.overtimeRequests.filter(o => o.status === 'pending');
  const pendLeave = state.leaveRequests.filter(l => l.status === 'pending');
  const clockedIn = todayAtt.filter(a => a.status === 'hadir' && (!a.outTime || a.outTime === '-')).length;
  const clockedOut = todayAtt.filter(a => a.outTime && a.outTime !== '-').length;
  return '<h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-purple-900">Dashboard HR</h2>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">' +
      statCard('Karyawan Klinik', totalEmp, '👥', 'bg-purple-50') +
      statCard('Hadir Hari Ini', todayAtt.filter(a => a.status === 'hadir').length, '✅', 'bg-white') +
      statCard('Pending Lembur', pendOT.length, '🕒', 'bg-yellow-50') +
      statCard('Pending Cuti/Izin', pendLeave.length, '📝', 'bg-white') +
    '</div>' +
    '<div class="grid grid-cols-2 gap-3 mb-4">' +
      statCard('Sudah Clock In', clockedIn, '📸', 'bg-purple-50') +
      statCard('Sudah Clock Out', clockedOut, '🚪', 'bg-yellow-50') +
    '</div>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4">' +
      '<h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">5 Karyawan Terbaru</h3>' +
      '<table class="w-full text-sm"><tbody>' +
        state.employees.slice(-5).reverse().map(e =>
          '<tr class="border-b border-purple-50 cursor-pointer hover:bg-purple-50" onclick="viewEmpDetail(\'' + e.id + '\')"><td class="py-2">' + e.name + '</td><td class="text-slate-500 text-xs">' + e.position + '</td><td class="text-right text-slate-500 text-xs">' + branchName(e.branchId) + '</td></tr>'
        ).join('') +
      '</tbody></table></div>';
};

VIEWS['hrd-emp'] = () => {
  const rows = state.employees.map(e =>
    '<tr class="border-b border-purple-50 hover:bg-purple-50 cursor-pointer" onclick="viewEmpDetail(\'' + e.id + '\')">' +
    '<td class="py-2 px-3 font-mono text-xs">' + e.id + '</td><td class="py-2 px-3">' + e.name + '</td>' +
    '<td class="py-2 px-3 text-slate-600">' + e.position + '</td><td class="py-2 px-3">' + branchName(e.branchId) + '</td>' +
    '<td class="py-2 px-3 text-right">' + fmt(e.base) + '</td>' +
    '<td class="py-2 px-3 text-xs text-slate-500">' + e.bankName + ' · ' + e.bankAccount + '</td></tr>'
  ).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Data Karyawan (' + state.employees.length + ')</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto max-h-[70vh]"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Jabatan','Cabang','Gaji Pokok','Rekening']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['hrd-att'] = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todays = state.attendances.filter(a => a.date === todayStr);
  const rows = todays.slice(0, 50).map(a => {
    const e = empById(a.empId) || {};
    return '<tr class="border-b border-purple-50 hover:bg-purple-50">' +
      '<td class="py-2 px-3 font-mono text-xs">' + a.empId + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td>' +
      '<td class="py-2 px-3">' + branchName(e.branchId) + '</td>' +
      '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'in', a.selfieData) + '</td>' +
      '<td class="py-2 px-3 font-mono">' + a.inTime + '</td>' +
      '<td class="py-2 px-3 font-mono">' + (a.outTime === '-' ? '<span class="text-slate-300">—</span>' : a.outTime) + '</td>' +
      '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'out', a.outSelfieData) + '</td>' +
      '<td class="py-2 px-3">' + badge(a.status) + (a.lateMinutes ? ' <span class="text-yellow-600 text-xs">(' + a.lateMinutes + 'm)</span>' : '') + '</td>' +
      '<td class="py-2 px-3"><button onclick="correctAttendance(\'' + a.id + '\')" class="inline-btn text-xs text-purple-600 hover:underline">Koreksi</button></td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-2 text-purple-900">Monitoring Absensi</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3">' + fmtDate(todayStr) + ' · ' + Math.min(50, todays.length) + ' dari ' + todays.length + ' record</p>' +
    scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Cabang','Foto In','In','Out','Foto Out','Status','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.correctAttendance = id => {
  const a = state.attendances.find(x => x.id === id);
  if (!a) return;
  openModal(
    '<h3 class="font-bold text-base md:text-lg mb-3 text-purple-900">Koreksi Absensi</h3>' +
    '<p class="text-sm text-slate-500 mb-3">' + empById(a.empId).name + ' — ' + a.date + '</p>' +
    '<div class="space-y-3 text-sm">' +
      '<div><label class="text-xs text-slate-600 font-medium">Status</label><select id="cStatus" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1">' +
        ['hadir','izin','sakit','alpha'].map(s => '<option ' + (a.status === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div><label class="text-xs text-slate-600 font-medium">In</label><input id="cIn" value="' + a.inTime + '" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
        '<div><label class="text-xs text-slate-600 font-medium">Out</label><input id="cOut" value="' + (a.outTime === '-' ? '' : a.outTime) + '" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
      '</div>' +
      '<div><label class="text-xs text-slate-600 font-medium">Late (menit)</label><input id="cLate" type="number" value="' + (a.lateMinutes || 0) + '" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
    '</div>' +
    '<div class="flex gap-2 mt-4 sticky bottom-0 bg-white pt-2"><button onclick="saveCorrection(\'' + id + '\')" class="flex-1 bg-purple-600 text-white py-2.5 rounded-lg">Simpan</button>' +
    '<button onclick="closeModal()" class="flex-1 bg-slate-200 py-2.5 rounded-lg">Batal</button></div>'
  );
};

window.saveCorrection = id => {
  const a = state.attendances.find(x => x.id === id);
  a.status = document.getElementById('cStatus').value;
  a.inTime = document.getElementById('cIn').value;
  const newOut = document.getElementById('cOut').value;
  a.outTime = newOut || '-';
  a.lateMinutes = parseInt(document.getElementById('cLate').value) || 0;
  a.correctedBy = state.currentUser.name;
  audit('Koreksi absensi ' + a.empId);
  persist();
  closeModal();
  toast('Absensi dikoreksi');
  go('hrd-att');
};

VIEWS['hrd-ot'] = () => {
  const rows = state.overtimeRequests.map(o => {
    const e = empById(o.empId) || {};
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + o.id + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td><td class="py-2 px-3">' + branchName(o.branchId) + '</td>' +
      '<td class="py-2 px-3">' + fmtDate(o.date) + '</td><td class="py-2 px-3">' + o.hours + 'j</td>' +
      '<td class="py-2 px-3">' + o.reason + '</td><td class="py-2 px-3">' + badge(o.status) + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + (o.status === 'pending' ? '<button onclick="approveOT(\'' + o.id + '\')" class="inline-btn text-xs bg-green-600 text-white px-2 py-1 rounded mr-1">✓</button><button onclick="rejectOT(\'' + o.id + '\')" class="inline-btn text-xs bg-red-600 text-white px-2 py-1 rounded">✕</button>' : '-') + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Approval Lembur</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Karyawan','Cabang','Tanggal','Jam','Alasan','Status','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.approveOT = id => {
  const o = state.overtimeRequests.find(x => x.id === id);
  if (!o) return;
  o.status = 'approved';
  o.approvedBy = state.currentUser.name;
  o.approvedAt = new Date().toISOString();
  audit('Approve lembur ' + id);
  persist();
  toast('Lembur ' + id + ' disetujui');
  go(state.currentUser.role === 'manager' ? 'mgr-ot' : 'hrd-ot');
};

window.rejectOT = id => {
  const o = state.overtimeRequests.find(x => x.id === id);
  if (!o) return;
  o.status = 'rejected';
  o.approvedBy = state.currentUser.name;
  audit('Reject lembur ' + id);
  persist();
  toast('Lembur ditolak', 'warn');
  go(state.currentUser.role === 'manager' ? 'mgr-ot' : 'hrd-ot');
};

VIEWS['hrd-leave'] = () => {
  const rows = state.leaveRequests.map(l => {
    const e = empById(l.empId) || {};
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + l.id + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td><td class="py-2 px-3">' + branchName(l.branchId) + '</td>' +
      '<td class="py-2 px-3">' + l.type + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + fmtDate(l.startDate) + ' — ' + fmtDate(l.endDate) + '</td>' +
      '<td class="py-2 px-3">' + badge(l.status) + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + (l.status === 'pending' ? '<button onclick="approveLeave(\'' + l.id + '\')" class="inline-btn text-xs bg-green-600 text-white px-2 py-1 rounded mr-1">✓</button><button onclick="rejectLeave(\'' + l.id + '\')" class="inline-btn text-xs bg-red-600 text-white px-2 py-1 rounded">✕</button>' : '-') + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Approval Cuti/Izin</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Karyawan','Cabang','Tipe','Tanggal','Status','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.approveLeave = id => {
  const l = state.leaveRequests.find(x => x.id === id);
  if (!l) return;
  l.status = 'approved';
  l.approvedBy = state.currentUser.name;
  audit('Approve cuti ' + id);
  persist();
  toast('Cuti disetujui');
  go(state.currentUser.role === 'manager' ? 'mgr-leave' : 'hrd-leave');
};

window.rejectLeave = id => {
  const l = state.leaveRequests.find(x => x.id === id);
  if (!l) return;
  l.status = 'rejected';
  l.approvedBy = state.currentUser.name;
  audit('Reject cuti ' + id);
  persist();
  toast('Cuti ditolak', 'warn');
  go(state.currentUser.role === 'manager' ? 'mgr-leave' : 'hrd-leave');
};

VIEWS['hrd-report'] = () => {
  const perBranch = state.branches.map(b => {
    const emps = state.employees.filter(e => e.branchId === b.id);
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = state.attendances.filter(a => a.date === todayStr && emps.some(e => e.id === a.empId));
    const hadir = today.filter(a => a.status === 'hadir').length;
    const out = today.filter(a => a.outTime && a.outTime !== '-').length;
    const ot = state.overtimeRequests.filter(o => o.branchId === b.id && o.status === 'approved').reduce((s, o) => s + o.hours, 0);
    return { name: b.name, total: emps.length, hadir, out, ot, pct: emps.length ? Math.round(hadir / emps.length * 100) : 0 };
  });
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Laporan HR per Cabang</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4 overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Cabang','Karyawan','In','Out','%','Lembur']) +
    '<tbody>' + perBranch.map(b => '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + b.name + '</td>' +
      '<td class="py-2 px-3">' + b.total + '</td><td class="py-2 px-3">' + b.hadir + '</td><td class="py-2 px-3">' + b.out + '</td>' +
      '<td class="py-2 px-3">' + b.pct + '%</td><td class="py-2 px-3">' + b.ot + 'j</td></tr>').join('') +
    '</tbody></table></div>';
};

/* ============================================================
   FINANCE VIEWS
   ============================================================ */
VIEWS['fin-dash'] = () => {
  const runs = state.payrollRuns;
  const published = runs.filter(r => r.status === 'published');
  const total = published.reduce((s, p) => s + p.rows.reduce((a, r) => a + r.net, 0), 0);
  return '<h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-purple-900">Dashboard Finance</h2>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">' +
      statCard('Payroll Run', runs.length, '📋', 'bg-purple-50') +
      statCard('Published', published.length, '✅', 'bg-white') +
      statCard('Total Net', fmt(total), '💵', 'bg-yellow-50') +
      statCard('Karyawan', state.employees.length, '👥', 'bg-white') +
    '</div>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4 overflow-x-auto"><h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Payroll Runs</h3>' +
    '<table class="w-full text-sm">' + tableHead(['Periode','Status','Total Net','Published']) +
    '<tbody>' + runs.map(r => '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + r.period + '</td>' +
      '<td class="py-2 px-3">' + badge(r.status) + '</td>' +
      '<td class="py-2 px-3 text-right">' + fmt(r.rows.reduce((s, x) => s + x.net, 0)) + '</td>' +
      '<td class="py-2 px-3 text-xs text-slate-500">' + (r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('id-ID') : '-') + '</td></tr>').join('') +
    '</tbody></table></div>';
};

VIEWS['fin-payroll'] = () => {
  const cur = new Date().toISOString().slice(0, 7);
  const existing = state.payrollRuns.find(r => r.period === cur);
  if (existing) return renderPayrollDetail(existing);
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Payroll Run</h2>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-6 md:p-8 text-center">' +
      '<p class="text-slate-500 mb-2 text-sm">Belum ada payroll run untuk <b>' + cur + '</b>.</p>' +
      '<p class="text-xs text-slate-400 mb-4">Data dari absensi + lembur approved.</p>' +
      '<button onclick="runPayroll(\'' + cur + '\')" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium w-full md:w-auto shadow">▶ Jalankan Payroll</button>' +
    '</div>';
};

function renderPayrollDetail(pr) {
  const rows = pr.rows.map(r =>
    '<tr class="border-b border-purple-50 hover:bg-purple-50 cursor-pointer" onclick="viewPayrollRow(\'' + pr.id + '\',\'' + r.empId + '\')">' +
    '<td class="py-2 px-3 font-mono text-xs">' + r.empId + '</td><td class="py-2 px-3">' + r.name + '</td>' +
    '<td class="py-2 px-3 text-slate-600 text-xs">' + branchName(r.branchId) + '</td>' +
    '<td class="py-2 px-3 text-right">' + fmt(r.gross) + '</td>' +
    '<td class="py-2 px-3 text-right text-red-600">-' + fmt(r.deductions) + '</td>' +
    '<td class="py-2 px-3 text-right font-semibold">' + fmt(r.net) + '</td></tr>'
  ).join('');
  const totalNet = pr.rows.reduce((s, r) => s + r.net, 0);
  const totalGross = pr.rows.reduce((s, r) => s + r.gross, 0);
  const totalDed = pr.rows.reduce((s, r) => s + r.deductions, 0);
  const actions = pr.status === 'draft'
    ? '<button onclick="finalizePayroll(\'' + pr.id + '\')" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm w-full md:w-auto">🔒 Finalize</button>'
    : (pr.status === 'finalized'
      ? '<button onclick="publishPayroll(\'' + pr.id + '\')" class="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto">📤 Publish</button>'
      : '<span class="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm inline-block">✓ Published</span>');
  return '<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">' +
    '<h2 class="text-lg md:text-xl font-bold text-purple-900">Payroll — ' + pr.period + '</h2>' +
    '<div class="flex gap-2 items-center flex-wrap">' + badge(pr.status) + actions + '</div></div>' +
    '<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">' +
      '<div class="bg-white border border-purple-100 p-3 rounded-lg shadow-sm"><p class="text-xs text-slate-500">Gross</p><p class="text-base md:text-lg font-bold text-purple-900">' + fmt(totalGross) + '</p></div>' +
      '<div class="bg-white border border-purple-100 p-3 rounded-lg shadow-sm"><p class="text-xs text-slate-500">Potongan</p><p class="text-base md:text-lg font-bold text-red-600">-' + fmt(totalDed) + '</p></div>' +
      '<div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg shadow-sm"><p class="text-xs text-slate-500">Net</p><p class="text-base md:text-lg font-bold text-purple-900">' + fmt(totalNet) + '</p></div>' +
    '</div>' +
    '<p class="text-xs text-slate-500 mb-2">💡 Tap baris untuk slip gaji.</p>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto max-h-[60vh]"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Cabang','Gross','Potongan','Net']) + '<tbody>' + rows + '</tbody></table></div>';
}

window.runPayroll = period => {
  const run = {
    id: 'PR-' + period,
    period,
    rows: computeRowsForPeriod(state, period),
    status: 'draft',
    createdBy: state.currentUser.name,
    createdAt: new Date().toISOString(),
    finalizedAt: null,
    publishedAt: null,
  };
  state.payrollRuns.push(run);
  audit('Run payroll ' + period);
  persist();
  toast('Payroll run dibuat');
  go('fin-payroll');
};

window.finalizePayroll = id => {
  const pr = state.payrollRuns.find(r => r.id === id);
  if (!pr || pr.status !== 'draft') return;
  pr.status = 'finalized';
  pr.finalizedAt = new Date().toISOString();
  audit('Finalize payroll ' + pr.period);
  persist();
  toast('Payroll difinalisasi');
  go('fin-payroll');
};

window.publishPayroll = id => {
  const pr = state.payrollRuns.find(r => r.id === id);
  if (!pr || pr.status !== 'finalized') return;
  pr.status = 'published';
  pr.publishedAt = new Date().toISOString();
  audit('Publish payslip ' + pr.period);
  persist();
  toast('✓ Payslip dipublish');
  go('fin-payroll');
};

window.viewPayrollRow = (prId, empId) => {
  const pr = state.payrollRuns.find(r => r.id === prId);
  const r = pr.rows.find(x => x.empId === empId);
  if (r) openModal(renderPayslip(pr, r));
};

function renderPayslip(pr, r) {
  return '<div class="border-b border-purple-100 pb-3 mb-3 flex items-center gap-2">' +
    '<span class="text-2xl">🐾</span><div><h3 class="font-bold text-base md:text-lg leading-none text-purple-900">Klinik Satwagia</h3>' +
    '<p class="text-xs text-slate-500">Slip Gaji — ' + pr.period + '</p></div></div>' +
    '<div class="grid grid-cols-2 gap-2 text-xs md:text-sm mb-3">' +
      '<div><span class="text-slate-500">Nama:</span> <b>' + r.name + '</b></div><div><span class="text-slate-500">ID:</span> ' + r.empId + '</div>' +
      '<div><span class="text-slate-500">Jabatan:</span> ' + r.position + '</div><div><span class="text-slate-500">Cabang:</span> ' + branchName(r.branchId) + '</div>' +
      '<div class="col-span-2"><span class="text-slate-500">Rek:</span> ' + r.bankName + ' · ' + r.bankAccount + '</div></div>' +
    '<table class="w-full text-xs md:text-sm mb-3">' +
      '<tr><td class="py-1">Gaji Pokok</td><td class="text-right py-1">' + fmt(r.base) + '</td></tr>' +
      '<tr><td class="py-1">Tunjangan</td><td class="text-right py-1">' + fmt(r.allowance) + '</td></tr>' +
      '<tr><td class="py-1">Lembur (' + r.otHours + 'j)</td><td class="text-right py-1">' + fmt(r.overtimePay) + '</td></tr>' +
      '<tr class="border-t border-purple-100"><td class="font-semibold pt-2">Gross</td><td class="text-right font-semibold pt-2">' + fmt(r.gross) + '</td></tr>' +
      '<tr><td class="text-red-600 py-1">Telat (' + r.lateMinutes + 'm)</td><td class="text-right text-red-600 py-1">-' + fmt(r.lateDeduction) + '</td></tr>' +
      '<tr><td class="text-red-600 py-1">Alpha (' + r.alpha + 'h)</td><td class="text-right text-red-600 py-1">-' + fmt(r.absenceDeduction) + '</td></tr>' +
      '<tr><td class="text-red-600 py-1">BPJS</td><td class="text-right text-red-600 py-1">-' + fmt(r.bpjs) + '</td></tr>' +
      '<tr><td class="text-red-600 py-1">PPh 21</td><td class="text-right text-red-600 py-1">-' + fmt(r.pph21) + '</td></tr>' +
      '<tr class="border-t border-purple-100"><td class="font-bold pt-2 text-purple-900">Take Home</td><td class="text-right font-bold pt-2 text-purple-700">' + fmt(r.net) + '</td></tr></table>' +
    '<p class="text-xs text-slate-500 mb-3">Status: ' + badge(pr.status) + (pr.publishedAt ? ' · ' + new Date(pr.publishedAt).toLocaleString('id-ID') : '') + '</p>' +
    '<div class="flex gap-2 no-print sticky bottom-0 bg-white pt-2 -mx-4 md:-mx-6 px-4 md:px-6 pb-1">' +
      '<button onclick="window.print()" class="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm">🖨️ Cetak</button>' +
      '<button onclick="closeModal()" class="flex-1 bg-slate-200 py-2.5 rounded-lg text-sm">Tutup</button></div>';
}

VIEWS['fin-publish'] = () => {
  const runs = state.payrollRuns.filter(r => r.status === 'finalized' || r.status === 'published');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Publish Payslip</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3">Publish setelah finalize.</p>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Periode','Status','Karyawan','Aksi']) + '<tbody>' +
    runs.map(r => '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + r.period + '</td>' +
      '<td class="py-2 px-3">' + badge(r.status) + '</td><td class="py-2 px-3">' + r.rows.length + '</td>' +
      '<td class="py-2 px-3">' + (r.status === 'finalized'
        ? '<button onclick="publishPayroll(\'' + r.id + '\')" class="inline-btn text-xs bg-yellow-400 text-purple-900 px-3 py-1.5 rounded font-semibold">Publish</button>'
        : '<span class="text-xs text-green-600">✓ Done</span>') + '</td></tr>').join('') +
    '</tbody></table></div>';
};

VIEWS['fin-bank'] = () => {
  const runs = state.payrollRuns.filter(r => r.status === 'finalized' || r.status === 'published');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Bank File / Transfer</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3">Download CSV untuk transfer bank.</p>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Periode','Status','Total','Aksi']) + '<tbody>' +
    runs.map(r => '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + r.period + '</td>' +
      '<td class="py-2 px-3">' + badge(r.status) + '</td>' +
      '<td class="py-2 px-3 text-right">' + fmt(r.rows.reduce((s, x) => s + x.net, 0)) + '</td>' +
      '<td class="py-2 px-3"><button onclick="downloadBankFile(\'' + r.id + '\')" class="inline-btn text-xs bg-purple-600 text-white px-3 py-1.5 rounded whitespace-nowrap">⬇️ CSV</button></td></tr>').join('') +
    '</tbody></table></div>';
};

window.downloadBankFile = prId => {
  const pr = state.payrollRuns.find(r => r.id === prId);
  if (!pr) return;
  const rows = [['No','Bank','No Rekening','Nama','Nominal','Berita']];
  pr.rows.forEach((r, i) => rows.push([i + 1, r.bankName, r.bankAccount, r.name, r.net, 'Gaji ' + pr.period]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'payroll-' + pr.period + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  audit('Download bank file ' + pr.period);
  toast('CSV diunduh');
};

VIEWS['fin-report'] = () => {
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Laporan Payroll</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Periode','Status','Gross','Potongan','Net','Published']) + '<tbody>' +
    state.payrollRuns.map(r => {
      const g = r.rows.reduce((s, x) => s + x.gross, 0);
      const d = r.rows.reduce((s, x) => s + x.deductions, 0);
      const n = r.rows.reduce((s, x) => s + x.net, 0);
      return '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + r.period + '</td>' +
        '<td class="py-2 px-3">' + badge(r.status) + '</td>' +
        '<td class="py-2 px-3 text-right">' + fmt(g) + '</td>' +
        '<td class="py-2 px-3 text-right text-red-600">-' + fmt(d) + '</td>' +
        '<td class="py-2 px-3 text-right font-semibold">' + fmt(n) + '</td>' +
        '<td class="py-2 px-3 text-xs text-slate-500">' + (r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('id-ID') : '-') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
};

/* ============================================================
   MANAGER VIEWS
   ============================================================ */
function mgrBranch() { return state.currentUser.branchId; }
function mgrEmps() { return state.employees.filter(e => e.branchId === mgrBranch()); }

VIEWS['mgr-dash'] = () => {
  const br = mgrBranch();
  const emps = mgrEmps();
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = state.attendances.filter(a => a.date === todayStr && emps.some(e => e.id === a.empId));
  const pendOT = state.overtimeRequests.filter(o => o.branchId === br && o.status === 'pending');
  const pendLV = state.leaveRequests.filter(l => l.branchId === br && l.status === 'pending');
  return '<h2 class="text-lg md:text-xl font-bold mb-1 text-purple-900">' + branchName(br) + '</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">Manager: ' + state.currentUser.name + '</p>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">' +
      statCard('Tim Saya', emps.length, '👥', 'bg-purple-50') +
      statCard('Hadir Hari Ini', today.filter(a => a.status === 'hadir').length, '✅', 'bg-white') +
      statCard('Pending Lembur', pendOT.length, '🕒', 'bg-yellow-50') +
      statCard('Pending Cuti', pendLV.length, '📝', 'bg-white') +
    '</div>';
};

VIEWS['mgr-att'] = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const emps = mgrEmps();
  const todays = state.attendances.filter(a => a.date === todayStr && emps.some(e => e.id === a.empId));
  const rows = todays.map(a => {
    const e = empById(a.empId);
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + a.empId + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td>' +
      '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'in', a.selfieData) + '</td>' +
      '<td class="py-2 px-3 font-mono">' + a.inTime + '</td>' +
      '<td class="py-2 px-3 font-mono">' + (a.outTime === '-' ? '—' : a.outTime) + '</td>' +
      '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'out', a.outSelfieData) + '</td>' +
      '<td class="py-2 px-3">' + badge(a.status) + (a.lateMinutes ? ' (' + a.lateMinutes + 'm)' : '') + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Absensi ' + branchName(mgrBranch()) + '</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Foto In','In','Out','Foto Out','Status']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['mgr-ot'] = () => {
  const br = mgrBranch();
  const rows = state.overtimeRequests.filter(o => o.branchId === br).map(o => {
    const e = empById(o.empId);
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + o.id + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td><td class="py-2 px-3">' + fmtDate(o.date) + '</td>' +
      '<td class="py-2 px-3">' + o.hours + 'j</td><td class="py-2 px-3">' + badge(o.status) + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + (o.status === 'pending' ? '<button onclick="approveOT(\'' + o.id + '\')" class="inline-btn text-xs bg-green-600 text-white px-2 py-1 rounded mr-1">✓</button><button onclick="rejectOT(\'' + o.id + '\')" class="inline-btn text-xs bg-red-600 text-white px-2 py-1 rounded">✕</button>' : '-') + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Approval Lembur — ' + branchName(br) + '</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Karyawan','Tanggal','Jam','Status','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['mgr-leave'] = () => {
  const br = mgrBranch();
  const rows = state.leaveRequests.filter(l => l.branchId === br).map(l => {
    const e = empById(l.empId);
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + l.id + '</td>' +
      '<td class="py-2 px-3">' + e.name + '</td><td class="py-2 px-3">' + l.type + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + fmtDate(l.startDate) + '</td>' +
      '<td class="py-2 px-3">' + badge(l.status) + '</td>' +
      '<td class="py-2 px-3 whitespace-nowrap">' + (l.status === 'pending' ? '<button onclick="approveLeave(\'' + l.id + '\')" class="inline-btn text-xs bg-green-600 text-white px-2 py-1 rounded mr-1">✓</button><button onclick="rejectLeave(\'' + l.id + '\')" class="inline-btn text-xs bg-red-600 text-white px-2 py-1 rounded">✕</button>' : '-') + '</td></tr>';
  }).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Approval Cuti — ' + branchName(br) + '</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Karyawan','Tipe','Mulai','Status','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['mgr-team'] = () => {
  const emps = mgrEmps();
  const rows = emps.map(e =>
    '<tr class="border-b border-purple-50 hover:bg-purple-50 cursor-pointer" onclick="viewEmpDetail(\'' + e.id + '\')">' +
    '<td class="py-2 px-3 font-mono text-xs">' + e.id + '</td><td class="py-2 px-3">' + e.name + '</td>' +
    '<td class="py-2 px-3 text-slate-600 text-xs">' + e.position + '</td>' +
    '<td class="py-2 px-3 text-xs">' + e.bankName + ' · ' + e.bankAccount + '</td></tr>'
  ).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Tim Saya (' + emps.length + ')</h2>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Nama','Jabatan','Rek']) + '<tbody>' + rows + '</tbody></table></div>';
};

/* ============================================================
   EMPLOYEE VIEWS
   ============================================================ */
function me() { return empById(state.currentUser.employeeId); }

VIEWS['emp-dash'] = () => {
  const e = me();
  const todayStr = new Date().toISOString().slice(0, 10);
  const att = state.attendances.find(a => a.empId === e.id && a.date === todayStr);
  const myOT = state.overtimeRequests.filter(o => o.empId === e.id);
  const myLV = state.leaveRequests.filter(l => l.empId === e.id);
  const myPayslips = state.payrollRuns.filter(r => r.status === 'published' && r.rows.some(x => x.empId === e.id));
  const statusHariIni = !att ? 'Belum Absen' : (att.outTime === '-' ? 'Clock In' : 'Selesai');
  return '<h2 class="text-lg md:text-xl font-bold mb-1 text-purple-900">Hai, ' + e.name.split(' ')[0] + ' 👋</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">' + e.position + ' · ' + branchName(e.branchId) + '</p>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">' +
      statCard('Hari Ini', statusHariIni, '⏰', att ? 'bg-purple-50' : 'bg-yellow-50') +
      statCard('Lembur', myOT.length, '🕒', 'bg-white') +
      statCard('Cuti/Izin', myLV.length, '📝', 'bg-purple-50') +
      statCard('Slip Gaji', myPayslips.length, '💵', 'bg-yellow-50') +
    '</div>' +
    '<div class="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">' +
      '<p class="text-xs font-semibold text-purple-800 mb-1">📋 Jobdesc Saya — ' + e.position + '</p>' +
      '<p class="text-xs md:text-sm text-slate-700 leading-relaxed">' + e.jobdesc + '</p></div>' +
    '<div class="grid md:grid-cols-2 gap-3 md:gap-4">' +
      '<div class="bg-white border border-purple-100 rounded-xl p-3 md:p-4 shadow-sm"><h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Slip Gaji Terbaru</h3>' +
        (myPayslips.length ? myPayslips.slice(-1).map(pr => {
          const r = pr.rows.find(x => x.empId === e.id);
          return '<div class="text-sm"><p class="text-xs text-slate-500">Periode <b>' + pr.period + '</b></p><p class="text-xl md:text-2xl font-bold text-purple-700 mt-1">' + fmt(r.net) + '</p>' +
            '<button onclick="viewMyPayslip(\'' + pr.id + '\')" class="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg">Lihat Slip</button></div>';
        }).join('') : '<p class="text-sm text-slate-400">Belum ada slip.</p>') + '</div>' +
      '<div class="bg-white border border-purple-100 rounded-xl p-3 md:p-4 shadow-sm"><h3 class="font-semibold mb-2 text-sm md:text-base text-purple-900">Request Terakhir</h3>' +
        '<ul class="text-xs md:text-sm space-y-1.5">' +
        [...myOT.slice(-2).map(o => '<li class="flex justify-between gap-2"><span>🕒 Lembur ' + o.hours + 'j · ' + fmtDate(o.date) + '</span>' + badge(o.status) + '</li>'),
         ...myLV.slice(-2).map(l => '<li class="flex justify-between gap-2"><span>📝 ' + l.type + ' · ' + fmtDate(l.startDate) + '</span>' + badge(l.status) + '</li>')].join('') ||
        '<li class="text-slate-400">Belum ada request</li></ul></div></div>';
};

VIEWS['emp-clock'] = () => {
  const e = me();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAtt = state.attendances.find(a => a.empId === e.id && a.date === todayStr);
  const last7 = state.attendances.filter(a => a.empId === e.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);

  let statusBox;
  if (!todayAtt) {
    statusBox = '<div class="bg-white border-2 border-dashed border-purple-300 rounded-xl p-5 mb-4 text-center">' +
      '<p class="text-sm text-slate-600 mb-3">Anda belum absen hari ini</p>' +
      '<button onclick="startClockCapture(\'in\')" class="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-3.5 rounded-xl font-semibold text-base shadow-lg">📸 Clock In Sekarang</button>' +
      '<p class="text-xs text-slate-400 mt-2">Selfie + GPS otomatis</p></div>';
  } else if (!todayAtt.outTime || todayAtt.outTime === '-') {
    statusBox = '<div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<div class="flex items-center gap-2">' +
          (todayAtt.selfieData ? '<img src="' + todayAtt.selfieData + '" class="w-12 h-12 rounded-lg object-cover border-2 border-purple-300 cursor-pointer" onclick="showAttendancePhoto(\'' + todayAtt.id + '\',\'in\')">' : '<div class="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center text-xs text-purple-600">No 📷</div>') +
          '<div><p class="text-xs text-slate-600">Clock In</p><p class="font-bold text-purple-800 text-lg">' + todayAtt.inTime + '</p></div></div>' +
        '<div class="text-right"><p class="text-xs text-slate-600">Clock Out</p><p class="font-bold text-slate-400">Belum</p></div></div>' +
      '<button onclick="startClockCapture(\'out\')" class="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-purple-900 py-3.5 rounded-xl font-bold text-base shadow-lg">🚪 Clock Out Sekarang</button>' +
      '<p class="text-xs text-slate-500 mt-2 text-center">Selfie + GPS otomatis</p></div>';
  } else {
    statusBox = '<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<div class="flex items-center gap-2">' +
          (todayAtt.selfieData ? '<img src="' + todayAtt.selfieData + '" class="w-12 h-12 rounded-lg object-cover border-2 border-green-300 cursor-pointer" onclick="showAttendancePhoto(\'' + todayAtt.id + '\',\'in\')">' : '<div class="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center text-xs">✓</div>') +
          '<div><p class="text-xs text-slate-600">Clock In</p><p class="font-bold text-green-700 text-lg">' + todayAtt.inTime + '</p></div></div>' +
        '<div class="flex items-center gap-2">' +
          '<div class="text-right"><p class="text-xs text-slate-600">Clock Out</p><p class="font-bold text-green-700 text-lg">' + todayAtt.outTime + '</p></div>' +
          (todayAtt.outSelfieData ? '<img src="' + todayAtt.outSelfieData + '" class="w-12 h-12 rounded-lg object-cover border-2 border-green-300 cursor-pointer" onclick="showAttendancePhoto(\'' + todayAtt.id + '\',\'out\')">' : '') +
        '</div></div>' +
      '<p class="text-center text-sm text-green-700 font-medium">✓ Absensi hari ini selesai</p></div>';
  }

  const rows = last7.map(a =>
    '<tr class="border-b border-purple-50"><td class="py-2 px-3 whitespace-nowrap">' + fmtDate(a.date) + '</td>' +
    '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'in', a.selfieData) + '</td>' +
    '<td class="py-2 px-3 font-mono">' + a.inTime + '</td>' +
    '<td class="py-2 px-3 font-mono">' + (a.outTime === '-' ? '—' : a.outTime) + '</td>' +
    '<td class="py-2 px-3 text-center">' + photoThumb(a.id, 'out', a.outSelfieData) + '</td>' +
    '<td class="py-2 px-3">' + badge(a.status) + (a.lateMinutes ? ' (' + a.lateMinutes + 'm)' : '') + '</td></tr>'
  ).join('');
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Absensi Saya</h2>' + statusBox + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Tanggal','Foto In','In','Out','Foto Out','Status']) + '<tbody>' + rows + '</tbody></table></div>';
};

VIEWS['emp-ot'] = () => {
  const e = me();
  const myOT = state.overtimeRequests.filter(o => o.empId === e.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = myOT.map(o =>
    '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + o.id + '</td>' +
    '<td class="py-2 px-3 whitespace-nowrap">' + fmtDate(o.date) + '</td>' +
    '<td class="py-2 px-3">' + o.hours + 'j</td><td class="py-2 px-3 text-xs">' + o.reason + '</td>' +
    '<td class="py-2 px-3">' + badge(o.status) + '</td></tr>'
  ).join('') || '<tr><td colspan="5" class="py-4 text-center text-slate-400 text-sm">Belum ada pengajuan.</td></tr>';
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Ajukan Lembur</h2>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4 mb-4">' +
      '<h3 class="font-semibold mb-3 text-xs md:text-sm text-purple-900">Form Pengajuan</h3>' +
      '<div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 text-sm">' +
        '<div class="col-span-2 md:col-span-1"><label class="text-xs text-slate-600 font-medium">Tanggal</label><input id="otDate" type="date" value="' + new Date().toISOString().slice(0, 10) + '" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
        '<div><label class="text-xs text-slate-600 font-medium">Jam</label><input id="otHours" type="number" step="0.5" min="0.5" value="2" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
        '<div class="col-span-2 md:col-span-3"><label class="text-xs text-slate-600 font-medium">Alasan</label><input id="otReason" type="text" placeholder="Contoh: extra shift" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div></div>' +
      '<button onclick="submitOT()" class="mt-3 w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow">Ajukan Lembur</button></div>' +
    scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Tanggal','Jam','Alasan','Status']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.submitOT = () => {
  const e = me();
  const h = parseFloat(document.getElementById('otHours').value);
  const date = document.getElementById('otDate').value;
  const reason = document.getElementById('otReason').value || '-';
  if (!date || !h) { toast('Lengkapi form', 'err'); return; }
  const newId = 'OT' + String(state.overtimeRequests.length + 1).padStart(3, '0');
  state.overtimeRequests.push({
    id: newId, empId: e.id, branchId: e.branchId,
    date, hours: h, reason, status: 'pending',
    approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(),
  });
  audit('Ajukan lembur ' + newId);
  persist();
  toast('Lembur diajukan');
  go('emp-ot');
};

VIEWS['emp-leave'] = () => {
  const e = me();
  const myLV = state.leaveRequests.filter(l => l.empId === e.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = myLV.map(l =>
    '<tr class="border-b border-purple-50"><td class="py-2 px-3 font-mono text-xs">' + l.id + '</td>' +
    '<td class="py-2 px-3">' + l.type + '</td><td class="py-2 px-3 text-xs whitespace-nowrap">' + fmtDate(l.startDate) + '</td>' +
    '<td class="py-2 px-3 text-xs">' + l.reason + '</td><td class="py-2 px-3">' + badge(l.status) + '</td></tr>'
  ).join('') || '<tr><td colspan="5" class="py-4 text-center text-slate-400 text-sm">Belum ada pengajuan.</td></tr>';
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Ajukan Cuti / Izin</h2>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-4 mb-4">' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-sm">' +
        '<div class="col-span-2 md:col-span-1"><label class="text-xs text-slate-600 font-medium">Tipe</label><select id="lvType" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"><option>cuti</option><option>izin</option><option>sakit</option></select></div>' +
        '<div><label class="text-xs text-slate-600 font-medium">Mulai</label><input id="lvStart" type="date" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
        '<div><label class="text-xs text-slate-600 font-medium">Selesai</label><input id="lvEnd" type="date" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div>' +
        '<div class="col-span-2 md:col-span-1"><label class="text-xs text-slate-600 font-medium">Alasan</label><input id="lvReason" type="text" class="w-full border border-purple-200 rounded-lg px-3 py-2 mt-1"></div></div>' +
      '<button onclick="submitLeave()" class="mt-3 w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow">Ajukan</button></div>' +
    scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['ID','Tipe','Tanggal','Alasan','Status']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.submitLeave = () => {
  const e = me();
  const type = document.getElementById('lvType').value;
  const start = document.getElementById('lvStart').value;
  const end = document.getElementById('lvEnd').value;
  const reason = document.getElementById('lvReason').value || '-';
  if (!start || !end) { toast('Lengkapi tanggal', 'err'); return; }
  const newId = 'LV' + String(state.leaveRequests.length + 1).padStart(3, '0');
  state.leaveRequests.push({
    id: newId, empId: e.id, branchId: e.branchId,
    type, startDate: start, endDate: end, reason,
    status: 'pending', approvedBy: null, createdAt: new Date().toISOString(),
  });
  audit('Ajukan ' + type + ' ' + newId);
  persist();
  toast('Pengajuan dikirim');
  go('emp-leave');
};

VIEWS['emp-payslip'] = () => {
  const e = me();
  const myRuns = state.payrollRuns.filter(r => r.status === 'published' && r.rows.some(x => x.empId === e.id));
  const rows = myRuns.map(r => {
    const row = r.rows.find(x => x.empId === e.id);
    return '<tr class="border-b border-purple-50"><td class="py-2 px-3">' + r.period + '</td>' +
      '<td class="py-2 px-3 text-right">' + fmt(row.gross) + '</td>' +
      '<td class="py-2 px-3 text-right text-red-600">-' + fmt(row.deductions) + '</td>' +
      '<td class="py-2 px-3 text-right font-semibold">' + fmt(row.net) + '</td>' +
      '<td class="py-2 px-3"><button onclick="viewMyPayslip(\'' + r.id + '\')" class="inline-btn text-xs bg-purple-600 text-white px-3 py-1.5 rounded whitespace-nowrap">Lihat</button></td></tr>';
  }).join('') || '<tr><td colspan="5" class="py-4 text-center text-slate-400 text-sm">Belum ada slip.</td></tr>';
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Slip Gaji Saya</h2>' +
    '<p class="text-xs md:text-sm text-slate-500 mb-3">Terbit setelah finance publish.</p>' + scrollHint() +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">' +
    tableHead(['Periode','Gross','Potongan','Net','Aksi']) + '<tbody>' + rows + '</tbody></table></div>';
};

window.viewMyPayslip = prId => {
  const pr = state.payrollRuns.find(r => r.id === prId);
  if (!pr) return;
  const row = pr.rows.find(x => x.empId === me().id);
  if (!row) return;
  openModal(renderPayslip(pr, row));
};

VIEWS['emp-profile'] = () => {
  const e = me();
  return '<h2 class="text-lg md:text-xl font-bold mb-3 text-purple-900">Profil Saya</h2>' +
    '<div class="bg-white border border-purple-100 rounded-xl shadow-sm p-3 md:p-6 max-w-xl mb-4">' +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 text-sm">' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">ID:</span> <b class="text-purple-700">' + e.id + '</b></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Nama:</span> <b>' + e.name + '</b></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Jabatan:</span> <span>' + e.position + '</span></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Cabang:</span> <span>' + branchName(e.branchId) + '</span></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Gaji Pokok:</span> <span>' + fmt(e.base) + '</span></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Tunjangan:</span> <span>' + fmt(e.allowance) + '</span></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">Bank:</span> <span>' + e.bankName + '</span></div>' +
        '<div class="flex justify-between md:block border-b md:border-0 border-purple-50 pb-2 md:pb-0"><span class="text-slate-500">No Rek:</span> <span class="font-mono text-xs">' + e.bankAccount + '</span></div>' +
        '<div class="flex justify-between md:block"><span class="text-slate-500">Masuk:</span> <span>' + fmtDate(e.joinedAt) + '</span></div>' +
        '<div class="flex justify-between md:block"><span class="text-slate-500">Status:</span> ' + badge(e.status) + '</div></div></div>' +
    '<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 max-w-xl">' +
      '<p class="text-xs font-semibold text-purple-900 mb-1">📋 Jobdesc Saya</p>' +
      '<p class="text-sm text-slate-700 leading-relaxed">' + e.jobdesc + '</p></div>';
};

/* ============================================================
   MODAL DETAIL KARYAWAN
   ============================================================ */
window.viewEmpDetail = empId => {
  const e = empById(empId);
  if (!e) return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAtt = state.attendances.find(a => a.empId === e.id && a.date === todayStr);
  const myOT = state.overtimeRequests.filter(o => o.empId === e.id && o.status === 'approved').reduce((s, o) => s + o.hours, 0);
  const myPayslip = state.payrollRuns.filter(r => r.status === 'published' && r.rows.some(x => x.empId === e.id)).slice(-1)[0];
  openModal(
    '<div class="flex items-start justify-between gap-3 mb-3">' +
      '<div class="flex items-center gap-2"><span class="text-2xl">🐾</span>' +
        '<div><h3 class="font-bold text-base md:text-lg leading-none text-purple-900">' + e.name + '</h3>' +
        '<p class="text-xs text-slate-500">' + e.id + ' · ' + e.position + '</p></div></div>' +
      '<button onclick="closeModal()" class="p-1 rounded hover:bg-purple-50"><svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>' +
    '<div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">' +
      '<p class="text-xs font-semibold text-purple-800 mb-1">📋 Jobdesc — ' + e.position + '</p>' +
      '<p class="text-sm text-slate-700 leading-relaxed">' + e.jobdesc + '</p></div>' +
    '<div class="grid grid-cols-2 gap-2 text-sm mb-3">' +
      '<div><span class="text-slate-500">Cabang:</span> ' + branchName(e.branchId) + '</div>' +
      '<div><span class="text-slate-500">Status:</span> ' + badge(e.status) + '</div>' +
      '<div><span class="text-slate-500">Gaji:</span> ' + fmt(e.base) + '</div>' +
      '<div><span class="text-slate-500">Tunjangan:</span> ' + fmt(e.allowance) + '</div>' +
      '<div class="col-span-2"><span class="text-slate-500">Rekening:</span> ' + e.bankName + ' · ' + e.bankAccount + '</div>' +
      '<div class="col-span-2"><span class="text-slate-500">Masuk:</span> ' + fmtDate(e.joinedAt) + '</div></div>' +
    '<div class="grid grid-cols-3 gap-2 text-center text-xs mb-3">' +
      '<div class="bg-purple-50 p-2 rounded-lg"><p class="text-slate-500">Hari ini</p><p class="font-bold text-purple-700">' + (todayAtt ? todayAtt.status : 'belum') + '</p></div>' +
      '<div class="bg-yellow-50 p-2 rounded-lg"><p class="text-slate-500">Lembur</p><p class="font-bold text-purple-700">' + myOT + ' jam</p></div>' +
      '<div class="bg-purple-50 p-2 rounded-lg"><p class="text-slate-500">Slip</p><p class="font-bold text-purple-700">' + (myPayslip ? 'Ada' : '—') + '</p></div></div>' +
    '<button onclick="closeModal()" class="w-full bg-slate-200 py-2.5 rounded-lg">Tutup</button>'
  );
};

/* ============================================================
   BOOT
   ============================================================ */
state = loadState();
if (state.currentUser) { showApp(); }
document.getElementById('inPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});