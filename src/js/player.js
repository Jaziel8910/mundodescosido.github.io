import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { state } from './state.js';
import { PLAYER_DEFAULTS, GAME_STATE, POWER_UP_TYPES } from './constants.js';
import { getPlatformHeight, getPlatformWidth, getPlatformDepth, createPlatform } from './world.js';
import { showStatusMessage, updateCoinDisplay, addPowerUpToInventory, applyPowerUpEffect, resetPowerUpEffects } from './ui.js'; // We will create these UI functions next

/**
 * Sets up the PointerLockControls for the player camera.
 */
export function setupPlayerControls() {
    state.controls = new PointerLockControls(state.camera, state.renderer.domElement);
    state.scene.add(state.controls.getObject());
}

/**
 * Resets the player to the last checkpoint.
 */
export function respawnPlayer() {
    if (state.controls && state.controls.getObject()) {
        // This function will call persistence and UI modules
        // saveMaxDistance();
        state.controls.getObject().position.copy(state.lastCheckpointPosition);
        state.playerVelocity.set(0, 0, 0);
        state.playerOnGround = true;
        state.jumpsAvailable = 1;
        showStatusMessage("¡Caíste! Reintentando desde el último checkpoint!", 'text-red-400');
        resetPowerUpEffects();
    }
}

/**
 * Updates player position and handles physics and collisions.
 * @param {number} deltaTime - The time since the last frame.
 */
export function updatePlayer(deltaTime) {
    if (!state.controls || !state.controls.getObject()) return;

    const moveSpeed = state.currentPlayerSpeed * deltaTime;
    if (state.moveState.forward) state.controls.moveForward(moveSpeed);
    if (state.moveState.backward) state.controls.moveForward(-moveSpeed);
    if (state.moveState.right) state.controls.moveRight(moveSpeed);
    if (state.moveState.left) state.controls.moveLeft(moveSpeed);

    const playerObject = state.controls.getObject();
    playerObject.position.x += state.playerVelocity.x * deltaTime;
    playerObject.position.z += state.playerVelocity.z * deltaTime;
    state.playerVelocity.x *= (1 - 10 * deltaTime);
    state.playerVelocity.z *= (1 - 10 * deltaTime);

    state.playerVelocity.y += PLAYER_DEFAULTS.gravity * state.gravityMultiplier * deltaTime;
    playerObject.position.y += state.playerVelocity.y * deltaTime;

    state.playerOnGround = false;
    const playerBox = new THREE.Box3().setFromCenterAndSize(
        playerObject.position,
        new THREE.Vector3(PLAYER_DEFAULTS.radius * 2, PLAYER_DEFAULTS.height, PLAYER_DEFAULTS.radius * 2)
    );
    const playerBottomY = playerObject.position.y - PLAYER_DEFAULTS.height / 2;

    for (const pData of state.platforms) {
        const platformMesh = pData.mesh;
        if (!platformMesh) continue;

        const platformBox = new THREE.Box3().setFromObject(platformMesh);

        if (playerBox.intersectsBox(platformBox)) {
            if (state.phaseThroughPlatforms) {
                state.phaseThroughPlatforms = false;
                showStatusMessage("¡Faseado!", 'text-purple-400');
                continue;
            }

            const pHeight = getPlatformHeight(platformMesh);
            if (state.playerVelocity.y <= 0 && playerBottomY <= platformBox.max.y + 0.2 && playerBottomY >= platformBox.max.y - pHeight * 0.5) {
                if (playerObject.position.x > platformBox.min.x - PLAYER_DEFAULTS.radius && playerObject.position.x < platformBox.max.x + PLAYER_DEFAULTS.radius &&
                    playerObject.position.z > platformBox.min.z - PLAYER_DEFAULTS.radius && playerObject.position.z < platformBox.max.z + PLAYER_DEFAULTS.radius) {

                    playerObject.position.y = platformBox.max.y + PLAYER_DEFAULTS.height / 2;
                    state.playerVelocity.y = 0;
                    state.playerOnGround = true;
                    state.jumpsAvailable = (state.activePowerUp?.type === 'doubleJump') ? 2 : 1;

                    if (pData.isCheckpoint && !pData.activated) {
                        state.lastCheckpointPosition.copy(platformMesh.position);
                        state.lastCheckpointPosition.y += getPlatformHeight(platformMesh) / 2 + PLAYER_DEFAULTS.height / 2 + 0.1;
                        state.currentDistanceAtCheckpoint = state.currentDistance;
                        platformMesh.material.color.set(0x34D399);
                        pData.activated = true;
                        showStatusMessage("¡Checkpoint alcanzado!", 'text-yellow-400');
                    }
                }
            } else if (state.playerVelocity.y > 0 && playerObject.position.y + PLAYER_DEFAULTS.height / 2 > platformBox.min.y && playerObject.position.y - PLAYER_DEFAULTS.height / 2 < platformBox.min.y) {
                state.playerVelocity.y = -0.1;
            } else {
                const overlap = playerBox.intersect(platformBox).getSize(new THREE.Vector3());
                if (overlap.x < overlap.z && overlap.x > 0.01) {
                    playerObject.position.x += (playerObject.position.x > platformMesh.position.x ? overlap.x : -overlap.x) * 0.5;
                } else if (overlap.z > 0.01) {
                    playerObject.position.z += (playerObject.position.z > platformMesh.position.z ? overlap.z : -overlap.z) * 0.5;
                }
            }
        }
    }

    for (let i = state.collectibles.length - 1; i >= 0; i--) {
        const collectible = state.collectibles[i];
        if (!collectible.mesh) continue;
        const collectibleBox = new THREE.Box3().setFromObject(collectible.mesh);
        if (playerBox.intersectsBox(collectibleBox)) {
            state.scene.remove(collectible.mesh);
            const collectedItem = state.collectibles.splice(i, 1)[0];

            if (collectedItem.type === 'powerUp') {
                const powerUpDetails = POWER_UP_TYPES.find(pu => pu.id === collectedItem.collectibleId);
                if (powerUpDetails) {
                    addPowerUpToInventory(powerUpDetails);
                }
            } else if (collectedItem.collectibleId === 'coin') {
                state.playerCoins++;
                updateCoinDisplay();
                showStatusMessage("¡Moneda recogida!", 'text-yellow-400');
            }
        }
    }

    if (playerObject.position.y < -60) respawnPlayer();

    state.currentDistance = Math.max(0, playerObject.position.z);
    // UI update for distance will be in the main animate loop
}


/**
 * Handles key down events for player movement and actions.
 * @param {KeyboardEvent} event
 */
export function onKeyDown(event) {
    const key = event.key.toLowerCase();

    // Allow certain keys even when not playing
    if (key === 'escape') {
        // This will be handled in the main game module
        return;
    }

    if (state.currentGameState !== GAME_STATE.PLAYING) return;

    switch (key) {
        case 'w': case 'arrowup': state.moveState.forward = 1; break;
        case 's': case 'arrowdown': state.moveState.backward = 1; break;
        case 'a': case 'arrowleft': state.moveState.left = 1; break;
        case 'd': case 'arrowright': state.moveState.right = 1; break;
        case ' ': // Jump
            if (state.playerOnGround) {
                state.playerVelocity.y = state.currentJumpStrength;
                state.playerOnGround = false;
                state.jumpsAvailable = (state.activePowerUp?.type === 'doubleJump') ? 2 : 1;
                if (state.activePowerUp?.type === 'doubleJump') state.jumpsAvailable--;
            } else if (state.jumpsAvailable > 0 && state.activePowerUp?.type === 'doubleJump') {
                state.playerVelocity.y = state.currentJumpStrength * 0.85;
                state.jumpsAvailable--;
            }
            break;
        case 'r': respawnPlayer(); break;
        case 'shift':
             if (event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
                const now = Date.now();
                if (now - state.lastDashTime > 1500) { // dashCooldown
                    const dashDirection = new THREE.Vector3();
                    state.controls.getDirection(dashDirection);
                    dashDirection.y = 0;
                    dashDirection.normalize();
                    state.playerVelocity.addScaledVector(dashDirection, 25); // dashSpeed
                    if (state.playerOnGround) state.playerVelocity.y += 2;
                    state.lastDashTime = now;
                    showStatusMessage("¡Dash!", 'text-purple-400');
                }
            }
            break;
        case '1': case '2': case '3':
            // activateInventoryItem(parseInt(key) - 1); // This will be in ui.js
            break;
    }
}

/**
 * Handles key up events for player movement.
 * @param {KeyboardEvent} event
 */
export function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (state.currentGameState !== GAME_STATE.PLAYING) return;

    switch (key) {
        case 'w': case 'arrowup': state.moveState.forward = 0; break;
        case 's': case 'arrowdown': state.moveState.backward = 0; break;
        case 'a': case 'arrowleft': state.moveState.left = 0; break;
        case 'd': case 'arrowright': state.moveState.right = 0; break;
    }
}
