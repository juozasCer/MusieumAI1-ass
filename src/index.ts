import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { Group, Scene, Texture, Mesh, VideoTexture } from 'three';
import { velocity, direction, moveForward, moveBackward, moveLeft, moveRight } from './controls';
import * as backgroundmodule from "./background"
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// Initialize RectAreaLightUniformsLib (necessary for RectAreaLight)
RectAreaLightUniformsLib.init();

// SCENE
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Initial background color

// CAMERA
const camera = new THREE.PerspectiveCamera(
  70, // Field of view
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 0); // First-person camera at height 1.6

// RENDERER
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

let isBackgroundInitialized = false;

let isEverythingLoaded = false;

// Pointer lock event listeners
document.addEventListener('click', () => {
  if (isEverythingLoaded && !controls.isLocked) {
    setTimeout(() => {
      controls.lock(); // Lock the pointer after a 1 second delay
    }, 300);
  }
}, false);
// Flag to ensure background is initialized only once

// Handle Pointer Lock 'lock' event
controls.addEventListener('lock', () => {
  const instructions = document.getElementById('instructions');
  const blocker = document.getElementById('blocker');
  if (instructions && blocker) {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  }

  // Initialize Background only once when the pointer is locked
  if (!isBackgroundInitialized) {
    backgroundmodule.initializeBackground(scene);
    isBackgroundInitialized = true;
  }
});

// Handle Pointer Lock 'unlock' event
controls.addEventListener('unlock', () => {
  const instructions = document.getElementById('instructions');
  const blocker = document.getElementById('blocker');
  if (instructions && blocker) {
    blocker.style.display = 'block';
    instructions.style.display = '';
  }
});

// Initialize Loading Manager
const loadingManager = new THREE.LoadingManager();

// Get Loading Screen Elements
const loadingScreen = document.getElementById('loading-screen')!;
const progressBar = document.getElementById('progress-bar')!;

// Initialize Counters
let totalItems = 0;
let loadedItems = 0;

// Handle Loading Manager Events
loadingManager.onStart = function (url, itemsLoadedInternal, itemsTotalInternal) {
  console.log(`Started loading: ${url}.`);
  loadingScreen.style.display = 'flex'; // Ensure loading screen is visible
  totalItems += 1; // Increment total items
};

loadingManager.onLoad = function () {
  console.log('All assets loaded.');
  loadingScreen.style.display = 'none'; // Hide loading screen
  const blocker = document.getElementById('blocker');
  if (blocker) {
    blocker.style.display = 'block'; // Show blocker and instructions
  }
  isEverythingLoaded = true;
};

loadingManager.onProgress = function (url, itemsLoadedInternal, itemsTotalInternal) {
  loadedItems += 1; // Increment loaded items
  const progress = (loadedItems / totalItems) * 2.2;
  // console.log(`Loading: ${progress.toFixed(2)}% loaded.`);
  progressBar.style.width = `${progress}%`;
};

loadingManager.onError = function (url) {
  console.error(`There was an error loading ${url}`);
};

// Initialize Loaders with Loading Manager
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);


// === Define BlinkingLight Class ===

// Define a BlinkingLight class for better management
class BlinkingLight {
  light: THREE.PointLight;
  helper: THREE.PointLightHelper; // Add helper property
  speed: number;
  minIntensity: number;
  maxIntensity: number;

  constructor(
    color: number,
    intensity: number,
    distance: number,
    position: THREE.Vector3,
    speed: number,
    minIntensity: number = 0,
    maxIntensity: number = intensity
  ) {
    this.light = new THREE.PointLight(color, intensity, distance);
    this.light.position.copy(position);
    scene.add(this.light);
    this.speed = speed;
    this.minIntensity = minIntensity;
    this.maxIntensity = maxIntensity;
    this.helper = new THREE.PointLightHelper(this.light, 1);
    // scene.add(this.helper);
  }

  update(time: number) {
    this.light.intensity =
      this.minIntensity +
      (this.maxIntensity - this.minIntensity) * (Math.sin(time * this.speed) + 1) / 2;
  }
}

// Create multiple blinking lights with different properties
const blinkingLights: BlinkingLight[] = [];
// RECT AREA LIGHT
addRectAreaLight(
  { x: -2.5, y: 5, z: -17 },     // Position of the light
  { width: 0.5, height: 16 },   // Size of the light
  0xffffff,                  // Color
  40,                         // Intensity
  { x: -2.5, y: 0, z: -17 }       // Target point
);

addRectAreaLight(
  { x: 2.5, y: 5, z: -17 },     // Position of the light
  { width: 0.5, height:16 },   // Size of the light
  0xffffff,                  // Color
  40,                         // Intensity
  { x:2.5, y: 0, z: -17 }       // Target point
);

// addRectAreaLight(
//   { x: 0, y: 5, z: -30 },   // Different position
//   { width: 4, height: 6 },   // Different size
//   0xff0000,                  // Different color
//   10,                        // Higher intensity
//   { x: 0, y: 0, z: 0 }      // Different target
// );
blinkingLights.push(
  new BlinkingLight(
    0x0000ff,               // Color
    2,                      // Initial Intensity
    10,                     // Distance
    new THREE.Vector3(-3, 1.5, -49.5), // Position
    0.2,                    // Speed
    0,                      // Min Intensity
    10                      // Max Intensity
  )
);

blinkingLights.push(
  new BlinkingLight(
    0xff00ff,               // Color
    20,                      // Initial Intensity
    15,                     // Distance
    new THREE.Vector3(0, 7,0), // Position
    0.2,                    // Speed
    0,                      // Min Intensity
    10                      // Max Intensity
  )
);
blinkingLights.push(
  new BlinkingLight(
    0x0000ff,               // Color
    20,                      // Initial Intensity
    10,                     // Distance
    new THREE.Vector3(0, 5, 0), // Position
    1,                    // Speed
    0,                      // Min Intensity
    10                      // Max Intensity
  )
);
// You can add more blinking lights similarly


// === Define Functions Before Calling Them ===

// Function to add a RectAreaLight with customizable size, position, intensity, and target
function addRectAreaLight(
  position = { x: 0, y: 0, z: 0 },
  size = { width: 2, height: 8 },
  color = 0xffffff,
  intensity = 8,
  target = { x: 0, y: 0, z: 0 }
) {
  const rectLight = new THREE.RectAreaLight(color, intensity, size.width, size.height);
  rectLight.position.set(position.x, position.y, position.z);

  // Make the light look at the specified target
  rectLight.lookAt(target.x, target.y, target.z);
  scene.add(rectLight);

  // Optionally, add a helper to visualize the light's position and orientation
  const rectLightHelper = new RectAreaLightHelper(rectLight);
  // rectLight.add(rectLightHelper);

  return rectLight; // Return the light in case you need further manipulation
}

// Function to create and apply a video material to a specific mesh
function applyVideoMaterial(model: Group | Scene, meshName: string, videoURL: string) {
  // Create a video element
  const video = document.createElement('video');
  video.src = videoURL; // Set the video source
  video.loop = true;
  video.muted = true; // Mute if needed

  // Start loading the video
  video.load();

  // Wait for the video to be ready to play
  video.addEventListener('canplaythrough', () => {
    console.log(`Video ${videoURL} is ready to play.`);
    video.play();

    // Create a VideoTexture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.flipY = false; // Flip the video texture

    // Create a material using the video texture
    const videoMaterial = new THREE.MeshStandardMaterial({
      map: videoTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.1,
    });

    // Apply the video material to the specified mesh
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === meshName) {
        child.material = videoMaterial;
      }
    });
  });

  // Handle video loading errors
  video.addEventListener('error', (e) => {
    console.error(`Error loading video ${videoURL}:`, e);
  });
}

// FLOOR GENERATION FUNCTION
function generateFloor() {
  // TEXTURES
  // const placeholder = textureLoader.load("./textures/placeholder/placeholder.png");
  const sandBaseColor = textureLoader.load("./textures/blackTiles/rubber_tiles_diff_4k.jpg");
  const sandNormalMap = textureLoader.load("./textures/blackTiles/rubber_tiles_nor_gl_4k.jpg");
  // const sandHeightMap = textureLoader.load("./textures/blackTiles/rubber_tiles_nor_gl_4k.jpg");
  // const sandAmbientOcclusion = textureLoader.load("./textures/blackTiles/rubber_tiles_nor_gl_4k.jpg");

  const WIDTH = 80;
  const LENGTH = 80;

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
  const material = new THREE.MeshStandardMaterial({
    map: sandBaseColor,
    normalMap: sandNormalMap,
    displacementScale: 0.1,
    metalness: 0.9,          // Adjust to control the reflectivity level
    roughness: 0,             // Lower values create more glossiness
    transparent: true,
    opacity: 0.5,
  });
  wrapAndRepeatTexture(material.map as Texture);
  wrapAndRepeatTexture(material.normalMap as Texture);

  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function wrapAndRepeatTexture(map: Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(100, 100);
}

// LIGHTS FUNCTION
function light() {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Directional Light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-60, 100, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  scene.add(dirLight);

  // Optional: Visualize the directional light's shadow camera
  const dirLightHelper = new THREE.CameraHelper(dirLight.shadow.camera);
  scene.add(dirLightHelper);
}

// LOAD MODEL FUNCTION
function loadModel() {
  gltfLoader.load(
    './models/mao.glb',
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1.5, 1.5, 1.5);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log(child.name);
          
          child.castShadow = true;
          child.receiveShadow = true; // Enable shadow casting for each mesh
        }
      });

      // Apply video material to specific meshes
      applyVideoMaterial(model, 'Screenshot_2024-11-14_125839', '/media/video.mp4');
      applyVideoMaterial(model, 'Object_0010_1', '/media/act.mp4');

      model.traverse((child) => {
        if (child instanceof Mesh) {
          // console.log(child.name); // Log each mesh name
          if (child.name === "Object_0010_1") { // Example: Apply red material to "Text010"
            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000,transparent:true,opacity:1 }); // Red color for testing
            // child.position.set(0, -0.1, 0.5); 
          }
        }
      });

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error('An error occurred while loading the GLB model:', error);
    }
  );
}

// ADD REFLECTOR PLANE
addReflectorPlane(); // **Added Reflector Plane**

 // Function to add a Reflector Plane
function addReflectorPlane() { // **Added Function**
  const WIDTH = 80; // Same as floor width
  const LENGTH = 80; // Same as floor length

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH);

  const reflector = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777
  });

  reflector.rotation.x = - Math.PI / 2; // Rotate to be horizontal
  reflector.position.y = -0.01; // Slightly above the floor to prevent z-fighting
  scene.add(reflector);
}

// Initialize and Load Assets
generateFloor(); // Ensure this is called after textureLoader is defined
loadModel();

// Clock for animations
const clock = new THREE.Clock();

// === Matrix Effect for Loading Screen ===

// Get the loading matrix canvas and context
const loadingMatrixCanvas = document.getElementById('loading-matrix') as HTMLCanvasElement;
const loadingCtx = loadingMatrixCanvas.getContext('2d')!;

// Set canvas size to match the loading screen
function resizeLoadingMatrixCanvas() {
  loadingMatrixCanvas.width = 2048;
  loadingMatrixCanvas.height = window.innerHeight;
}

resizeLoadingMatrixCanvas();
window.addEventListener('resize', resizeLoadingMatrixCanvas);

// Define matrix characters
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const matrixCharacters = katakana + latin + nums;
// const matrixCharacters =
//   ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~';
const fontSizeLoading = 16;
const columnsLoading = Math.max(1, Math.floor(loadingMatrixCanvas.width / fontSizeLoading));
const dropsLoading = Array(columnsLoading).fill(1);

const frameIntervalLoading = 2; // Adjust this value to change the speed (higher = slower)
let frameCountLoading = 0; // Keeps track of frames

function drawLoadingMatrixEffect() {
  loadingCtx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  loadingCtx.fillRect(0, 0, loadingMatrixCanvas.width, loadingMatrixCanvas.height);

  loadingCtx.fillStyle = '#FF00FF'; // Matrix green (change if needed)
  loadingCtx.font = `${fontSizeLoading}px CustomFont`;

  // Only update drops every frameInterval frames
  if (frameCountLoading % frameIntervalLoading === 0) {
    dropsLoading.forEach((y, index) => {
      const text = matrixCharacters.charAt(
        Math.floor(Math.random() * matrixCharacters.length)
      );
      const x = index * fontSizeLoading;
      loadingCtx.fillText(text, x, y * fontSizeLoading);

      // Move the character down one position
      dropsLoading[index]++;

      // Reset drop if it's off the screen
      if (y * fontSizeLoading > loadingMatrixCanvas.height && Math.random() > 0.975) {
        dropsLoading[index] = 0;
      }
    });
  }

  // Increment frame count
  frameCountLoading++;
}

// Animate the Matrix Effect on Loading Screen
function animateLoadingMatrix() {
  drawLoadingMatrixEffect();
  requestAnimationFrame(animateLoadingMatrix);
}
animateLoadingMatrix();

// ANIMATE
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  if (controls.isLocked === true) {
    // Update movement
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = 50; // Movement speed
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Constrain camera position
    const position = controls.getObject().position;
    position.x = THREE.MathUtils.clamp(position.x, -2.5, 2.5); // Limit x to ±3
    position.z = THREE.MathUtils.clamp(position.z, -23, 2); // Limit z to -23 to +5
  }

  // Update Matrix background only if background is initialized
  if (isBackgroundInitialized) {
    backgroundmodule.drawMatrixEffect();
    backgroundmodule.matrixTexture.needsUpdate = true; // Update the texture every frame

    // Make the sphere follow the camera to prevent reaching its edges
    backgroundmodule.sphereMesh.position.copy(camera.position);
  }

  // === Blinking Lights Intensity Update ===
  blinkingLights.forEach((blinkingLight, index) => {
    blinkingLight.update(elapsedTime);
    // console.log(`BlinkingLight ${index} intensity:`, blinkingLight.light.intensity);
  });

  renderer.render(scene, camera);
}
animate();

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update loading matrix canvas size
  resizeLoadingMatrixCanvas();
}
window.addEventListener('resize', onWindowResize);

// Initialize Lights
// light(); // Ensure lights are added to the scene
