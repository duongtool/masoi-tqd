// ================================================
//   MA SÓI - WEREWOLF | T Q D 💗
//   Roles Data (Bilingual: Vietnamese + English)
// ================================================

const ROLES_DATA = [
  // ---- WOLF TEAM ----
  {
    id: 'werewolf',
    emoji: '🐺',
    team: 'wolf',
    name: { vi: 'Ma Sói', en: 'Werewolf' },
    tag: { vi: 'Phe Sói', en: 'Wolf Team' },
    desc: {
      vi: 'Mỗi đêm, Ma Sói thức dậy, nhận mặt đồng đội và cùng chọn một dân làng để tiêu diệt. Ban ngày, chúng giả vờ vô tội để tránh bị bỏ phiếu.',
      en: 'Each night, Werewolves wake up, recognize each other and choose a villager to eliminate. During the day, they act innocent to avoid being voted out.'
    },
    ability: { vi: '🌙 Đêm: Chọn 1 người để giết', en: '🌙 Night: Choose 1 player to kill' },
    winCondition: { vi: 'Thắng khi số Sói ≥ số Dân làng còn lại', en: 'Win when Wolves ≥ remaining Villagers' },
    nightOrder: 3,
    defaultCount: 2,
    maxCount: 5,
  },
  {
    id: 'alpha_wolf',
    emoji: '👑🐺',
    team: 'wolf',
    name: { vi: 'Đầu Đàn', en: 'Alpha Wolf' },
    tag: { vi: 'Phe Sói', en: 'Wolf Team' },
    desc: {
      vi: 'Là Ma Sói mạnh nhất. Nếu bị tiên tri soi, vẫn hiện lên là dân làng. Có thể hô to "Sói!" một lần trong game để giết ngay ban ngày.',
      en: 'The strongest Werewolf. Even when investigated by the Seer, appears as a Villager. Can once shout "Wolf!" during day to eliminate instantly.'
    },
    ability: { vi: '🌙 Đêm: Ẩn danh trước Tiên tri | ☀️ Ngày: 1 lần giết ngay', en: '🌙 Night: Hidden from Seer | ☀️ Day: 1-time instant kill' },
    winCondition: { vi: 'Thắng khi số Sói ≥ số Dân làng còn lại', en: 'Win when Wolves ≥ remaining Villagers' },
    nightOrder: 3,
    defaultCount: 0,
    maxCount: 1,
  },

  // ---- VILLAGE TEAM ----
  {
    id: 'villager',
    emoji: '🧑‍🌾',
    team: 'village',
    name: { vi: 'Dân Làng', en: 'Villager' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Không có năng lực đặc biệt nào. Vũ khí duy nhất là khả năng suy luận và thuyết phục mọi người bỏ phiếu đúng người.',
      en: 'No special ability. The only weapon is deduction and persuasion to vote out the right person.'
    },
    ability: { vi: '☀️ Ngày: Bỏ phiếu loại người bị nghi ngờ', en: '☀️ Day: Vote to eliminate suspects' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 0,
    defaultCount: 3,
    maxCount: 15,
  },
  {
    id: 'seer',
    emoji: '🔮',
    team: 'village',
    name: { vi: 'Tiên Tri', en: 'Seer' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Mỗi đêm, Tiên tri thức dậy và chỉ vào bất kỳ người nào. MC sẽ gật đầu (Ma Sói) hoặc lắc đầu (không phải Ma Sói). Thông tin này cực kỳ giá trị nhưng cần khéo léo chia sẻ.',
      en: "Each night, the Seer wakes up and points at any player. The MC nods (Werewolf) or shakes head (not Werewolf). This information is extremely valuable but must be shared carefully."
    },
    ability: { vi: '🌙 Đêm: Xem căn bản của 1 người chơi', en: '🌙 Night: Check 1 player\'s alignment' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 1,
    defaultCount: 1,
    maxCount: 1,
  },
  {
    id: 'doctor',
    emoji: '💊',
    team: 'village',
    name: { vi: 'Bác Sĩ', en: 'Doctor' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Mỗi đêm, Bác sĩ thức dậy và chọn 1 người để bảo vệ. Người đó sẽ không chết đêm nay dù bị Ma Sói chọn. Bác sĩ có thể bảo vệ chính mình nhưng không quá 2 đêm liên tiếp.',
      en: 'Each night, the Doctor wakes up and chooses 1 player to protect. That player cannot die this night even if targeted by Werewolves. Cannot protect the same person two nights in a row.'
    },
    ability: { vi: '🌙 Đêm: Bảo vệ 1 người khỏi cái chết', en: '🌙 Night: Protect 1 player from death' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 2,
    defaultCount: 1,
    maxCount: 1,
  },
  {
    id: 'witch',
    emoji: '🧙‍♀️',
    team: 'village',
    name: { vi: 'Phù Thủy', en: 'Witch' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Phù thủy có 1 lọ thuốc hồi sinh và 1 lọ thuốc độc. Mỗi đêm, MC cho biết ai bị Sói chọn, Phù thủy có thể dùng thuốc cứu hoặc thuốc độc giết 1 người khác. Mỗi lọ chỉ dùng 1 lần.',
      en: 'The Witch has 1 healing potion and 1 poison. Each night, the MC reveals who was attacked. The Witch can save that person or poison anyone else. Each potion can only be used once.'
    },
    ability: { vi: '🌙 Đêm: 1 lần cứu người + 1 lần giết người (suốt game)', en: '🌙 Night: 1 save + 1 poison potion (entire game)' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 4,
    defaultCount: 1,
    maxCount: 1,
  },
  {
    id: 'hunter',
    emoji: '🏹',
    team: 'village',
    name: { vi: 'Thợ Săn', en: 'Hunter' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Khi Thợ Săn bị chết (dù bị Sói giết hay bị bỏ phiếu), anh ta được quyền chỉ định 1 người chơi khác cùng chết theo. Đây là vũ khí bí mật đáng gờm.',
      en: 'When the Hunter dies (killed by wolves or voted out), they can choose 1 other player to die with them. This is a formidable secret weapon.'
    },
    ability: { vi: '💀 Khi chết: Bắn 1 người theo cùng', en: '💀 Upon death: Shoot 1 player down with them' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 0,
    defaultCount: 1,
    maxCount: 1,
  },
  {
    id: 'cupid',
    emoji: '💘',
    team: 'village',
    name: { vi: 'Thần Tình Yêu', en: 'Cupid' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Đêm đầu tiên, Cupid thức dậy và nối 2 người chơi bất kỳ thành đôi tình nhân. Nếu 1 trong 2 chết, người kia cũng chết theo vì đau khổ. Nếu 2 người yêu nhau là Sói + Dân, phe thắng riêng khi cả 2 còn sống cuối cùng.',
      en: 'On the first night, Cupid links 2 players as lovers. If one dies, the other dies of heartbreak. If lovers are Wolf + Villager, they win together as a separate team if both survive.'
    },
    ability: { vi: '🌙 Đêm 1: Nối 2 người thành đôi tình nhân', en: '🌙 Night 1: Link 2 players as lovers' },
    winCondition: { vi: 'Dân thắng; hoặc thắng riêng nếu là đôi tình nhân còn lại cuối cùng', en: 'Village wins; or wins separately as last surviving lover couple' },
    nightOrder: 0,
    defaultCount: 0,
    maxCount: 1,
  },

  // ---- SPECIAL / NEUTRAL ----
  {
    id: 'jester',
    emoji: '🃏',
    team: 'special',
    name: { vi: 'Tên Hề', en: 'Jester' },
    tag: { vi: 'Trung lập', en: 'Neutral' },
    desc: {
      vi: 'Mục tiêu là bị mọi người bỏ phiếu loại vào ban ngày! Tên Hề thắng một mình nếu bị trục xuất bởi bỏ phiếu. Nếu Sói giết, coi như thua. Hãy hành động thật khả nghi!',
      en: 'The goal is to get voted out during the day! The Jester wins alone if eliminated by vote. If killed by wolves, loses. Act as suspiciously as possible!'
    },
    ability: { vi: '☀️ Mục tiêu: Bị mọi người bỏ phiếu loại', en: '☀️ Goal: Get voted out by players' },
    winCondition: { vi: 'Thắng một mình khi bị bỏ phiếu loại', en: 'Wins alone when voted out' },
    nightOrder: 0,
    defaultCount: 0,
    maxCount: 1,
  },
  {
    id: 'guardian',
    emoji: '🛡️',
    team: 'village',
    name: { vi: 'Vệ Binh', en: 'Guardian Angel' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Mỗi đêm, Vệ Binh chọn 1 người bảo vệ khỏi bị tiêu diệt. Khác với Bác sĩ, Vệ Binh có thể bảo vệ cùng 1 người nhiều đêm liên tiếp nhưng chỉ chặn được 2 lần tiến công trong suốt game.',
      en: 'Each night, the Guardian chooses 1 player to protect. Unlike the Doctor, can protect the same person multiple nights but can only block 2 attacks total in the game.'
    },
    ability: { vi: '🌙 Đêm: Bảo vệ 1 người (tối đa 2 lần suốt game)', en: '🌙 Night: Protect 1 player (max 2 times per game)' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 2,
    defaultCount: 0,
    maxCount: 1,
  },
  {
    id: 'detective',
    emoji: '🕵️',
    team: 'village',
    name: { vi: 'Thám Tử', en: 'Detective' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Thám tử chọn 2 người mỗi đêm. MC tiết lộ xem 2 người này có cùng phe hay không (không nói phe nào). Kỹ năng suy luận sẽ giúp lần ra danh tính Ma Sói.',
      en: 'The Detective chooses 2 players each night. The MC reveals whether these 2 players are on the same team (without saying which). Deduction skills help identify werewolves.'
    },
    ability: { vi: '🌙 Đêm: Hỏi MC xem 2 người có cùng phe không', en: '🌙 Night: Ask MC if 2 players share the same team' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 1,
    defaultCount: 0,
    maxCount: 1,
  },
  {
    id: 'mayor',
    emoji: '🏅',
    team: 'village',
    name: { vi: 'Thị Trưởng', en: 'Mayor' },
    tag: { vi: 'Phe Dân', en: 'Village Team' },
    desc: {
      vi: 'Thị Trưởng có thể công bố danh tính của mình bất kỳ lúc nào. Khi đó, phiếu bầu của Thị Trưởng được tính gấp đôi. Nhưng hãy cẩn thận – Ma Sói sẽ ưu tiên tiêu diệt bạn!',
      en: 'The Mayor can reveal their identity at any time. When revealed, their vote counts double. But beware – Werewolves will prioritize eliminating you!'
    },
    ability: { vi: '☀️ Ngày: Công bố danh tính → phiếu đôi', en: '☀️ Day: Reveal identity → double vote power' },
    winCondition: { vi: 'Thắng khi tất cả Ma Sói bị loại', en: 'Win when all Werewolves are eliminated' },
    nightOrder: 0,
    defaultCount: 0,
    maxCount: 1,
  },
  {
    id: 'lycan',
    emoji: '😈',
    team: 'wolf',
    name: { vi: 'Người Hóa Sói', en: 'Lycan' },
    tag: { vi: 'Phe Sói', en: 'Wolf Team' },
    desc: {
      vi: 'Trông giống Dân làng bình thường nhưng thức dậy cùng Ma Sói vào ban đêm. Tiên tri soi vẫn ra là Ma Sói. Không biết mình là Ma Sói cho đến khi được thông báo vào đêm đầu.',
      en: 'Looks like a regular Villager but wakes up with Werewolves at night. The Seer will identify them as Werewolf. Does not know their own role until told on the first night.'
    },
    ability: { vi: '🌙 Đêm: Thức cùng Ma Sói | Tiên tri nhận ra là Sói', en: '🌙 Night: Wakes with Wolves | Seer identifies as Wolf' },
    winCondition: { vi: 'Thắng khi số Sói ≥ số Dân làng còn lại', en: 'Win when Wolves ≥ remaining Villagers' },
    nightOrder: 3,
    defaultCount: 0,
    maxCount: 2,
  },
];

// Avatars for players
const PLAYER_AVATARS = ['🐱','🐶','🦊','🐼','🐨','🦁','🐯','🐻','🦋','🐸','🦅','🐺','🦉','🐲','🌹','⭐','🌙','☀️','🔥','💎'];

// Night order for MC instructions
function getNightOrder(roles) {
  const order = [];
  const unique = [...new Set(roles)];
  unique.sort((a, b) => {
    const ra = ROLES_DATA.find(r => r.id === a);
    const rb = ROLES_DATA.find(r => r.id === b);
    return (ra?.nightOrder || 0) - (rb?.nightOrder || 0);
  });
  return unique.filter(id => {
    const r = ROLES_DATA.find(rd => rd.id === id);
    return r && r.nightOrder > 0;
  });
}
