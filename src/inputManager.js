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

  bindEvents() {
    // 1. Keyboard Controls (Arrow keys, WASD, E/Q for 3D Hypercube Layers, Spell Hotkeys)
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

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

    // 2. Mouse Drag & Touch Swipe Controls
    this.domElement.addEventListener('pointerdown', (e) => {
      // Only process primary pointer (first finger / left mouse button)
      if (!e.isPrimary) {
        this.isPointerDown = false;
        return;
      }
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (e.target && e.target.closest && e.target.closest('button, select, input, label, .spell-btn, .modal-card, .settings-modal-card, .settings-modal-overlay, .header-bar, .rush-panel')) {
        return;
      }

      this.isPointerDown = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.pointerStartTime = Date.now();
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      if (!this.enabled) return;

      // Do not process swipes if released on interactive control elements
      if (e.target && e.target.closest && e.target.closest('button, select, input, label, .spell-btn, .modal-card, .settings-modal-card, .settings-modal-overlay, .header-bar, .rush-panel')) {
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
      const minDistance = 22; // Responsive swipe threshold for mobile touch & mouse
      const distance = Math.hypot(dx, dy);

      if (distance < minDistance) {
        if (this.onCanvasClick) {
          // Registered as a clean tap/click on the 3D canvas
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
    });

    this.domElement.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
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
