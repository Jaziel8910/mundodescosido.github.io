import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { state } from './state.js';

/**
 * Initializes and configures the core Three.js components.
 */
export function setupScene() {
    // Scene
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color().setHSL(Math.random(), 0.6, 0.05);

    // Camera
    state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200);
    state.camera.position.set(0, 5, 10);
    state.camera.lookAt(0, 1, 0);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    state.renderer = new THREE.WebGLRenderer({ canvas, antialias: state.graphicsSettings.antialias });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    state.scene.add(ambientLight);

    state.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    state.directionalLight.position.set(20, 30, 15);
    state.directionalLight.castShadow = true;
    state.scene.add(state.directionalLight);

    configureShadows(state.graphicsSettings.quality);

    // Post-processing (Bloom)
    const renderPass = new RenderPass(state.scene, state.camera);
    state.composer = new EffectComposer(state.renderer);
    state.composer.addPass(renderPass);

    state.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    state.bloomPass.threshold = 0.21;
    state.bloomPass.strength = 0.5;
    state.bloomPass.radius = 0.55;
    state.bloomPass.enabled = state.graphicsSettings.bloomEnabled;
    state.composer.addPass(state.bloomPass);

    window.addEventListener('resize', onWindowResize);
}

/**
 * Handles window resize events to keep the viewport and camera aspect ratio correct.
 */
function onWindowResize() {
    if (state.camera) {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
    }
    if (state.renderer) {
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    if (state.composer) {
        state.composer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * Adjusts shadow quality based on the selected graphics settings.
 * @param {string} quality - The graphics quality ('low', 'medium', 'high', etc.)
 */
export function configureShadows(quality) {
    if (!state.directionalLight) return;

    switch (quality) {
        case 'low':
            state.directionalLight.castShadow = false;
            state.renderer.shadowMap.enabled = false;
            break;
        case 'medium':
            state.directionalLight.castShadow = true;
            state.renderer.shadowMap.enabled = true;
            state.directionalLight.shadow.mapSize.width = 1024;
            state.directionalLight.shadow.mapSize.height = 1024;
            break;
        case 'high':
            state.directionalLight.castShadow = true;
            state.renderer.shadowMap.enabled = true;
            state.directionalLight.shadow.mapSize.width = 2048;
            state.directionalLight.shadow.mapSize.height = 2048;
            break;
        case 'ultra':
        case 'rtx5090':
            state.directionalLight.castShadow = true;
            state.renderer.shadowMap.enabled = true;
            state.directionalLight.shadow.mapSize.width = 4096;
            state.directionalLight.shadow.mapSize.height = 4096;
            break;
    }
    state.directionalLight.shadow.camera.near = 0.5;
    state.directionalLight.shadow.camera.far = 150;
    state.directionalLight.shadow.camera.left = -70;
    state.directionalLight.shadow.camera.right = 70;
    state.directionalLight.shadow.camera.top = 70;
    state.directionalLight.shadow.camera.bottom = -70;

    if (state.directionalLight.shadow.map) {
        state.directionalLight.shadow.map.dispose();
        state.directionalLight.shadow.map = null;
    }
}
