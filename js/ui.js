// ─── Navigation ───────────────────────────────────────────────
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function leaveGame() {
  stopTimer();
  clearInterval(App.pollIv);
  document.getElementById('win-overlay').style.display = 'none';
  goTo('screen-landing');
}

// ─── Toast ────────────────────────────────────────────────────
let _toastTm = null;
function showToast(msg, duration = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTm);
  _toastTm = setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Stars ────────────────────────────────────────────────────
function initStars() {
  const c  = document.getElementById('stars-canvas');
  const cx = c.getContext('2d');
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: 150 }, () => ({
    px: Math.random(), py: Math.random(),
    r:  Math.random() * 1.5 + 0.3,
    a:  Math.random(),
    da: (Math.random() - 0.5) * 0.007,
  }));
  const draw = () => {
    cx.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      s.a = Math.max(0.1, Math.min(1, s.a + s.da));
      if (s.a <= 0.1 || s.a >= 1) s.da *= -1;
      cx.beginPath();
      cx.arc(s.px * c.width, s.py * c.height, s.r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(255,255,255,${s.a})`;
      cx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
}

// ─── Roles Info Page ──────────────────────────────────────────
function renderRolesInfo() {
  const grid = document.getElementById('roles-info-grid');
  if (!grid) return;
  const colorMap = { wolf: 'wolf-c', village: 'vill-c', special: 'sp-c', neutral: 'neu-c' };
  grid.innerHTML = ROLES.map(r => `
    <div class="role-card ${colorMap[r.color] || ''}">
      <div class="rc-icon">${r.icon}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-desc">${r.desc}</div>
      ${r.tip ? `<div class="rc-tip">💡 ${r.tip}</div>` : ''}
    </div>`).join('');
}

// ─── Waiting Room ─────────────────────────────────────────────
function renderWaitingRoom(room) {
  const myId = App.myId;
  document.getElementById('wr-room-name').textContent  = room.name;
  document.getElementById('wr-room-id').textContent    = room.id;
  document.getElementById('wr-count').textContent      = room.players.length;
  document.getElementById('wr-max').textContent        = room.maxPlayers;

  const isHost = room.host === myId;
  document.getElementById('wr-host-ctrl').style.display  = isHost ? 'block' : 'none';
  document.getElementById('wr-guest-msg').style.display  = isHost ? 'none'  : 'block';

  if (isHost) {
    document.getElementById('wr-max-sel').value = room.maxPlayers;
    const ready = room.players.length >= room.maxPlayers;
    const btn   = document.getElementById('wr-start-btn');
    btn.disabled    = !ready;
    btn.textContent = ready
      ? '🎮 Bắt đầu game!'
      : `⏳ Chờ thêm ${room.maxPlayers - room.players.length} người...`;
  }

  const slots = document.getElementById('wr-player-slots');
  slots.innerHTML = '';
  for (let i = 0; i < room.maxPlayers; i++) {
    const p   = room.players[i];
    const div = document.createElement('div');
    if (p) {
      div.className = 'p-slot' + (p.id === myId ? ' me' : '');
      div.innerHTML = `<div class="ps-avatar">🙂</div>
        <div class="ps-name">${esc(p.name)}</div>
        ${p.id === myId ? '<div class="ps-me">Bạn</div>' : ''}`;
    } else {
      div.className = 'p-slot empty';
      div.innerHTML = `<div class="ps-avatar">·</div><div class="ps-name">— trống —</div>`;
    }
    slots.appendChild(div);
  }
}

// ─── Reveal Screen ────────────────────────────────────────────
function renderRevealScreen(gs, myId) {
  const idx  = gs.revealIdx;
  const ps   = gs.players;
  const isMC = myId === gs.mcId;

  // Reset flip
  document.getElementById('flip-inner').classList.remove('flipped');
  App.revealFlipped = false;
  document.getElementById('rev-next-btn').style.display  = 'none';
  document.getElementById('rev-start-btn').style.display = 'none';
  document.getElementById('rev-mc-msg').style.display    = 'none';

  // Progress
  const pct = ps.length ? Math.round((idx / ps.length) * 100) : 0;
  document.getElementById('rev-prog-fill').style.width = pct + '%';
  document.getElementById('rev-count').textContent     = `${idx + 1} / ${ps.length}`;

  if (idx >= ps.length) {
    // Done
    document.getElementById('rev-who').textContent   = '';
    document.getElementById('rev-count').textContent = 'Tất cả đã xem xong!';
    if (isMC) {
      document.getElementById('rev-start-btn').style.display = 'block';
    } else {
      document.getElementById('rev-mc-msg').style.display = 'block';
      document.getElementById('rev-mc-msg').textContent   = '⏳ Chờ MC bắt đầu đêm...';
    }
    return;
  }

  const p = ps[idx];
  document.getElementById('rev-who').textContent      = `Lượt xem bài của:`;
  document.getElementById('rev-who-name').textContent = p.name;
  document.getElementById('card-pname').textContent   = p.name;

  // Card back
  const cb   = document.getElementById('card-back');
  const role = p.role;
  cb.className = 'card-face card-back' + (role.team === 'wolf' ? ' wolf' : '');
  document.getElementById('card-role-icon').textContent = role.icon;
  document.getElementById('card-role-name').textContent = role.name;
  document.getElementById('card-role-desc').textContent = role.desc;

  // Chỉ người có id tương ứng mới thấy nút lật
  if (myId === p.id) {
    // Người này tự lật
  } else if (isMC) {
    // MC không lật, chỉ chờ
  }
}

// ─── Game Board ───────────────────────────────────────────────
function renderGameBoard(gs, myId) {
  const grid  = document.getElementById('player-grid');
  const isMC  = myId === gs.mcId;
  const myP   = gs.players.find(p => p.id === myId);
  const myRole = myP?.role;

  grid.innerHTML = '';
  gs.players.forEach(p => {
    const div   = document.createElement('div');
    const votes = gs.votes?.[p.id] || 0;
    let cls = 'p-card';
    if (!p.alive) cls += ' dead';
    else if (gs.phase === 'day' && isMC) cls += ' clickable';

    // Xem vai: MC không thấy ai, người chơi thấy đồng bọn sói của mình
    const showRole = !isMC && myP && (
      p.id === myId ||
      (myRole?.team === 'wolf' && p.role.team === 'wolf')
    );
    const roleColor = p.role.color === 'wolf' ? 'var(--wolf)'
      : p.role.color === 'special' ? 'var(--special)'
      : p.role.color === 'neutral' ? 'var(--accent)'
      : 'var(--village)';

    div.className = cls;
    div.dataset.id = p.id;
    div.innerHTML = `
      <div class="pc-avatar">${p.alive ? (showRole ? p.role.icon : '🙂') : '💀'}</div>
      <div class="pc-name">${esc(p.name)}</div>
      ${p.id === myId ? '<div class="pc-me">Bạn</div>' : ''}
      ${showRole && p.alive ? `<div class="pc-role" style="color:${roleColor}">${p.role.name}</div>` : ''}
      ${isMC && p.alive ? `<div class="pc-role" style="color:${roleColor}">${p.role.name}</div>` : ''}
      ${votes > 0 ? `<div class="pc-votes">🗳 ${votes}</div>` : ''}
      ${!p.alive ? '<div class="pc-dead-badge">💀</div>' : ''}
      ${p.id === gs.mayorId && p.alive ? '<div class="pc-mayor">🎖️</div>' : ''}
    `;

    if (gs.phase === 'day' && p.alive && isMC) {
      div.addEventListener('click', () => {
        if (!gs.votes) gs.votes = {};
        gs.votes[p.id] = (gs.votes[p.id] || 0) + 1;
        saveRoom(App.room);
        renderGameBoard(gs, myId);
        showToast(`+1 phiếu → ${p.name} (${gs.votes[p.id]} phiếu)`);
        renderVoteInfo(gs);
      });
    }
    grid.appendChild(div);
  });
}

function renderVoteInfo(gs) {
  const box = document.getElementById('vote-info-box');
  if (!box) return;
  const sorted = Object.entries(gs.votes || {})
    .map(([id, v]) => ({ name: gs.players.find(p => p.id === id)?.name || id, v }))
    .sort((a, b) => b.v - a.v);
  if (!sorted.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  box.innerHTML = '<div class="vi-title">🗳️ Phiếu hiện tại:</div>' +
    sorted.map(e => `<div class="vi-row"><span>${esc(e.name)}</span><strong>${e.v} phiếu</strong></div>`).join('');
}

// ─── Night Panel ──────────────────────────────────────────────
function renderNightPanel(gs, myId) {
  const isMC   = myId === gs.mcId;
  const panel  = document.getElementById('night-panel');
  const stepsEl = document.getElementById('night-steps');
  const actsEl  = document.getElementById('night-acts');
  panel.style.display  = 'block';
  document.getElementById('day-panel').style.display = 'none';

  const alive     = gs.players.filter(p => p.alive);
  const nightRoles = ROLES
    .filter(r => r.hasNightAction)
    .sort((a, b) => a.nightOrder - b.nightOrder);

  if (isMC) {
    // MC thấy hướng dẫn gọi từng vai
    stepsEl.innerHTML = nightRoles.map(role => {
      const has = alive.some(p => p.role.id === role.id);
      return `<div class="n-step ${has ? 'active' : 'inactive'}">
        <span class="ns-icon">${role.icon}</span>
        <div>
          <div class="ns-title">${role.name} ${!has ? '(không có trong game)' : ''}</div>
          <div class="ns-desc">${role.nightDesc || '—'}</div>
        </div>
      </div>`;
    }).join('');

    actsEl.innerHTML = '';
    const btnEnd = document.createElement('button');
    btnEnd.className   = 'btn-action vill';
    btnEnd.textContent = '☀️ Kết thúc đêm → Sang ngày';
    btnEnd.onclick     = () => App.mcEndNight();
    actsEl.appendChild(btnEnd);

  } else {
    // Người chơi thấy hướng dẫn vai của mình
    const me = gs.players.find(p => p.id === myId);
    if (!me) return;
    stepsEl.innerHTML = '';
    actsEl.innerHTML  = '';

    if (!me.alive) {
      stepsEl.innerHTML = '<div class="n-step inactive"><div class="ns-title">💀 Bạn đã chết — Nhắm mắt, theo dõi game tiếp tục.</div></div>';
      return;
    }

    if (me.role.hasNightAction) {
      stepsEl.innerHTML = `<div class="n-step active">
        <span class="ns-icon">${me.role.icon}</span>
        <div>
          <div class="ns-title">${me.role.name} — Lượt của bạn!</div>
          <div class="ns-desc">${me.role.nightDesc}</div>
        </div>
      </div>`;
    } else {
      stepsEl.innerHTML = `<div class="n-step inactive">
        <span class="ns-icon">😴</span>
        <div>
          <div class="ns-title">${me.role.name} — Bạn nhắm mắt đêm nay.</div>
          <div class="ns-desc">Chờ MC thông báo sang ngày.</div>
        </div>
      </div>`;
    }

    // Wolf team thấy đồng bọn
    if (me.role.team === 'wolf') {
      const wolves = gs.players.filter(p => p.role.team === 'wolf' && p.id !== myId);
      if (wolves.length) {
        stepsEl.innerHTML += `<div class="n-step wolf-step">
          <span class="ns-icon">🐺</span>
          <div>
            <div class="ns-title">Đồng bọn của bạn:</div>
            <div class="ns-desc">${wolves.map(w => esc(w.name)).join(', ')}</div>
          </div>
        </div>`;
      }
    }
  }
}

// ─── Day Panel ────────────────────────────────────────────────
function renderDayPanel(gs, myId, nightResult) {
  const isMC   = myId === gs.mcId;
  const panel  = document.getElementById('day-panel');
  const announce = document.getElementById('day-announce');
  const actsEl   = document.getElementById('day-acts');
  panel.style.display  = 'block';
  document.getElementById('night-panel').style.display = 'none';

  let html = '';
  if (nightResult.killed.length > 0) {
    nightResult.killed.forEach(p => {
      html += `<div class="ann-death">💀 <strong>${esc(p.name)}</strong> đã chết trong đêm! Vai: ${p.role.name}</div>`;
      if (p.role.id === 'thoSan') {
        html += `<div class="ann-info">🏹 <strong>${esc(p.name)}</strong> là <strong>Thợ Săn</strong> — MC cho phép bắn 1 người!</div>`;
      }
    });
  } else {
    html += `<div class="ann-safe">✨ Đêm bình yên! Không ai chết đêm qua.</div>`;
  }
  if (nightResult.saved.length > 0) {
    html += `<div class="ann-info">💉 Có người đã được cứu trong đêm!</div>`;
  }

  if (isMC) {
    html += `<div class="ann-vote">Nhấn vào tên người chơi để cộng phiếu bỏ phiếu. Nhấn nhiều lần = nhiều phiếu.</div>`;
  } else {
    html += `<div class="ann-vote">Thảo luận và tìm Ma Sói. MC đang thu phiếu bầu.</div>`;
  }
  announce.innerHTML = html;

  actsEl.innerHTML = '';
  if (isMC) {
    const btnVote = document.createElement('button');
    btnVote.className   = 'btn-action vill';
    btnVote.textContent = '🗳 Xử lý phiếu bầu → Loại người';
    btnVote.onclick     = () => App.mcResolveVote();
    actsEl.appendChild(btnVote);

    const btnReset = document.createElement('button');
    btnReset.className   = 'btn-action';
    btnReset.textContent = '🔄 Reset phiếu';
    btnReset.onclick     = () => {
      gs.votes = {};
      renderVoteInfo(gs);
      renderGameBoard(gs, myId);
      showToast('Đã reset phiếu bầu!');
    };
    actsEl.appendChild(btnReset);
  }
}

// ─── Log ──────────────────────────────────────────────────────
function renderLog(gs) {
  const el = document.getElementById('log-entries');
  if (!el || !gs.log) return;
  el.innerHTML = (gs.log || []).slice(0, 30).map(e =>
    `<div class="log-entry${e.important ? ' imp' : ''}">${e.t} — ${e.msg}</div>`
  ).join('');
}

// ─── Winner ───────────────────────────────────────────────────
function showWinner(result) {
  document.getElementById('win-icon').textContent  = result.icon;
  document.getElementById('win-title').textContent = result.title;
  document.getElementById('win-desc').textContent  = result.desc;
  document.getElementById('win-overlay').style.display = 'flex';
}

// ─── Phase Header ─────────────────────────────────────────────
function setPhase(text, mode) {
  const el = document.getElementById('phase-label');
  el.textContent = text;
  el.className   = 'phase-label ' + mode; // 'night' | 'day'
}

// ─── Timer ────────────────────────────────────────────────────
let _timerIv  = null;
let _timerSec = 0;
let _timerOn  = false;

function startTimer()  {
  if (_timerOn) return;
  _timerOn = true;
  _timerIv = setInterval(() => { _timerSec++; _updateTimerDisplay(); }, 1000);
}
function stopTimer()   { clearInterval(_timerIv); _timerOn = false; }
function resetTimer()  { stopTimer(); _timerSec = 0; _updateTimerDisplay(); }
function toggleTimer() {
  if (_timerOn) stopTimer(); else startTimer();
}
function _updateTimerDisplay() {
  const m = String(Math.floor(_timerSec / 60)).padStart(2, '0');
  const s = String(_timerSec % 60).padStart(2, '0');
  const el = document.getElementById('timer-display');
  el.textContent = `${m}:${s}`;
  el.className   = 'timer-display' + (_timerSec >= 180 ? ' urgent' : '');
}

// ─── Copy ─────────────────────────────────────────────────────
function copyRoomId(id) {
  navigator.clipboard.writeText(id).catch(() => {});
  const tip = document.getElementById('copied-tip');
  tip.classList.add('show');
  setTimeout(() => tip.classList.remove('show'), 2000);
}

// ─── Util ─────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
