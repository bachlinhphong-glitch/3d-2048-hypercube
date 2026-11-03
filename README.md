# 🎮 3D 2048 & Hypercube — WebGL Three.js & GSAP

Tựa game **3D 2048 & 3x3x3 Hypercube** hoàn chỉnh, chạy thuần WebGL với Three.js và GSAP, đạt hiệu năng cực cao **~300 FPS** trên trình duyệt hiện đại.

---

## 🌟 Tính Năng Nổi Bật

### 1. Phép Bổ Trợ (Summoner Spells)
- **💡 Gợi ý (Hint) [Phím H]:** Thuật toán Heuristic thông minh phân tích bàn cờ, dự đoán nước đi tối ưu nhất và thông báo cho người chơi.
- **⏪ Đi lại (Undo) [Phím Z / U]:** Hoàn tác lại nước đi vừa rồi, khôi phục lại toàn bộ bàn cờ 3D và điểm số.
- **⚡ Đổi vị trí (Swap / Flash) [Phím X]:** Dịch chuyển hoán đổi vị trí giữa 2 ô bất kỳ trên bàn cờ bằng thao tác bấm chuột trực tiếp vào khối 3D!
- **⚡ Cơ chế Hồi Chiêu (Recharge):** Khởi đầu với 2 lượt cho mỗi kỹ năng (`2/2`). Mỗi khi người chơi gộp tạo ra một **ô kỷ lục mới** trong ván (8, 16, 32, 64, 128, 256, 512, 1024, 2048...), tất cả các kỹ năng lập tức được **+1 lượt hồi chiêu**!

### 2. Hai Chế Độ Bàn Cờ 3D
- **4x4 Classic:** Bàn cờ phẳng truyền thống với các khối số keycap 3D dày dặn, bo tròn góc cạnh, số in nổi ở mặt trên (+Y) và 4 mặt hông trơn láng bóng bẩy.
- **3x3x3 Hypercube (Lồng không gian 3 chiều):**
  - Gồm 3 tầng x 3 hàng x 3 cột = **27 ô không gian**.
  - Khung lồng 3D xuyên thấu tinh tế, vách ngăn tầng phát sáng.
  - Hỗ trợ di chuyển **6 hướng thực sự**:
    - Ngang: `W / A / S / D` hoặc phím mũi tên `↑ / ↓ / ← / →`.
    - Trục Y (Tầng): Phím `E` / `Space` để đẩy khối lên tầng trên; phím `Q` để ép khối xuống tầng dưới.

### 3. Hệ Thống Điều Khiển Camera 360° & Cắt Lớp
- **Xoay Tự Do 360°:** Giữ chuột phải (PC) hoặc chạm 2 ngón tay xoay (Điện thoại/Tablet) để quan sát mọi góc khuất quanh bàn cờ.
- **Tự Động Xoay Điện Ảnh [Phím R]:** Bật/Tắt chế độ camera tự động xoay 360° vòng quanh bàn cờ.
- **Chuyển Góc Nhanh [Phím 1, 2, 3]:**
  - `Phím 1`: Góc chéo bao quát (Isometric).
  - `Phím 2`: Góc nhìn thẳng từ trên xuống (Top-Down).
  - `Phím 3`: Góc nhìn ngang từng tầng (Front/Side Layer View).
- **Cắt Lớp Đa Tầng [Phím V / Tab]:** Ẩn các tầng trên để nhìn thấu lõi bàn cờ 3x3x3.
- **Dự Đoán Nước Đi [Giữ phím Shift]:** Hiện bóng mờ (Ghost Preview) mô phỏng bàn cờ sau khi trượt trước khi quyết định đi.

### 4. 19 Chế Độ Hình Khối 3D & Tiến Hóa Thiên Hà
- 🧬 **Tiến Hóa (Auto-Evolution):** Tự động tiến hóa hình thái theo cấp số nhân:
  - `2 - 4`: Tiểu hành tinh đá thô ráp (Low-poly Asteroid).
  - `8 - 16`: Hành tinh đất đá bề mặt magma nóng chảy (Emissive Shader).
  - `32 - 64`: Hành tinh khí khổng lồ với vân mây xoáy (Gas Giant).
  - `128 - 256`: Hành tinh có vành đai bụi sáng bao quanh (Saturn-like Rings).
  - `512 - 1024`: Sao lùn phát quang rực rỡ kèm hạt plasma xung quanh.
  - `2048`: Hố đen vũ trụ (Gargantua Black Hole) với đĩa bồi tụ xoay tròn và thấu kính hấp dẫn.
- 🧊 **Bộ sưu tập 13 hình khối đa diện:** Cube, Prism, Hex, Pyramid, Crystal, Gem, Icosa, Capsule, Ring, Knot, Sphere...

### 5. Chiến Dịch Đấu Trùm (Boss Raid 4 Phase) & Time Rush
- **4 Giai Đoạn Đấu Trùm:** Chạm trán Dark Singularity Core, Supernova Boss, Glitch Matrix và Omniverse God với thanh máu thời gian thực, chiêu thức đóng băng ô và hiệu ứng kết liễu 2048.
- **Chế Độ Time Rush:** Đua giờ 30.0s đếm ngược, gỡ bom hẹn giờ và cộng dồn thời gian khi gộp khối liên hoàn.

### 6. Phòng Truyền Thống Cúp 3D & 7 Nhiệm Vụ Vinh Danh
- Mở khóa 2 chiếc cúp 3D huyền thoại: **Cúp Bậc Thầy (UEFA C1 Tai Voi mạ vàng 24K)** và **Cúp Trảm Tướng (Thanh Katana Bất Tử Chém Hắc Ám)** với chế độ ngắm 360° PBR chân thực.

### 7. 14 Chủ Đề Giao Diện (Themes) & Bản Đồ Telemetry
- Galaxy, Cyber Neon, Arctic Aurora, Sunset Synthwave, Studio Minimal, Gentle Light, Gentle Dark, Zen Clay, Modern Slate, Matrix Telemetry, Cat on Moon, Elmo on Fire, Patrick in Space và System Auto.
- **Telemetry HUD:** Đo FPS thực tế, Frame Time (ms), Draw Calls, Triangles, APM và Memory.

### 8. Chia Sẻ Đa Nền Tảng (Multi-App Social Share)
- Hỗ trợ tạo ảnh thẻ điểm số kèm lời thách đấu chia sẻ trực tiếp qua Facebook, Zalo, Messenger, Telegram, X/Twitter, WhatsApp, Reddit hoặc menu chia sẻ hệ thống (Native Share Sheet).

---

## 🚀 Hướng Dẫn Chạy Cục Bộ

### Cách 1: Sử dụng Python (Không cần cài đặt thư viện)
```bash
python server.py
```
Mở trình duyệt tại: **`http://localhost:3000`**

### Cách 2: Sử dụng Vite / Node.js
```bash
npm install
npm run dev
```

Để đóng gói sản phẩm tĩnh:
```bash
npm run build
```

---

## 🛠️ Công Nghệ Sử Dụng
- **Three.js** (Core WebGL Rendering, PBR Physical Materials, ACES Filmic Tone Mapping)
- **GSAP** (Smooth 3D Tweens, Camera Shake, Elastic Pops)
- **Web Audio API** (Procedural Synthesizer Sound Engine)
- **HTML5 Canvas 2D & CSS3 Glassmorphism** (Zero external heavy assets)
- **PWA Service Worker** (Network-First caching, hỗ trợ chơi offline 100%)
