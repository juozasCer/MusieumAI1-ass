import * as THREE from 'three';
import { renderer } from './index'; // Ensure renderer is properly imported

// MATRIX FALLING DIGITS BACKGROUND
const canvas = document.createElement('canvas');
canvas.width = 4096; // Set the desired canvas width
canvas.height = 2048; // Set the desired canvas height
const ctx = canvas.getContext('2d')!;
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const matrixCharacters = katakana + latin + nums;
// const matrixCharacters =
//   ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~';
const fontSize = 12;
const columns = Math.max(1, Math.floor(canvas.width / fontSize));
const drops = Array(columns).fill(1);

const frameInterval = 3; // Adjust this value to change the speed (higher = slower)
let frameCount = 0; // Keeps track of frames

export function drawMatrixEffect() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FF00FF'; // Matrix green (change if needed)
  ctx.font = `${fontSize}px monospace`;

  // Only update drops every frameInterval frames
  if (frameCount % frameInterval === 0) {
    drops.forEach((y, index) => {
      const text = matrixCharacters.charAt(
        Math.floor(Math.random() * matrixCharacters.length)
      );
      const x = index * fontSize;
      ctx.fillText(text, x, y * fontSize);

      // Move the character down one position
      drops[index]++;

      // Reset drop if it's off the screen
      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[index] = 0;
      }
    });
  }

  // Increment frame count
  frameCount++;
}

// Create a texture from the canvas
export const matrixTexture = new THREE.CanvasTexture(canvas);
matrixTexture.wrapS = THREE.RepeatWrapping;
matrixTexture.wrapT = THREE.ClampToEdgeWrapping;
matrixTexture.repeat.set(1, 1);

// Improve texture filtering
matrixTexture.minFilter = THREE.LinearMipMapLinearFilter;
matrixTexture.magFilter = THREE.LinearFilter;

export function configureMatrixTexture() {
  // Ensure renderer is initialized before setting anisotropy
  matrixTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
}

// Create a large sphere geometry and map the texture
const sphereGeometry = new THREE.SphereGeometry(500, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({
  map: matrixTexture,
  side: THREE.BackSide, // Render on the inside of the sphere
});
export const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

export function initializeBackground(scene: THREE.Scene) {
  // Configure the matrix texture
  configureMatrixTexture();

  // Add the sphereMesh to the scene
  scene.add(sphereMesh);
}