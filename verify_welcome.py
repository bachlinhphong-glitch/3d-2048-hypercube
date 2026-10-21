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
CDP_PORT = 9227

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
    print("   TESTING WELCOME & ONBOARDING INTRO MODAL")
    print("=" * 60)

    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_welcome_test_")
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
        print(f"  ✓ Connected to CDP Target: {page_target.get('title')}")
        ws = SimpleWebSocket(ws_url)

        # 1. Wait for Welcome modal auto-popup
        print("\n[Step 1] Verifying automatic Welcome Modal popup on startup...")
        time.sleep(1.2)
        welcome_check = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const modal = document.getElementById('welcome-modal');
                const title = document.querySelector('.welcome-modal-title');
                const startBtn = document.getElementById('welcome-modal-start-btn');
                const helpBtn = document.getElementById('btn-help-toggle');
                return {
                    hasModal: !!modal,
                    isActive: modal ? modal.classList.contains('active') : false,
                    display: modal ? modal.style.display : 'none',
                    titleText: title ? title.textContent : '',
                    hasStartBtn: !!startBtn,
                    hasHelpBtn: !!helpBtn
                };
            })()
            """,
            "returnByValue": True
        }).get("result", {}).get("value", {})

        print("    -> Welcome Modal State:", welcome_check)
        assert welcome_check.get('hasModal') == True, "Modal element must exist!"
        assert welcome_check.get('isActive') == True, "Modal must be active on startup!"
        assert "Chào mừng" in welcome_check.get('titleText', ''), "Title must greet user!"
        print("  ✓ PASSED: Welcome modal automatically pops up on startup!")

        # 2. Capture screenshot of Welcome Modal
        print("\n[Step 2] Capturing Welcome Modal Screenshot...")
        ss_res = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss_res and 'data' in ss_res:
            img_data = base64.b64decode(ss_res['data'])
            ss_path = r"d:\2048\screenshot_welcome.png"
            with open(ss_path, "wb") as f:
                f.write(img_data)
            print(f"  ✓ Screenshot saved to: {ss_path}")
            art_path = r"C:\Users\BachBach\.gemini\antigravity\brain\244f491a-56bb-43a3-b239-7cc7b632c6df\screenshot_welcome.png"
            try:
                with open(art_path, "wb") as f:
                    f.write(img_data)
            except:
                pass

        # 3. Click Start button and verify dismiss
        print("\n[Step 3] Clicking 'Bắt Đầu Trải Nghiệm'...")
        dismiss_check = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const cb = document.getElementById('welcome-dont-show-checkbox');
                if (cb) cb.checked = true;
                const startBtn = document.getElementById('welcome-modal-start-btn');
                if (startBtn) startBtn.click();
            })()
            """
        })
        time.sleep(0.5)

        dismiss_res = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const modal = document.getElementById('welcome-modal');
                return {
                    isActive: modal.classList.contains('active'),
                    display: modal.style.display,
                    savedSeen: localStorage.getItem('3d2048_welcome_seen')
                };
            })()
            """,
            "returnByValue": True
        }).get("result", {}).get("value", {})
        print("    -> State after dismiss:", dismiss_res)
        assert dismiss_res.get('isActive') == False, "Modal must be dismissed!"
        assert dismiss_res.get('savedSeen') == 'true', "welcome_seen must be saved in localStorage!"
        print("  ✓ PASSED: Welcome modal dismissed cleanly and saved to localStorage!")

        # 4. Click Help button in Header to reopen
        print("\n[Step 4] Clicking Header '?' button to reopen Welcome & Guide...")
        ws.call("Runtime.evaluate", {
            "expression": "document.getElementById('btn-help-toggle').click();"
        })
        time.sleep(0.4)

        reopen_res = ws.call("Runtime.evaluate", {
            "expression": "document.getElementById('welcome-modal').classList.contains('active')",
            "returnByValue": True
        }).get("result", {}).get("value", False)
        print("    -> Modal active after clicking '?' button:", reopen_res)
        assert reopen_res == True, "Modal must reopen when clicking header help button!"
        print("  ✓ PASSED: Header '?' button reopens Welcome Modal smoothly!")

        ws.close()
        print("\n" + "=" * 60)
        print("   ALL WELCOME MODAL TESTS PASSED 100%!")
        print("=" * 60)

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    main()
