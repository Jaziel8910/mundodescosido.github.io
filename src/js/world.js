import * as THREE from 'three';
import { state } from './state.js';
import { POWER_UP_TYPES, WORLD_DEFAULTS, PLAYER_DEFAULTS } from './constants.js';

// --- PRNG (Seeded Random Number Generator) ---

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294969216;
    }
}

export function setSeed(seedStr) {
    state.currentSeedStringInternal = seedStr.toUpperCase().trim();
    if (!state.currentSeedStringInternal) {
        state.randomFunc = Math.random;
        // Update UI (this should be in ui.js)
        const worldSeedDisplay = document.getElementById('worldSeed');
        if (worldSeedDisplay) worldSeedDisplay.textContent = "ALEATORIO";
        return;
    }
    let hash = 0;
    for (let i = 0; i < state.currentSeedStringInternal.length; i++) {
        const char = state.currentSeedStringInternal.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    state.randomFunc = mulberry32(hash);
    const worldSeedDisplay = document.getElementById('worldSeed');
    if (worldSeedDisplay) worldSeedDisplay.textContent = state.currentSeedStringInternal;
}


// --- Level Generation ---

function getRandomInRange(min, max) { return state.randomFunc() * (max - min) + min; }
function getRandomElement(arr) { return arr[Math.floor(state.randomFunc() * arr.length)]; }
function lerp(a, b, t) { return a + (b - a) * t; }

export function generateChunk(startZ, useEditorParams = false) {
    let currentPos = new THREE.Vector3(0, 0, startZ);
    const numPlatformsInChunk = WORLD_DEFAULTS.platformChunkSize;

    if (startZ === 0) {
        const startPlatform = createPlatform(new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 1.5, 5), 0x78716C);
        state.platforms.push(startPlatform);
        currentPos.z += 4;
    } else {
        if (state.platforms.length > 0) {
            let lastPlatform = state.platforms.reduce((prev, curr) => (prev.mesh.position.z > curr.mesh.position.z) ? prev : curr);
            currentPos.copy(lastPlatform.mesh.position);
            currentPos.y -= getPlatformHeight(lastPlatform.mesh) / 2;
            currentPos.z += getPlatformDepth(lastPlatform.mesh) / 2;
        } else {
            currentPos.set(0, 0, startZ);
        }
    }

    const { editorParams, selectedDifficulty } = state;
    const baseSpreadX = useEditorParams ? editorParams.spread : 4.5;
    const baseHeightVarY = useEditorParams ? editorParams.heightVar : 2.0;
    const baseForwardGapZ = useEditorParams ? editorParams.forwardGap : 4.5;
    const baseSizeMin = useEditorParams ? editorParams.sizeMin : 1.5;
    const baseSizeMax = useEditorParams ? editorParams.sizeMax : 3.5;
    const baseCheckpointFreq = useEditorParams ? editorParams.checkpointFreq : 0.05;
    const baseCollectibleFreq = useEditorParams ? editorParams.collectibleFreq : 0.3;

    let difficultyFactor = Math.min(1, Math.max(0, (startZ - 50) / 250));
    if (selectedDifficulty === 'hard') difficultyFactor = Math.min(1, Math.max(0, (startZ - 20) / 150)) * 1.2;
    if (selectedDifficulty === 'extreme') difficultyFactor = Math.min(1, Math.max(0, (startZ - 10) / 100)) * 1.5;
    difficultyFactor = Math.max(0, Math.min(difficultyFactor, 1.5));

    const offsetX_min = lerp(2.0, baseSpreadX - 1.0, difficultyFactor);
    const offsetX_max = lerp(3.5, baseSpreadX + 1.0, difficultyFactor);
    const offsetY_min = lerp(-1.8, -baseHeightVarY, difficultyFactor);
    const offsetY_max = lerp(1.8, baseHeightVarY, difficultyFactor);
    const offsetZ_min = lerp(2.8, baseForwardGapZ - 1.0, difficultyFactor);
    const offsetZ_max = lerp(4.5, baseForwardGapZ + 1.0, difficultyFactor);

    for (let i = 0; i < numPlatformsInChunk; i++) {
        const sizeX = Math.max(baseSizeMin, getRandomInRange(baseSizeMin, baseSizeMax - difficultyFactor * 1.5));
        let sizeY = Math.max(0.3, getRandomInRange(0.4, 1.0 - difficultyFactor * 0.3));
        const sizeZ = Math.max(baseSizeMin, getRandomInRange(baseSizeMin, baseSizeMax - difficultyFactor * 1.5));

        if (state.currentPlatformShape === 'sphere') sizeY = Math.max(0.5, Math.min(sizeX, sizeZ));
        else if (state.currentPlatformShape === 'cylinder') sizeY = Math.max(0.5, getRandomInRange(0.8, 2.5 - difficultyFactor));

        const offsetX = getRandomInRange(offsetX_min, offsetX_max) * (state.randomFunc() < 0.5 ? 1 : -1);
        const offsetY = getRandomInRange(offsetY_min, offsetY_max);
        const offsetZ = getRandomInRange(offsetZ_min, offsetZ_max);

        currentPos.x += offsetX;
        currentPos.y += offsetY;
        currentPos.z += offsetZ;

        if (currentPos.y < -60) currentPos.y = -60 + getRandomInRange(0, 5);

        let platformColor = new THREE.Color().setHSL(state.randomFunc(), 0.6, 0.5).getHex();
        let isCheckpoint = false;

        const checkpointChance = selectedDifficulty === 'extreme' ? baseCheckpointFreq / 2 : baseCheckpointFreq;
        if (state.randomFunc() < checkpointChance && i > 3 && startZ + currentPos.z > 30) {
            platformColor = 0xffff00;
            isCheckpoint = true;
        }

        const platformData = createPlatform(currentPos.clone(), new THREE.Vector3(sizeX, sizeY, sizeZ), platformColor, isCheckpoint, state.currentPlatformShape);
        state.platforms.push(platformData);

        const collectibleChance = selectedDifficulty === 'extreme' ? baseCollectibleFreq / 2 : baseCollectibleFreq;
        if (state.randomFunc() < collectibleChance && !isCheckpoint) {
            const type = state.randomFunc() < 0.6 ? 'coin' : 'powerUp';
            if (type === 'powerUp') {
                createCollectible(new THREE.Vector3(currentPos.x, currentPos.y + getPlatformHeight(platformData.mesh) / 2 + 0.7, currentPos.z), 'powerUp');
            } else {
                const numCoins = Math.floor(state.randomFunc() * (selectedDifficulty === 'extreme' ? 2 : 3)) + 1;
                for (let j = 0; j < numCoins; j++) {
                    const coinOffsetX = (state.randomFunc() - 0.5) * (sizeX * 0.6);
                    const coinOffsetZ = (state.randomFunc() - 0.5) * (sizeZ * 0.6);
                    createCollectible(new THREE.Vector3(currentPos.x + coinOffsetX, currentPos.y + getPlatformHeight(platformData.mesh) / 2 + 0.4 + j * 0.6, currentPos.z + coinOffsetZ), 'coin');
                }
            }
        }
    }
    state.lastGeneratedChunkZ = currentPos.z;
}

export function createPlatform(position, size, color, isCheckpoint = false, shape = 'box') {
    let geometry;
    let effectiveSizeY = size.y;

    if (shape === 'sphere') {
        const radius = Math.max(0.5, Math.min(size.x, size.z) / 2);
        geometry = new THREE.SphereGeometry(radius, 16, 12);
        effectiveSizeY = radius * 2;
        position.y += (effectiveSizeY / 2 - size.y / 2);
    } else if (shape === 'cylinder') {
        const radius = Math.max(0.5, Math.min(size.x, size.z) / 2);
        geometry = new THREE.CylinderGeometry(radius, radius, size.y, 16);
    } else {
        geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    }

    const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 });
    const platformMesh = new THREE.Mesh(geometry, material);
    platformMesh.position.copy(position);
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;

    if (state.randomFunc() < 0.35 && !isCheckpoint && shape === 'box') {
        platformMesh.rotation.x = (state.randomFunc() - 0.5) * 0.5;
        platformMesh.rotation.z = (state.randomFunc() - 0.5) * 0.5;
    }
    state.scene.add(platformMesh);
    return { mesh: platformMesh, isCheckpoint, type: 'platform', originalColor: color, activated: false, shape: shape };
}

export function createCollectible(position, type) {
    let geometry, material, collectibleId, color;
    if (type === 'powerUp') {
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const availablePowerUps = POWER_UP_TYPES.filter(pu => !pu.experimental || state.experimentalFeaturesEnabled);
        if (availablePowerUps.length === 0) return;
        const randomPowerUp = getRandomElement(availablePowerUps);
        color = randomPowerUp.color;
        collectibleId = randomPowerUp.id;
        material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.2, emissive: color, emissiveIntensity: 0.3 });
    } else if (type === 'coin') {
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        color = 0xffd700;
        collectibleId = 'coin';
        material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.8, emissive: color, emissiveIntensity: 0.4 });
    } else { return; }

    const collectibleMesh = new THREE.Mesh(geometry, material);
    collectibleMesh.position.copy(position);
    collectibleMesh.castShadow = true;
    collectibleMesh.receiveShadow = true;
    state.scene.add(collectibleMesh);
    state.collectibles.push({ mesh: collectibleMesh, type: type, collectibleId: collectibleId, color: color });
}

export function removeOldChunks() {
    if (!state.controls || !state.controls.getObject()) return;
    const playerZ = state.controls.getObject().position.z;

    const platformsToRemove = state.platforms.filter(p => p.mesh.position.z < playerZ - WORLD_DEFAULTS.chunkRemoveDistance);
    platformsToRemove.forEach(pData => { if (pData.mesh) state.scene.remove(pData.mesh); });
    state.platforms = state.platforms.filter(p => !(p.mesh.position.z < playerZ - WORLD_DEFAULTS.chunkRemoveDistance));

    const collectiblesToRemove = state.collectibles.filter(c => c.mesh.position.z < playerZ - WORLD_DEFAULTS.chunkRemoveDistance);
    collectiblesToRemove.forEach(cData => { if (cData.mesh) state.scene.remove(cData.mesh); });
    state.collectibles = state.collectibles.filter(c => !(c.mesh.position.z < playerZ - WORLD_DEFAULTS.chunkRemoveDistance));
}

// --- Platform Dimension Getters ---

export function getPlatformHeight(mesh) {
    if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1;
    if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.height;
    if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
    if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.height;
    return 1;
}
export function getPlatformDepth(mesh) {
    if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1;
    if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.depth;
    if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
    if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.radiusTop * 2;
    return 1;
}
export function getPlatformWidth(mesh) {
    if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1;
    if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.width;
    if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
    if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.radiusTop * 2;
    return 1;
}
