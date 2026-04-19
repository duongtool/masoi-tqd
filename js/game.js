const STORAGE_PREFIX = 'masoi_tqd_v3_';
const POLL_INTERVAL   = 1200; // ms

// ─── Phòng ────────────────────────────────────────────────────
function genRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function genUid() {
  return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function saveRoom(room) {
  try { localStorage.setItem(STORAGE_PREFIX + room.id, JSON.stringify(room)); } catch (_) {}
}
function loadRoom(id) {
  try { const d = localStorage.getItem(STORAGE_PREFIX + id); return d ? JSON.parse(d) : null; } catch { return null; }
}

// ─── Tạo state game ───────────────────────────────────────────
function buildGameState(room) {
  const players = room.players; // [{id, name}]
  const n = players.length;

  // Random chọn 1 MC từ danh sách — MC không nhận vai, không chơi
  const mcIdx   = Math.floor(Math.random() * n);
  const mcId    = players[mcIdx].id;
  const mcName  = players[mcIdx].name;

  // Những người còn lại mới nhận vai
  const gamers  = players.filter(p => p.id !== mcId);
  const gn      = gamers.length;

  const rolesArr = buildRoleDistribution(gn);
  const shuffled = [...rolesArr].sort(() => Math.random() - 0.5);

  const playerStates = gamers.map((p, i) => ({
    id:        p.id,
    name:      p.name,
    role:      shuffled[i],
    alive:     true,
    transformed: false, // Người Hóa Sói đã hóa chưa
  }));

  return {
    phase:     'reveal',   // reveal → night → day → night → ...
    nightNum:  1,
    revealIdx: 0,          // index của người đang xem bài
    mcId,
    mcName,
    players:   playerStates,
    log:       [],
    votes:     {},
    mayorId:   playerStates.find(p => p.role.id === 'thiTruong')?.id ?? null,
    witchSaveUsed: false,
    witchKillUsed: false,
    // Dữ liệu đêm (MC ghi nhận)
    nightData: {
      wolfTarget:  null,   // id người bị sói chọn
      doctorSave:  null,   // id người bác sĩ cứu
      guardTarget: null,   // id người vệ binh bảo vệ
      witchSave:   false,  // phù thủy dùng thuốc cứu chưa
      witchKill:   null,   // id người phù thủy giết
      seerResult:  null,   // {targetId, isWolf}
      detectiveResult: null, // {id1, id2, sameSide}
    },
    hunterShot: null,      // khi thợ săn bắn
    lastDoctorSave: null,
    lastGuardTarget: null,
  };
}

function resolveNight(gs) {
  const nd = gs.nightData;
  const killed = [];
  const saved  = [];

  if (nd.wolfTarget) {
    const target = gs.players.find(p => p.id === nd.wolfTarget);
    if (target && target.alive) {
      const isProtected =
        nd.doctorSave  === nd.wolfTarget ||
        nd.guardTarget === nd.wolfTarget ||
        nd.witchSave;

      if (isProtected) {
        saved.push(target.name);
        if (target.role.id === 'nguoiHoaSoi' && !target.transformed) {
          target.transformed = true;
          target.role = ROLES.find(r => r.id === 'masoi'); // hóa Ma Sói
          addLog(gs, `🌀 Một người đã được cứu... nhưng điều gì đó kỳ lạ đang xảy ra!`, false);
        }
      } else {
        target.alive = false;
        killed.push(target);
        addLog(gs, `💀 ${target.name} bị sát hại trong đêm tối!`, true);
      }
    }
  }


  if (nd.witchKill) {
    const target = gs.players.find(p => p.id === nd.witchKill);
    if (target && target.alive) {
      target.alive = false;
      killed.push(target);
      addLog(gs, `☠️ ${target.name} bị đầu độc trong đêm!`, true);
    }
  }

  gs.lastDoctorSave  = nd.doctorSave  || gs.lastDoctorSave;
  gs.lastGuardTarget = nd.guardTarget || gs.lastGuardTarget;

  return { killed, saved };
}


function resolveVote(gs) {
  if (!gs.votes || Object.keys(gs.votes).length === 0) return null;

  let maxVotes = 0;
  let eliminated = null;

  Object.entries(gs.votes).forEach(([id, v]) => {
    const weight = id === gs.mayorId ? v * 2 : v;
    if (weight > maxVotes) { maxVotes = weight; eliminated = id; }
  });

  if (!eliminated) return null;

  const p = gs.players.find(pp => pp.id === eliminated);
  if (!p || !p.alive) return null;

  p.alive = false;
  addLog(gs, `🗳️ ${p.name} bị bầu loại với ${maxVotes} phiếu! Vai: ${p.role.name}`, true);

  if (p.id === gs.mayorId) gs.mayorId = null;
  return p;
}


function checkWin(gs) {
  const alive  = gs.players.filter(p => p.alive);
  const wolves = alive.filter(p => p.role.team === 'wolf');
  const others = alive.filter(p => p.role.team !== 'wolf');

  if (wolves.length === 0) return { winner: 'village', icon: '🏡', title: 'Dân Làng Chiến Thắng!', desc: 'Tất cả Ma Sói đã bị tiêu diệt! Dân làng được bình yên 🎉' };
  if (wolves.length >= others.length) return { winner: 'wolf', icon: '🐺', title: 'Ma Sói Chiến Thắng!', desc: 'Ma Sói đã chiếm ưu thế! Không còn hy vọng cho dân làng 😈' };
  return null;
}


function addLog(gs, msg, important) {
  if (!gs.log) gs.log = [];
  const t = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  gs.log.unshift({ msg, important, t });
  if (gs.log.length > 50) gs.log = gs.log.slice(0, 50);
}
