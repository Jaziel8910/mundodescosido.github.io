import * as THREE from 'three';
import { GAME_STATE, PLAYER_DEFAULTS, INVENTORY_SLOTS } from './constants.js';

// This object will hold the entire mutable state of the game.
export const state = {
    // Game flow
    currentGameState: GAME_STATE.MAIN_MENU,
    selectedDifficulty: 'normal',
    editorParams: { seed: '', spread: 4.5, heightVar: 2.0, forwardGap: 4.5, sizeMin: 1.5, sizeMax: 3.5, checkpointFreq: 0.05, collectibleFreq: 0.3 },

    // Core Three.js components
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    composer: null,
    bloomPass: null,
    directionalLight: null,

    // Player state
    playerVelocity: new THREE.Vector3(),
    playerOnGround: false,
    jumpsAvailable: 1,
    currentPlayerSpeed: PLAYER_DEFAULTS.baseSpeed,
    currentJumpStrength: PLAYER_DEFAULTS.baseJumpStrength,
    lastDashTime: 0,
    phaseThroughPlatforms: false,

    // World and level state
    gravityMultiplier: 1.0,
    lastCheckpointPosition: new THREE.Vector3(0, PLAYER_DEFAULTS.height + 0.5, 0),
    currentDistanceAtCheckpoint: 0,
    maxDistanceReached: 0,
    platforms: [],
    collectibles: [],
    currentDistance: 0,
    lastGeneratedChunkZ: 0,

    // Timers and counters
    playerCoins: 0,
    clock: new THREE.Clock(),

    // UI and menu states
    shopOpen: false,

    // Power-ups and inventory
    activePowerUp: null,
    powerUpTimeout: null,
    playerInventory: new Array(INVENTORY_SLOTS).fill(null),

    // Special modes
    slowMoActive: false,
    slowMoFactor: 0.3,

    // Experimental features
    experimentalFeaturesEnabled: false,
    dayNightCycleActive: false,
    timeOfDay: 0.25, // 0.25 is morning

    // Input state
    moveState: { forward: 0, backward: 0, left: 0, right: 0 },

    // PRNG
    currentSeedStringInternal: '',
    randomFunc: Math.random,

    // Shop and cosmetic items
    currentPlatformShape: 'box',
    currentBackgroundStyle: 'default',
    shopItems: [], // Will be populated from constants and localStorage

    // Graphics settings
    graphicsSettings: {
        quality: 'ultra',
        bloomEnabled: false,
        shadowMapSize: 4096,
        antialias: true
    },

    // A flag to check if the user has interacted with the page, for autoplay policies
    userInteracted: false,
};
