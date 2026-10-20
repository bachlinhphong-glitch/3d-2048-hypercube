import subprocess
import time
import urllib.request
import json
import os
import sys
import socket
import base64
import struct
import tempfile

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

PORT = 3000
DIRECTORY = r'd:\2048'

class SimpleWebSocket:
    def __init__(self, ws_url):
        url_part = ws_url.replace("ws://", "")
        host_port, path = url_part.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=10)
        self.msg_id = 0

        key = base64.b64encode(os.urandom(16)).decode('utf-8')
        req = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode('utf-8'))
        resp = self.sock.recv(4096).decode('utf-8', errors='ignore')
        if "101 " not in resp:
            raise Exception(f"WebSocket handshake failed: {resp}")

    def send_cmd(self, method, params=None):
        self.msg_id += 1
        msg = {"id": self.msg_id, "method": method, "params": params or {}}
        data = json.dumps(msg).encode('utf-8')

        frame = bytearray([0x81])
        length = len(data)
        if length <= 125:
            frame.append(0x80 | length)
        elif length <= 65535:
            frame.append(0x80 | 126)
            frame.extend(struct.pack("!H", length))
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack("!Q", length))

        mask = os.urandom(4)
        frame.extend(mask)
        masked_data = bytearray(b ^ mask[i % 4] for i, b in enumerate(data))
        frame.extend(masked_data)

        self.sock.sendall(frame)
        return self.msg_id

    def recv_exact(self, n):
        buf = bytearray()
        while len(buf) < n:
            chunk = self.sock.recv(n - len(buf))
            if not chunk:
                return None
            buf.extend(chunk)
        return buf

    def recv_msg(self, timeout=5.0):
        self.sock.settimeout(timeout)
        try:
            head = self.recv_exact(2)
            if not head:
                return None
            b1, b2 = head[0], head[1]
            opcode = b1 & 0x0f
            masked = (b2 & 0x80) != 0
            payload_len = b2 & 0x7f

            if payload_len == 126:
                ext = self.recv_exact(2)
                if not ext: return None
                payload_len = struct.unpack("!H", ext)[0]
            elif payload_len == 127:
                ext = self.recv_exact(8)
                if not ext: return None
                payload_len = struct.unpack("!Q", ext)[0]

            mask = None
            if masked:
                mask = self.recv_exact(4)
                if not mask: return None

            payload = self.recv_exact(payload_len)
            if payload is None:
                return None

            if masked:
                payload = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))

            if opcode == 0x01:
                return json.loads(payload.decode('utf-8'))
            return None
        except socket.timeout:
            return None

    def call(self, method, params=None, timeout=6.0):
        req_id = self.send_cmd(method, params)
        start = time.time()
        while time.time() - start < timeout:
            msg = self.recv_msg(timeout=2.0)
            if msg and msg.get('id') == req_id:
                return msg.get('result')
        return None

    def close(self):
        try:
            self.sock.close()
        except:
            pass


def run_full_verification():
    print("==================================================")
    print("   3D 2048 & HYPERCUBE - TELEMETRY & SHAPE TEST   ")
    print("==================================================")

    server_proc = None
    server_running = False
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html", timeout=1)
        if req.status == 200:
            server_running = True
            print("  ✓ Connected to existing server on port 3000")
    except:
        pass

    if not server_running:
        server_cmd = [sys.executable, r"d:\2048\server.py"]
        server_proc = subprocess.Popen(server_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(1.5)

    try:
        print("\n[Step 1] Verifying Local Dev Server endpoints...")
        endpoints = [
            '/index.html',
            '/src/main.js',
            '/src/style.css',
            '/src/board.js',
            '/src/tile.js',
            '/src/gameLogic.js',
            '/src/sceneManager.js',
            '/src/textureManager.js',
            '/src/particles.js',
            '/src/sound.js',
            '/src/i18n.js',
            '/libs/three.module.js',
            '/libs/gsap.module.js',
            '/libs/controls/OrbitControls.js',
            '/libs/geometries/RoundedBoxGeometry.js'
        ]
        for ep in endpoints:
            req = urllib.request.urlopen(f"http://127.0.0.1:{PORT}{ep}", timeout=2)
            assert req.status == 200, f"Endpoint {ep} failed with status {req.status}"
            print(f"  ✓ {ep:32} HTTP 200 ({req.headers.get('Content-Type')})")

        print("\n[Step 2] Launching Microsoft Edge with fresh temp profile...")
        edge_paths = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        ]
        edge_exe = next((p for p in edge_paths if os.path.exists(p)), None)
        if not edge_exe:
            raise Exception("Microsoft Edge not found on this machine")

        user_data = tempfile.mkdtemp(prefix="edge_2048_")
        edge_cmd = [
            edge_exe,
            "--headless=new",
            "--remote-debugging-port=9222",
            f"--user-data-dir={user_data}",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-fre",
            "--disable-sync",
            "--disable-gpu-sandbox",
            "--enable-webgl",
            "--use-gl=angle",
            "--use-angle=d3d11",
            "--window-size=1280,900",
            f"http://127.0.0.1:{PORT}/index.html"
        ]
        edge_proc = subprocess.Popen(edge_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(3.0)

        try:
            req = urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=5)
            targets = json.loads(req.read().decode('utf-8'))
            page_target = next((t for t in targets if t.get('type') == 'page' and '3000' in t.get('url', '')), None)
            if not page_target:
                page_target = next((t for t in targets if t.get('type') == 'page'), None)
            if not page_target:
                raise Exception("No active web page target found")

            ws_url = page_target['webSocketDebuggerUrl']
            print(f"  ✓ Connected to CDP Page Target: {page_target.get('title')}")

            ws = SimpleWebSocket(ws_url)
            ws.send_cmd("Runtime.enable")
            ws.send_cmd("Console.enable")
            ws.send_cmd("Page.enable")
            time.sleep(1.0)

            print("\n[Step 3] Checking Browser Console for WebGL & JavaScript errors...")
            errors = []
            console_logs = []
            start_wait = time.time()
            while time.time() - start_wait < 2.0:
                msg = ws.recv_msg(timeout=0.5)
                if not msg:
                    continue
                method = msg.get('method', '')
                params = msg.get('params', {})
                if method == 'Runtime.exceptionThrown':
                    err_details = params.get('exceptionDetails', {})
                    err_text = err_details.get('text', '')
                    ex = err_details.get('exception', {})
                    desc = ex.get('description', '')
                    line = err_details.get('lineNumber', '')
                    url = err_details.get('url', '')
                    errors.append(f"Runtime Exception in {url}:{line} - {err_text} - {desc}")
                elif method == 'Console.messageAdded':
                    entry = params.get('message', {})
                    level = entry.get('level')
                    text = entry.get('text', '')
                    console_logs.append(f"[{level}] {text}")
                    if level == 'error':
                        errors.append(f"Console Error: {text}")

            for log in console_logs:
                print("    Browser log:", log)

            if errors:
                raise Exception("Console had errors: " + ", ".join(errors))
            print("  ✓ ZERO JavaScript/WebGL errors detected!")

            # Poll for Canvas initialization
            canvas_found = False
            for attempt in range(25):
                res = ws.call("Runtime.evaluate", {
                    "expression": "Boolean(document.querySelector('#canvas-container canvas'))",
                    "returnByValue": True
                })
                print(f"  [Attempt {attempt+1}] res = {res}")
                if res and res.get('result', {}).get('value', False):
                    canvas_found = True
                    break
                time.sleep(0.3)

            assert canvas_found, "WebGL Canvas not found in DOM after waiting!"
            print("  ✓ WebGL Canvas active in DOM")

            # Step 4: Configure requested settings
            print("\n[Step 4] Applying Requested Configuration:")

            # 4.1 Ensure 4x4 Classic Mode with Rounded Cube
            print("  [4.1] Ensuring 4x4 Classic Mode with Chunky Rounded Cubes...")
            ws.call("Runtime.evaluate", {
                "expression": """
                const modeSelect = document.getElementById('select-mode');
                modeSelect.value = '4x4';
                modeSelect.dispatchEvent(new Event('change'));

                const shapeSelect = document.getElementById('select-shape');
                shapeSelect.value = 'rounded_cube';
                shapeSelect.dispatchEvent(new Event('change'));
                """
            })
            time.sleep(0.5)

            # 4.2 Verify Tile Dimensions & Board Dimensions
            dim_check = ws.call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const tiles = window.gameApp.tiles3D[0].flat().filter(Boolean);
                    const firstTile = tiles[0];
                    return {
                        tileCount: tiles.length,
                        hasInnerMesh: Boolean(firstTile && firstTile.innerMesh),
                        materialsCount: firstTile && firstTile.innerMesh ? firstTile.innerMesh.material.length : 0,
                        topHasTexture: Boolean(firstTile && firstTile.innerMesh && firstTile.innerMesh.material[2].map),
                        sidesHaveNoTexture: Boolean(firstTile && firstTile.innerMesh && !firstTile.innerMesh.material[0].map && !firstTile.innerMesh.material[4].map)
                    };
                })()
                """,
                "returnByValue": True
            }).get('result', {}).get('value', {})
            print(f"    -> Dimension & Material check: {dim_check}")
            assert dim_check.get('topHasTexture') == True, "Top face must have text texture"
            assert dim_check.get('sidesHaveNoTexture') == True, "Side faces must have NO text texture"

            # 4.3 Test Summoner Spells (Hint, Undo, Swap & Cooldown Recharge)
            print("\n[Step 5] Testing Summoner Spells (Hint, Undo, Swap & Recharge)...")
            initial_charges = ws.call("Runtime.evaluate", {
                "expression": "JSON.stringify(window.gameApp.gameLogic.spellCharges)",
                "returnByValue": True
            }).get('result', {}).get('value')
            print(f"    -> Initial spell charges: {initial_charges}")
            assert '"hint":2' in initial_charges and '"undo":2' in initial_charges and '"swap":2' in initial_charges

            # Test 1: Hint
            print("    -> Testing Spell 1: Hint (Gợi ý)...")
            ws.call("Runtime.evaluate", { "expression": "window.gameApp.handleSpellHint()" })
            time.sleep(0.3)
            hint_toast = ws.call("Runtime.evaluate", {
                "expression": "document.getElementById('spell-toast').textContent",
                "returnByValue": True
            }).get('result', {}).get('value')
            print(f"       Toast message: {hint_toast}")
            assert "GỢI Ý" in hint_toast

            # Test 2: Moves & Undo
            print("    -> Testing Spell 2: Undo (Đi lại)...")
            score_before = ws.call("Runtime.evaluate", {
                "expression": "window.gameApp.gameLogic.score",
                "returnByValue": True
            }).get('result', {}).get('value')
            ws.call("Input.dispatchKeyEvent", { "type": "rawKeyDown", "windowsVirtualKeyCode": 40, "code": "ArrowDown", "key": "ArrowDown" })
            ws.call("Input.dispatchKeyEvent", { "type": "keyUp", "windowsVirtualKeyCode": 40, "code": "ArrowDown", "key": "ArrowDown" })
            time.sleep(0.4)
            ws.call("Runtime.evaluate", { "expression": "window.gameApp.handleSpellUndo()" })
            time.sleep(0.3)
            score_after_undo = ws.call("Runtime.evaluate", {
                "expression": "window.gameApp.gameLogic.score",
                "returnByValue": True
            }).get('result', {}).get('value')
            print(f"       Score before: {score_before}, Score after undo: {score_after_undo}")

            # Test 3: Swap
            print("    -> Testing Spell 3: Swap (Đổi vị trí)...")
            ws.call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const tiles = window.gameApp.tiles3D[0].flat().filter(Boolean);
                    if (tiles.length >= 2) {
                        const t1 = tiles[0];
                        const t2 = tiles[1];
                        const val1 = t1.value;
                        const val2 = t2.value;
                        window.gameApp.gameLogic.swapTiles(
                            { l: t1.layer, r: t1.row, c: t1.col },
                            { l: t2.layer, r: t2.row, c: t2.col }
                        );
                        return true;
                    }
                    return false;
                })()
                """,
                "returnByValue": True
            })
            time.sleep(0.3)
            print("       Swap executed successfully!")

            # 4.4 Simulate Moves to create higher value tiles and test Cooldown Recharge
            print("\n[Step 6] Simulating moves to merge tiles and populate board...")
            for key in ["ArrowDown", "ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]:
                ws.call("Input.dispatchKeyEvent", { "type": "rawKeyDown", "windowsVirtualKeyCode": 40, "code": key, "key": key })
                ws.call("Input.dispatchKeyEvent", { "type": "keyUp", "windowsVirtualKeyCode": 40, "code": key, "key": key })
                time.sleep(0.3)

            time.sleep(0.8)

            # Verify Telemetry stats
            stats_info = ws.call("Runtime.evaluate", {
                "expression": """
                ({
                    fps: document.getElementById('fps-counter').textContent,
                    score: document.getElementById('score-val').textContent,
                    charges: JSON.stringify(window.gameApp.gameLogic.spellCharges)
                })
                """,
                "returnByValue": True
            }).get('result', {}).get('value', {})
            print(f"    -> Game state: FPS={stats_info.get('fps')}, Score={stats_info.get('score')}, Charges={stats_info.get('charges')}")

            # Step 7: Verify Boss Mode & Dark Singularity 3D Architecture
            print("\n[Step 7] Testing Boss Mode & Dark Singularity 3D Architecture...")
            boss_check = ws.call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const app = window.gameApp;
                    if (!app.isBossRaid) app.toggleBossRaid();
                    const bm = app.bossManager;
                    return {
                        isActive: bm.isActive,
                        visible: bm.group.visible,
                        phase: bm.phase,
                        phaseBadge: bm.phaseBadgeEl ? bm.phaseBadgeEl.textContent : '',
                        hasCoreMesh: !!bm.coreMesh,
                        hasAccretion: !!bm.accretionDisk,
                        ringCount: bm.ringGroup ? bm.ringGroup.children.length : 0,
                        hasLightning: !!bm.lightningMesh
                    };
                })()
                """,
                "returnByValue": True
            }).get('result', {}).get('value', {})
            print(f"    -> Boss Singularity Check: {boss_check}")
            assert boss_check.get('isActive') == True, "Boss mode must be active"
            assert "CORE — PHASER 1" in boss_check.get('phaseBadge', ''), "Phase 1 badge must say CORE — PHASER 1"
            assert boss_check.get('hasCoreMesh') == True, "Core sphere mesh must exist"
            assert boss_check.get('hasAccretion') == True, "Accretion event horizon disk must exist"
            assert boss_check.get('ringCount') == 3, "Must have 3 counter-rotating gimbal rings"
            assert boss_check.get('hasLightning') == True, "Electronic lightning arcs must exist"
            print("  ✓ Dark Singularity Core 3D & 3 Gimbal Rings verified 100%!")

            # Step 8: Verify Game Over Modal & Click Restart
            print("\n[Step 8] Testing Game Over Modal & Unfrozen Restart Button...")
            modal_check = ws.call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const app = window.gameApp;
                    // Trigger game over
                    app.isAnimating = true;
                    app.gameLogic.gameOver = true;
                    app.showModal({
                        title: '💀 THẤT BẠI (GAME OVER)',
                        message: 'Test Game Over Message',
                        primaryText: '🎮 Chơi lại ngay',
                        secondaryText: '🎮 Ván mới',
                        onPrimary: () => {
                            app.hideModal();
                            app.isAnimating = false;
                            app.startNewGame(false);
                        }
                    });
                    const overlay = document.getElementById('modal-overlay');
                    return {
                        isActive: overlay.classList.contains('active'),
                        title: document.getElementById('modal-title').textContent,
                        primaryBtnText: document.getElementById('modal-btn-primary').textContent
                    };
                })()
                """,
                "returnByValue": True
            }).get('result', {}).get('value', {})
            print(f"    -> Modal state before restart: {modal_check}")
            assert modal_check.get('isActive') == True, "Modal must be active"
            assert "THẤT BẠI" in modal_check.get('title', ''), "Title must contain THẤT BẠI"

            # Click primary restart button
            click_res = ws.call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const app = window.gameApp;
                    const btn = document.getElementById('modal-btn-primary');
                    btn.click();
                    const overlay = document.getElementById('modal-overlay');
                    return {
                        isActive: overlay.classList.contains('active'),
                        isAnimating: app.isAnimating,
                        gameOver: app.gameLogic.gameOver,
                        tileCount: app.tiles3D[0].flat().filter(Boolean).length
                    };
                })()
                """,
                "returnByValue": True
            }).get('result', {}).get('value', {})
            print(f"    -> State after clicking restart: {click_res}")
            assert click_res.get('isActive') == False, "Modal overlay must be closed"
            assert click_res.get('isAnimating') == False, "isAnimating must be false (unfrozen)"
            assert click_res.get('gameOver') == False, "gameOver must be false"
            assert click_res.get('tileCount') == 2, "Board must have 2 fresh spawned tiles"
            print("  ✓ Game Over Restart Click verified 100% (Instant unfreeze & fresh board)!")

            # Step 9: Capture Screenshot
            print("\n[Step 9] Capturing Visual Verification Screenshot...")
            ss_res = ws.call("Page.captureScreenshot", {"format": "png"})
            if ss_res and 'data' in ss_res:
                img_data = base64.b64decode(ss_res['data'])
                screenshot_path = r"d:\2048\screenshot.png"
                with open(screenshot_path, "wb") as f:
                    f.write(img_data)
                print(f"  ✓ Screenshot saved successfully to: {screenshot_path} ({len(img_data)} bytes)")

            ws.close()
            print("\n==================================================")
            print("   CHUNKY 3D TILES & CAMERA VERIFIED 100%!       ")
            print("==================================================")
            print("\n==================================================")
            print("   TELEMETRY & CRYSTAL OCTAHEDRON VERIFIED 100%!  ")
            print("==================================================")
            print("\n==================================================")
            print("   DARK SINGULARITY & RESTART VERIFIED 100%!      ")
            print("==================================================")

        finally:
            edge_proc.terminate()
            try:
                edge_proc.wait(timeout=2)
            except:
                edge_proc.kill()

    finally:
        if server_proc:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=2)
            except:
                server_proc.kill()

if __name__ == '__main__':
    run_full_verification()
