// ================================================
//   MA SÓI - UI HELPERS | T Q D 💗
// ================================================

// ===== SCREEN NAVIGATION =====

function goScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Init screens
  if (screenId === 'screen-roles') renderRolesScreen();
  if (screenId === 'screen-setup') {
    renderPlayerList();
    renderRolePicker();
    updateRoleSummary();
    updateLang();
  }
}

// ===== ROLES SCREEN =====

let currentFilter = 'all';

function renderRolesScreen() {
  const grid = document.getElementById('rolesGrid');
  const filtered = currentFilter === 'all'
    ? ROLES_DATA
    : ROLES_DATA.filter(r => r.team === currentFilter);

  grid.innerHTML = filtered.map((role, i) => `
    <div class="role-card ${role.team}" style="animation-delay:${i*40}ms">
      <div class="role-card-header">
        <div class="role-emoji">${role.emoji}</div>
        <div class="role-card-info">
          <h3>${role.name[gameState.lang]}</h3>
          <span class="role-tag ${role.team}">${role.tag[gameState.lang]}</span>
        </div>
      </div>
      <p>${role.desc[gameState.lang]}</p>
      <div class="role-ability">${role.ability[gameState.lang]}</div>
    </div>
  `).join('');
}

function filterRoles(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderRolesScreen();
}

// ===== TOAST =====

let toastTimeout;

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== LANGUAGE =====

function setLang(lang) {
  gameState.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  updateLang();
  // Re-render role screens if active
  if (document.getElementById('screen-roles').classList.contains('active')) renderRolesScreen();
  if (document.getElementById('screen-setup').classList.contains('active')) {
    renderRolePicker();
    updateRoleSummary();
  }
}

function updateLang() {
  document.querySelectorAll('[data-vi]').forEach(el => {
    el.textContent = el.getAttribute(`data-${gameState.lang}`) || el.textContent;
  });
  // Input placeholder
  const inp = document.getElementById('playerNameInput');
  if (inp) inp.placeholder = gameState.lang === 'vi' ? 'Nhập tên người chơi...' : 'Enter player name...';
}

// ===== TRANSLATIONS =====

const TRANSLATIONS = {
  vi: {
    playerNameEmpty: '⚠️ Nhập tên người chơi!',
    maxPlayers: '⚠️ Tối đa 20 người chơi!',
    duplicateName: '⚠️ Tên đã tồn tại!',
    needMorePlayers: '⚠️ Cần ít nhất 4 người chơi!',
    roleMismatch: '⚠️ Số vai không khớp số người chơi!',
    roles: 'Vai',
    players2: 'Người',
    needWolf: '⚠️ Cần ít nhất 1 Ma Sói!',
    revealTitle: 'Xem Bài',
    revealInstruct: 'Trao điện thoại cho người chơi:',
    startNight: '🌙 Bắt đầu đêm đầu tiên!',
    nextPlayer: '➡️ Người tiếp theo',
    night: 'Đêm',
    day: 'Ngày',
    nightPhase: 'Pha Đêm',
    nightGuide: 'Hướng dẫn MC',
    nightStep_sleep: 'MC: "Tất cả nhắm mắt lại và ngủ ngon nhé. Đêm nay làng mình có những điều kỳ lạ xảy ra..."',
    nightStep_cupid: 'Cupid thức dậy, chọn 2 người chơi làm đôi tình nhân (chỉ đêm 1). Sau đó ngủ lại.',
    nightStep_seer: 'Tiên Tri thức dậy, chỉ vào 1 người. MC gật đầu (Ma Sói) hoặc lắc đầu (không phải). Sau đó ngủ lại.',
    nightStep_doctor: 'Bác Sĩ / Vệ Binh thức dậy, chỉ vào 1 người cần bảo vệ. Sau đó ngủ lại.',
    nightStep_wolf: 'Ma Sói thức dậy, nhận mặt nhau và cùng chọn 1 nạn nhân (chỉ vào). Sau đó ngủ lại.',
    nightStep_witch: 'Phù Thủy thức dậy. MC tiết lộ ai bị Sói chọn (ẩn danh). Phù Thủy quyết định dùng thuốc cứu hay không, và có thể dùng thuốc độc. Sau đó ngủ lại.',
    nightStep_dawn: 'MC: "Bình minh đến rồi! Tất cả thức dậy nào!" → Nhấn xác nhận để tiếp tục sang ngày.',
    done: 'Xong ✓',
    whoKilledTitle: '🌙 Đêm qua ai đã chết?',
    whoKilledHint: 'Chọn người bị Ma Sói giết đêm qua (hoặc không ai nếu được cứu)',
    noKill: '✅ Không ai chết (được cứu)',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    hunterTitle: '🏹 Thợ Săn trả thù',
    hunterDesc: 'Thợ Săn đã chết! Anh ta có thể bắn 1 người cùng chết.',
    skip: 'Bỏ qua',
    shoot: '🏹 Bắn!',
    alive: '✅ Còn sống',
    dead: '💀 Đã chết',
    noDeathLastNight: 'Đêm yên bình, không ai chết!',
    diedLastNight: 'Đêm qua đã mất',
    dayDiscussion: 'Mọi người hãy thảo luận và tìm ra Ma Sói trong vòng!',
    voteToEliminate: 'Bỏ phiếu trục xuất',
    clickPlayerToVote: 'Nhấn vào người chơi trên bảng để bỏ phiếu',
    eliminated: '🚫 Bị trục xuất',
    timeUp: '⏰ Hết giờ thảo luận!',
    noVote: '⚠️ Không ai bị bỏ phiếu, bỏ qua!',
    villageWins: '🏡 Dân Làng Chiến Thắng!',
    villageWinsDesc: 'Dân làng đã dũng cảm tìm ra và tiêu diệt tất cả bầy Ma Sói. Làng bình yên trở lại!',
    wolfWins: '🐺 Ma Sói Chiến Thắng!',
    wolfWinsDesc: 'Bóng tối bao phủ làng. Ma Sói đã chiếm quyền kiểm soát. Dân làng không còn lối thoát...',
    jesterWins: '🃏 Tên Hề Chiến Thắng!',
    jesterWinsDesc: 'đã thành công bị mọi người bỏ phiếu! Thắng lợi độc đáo thuộc về Tên Hề!',
    cupidDone: '💘 Cupid đã chọn đôi tình nhân!',
    seerDone: '🔮 Tiên Tri đã xem bài!',
    doctorDone: '💊 Bác Sĩ đã chọn người bảo vệ!',
    wolfDone: '🐺 Ma Sói đã chọn nạn nhân!',
    witchDone: '🧙‍♀️ Phù Thủy đã quyết định!',
  },
  en: {
    playerNameEmpty: '⚠️ Enter player name!',
    maxPlayers: '⚠️ Maximum 20 players!',
    duplicateName: '⚠️ Name already exists!',
    needMorePlayers: '⚠️ Need at least 4 players!',
    roleMismatch: '⚠️ Role count does not match player count!',
    roles: 'Roles',
    players2: 'Players',
    needWolf: '⚠️ Need at least 1 Werewolf!',
    revealTitle: 'Role Reveal',
    revealInstruct: 'Pass the phone to:',
    startNight: '🌙 Begin the first night!',
    nextPlayer: '➡️ Next Player',
    night: 'Night',
    day: 'Day',
    nightPhase: 'Night Phase',
    nightGuide: 'MC Guide',
    nightStep_sleep: 'MC: "Everyone close your eyes and sleep. Strange things are happening in our village tonight..."',
    nightStep_cupid: 'Cupid wakes up, chooses 2 players to be lovers (Night 1 only). Then goes back to sleep.',
    nightStep_seer: 'Seer wakes up, points at 1 player. MC nods (Werewolf) or shakes head (not Werewolf). Then sleeps.',
    nightStep_doctor: 'Doctor / Guardian wakes up, points at 1 player to protect. Then goes back to sleep.',
    nightStep_wolf: 'Werewolves wake up, recognize each other and point at a victim. Then go back to sleep.',
    nightStep_witch: 'Witch wakes up. MC reveals who was attacked. Witch decides to heal or not, and can poison someone. Then sleeps.',
    nightStep_dawn: 'MC: "Dawn has arrived! Everyone wake up!" → Press confirm to continue to day.',
    done: 'Done ✓',
    whoKilledTitle: '🌙 Who died last night?',
    whoKilledHint: 'Select the player killed by Werewolves (or none if saved)',
    noKill: '✅ Nobody died (saved)',
    cancel: 'Cancel',
    confirm: 'Confirm',
    hunterTitle: '🏹 Hunter\'s Last Shot',
    hunterDesc: 'The Hunter has died! They can shoot 1 player to die with them.',
    skip: 'Skip',
    shoot: '🏹 Shoot!',
    alive: '✅ Alive',
    dead: '💀 Dead',
    noDeathLastNight: 'A peaceful night, nobody died!',
    diedLastNight: 'Died last night',
    dayDiscussion: 'Everyone discuss and find the Werewolves this round!',
    voteToEliminate: 'Vote to Eliminate',
    clickPlayerToVote: 'Tap a player on the board to cast your vote',
    eliminated: '🚫 Eliminated',
    timeUp: '⏰ Discussion time is up!',
    noVote: '⚠️ No votes cast, skipping!',
    villageWins: '🏡 Village Wins!',
    villageWinsDesc: 'The brave villagers tracked down and eliminated all the Werewolves. The village is safe again!',
    wolfWins: '🐺 Werewolves Win!',
    wolfWinsDesc: 'Darkness falls over the village. The Werewolves have taken control. There is no escape for the villagers...',
    jesterWins: '🃏 Jester Wins!',
    jesterWinsDesc: 'successfully got voted out! An unusual victory for the Jester!',
    cupidDone: '💘 Cupid has chosen the lovers!',
    seerDone: '🔮 Seer has investigated a player!',
    doctorDone: '💊 Doctor has chosen someone to protect!',
    wolfDone: '🐺 Werewolves have chosen their victim!',
    witchDone: '🧙‍♀️ Witch has made their decision!',
  }
};

function T(key) {
  return TRANSLATIONS[gameState.lang][key] || TRANSLATIONS['vi'][key] || key;
}
