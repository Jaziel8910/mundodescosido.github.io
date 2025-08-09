import * as THREE from 'three';
import { state } from './state.js';
import { GAME_STATE } from './constants.js';
import {
    cacheDOMElements, updateUIVisibility, showStatusMessage,
    updateCoinDisplay, updateDistanceDisplay, updateMaxDistanceDisplay,
    populateShop, applyEquippedItems, setupInventoryUI, updateInventoryUI,
    activateInventoryItem
} from './ui.js';
import { setupScene, configureShadows } from './scene.js';
import { setupPlayerControls, updatePlayer, onKeyDown, onKeyUp, respawnPlayer } from './player.js';
import { generateChunk, setSeed, removeOldChunks } from './world.js';
import { loadAllPersistentData, saveMaxDistance, loadMaxDistance, saveSlot, loadSlot, deleteSlot } from './persistence.js';

/**
 * The main initialization function for the game.
 */
export function init() {
    cacheDOMElements();
    setupScene();
    setupPlayerControls();
    setupEventListeners();

    loadAllPersistentData();
    applyEquippedItems();

    updateUIVisibility();
    populateShop();
    setupInventoryUI();

    // Set camera for main menu view
    state.camera.position.set(0, 5, 10);
    state.camera.lookAt(0, 1, 0);

    animate();
}

/**
 * The main animation loop.
 */
let menuBackgroundHue = Math.random();
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = Math.min(state.clock.getDelta(), 0.1);
    const effectiveDeltaTime = deltaTime * (state.slowMoActive && state.currentGameState === GAME_STATE.PLAYING ? state.slowMoFactor : 1);

    if (state.currentGameState === GAME_STATE.PLAYING) {
        updatePlayer(effectiveDeltaTime);

        if (state.currentDistance > state.maxDistanceReached) {
            state.maxDistanceReached = state.currentDistance;
            saveMaxDistance();
            updateMaxDistanceDisplay();
        }
        updateDistanceDisplay();

        if (state.controls.getObject().position.z > state.lastGeneratedChunkZ - 120) {
            generateChunk(state.lastGeneratedChunkZ, false);
            removeOldChunks();
        }

        if (state.currentDistance >= 10000 && state.currentGameState !== GAME_STATE.VICTORY) {
            switchGameState(GAME_STATE.VICTORY);
        }

    } else { // Not playing (in a menu)
        if (state.currentBackgroundStyle === 'default' && state.scene.background.setHSL) {
            menuBackgroundHue = (menuBackgroundHue + deltaTime * 0.003) % 1;
            state.scene.background.setHSL(menuBackgroundHue, 0.6, 0.05 + Math.sin(Date.now() * 0.00003) * 0.02);
        }
        if (state.currentGameState === GAME_STATE.MAIN_MENU) {
            state.camera.position.x = Math.sin(Date.now() * 0.0001) * 5;
            state.camera.position.z = Math.cos(Date.now() * 0.0001) * 5 + 5;
            state.camera.lookAt(0, 1, 0);
        }
    }

    // Render the scene
    if (state.graphicsSettings.bloomEnabled && state.composer) {
        state.composer.render(effectiveDeltaTime);
    } else {
        state.renderer.render(state.scene, state.camera);
    }
}

/**
 * Switches the game to a new state and updates the UI.
 * @param {string} newState - The state to switch to, from GAME_STATE.
 */
export function switchGameState(newState) {
    if (state.currentGameState === GAME_STATE.PLAYING && newState !== GAME_STATE.PLAYING) {
        if(state.controls?.isLocked) state.controls.unlock();
    }

    state.currentGameState = newState;
    updateUIVisibility();

    if (newState === GAME_STATE.PLAYING) {
        if (state.controls && !state.controls.isLocked) state.controls.lock();
    }
    if (newState === GAME_STATE.SHOP) {
        populateShop();
    }
}

/**
 * Starts a new game session.
 * @param {boolean} fromEditor - Whether the game is being started from the level editor.
 */
export function startGame(fromEditor = false) {
    if (fromEditor) {
        setSeed(state.editorParams.seed);
    } else {
        const newSeed = (Math.random().toString(36).substring(2, 10)).toUpperCase();
        setSeed(newSeed);
    }
    resetGameLogic();
    switchGameState(GAME_STATE.PLAYING);
}

/**
 * Resets the game state and world for a new game.
 */
function resetGameLogic() {
    state.platforms.forEach(p => state.scene.remove(p.mesh));
    state.platforms.length = 0;
    state.collectibles.forEach(c => state.scene.remove(c.mesh));
    state.collectibles.length = 0;

    state.lastGeneratedChunkZ = 0;
    state.currentDistance = 0;
    state.currentDistanceAtCheckpoint = 0;
    state.playerInventory.fill(null);
    updateInventoryUI();

    generateChunk(0);
    generateChunk(50);

    state.lastCheckpointPosition.set(0, 2.3, 0);
    state.controls.getObject().position.copy(state.lastCheckpointPosition);
    state.playerVelocity.set(0, 0, 0);
    state.playerOnGround = true;

    loadMaxDistance();
    updateMaxDistanceDisplay();
    showStatusMessage(`¡Comenzando partida! Dificultad: ${state.selectedDifficulty}`, 'text-green-400');
}

/**
 * Sets up all event listeners for the application.
 */
function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.currentGameState === GAME_STATE.PLAYING) {
                switchGameState(GAME_STATE.PAUSED);
            } else if (state.currentGameState !== GAME_STATE.MAIN_MENU) {
                switchGameState(GAME_STATE.MAIN_MENU);
            }
        } else {
            onKeyDown(e);
        }
    });
    document.addEventListener('keyup', onKeyUp);

    document.addEventListener('pointerlockerror', () => showStatusMessage("Bloqueo de puntero falló.", 'text-red-400'));

    state.controls.addEventListener('lock', () => {
        if (state.currentGameState === GAME_STATE.PLAYING || state.currentGameState === GAME_STATE.PAUSED) {
            switchGameState(GAME_STATE.PLAYING);
        }
    });

    state.controls.addEventListener('unlock', () => {
        if (state.currentGameState === GAME_STATE.PLAYING) {
            switchGameState(GAME_STATE.PAUSED);
        }
    });

    document.getElementById('gameCanvas').addEventListener('click', () => {
        if (state.currentGameState === GAME_STATE.PLAYING && !state.controls.isLocked) {
            state.controls.lock();
        }
    });

    // Main Menu
    document.getElementById('playButton').addEventListener('click', () => {
        if (state.currentGameState === GAME_STATE.PAUSED) {
            switchGameState(GAME_STATE.PLAYING);
        } else {
            switchGameState(GAME_STATE.DIFFICULTY_SELECT);
        }
    });
    document.getElementById('levelEditorButton').addEventListener('click', () => switchGameState(GAME_STATE.LEVEL_EDITOR));
    document.getElementById('shopButtonMainMenu').addEventListener('click', () => switchGameState(GAME_STATE.SHOP));
    document.getElementById('settingsButtonMainMenu').addEventListener('click', () => switchGameState(GAME_STATE.SETTINGS));

    // Difficulty
    document.querySelectorAll('[data-difficulty]').forEach(button => {
        button.addEventListener('click', (e) => {
            state.selectedDifficulty = e.target.dataset.difficulty;
            startGame();
        });
    });
    document.getElementById('backToMenuFromDifficulty').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));

    // Settings
     document.getElementById('graphicsQuality').addEventListener('change', (e) => {
        state.graphicsSettings.quality = e.target.value;
        configureShadows(state.graphicsSettings.quality);
     });
     document.getElementById('backToMenuFromSettings').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));

    // Victory
    document.getElementById('victoryBackToMenu').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));
}
