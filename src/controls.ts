import * as THREE from 'three';

// MOVEMENT VARIABLES
export const velocity = new THREE.Vector3();
export const direction = new THREE.Vector3();
export let moveForward = false;
export let moveBackward = false;
export let moveLeft = false;
export let moveRight = false;

// KEYBOARD INPUTS
document.addEventListener(
  'keydown',
  (event) => {
    switch (event.code) {
      case 'KeyW':
        moveForward = true;
        break;
      case 'KeyA':
        moveLeft = true;
        break;
      case 'KeyS':
        moveBackward = true;
        break;
      case 'KeyD':
        moveRight = true;
        break;
    }
  },
  false
);

document.addEventListener(
  'keyup',
  (event) => {
    switch (event.code) {
      case 'KeyW':
        moveForward = false;
        break;
      case 'KeyA':
        moveLeft = false;
        break;
      case 'KeyS':
        moveBackward = false;
        break;
      case 'KeyD':
        moveRight = false;
        break;
    }
  },
  false
);