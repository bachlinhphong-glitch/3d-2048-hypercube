import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['three', 'gsap', /^three\//]
    }
  },
  plugins: [
    {
      name: 'copy-libs-and-assets',
      closeBundle() {
        copyDirSync(path.resolve(__dirname, 'libs'), path.resolve(__dirname, 'dist/libs'));
        copyDirSync(path.resolve(__dirname, 'assets'), path.resolve(__dirname, 'dist/assets'));
        ['manifest.json', 'sw.js', 'favicon.svg'].forEach(file => {
          const srcFile = path.resolve(__dirname, file);
          const destFile = path.resolve(__dirname, 'dist', file);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        });
      }
    }
  ]
});
