/**
 * 3D 2048 & Hypercube — Internationalization (i18n) Engine
 * Supported Languages:
 *   - vi: Tiếng Việt (Mặc định)
 *   - en: English
 *   - ja: 日本語
 *   - ko: 한국어
 */

export const DICTIONARY = {
  vi: {
    // Header & Brand
    game_title: '2048',
    score: 'Điểm số',
    best: 'Kỷ lục',
    mode_4x4: '4x4 Cổ điển',
    mode_3x3x3: '3x3x3 Đa tầng',
    mode_tooltip: 'Chọn chế độ không gian (4x4 phẳng hoặc 3x3x3 đa tầng)',
    btn_rush: 'Đua giờ',
    rush_mode_title: '⚡ Đua Giờ',
    rush_bomb_active: '💣 Bom Hẹn Giờ',
    rush_tooltip: 'Chế độ đếm ngược thời gian kịch tính',
    btn_boss: 'Đấu trùm',
    btn_boss_active: 'Đang đấu trùm',
    boss_tooltip: 'Chế độ thử thách đấu trùm 3 giai đoạn',
    btn_ai: 'Tự chơi',
    btn_ai_active: 'Dừng tự chơi',
    ai_tooltip: 'Bật/Tắt chế độ máy tự tính toán và đi từng nước',
    btn_new_game: 'Chơi mới',
    new_game_tooltip: 'Bắt đầu ván chơi mới',
    settings_tooltip: 'Mở Cài đặt hệ thống',

    // Settings Modal
    settings_title: 'Cài Đặt',
    setting_mode: 'Chế độ chơi',
    setting_ai: 'Máy tự chơi',
    setting_lang: 'Ngôn ngữ',
    setting_shape: 'Hình khối 3D',
    setting_theme: 'Giao diện nền',
    setting_fps: 'Tần số quét (FPS)',
    setting_graphics: 'Chất lượng đồ họa & FPS',
    graphics_high: 'Siêu nét (120 FPS / Retina)',
    graphics_medium: 'Cân bằng (60 FPS / Mượt)',
    graphics_low: 'Tiết kiệm pin (30 FPS)',
    setting_audio: 'Âm thanh & Nhạc',
    setting_dpad: 'Phím ảo điều hướng',
    dpad_auto: 'Tự động (Theo thiết bị)',
    dpad_hidden: 'Luôn ẩn',
    dpad_visible: 'Luôn hiện',
    setting_share: 'Chia sẻ điểm',
    btn_share: 'Chia sẻ điểm số',
    share_title: 'Chia Sẻ Điểm Số',
    share_subtitle: 'Khoe thành tích cùng bạn bè qua các mạng xã hội!',
    share_copy: 'Sao chép link',
    share_system: 'Chia sẻ thiết bị',
    share_facebook: 'Facebook',
    share_zalo: 'Zalo',
    share_messenger: 'Messenger',
    share_telegram: 'Telegram',
    share_x: 'X (Twitter)',
    share_whatsapp: 'WhatsApp',
    share_reddit: 'Reddit',
    toast_link_copied: 'Đã sao chép link & điểm số!',
    btn_sfx: 'SFX',
    btn_sfx_off: 'Tắt SFX',
    btn_bgm: 'Nhạc nền',
    btn_bgm_on: 'Nhạc: Bật',
    btn_bgm_off: 'Nhạc: Tắt',

    // Shapes
    shape_cube: 'Khối Bo Góc',
    shape_octahedron: 'Bát Diện Kim Cương',
    shape_sphere: 'Cầu Năng Lượng',
    shape_hex: 'Lăng Trụ Lục Giác',
    shape_pyramid: 'Kim Tự Tháp',
    shape_dodecahedron: 'Thập Nhị Diện',
    shape_torus: 'Vòng Xoáy Năng Lượng',
    shape_auto: 'Tiến Hóa Tự Động',

    // Themes
    theme_group_minimal: 'Phong Cách Hiền Hòa & Tối Giản',
    theme_system: 'Tự động theo trình duyệt (Sáng / Tối)',
    theme_gentle_light: 'Sáng Hiền Hòa (Warm Linen & Sand)',
    theme_gentle_dark: 'Tối Hiền Hòa (Warm Espresso Velvet)',
    theme_zen_clay: 'Sáng Hiền Hòa (Bắc Âu)',
    theme_modern_slate: 'Tối Hiền Hòa (Apple/Linear)',
    theme_group_meme: 'Hình nền Độc Lạ / Meme',
    theme_cat_moon: 'Mèo & Mặt Trăng',
    theme_elmo_fire: 'Elmo Rực Lửa',
    theme_patrick_space: 'Patrick Ngắm Trái Đất',
    theme_group_procedural: 'Không gian Procedural 3D',
    theme_galaxy: 'Vũ Trụ Tinh Vân',
    theme_sunset: 'Hoàng Hôn Synthwave',
    theme_aurora: 'Cực Quang Bắc Cực',
    theme_neon: 'Hyper Neon',
    theme_studio: 'Studio Tối Giản',
    theme_classic: 'Dark Obsidian',
    theme_telemetry: 'Hiệu Năng HUD',
    theme_group_custom: 'Ảnh Tùy Chỉnh',
    theme_custom: 'Ảnh của bạn (Upload)',

    // FPS
    fps_max: 'Tối đa (165Hz/300Hz)',
    fps_120: 'Cân bằng (120 FPS)',
    fps_60: 'Tiết kiệm pin (60 FPS)',

    // Spells
    spell_hint: 'Gợi ý',
    spell_undo: 'Đi lại',
    spell_swap: 'Đổi vị trí',
    spell_hint_title: 'Gợi ý nước đi tối ưu (Phím H)',
    spell_undo_title: 'Đi lại nước trước (Phím Z)',
    spell_swap_title: 'Đổi vị trí 2 khối trên bàn cờ (Phím X)',

    // Slice Controls (3x3x3)
    slice_all: 'Tất cả',
    slice_0: 'Tầng 0',
    slice_1: 'Tầng 1',
    slice_2: 'Tầng 2',
    slice_exploded: 'Tách tầng',

    // Footer Hints
    hint_slide: 'Trượt phẳng',
    hint_layer: 'Lên/Xuống tầng 3D',
    hint_cam: 'Góc nhìn',
    hint_slice: 'Cắt lớp 3D',
    hint_ghost: 'Dự đoán',
    hint_rotate: 'Xoay 3D',
    hint_mobile_swipe: 'Vuốt để trượt khối',
    hint_mobile_rotate: '2 ngón xoay bàn cờ',

    // Modals
    modal_victory_title: 'CHIẾN THẮNG!',
    modal_victory_msg: 'Chúc mừng bạn đã tạo thành công khối 2048!',
    modal_gameover_title: 'THẤT BẠI (GAME OVER)',
    modal_gameover_msg: 'Không còn nước đi hợp lệ nào trên bàn cờ!',
    modal_btn_new_game: 'Chơi ván mới',
    modal_btn_continue: 'Tiếp tục',
    modal_btn_share: 'Chia sẻ điểm',

    // Match Analytics
    stat_time: 'Thời gian',
    stat_moves: 'Số bước',
    stat_apm: 'Tốc độ (APM)',
    stat_max_tile: 'Khối lớn nhất',
    stat_merges: 'Lượt gộp',
    toast_restore_saved: 'Đã khôi phục ván chơi trước!',

    // Welcome & Intro Modal
    help_tooltip: 'Giới thiệu & Hướng dẫn',
    welcome_title: 'Chào mừng bạn đến với 2048 Không Gian 3D!',
    welcome_subtitle: 'Khám phá thế giới giải đố số học không gian 3 chiều mượt mà & đỉnh cao',
    welcome_feat1_title: 'Không Gian 3 Chiều & Đa Tầng',
    welcome_feat1_desc: 'Tự do trượt khối trong không gian 3D. Hỗ trợ bàn cờ 4x4 cổ điển và lồng lập phương 3x3x3 với 6 hướng trượt.',
    welcome_feat2_title: '3 Kỹ Năng Hỗ Trợ Đắc Lực',
    welcome_feat2_desc: 'Gợi ý nước đi (💡), Đi lại bước trước (⏪), và Đổi vị trí khối (⚡). Tạo kỷ lục số mới để hồi thêm lượt dùng!',
    welcome_feat3_title: 'Nhiệm Vụ & Cúp Vàng 3D',
    welcome_feat3_desc: 'Hoàn thành 7 thử thách để mở khóa Cúp Vàng 3D xoay thực tế vinh danh thành tích của bạn.',
    welcome_feat4_title: 'Tự Động Lưu & Bảng Thống Kê',
    welcome_feat4_desc: 'Mọi nước đi được lưu liên tục (tải lại trang không bị mất). Bảng tổng kết chi tiết tốc độ thao tác, thời gian và số bước.',
    welcome_controls_title: 'HƯỚNG DẪN THAO TÁC',
    welcome_device_pc: '💻 Trên máy tính',
    welcome_device_mobile: '📱 Trên điện thoại & máy tính bảng',
    welcome_pc_tip1: 'Phím W / A / S / D hoặc phím mũi tên: Trượt dồn khối số',
    welcome_pc_tip2: 'Phím Q / E: Đổi tầng lên hoặc xuống (chế độ 3x3x3)',
    welcome_pc_tip3: 'Giữ chuột trái và kéo: Xoay tự do góc nhìn bàn cờ 3D',
    welcome_pc_tip4: 'Phím H: Gợi ý • Phím Z: Đi lại • Phím X: Đổi vị trí',
    welcome_mobile_tip1: 'Vuốt 1 ngón tay: Trượt dồn các khối số',
    welcome_mobile_tip2: 'Chạm 2 ngón tay và xoay: Thay đổi góc nhìn 3D',
    welcome_mobile_tip3: 'Thanh kỹ năng bên dưới: Chạm dùng Gợi ý, Đi lại, Đổi vị trí',
    welcome_dont_show: 'Không tự động hiện lại khi mở trang',
    welcome_btn_start: 'Bắt Đầu Chơi Ngay',

    // Mode Confirmation & Tutorial
    mode_confirm_boss_title: 'THỬ THÁCH ĐẤU TRÙM (BOSS RAID)',
    mode_confirm_boss_subtitle: 'Chiến đấu tiêu diệt Dark Singularity Core qua 3 giai đoạn',
    mode_confirm_rush_title: 'THỬ THÁCH ĐUA GIỜ (TIME RUSH)',
    mode_confirm_rush_subtitle: 'Chạy đua với đồng hồ đếm ngược sinh tồn',
    mode_warning_title: 'CẢNH BÁO TIẾN TRÌNH:',
    mode_warning_desc: 'Bắt đầu chế độ này sẽ làm mới toàn bộ bàn cờ và xóa ván chơi dở hiện tại để bắt đầu tính điểm thử thách mới!',
    mode_tutorial_badge_first: '🔥 LẦN ĐẦU TIÊN: ĐỌC KỸ LUẬT CHƠI!',
    mode_tutorial_badge: '💡 LUẬT CHƠI & CƠ CHẾ ĐẶC BIỆT',
    mode_dont_ask: 'Không hỏi lại khi chuyển sang chế độ này',
    mode_btn_cancel: 'Hủy / Quay lại',
    mode_btn_start: 'Xác nhận & Bắt đầu',

    // Boss Rules Details
    rule_boss_goal_title: 'Mục tiêu tối thượng:',
    rule_boss_goal_desc: 'Hạ gục Trùm Hư Không qua 3 giai đoạn (Phase 1: 500 HP ➔ Phase 2: 1,500 HP ➔ Phase 3: 2,048 HP).',
    rule_boss_dmg_title: 'Sát thương số học:',
    rule_boss_dmg_desc: 'Mỗi lần gộp khối sẽ tích tụ năng lượng bắn laser trừ máu Boss (khối càng lớn sát thương càng cao, khối 2048 kết liễu ngay lập tức!).',
    rule_boss_time_title: 'Thời gian nghẹt thở:',
    rule_boss_time_desc: 'Mỗi giai đoạn có thời gian giới hạn. Khi qua màn sẽ được dọn khối rác [2],[4] và cộng thêm thời gian.',
    rule_boss_bonus_title: 'Phép thuật cứu nguy đặc biệt:',
    rule_boss_bonus_desc: 'Nếu đồng hồ điểm về 0s mà Boss vẫn còn máu, mỗi phép bổ trợ (Gợi ý, Đi lại, Đổi vị trí) còn lại sẽ tự động quy đổi thành +15 giây thưởng để tiếp tục trận đấu!',

    // Rush Rules Details
    rule_rush_goal_title: 'Mục tiêu sinh tồn:',
    rule_rush_goal_desc: 'Chạy đua với đồng hồ 30 giây để đạt điểm số kỷ lục cao nhất.',
    rule_rush_time_title: 'Cộng dồn thời gian:',
    rule_rush_time_desc: 'Mỗi lần gộp khối thành công sẽ cộng thêm vài giây quý giá vào đồng hồ.',
    rule_rush_bonus_title: 'Phép thuật cứu nguy đặc biệt:',
    rule_rush_bonus_desc: 'Khi đồng hồ điểm về 0s, mỗi phép bổ trợ còn lại sẽ tự động quy đổi thành +15 giây sinh tồn giúp bạn duy trì combo!',

    // Boss Victory & Achievements
    boss_victory_heading: 'CHIẾN CÔNG HIỂN HÁCH!',
    boss_victory_congrats: 'Nhiệt liệt hoan nghênh và chúc mừng Dũng Sĩ! Bạn đã xuất sắc vượt qua mọi thử thách, tiêu diệt hoàn toàn Trùm Hư Không Singularity qua 3 giai đoạn nghẹt thở!',
    boss_achieve_tier: 'THÀNH TỰU HUYỀN THOẠI ĐÃ MỞ KHÓA',
    boss_achieve_name: 'KẺ HỦY DIỆT HƯ KHÔNG (SINGULARITY SLAYER)',
    boss_achieve_desc: 'Tiêu diệt thành công Dark Singularity Core ở Phase 3 bằng đòn kết liễu khối [2048]!',
    boss_stat_time: 'Thời gian diệt trùm',
    boss_stat_damage: 'Tổng sát thương',
    boss_stat_score: 'Điểm số trận đấu',
    boss_stat_finisher: 'Đòn kết liễu',
    boss_stat_finisher_val: 'Khối 2048 Siêu Cấp',
    boss_btn_share: 'Chia sẻ chiến tích',
    boss_btn_continue: 'Nhận vinh danh & Tiếp tục',

    // Boss Mode
    boss_title: 'BOSS MODE ACTIVATED',
    stage_clear_title: 'STAGE CLEAR!',
    stage_clear_final: 'STAGE CLEAR — 2048 COMPLETE',

    // Dynamic Toasts
    toast_hint_prefix: 'GỢI Ý TỐI ƯU:',
    toast_undo_done: 'Đã đi lại 1 bước!',
    toast_swap_prompt: 'Chạm 2 khối liên tiếp để đổi vị trí!',
    toast_swap_success: 'Đổi vị trí thành công!',
    toast_ai_start: 'AI AUTO-PLAY: ĐANG TỰ ĐỘNG CHƠI...',
    toast_ai_stop: 'AI AUTO-PLAY: ĐÃ TẠM DỪNG',

    // Quests & 3D Trophy
    btn_quests: 'Cúp',
    quests_tooltip: 'Xem nhiệm vụ và Cúp 2048 3D độc quyền',
    trophy_modal_title: 'NHIỆM VỤ & CÚP 2048 ĐỘC QUYỀN',
    trophy_modal_subtitle: 'Hoàn thành 7 nhiệm vụ để mở khóa Cúp Vàng 3D vinh danh bậc thầy',
    trophy_celebrate_btn: 'Tung Pháo Hoa Ăn Mừng',
    trophy_drag_hint: 'Giữ chuột hoặc vuốt để xoay cúp 360°',
    quest_1_title: 'Khởi Đầu Vinh Quang',
    quest_1_desc: 'Tạo thành công khối số 128 trên bàn cờ',
    quest_2_title: 'Bậc Thầy Không Gian',
    quest_2_desc: 'Khám phá cả 3 không gian: 4x4, 3x3x3 và 4D',
    quest_3_title: 'Chiến Binh Thời Gian',
    quest_3_desc: 'Đạt tối thiểu 1,000 điểm trong chế độ Rush',
    quest_4_title: 'Kẻ Khiêu Chiến Hư Không',
    quest_4_desc: 'Gây ít nhất 300 sát thương lên Boss Singularity',
    quest_5_title: 'Pháp Sư Tối Thượng',
    quest_5_desc: 'Thi triển cả 3 phép bổ trợ (Gợi ý, Đi lại, Đổi chỗ)',
    quest_6_title: 'Bão Combo Liên Hoàn',
    quest_6_desc: 'Kích hoạt hợp nhất từ 3 khối trở lên trong 1 nước đi',
    quest_7_title: 'Đỉnh Cao Huyền Thoại',
    quest_7_desc: 'Chinh phục đỉnh cao và tạo ra khối số 2048 vĩ đại'
  },

  en: {
    // Header & Brand
    game_title: '2048',
    score: 'Score',
    best: 'Best',
    mode_4x4: '4x4 Classic',
    mode_3x3x3: '3x3x3 Hypercube',
    mode_tooltip: 'Select spatial dimension (4x4 Flat or 3x3x3 Hypercube)',
    btn_rush: 'Rush',
    rush_mode_title: '⚡ Time Rush',
    rush_bomb_active: '💣 Bombs Active',
    rush_tooltip: 'Time Rush countdown challenge',
    btn_boss: 'Boss',
    btn_boss_active: 'Boss Fight',
    boss_tooltip: 'Boss Mode (3-Phase 3D Energy Core)',
    btn_ai: 'AI',
    btn_ai_active: 'Stop AI',
    ai_tooltip: 'Toggle heuristic AI auto-play solver',
    btn_new_game: 'New Game',
    new_game_tooltip: 'Start a fresh match',
    settings_tooltip: 'Open Game Settings',

    // Settings Modal
    settings_title: 'Settings',
    setting_mode: 'Game Mode',
    setting_ai: 'AI Auto-Play',
    setting_lang: 'Language',
    setting_shape: '3D Tile Shape',
    setting_theme: 'Theme & Backdrop',
    setting_fps: 'FPS Refresh Rate',
    setting_graphics: 'Graphics Quality & FPS',
    graphics_high: 'Ultra (120 FPS / Retina)',
    graphics_medium: 'Balanced (60 FPS)',
    graphics_low: 'Battery Saver (30 FPS)',
    setting_audio: 'Audio & Music',
    setting_dpad: 'Virtual D-Pad',
    dpad_auto: 'Auto (Adaptive)',
    dpad_hidden: 'Always hidden',
    dpad_visible: 'Always visible',
    setting_share: 'Share Score',
    btn_share: 'Share Highscore',
    share_title: 'Share Your Score',
    share_subtitle: 'Show off your highscore across social networks!',
    share_copy: 'Copy Link',
    share_system: 'Device Share',
    share_facebook: 'Facebook',
    share_zalo: 'Zalo',
    share_messenger: 'Messenger',
    share_telegram: 'Telegram',
    share_x: 'X (Twitter)',
    share_whatsapp: 'WhatsApp',
    share_reddit: 'Reddit',
    toast_link_copied: 'Link & score copied to clipboard!',
    btn_sfx: 'SFX',
    btn_sfx_off: 'SFX Off',
    btn_bgm: 'Music',
    btn_bgm_on: 'Music: On',
    btn_bgm_off: 'Music: Off',

    // Shapes
    shape_cube: 'Rounded Cube',
    shape_octahedron: 'Crystal Octahedron',
    shape_sphere: 'Energy Sphere',
    shape_hex: 'Hexagonal Prism',
    shape_pyramid: 'Cyber Pyramid',
    shape_dodecahedron: 'Dodecahedron Gem',
    shape_torus: 'Plasma Torus',
    shape_auto: 'Auto Evolution',

    // Themes
    theme_group_minimal: 'Gentle & Minimalist Aesthetic',
    theme_system: 'Auto System (Light / Dark)',
    theme_gentle_light: 'Gentle Light (Warm Linen & Sand)',
    theme_gentle_dark: 'Gentle Dark (Warm Espresso Velvet)',
    theme_zen_clay: 'Gentle Light (Nordic)',
    theme_modern_slate: 'Gentle Dark (Apple/Linear)',
    theme_group_meme: 'Meme / Special Wallpapers',
    theme_cat_moon: 'Cat & The Moon',
    theme_elmo_fire: 'Elmo in Fire',
    theme_patrick_space: 'Patrick in Space',
    theme_group_procedural: 'Procedural 3D Environments',
    theme_galaxy: 'Cosmic Nebula',
    theme_sunset: 'Synthwave Sunset',
    theme_aurora: 'Arctic Aurora',
    theme_neon: 'Hyper Neon',
    theme_studio: 'Minimal Studio',
    theme_classic: 'Dark Obsidian',
    theme_telemetry: 'Telemetry HUD',
    theme_group_custom: 'Custom Image',
    theme_custom: 'Your Image (Upload)',

    // FPS
    fps_max: 'Maximum (165Hz/300Hz)',
    fps_120: 'Balanced (120 FPS)',
    fps_60: 'Battery Saver (60 FPS)',

    // Spells
    spell_hint: 'Hint',
    spell_undo: 'Undo',
    spell_swap: 'Swap',
    spell_hint_title: 'Get optimal move suggestion (Key H)',
    spell_undo_title: 'Undo previous step (Key Z)',
    spell_swap_title: 'Swap positions of 2 tiles (Key X)',

    // Slice Controls (3x3x3)
    slice_all: 'All',
    slice_0: 'Layer 0',
    slice_1: 'Layer 1',
    slice_2: 'Layer 2',
    slice_exploded: 'Exploded',

    // Footer Hints
    hint_slide: 'Slide Flat',
    hint_layer: 'Up/Down 3D Layer',
    hint_cam: 'Camera View',
    hint_slice: '3D Slice',
    hint_ghost: 'Preview',
    hint_rotate: 'Rotate 3D',
    hint_mobile_swipe: 'Swipe to slide tiles',
    hint_mobile_rotate: '2 fingers rotate board',

    // Modals
    modal_victory_title: 'VICTORY!',
    modal_victory_msg: 'Congratulations! You unlocked the legendary 2048 tile!',
    modal_gameover_title: 'GAME OVER',
    modal_gameover_msg: 'No more legal moves remaining on the board!',
    modal_btn_new_game: 'Play Again',
    modal_btn_continue: 'Continue',
    modal_btn_share: 'Share Score',

    // Match Analytics
    stat_time: 'Time',
    stat_moves: 'Moves',
    stat_apm: 'Speed (APM)',
    stat_max_tile: 'Highest Tile',
    stat_merges: 'Merges',
    toast_restore_saved: 'Restored previous game session!',

    // Welcome & Intro Modal
    help_tooltip: 'Intro & Tutorial',
    welcome_title: 'Welcome to 3D 2048 & Hypercube!',
    welcome_subtitle: 'Experience next-generation 3D spatial number puzzling',
    welcome_feat1_title: '3D Spatial & Hypercube',
    welcome_feat1_desc: 'Slide tiles in real 3D space. Supports classic 4x4 and 6-direction 3x3x3 hypercube.',
    welcome_feat2_title: '3 Powerful Summoner Spells',
    welcome_feat2_desc: 'Smart Hint (💡), Undo (⏪), and Swap (⚡). Merge new milestones to recharge!',
    welcome_feat3_title: 'Missions & Exclusive 3D Trophy',
    welcome_feat3_desc: 'Complete 7 quests to unlock the golden 3D trophy celebrating your mastery.',
    welcome_feat4_title: 'Autosave & Match Analytics',
    welcome_feat4_desc: 'Every move is autosaved on reload. Detailed post-game stats for APM, time & moves.',
    welcome_controls_title: 'QUICK CONTROLS GUIDE',
    welcome_device_pc: '💻 Desktop & Laptop',
    welcome_device_mobile: '📱 Mobile & Tablet',
    welcome_pc_tip1: 'W / A / S / D or Arrow keys: Slide number tiles',
    welcome_pc_tip2: 'Q / E keys: Shift layers up/down (3x3x3 mode)',
    welcome_pc_tip3: 'Left-click & drag: Orbit camera view freely',
    welcome_pc_tip4: 'Key H: Hint • Key Z: Undo • Key X: Swap',
    welcome_mobile_tip1: '1-finger swipe: Slide and merge number tiles',
    welcome_mobile_tip2: '2-finger pinch/drag: Rotate 3D camera view',
    welcome_mobile_tip3: 'Bottom skill bar: Tap to use Hint, Undo, Swap',
    welcome_dont_show: "Don't show automatically on startup",
    welcome_btn_start: 'Start Playing Now',

    // Mode Confirmation & Tutorial
    mode_confirm_boss_title: 'BOSS RAID CHALLENGE',
    mode_confirm_boss_subtitle: 'Defeat the Dark Singularity Core across 3 intense phases',
    mode_confirm_rush_title: 'TIME RUSH CHALLENGE',
    mode_confirm_rush_subtitle: 'Race against the survival countdown clock',
    mode_warning_title: 'PROGRESS WARNING:',
    mode_warning_desc: 'Starting this mode will reset the board and erase your unfinished game to begin fresh challenge scoring!',
    mode_tutorial_badge_first: '🔥 FIRST TIME: READ RULES CAREFULLY!',
    mode_tutorial_badge: '💡 RULES & SPECIAL MECHANICS',
    mode_dont_ask: "Don't ask again when entering this mode",
    mode_btn_cancel: 'Cancel / Return',
    mode_btn_start: 'Confirm & Start',

    // Boss Rules Details
    rule_boss_goal_title: 'Ultimate Objective:',
    rule_boss_goal_desc: 'Defeat the Void Boss across 3 phases (Phase 1: 500 HP ➔ Phase 2: 1,500 HP ➔ Phase 3: 2,048 HP).',
    rule_boss_dmg_title: 'Mathematical Damage:',
    rule_boss_dmg_desc: 'Every merge fires energy lasers at the Boss (larger tiles deal massive damage; tile 2048 executes an instant kill!).',
    rule_boss_time_title: 'Breathless Timer:',
    rule_boss_time_desc: 'Each phase has a countdown timer. Clearing a phase cleanses low tiles [2],[4] and adds bonus time.',
    rule_boss_bonus_title: 'Emergency Spell Bonus:',
    rule_boss_bonus_desc: 'If the timer hits 0s while Boss has HP, each remaining spell (Hint, Undo, Swap) automatically converts into +15s bonus battle time!',

    // Rush Rules Details
    rule_rush_goal_title: 'Survival Goal:',
    rule_rush_goal_desc: 'Race against a 30s timer to achieve the highest possible score.',
    rule_rush_time_title: 'Stacking Bonus Time:',
    rule_rush_time_desc: 'Every successful merge adds precious seconds to your clock.',
    rule_rush_bonus_title: 'Emergency Spell Bonus:',
    rule_rush_bonus_desc: 'When time hits 0s, each remaining spell automatically converts into +15s survival time to keep your combo alive!',

    // Boss Victory & Achievements
    boss_victory_heading: 'GLORIOUS VICTORY!',
    boss_victory_congrats: 'Warmest congratulations, Champion! You have courageously conquered all odds and annihilated the Dark Singularity Core across 3 thrilling phases!',
    boss_achieve_tier: 'LEGENDARY ACHIEVEMENT UNLOCKED',
    boss_achieve_name: 'SINGULARITY SLAYER',
    boss_achieve_desc: 'Annihilated Dark Singularity Core in Phase 3 with a devastating [2048] tile finisher!',
    boss_stat_time: 'Clear Time',
    boss_stat_damage: 'Total Damage',
    boss_stat_score: 'Match Score',
    boss_stat_finisher: 'Finishing Blow',
    boss_stat_finisher_val: 'Legendary 2048 Tile',
    boss_btn_share: 'Share Victory',
    boss_btn_continue: 'Claim Glory & Continue',

    // Boss Mode
    boss_title: 'BOSS MODE ACTIVATED',
    stage_clear_title: 'STAGE CLEAR!',
    stage_clear_final: 'STAGE CLEAR — 2048 COMPLETE',

    // Dynamic Toasts
    toast_hint_prefix: 'OPTIMAL MOVE:',
    toast_undo_done: 'Step undone!',
    toast_swap_prompt: 'Tap 2 tiles in sequence to swap them!',
    toast_swap_success: 'Tiles swapped successfully!',
    toast_ai_start: 'AI AUTO-PLAY: RUNNING...',
    toast_ai_stop: 'AI AUTO-PLAY: PAUSED',

    // Quests & 3D Trophy
    btn_quests: 'Quests',
    quests_tooltip: 'View quests & exclusive 3D 2048 Trophy',
    trophy_modal_title: 'QUESTS & EXCLUSIVE 3D TROPHY',
    trophy_modal_subtitle: 'Complete all 7 quests to unlock the golden 3D Master Trophy',
    trophy_celebrate_btn: 'Celebrate with Confetti',
    trophy_drag_hint: 'Drag or swipe to rotate trophy 360°',
    quest_1_title: 'Glorious Awakening',
    quest_1_desc: 'Successfully merge up to tile 128',
    quest_2_title: 'Dimension Walker',
    quest_2_desc: 'Play all 3 spatial modes: 4x4, 3x3x3 & 4D',
    quest_3_title: 'Rush Vanguard',
    quest_3_desc: 'Score at least 1,000 points in Rush Mode',
    quest_4_title: 'Void Breaker',
    quest_4_desc: 'Deal at least 300 damage to Boss Singularity',
    quest_5_title: 'Spell Weaver',
    quest_5_desc: 'Cast all 3 summoner spells: Hint, Undo, Swap',
    quest_6_title: 'Chain Reaction',
    quest_6_desc: 'Trigger 3 or more merges in a single move',
    quest_7_title: 'The 2048 Sovereign',
    quest_7_desc: 'Conquer the summit and create the legendary 2048 tile'
  },

  ja: {
    // Header & Brand
    game_title: '2048',
    score: 'スコア',
    best: 'ベスト',
    mode_4x4: '4x4 クラシック',
    mode_3x3x3: '3x3x3 ハイパーキューブ',
    mode_tooltip: '空間次元を選択 (4x4 平面または 3x3x3 多層)',
    btn_rush: 'ラッシュ',
    rush_tooltip: 'タイムラッシュ カウントダウン挑戦',
    btn_boss: 'ボス',
    btn_boss_active: 'ボス戦中',
    boss_tooltip: 'ボスモード (3フェーズ 3Dエネルギーコア)',
    btn_ai: 'AI',
    btn_ai_active: 'AI 停止',
    ai_tooltip: 'AI自動プレイを切り替え',
    btn_new_game: '新規',
    new_game_tooltip: '新しいゲームを開始',
    settings_tooltip: 'ゲーム設定を開く',

    // Settings Modal
    settings_title: '設定',
    setting_mode: 'プレイ空間',
    setting_ai: 'AI自動プレイ',
    setting_lang: '言語 (Language)',
    setting_shape: '3Dタイルの形状',
    setting_theme: 'テーマ＆背景',
    setting_fps: 'リフレッシュレート',
    setting_audio: 'サウンド＆音楽',
    setting_dpad: '仮想十字キー',
    dpad_auto: '自動 (PCのみ)',
    dpad_hidden: '常に非表示',
    dpad_visible: '常に表示',
    setting_share: 'スコア共有',
    btn_share: 'スコアを共有する',
    btn_sfx: '効果音',
    btn_sfx_off: '効果音 オフ',
    btn_bgm: 'BGM',
    btn_bgm_on: 'BGM: オン',
    btn_bgm_off: 'BGM: オフ',

    // Shapes
    shape_cube: '角丸キューブ',
    shape_octahedron: 'クリスタル八面体',
    shape_sphere: 'エネルギー球',
    shape_hex: '六角柱',
    shape_pyramid: 'サイバーピラミッド',
    shape_dodecahedron: '十二面体ジェム',
    shape_torus: 'プラズマトーラス',
    shape_auto: '自動進化',

    // Themes
    theme_group_minimal: '優しいミニマリズム様式',
    theme_system: 'ブラウザ自動同期 (ライト / ダーク)',
    theme_gentle_light: '優しいライト (リネン & サンド)',
    theme_gentle_dark: '優しいダーク (ウォームエスプレッソ)',
    theme_zen_clay: '優しいライト (北欧)',
    theme_modern_slate: '優しいダーク (Apple/Linear)',
    theme_group_meme: 'ミーム・特別背景',
    theme_cat_moon: '猫と月',
    theme_elmo_fire: '炎のエルモ',
    theme_patrick_space: '宇宙のパトリック',
    theme_group_procedural: '3D空間エフェクト',
    theme_galaxy: '星雲ギャラクシー',
    theme_sunset: '夕暮れシンセウェーブ',
    theme_aurora: '極光オーロラ',
    theme_neon: 'ハイパーネオン',
    theme_studio: 'ミニマルスタジオ',
    theme_classic: 'ダーク黒曜石',
    theme_telemetry: 'テレメトリHUD',
    theme_group_custom: 'カスタム画像',
    theme_custom: '自分の画像（アップロード）',

    // FPS
    fps_max: '最大 (165Hz/300Hz)',
    fps_120: 'バランス (120 FPS)',
    fps_60: '省電力 (60 FPS)',

    // Spells
    spell_hint: 'ヒント',
    spell_undo: 'やり直し',
    spell_swap: '入替',
    spell_hint_title: '最適な手を提案 (Hキー)',
    spell_undo_title: '1手前に戻す (Zキー)',
    spell_swap_title: '2つのタイルの位置を交換 (Xキー)',

    // Slice Controls (3x3x3)
    slice_all: 'すべて',
    slice_0: '第0層',
    slice_1: '第1層',
    slice_2: '第2層',
    slice_exploded: '階層展開',

    // Footer Hints
    hint_slide: 'スライド',
    hint_layer: '3D層の上下',
    hint_cam: '視点切替',
    hint_slice: '3Dスライス',
    hint_ghost: '予測表示',
    hint_rotate: '3D回転',
    hint_mobile_swipe: 'スワイプで移動',
    hint_mobile_rotate: '2本指で回転',

    // Modals
    modal_victory_title: '勝利！',
    modal_victory_msg: 'おめでとうございます！2048タイルを達成しました！',
    modal_gameover_title: 'ゲームオーバー',
    modal_gameover_msg: '有効な手がなくなりました！',
    modal_btn_new_game: 'もう一度遊ぶ',
    modal_btn_continue: '続ける',
    modal_btn_share: 'スコア共有',

    // Match Analytics
    stat_time: '時間',
    stat_moves: '手',
    stat_apm: '速度 (APM)',
    stat_max_tile: '最大タイル',
    stat_merges: '合体回数',
    toast_restore_saved: '前回のゲームを復元しました！',

    // Welcome & Intro Modal
    help_tooltip: '紹介とガイド',
    welcome_title: '3D 2048 & ハイパーキューブへようこそ！',
    welcome_subtitle: '次世代の3D立体空間パズル体験をお楽しみください',
    welcome_feat1_title: '3D立体空間＆ハイパーキューブ',
    welcome_feat1_desc: 'リアルな3D空間でタイルをスライド。4x4クラシックと6方向3x3x3に対応。',
    welcome_feat2_title: '3つの強力なサマナースペル',
    welcome_feat2_desc: 'スマートヒント (💡)、一手戻す (⏪)、位置交換 (⚡)。新記録でチャージ！',
    welcome_feat3_title: 'ミッション＆限定3Dトロフィー',
    welcome_feat3_desc: '7つのクエストをクリアしてマスター限定の3Dゴールドトロフィーを獲得。',
    welcome_feat4_title: '自動保存＆マッチ詳細分析',
    welcome_feat4_desc: 'リロード時も自動保存。APM、プレイ時間、手数などの詳細データを記録。',
    welcome_controls_title: '操作ガイド',
    welcome_device_pc: '💻 パソコン',
    welcome_device_mobile: '📱 スマートフォン＆タブレット',
    welcome_pc_tip1: 'W / A / S / D または 矢印キー: タイルをスライド',
    welcome_pc_tip2: 'Q / E キー: 上下階層を移動 (3x3x3モード)',
    welcome_pc_tip3: '左ドラッグ: 3D盤面を自由に回転',
    welcome_pc_tip4: 'Hキー: ヒント • Zキー: 戻す • Xキー: 位置交換',
    welcome_mobile_tip1: '1本指スワイプ: タイルをスライド合体',
    welcome_mobile_tip2: '2本指操作: 3D視点を自由に回転',
    welcome_mobile_tip3: '下のボタン: ヒント、戻す、位置交換',
    welcome_dont_show: '次回から自動で表示しない',
    welcome_btn_start: '今すぐプレイ開始',

    // Mode Confirmation & Tutorial
    mode_confirm_boss_title: 'ボスレイドチャレンジ',
    mode_confirm_boss_subtitle: '3段階のダークシンギュラリティコアを撃破せよ',
    mode_confirm_rush_title: 'タイムラッシュチャレンジ',
    mode_confirm_rush_subtitle: '生存をかけたカウントダウンレース',
    mode_warning_title: '進行状況の警告:',
    mode_warning_desc: 'このモードを開始すると盤面がリセットされ、進行中のゲームが消去されて新しいスコア計測が始まります！',
    mode_tutorial_badge_first: '🔥 初回プレイ: ルールをよくお読みください！',
    mode_tutorial_badge: '💡 ルールと特殊メカニクス',
    mode_dont_ask: '次回からこのモード開始時に確認しない',
    mode_btn_cancel: 'キャンセル / 戻る',
    mode_btn_start: '確認して開始',

    // Boss Rules Details
    rule_boss_goal_title: '最終目標:',
    rule_boss_goal_desc: '3段階でボスを撃破 (第1形態: 500 HP ➔ 第2形態: 1,500 HP ➔ 第3形態: 2,048 HP)。',
    rule_boss_dmg_title: '合体ダメージ:',
    rule_boss_dmg_desc: 'タイルを合体させるたびにレーザーを発射 (大きなタイルほど大ダメージ、2048は一撃必殺！)。',
    rule_boss_time_title: '緊迫のタイマー:',
    rule_boss_time_desc: '各フェーズには制限時間があります。突破すると低位タイルが浄化されボーナス時間が追加されます。',
    rule_boss_bonus_title: '緊急呪文救済システム:',
    rule_boss_bonus_desc: 'タイマーが0秒になってもボスが残っている場合、残っている呪文1つにつき+15秒の戦闘時間が付与されます！',

    // Rush Rules Details
    rule_rush_goal_title: '生存目標:',
    rule_rush_goal_desc: '30秒の制限時間内にできるだけ高いスコアを目指します。',
    rule_rush_time_title: 'ボーナスタイム累積:',
    rule_rush_time_desc: 'タイル合体に成功するたびに貴重な秒数がタイマーに加算されます。',
    rule_rush_bonus_title: '緊急呪文救済システム:',
    rule_rush_bonus_desc: 'タイマーが0秒になっても呪文が残っていれば、1つにつき+15秒の生存時間が付与されます！',

    // Boss Victory & Achievements
    boss_victory_heading: '輝かしき大勝利！',
    boss_victory_congrats: '勇者よ、熱烈に祝福します！過酷な試練を乗り越え、3段階のダークシンギュラリティコアを完全に消滅させました！',
    boss_achieve_tier: '伝説の実績が解除されました',
    boss_achieve_name: '虚空の破壊者 (SINGULARITY SLAYER)',
    boss_achieve_desc: '2048タイルの究極合体で第3形態のシンギュラリティコアを完全破壊！',
    boss_stat_time: '討伐時間',
    boss_stat_damage: '総ダメージ',
    boss_stat_score: '最終スコア',
    boss_stat_finisher: '決定打',
    boss_stat_finisher_val: '伝説の2048ブロック',
    boss_btn_share: '戦績をシェア',
    boss_btn_continue: '栄誉を受け取り続ける',

    // Boss Mode
    boss_title: 'ボスモード起動',
    stage_clear_title: 'ステージクリア！',
    stage_clear_final: 'ステージクリア — 2048 達成',

    // Dynamic Toasts
    toast_hint_prefix: '最適手:',
    toast_undo_done: '1手戻しました！',
    toast_swap_prompt: '入れ替える2つのタイルを順番にタップしてください！',
    toast_swap_success: '入れ替えが完了しました！',
    toast_ai_start: 'AI自動プレイ: 実行中...',
    toast_ai_stop: 'AI自動プレイ: 一時停止',

    // Quests & 3D Trophy
    btn_quests: 'クエスト',
    quests_tooltip: 'クエストと限定3Dトロフィーを表示',
    trophy_modal_title: 'クエスト＆限定3Dトロフィー',
    trophy_modal_subtitle: '7つのクエストをすべて完了して限定3Dトロフィーをアンロック',
    trophy_celebrate_btn: '紙吹雪でお祝い',
    trophy_drag_hint: 'ドラッグまたはスワイプでトロフィーを360度回転',
    quest_1_title: '栄光の目覚め',
    quest_1_desc: 'ボード上で128ブロックを作成',
    quest_2_title: '空間の覇者',
    quest_2_desc: '4x4、3x3x3、4Dの3つの次元をすべてプレイ',
    quest_3_title: 'タイムウォリアー',
    quest_3_desc: 'Rushモードで1,000ポイント以上を獲得',
    quest_4_title: '虚空の挑戦者',
    quest_4_desc: 'ボスSingularityに300以上のダメージを与える',
    quest_5_title: '魔法の支配者',
    quest_5_desc: 'ヒント、やり直し、入れ替えの3つの呪文をすべて使用',
    quest_6_title: '連鎖反応の嵐',
    quest_6_desc: '1手で3回以上のブロック合体を達成',
    quest_7_title: '2048の覇王',
    quest_7_desc: '伝説の2048ブロックを作成して頂点に立つ'
  },

  ko: {
    // Header & Brand
    game_title: '2048',
    score: '점수',
    best: '최고 기록',
    mode_4x4: '4x4 클래식',
    mode_3x3x3: '3x3x3 하이퍼큐브',
    mode_tooltip: '공간 차원 선택 (4x4 평면 또는 3x3x3 다층)',
    btn_rush: '러시',
    rush_tooltip: '타임 러시 카운트다운 도전',
    btn_boss: '보스',
    btn_boss_active: '보스전 진행중',
    boss_tooltip: '보스 모드 (3단계 3D 에너지 코어)',
    btn_ai: 'AI',
    btn_ai_active: 'AI 정지',
    ai_tooltip: 'AI 자동 플레이 켜기/끄기',
    btn_new_game: '새 게임',
    new_game_tooltip: '새로운 게임 시작',
    settings_tooltip: '게임 설정 열기',

    // Settings Modal
    settings_title: '설정',
    setting_mode: '플레이 모드',
    setting_ai: 'AI 자동 플레이',
    setting_lang: '언어 (Language)',
    setting_shape: '3D 타일 모양',
    setting_theme: '테마 및 배경',
    setting_fps: '화면 주사율 (FPS)',
    setting_audio: '오디오 및 음악',
    setting_dpad: '가상 D-패드',
    dpad_auto: '자동 (PC 전용)',
    dpad_hidden: '항상 숨김',
    dpad_visible: '항상 표시',
    setting_share: '점수 공유',
    btn_share: '최고 점수 공유',
    btn_sfx: '효과음',
    btn_sfx_off: '효과음 끄기',
    btn_bgm: '배경음악',
    btn_bgm_on: '배경음악: 켜짐',
    btn_bgm_off: '배경음악: 꺼짐',

    // Shapes
    shape_cube: '둥근 큐브',
    shape_octahedron: '크리스탈 팔면체',
    shape_sphere: '에너지 구체',
    shape_hex: '육각기둥',
    shape_pyramid: '사이버 피라미드',
    shape_dodecahedron: '십이면체 보석',
    shape_torus: '플라즈마 토러스',
    shape_auto: '자동 진화',

    // Themes
    theme_group_minimal: '평온한 미니멀리즘 스타일',
    theme_system: '브라우저 자동 (라이트 / 다크)',
    theme_gentle_light: '부드러운 라이트 (린넨 & 샌드)',
    theme_gentle_dark: '아늑한 다크 (에스프레소 벨벳)',
    theme_zen_clay: '부드러운 라이트 (노르딕)',
    theme_modern_slate: '아늑한 다크 (Apple/Linear)',
    theme_group_meme: '밈 / 스페셜 배경',
    theme_cat_moon: '고양이와 달',
    theme_elmo_fire: '불타는 엘모',
    theme_patrick_space: '우주의 뚱이',
    theme_group_procedural: '절차적 3D 환경',
    theme_galaxy: '코스믹 성운',
    theme_sunset: '신스웨이브 노을',
    theme_aurora: '북극 오로라',
    theme_neon: '하이퍼 네온',
    theme_studio: '미니멀 스튜디오',
    theme_classic: '다크 옵시디언',
    theme_telemetry: '원격 측정 HUD',
    theme_group_custom: '사용자 지정 이미지',
    theme_custom: '내 이미지 (업로드)',

    // FPS
    fps_max: '최대 (165Hz/300Hz)',
    fps_120: '균형 (120 FPS)',
    fps_60: '배터리 절약 (60 FPS)',

    // Spells
    spell_hint: '힌트',
    spell_undo: '되돌리기',
    spell_swap: '위치교환',
    spell_hint_title: '최적의 수 추천 (H 키)',
    spell_undo_title: '이전 수 되돌리기 (Z 키)',
    spell_swap_title: '두 타일의 위치 교환 (X 키)',

    // Slice Controls (3x3x3)
    slice_all: '모두',
    slice_0: '0층',
    slice_1: '1층',
    slice_2: '2층',
    slice_exploded: '층 분리',

    // Footer Hints
    hint_slide: '슬라이드',
    hint_layer: '3D 층 이동',
    hint_cam: '카메라 뷰',
    hint_slice: '3D 단면',
    hint_ghost: '예측 보기',
    hint_rotate: '3D 회전',
    hint_mobile_swipe: '밀어서 타일 이동',
    hint_mobile_rotate: '두 손가락으로 회전',

    // Modals
    modal_victory_title: '승리!',
    modal_victory_msg: '축하합니다! 전설의 2048 타일을 달성했습니다!',
    modal_gameover_title: '게임 오버',
    modal_gameover_msg: '더 이상 둘 수 있는 수가 없습니다!',
    modal_btn_new_game: '다시 하기',
    modal_btn_continue: '계속하기',
    modal_btn_share: '점수 공유',

    // Match Analytics
    stat_time: '시간',
    stat_moves: '이동 수',
    stat_apm: '속도 (APM)',
    stat_max_tile: '최고 타일',
    stat_merges: '병합 횟수',
    toast_restore_saved: '이전 게임을 복원했습니다!',

    // Welcome & Intro Modal
    help_tooltip: '소개 및 가이드',
    welcome_title: '3D 2048 & 하이퍼큐브에 오신 것을 환영합니다!',
    welcome_subtitle: '차세대 3D 공간 숫자 퍼즐을 경험해보세요',
    welcome_feat1_title: '3D 공간 & 하이퍼큐브',
    welcome_feat1_desc: '실제 3D 공간에서 타일을 슬라이드하세요. 클래식 4x4 및 6방향 3x3x3 지원.',
    welcome_feat2_title: '3가지 강력한 소환사 주문',
    welcome_feat2_desc: '스마트 힌트 (💡), 실행 취소 (⏪), 위치 교환 (⚡). 신기록 달성 시 충전!',
    welcome_feat3_title: '미션 & 독점 3D 트로피',
    welcome_feat3_desc: '7가지 퀘스트를 완료하여 마스터를 위한 독점 3D 골드 트로피를 획득하세요.',
    welcome_feat4_title: '자동 저장 & 경기 분석',
    welcome_feat4_desc: '새로고침 시 자동 저장. APM, 시간, 이동 횟수 등 상세 경기 분석 제공.',
    welcome_controls_title: '조작 가이드',
    welcome_device_pc: '💻 데스크톱 & 노트북',
    welcome_device_mobile: '📱 모바일 & 태블릿',
    welcome_pc_tip1: 'W / A / S / D 또는 방향키: 타일 슬라이드',
    welcome_pc_tip2: 'Q / E 키: 위/아래 층 이동 (3x3x3 모드)',
    welcome_pc_tip3: '마우스 드래그: 3D 보드 시점 자유 회전',
    welcome_pc_tip4: 'H키: 힌트 • Z키: 되돌리기 • X키: 위치 교환',
    welcome_mobile_tip1: '한 손가락 스와이프: 숫자 타일 합치기',
    welcome_mobile_tip2: '두 손가락 터치: 3D 시점 회전',
    welcome_mobile_tip3: '하단 스킬 버튼: 힌트, 되돌리기, 위치 교환',
    welcome_dont_show: '시작 시 자동으로 표시하지 않기',
    welcome_btn_start: '지금 시작하기',

    // Mode Confirmation & Tutorial
    mode_confirm_boss_title: '보스 레이드 챌린지',
    mode_confirm_boss_subtitle: '3단계의 다크 싱귤래리티 코어를 격파하세요',
    mode_confirm_rush_title: '타임 러시 챌린지',
    mode_confirm_rush_subtitle: '생존을 위한 카운트다운 레이스',
    mode_warning_title: '진행 상황 경고:',
    mode_warning_desc: '이 모드를 시작하면 보드가 새로 고쳐지며 진행 중인 게임이 삭제되고 새로운 챌린지 기록이 시작됩니다!',
    mode_tutorial_badge_first: '🔥 최초 플레이: 규칙을 꼭 읽어보세요!',
    mode_tutorial_badge: '💡 규칙 및 특수 메커니즘',
    mode_dont_ask: '이 모드로 전환할 때 다시 묻지 않기',
    mode_btn_cancel: '취소 / 돌아가기',
    mode_btn_start: '확인 및 시작',

    // Boss Rules Details
    rule_boss_goal_title: '최종 목표:',
    rule_boss_goal_desc: '3단계에 걸쳐 보스를 격파 (1페이즈: 500 HP ➔ 2페이즈: 1,500 HP ➔ 3페이즈: 2,048 HP).',
    rule_boss_dmg_title: '수학적 대미지:',
    rule_boss_dmg_desc: '타일을 병합할 때마다 보스에게 레이저 공격 (큰 타일일수록 큰 피해, 2048은 즉사 결정타!).',
    rule_boss_time_title: '긴박한 타이머:',
    rule_boss_time_desc: '각 페이즈마다 제한 시간이 있으며, 클리어 시 낮은 타일이 정화되고 추가 시간이 지급됩니다.',
    rule_boss_bonus_title: '긴급 주문 보너스 시스템:',
    rule_boss_bonus_desc: '타이머가 0초가 되었을 때 보스 체력이 남아있다면, 남은 주문 1개당 +15초의 추가 전투 시간이 지급됩니다!',

    // Rush Rules Details
    rule_rush_goal_title: '생존 목표:',
    rule_rush_goal_desc: '30초의 제한 시간 내에 가능한 한 높은 점수를 달성하세요.',
    rule_rush_time_title: '보너스 시간 누적:',
    rule_rush_time_desc: '타일 병합에 성공할 때마다 귀중한 초가 시계에 추가됩니다.',
    rule_rush_bonus_title: '긴급 주문 보너스 시스템:',
    rule_rush_bonus_desc: '타이머가 0초가 되었을 때 남은 주문이 있다면, 1개당 +15초의 생존 시간이 지급되어 콤보를 이어갈 수 있습니다!',

    // Boss Victory & Achievements
    boss_victory_heading: '눈부신 대승리!',
    boss_victory_congrats: '용사여, 진심으로 축하합니다! 모든 시련을 딛고 3단계 싱귤래리티 코어를 완전히 소멸시켰습니다!',
    boss_achieve_tier: '전설적인 업적 잠금 해제',
    boss_achieve_name: '공허의 파괴자 (SINGULARITY SLAYER)',
    boss_achieve_desc: '2048 타일 융합으로 3페이즈 싱귤래리티 코어를 완벽히 격파했습니다!',
    boss_stat_time: '격파 시간',
    boss_stat_damage: '총 대미지',
    boss_stat_score: '경기 점수',
    boss_stat_finisher: '결정타',
    boss_stat_finisher_val: '전설의 2048 블록',
    boss_btn_share: '전적 공유하기',
    boss_btn_continue: '영예 수락 및 계속하기',

    // Boss Mode
    boss_title: '보스 모드 활성화',
    stage_clear_title: '스테이지 클리어!',
    stage_clear_final: '스테이지 클리어 — 2048 완성',

    // Dynamic Toasts
    toast_hint_prefix: '최적의 수:',
    toast_undo_done: '1수를 되돌렸습니다!',
    toast_swap_prompt: '위치를 바꿀 2개의 타일을 차례로 터치하세요!',
    toast_swap_success: '타일 위치를 변경했습니다!',
    toast_ai_start: 'AI 자동 재생: 작동 중...',
    toast_ai_stop: 'AI 자동 재생: 일시 중지',

    // Quests & 3D Trophy
    btn_quests: '퀘스트',
    quests_tooltip: '퀘스트 및 독점 3D 트로피 보기',
    trophy_modal_title: '퀘스트 & 독점 3D 트로피',
    trophy_modal_subtitle: '7개 퀘스트를 모두 완료하여 3D 마스터 골드 트로피 잠금 해제',
    trophy_celebrate_btn: '폭죽으로 축하하기',
    trophy_drag_hint: '드래그하거나 스와이프하여 트로피 360도 회전',
    quest_1_title: '영광스러운 각성',
    quest_1_desc: '보드에서 128 블록 생성',
    quest_2_title: '차원의 방랑자',
    quest_2_desc: '4x4, 3x3x3, 4D 3개 공간 모드 모두 플레이',
    quest_3_title: '시간의 전사',
    quest_3_desc: 'Rush 모드에서 1,000점 이상 획득',
    quest_4_title: '공허의 도전자',
    quest_4_desc: '보스 Singularity에게 300 이상의 피해 주기',
    quest_5_title: '주문의 지배자',
    quest_5_desc: '힌트, 되돌리기, 위치 바꾸기 3가지 주문 모두 사용',
    quest_6_title: '연쇄 콤보 폭풍',
    quest_6_desc: '한 번의 이동으로 3회 이상 블록 병합',
    quest_7_title: '전설의 2048',
    quest_7_desc: '정상을 정복하고 전설의 2048 블록 완성'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('3d2048_lang') || 'vi';
    if (!DICTIONARY[this.currentLang]) {
      this.currentLang = 'vi';
    }
  }

  getLanguage() {
    return this.currentLang;
  }

  t(key, fallback = '') {
    const dict = DICTIONARY[this.currentLang] || DICTIONARY.vi;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    const defaultDict = DICTIONARY.vi;
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    return fallback || key;
  }

  setLanguage(lang) {
    if (!DICTIONARY[lang]) return;
    this.currentLang = lang;
    try {
      localStorage.setItem('3d2048_lang', lang);
    } catch {}

    this.applyToDOM();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  applyToDOM() {
    // 1. Text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val !== undefined && val !== '') {
        el.textContent = val;
      }
    });

    // 2. Titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = this.t(key);
      if (val) el.title = val;
    });

    // 3. Optgroup labels
    document.querySelectorAll('optgroup[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label');
      const val = this.t(key);
      if (val) el.label = val;
    });

    // 4. Update html lang attribute
    document.documentElement.lang = this.currentLang;
  }
}

export const i18n = new I18nManager();
export const t = (key, fallback) => i18n.t(key, fallback);
export const setLanguage = (lang) => i18n.setLanguage(lang);
export const getCurrentLanguage = () => i18n.getLanguage();
