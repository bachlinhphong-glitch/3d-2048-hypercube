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
    mode_4x4: '📦 4x4 Classic',
    mode_3x3x3: '🌌 3x3x3 Hypercube',
    mode_tooltip: 'Chọn chế độ không gian (4x4 phẳng hoặc 3x3x3 đa tầng)',
    btn_rush: 'Rush',
    rush_tooltip: 'Chế độ Time Rush đếm ngược',
    btn_boss: 'Boss',
    btn_boss_active: '⚔️ Đang Đấu Boss',
    boss_tooltip: 'Chế độ Boss Mode (Lõi năng lượng 3 Phase)',
    btn_ai: 'AI',
    btn_ai_active: 'Dừng AI',
    ai_tooltip: 'Bật/Tắt AI tự động tính toán và đi từng nước',
    btn_new_game: 'Chơi mới',
    new_game_tooltip: 'Bắt đầu ván chơi mới',
    settings_tooltip: 'Mở Cài đặt hệ thống',

    // Settings Modal
    settings_title: 'Cài Đặt',
    setting_mode: '🌌 Chế độ chơi',
    setting_ai: '🤖 AI Tự chơi',
    setting_lang: '🌐 Ngôn ngữ',
    setting_shape: '🧊 Hình khối 3D',
    setting_theme: '🎨 Giao diện nền',
    setting_fps: '🚀 Tần số quét (FPS)',
    setting_audio: '🔊 Âm thanh & Nhạc',
    setting_dpad: '🎮 Phím ảo D-Pad',
    dpad_auto: '🎯 Tự động (Chỉ PC)',
    dpad_hidden: '🚫 Luôn ẩn',
    dpad_visible: '🕹️ Luôn hiện',
    setting_share: '📤 Chia sẻ điểm',
    btn_share: '📤 Chia sẻ điểm số',
    btn_sfx: '🔊 SFX',
    btn_sfx_off: '🔇 Tắt SFX',
    btn_bgm: '🎵 Nhạc nền',
    btn_bgm_on: '🎵 Nhạc: Bật',
    btn_bgm_off: '🎵 Nhạc: Tắt',

    // Shapes
    shape_cube: '🧊 Khối Bo Góc',
    shape_octahedron: '💎 Bát Diện Kim Cương',
    shape_sphere: '🔮 Cầu Năng Lượng',
    shape_hex: '⬢ Lăng Trụ Lục Giác',
    shape_pyramid: '🔺 Kim Tự Tháp',
    shape_dodecahedron: '🌟 Thập Nhị Diện',
    shape_torus: '🍩 Vòng Xoáy Năng Lượng',
    shape_auto: '🧬 Tiến Hóa Tự Động',

    // Themes
    theme_group_minimal: '✨ Phong Cách Tối Giản Mới',
    theme_zen_clay: '🌱 Zen Studio (Bắc Âu Sáng)',
    theme_modern_slate: '🖤 Modern Slate (Apple/Linear Tối)',
    theme_group_meme: '🌟 Hình nền Độc Lạ / Meme',
    theme_cat_moon: '🐱 Mèo & Mặt Trăng',
    theme_elmo_fire: '🔥 Elmo Rực Lửa',
    theme_patrick_space: '⭐ Patrick Ngắm Trái Đất',
    theme_group_procedural: '🌌 Không gian Procedural 3D',
    theme_galaxy: '🌌 Vũ Trụ Tinh Vân',
    theme_sunset: '🌅 Hoàng Hôn Synthwave',
    theme_aurora: '❄️ Cực Quang Bắc Cực',
    theme_neon: '⚡ Hyper Neon',
    theme_studio: '🏛️ Studio Tối Giản',
    theme_classic: '🌙 Dark Obsidian',
    theme_telemetry: '📊 Hiệu Năng HUD',
    theme_group_custom: '🖼️ Ảnh Tùy Chỉnh',
    theme_custom: '🖼️ Ảnh của bạn (Upload)',

    // FPS
    fps_max: '🚀 Tối đa (165Hz/300Hz)',
    fps_120: '⚡ Cân bằng (120 FPS)',
    fps_60: '🔋 Tiết kiệm pin (60 FPS)',

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
    slice_exploded: '💥 Tách tầng',

    // Footer Hints
    hint_slide: 'Trượt phẳng',
    hint_layer: 'Lên/Xuống tầng 3D',
    hint_cam: 'Góc nhìn',
    hint_slice: 'Cắt lớp 3D',
    hint_ghost: 'Dự đoán',
    hint_rotate: 'Xoay 3D',
    hint_mobile_swipe: '👆 Vuốt để trượt khối',
    hint_mobile_rotate: '✌️ 2 ngón xoay bàn cờ',

    // Modals
    modal_victory_title: 'CHIẾN THẮNG!',
    modal_victory_msg: 'Chúc mừng bạn đã tạo thành công khối 2048!',
    modal_gameover_title: 'TRÒ CHƠI KẾT THÚC',
    modal_gameover_msg: 'Không còn nước đi hợp lệ nào trên bàn cờ!',
    modal_btn_new_game: 'Chơi ván mới',
    modal_btn_continue: 'Tiếp tục',
    modal_btn_share: '📤 Chia sẻ điểm',

    // Boss Mode
    boss_title: '⚡ BOSS MODE ACTIVATED',
    stage_clear_title: '⚡ STAGE CLEAR!',
    stage_clear_final: 'STAGE CLEAR — 2048 COMPLETE',

    // Dynamic Toasts
    toast_hint_prefix: 'GỢI Ý TỐI ƯU:',
    toast_undo_done: 'Đã đi lại 1 bước!',
    toast_swap_prompt: 'Chạm 2 khối liên tiếp để đổi vị trí!',
    toast_swap_success: 'Đổi vị trí thành công!',
    toast_ai_start: '🤖 AI AUTO-PLAY: ĐANG TỰ ĐỘNG CHƠI...',
    toast_ai_stop: '⏸️ AI AUTO-PLAY: ĐÃ TẠM DỪNG',

    // Quests & 3D Trophy
    btn_quests: 'Cúp & Nhiệm vụ',
    quests_tooltip: 'Xem nhiệm vụ và Cúp 2048 3D độc quyền',
    trophy_modal_title: '🏆 NHIỆM VỤ & CÚP 2048 ĐỘC QUYỀN',
    trophy_modal_subtitle: 'Hoàn thành 7 nhiệm vụ để mở khóa Cúp Vàng 3D vinh danh bậc thầy',
    trophy_celebrate_btn: '🎉 Tung Pháo Hoa Ăn Mừng',
    trophy_drag_hint: '🔄 Giữ chuột hoặc vuốt để xoay cúp 360°',
    quest_1_title: 'Khởi Đầu Vinh Quang',
    quest_1_desc: 'Tạo thành công khối số 128 trên bàn cờ',
    quest_2_title: 'Bậc Thầy Không Gian',
    quest_2_desc: 'Khám phá cả 3 không gian: 4x4, 3x3x3 và 4D',
    quest_3_title: 'Chiến Binh Thời Gian',
    quest_3_desc: 'Đạt tối thiểu 1,000 điểm trong chế độ ⚡ Rush',
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
    mode_4x4: '📦 4x4 Classic',
    mode_3x3x3: '🌌 3x3x3 Hypercube',
    mode_tooltip: 'Select spatial dimension (4x4 Flat or 3x3x3 Hypercube)',
    btn_rush: 'Rush',
    rush_tooltip: 'Time Rush countdown challenge',
    btn_boss: 'Boss',
    btn_boss_active: '⚔️ Boss Fight',
    boss_tooltip: 'Boss Mode (3-Phase 3D Energy Core)',
    btn_ai: 'AI',
    btn_ai_active: 'Stop AI',
    ai_tooltip: 'Toggle heuristic AI auto-play solver',
    btn_new_game: 'New Game',
    new_game_tooltip: 'Start a fresh match',
    settings_tooltip: 'Open Game Settings',

    // Settings Modal
    settings_title: 'Settings',
    setting_mode: '🌌 Game Mode',
    setting_ai: '🤖 AI Auto-Play',
    setting_lang: '🌐 Language',
    setting_shape: '🧊 3D Tile Shape',
    setting_theme: '🎨 Theme & Backdrop',
    setting_fps: '🚀 FPS Refresh Rate',
    setting_audio: '🔊 Audio & Music',
    setting_dpad: '🎮 Virtual D-Pad',
    dpad_auto: '🎯 Auto (Desktop only)',
    dpad_hidden: '🚫 Always hidden',
    dpad_visible: '🕹️ Always visible',
    setting_share: '📤 Share Score',
    btn_share: '📤 Share Highscore',
    btn_sfx: '🔊 SFX',
    btn_sfx_off: '🔇 SFX Off',
    btn_bgm: '🎵 Music',
    btn_bgm_on: '🎵 Music: On',
    btn_bgm_off: '🎵 Music: Off',

    // Shapes
    shape_cube: '🧊 Rounded Cube',
    shape_octahedron: '💎 Crystal Octahedron',
    shape_sphere: '🔮 Energy Sphere',
    shape_hex: '⬢ Hexagonal Prism',
    shape_pyramid: '🔺 Cyber Pyramid',
    shape_dodecahedron: '🌟 Dodecahedron Gem',
    shape_torus: '🍩 Plasma Torus',
    shape_auto: '🧬 Auto Evolution',

    // Themes
    theme_group_minimal: '✨ New Minimalist Aesthetic',
    theme_zen_clay: '🌱 Zen Studio (Nordic Light)',
    theme_modern_slate: '🖤 Modern Slate (Apple/Linear Dark)',
    theme_group_meme: '🌟 Meme / Special Wallpapers',
    theme_cat_moon: '🐱 Cat & The Moon',
    theme_elmo_fire: '🔥 Elmo in Fire',
    theme_patrick_space: '⭐ Patrick in Space',
    theme_group_procedural: '🌌 Procedural 3D Environments',
    theme_galaxy: '🌌 Cosmic Nebula',
    theme_sunset: '🌅 Synthwave Sunset',
    theme_aurora: '❄️ Arctic Aurora',
    theme_neon: '⚡ Hyper Neon',
    theme_studio: '🏛️ Minimal Studio',
    theme_classic: '🌙 Dark Obsidian',
    theme_telemetry: '📊 Telemetry HUD',
    theme_group_custom: '🖼️ Custom Image',
    theme_custom: '🖼️ Your Image (Upload)',

    // FPS
    fps_max: '🚀 Maximum (165Hz/300Hz)',
    fps_120: '⚡ Balanced (120 FPS)',
    fps_60: '🔋 Battery Saver (60 FPS)',

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
    slice_exploded: '💥 Exploded',

    // Footer Hints
    hint_slide: 'Slide Flat',
    hint_layer: 'Up/Down 3D Layer',
    hint_cam: 'Camera View',
    hint_slice: '3D Slice',
    hint_ghost: 'Preview',
    hint_rotate: 'Rotate 3D',
    hint_mobile_swipe: '👆 Swipe to slide tiles',
    hint_mobile_rotate: '✌️ 2 fingers rotate board',

    // Modals
    modal_victory_title: 'VICTORY!',
    modal_victory_msg: 'Congratulations! You unlocked the legendary 2048 tile!',
    modal_gameover_title: 'GAME OVER',
    modal_gameover_msg: 'No more legal moves remaining on the board!',
    modal_btn_new_game: 'Play Again',
    modal_btn_continue: 'Continue',
    modal_btn_share: '📤 Share Score',

    // Boss Mode
    boss_title: '⚡ BOSS MODE ACTIVATED',
    stage_clear_title: '⚡ STAGE CLEAR!',
    stage_clear_final: 'STAGE CLEAR — 2048 COMPLETE',

    // Dynamic Toasts
    toast_hint_prefix: 'OPTIMAL MOVE:',
    toast_undo_done: 'Step undone!',
    toast_swap_prompt: 'Tap 2 tiles in sequence to swap them!',
    toast_swap_success: 'Tiles swapped successfully!',
    toast_ai_start: '🤖 AI AUTO-PLAY: RUNNING...',
    toast_ai_stop: '⏸️ AI AUTO-PLAY: PAUSED',

    // Quests & 3D Trophy
    btn_quests: 'Trophy & Quests',
    quests_tooltip: 'View quests & exclusive 3D 2048 Trophy',
    trophy_modal_title: '🏆 QUESTS & EXCLUSIVE 3D TROPHY',
    trophy_modal_subtitle: 'Complete all 7 quests to unlock the golden 3D Master Trophy',
    trophy_celebrate_btn: '🎉 Celebrate with Confetti',
    trophy_drag_hint: '🔄 Drag or swipe to rotate trophy 360°',
    quest_1_title: 'Glorious Awakening',
    quest_1_desc: 'Successfully merge up to tile 128',
    quest_2_title: 'Dimension Walker',
    quest_2_desc: 'Play all 3 spatial modes: 4x4, 3x3x3 & 4D',
    quest_3_title: 'Rush Vanguard',
    quest_3_desc: 'Score at least 1,000 points in ⚡ Rush Mode',
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
    mode_4x4: '📦 4x4 クラシック',
    mode_3x3x3: '🌌 3x3x3 ハイパーキューブ',
    mode_tooltip: '空間次元を選択 (4x4 平面または 3x3x3 多層)',
    btn_rush: 'ラッシュ',
    rush_tooltip: 'タイムラッシュ カウントダウン挑戦',
    btn_boss: 'ボス',
    btn_boss_active: '⚔️ ボス戦中',
    boss_tooltip: 'ボスモード (3フェーズ 3Dエネルギーコア)',
    btn_ai: 'AI',
    btn_ai_active: 'AI 停止',
    ai_tooltip: 'AI自動プレイを切り替え',
    btn_new_game: '新規',
    new_game_tooltip: '新しいゲームを開始',
    settings_tooltip: 'ゲーム設定を開く',

    // Settings Modal
    settings_title: '設定',
    setting_mode: '🌌 プレイ空間',
    setting_ai: '🤖 AI自動プレイ',
    setting_lang: '🌐 言語 (Language)',
    setting_shape: '🧊 3Dタイルの形状',
    setting_theme: '🎨 テーマ＆背景',
    setting_fps: '🚀 リフレッシュレート',
    setting_audio: '🔊 サウンド＆音楽',
    setting_dpad: '🎮 仮想十字キー',
    dpad_auto: '🎯 自動 (PCのみ)',
    dpad_hidden: '🚫 常に非表示',
    dpad_visible: '🕹️ 常に表示',
    setting_share: '📤 スコア共有',
    btn_share: '📤 スコアを共有する',
    btn_sfx: '🔊 効果音',
    btn_sfx_off: '🔇 効果音 オフ',
    btn_bgm: '🎵 BGM',
    btn_bgm_on: '🎵 BGM: オン',
    btn_bgm_off: '🎵 BGM: オフ',

    // Shapes
    shape_cube: '🧊 角丸キューブ',
    shape_octahedron: '💎 クリスタル八面体',
    shape_sphere: '🔮 エネルギー球',
    shape_hex: '⬢ 六角柱',
    shape_pyramid: '🔺 サイバーピラミッド',
    shape_dodecahedron: '🌟 十二面体ジェム',
    shape_torus: '🍩 プラズマトーラス',
    shape_auto: '🧬 自動進化',

    // Themes
    theme_group_minimal: '✨ 新ミニマリズム様式',
    theme_zen_clay: '🌱 Zenスタジオ (北欧ライト)',
    theme_modern_slate: '🖤 モダン・スレート (ダーク)',
    theme_group_meme: '🌟 ミーム・特別背景',
    theme_cat_moon: '🐱 猫と月',
    theme_elmo_fire: '🔥 炎のエルモ',
    theme_patrick_space: '⭐ 宇宙のパトリック',
    theme_group_procedural: '🌌 3D空間エフェクト',
    theme_galaxy: '🌌 星雲ギャラクシー',
    theme_sunset: '🌅 夕暮れシンセウェーブ',
    theme_aurora: '❄️ 極光オーロラ',
    theme_neon: '⚡ ハイパーネオン',
    theme_studio: '🏛️ ミニマルスタジオ',
    theme_classic: '🌙 ダーク黒曜石',
    theme_telemetry: '📊 テレメトリHUD',
    theme_group_custom: '🖼️ カスタム画像',
    theme_custom: '🖼️ 自分の画像（アップロード）',

    // FPS
    fps_max: '🚀 最大 (165Hz/300Hz)',
    fps_120: '⚡ バランス (120 FPS)',
    fps_60: '🔋 省電力 (60 FPS)',

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
    slice_exploded: '💥 階層展開',

    // Footer Hints
    hint_slide: 'スライド',
    hint_layer: '3D層の上下',
    hint_cam: '視点切替',
    hint_slice: '3Dスライス',
    hint_ghost: '予測表示',
    hint_rotate: '3D回転',
    hint_mobile_swipe: '👆 スワイプで移動',
    hint_mobile_rotate: '✌️ 2本指で回転',

    // Modals
    modal_victory_title: '勝利！',
    modal_victory_msg: 'おめでとうございます！2048タイルを達成しました！',
    modal_gameover_title: 'ゲームオーバー',
    modal_gameover_msg: '有効な手がなくなりました！',
    modal_btn_new_game: 'もう一度遊ぶ',
    modal_btn_continue: '続ける',
    modal_btn_share: '📤 スコア共有',

    // Boss Mode
    boss_title: '⚡ ボスモード起動',
    stage_clear_title: '⚡ ステージクリア！',
    stage_clear_final: 'ステージクリア — 2048 達成',

    // Dynamic Toasts
    toast_hint_prefix: '最適手:',
    toast_undo_done: '1手戻しました！',
    toast_swap_prompt: '入れ替える2つのタイルを順番にタップしてください！',
    toast_swap_success: '入れ替えが完了しました！',
    toast_ai_start: '🤖 AI自動プレイ: 実行中...',
    toast_ai_stop: '⏸️ AI自動プレイ: 一時停止',

    // Quests & 3D Trophy
    btn_quests: 'トロフィー＆クエスト',
    quests_tooltip: 'クエストと限定3Dトロフィーを表示',
    trophy_modal_title: '🏆 クエスト＆限定3Dトロフィー',
    trophy_modal_subtitle: '7つのクエストをすべて完了して限定3Dトロフィーをアンロック',
    trophy_celebrate_btn: '🎉 紙吹雪でお祝い',
    trophy_drag_hint: '🔄 ドラッグまたはスワイプでトロフィーを360度回転',
    quest_1_title: '栄光の目覚め',
    quest_1_desc: 'ボード上で128ブロックを作成',
    quest_2_title: '空間の覇者',
    quest_2_desc: '4x4、3x3x3、4Dの3つの次元をすべてプレイ',
    quest_3_title: 'タイムウォリアー',
    quest_3_desc: '⚡ Rushモードで1,000ポイント以上を獲得',
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
    mode_4x4: '📦 4x4 클래식',
    mode_3x3x3: '🌌 3x3x3 하이퍼큐브',
    mode_tooltip: '공간 차원 선택 (4x4 평면 또는 3x3x3 다층)',
    btn_rush: '러시',
    rush_tooltip: '타임 러시 카운트다운 도전',
    btn_boss: '보스',
    btn_boss_active: '⚔️ 보스전 진행중',
    boss_tooltip: '보스 모드 (3단계 3D 에너지 코어)',
    btn_ai: 'AI',
    btn_ai_active: 'AI 정지',
    ai_tooltip: 'AI 자동 플레이 켜기/끄기',
    btn_new_game: '새 게임',
    new_game_tooltip: '새로운 게임 시작',
    settings_tooltip: '게임 설정 열기',

    // Settings Modal
    settings_title: '설정',
    setting_mode: '🌌 플레이 모드',
    setting_ai: '🤖 AI 자동 플레이',
    setting_lang: '🌐 언어 (Language)',
    setting_shape: '🧊 3D 타일 모양',
    setting_theme: '🎨 테마 및 배경',
    setting_fps: '🚀 화면 주사율 (FPS)',
    setting_audio: '🔊 오디오 및 음악',
    setting_dpad: '🎮 가상 D-패드',
    dpad_auto: '🎯 자동 (PC 전용)',
    dpad_hidden: '🚫 항상 숨김',
    dpad_visible: '🕹️ 항상 표시',
    setting_share: '📤 점수 공유',
    btn_share: '📤 최고 점수 공유',
    btn_sfx: '🔊 효과음',
    btn_sfx_off: '🔇 효과음 끄기',
    btn_bgm: '🎵 배경음악',
    btn_bgm_on: '🎵 배경음악: 켜짐',
    btn_bgm_off: '🎵 배경음악: 꺼짐',

    // Shapes
    shape_cube: '🧊 둥근 큐브',
    shape_octahedron: '💎 크리스탈 팔면체',
    shape_sphere: '🔮 에너지 구체',
    shape_hex: '⬢ 육각기둥',
    shape_pyramid: '🔺 사이버 피라미드',
    shape_dodecahedron: '🌟 십이면체 보석',
    shape_torus: '🍩 플라즈마 토러스',
    shape_auto: '🧬 자동 진화',

    // Themes
    theme_group_minimal: '✨ 새로운 미니멀리즘 스타일',
    theme_zen_clay: '🌱 Zen 스튜디오 (노르딕 라이트)',
    theme_modern_slate: '🖤 모던 슬레이트 (다크)',
    theme_group_meme: '🌟 밈 / 스페셜 배경',
    theme_cat_moon: '🐱 고양이와 달',
    theme_elmo_fire: '🔥 불타는 엘모',
    theme_patrick_space: '⭐ 우주의 뚱이',
    theme_group_procedural: '🌌 절차적 3D 환경',
    theme_galaxy: '🌌 코스믹 성운',
    theme_sunset: '🌅 신스웨이브 노을',
    theme_aurora: '❄️ 북극 오로라',
    theme_neon: '⚡ 하이퍼 네온',
    theme_studio: '🏛️ 미니멀 스튜디오',
    theme_classic: '🌙 다크 옵시디언',
    theme_telemetry: '📊 원격 측정 HUD',
    theme_group_custom: '🖼️ 사용자 지정 이미지',
    theme_custom: '🖼️ 내 이미지 (업로드)',

    // FPS
    fps_max: '🚀 최대 (165Hz/300Hz)',
    fps_120: '⚡ 균형 (120 FPS)',
    fps_60: '🔋 배터리 절약 (60 FPS)',

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
    slice_exploded: '💥 층 분리',

    // Footer Hints
    hint_slide: '슬라이드',
    hint_layer: '3D 층 이동',
    hint_cam: '카메라 뷰',
    hint_slice: '3D 단면',
    hint_ghost: '예측 보기',
    hint_rotate: '3D 회전',
    hint_mobile_swipe: '👆 밀어서 타일 이동',
    hint_mobile_rotate: '✌️ 두 손가락으로 회전',

    // Modals
    modal_victory_title: '승리!',
    modal_victory_msg: '축하합니다! 전설의 2048 타일을 달성했습니다!',
    modal_gameover_title: '게임 오버',
    modal_gameover_msg: '더 이상 둘 수 있는 수가 없습니다!',
    modal_btn_new_game: '다시 하기',
    modal_btn_continue: '계속하기',
    modal_btn_share: '📤 점수 공유',

    // Boss Mode
    boss_title: '⚡ 보스 모드 활성화',
    stage_clear_title: '⚡ 스테이지 클리어!',
    stage_clear_final: '스테이지 클리어 — 2048 완성',

    // Dynamic Toasts
    toast_hint_prefix: '최적의 수:',
    toast_undo_done: '1수를 되돌렸습니다!',
    toast_swap_prompt: '위치를 바꿀 2개의 타일을 차례로 터치하세요!',
    toast_swap_success: '타일 위치를 변경했습니다!',
    toast_ai_start: '🤖 AI 자동 재생: 작동 중...',
    toast_ai_stop: '⏸️ AI 자동 재생: 일시 중지',

    // Quests & 3D Trophy
    btn_quests: '트로피 & 퀘스트',
    quests_tooltip: '퀘스트 및 독점 3D 트로피 보기',
    trophy_modal_title: '🏆 퀘스트 & 독점 3D 트로피',
    trophy_modal_subtitle: '7개 퀘스트를 모두 완료하여 3D 마스터 골드 트로피 잠금 해제',
    trophy_celebrate_btn: '🎉 폭죽으로 축하하기',
    trophy_drag_hint: '🔄 드래그하거나 스와이프하여 트로피 360도 회전',
    quest_1_title: '영광스러운 각성',
    quest_1_desc: '보드에서 128 블록 생성',
    quest_2_title: '차원의 방랑자',
    quest_2_desc: '4x4, 3x3x3, 4D 3개 공간 모드 모두 플레이',
    quest_3_title: '시간의 전사',
    quest_3_desc: '⚡ Rush 모드에서 1,000점 이상 획득',
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
