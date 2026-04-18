// ================================================
//   MA SÓI - GAME LOGIC | T Q D 💗
// ================================================

let gameState = {
  players: [],
  rolesConfig: {},
  discussionTime: 120,
  assignedRoles: [],
  currentRevealIndex: 0,
  cardFlipped: false,
  phase: 'night', // 'night' | 'day'
  round: 1,
  nightKills: [],
  nightSaves: [],
  dayVotes: {},
  timerInterval: null,
  timerSeconds: 0,
  timerRunning: false,
  witchHasHeal: true,
  witchHasPoison: true,
  guardianBlocksLeft: 2,
  currentNightStep: 0,
  lovers: [],
  lang: 'vi',
};

// ===== PLAYER MANAGEMENT =====

function addPlayer() {
  const input = document.getElementById('playerNameInput');
  const name = input.value.trim();
  if (!name) return showToast(T('playerNameEmpty'));
  if (gameState.players.length >= 20) return showToast(T('maxPlayers'));
  if (gameState.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    return showToast(T('duplicateName'));
  }
  const avatar = PLAYER_AVATARS[gameState.players.length % PLAYER_AVATARS.length];
  gameState.players.push({ id: Date.now(), name, avatar, alive: true, role: null, voted: false });
  input.value = '';
  input.focus();
  renderPlayerList();
  updateRoleSummary();
}

function removePlayer(id) {
  gameState.players = gameState.players.filter(p => p.id !== id);
  renderPlayerList();
  updateRoleSummary();
}

function renderPlayerList() {
  const list = document.getElementById('playerList');
  document.getElementById('playerCount').textContent = gameState.players.length;
  document.getElementById('playerCountSummary').textContent = gameState.players.length;
  list.innerHTML = gameState.players.map(p => `
    <div class="player-chip">
      <span>${p.avatar}</span>
      <span>${p.name}</span>
      <button class="player-chip-del" onclick="removePlayer(${p.id})">✕</button>
    </div>
  `).join('');
}

// ===== ROLE PICKER =====

function renderRolePicker() {
  const picker = document.getElementById('rolePicker');
  // Default counts
  if (Object.keys(gameState.rolesConfig).length === 0) {
    ROLES_DATA.forEach(r => { gameState.rolesConfig[r.id] = r.defaultCount; });
  }
  picker.innerHTML = ROLES_DATA.map(role => `
    <div class="role-pick-item">
      <span class="role-pick-emoji">${role.emoji.split('👑')[0]}</span>
      <span class="role-pick-name">${role.name[gameState.lang]}</span>
      <div class="role-counter">
        <button class="count-btn" onclick="changeRoleCount('${role.id}',-1)">−</button>
        <span class="count-val" id="rc_${role.id}">${gameState.rolesConfig[role.id] || 0}</span>
        <button class="count-btn" onclick="changeRoleCount('${role.id}',1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeRoleCount(id, delta) {
  const role = ROLES_DATA.find(r => r.id === id);
  if (!role) return;
  const current = gameState.rolesConfig[id] || 0;
  const next = Math.max(0, Math.min(role.maxCount, current + delta));
  gameState.rolesConfig[id] = next;
  const el = document.getElementById(`rc_${id}`);
  if (el) el.textContent = next;
  updateRoleSummary();
}

function updateRoleSummary() {
  const total = Object.values(gameState.rolesConfig).reduce((s, v) => s + v, 0);
  document.getElementById('roleSummary').textContent = total;
  document.getElementById('playerCountSummary').textContent = gameState.players.length;
}

function setTime(seconds) {
  gameState.discussionTime = seconds;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  event.target.closest('.time-btn').classList.add('active');
}

// ===== START GAME =====

function startGame() {
  const playerCount = gameState.players.length;
  if (playerCount < 4) return showToast(T('needMorePlayers'));
  if (playerCount > 20) return showToast(T('maxPlayers'));

  // Build role pool
  let rolePool = [];
  for (const [id, count] of Object.entries(gameState.rolesConfig)) {
    for (let i = 0; i < count; i++) rolePool.push(id);
  }

  if (rolePool.length !== playerCount) {
    return showToast(`${T('roleMismatch')} (${T('roles')}: ${rolePool.length}, ${T('players2')}: ${playerCount})`);
  }

  // Validate at least 1 wolf
  const wolfCount = rolePool.filter(id => {
    const r = ROLES_DATA.find(rd => rd.id === id);
    return r && r.team === 'wolf';
  }).length;

  if (wolfCount === 0) return showToast(T('needWolf'));

  // Shuffle
  rolePool = shuffle(rolePool);
  gameState.players.forEach((p, i) => {
    p.role = rolePool[i];
    p.alive = true;
    p.voted = false;
  });

  gameState.assignedRoles = rolePool;
  gameState.currentRevealIndex = 0;
  gameState.cardFlipped = false;
  gameState.phase = 'night';
  gameState.round = 1;
  gameState.nightKills = [];
  gameState.nightSaves = [];
  gameState.dayVotes = {};
  gameState.witchHasHeal = true;
  gameState.witchHasPoison = true;
  gameState.guardianBlocksLeft = 2;
  gameState.currentNightStep = 0;
  gameState.lovers = [];

  goScreen('screen-reveal');
  setupReveal();
}

// ===== ROLE REVEAL =====

function setupReveal() {
  const player = gameState.players[gameState.currentRevealIndex];
  const roleId = player.role;
  const roleData = ROLES_DATA.find(r => r.id === roleId);

  document.getElementById('revealTitle').textContent =
    `${T('revealTitle')} (${gameState.currentRevealIndex + 1}/${gameState.players.length})`;

  document.getElementById('revealInstruction').textContent =
    `${T('revealInstruct')} "${player.name}"`;

  document.getElementById('cardFrontName').textContent = player.name;
  document.getElementById('cardRoleIcon').textContent = roleData ? roleData.emoji : '❓';
  document.getElementById('cardRoleName').textContent = roleData ? roleData.name[gameState.lang] : roleId;
  document.getElementById('cardRoleDesc').textContent = roleData ? roleData.desc[gameState.lang] : '';

  // Apply team color to card back
  const cardBack = document.getElementById('cardBack');
  cardBack.className = 'card-back';
  if (roleData) {
    if (roleData.team === 'wolf') cardBack.style.background = 'linear-gradient(135deg, #1a0500, #3d0b0b)';
    else if (roleData.team === 'village') cardBack.style.background = 'linear-gradient(135deg, #051a2e, #0d3158)';
    else cardBack.style.background = 'linear-gradient(135deg, #140520, #2d0f47)';
  }

  document.getElementById('revealProgress').textContent =
    `${gameState.currentRevealIndex + 1} / ${gameState.players.length}`;

  // Reset flip
  document.getElementById('cardInner').classList.remove('flipped');
  gameState.cardFlipped = false;
  document.getElementById('revealActions').style.display = 'none';
}

function flipCard() {
  if (gameState.cardFlipped) return;
  document.getElementById('cardInner').classList.add('flipped');
  gameState.cardFlipped = true;

  const isLast = gameState.currentRevealIndex >= gameState.players.length - 1;
  const nextBtn = document.getElementById('btnNextReveal');
  nextBtn.textContent = isLast ? T('startNight') : T('nextPlayer');
  document.getElementById('revealActions').style.display = 'block';
}

function nextReveal() {
  gameState.currentRevealIndex++;
  if (gameState.currentRevealIndex >= gameState.players.length) {
    // All revealed, start game board
    goScreen('screen-game');
    initGameBoard();
    return;
  }
  setupReveal();
}

// ===== GAME BOARD =====

function initGameBoard() {
  renderPlayerGrid();
  startNightPhase();
}

function renderPlayerGrid() {
  const grid = document.getElementById('playerGrid');
  grid.innerHTML = gameState.players.map((p, i) => {
    const role = ROLES_DATA.find(r => r.id === p.role);
    const deadClass = p.alive ? '' : 'dead';
    return `
      <div class="player-token ${deadClass}" id="token_${p.id}" data-id="${p.id}"
           onclick="playerTokenClick(${p.id})" style="animation-delay:${i*50}ms">
        <div class="vote-count" id="votes_${p.id}"></div>
        <div class="player-avatar">${p.avatar}</div>
        <div class="player-name">${p.name}</div>
        <div class="player-status" id="status_${p.id}">
          ${p.alive ? (gameState.phase === 'day' ? T('alive') : '💤') : T('dead')}
        </div>
      </div>
    `;
  }).join('');
}

function playerTokenClick(id) {
  const player = gameState.players.find(p => p.id === id);
  if (!player || !player.alive) return;
  if (gameState.phase === 'day') {
    toggleVote(id);
  }
}

// ===== NIGHT PHASE =====

function startNightPhase() {
  gameState.phase = 'night';
  gameState.nightKills = [];
  gameState.nightSaves = [];
  gameState.currentNightStep = 0;
  gameState.dayVotes = {};

  document.getElementById('phaseBadge').textContent = `🌙 ${T('night')} ${gameState.round}`;
  document.getElementById('phaseBadge').className = 'phase-badge night';
  document.getElementById('nightPanel').style.display = 'block';
  document.getElementById('dayPanel').style.display = 'none';
  document.getElementById('winnerOverlay').style.display = 'none';

  renderPlayerGrid();
  renderNightPanel();
  stopTimer();
}

function renderNightPanel() {
  document.getElementById('nightTitle').textContent =
    `🌙 ${T('nightPhase')} ${gameState.round} — ${T('nightGuide')}`;

  const alivePlayers = gameState.players.filter(p => p.alive);
  const hasWolf = alivePlayers.some(p => {
    const r = ROLES_DATA.find(rd => rd.id === p.role);
    return r && r.team === 'wolf';
  });
  const hasSeer = alivePlayers.some(p => p.role === 'seer');
  const hasDoctor = alivePlayers.some(p => p.role === 'doctor');
  const hasWitch = alivePlayers.some(p => p.role === 'witch');
  const hasGuardian = alivePlayers.some(p => p.role === 'guardian');
  const hasDetective = alivePlayers.some(p => p.role === 'detective');
  const hasCupid = alivePlayers.some(p => p.role === 'cupid') && gameState.round === 1;

  const steps = [];

  steps.push({
    id: 'sleep',
    text: T('nightStep_sleep'),
    icon: '😴',
    action: null
  });

  if (hasCupid) steps.push({
    id: 'cupid',
    text: T('nightStep_cupid'),
    icon: '💘',
    action: 'cupidAction'
  });

  if (hasSeer) steps.push({
    id: 'seer',
    text: T('nightStep_seer'),
    icon: '🔮',
    action: 'seerAction'
  });

  if (hasDoctor || hasGuardian) steps.push({
    id: 'doctor',
    text: T('nightStep_doctor'),
    icon: '💊',
    action: 'doctorAction'
  });

  if (hasWolf) steps.push({
    id: 'wolf',
    text: T('nightStep_wolf'),
    icon: '🐺',
    action: 'wolfAction'
  });

  if (hasWitch && (gameState.witchHasHeal || gameState.witchHasPoison)) steps.push({
    id: 'witch',
    text: T('nightStep_witch'),
    icon: '🧙‍♀️',
    action: 'witchAction'
  });

  steps.push({
    id: 'dawn',
    text: T('nightStep_dawn'),
    icon: '☀️',
    action: 'dawnAction'
  });

  gameState.nightSteps = steps;

  const container = document.getElementById('nightSteps');
  container.innerHTML = steps.map((step, i) => `
    <div class="night-step ${i === 0 ? 'active' : ''}" id="nstep_${i}">
      <div class="night-step-num">${i + 1}</div>
      <div class="night-step-text">
        <strong>${step.icon} ${getNightStepTitle(step.id)}</strong><br>
        ${step.text}
      </div>
      <div class="night-step-action">
        ${step.action ? `<button class="btn-secondary" onclick="${step.action}(${i})">${T('done')}</button>` : ''}
        ${i === 0 ? `<button class="btn-secondary" onclick="advanceStep(0)">${T('done')}</button>` : ''}
      </div>
    </div>
  `).join('');
}

function getNightStepTitle(id) {
  const map = {
    sleep: { vi: 'Tất cả ngủ', en: 'Everyone sleeps' },
    cupid: { vi: 'Thần Tình Yêu', en: 'Cupid' },
    seer: { vi: 'Tiên Tri', en: 'Seer' },
    doctor: { vi: 'Bác Sĩ / Vệ Binh', en: 'Doctor / Guardian' },
    wolf: { vi: 'Ma Sói', en: 'Werewolves' },
    witch: { vi: 'Phù Thủy', en: 'Witch' },
    dawn: { vi: 'Bình minh', en: 'Dawn' },
  };
  return (map[id] || { vi: id, en: id })[gameState.lang];
}

function advanceStep(index) {
  const current = document.getElementById(`nstep_${index}`);
  if (current) current.classList.replace('active', 'done');
  if (index + 1 < gameState.nightSteps.length) {
    const next = document.getElementById(`nstep_${index + 1}`);
    if (next) next.classList.add('active');
  }
}

function cupidAction(i) { advanceStep(i); showToast(T('cupidDone')); }
function seerAction(i) { advanceStep(i); showToast(T('seerDone')); }
function doctorAction(i) { advanceStep(i); showToast(T('doctorDone')); }
function wolfAction(i) { advanceStep(i); showToast(T('wolfDone')); }
function witchAction(i) { advanceStep(i); showToast(T('witchDone')); }

function dawnAction(i) {
  advanceStep(i);
  endNightPhase();
}

function endNightPhase() {
  // Show modal to input who died
  openKillModal();
}

function openKillModal() {
  const alive = gameState.players.filter(p => p.alive);
  const opts = alive.map(p => `<option value="${p.id}">${p.avatar} ${p.name}</option>`).join('');
  const noneOpt = `<option value="">${T('noKill')}</option>`;

  document.getElementById('modalIcon').textContent = '🌙';
  document.getElementById('modalTitle').textContent = T('whoKilledTitle');
  document.getElementById('modalDesc').innerHTML = `
    <select id="killSelect" style="background:#111827;color:#f0e6d3;border:1px solid rgba(212,165,55,0.3);border-radius:8px;padding:10px;width:100%;font-size:16px;margin-bottom:12px;">
      ${noneOpt}${opts}
    </select>
    <small style="color:#8b7d6b">${T('whoKilledHint')}</small>
  `;
  document.getElementById('modalCancel').textContent = T('cancel');
  document.getElementById('modalOk').textContent = T('confirm');
  document.getElementById('modalOverlay').style.display = 'flex';

  window._modalConfirmFn = () => {
    const sel = document.getElementById('killSelect').value;
    closeModal();
    if (sel) {
      const killed = gameState.players.find(p => p.id == sel);
      if (killed) {
        killed.alive = false;
        gameState.nightKills.push(killed.id);
      }
    }
    checkHunterOnDeath();
    startDayPhase();
  };
}

function checkHunterOnDeath() {
  for (const killedId of gameState.nightKills) {
    const killed = gameState.players.find(p => p.id === killedId);
    if (killed && killed.role === 'hunter') {
      openHunterModal(killed.name);
    }
  }
}

function openHunterModal(hunterName) {
  const alive = gameState.players.filter(p => p.alive);
  const opts = alive.map(p => `<option value="${p.id}">${p.avatar} ${p.name}</option>`).join('');
  document.getElementById('modalIcon').textContent = '🏹';
  document.getElementById('modalTitle').textContent = `${T('hunterTitle')}: ${hunterName}`;
  document.getElementById('modalDesc').innerHTML = `
    <p style="margin-bottom:12px">${T('hunterDesc')}</p>
    <select id="hunterSelect" style="background:#111827;color:#f0e6d3;border:1px solid rgba(212,165,55,0.3);border-radius:8px;padding:10px;width:100%;font-size:16px;">
      ${opts}
    </select>
  `;
  document.getElementById('modalCancel').textContent = T('skip');
  document.getElementById('modalOk').textContent = T('shoot');
  document.getElementById('modalOverlay').style.display = 'flex';

  window._modalConfirmFn = () => {
    const sel = document.getElementById('hunterSelect').value;
    closeModal();
    if (sel) {
      const target = gameState.players.find(p => p.id == sel);
      if (target) { target.alive = false; }
    }
  };
}

// ===== DAY PHASE =====

function startDayPhase() {
  gameState.phase = 'day';
  document.getElementById('phaseBadge').textContent = `☀️ ${T('day')} ${gameState.round}`;
  document.getElementById('phaseBadge').className = 'phase-badge day';
  document.getElementById('nightPanel').style.display = 'none';
  document.getElementById('dayPanel').style.display = 'block';

  renderPlayerGrid();
  updateDayAnnounce();

  if (checkWinner()) return;

  startTimer(gameState.discussionTime);
}

function updateDayAnnounce() {
  const killed = gameState.nightKills.map(id => {
    const p = gameState.players.find(pl => pl.id === id);
    return p ? `${p.avatar} <strong>${p.name}</strong>` : '';
  }).filter(Boolean);

  let msg = '';
  if (killed.length === 0) {
    msg = `☀️ ${T('noDeathLastNight')}`;
  } else {
    msg = `☀️ ${T('diedLastNight')}: ${killed.join(', ')}`;
  }

  msg += `<br><br>💬 ${T('dayDiscussion')}`;
  msg += `<br><br><div class="day-vote-section">
    <h4>🗳️ ${T('voteToEliminate')}</h4>
    <div class="vote-list" id="voteList"></div>
    <p style="font-size:13px;color:var(--text-dim)">${T('clickPlayerToVote')}</p>
  </div>`;

  document.getElementById('dayAnnounce').innerHTML = msg;
}

function toggleVote(id) {
  if (gameState.dayVotes[id]) {
    delete gameState.dayVotes[id];
  } else {
    gameState.dayVotes[id] = (gameState.dayVotes[id] || 0) + 1;
  }
  updateVoteDisplay();
}

function updateVoteDisplay() {
  // Update tokens
  gameState.players.forEach(p => {
    const token = document.getElementById(`token_${p.id}`);
    const voteEl = document.getElementById(`votes_${p.id}`);
    if (!token || !voteEl) return;
    if (gameState.dayVotes[p.id]) {
      token.classList.add('voted');
      voteEl.textContent = `🗳️`;
      voteEl.classList.add('visible');
    } else {
      token.classList.remove('voted');
      voteEl.classList.remove('visible');
    }
  });

  // Update vote list
  const voteList = document.getElementById('voteList');
  if (voteList) {
    const voted = Object.keys(gameState.dayVotes);
    voteList.innerHTML = voted.map(id => {
      const p = gameState.players.find(pl => pl.id == id);
      return p ? `<div class="vote-chip">${p.avatar} ${p.name} <span>🗳️</span></div>` : '';
    }).join('');
  }
}

function endDay() {
  stopTimer();

  // Find most voted
  const voteEntries = Object.entries(gameState.dayVotes);
  if (voteEntries.length === 0) {
    showToast(T('noVote'));
    // Still proceed
    gameState.round++;
    gameState.nightKills = [];
    startNightPhase();
    return;
  }

  // Find max votes
  const maxVotes = Math.max(...voteEntries.map(([,v]) => v));
  const topVoted = voteEntries.filter(([,v]) => v === maxVotes).map(([id]) => id);

  let eliminatedId = topVoted[0]; // simple: take first if tie
  const eliminated = gameState.players.find(p => p.id == eliminatedId);

  if (eliminated) {
    eliminated.alive = false;
    const roleData = ROLES_DATA.find(r => r.id === eliminated.role);
    const msg = `${T('eliminated')}: ${eliminated.avatar} ${eliminated.name}${gameState.lang === 'vi' ? ` (Vai: ${roleData ? roleData.name.vi : eliminated.role})` : ` (Role: ${roleData ? roleData.name.en : eliminated.role})`}`;
    showToast(msg, 4000);

    // Hunter on day death
    if (eliminated.role === 'hunter') {
      setTimeout(() => openHunterModal(eliminated.name), 500);
    }

    // Jester wins if voted out
    if (eliminated.role === 'jester') {
      setTimeout(() => showWinner('jester', eliminated.name), 800);
      return;
    }
  }

  if (checkWinner()) return;

  gameState.round++;
  gameState.nightKills = [];
  gameState.dayVotes = {};
  startNightPhase();
}

// ===== WINNER CHECK =====

function checkWinner() {
  const alive = gameState.players.filter(p => p.alive);
  const wolves = alive.filter(p => {
    const r = ROLES_DATA.find(rd => rd.id === p.role);
    return r && r.team === 'wolf';
  });
  const villagers = alive.filter(p => {
    const r = ROLES_DATA.find(rd => rd.id === p.role);
    return r && r.team !== 'wolf';
  });

  if (wolves.length === 0) {
    showWinner('village');
    return true;
  }
  if (wolves.length >= villagers.length) {
    showWinner('wolf');
    return true;
  }
  return false;
}

function showWinner(team, name) {
  const overlay = document.getElementById('winnerOverlay');
  const icon = document.getElementById('winnerIcon');
  const title = document.getElementById('winnerTitle');
  const desc = document.getElementById('winnerDesc');

  stopTimer();

  if (team === 'village') {
    icon.textContent = '🏡';
    title.textContent = T('villageWins');
    desc.textContent = T('villageWinsDesc');
  } else if (team === 'wolf') {
    icon.textContent = '🐺';
    title.textContent = T('wolfWins');
    desc.textContent = T('wolfWinsDesc');
  } else if (team === 'jester') {
    icon.textContent = '🃏';
    title.textContent = T('jesterWins');
    desc.textContent = `${name} ${T('jesterWinsDesc')}`;
  }

  overlay.style.display = 'flex';
}

// ===== TIMER =====

function startTimer(seconds) {
  stopTimer();
  gameState.timerSeconds = seconds;
  gameState.timerRunning = true;
  updateTimerDisplay();
  gameState.timerInterval = setInterval(() => {
    if (gameState.timerSeconds <= 0) {
      stopTimer();
      showToast(T('timeUp'));
      return;
    }
    gameState.timerSeconds--;
    updateTimerDisplay();
    if (gameState.timerSeconds <= 10) {
      document.getElementById('timerDisplay').classList.add('urgent');
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  gameState.timerRunning = false;
  document.getElementById('timerDisplay').classList.remove('urgent');
}

function toggleTimer() {
  if (gameState.timerRunning) {
    stopTimer();
  } else {
    if (gameState.timerSeconds > 0) {
      gameState.timerRunning = true;
      gameState.timerInterval = setInterval(() => {
        if (gameState.timerSeconds <= 0) {
          stopTimer();
          showToast(T('timeUp'));
          return;
        }
        gameState.timerSeconds--;
        updateTimerDisplay();
        if (gameState.timerSeconds <= 10) {
          document.getElementById('timerDisplay').classList.add('urgent');
        }
      }, 1000);
    }
  }
}

function updateTimerDisplay() {
  const m = Math.floor(gameState.timerSeconds / 60).toString().padStart(2,'0');
  const s = (gameState.timerSeconds % 60).toString().padStart(2,'0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
}

// ===== MODAL =====

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

function modalConfirm() {
  if (window._modalConfirmFn) window._modalConfirmFn();
}

// ===== UTIL =====

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
