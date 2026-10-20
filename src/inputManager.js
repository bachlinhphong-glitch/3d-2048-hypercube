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

    this.bindEvents();
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
        case 'ShiftLeft':
        case 'ShiftRight':
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
      if (e.target && e.target.closest && e.target.closest('button, select, input, .spell-btn, .modal-card, .header-bar, .rush-panel')) {
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
      if (e.target && e.target.closest && e.target.closest('button, select, input, .spell-btn, .modal-card, .header-bar, .rush-panel')) {
        return;
      }

      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      const dt = Date.now() - this.pointerStartTime;

      const minDistance = 22; // Responsive swipe threshold for mobile touch & mouse
      const distance = Math.hypot(dx, dy);

      if (distance >= minDistance) {
        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }

        if (direction) {
          this.onMove(direction);
        }
      } else if (dt < 400 && this.onCanvasClick) {
        // Registered as a clean tap on the 3D canvas
        this.onCanvasClick(e.clientX, e.clientY);
      }
    });

    this.domElement.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
    });

    // 3. UI Buttons for movement are handled by main.js via #dir-pad
  }
}
