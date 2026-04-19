const App = {
  myId:   '',
  myName: '',
  room:   null,
  pollIv: null,
  revealFlipped: false,
  _lastRevealIdx: -1,
  _nightResult: { killed: [], saved: [] },

  // ── Init ────────────────────────────────────────────────────
  init() {
    initStars();
    renderRolesInfo();
    this.bindEvents();
  },

  bindEvents() {
    // Name input
    const nameInp = document.getElementById('name-input');
    nameInp.addEventListener('input', () => {
      document.getElementById('name-next-btn').disabled = !nameInp.value.trim();
    });
    nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') this.doNameNext(); });

    // Room name input
    const roomInp = document.getElementById('room-name-input');
    roomInp.addEventListener('input', () => {
      document.getElementById('create-room-btn').disabled = !roomInp.value.trim();
    });
    roomInp.addEventListener('keydown', e => { if (e.key === 'Enter') this.createRoom(); });

    // Join input
    const joinInp = document.getElementById('join-id-input');
    joinInp.addEventListener('input', () => { joinInp.value = joinInp.value.toUpperCase(); });
    joinInp.addEventListener('keydown', e => { if (e.key === 'Enter') this.joinRoom(); });

    // Max players
    document.getElementById('wr-max-sel').addEventListener('change', () => this.updateMaxPlayers());
  },

  // ── Name step ───────────────────────────────────────────────
  doNameNext() {
    const v = document.getElementById('name-input').value.trim();
    if (!v) return;
    this.myName = v;
    this.myId   = genUid();
    document.getElementById('greet-name').textContent = v;
    goTo('screen-room-choice');
  },

  // ── Create Room ─────────────────────────────────────────────
  createRoom() {
    const rname = document.getElementById('room-name-input').value.trim();
    if (!rname) return;
    const rid = genRoomId();
    this.room = {
      id: rid, name: rname, host: this.myId,
      maxPlayers: 22,
      players: [{ id: this.myId, name: this.myName }],
      started: false, gameState: null,
    };
    saveRoom(this.room);
    this.openWaitingRoom();
  },

  // ── Join Room ───────────────────────────────────────────────
  joinRoom() {
    const rid = document.getElementById('join-id-input').value.trim().toUpperCase();
    if (rid.length < 4) { showToast('Nhập ID phòng hợp lệ!'); return; }
    const r = loadRoom(rid);
    if (!r) { showToast('❌ Không tìm thấy phòng: ' + rid); return; }
    if (r.started) { showToast('⚠️ Game đã bắt đầu, không thể vào!'); return; }
    if (r.players.length >= r.maxPlayers) { showToast('Phòng đã đầy!'); return; }
    if (r.players.find(p => p.id === this.myId)) { this.room = r; this.openWaitingRoom(); return; }
    r.players.push({ id: this.myId, name: this.myName });
    saveRoom(r);
    this.room = r;
    this.openWaitingRoom();
  },

  // ── Waiting Room ────────────────────────────────────────────
  openWaitingRoom() {
    goTo('screen-waiting');
    renderWaitingRoom(this.room);
    clearInterval(this.pollIv);
    this.pollIv = setInterval(() => this._pollWaiting(), POLL_INTERVAL);
  },

  _pollWaiting() {
    const r = loadRoom(this.room.id);
    if (!r) return;
    this.room = r;
    if (r.started && r.gameState) {
      clearInterval(this.pollIv);
      this.room.gameState = r.gameState;
      this._enterGame();
      return;
    }
    renderWaitingRoom(r);
  },

  updateMaxPlayers() {
    const v  = parseInt(document.getElementById('wr-max-sel').value);
    const r  = loadRoom(this.room.id);
    if (!r || r.host !== this.myId) return;
    r.maxPlayers = v;
    saveRoom(r);
    this.room = r;
    renderWaitingRoom(r);
  },

  hostStartGame() {
    const r = loadRoom(this.room.id);
    if (!r || r.host !== this.myId) return;
    if (r.players.length < r.maxPlayers) { showToast('Chưa đủ người!'); return; }
    const gs   = buildGameState(r);
    r.started  = true;
    r.gameState = gs;
    saveRoom(r);
    this.room = r;
    this._enterGame();
  },

  // ── Enter game (reveal phase) ────────────────────────────────
  _enterGame() {
    const gs  = this.room.gameState;
    const isMC = this.myId === gs.mcId;
    goTo('screen-reveal');

    // Hiện thông báo ai là MC
    document.getElementById('mc-announce-name').textContent = gs.mcName;
    document.getElementById('mc-announce').style.display = 'block';

    if (isMC) {
      // MC không xem bài — thấy màn chờ
      document.getElementById('mc-reveal-view').style.display  = 'block';
      document.getElementById('non-mc-reveal').style.display   = 'none';
      this._pollRevealAsMC(gs);
    } else {
      document.getElementById('mc-reveal-view').style.display  = 'none';
      document.getElementById('non-mc-reveal').style.display   = 'block';
      this._pollRevealAsPlayer(gs);
    }
  },

  // Người chơi xem bài theo lượt
  _pollRevealAsPlayer(gs) {
    // Render lần đầu
    this._renderRevealForPlayer(gs);
    clearInterval(this.pollIv);
    this.pollIv = setInterval(() => {
      const r = loadRoom(this.room.id);
      if (!r || !r.gameState) return;
      const newGs = r.gameState;
      this.room = r;
      if (newGs.phase === 'night') {
        clearInterval(this.pollIv);
        this._startNight(newGs);
        return;
      }
      if (newGs.revealIdx !== this._lastRevealIdx) {
        this._lastRevealIdx = newGs.revealIdx;
        this._renderRevealForPlayer(newGs);
      }
    }, POLL_INTERVAL);
  },

  _renderRevealForPlayer(gs) {
    const idx = gs.revealIdx;
    const ps  = gs.players;
    const isMC = this.myId === gs.mcId;

    // Progress bar
    const pct = ps.length ? Math.round((idx / ps.length) * 100) : 100;
    document.getElementById('rev-prog-fill').style.width = pct + '%';
    document.getElementById('rev-count').textContent = idx >= ps.length
      ? 'Tất cả đã xem xong!'
      : `${idx + 1} / ${ps.length}`;

    if (idx >= ps.length) {
      document.getElementById('rev-who').innerHTML = '✅ Tất cả đã xem xong!';
      document.getElementById('rev-who-name').textContent = '';
      document.getElementById('flip-outer').style.display   = 'none';
      document.getElementById('rev-next-btn').style.display = 'none';
      document.getElementById('rev-mc-msg').style.display   = 'block';
      document.getElementById('rev-mc-msg').textContent     = '⏳ Chờ MC bắt đầu đêm...';
      return;
    }

    const p = ps[idx];
    document.getElementById('rev-who').textContent      = 'Lượt xem bài của:';
    document.getElementById('rev-who-name').textContent = p.name;
    document.getElementById('card-pname').textContent   = p.name;

    // Card back
    const cb   = document.getElementById('card-back');
    const role = p.role;
    cb.className = 'card-face card-back' + (role.team === 'wolf' ? ' wolf' : '');
    document.getElementById('card-role-icon').textContent = role.icon;
    document.getElementById('card-role-name').textContent = role.name;
    document.getElementById('card-role-desc').textContent = role.desc;

    document.getElementById('flip-outer').style.display = 'block';
    document.getElementById('flip-inner').classList.remove('flipped');
    App.revealFlipped = false;
    document.getElementById('rev-next-btn').style.display = 'none';
    document.getElementById('rev-mc-msg').style.display   = 'none';

    // Chỉ người có lượt mới thấy nút lật / nút next
    if (this.myId === p.id) {
      // Người này tự nhấn để lật
    } else {
      document.getElementById('flip-outer').style.pointerEvents = 'none';
    }
    document.getElementById('flip-outer').style.pointerEvents = this.myId === p.id ? 'auto' : 'none';
  },

  flipRevealCard() {
    if (App.revealFlipped) return;
    App.revealFlipped = true;
    document.getElementById('flip-inner').classList.add('flipped');
    const gs  = this.room.gameState;
    const idx = gs.revealIdx;
    const p   = gs.players[idx];
    if (!p || this.myId !== p.id) return;
    // Hiện nút next
    const nb = document.getElementById('rev-next-btn');
    nb.style.display = 'block';
    nb.textContent = idx + 1 >= gs.players.length
      ? '✅ Xong! Chờ MC bắt đầu'
      : `👉 ${gs.players[idx + 1].name} — Tiếp theo`;
  },

  revealNext() {
    const r = loadRoom(this.room.id);
    if (!r || !r.gameState) return;
    r.gameState.revealIdx++;
    saveRoom(r);
    this.room = r;
    this._lastRevealIdx = r.gameState.revealIdx;
    this._renderRevealForPlayer(r.gameState);
  },

  // MC xem màn reveal — không thấy bài, chỉ theo dõi tiến độ
  _pollRevealAsMC(gs) {
    document.getElementById('mc-rev-progress').textContent =
      `0 / ${gs.players.length} người đã xem`;
    clearInterval(this.pollIv);
    this.pollIv = setInterval(() => {
      const r = loadRoom(this.room.id);
      if (!r || !r.gameState) return;
      this.room = r;
      const newGs = r.gameState;
      const idx   = newGs.revealIdx;
      document.getElementById('mc-rev-progress').textContent =
        idx >= newGs.players.length
          ? '✅ Tất cả đã xem xong!'
          : `${idx} / ${newGs.players.length} người đã xem`;
      document.getElementById('mc-start-btn').style.display =
        idx >= newGs.players.length ? 'block' : 'none';
    }, POLL_INTERVAL);
  },

  mcBeginNight() {
    const r = loadRoom(this.room.id);
    if (!r) return;
    r.gameState.phase     = 'night';
    r.gameState.nightData = {
      wolfTarget: null, doctorSave: null, guardTarget: null,
      witchSave: false, witchKill: null,
      seerResult: null, detectiveResult: null,
    };
    saveRoom(r);
    this.room = r;
    this._startNight(r.gameState);
  },

  // ── NIGHT ───────────────────────────────────────────────────
  _startNight(gs) {
    resetTimer();
    goTo('screen-game');
    setPhase(`🌙 Đêm ${gs.nightNum}`, 'night');
    renderGameBoard(gs, this.myId);
    renderNightPanel(gs, this.myId);
    renderLog(gs);

    clearInterval(this.pollIv);
    if (this.myId !== gs.mcId) {
      // Người chơi poll chờ MC chuyển sang ngày
      this.pollIv = setInterval(() => {
        const r = loadRoom(this.room.id);
        if (!r || !r.gameState) return;
        this.room = r;
        if (r.gameState.phase === 'day') {
          clearInterval(this.pollIv);
          this._startDay(r.gameState);
        } else {
          renderNightPanel(r.gameState, this.myId);
          renderLog(r.gameState);
        }
      }, POLL_INTERVAL);
    }
  },

  mcEndNight() {
    // MC tổng kết đêm và chuyển sang ngày
    const r = loadRoom(this.room.id);
    if (!r || !r.gameState) return;
    const gs = r.gameState;
    const result = resolveNight(gs);
    this._nightResult = result;

    const winResult = checkWin(gs);
    gs.phase = 'day';
    gs.nightNum++;
    gs.votes = {};
    saveRoom(r);
    this.room = r;

    if (winResult) { showWinner(winResult); return; }
    this._startDay(gs, result);
  },

  // ── DAY ─────────────────────────────────────────────────────
  _startDay(gs, result) {
    if (!result) result = this._nightResult || { killed: [], saved: [] };
    resetTimer();
    setPhase(`☀️ Ngày ${gs.nightNum - 1}`, 'day');
    renderGameBoard(gs, this.myId);
    renderDayPanel(gs, this.myId, result);
    renderVoteInfo(gs);
    renderLog(gs);

    clearInterval(this.pollIv);
    if (this.myId !== gs.mcId) {
      // Poll chờ MC chuyển sang đêm
      this.pollIv = setInterval(() => {
        const r = loadRoom(this.room.id);
        if (!r || !r.gameState) return;
        this.room = r;
        renderGameBoard(r.gameState, this.myId);
        renderVoteInfo(r.gameState);
        renderLog(r.gameState);
        if (r.gameState.phase === 'night' && r.gameState.nightNum > gs.nightNum - 1) {
          clearInterval(this.pollIv);
          this._startNight(r.gameState);
        }
      }, POLL_INTERVAL);
    }
  },

  mcResolveVote() {
    const r = loadRoom(this.room.id);
    if (!r || !r.gameState) return;
    const gs = r.gameState;
    const elim = resolveVote(gs);

    if (!elim) { showToast('Chưa có ai được bỏ phiếu!'); return; }

    // Tên Hề bị bầu → thắng riêng
    if (elim.role.id === 'tenHe') {
      gs.phase = 'ended';
      saveRoom(r);
      showWinner({ winner: 'jester', icon: '🎭', title: 'Tên Hề Thắng!', desc: `${elim.name} (Tên Hề) đã đạt mục tiêu — bị dân làng bầu loại! 🎉` });
      return;
    }

    // Thợ Săn bị loại → bắn người
    if (elim.role.id === 'thoSan') {
      showToast(`🏹 ${elim.name} là Thợ Săn — họ được bắn 1 người!`, 4000);
    }

    const winResult = checkWin(gs);
    if (winResult) {
      gs.phase = 'ended';
      saveRoom(r);
      showWinner(winResult);
      return;
    }

    // Chuẩn bị đêm mới
    gs.phase = 'night';
    gs.nightData = {
      wolfTarget: null, doctorSave: null, guardTarget: null,
      witchSave: false, witchKill: null,
      seerResult: null, detectiveResult: null,
    };
    gs.votes = {};
    saveRoom(r);
    this.room = r;
    this._nightResult = { killed: [], saved: [] };
    renderGameBoard(gs, this.myId);
    renderDayPanel(gs, this.myId, { killed: [], saved: [] });

    // Thêm nút chuyển sang đêm
    const acts = document.getElementById('day-acts');
    acts.innerHTML = '';
    const btn = document.createElement('button');
    btn.className   = 'btn-action vill';
    btn.textContent = '🌙 Sang đêm tiếp theo';
    btn.onclick     = () => {
      setPhase(`🌙 Đêm ${gs.nightNum}`, 'night');
      renderNightPanel(gs, this.myId);
    };
    acts.appendChild(btn);
    renderLog(gs);
  },
};

// ── Global handlers (gọi từ HTML onclick) ────────────────────
window.onload = () => App.init();

function doNameNext()    { App.doNameNext(); }
function createRoom()    { App.createRoom(); }
function joinRoom()      { App.joinRoom(); }
function hostStartGame() { App.hostStartGame(); }
function flipRevealCard(){ App.flipRevealCard(); }
function revealNext()    { App.revealNext(); }
function mcBeginNight()  { App.mcBeginNight(); }
function leaveGame()     {
  stopTimer();
  clearInterval(App.pollIv);
  document.getElementById('win-overlay').style.display = 'none';
  goTo('screen-landing');
}
