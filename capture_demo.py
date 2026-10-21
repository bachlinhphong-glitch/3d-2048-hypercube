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
CDP_PORT = 9224

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
    print("   CAPTURING MINIMALIST VISUAL DEMOS (ZEN CLAY VS MODERN SLATE)")
    print("=" * 60)

    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_demo_")
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
        targets_url = f"http://127.0.0.1:{CDP_PORT}/json"
        req = urllib.request.urlopen(targets_url)
        targets = json.loads(req.read().decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page' and '3000' in t.get('url', '')), None)
        if not page_target:
            page_target = next((t for t in targets if t.get("type") == "page"), None)
        if not page_target:
            raise Exception("No page target found!")

        ws_url = page_target["webSocketDebuggerUrl"]
        ws = SimpleWebSocket(ws_url)

        # Wait for gameApp
        for _ in range(20):
            res = ws.call("Runtime.evaluate", {"expression": "Boolean(window.gameApp && window.gameApp.sceneManager)", "returnByValue": True})
            if res.get("result", {}).get("value") == True:
                break
            time.sleep(0.5)

        # Set mobile/responsive viewport (412x890 modern phone)
        ws.call("Emulation.setDeviceMetricsOverride", {
            "width": 412,
            "height": 890,
            "deviceScaleFactor": 2.5,
            "mobile": True
        })
        time.sleep(0.5)

        # Inject attractive 2048 tile setup: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048
        print("\n[Step 1] Injecting showcase tiles on 3D board...")
        setup_res = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const app = window.gameApp;
                app.cleanAllSceneTiles();
                app.currentShape = 'rounded_cube';
                app.tiles3D = app.createEmptyTileGrid();
                app.gameLogic.grid = app.gameLogic.createEmptyGrid();
                const vals = [
                    [2, 4, 8, 16],
                    [32, 64, 128, 256],
                    [512, 1024, 2048, 0],
                    [0, 0, 0, 0]
                ];
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (vals[r][c] > 0) {
                            app.spawnSpecificTile(0, r, c, vals[r][c]);
                        }
                    }
                }
                app.gameLogic.score = 28440;
                app.updateScoreUI();
                return {
                    tilesCount: app.tiles3D[0].flat().filter(Boolean).length,
                    boardChildren: app.board.group.children.length
                };
            })()
            """,
            "returnByValue": True
        })
        print("  -> Setup RAW:", json.dumps(setup_res))
        time.sleep(0.8)

        # DEMO 1: Zen Clay & Studio (Bắc Âu Sáng)
        print("\n[Step 2] Capturing HƯỚNG A: Zen Ceramic & Studio Light (Bắc Âu Sáng)...")
        ws.call("Runtime.evaluate", {
            "expression": "window.gameApp.switchTheme('zen_clay')"
        })
        time.sleep(1.0)
        ss1 = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss1 and 'data' in ss1:
            img1 = base64.b64decode(ss1['data'])
            p1 = r"d:\2048\screenshot_demo_zen.png"
            with open(p1, "wb") as f:
                f.write(img1)
            print(f"  ✓ Saved HƯỚNG A screenshot to: {p1} ({len(img1)} bytes)")

        # DEMO 2: Modern Slate & Charcoal (Apple / Linear Dark Mode)
        print("\n[Step 3] Capturing HƯỚNG B: Modern Slate & Charcoal Dark (Apple / Linear Tối)...")
        ws.call("Runtime.evaluate", {
            "expression": "window.gameApp.switchTheme('modern_slate')"
        })
        time.sleep(1.0)
        ss2 = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss2 and 'data' in ss2:
            img2 = base64.b64decode(ss2['data'])
            p2 = r"d:\2048\screenshot_demo_slate.png"
            with open(p2, "wb") as f:
                f.write(img2)
            print(f"  ✓ Saved HƯỚNG B screenshot to: {p2} ({len(img2)} bytes)")

        ws.close()
        print("\n" + "=" * 60)
        print("   BOTH MINIMALIST DEMOS CAPTURED SUCCESSFULLY!")
        print("=" * 60)

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    main()
