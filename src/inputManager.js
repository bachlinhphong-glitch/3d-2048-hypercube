export class InputManager {
  constructor(domElement, onMoveCallback, onSpellCallback = null, onCanvasClickCallback = null, onCameraSnapCallback = null, onSliceCycleCallback = null) {
    this.domElement = domElement;
    this.onMove = onMoveCallback;
    this.onSpell = onSpellCallback;
    this.onCanvasClick = onCanvasClickCallback;
    this.onCameraSnap = onCameraSnapCallback;
    this.onSliceCycle = onSliceCycleCallback;

    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.isPointerDown = false;
    this.isTileHeld = false;
    this.pointerStartTime = 0;

    this.enabled = true;
    this.lastButtonStates = {};
    this.stickReset = true;

    this.bindEvents();
    this.initGamepad();
  }

  setEnabled(val) {
    this.enabled = val;
  }

  isBlockedByUI() {
    // 1. If user is currently typing in an input, select or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA')) {
      return true;
    }

    // 2. If any modal is open via GameApp
    if (window.gameApp && typeof window.gameApp.isAnyModalOpen === 'function') {
      return window.gameApp.isAnyModalOpen();
    }

    // 3. Fallback DOM check for active modal overlays
    const activeModal = document.querySelector(
      '.settings-modal-overlay.active, .welcome-modal-overlay.active, .trophy-modal-overlay.active, .mode-confirm-modal-overlay.active, .share-modal-overlay.active, .boss-victory-modal-overlay.active, .modal-overlay.active'
    );
    return Boolean(activeModal);
  }

  bindEvents() {
    // 1. Keyboard Controls (Arrow keys, WASD, E/Q for 3D Hypercube Layers, Spell Hotkeys)
    window.addEventListener('keydown', (e) => {
      if (!this.enabled || this.isBlockedByUI()) return;

      // Summoner Spells Hotkeys
      if (e.code === 'KeyH' && !e.ctrlKey && !e.altKey) {
        if (this.onSpell && this.onSpell.hint) this.onSpell.hint();
        return;
      }
      if ((e.code === 'KeyZ' && !e.ctrlKey) || e.code === 'KeyU') {
        if (this.onSpell && this.onSpell.undo) this.onSpell.undo();
        return;
      }
      if (e.code === 'KeyX' && !e.ctrlKey && !e.altKey) {
        if (this.onSpell && this.onSpell.swap) this.onSpell.swap();
        return;
      }
      if (e.code === 'Escape') {
        if (this.onSpell && this.onSpell.cancel) this.onSpell.cancel();
        return;
      }

      // Camera Snap Hotkeys
      if (e.code === 'Digit1' && !e.ctrlKey && !e.altKey) {
        if (this.onCameraSnap) this.onCameraSnap(1);
        return;
      }
      if (e.code === 'Digit2' && !e.ctrlKey && !e.altKey) {
        if (this.onCameraSnap) this.onCameraSnap(2);
        return;
      }
      if (e.code === 'Digit3' && !e.ctrlKey && !e.altKey) {
        if (this.onCameraSnap) this.onCameraSnap(3);
        return;
      }
      if (e.code === 'KeyR' && !e.ctrlKey && !e.altKey) {
        if (this.onCameraSnap) this.onCameraSnap('orbit');
        return;
      }

      // Slice Mode Cycle (V or Tab)
      if (e.code === 'KeyV' && !e.ctrlKey && !e.altKey) {
        if (this.onSliceCycle) this.onSliceCycle();
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        if (this.onSliceCycle) this.onSliceCycle();
        return;
      }

      // Block move execution if Shift key is held for Ghost Preview
      if (e.shiftKey) return;

      let direction = null;
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 'KeyS':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'KeyD':
          direction = 'right';
          break;
        case 'KeyE':
        case 'Space':
          direction = 'layerUp';
          break;
        case 'KeyQ':
          direction = 'layerDown';
          break;
      }

      if (direction) {
        e.preventDefault();
        this.onMove(direction);
      }
    });

    // 2. Mouse Drag & Touch Swipe Controls (Real-time gesture triggering on move for instant arcade responsiveness)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    let touchGestureTriggered = false;

    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      if (this.isBlockedByUI()) return;
      if (e.target && e.target.closest && e.target.closest('button, select, input, label, .spell-btn, .spell-bar, .modal-card, .settings-modal-card, .settings-modal-overlay, .header-bar, .rush-panel, .dpad-btn, .cam-btn, .slice-btn, .banner-container, .inapp-challenge-card, .trophy-tab-btn, .custom-bg-input')) {
        return;
      }
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchActive = true;
      touchGestureTriggered = false;
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (!touchActive) return;
      if (e.cancelable) {
        e.preventDefault(); // Stop mobile pull-to-refresh & browser scroll from canceling swipe!
      }
      if (touchGestureTriggered || !this.enabled || this.isBlockedByUI()) return;
      if (this.isTileHeld) return;
      if (window.gameApp && window.gameApp.isSwapMode) return;

      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const distance = Math.hypot(dx, dy);

      // Instant 16px threshold: triggers DURING finger motion without waiting for touchend!
      if (distance >= 16) {
        touchGestureTriggered = true;
        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        if (direction) {
          this.onMove(direction);
        }
      }
    }, { passive: false });

    this.domElement.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      const wasTriggered = touchGestureTriggered;
      touchActive = false;
      touchGestureTriggered = false;

      if (this.isTileHeld) {
        this.isTileHeld = false;
        return;
      }

      // If finger lifted without triggering touchmove (e.g. ultra-fast flick or tap)
      if (!wasTriggered && this.enabled && !this.isBlockedByUI()) {
        const t = e.changedTouches[0];
        if (t) {
          const dx = t.clientX - touchStartX;
          const dy = t.clientY - touchStartY;
          const distance = Math.hypot(dx, dy);
          if (distance >= 12) {
            let direction = null;
            if (Math.abs(dx) > Math.abs(dy)) {
              direction = dx > 0 ? 'right' : 'left';
            } else {
              direction = dy > 0 ? 'down' : 'up';
            }
            if (direction) {
              this.onMove(direction);
              return;
            }
          }
          // Tap on canvas (e.g. for Swap selection)
          if (distance < 12 && this.onCanvasClick) {
            this.onCanvasClick(t.clientX, t.clientY);
          }
        }
      }
    }, { passive: true });

    this.domElement.addEventListener('touchcancel', () => {
      touchActive = false;
      touchGestureTriggered = false;
      this.isPointerDown = false;
      this.isTileHeld = false;
    }, { passive: true });

    let pointerGestureTriggered = false;

    this.domElement.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // Touch is handled by real-time touchstart/touchmove
      // Only process primary pointer (first finger / left mouse button)
      if (!e.isPrimary) {
        this.isPointerDown = false;
        return;
      }
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (e.target && e.target.closest && e.target.closest('button, select, input, label, .spell-btn, .spell-bar, .modal-card, .settings-modal-card, .settings-modal-overlay, .header-bar, .rush-panel, .dpad-btn, .cam-btn, .slice-btn, .banner-container, .inapp-challenge-card, .trophy-tab-btn, .custom-bg-input')) {
        return;
      }

      this.isPointerDown = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.pointerStartTime = Date.now();
      pointerGestureTriggered = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      if (!this.isPointerDown || pointerGestureTriggered || !this.enabled || this.isBlockedByUI()) return;
      if (this.isTileHeld) return;
      if (window.gameApp && window.gameApp.isSwapMode) return;

      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      const distance = Math.hypot(dx, dy);

      if (distance >= 20) {
        pointerGestureTriggered = true;
        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        if (direction) {
          this.onMove(direction);
        }
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') return; // Dedicated touch listener handles touch
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      const wasTriggered = pointerGestureTriggered;
      pointerGestureTriggered = false;

      if (this.isTileHeld) {
        this.isTileHeld = false;
        return;
      }
      if (!this.enabled) return;

      // Do not process swipes if released on interactive control elements
      if (e.target && e.target.closest && e.target.closest('button, select, input, label, .spell-btn, .spell-bar, .modal-card, .settings-modal-card, .settings-modal-overlay, .header-bar, .rush-panel, .dpad-btn, .cam-btn, .slice-btn')) {
        return;
      }

      // In Swap mode, prioritize clicking the tile rather than swiping
      if (window.gameApp && window.gameApp.isSwapMode) {
        if (this.onCanvasClick) {
          this.onCanvasClick(this.pointerStartX, this.pointerStartY);
        }
        return;
      }

      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      const distance = Math.hypot(dx, dy);

      if (!wasTriggered) {
        if (distance < 16) {
          if (this.onCanvasClick) {
            this.onCanvasClick(e.clientX, e.clientY);
          }
        } else {
          let direction = null;
          if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
          } else {
            direction = dy > 0 ? 'down' : 'up';
          }
          if (direction) {
            this.onMove(direction);
          }
        }
      }
    });

    this.domElement.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
      pointerGestureTriggered = false;
      this.isTileHeld = false;
    });

    window.addEventListener('blur', () => {
      touchActive = false;
      this.isPointerDown = false;
      this.isTileHeld = false;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        touchActive = false;
        this.isPointerDown = false;
        this.isTileHeld = false;
      }
    });

    // 3. UI Buttons for movement are handled by main.js via #dir-pad
  }

  initGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('🎮 Gamepad connected:', e.gamepad.id);
    });

    const poll = () => {
      if (this.enabled && 'getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp) {
            this.handleGamepad(gp);
            break;
          }
        }
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  }

  handleGamepad(gp) {
    if (!gp || !gp.buttons) return;

    // 1. D-Pad buttons (12: Up, 13: Down, 14: Left, 15: Right)
    const dpadMap = {
      12: 'up',
      13: 'down',
      14: 'left',
      15: 'right'
    };
    for (const [btnIdx, dir] of Object.entries(dpadMap)) {
      const idx = Number(btnIdx);
      const isPressed = gp.buttons[idx] && gp.buttons[idx].pressed;
      if (isPressed && !this.lastButtonStates[idx]) {
        this.onMove(dir);
      }
      this.lastButtonStates[idx] = !!isPressed;
    }

    // 2. Shoulder buttons (R1 / RB: layerUp, L1 / LB: layerDown)
    const shoulderMap = {
      5: 'layerUp',   // R1 / RB
      4: 'layerDown'  // L1 / LB
    };
    for (const [btnIdx, dir] of Object.entries(shoulderMap)) {
      const idx = Number(btnIdx);
      const isPressed = gp.buttons[idx] && gp.buttons[idx].pressed;
      if (isPressed && !this.lastButtonStates[idx]) {
        this.onMove(dir);
      }
      this.lastButtonStates[idx] = !!isPressed;
    }

    // 3. Triangle / Y Button (Button 3): Cycle Slice Mode
    const yPressed = gp.buttons[3] && gp.buttons[3].pressed;
    if (yPressed && !this.lastButtonStates[3]) {
      if (this.onSliceCycle) this.onSliceCycle();
    }
    this.lastButtonStates[3] = !!yPressed;

    // 4. Analog Stick (Left Stick axes 0 & 1)
    if (gp.axes && gp.axes.length >= 2) {
      const ax = gp.axes[0];
      const ay = gp.axes[1];
      const mag = Math.hypot(ax, ay);

      if (mag < 0.28) {
        this.stickReset = true;
      } else if (this.stickReset && mag >= 0.58) {
        this.stickReset = false;
        let direction = null;
        if (Math.abs(ax) > Math.abs(ay)) {
          direction = ax > 0 ? 'right' : 'left';
        } else {
          direction = ay > 0 ? 'down' : 'up';
        }
        if (direction) {
          this.onMove(direction);
        }
      }
    }
  }
}
