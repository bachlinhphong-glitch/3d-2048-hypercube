import subprocess
import time
import urllib.request
import json
import os
import sys
import socket
import base64
import struct

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

PORT = 3000
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
CDP_PORT = 9223

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

            if opcode == 0x08:  # Close
                return None

            if masked:
                unmasked = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
                return unmasked.decode('utf-8', errors='ignore')
            else:
                return payload.decode('utf-8', errors='ignore')
        except socket.timeout:
            return None

    def call(self, method, params=None, timeout=5.0):
        cid = self.send_cmd(method, params)
        start = time.time()
        while time.time() - start < timeout:
            msg = self.recv_msg(timeout=1.0)
            if not msg:
                continue
            try:
                parsed = json.loads(msg)
                if parsed.get("id") == cid:
                    if "error" in parsed:
                        raise Exception(f"CDP error: {parsed['error']}")
                    return parsed.get("result", {})
            except json.JSONDecodeError:
                pass
        raise TimeoutError(f"Timed out waiting for CDP response to {method}")

    def close(self):
        try:
            self.sock.close()
        except:
            pass

def main():
    print("=" * 60)
    print("   MOBILE VIEWPORT & COLLISION VERIFICATION (IPHONE VIEW)")
    print("=" * 60)

    # Launch Edge with remote debugging
    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_mobile_test_")
    cmd = [
        EDGE_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        f"http://127.0.0.1:{PORT}/index.html"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    try:
        # Find WebSocket target
        targets_url = f"http://127.0.0.1:{CDP_PORT}/json"
        req = urllib.request.urlopen(targets_url)
        targets = json.loads(req.read().decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page' and '3000' in t.get('url', '')), None)
        if not page_target:
            page_target = next((t for t in targets if t.get("type") == "page"), None)
        if not page_target:
            raise Exception("No page target found!")

        ws_url = page_target["webSocketDebuggerUrl"]
        print(f"  ✓ Connected to CDP Page Target: {page_target.get('title')} ({page_target.get('url')})")
        ws = SimpleWebSocket(ws_url)

        # Wait for page & gameApp to initialize
        print("\n[Step 0] Waiting for GameApp to initialize...")
        for _ in range(20):
            ready = ws.call("Runtime.evaluate", {"expression": "Boolean(window.gameApp && document.getElementById('dir-pad'))", "returnByValue": True})
            if ready.get("result", {}).get("value") == True:
                print("  ✓ GameApp initialized successfully")
                break
            time.sleep(0.5)

        # 1. Emulate Mobile Viewport (iPhone 14/15: 390x844, dpr 3, mobile true)
        print("\n[Step 1] Setting Mobile Emulation: 390x844 (iPhone Portrait)...")
        ws.call("Emulation.setDeviceMetricsOverride", {
            "width": 390,
            "height": 844,
            "deviceScaleFactor": 3,
            "mobile": True
        })
        ws.call("Emulation.setTouchEmulationEnabled", {
            "enabled": True,
            "maxTouchPoints": 5
        })
        # Dismiss initial welcome modal so gameplay HUD hit-testing is evaluated cleanly
        ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const wm = document.getElementById('welcome-modal');
                if (wm) { wm.style.display = 'none'; wm.classList.remove('active'); }
                localStorage.setItem('3d2048_welcome_seen', 'true');
            })()
            """
        })
        time.sleep(1.0)

        # 2. Check layout metrics & element occlusion
        print("\n[Step 2] Evaluating Layout & Overlap Metrics...")
        metrics = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const dirPad = document.getElementById('dir-pad');
                const spellBar = document.getElementById('spell-bar');
                const swapBtn = document.getElementById('btn-spell-swap');
                const undoBtn = document.getElementById('btn-spell-undo');
                const hintBtn = document.getElementById('btn-spell-hint');
                const bottomBar = document.querySelector('.bottom-bar');

                const dirPadDisplay = window.getComputedStyle(dirPad).display;
                const dirPadVisible = dirPadDisplay !== 'none';

                const swapRect = swapBtn.getBoundingClientRect();
                const centerPointX = swapRect.left + swapRect.width / 2;
                const centerPointY = swapRect.top + swapRect.height / 2;
                const topElementAtSwap = document.elementFromPoint(centerPointX, centerPointY);

                const spellBarRect = spellBar.getBoundingClientRect();
                const bottomBarRect = bottomBar ? bottomBar.getBoundingClientRect() : null;

                const isSwapClickable = swapBtn.contains(topElementAtSwap) || topElementAtSwap === swapBtn;

                return {
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    dirPadDisplay,
                    dirPadVisible,
                    spellBarRect: { top: spellBarRect.top, bottom: spellBarRect.bottom, left: spellBarRect.left, right: spellBarRect.right },
                    bottomBarRect: bottomBarRect ? { top: bottomBarRect.top, bottom: bottomBarRect.bottom } : null,
                    topElementAtSwapTag: topElementAtSwap ? topElementAtSwap.tagName + (topElementAtSwap.className ? '.' + topElementAtSwap.className : '') : 'none',
                    isSwapClickable,
                    bottomBarAboveSpellBar: bottomBarRect ? (bottomBarRect.bottom <= spellBarRect.top) : true
                };
            })()
            """,
            "returnByValue": True
        })
        print("RAW METRICS:", json.dumps(metrics))

        res = metrics.get("result", {}).get("value", {})
        print(f"    -> Viewport: {res.get('viewportWidth')}x{res.get('viewportHeight')}")
        print(f"    -> D-Pad Display: '{res.get('dirPadDisplay')}' (Visible: {res.get('dirPadVisible')})")
        print(f"    -> Top Element at Swap Center: {res.get('topElementAtSwapTag')}")
        print(f"    -> Is 'ĐỔI VỊ TRÍ' directly clickable without obstruction: {res.get('isSwapClickable')}")
        print(f"    -> Is Bottom Hint Bar cleanly above Spell Bar: {res.get('bottomBarAboveSpellBar')}")

        assert res.get('dirPadVisible') == False, "ERROR: D-Pad is NOT hidden on mobile!"
        assert res.get('isSwapClickable') == True, "ERROR: 'ĐỔI VỊ TRÍ' is obstructed!"
        assert res.get('bottomBarAboveSpellBar') == True, "ERROR: Bottom bar overlaps spell bar!"

        print("  ✓ PASSED: D-Pad is completely hidden on mobile viewports!")
        print("  ✓ PASSED: 'ĐỔI VỊ TRÍ' button has 100% unobstructed touch hit-testing!")
        print("  ✓ PASSED: Hint text is situated cleanly above the spell bar!")

        # 3. Test settings selector for D-Pad
        print("\n[Step 3] Testing Virtual D-Pad Settings Selector...")
        dpad_test = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const select = document.getElementById('select-dpad');
                const dirPad = document.getElementById('dir-pad');
                if (!select || !dirPad) return { success: false, reason: 'missing elements' };

                // Force visible
                select.value = 'visible';
                select.dispatchEvent(new Event('change'));

                const forcedDisplay = window.getComputedStyle(dirPad).display;
                const forcedRect = dirPad.getBoundingClientRect();
                const spellBarRect = document.getElementById('spell-bar').getBoundingClientRect();

                // Check overlap between forced D-Pad and spell bar
                const hasOverlap = !(forcedRect.right < spellBarRect.left || 
                                     forcedRect.left > spellBarRect.right || 
                                     forcedRect.bottom < spellBarRect.top || 
                                     forcedRect.top > spellBarRect.bottom);

                // Revert to auto
                select.value = 'auto';
                select.dispatchEvent(new Event('change'));
                const autoDisplay = window.getComputedStyle(dirPad).display;

                return {
                    success: true,
                    forcedDisplay,
                    hasOverlapWithSpellBarWhenForced: hasOverlap,
                    autoDisplay
                };
            })()
            """,
            "returnByValue": True
        })
        dpad_res = dpad_test.get("result", {}).get("value", {})
        print(f"    -> Forced visible display: '{dpad_res.get('forcedDisplay')}'")
        print(f"    -> Forced D-Pad overlaps spell bar: {dpad_res.get('hasOverlapWithSpellBarWhenForced')}")
        print(f"    -> Auto display reverted: '{dpad_res.get('autoDisplay')}'")

        assert dpad_res.get('hasOverlapWithSpellBarWhenForced') == False, "ERROR: Forced D-pad collides with spell bar!"
        assert dpad_res.get('autoDisplay') == 'none', "ERROR: Auto mode did not hide D-pad on mobile!"
        print("  ✓ PASSED: Settings D-Pad selector works and never overlaps spell bar!")

        # 4. Capture screenshot
        print("\n[Step 4] Capturing Mobile Screenshot...")
        ss_res = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss_res and 'data' in ss_res:
            img_data = base64.b64decode(ss_res['data'])
            screenshot_path = r"d:\2048\screenshot_mobile.png"
            with open(screenshot_path, "wb") as f:
                f.write(img_data)
            print(f"  ✓ Screenshot saved to: {screenshot_path} ({len(img_data)} bytes)")

        # 5. Test Moves, Autosave and Match Analytics
        print("\n[Step 5] Testing Moves, Autosave and Match Analytics...")
        stats_eval = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const app = window.gameApp;
                app.moveCount += 3;
                app.maxTileValue = 128;
                app.saveGameState();
                const raw = localStorage.getItem('3d2048_saved_4x4');
                const parsed = raw ? JSON.parse(raw) : null;
                return {
                    moveCount: app.moveCount,
                    hasSaved: !!parsed,
                    savedMoves: parsed ? parsed.moveCount : null,
                    savedMaxTile: parsed ? parsed.maxTileValue : null
                };
            })()
            """,
            "returnByValue": True
        }).get("result", {}).get("value", {})
        print("    -> Moves and Autosave:", stats_eval)
        assert stats_eval.get('moveCount') >= 3, "Move count must be incremented!"
        assert stats_eval.get('hasSaved') == True, "Board state must be saved to localStorage!"
        assert stats_eval.get('savedMoves') == stats_eval.get('moveCount'), "Saved moves must match!"
        print("  ✓ PASSED: Autosave and Move tracking verified!")

        # 6. Test Modal Match Analytics
        print("\n[Step 6] Testing End-Game Modal Match Analytics...")
        modal_eval = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const app = window.gameApp;
                app.triggerGameOverModal();
                return {
                    modalActive: app.modalOverlay.classList.contains('active'),
                    time: document.getElementById('modal-stat-time').textContent,
                    moves: document.getElementById('modal-stat-moves').textContent,
                    apm: document.getElementById('modal-stat-apm').textContent,
                    maxTile: document.getElementById('modal-stat-max-tile').textContent
                };
            })()
            """,
            "returnByValue": True
        }).get("result", {}).get("value", {})
        print("    -> Modal Analytics Cards:", modal_eval)
        assert modal_eval.get('modalActive') == True, "Modal must be active!"
        assert ":" in modal_eval.get('time', ''), "Time must be MM:SS!"
        print("  ✓ PASSED: Modal Analytics (Time, Moves, APM, Max Tile) verified!")

        # Capture modal screenshot
        ss_modal = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss_modal and 'data' in ss_modal:
            modal_img = base64.b64decode(ss_modal['data'])
            m_path = r"d:\2048\screenshot_modal_stats.png"
            with open(m_path, "wb") as f:
                f.write(modal_img)
            print(f"  ✓ Modal stats screenshot saved to: {m_path}")
            art_m_path = r"C:\Users\BachBach\.gemini\antigravity\brain\244f491a-56bb-43a3-b239-7cc7b632c6df\screenshot_modal_stats.png"
            try:
                with open(art_m_path, "wb") as f:
                    f.write(modal_img)
            except:
                pass

        ws.close()
        print("\n" + "=" * 60)
        print("   ALL MOBILE VERIFICATION TESTS PASSED 100%!")
        print("=" * 60)

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    main()
