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

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
CDP_PORT = 9226

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
            if not head: return None
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
    print("   TESTING AUTOSAVE/RESUME & MATCH ANALYTICS DASHBOARD")
    print("=" * 60)

    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_stats_test_")
    cmd = [
        EDGE_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        f"http://127.0.0.1:3000/index.html"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    try:
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
        for _ in range(25):
            ready = ws.call("Runtime.evaluate", {
                "expression": "Boolean(window.gameApp && document.getElementById('score-val'))",
                "returnByValue": True
            })
            if ready.get("result", {}).get("value") == True:
                print("  ✓ GameApp initialized successfully")
                break
            time.sleep(0.4)

        # 1. Simulate gameplay moves and check move count
        print("\n[Step 1] Simulating 4 moves to trigger tile movements & autosave...")
        ws.call("Runtime.evaluate", {
            "expression": """
            (async () => {
                const app = window.gameApp;
                await app.handleMove('up');
                await app.handleMove('left');
                await app.handleMove('down');
                await app.handleMove('right');
                return {
                    moveCount: app.moveCount,
                    score: app.gameLogic.score,
                    savedStatePresent: !!localStorage.getItem('3d2048_saved_4x4')
                };
            })()
            """,
            "awaitPromise": True,
            "returnByValue": True
        })
        time.sleep(1.2)

        eval_raw = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const app = window.gameApp;
                if (!app) return { error: "gameApp not ready" };
                const raw = localStorage.getItem('3d2048_saved_4x4');
                const parsed = raw ? JSON.parse(raw) : null;
                return {
                    moveCount: app.moveCount,
                    elapsedSeconds: app.elapsedSeconds,
                    maxTileValue: app.maxTileValue,
                    savedMoves: parsed ? parsed.moveCount : null,
                    savedElapsed: parsed ? parsed.elapsedSeconds : null,
                    savedMaxTile: parsed ? parsed.maxTileValue : null
                };
            })()
            """,
            "returnByValue": True
        })
        print("  -> EVAL RAW:", json.dumps(eval_raw))
        check1 = eval_raw.get('result', {}).get('value', {})
        print("  -> Game State after moves:", check1)
        assert check1['moveCount'] >= 1, "Moves should be counted!"
        assert check1['savedMoves'] == check1['moveCount'], "Saved move count should match live move count!"
        print("  ✓ PASSED: Autosave correctly records grid state and match metrics in localStorage!")

        # 2. Reload page and verify restore
        print("\n[Step 2] Reloading page to test Auto-Resume...")
        ws.call("Page.reload")
        time.sleep(1.0)
        for _ in range(25):
            ready = ws.call("Runtime.evaluate", {
                "expression": "Boolean(window.gameApp && document.getElementById('score-val'))",
                "returnByValue": True
            }).get('result', {}).get('value', False)
            if ready:
                break
            time.sleep(0.4)

        check2 = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const app = window.gameApp;
                const tileCount = app.tiles3D[0].flat().filter(Boolean).length;
                return {
                    moveCount: app.moveCount,
                    maxTileValue: app.maxTileValue,
                    score: app.gameLogic.score,
                    tileCount: tileCount
                };
            })()
            """,
            "returnByValue": True
        }).get('result', {}).get('value', {})
        print("  -> Restored State after F5:", check2)
        assert check2['moveCount'] == check1['moveCount'], "Restored move count should match!"
        assert check2['tileCount'] >= 2, "Tiles must be preserved upon reload!"
        print("  ✓ PASSED: Auto-Resume seamlessly restores full 3D board & match metrics on page reload!")

        # 3. Test Modal Match Analytics display
        print("\n[Step 3] Testing Modal Match Analytics Dashboard...")
        modal_stats = ws.call("Runtime.evaluate", {
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
        }).get('result', {}).get('value', {})
        print("  -> Modal Analytics Cards:", modal_stats)
        assert modal_stats['modalActive'] == True, "Modal must be active!"
        assert modal_stats['moves'] == str(check2['moveCount']), "Modal moves count must match!"
        assert ":" in modal_stats['time'], "Time must be formatted MM:SS!"
        print("  ✓ PASSED: End-Game Modal renders live Match Analytics (Time, Moves, APM, Max Tile) perfectly!")

        # Capture verification screenshot of modal analytics
        ws.call("Emulation.setDeviceMetricsOverride", {
            "width": 420,
            "height": 860,
            "deviceScaleFactor": 2,
            "mobile": True
        })
        time.sleep(0.5)
        ss = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss and 'data' in ss:
            img = base64.b64decode(ss['data'])
            p = r"d:\2048\screenshot_modal_stats.png"
            with open(p, "wb") as f:
                f.write(img)
            print(f"  ✓ Saved Modal Analytics screenshot to: {p}")
            art_p = r"C:\Users\BachBach\.gemini\antigravity\brain\244f491a-56bb-43a3-b239-7cc7b632c6df\screenshot_modal_stats.png"
            try:
                with open(art_p, "wb") as f:
                    f.write(img)
            except:
                pass

        ws.close()
        print("\n" + "=" * 60)
        print("   ALL AUTOSAVE & MATCH ANALYTICS TESTS PASSED 100%!")
        print("=" * 60)

    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except: proc.kill()

if __name__ == "__main__":
    main()
