import subprocess
import time
import urllib.request
import json
import os
import sys
import base64

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
CDP_PORT = 9230

from verify_welcome import SimpleWebSocket

def run_tests():
    print("=" * 70)
    print("   AUTOMATED VERIFICATION: BOSS & RUSH MODALS, SPELL BONUSES, ACHIEVEMENTS")
    print("=" * 70)

    import tempfile
    profile_dir = tempfile.mkdtemp(prefix="edge_feature_test_")
    cmd = [
        EDGE_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "http://127.0.0.1:3000/index.html"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    ws = None
    try:
        targets_url = f"http://127.0.0.1:{CDP_PORT}/json"
        req = urllib.request.urlopen(targets_url)
        targets = json.loads(req.read().decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page' and '3000' in t.get('url', '')), None)
        if not page_target:
            raise Exception("No page target found!")

        ws = SimpleWebSocket(page_target["webSocketDebuggerUrl"])
        
        # Enable runtime & console
        ws.call("Runtime.enable", {})
        ws.call("Page.enable", {})

        def eval_js(expr):
            res = ws.call("Runtime.evaluate", {"expression": expr, "returnByValue": True})
            return res.get("result", {}).get("value")

        # Wait until page & service worker settle and window.gameApp is initialized
        time.sleep(2.0)
        for _ in range(30):
            if eval_js("!!window.gameApp"):
                break
            time.sleep(0.3)
        time.sleep(1.0)

        # Step 0: Close Welcome Modal if open
        print("\n[Step 0] Closing Welcome Modal...")
        eval_js("""
            const welcome = document.getElementById('welcome-modal');
            if (welcome) {
                welcome.classList.remove('active');
                welcome.style.display = 'none';
            }
        """)

        # Step 1: Click Boss Toggle -> Expect Mode Confirm Modal to open
        print("\n[Step 1] Testing Boss Mode Confirmation Modal...")
        eval_js("document.getElementById('btn-toggle-boss').click();")
        time.sleep(0.5)

        modal_info = eval_js("""
            (() => {
                const modal = document.getElementById('mode-confirm-modal');
                const title = document.getElementById('mode-confirm-title')?.textContent || '';
                const display = modal ? modal.style.display : null;
                const computedDisplay = modal ? window.getComputedStyle(modal).display : null;
                const classList = modal ? Array.from(modal.classList) : [];
                const isVisible = modal && modal.classList.contains('active') && computedDisplay !== 'none';
                const hasWarning = document.querySelector('.mode-warning-text')?.textContent.includes('làm mới toàn bộ bàn cờ');
                const hasBonusRule = document.querySelector('.mode-tutorial-content')?.textContent.includes('+15 giây');
                return { isVisible, display, computedDisplay, classList, title, hasWarning, hasBonusRule };
            })()
        """)
        print("  Modal Info:", modal_info)
        assert modal_info["isVisible"], "Confirm modal did not open on Boss click!"
        assert "ĐẤU TRÙM" in modal_info["title"], "Modal title did not match Boss mode!"
        assert modal_info["hasWarning"], "Warning about resetting progress is missing!"
        assert modal_info["hasBonusRule"], "Rule about +15s spell bonus is missing!"
        print("  ✓ Boss Confirmation Modal displayed correctly with rules & warnings.")

        # Take screenshot of Boss confirmation modal
        ss_confirm = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss_confirm and 'data' in ss_confirm:
            with open(r"d:\2048\screenshot_boss_confirm.png", "wb") as f:
                f.write(base64.b64decode(ss_confirm['data']))
            print("  ✓ Saved screenshot to d:\\2048\\screenshot_boss_confirm.png")

        # Step 2: Click Confirm & Start -> Verify Boss Mode Activates & cleans board
        print("\n[Step 2] Confirming Boss Mode Start...")
        eval_js("document.getElementById('btn-mode-confirm-start').click();")
        time.sleep(0.6)

        boss_active = eval_js("""
            (() => {
                const app = window.gameApp;
                const modal = document.getElementById('mode-confirm-modal');
                const hud = document.getElementById('boss-hud');
                return {
                    isBossRaid: app.isBossRaid,
                    hudVisible: hud && hud.style.display !== 'none',
                    modalHidden: !modal.classList.contains('active'),
                    bossHp: app.bossManager ? app.bossManager.hp : 0,
                    phase: app.bossManager ? app.bossManager.phase : 0
                };
            })()
        """)
        print("  Boss Active State:", boss_active)
        assert boss_active["isBossRaid"], "Boss raid is not active after confirmation!"
        assert boss_active["hudVisible"], "Boss HUD is not visible!"
        print("  ✓ Boss Mode activated cleanly.")

        # Step 3: Test Emergency Spell-to-Time Bonus in Boss Mode
        print("\n[Step 3] Testing Emergency Spell-to-Time Bonus (+15s per remaining spell)...")
        spell_test = eval_js("""
            (() => {
                const app = window.gameApp;
                // Ensure spells are available
                app.gameLogic.spells.hint = { used: 0, ready: true };
                app.gameLogic.spells.undo = { used: 1, ready: true }; // 1 left
                app.gameLogic.spells.swap = { used: 1, ready: true }; // 1 left
                // Total remaining spells = 2 + 1 + 1 = 4 spells => should give 4 * 15s = +60s!
                const initialRemaining = app.gameLogic.getRemainingSpellCount();
                
                // Set timer to almost 0
                app.bossManager.timer = 0.05;
                
                return { initialRemaining };
            })()
        """)
        print("  Spells before timeout:", spell_test)
        assert spell_test["initialRemaining"] == 4, "Initial spell count mismatch!"

        # Let the update loop run past 0.05s
        time.sleep(0.3)

        bonus_result = eval_js("""
            (() => {
                const app = window.gameApp;
                const newTimer = app.bossManager.timer;
                const newSpellCount = app.gameLogic.getRemainingSpellCount();
                const isDefeated = app.bossManager.isDefeated;
                const toastText = document.getElementById('spell-toast')?.textContent || '';
                return { newTimer, newSpellCount, isDefeated, toastText };
            })()
        """)
        print("  After timer hit 0 with 4 spells:", bonus_result)
        assert bonus_result["newTimer"] > 50, f"Timer should have been boosted by 60s! Got: {bonus_result['newTimer']}"
        assert bonus_result["newSpellCount"] == 0, "All spells should have been consumed for the emergency bonus!"
        assert not bonus_result["isDefeated"], "Game should NOT be defeated when saved by spell bonus!"
        print("  ✓ Emergency Spell-to-Time Bonus (+15s per spell) passed flawlessly!")

        # Step 4: Test Boss Victory & Grand Achievement Screen
        print("\n[Step 4] Testing Boss Defeat & Achievement Celebration...")
        eval_js("""
            (() => {
                const app = window.gameApp;
                app.bossManager.setupTestPhase3();
                // Obliterate Boss via 2048 finale
                app.bossManager.execute2048Finale();
            })()
        """)

        # Wait for 1.8s delay in execute2048Finale
        time.sleep(2.4)

        victory_modal_info = eval_js("""
            (() => {
                const modal = document.getElementById('boss-victory-modal');
                const isVisible = modal && modal.classList.contains('active') && modal.style.display !== 'none';
                const heading = document.getElementById('boss-victory-heading')?.textContent || '';
                const achieveName = document.querySelector('.boss-achievement-name')?.textContent || '';
                const achieveSaved = localStorage.getItem('3d2048_boss_defeated') === 'true';
                const timeVal = document.getElementById('boss-v-time')?.textContent || '';
                const dmgVal = document.getElementById('boss-v-damage')?.textContent || '';
                return { isVisible, heading, achieveName, achieveSaved, timeVal, dmgVal };
            })()
        """)
        print("  Victory Modal State:", victory_modal_info)
        assert victory_modal_info["isVisible"], "Boss victory modal did not appear!"
        assert "CHIẾN CÔNG" in victory_modal_info["heading"] or "VICTORY" in victory_modal_info["heading"], "Victory heading mismatch!"
        assert "SINGULARITY SLAYER" in victory_modal_info["achieveName"], "Achievement title mismatch!"
        assert victory_modal_info["achieveSaved"], "Achievement was not saved to localStorage!"
        print("  ✓ Boss Victory & Grand Achievement Screen verified successfully!")

        # Take screenshot of Boss Victory modal
        ss_victory = ws.call("Page.captureScreenshot", {"format": "png"})
        if ss_victory and 'data' in ss_victory:
            with open(r"d:\2048\screenshot_boss_victory.png", "wb") as f:
                f.write(base64.b64decode(ss_victory['data']))
            print("  ✓ Saved screenshot to d:\\2048\\screenshot_boss_victory.png")

        # Step 5: Close victory modal and test Rush Mode
        print("\n[Step 5] Testing Rush Mode Confirmation & Spell Bonus...")
        eval_js("document.getElementById('boss-victory-btn-continue').click();")
        time.sleep(0.5)

        # Clear skip confirm for rush
        eval_js("localStorage.removeItem('3d2048_rush_confirm_skip');")
        eval_js("document.getElementById('btn-toggle-rush').click();")
        time.sleep(0.5)

        rush_confirm_info = eval_js("""
            (() => {
                const modal = document.getElementById('mode-confirm-modal');
                const title = document.getElementById('mode-confirm-title')?.textContent || '';
                const isVisible = modal && modal.classList.contains('active') && modal.style.display !== 'none';
                return { isVisible, title };
            })()
        """)
        print("  Rush Confirm Modal:", rush_confirm_info)
        assert rush_confirm_info["isVisible"], "Confirm modal did not open on Rush click!"
        assert "ĐUA GIỜ" in rush_confirm_info["title"], "Modal title did not match Rush mode!"

        # Start Rush Mode
        eval_js("document.getElementById('btn-mode-confirm-start').click();")
        time.sleep(0.5)

        rush_active = eval_js("""
            (() => {
                const app = window.gameApp;
                // Give 2 spells
                app.gameLogic.spells.hint = { used: 1, ready: true }; // 1 left
                app.gameLogic.spells.undo = { used: 1, ready: true }; // 1 left
                app.gameLogic.spells.swap = { used: 2, ready: false }; // 0 left
                // Total = 2 spells => +30s bonus!
                app.rushTime = 0.05;
                return { isRushMode: app.isRushMode, remainingSpells: app.gameLogic.getRemainingSpellCount() };
            })()
        """)
        print("  Rush Active State before timeout:", rush_active)
        assert rush_active["isRushMode"], "Rush mode should be active!"

        time.sleep(0.4)

        rush_bonus = eval_js("""
            (() => {
                const app = window.gameApp;
                return {
                    rushTime: app.rushTime,
                    gameOver: app.gameLogic.gameOver,
                    remainingSpells: app.gameLogic.getRemainingSpellCount()
                };
            })()
        """)
        print("  Rush after timer hit 0 with 2 spells:", rush_bonus)
        assert rush_bonus["rushTime"] > 20, f"Rush time should have been boosted by 30s! Got: {rush_bonus['rushTime']}"
        assert rush_bonus["remainingSpells"] == 0, "Spells should have been consumed!"
        assert not rush_bonus["gameOver"], "Game should not be over when rescued by spell bonus!"
        print("  ✓ Rush Mode Emergency Spell Bonus (+15s per spell) verified successfully!")

        print("\n" + "=" * 70)
        print("   ALL 5 TEST SUITES PASSED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        if ws:
            ws.close()
        proc.kill()

if __name__ == "__main__":
    run_tests()
