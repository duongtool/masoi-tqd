const ROLES = [
  {
    id: 'masoi',
    name: 'Ma Sói',
    icon: '🐺',
    team: 'wolf',
    color: 'wolf',
    nightOrder: 1,
    hasNightAction: true,
    desc: 'Mỗi đêm chọn 1 người dân để giết. Ban ngày giả vờ là dân làng để tránh bị lộ.',
    nightDesc: 'Chọn 1 người để tấn công đêm nay.',
    tip: 'Hợp tác với đồng bọn, đừng giết cùng mục tiêu nhiều đêm liên tiếp.',
  },
  {
    id: 'daudan',
    name: 'Đầu Đàn',
    icon: '🦴',
    team: 'wolf',
    color: 'wolf',
    nightOrder: 1,
    hasNightAction: true,
    desc: 'Ma Sói cầm đầu. Biết danh sách toàn bộ đồng bọn. Nếu là con Ma Sói cuối cùng còn sống, phe sói thắng ngay khi số lượng bằng nhau.',
    nightDesc: 'Cùng đồng bọn chọn 1 nạn nhân đêm nay.',
    tip: 'Ưu tiên loại các vai nguy hiểm: Tiên Tri, Bác Sĩ trước.',
  },


  {
    id: 'tienTri',
    name: 'Tiên Tri',
    icon: '🔮',
    team: 'village',
    color: 'special',
    nightOrder: 2,
    hasNightAction: true,
    desc: 'Mỗi đêm chỉ vào 1 người — MC bí mật cho biết người đó là Ma Sói hay Dân (không biết vai cụ thể).',
    nightDesc: 'Chọn 1 người để xem bài.',
    tip: 'Không tiết lộ thân phận quá sớm. Tích lũy thông tin nhiều đêm rồi mới cáo buộc.',
  },
  {
    id: 'bacSi',
    name: 'Bác Sĩ',
    icon: '💉',
    team: 'village',
    color: 'special',
    nightOrder: 3,
    hasNightAction: true,
    desc: 'Mỗi đêm cứu 1 người thoát khỏi đòn của Ma Sói (kể cả bản thân). Không được cứu cùng 1 người 2 đêm liên tiếp.',
    nightDesc: 'Chọn 1 người để cứu đêm nay.',
    tip: 'Thường xuyên tự cứu bản thân ở những đêm đầu nếu chưa biết ai là sói.',
  },
  {
    id: 'phuThuy',
    name: 'Phù Thủy',
    icon: '🧪',
    team: 'village',
    color: 'special',
    nightOrder: 4,
    hasNightAction: true,
    desc: 'Có 2 lọ thuốc, mỗi lọ chỉ dùng 1 lần trong cả game: 🟢 Thuốc cứu (cứu nạn nhân đêm nay) — 🔴 Thuốc giết (hạ độc 1 người bất kỳ).',
    nightDesc: 'Dùng thuốc cứu hoặc giết (hoặc bỏ qua).',
    tip: 'Giữ thuốc giết cho đến khi chắc chắn ai là sói.',
  },
  {
    id: 'veBinh',
    name: 'Vệ Binh',
    icon: '🛡️',
    team: 'village',
    color: 'special',
    nightOrder: 3,
    hasNightAction: true,
    desc: 'Mỗi đêm bảo vệ 1 người khỏi bị Ma Sói giết. Không được bảo vệ cùng 1 người 2 đêm liên tiếp.',
    nightDesc: 'Chọn 1 người để bảo vệ đêm nay.',
    tip: 'Bảo vệ những người quan trọng như Tiên Tri hoặc Bác Sĩ khi nghi ngờ họ bị nhắm.',
  },
  {
    id: 'thamTu',
    name: 'Thám Tử',
    icon: '🕵️',
    team: 'village',
    color: 'special',
    nightOrder: 2,
    hasNightAction: true,
    desc: 'Mỗi đêm chỉ vào 2 người — MC cho biết 2 người đó có cùng phe không (không biết vai cụ thể).',
    nightDesc: 'Chọn 2 người để so sánh phe.',
    tip: 'Dùng kết quả để xây dựng bản đồ phe phái qua nhiều đêm.',
  },
  {
    id: 'thoSan',
    name: 'Thợ Săn',
    icon: '🏹',
    team: 'village',
    color: 'special',
    nightOrder: 99,
    hasNightAction: false,
    desc: 'Khi bị giết (dù ban đêm hay bị bỏ phiếu ban ngày), ngay lập tức bắn chết 1 người bất kỳ còn sống.',
    nightDesc: '',
    tip: 'Hãy quan sát kỹ. Khi bị giết, bắn đúng người sẽ có thể lật ngược tình thế.',
  },
  {
    id: 'nguoiHoaSoi',
    name: 'Người Hóa Sói',
    icon: '🌀',
    team: 'village',
    color: 'special',
    nightOrder: 99,
    hasNightAction: false,
    desc: 'Ban đầu là dân làng bình thường. Nếu bị Ma Sói tấn công nhưng được cứu sống (bởi Bác Sĩ hoặc Vệ Binh), đêm sau sẽ hóa thành Ma Sói.',
    nightDesc: '',
    tip: 'Tiên Tri xem sẽ thấy là Dân cho đến khi hóa sói.',
  },
  {
    id: 'thiTruong',
    name: 'Thị Trưởng',
    icon: '🎖️',
    team: 'village',
    color: 'village',
    nightOrder: 99,
    hasNightAction: false,
    desc: 'Phiếu bầu của Thị Trưởng có giá trị x2. Khi Thị Trưởng chết (dù vì lý do gì), họ được quyền chỉ định người kế nhiệm.',
    nightDesc: '',
    tip: 'Đừng công khai thân phận Thị Trưởng quá sớm.',
  },


  {
    id: 'tenHe',
    name: 'Tên Hề',
    icon: '🎭',
    team: 'neutral',
    color: 'neutral',
    nightOrder: 99,
    hasNightAction: false,
    desc: 'Mục tiêu duy nhất là bị dân làng bầu loại! Nếu bị đa số phiếu loại ban ngày → Tên Hề thắng một mình, game kết thúc.',
    nightDesc: '',
    tip: 'Hành động thật đáng ngờ nhưng đừng lộ liễu quá. Khiến dân bầu bạn một cách "tự nguyện".',
  },


  {
    id: 'dan',
    name: 'Dân Làng',
    icon: '👨‍🌾',
    team: 'village',
    color: 'village',
    nightOrder: 99,
    hasNightAction: false,
    desc: 'Người dân bình thường, không có kỹ năng đặc biệt. Sứ mệnh: quan sát, suy luận và bỏ phiếu đúng người để loại Ma Sói.',
    nightDesc: '',
    tip: 'Chú ý ngôn ngữ cơ thể và mâu thuẫn trong lời nói của người khác.',
  },
];

// Role distribution theo số người
function buildRoleDistribution(playerCount) {
  const n = playerCount;
  const get = (id) => ROLES.find(r => r.id === id);
  const arr = [];

  const wolfCount = Math.max(1, Math.floor(n / 4));

  if (n >= 18) {
    // Full game
    arr.push(get('daudan'));
    for (let i = 1; i < wolfCount; i++) arr.push(get('masoi'));
    arr.push(get('tienTri'), get('bacSi'), get('phuThuy'), get('thoSan'));
    arr.push(get('veBinh'), get('thamTu'), get('nguoiHoaSoi'));
    arr.push(get('thiTruong'), get('tenHe'));
  } else if (n >= 12) {
    arr.push(get('daudan'));
    for (let i = 1; i < wolfCount; i++) arr.push(get('masoi'));
    arr.push(get('tienTri'), get('bacSi'), get('phuThuy'), get('thoSan'), get('veBinh'));
  } else if (n >= 8) {
    for (let i = 0; i < wolfCount; i++) arr.push(get('masoi'));
    arr.push(get('tienTri'), get('bacSi'), get('phuThuy'), get('thoSan'));
  } else {
    // Small / test
    arr.push(get('masoi'), get('tienTri'), get('bacSi'));
  }

  while (arr.length < n) arr.push(get('dan'));
  return arr.slice(0, n);
}
