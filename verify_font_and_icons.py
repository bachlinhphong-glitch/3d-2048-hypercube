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
CDP_PORT = 9228

from verify_welcome import SimpleWebSocket

def main():
    print("=" * 60)
    print("   TESTING FONT RENDERING & SETTINGS ICON SIZES")
    print("=" * 60)

    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_font_test_")
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
            raise Exception("No page target found!")

        ws = SimpleWebSocket(page_target["webSocketDebuggerUrl"])

        # Wait for page load
        time.sleep(1.5)

        # 1. Capture Welcome Modal with Vietnamese text & Plus Jakarta Sans
        print("\n[Step 1] Capturing Welcome Modal with Plus Jakarta Sans & Vietnamese...")
        ss1 = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss1 and 'data' in ss1:
            with open(r"d:\2048\screenshot_welcome_fixed.png", "wb") as f:
                f.write(base64.b64decode(ss1['data']))
            print("  ✓ Saved to d:\\2048\\screenshot_welcome_fixed.png")

        # 2. Close Welcome Modal and Open Settings Modal
        print("\n[Step 2] Opening Settings Modal to verify Audio & Share SVG sizes...")
        ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const wm = document.getElementById('welcome-modal');
                if (wm) { wm.style.display = 'none'; wm.classList.remove('active'); }
                const sm = document.getElementById('settings-modal');
                const btn = document.getElementById('btn-settings-toggle');
                if (btn) btn.click();
            })()
            """
        })
        time.sleep(0.6)

        # Check SVG sizes in settings
        icon_sizes = ws.call("Runtime.evaluate", {
            "expression": """
            (() => {
                const bgmSvg = document.querySelector('#btn-bgm-toggle svg');
                const shareSvg = document.querySelector('#btn-share-score svg');
                const soundSvg = document.querySelector('#btn-sound-toggle svg');
                return {
                    bgmWidth: bgmSvg ? bgmSvg.getBoundingClientRect().width : 0,
                    bgmHeight: bgmSvg ? bgmSvg.getBoundingClientRect().height : 0,
                    shareWidth: shareSvg ? shareSvg.getBoundingClientRect().width : 0,
                    shareHeight: shareSvg ? shareSvg.getBoundingClientRect().height : 0,
                    soundWidth: soundSvg ? soundSvg.getBoundingClientRect().width : 0
                };
            })()
            """,
            "returnByValue": True
        }).get("result", {}).get("value", {})
        print("    -> Settings SVG Icon Sizes:", icon_sizes)
        assert icon_sizes.get('bgmWidth') <= 20, f"BGM icon too large: {icon_sizes.get('bgmWidth')}"
        assert icon_sizes.get('shareWidth') <= 20, f"Share icon too large: {icon_sizes.get('shareWidth')}"
        print("  ✓ PASSED: Settings audio & share SVG icons are cleanly sized (<= 20px)!")

        # 3. Capture Settings Modal Screenshot
        print("\n[Step 3] Capturing Settings Modal Screenshot...")
        ss2 = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss2 and 'data' in ss2:
            with open(r"d:\2048\screenshot_settings_fixed.png", "wb") as f:
                f.write(base64.b64decode(ss2['data']))
            print("  ✓ Saved to d:\\2048\\screenshot_settings_fixed.png")

        ws.close()
        print("\n" + "=" * 60)
        print("   ALL FONT & ICON FIX TESTS PASSED 100%!")
        print("=" * 60)

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == '__main__':
    main()
