<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mundo Descosido - Edición Definitiva</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>

    <style>
        body { margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; background-color: #0c0a09; color: #F3F4F6; }
        .panel {
            position: absolute;
            padding: 20px;
            background-color: rgba(17, 24, 39, 0.94); /* bg-gray-900 with more opacity */
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            z-index: 100;
            border: 1px solid rgba(75, 85, 99, 0.6); /* border-gray-600 */
            backdrop-filter: blur(5px); /* Efecto de desenfoque sutil */
        }
        .panel h2 { font-size: 1.6rem; font-weight: bold; margin-bottom: 20px; color: #7DD3FC; /* sky-300 */ text-align: center; text-shadow: 0 0 5px rgba(125, 211, 252, 0.5); }
        .panel p { margin-bottom: 12px; font-size: 0.95rem; line-height: 1.6; }
        .panel button, .panel select, .panel input[type="range"], .panel input[type="text"] {
            width: 100%;
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            border: 1px solid #374151; /* gray-700 */
            background-color: #1F2937; /* gray-800 */
            color: #F3F4F6; /* gray-100 */
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
        }
        .panel button:hover { background-color: #3B82F6; /* blue-500 */ border-color: #60A5FA; /* blue-400 */ transform: translateY(-1px); }
        .panel button:active { transform: translateY(0px); }
        .panel input[type="range"] { padding: 0; }
        .panel label { display: block; margin-bottom: 6px; font-weight: 500; color: #CBD5E1; /* slate-300 */}
        .panel .sub-panel { background-color: rgba(31, 41, 55, 0.8); padding: 15px; border-radius: 8px; margin-top:10px; }


        #mainMenuPanel { top: 50%; left: 50%; transform: translate(-50%, -50%); width: 380px; }
        #settingsPanel, #levelEditorPanel { top: 50%; left: 50%; transform: translate(-50%, -50%); width: 480px; display: none; max-height: 90vh; overflow-y: auto;}
        #difficultyPanel { top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; display: none; }

        #infoPanel { top: 10px; left: 10px; max-width: 380px; }
        #shopPanel { top: 10px; left: 10px; max-width: 520px; max-height: 85vh; overflow-y: auto; display: none; }
        
        .highlight { color: #A78BFA; font-weight: bold; }
        #crosshair { position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background-color: rgba(255, 255, 255, 0.8); border-radius: 50%; transform: translate(-50%, -50%); z-index: 99; pointer-events: none; display: none;}
        #levelInfo { position: absolute; top: 20px; right: 20px; padding: 10px 15px; background-color: rgba(31, 41, 55, 0.88); border-radius: 8px; font-size: 1.1rem; font-weight: bold; color: #FBBF24; z-index: 100; display: none;}
        #coinInfo { position: absolute; top: 70px; left: 10px; padding: 10px 15px; background-color: rgba(250, 204, 21, 0.88); border-radius: 8px; font-size: 1rem; font-weight: bold; color: #1F2937; z-index: 100; display: none;}
        #powerUpInfo, #slowMoInfo { position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); padding: 8px 12px; background-color: rgba(16, 185, 129, 0.9); border-radius: 8px; font-size: 0.9rem; font-weight: bold; color: #F3F4F6; z-index: 100; display: none;}
        #slowMoInfo { bottom: 100px; background-color: rgba(96, 165, 250, 0.9); /* blue-400 */}
        
        #inventoryBar {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            padding: 8px;
            background-color: rgba(17, 24, 39, 0.85);
            border-radius: 8px;
            z-index: 100;
            display: none; 
        }
        .inventory-slot {
            width: 55px; height: 55px; background-color: rgba(55, 65, 81, 0.7); 
            border: 2px solid #4B5563; border-radius: 6px; display: flex; align-items: center;
            justify-content: center; font-size: 0.7rem; color: white; position: relative; cursor: pointer;
            transition: transform 0.1s, background-color 0.2s;
        }
        .inventory-slot:hover { transform: scale(1.1); background-color: rgba(75, 85, 99, 0.8); }
        .inventory-slot .powerup-icon { width: 35px; height: 35px; border-radius: 4px; }
        .inventory-slot .powerup-name {
            position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
            font-size: 0.75rem; background-color: rgba(0,0,0,0.8); padding: 2px 4px; border-radius: 3px;
        }
         .inventory-slot.empty { background-color: rgba(55, 65, 81, 0.4); }

        #shopPanel h2 { color: #F59E0B; }
        .shop-item { background-color: rgba(55, 65, 81, 0.8); padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 1px solid rgba(75, 85, 99, 0.8); }
        .shop-item h3 { font-size: 1.2rem; color: #93C5FD; margin-bottom: 8px; }
        .shop-item p { font-size: 0.9rem; margin-bottom: 12px; }
        .shop-item button { padding: 10px 15px; font-size: 0.9rem; border-radius: 6px; }

        #victoryScreen {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.9); color: white; display: none; 
            flex-direction: column; align-items: center; justify-content: center;
            text-align: center; z-index: 200;
        }
        #victoryScreen h1 { font-size: 3.5rem; margin-bottom: 25px; color: #FBBF24; text-shadow: 0 0 10px #FBBF24;}
        #victoryScreen p { font-size: 1.3rem; margin-bottom: 35px; max-width: 600px; line-height: 1.7; }
        #victoryScreen button { padding: 15px 35px; font-size: 1.3rem; }

        .slider-value { display: inline-block; margin-left: 10px; color: #9CA3AF; }
        .experimental-toggle { margin-top: 15px; padding: 10px; background-color: #4B5563; border-radius: 6px; }
        .experimental-toggle label { font-size: 1rem; color: #FBBF24; }
        .experimental-toggle input[type="checkbox"] { margin-right: 10px; transform: scale(1.2); }

        #saveSlotsPanel {
            position: absolute;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
            background: rgba(17,24,39,0.97);
            border-radius: 12px; z-index: 150; display: none;
            padding: 24px;
        }
        #saveSlotsPanel h2 { color: #F59E0B; }
        .save-slot {
            background: rgba(55,65,81,0.8); border-radius: 8px; margin-bottom: 14px; padding: 14px;
            border: 1px solid rgba(75,85,99,0.7); display: flex; align-items: center; justify-content: space-between;
        }
        .save-slot .slot-info { flex: 1; }
        .save-slot .slot-actions button { margin-left: 8px; min-width: 80px; }
        .save-slot-empty { color: #9CA3AF; font-style: italic; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="saveSlotsPanel" class="panel">
        <h2>Partidas Guardadas</h2>
        <div id="saveSlotsContainer"></div>
        <button id="closeSaveSlotsPanel" class="mt-2 bg-gray-600 hover:bg-gray-700">Cerrar</button>
    </div>

    <div id="mainMenuPanel" class="panel">
        <h2>Mundo Descosido: Edición Definitiva</h2>
        <button id="playButton">Jugar</button>
        <button id="levelEditorButton">Creador de Escenarios (Beta)</button>
        <button id="shopButtonMainMenu">Tienda</button>
        <button id="settingsButtonMainMenu">Ajustes</button>
        <button id="loadGameButton" class="mt-2 bg-green-600 hover:bg-green-700">Cargar Partida (Conceptual)</button>
        <button id="saveSlotsButton" class="mt-2 bg-yellow-600 hover:bg-yellow-700">Partidas Guardadas</button>
        <p class="text-xs text-center mt-4 text-gray-400">Versión del Caos: 2.1.0 - Parkour Aquí y Allá</p>
    </div>

    <div id="difficultyPanel" class="panel">
        <h2>Seleccionar Dificultad</h2>
        <button data-difficulty="normal">Normal (Aventura Casual)</button>
        <button data-difficulty="hard">Difícil (Desafío Intenso)</button>
        <button data-difficulty="extreme">EXTREMO (Pura Locura)</button>
        <button id="backToMenuFromDifficulty" class="mt-2 bg-gray-600 hover:bg-gray-700">Volver</button>
    </div>

    <div id="settingsPanel" class="panel">
        <h2>Ajustes</h2>
        <div class="sub-panel">
            <label for="graphicsQuality">Calidad Gráfica:</label>
            <select id="graphicsQuality">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
                <option value="ultra" selected>Ultra</option>
                <option value="rtx5090">PC GAMER ULTRA 4K CON RTX 5090</option>
            </select>
        </div>
        <div class="sub-panel mt-3">
            <label for="soundVolume">Volumen (Conceptual): <span id="volumeValue" class="slider-value">100</span></label>
            <input type="range" id="soundVolume" min="0" max="100" value="100">
        </div>
        <div class="sub-panel mt-3 experimental-toggle">
            <label for="experimentalFeaturesToggle" class="flex items-center">
                <input type="checkbox" id="experimentalFeaturesToggle" class="mr-2">
                Activar Funciones Experimentales (Beta)
            </label>
        </div>
        <div id="experimentalOptions" style="display:none;" class="sub-panel mt-2">
            <label for="dayNightToggle">Ciclo Día/Noche (Experimental):</label>
            <button id="dayNightToggle" data-enabled="false">Desactivado</button>
             <p class="text-xs text-gray-400 mt-1">Afecta la iluminación y puede causar eventos aleatorios.</p>
        </div>
        <button id="backToMenuFromSettings" class="mt-4 bg-gray-600 hover:bg-gray-700">Volver al Menú</button>
    </div>

    <div id="levelEditorPanel" class="panel">
        <h2>Creador de Escenarios (Beta v2)</h2>
        <div class="sub-panel">
            <label for="editorSeedInput">Semilla del Escenario:</label>
            <input type="text" id="editorSeedInput" placeholder="Dejar vacío para aleatorio">
        </div>
        <div class="grid grid-cols-2 gap-4 mt-3">
            <div class="sub-panel">
                <label for="platformSpread">Dispersión X: <span id="spreadValue" class="slider-value">4.5</span></label>
                <input type="range" id="platformSpread" min="1.5" max="10" value="4.5" step="0.1">
            </div>
            <div class="sub-panel">
                <label for="platformHeightVariation">Variación Altura Y: <span id="heightVarValue" class="slider-value">2.0</span></label>
                <input type="range" id="platformHeightVariation" min="0.2" max="5" value="2.0" step="0.1">
            </div>
            <div class="sub-panel">
                <label for="platformForwardGap">Espacio Adelante Z: <span id="forwardGapValue" class="slider-value">4.5</span></label>
                <input type="range" id="platformForwardGap" min="1.5" max="10" value="4.5" step="0.1">
            </div>
            <div class="sub-panel">
                <label for="platformSizeMin">Tamaño Mín Plataforma: <span id="sizeMinValue" class="slider-value">1.5</span></label>
                <input type="range" id="platformSizeMin" min="0.5" max="3" value="1.5" step="0.1">
            </div>
            <div class="sub-panel">
                <label for="platformSizeMax">Tamaño Máx Plataforma: <span id="sizeMaxValue" class="slider-value">3.5</span></label>
                <input type="range" id="platformSizeMax" min="2" max="6" value="3.5" step="0.1">
            </div>
            <div class="sub-panel">
                <label for="checkpointFrequency">Frecuencia Checkpoints: <span id="checkpointFreqValue" class="slider-value">0.05</span></label>
                <input type="range" id="checkpointFrequency" min="0.01" max="0.2" value="0.05" step="0.01">
            </div>
             <div class="sub-panel">
                <label for="collectibleFrequency">Frecuencia Coleccionables: <span id="collectibleFreqValue" class="slider-value">0.3</span></label>
                <input type="range" id="collectibleFrequency" min="0.0" max="0.8" value="0.3" step="0.05">
            </div>
        </div>
        <button id="generateAndPlayEditor" class="mt-4">Generar y Jugar Escenario</button>
        <button id="backToMenuFromEditor" class="mt-2 bg-gray-600 hover:bg-gray-700">Volver al Menú</button>
    </div>
    
    <div id="infoPanel" class="panel" style="display: none;">
        <h2 id="worldTitle">Obby Descosido</h2>
        <div class="seed-input-container">
            <p><strong>Semilla Partida:</strong> <span id="worldSeed" class="highlight">N/A</span></p>
        </div>
        <p class="mt-2"><strong>Distancia Máxima (Semilla Actual):</strong> <span id="maxDistance" class="highlight">0m</span></p>
        <p id="statusMessage" class="mt-2 text-sm text-teal-300"></p>
        <button id="saveGameButtonIngame" class="mt-2 text-xs bg-green-500 hover:bg-green-600">Guardar Progreso (Conceptual)</button>
        <button id="saveSlotsButtonIngame" class="mt-2 text-xs bg-yellow-600 hover:bg-yellow-700">Partidas Guardadas</button>
    </div>
    
    <div id="shopPanel" class="panel">
         <div class="flex justify-between items-center mb-4">
            <h2 class="text-center text-2xl flex-grow">Tienda del Caos</h2>
            <div class="text-right">
                <p class="text-lg">Monedas: <span id="shopCoinCounter" class="font-bold text-yellow-400">0</span></p>
            </div>
        </div>
        <div id="shopItemsContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
            </div>
        <p class="text-xs text-center mt-4">Presiona 'T' para cerrar la tienda y 'ESC' para volver al menú.</p>
    </div>

    <div id="levelInfo">Distancia: <span id="levelCounter">0</span>m</div>
    <div id="coinInfo">Monedas: <span id="coinCounter">0</span></div>
    <div id="crosshair"></div>
    <div id="powerUpInfo"></div>
    <div id="slowMoInfo">CÁMARA LENTA</div>

    <div id="inventoryBar"></div>

    <div id="victoryScreen" class="panel">
        <h1>¡MANIFESTASTE LA VICTORIA!</h1>
        <p>Llegaste a los 10,000m. Has conquistado este fragmento del Mundo Descosido... por ahora. El caos es infinito y siempre hay nuevas realidades que explorar (o romper).</p>
        <p class="text-sm">"And that's the way the cookie crumbles in this simulation, xoxo." - Charli XCX (probablemente)</p>
        <button id="victoryBackToMenu">Volver al Menú Principal</button>
    </div>

    <audio id="uiClickSound" src="https://cdn.jsdelivr.net/gh/naptha/tiny-soundfonts@master/sfx/Click.ogg" preload="auto"></audio>
    <audio id="coinSound" src="https://cdn.jsdelivr.net/gh/naptha/tiny-soundfonts@master/sfx/Powerup.ogg" preload="auto"></audio>
    <audio id="powerupSound" src="https://cdn.jsdelivr.net/gh/naptha/tiny-soundfonts@master/sfx/Jump.ogg" preload="auto"></audio>

    <canvas id="gameCanvas"></canvas>

    <script>
        // --- Estados del Juego ---
        const GAME_STATE = { MAIN_MENU: 'MAIN_MENU', DIFFICULTY_SELECT: 'DIFFICULTY_SELECT', SETTINGS: 'SETTINGS', LEVEL_EDITOR: 'LEVEL_EDITOR', SHOP: 'SHOP', PLAYING: 'PLAYING', PAUSED: 'PAUSED', VICTORY: 'VICTORY'};
        let currentGameState = GAME_STATE.MAIN_MENU;
        let selectedDifficulty = 'normal';
        let editorParams = { seed: '', spread: 4.5, heightVar: 2.0, forwardGap: 4.5, sizeMin: 1.5, sizeMax: 3.5, checkpointFreq: 0.05, collectibleFreq: 0.3 };

        // --- Variables Globales ---
        let scene, camera, renderer, controls, composer, bloomPass, directionalLight;
        let playerVelocity = new THREE.Vector3();
        let playerOnGround = false;
        let jumpsAvailable = 1;
        const playerHeight = 1.8;
        const playerRadius = 0.35; 
        const basePlayerSpeed = 8.5; 
        let currentPlayerSpeed = basePlayerSpeed;
        const baseJumpStrength = 9.2; 
        let currentJumpStrength = baseJumpStrength;
        const gravity = -30.0; // Make it a variable to allow changes
        let gravityMultiplier = 1.0; // For low gravity power-up
        let lastCheckpointPosition = new THREE.Vector3(0, playerHeight + 0.5, 0);
        let currentDistanceAtCheckpoint = 0;
        let maxDistanceReached = 0; 
        const gameEndPoint = 10000; 

        const platforms = [];
        const collectibles = [];
        
        let currentDistance = 0;
        let playerCoins = 0;

        const clock = new THREE.Clock();
        let shopOpen = false;

        const platformChunkSize = 15; 
        const chunkLoadDistance = 70; 
        const chunkRemoveDistance = 50; 
        let lastGeneratedChunkZ = 0;

        let activePowerUp = null;
        let powerUpTimeout;
        let slowMoActive = false;
        const slowMoFactor = 0.3;
        let experimentalFeaturesEnabled = false;
        let dayNightCycleActive = false;
        let currentLightIntensity = 0.6;
        let timeOfDay = 0.25; // Start at morning (0.25)

        const moveState = { forward: 0, backward: 0, left: 0, right: 0 };

        const POWER_UP_TYPES = [
            { name: 'Salto Potenciado', id: 'jumpBoost', color: 0x9333EA, iconColor: '#9333EA', description: "¡Alcanza nuevas alturas!" },
            { name: 'Velocidad Sónica', id: 'speedBoost', color: 0x34D399, iconColor: '#34D399', description: "¡Más rápido que tus problemas!" },
            { name: 'Alas de Ícaro (Doble Salto)', id: 'doubleJump', color: 0x60A5FA, iconColor: '#60A5FA', description: "Un salto más en el aire." },
            { name: 'Bendición de Charli XCX', id: 'charliXCX', color: 0xE879F9, iconColor: '#E879F9', description: "¡Vroom Vroom! Velocidad, salto y monedas." },
            // Nuevos Power-ups Experimentales
            { name: 'Plataforma Efímera', id: 'tempPlatform', color: 0xFDE047, iconColor: '#FDE047', description: "Crea un bloque temporal bajo tus pies.", experimental: true },
            { name: 'Mini Agujero de Gusano', id: 'shortTeleport', color: 0x5EEAD4, iconColor: '#5EEAD4', description: "Un pequeño salto adelante en el espacio-tiempo.", experimental: true },
            { name: 'Imán Dorado', id: 'coinMagnet', color: 0xFFD700, iconColor: '#FFD700', description: "Las monedas te aman.", experimental: true },
            { name: 'Visión Periférica', id: 'wideView', color: 0x7DD3FC, iconColor: '#7DD3FC', description: "Amplía tu campo de visión temporalmente.", experimental: true },
            { name: 'Faseo Selectivo', id: 'phasePlatform', color: 0x8B5CF6, iconColor: '#8B5CF6', description: "Atraviesa la próxima plataforma (¡cuidado!).", experimental: true },
            { name: 'Anti-Gravedad Personal', id: 'lowGravity', color: 0xBEF264, iconColor: '#BEF264', description: "Flota como si estuvieras en la luna.", experimental: true },
        ];
        const inventorySlots = 3;
        let playerInventory = new Array(inventorySlots).fill(null);

        const SHOP_ITEMS = [
            { id: 'pf_sphere', name: 'Plataformas: Esferas', description: '¡Un desafío rodante!', price: 30, type: 'platform_shape', value: 'sphere', purchased: false, equipped: false },
            { id: 'pf_cylinder', name: 'Plataformas: Cilindros', description: '¡Equilibrio en las alturas!', price: 45, type: 'platform_shape', value: 'cylinder', purchased: false, equipped: false },
            { id: 'bg_nebula', name: 'Fondo: Nebulosa Cósmica', description: 'Viaja por el espacio profundo.', price: 60, type: 'background_style', value: 'nebula', purchased: false, equipped: false },
            { id: 'bg_alien_sunset', name: 'Fondo: Atardecer Alienígena', description: 'Colores vibrantes de otro mundo.', price: 70, type: 'background_style', value: 'alien_sunset', purchased: false, equipped: false },
        ];
        let currentPlatformShape = 'box';
        let currentBackgroundStyle = 'default';
        let graphicsSettings = { quality: 'ultra', bloomEnabled: false, shadowMapSize: 4096, antialias: true };


        // --- DOM Refs ---
        let mainMenuPanel, difficultyPanel, settingsPanel, levelEditorPanel, shopPanelUI, infoPanelUI, levelInfoUI, coinInfoUI, crosshairUI, powerUpInfoUI, slowMoInfoUI, inventoryBarUI, victoryScreenUI;
        let worldSeedDisplay, gamePlaySeedInput, maxDistanceDisplay, statusMessageDisplay, levelCounterDisplay, coinCounterDisplay, shopCoinCounterDisplay, shopItemsContainer;
        let graphicsQualitySelect, soundVolumeSlider, volumeValueDisplay, slowMoToggleButton, experimentalFeaturesToggle, experimentalOptionsPanel, dayNightToggle;
        let editorSeedInput, platformSpreadSliderUI, platformHeightVarSliderUI, platformForwardGapSliderUI, platformSizeMinSliderUI, platformSizeMaxSliderUI, checkpointFrequencySliderUI, collectibleFrequencySliderUI;
        let saveSlotsPanel, saveSlotsContainer, closeSaveSlotsPanelBtn, saveSlotsButton, saveSlotsButtonIngame;


        // --- PRNG ---
        let currentSeedStringInternal = '';
        let randomFunc = Math.random; 

        function mulberry32(a) { 
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294969216; 
            }
        }
        function setSeed(seedStr, targetDisplay, targetInput) { 
            currentSeedStringInternal = seedStr.toUpperCase().trim();
            if (!currentSeedStringInternal) {
                randomFunc = Math.random; 
                if (targetDisplay) targetDisplay.textContent = "ALEATORIO";
                if (targetInput) targetInput.value = "";
                return;
            }
            let hash = 0;
            for (let i = 0; i < currentSeedStringInternal.length; i++) {
                const char = currentSeedStringInternal.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            randomFunc = mulberry32(hash);
            if (targetDisplay) targetDisplay.textContent = currentSeedStringInternal;
            if (targetInput) targetInput.value = currentSeedStringInternal;
        }
        function generateRandomSeedAndSet(targetDisplay, targetInput) { 
            const newSeed = (Math.random().toString(36).substring(2, 10)).toUpperCase();
            setSeed(newSeed, targetDisplay, targetInput);
        }
        
        // --- Utilidades ---
        let userInteracted = false;
        let statusTimeout;

        function safePlay(audio) {
            if (!userInteracted) return;
            try { audio.currentTime = 0; audio.play().catch(()=>{}); } catch(e){}
        }
        function onWindowResize() { 
            if(camera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
            if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        }
        function getRandomInRange(min, max) { return randomFunc() * (max - min) + min; }
        function getRandomElement(arr) { return arr[Math.floor(randomFunc() * arr.length)]; }
        function showStatusMessage(message, colorClass = 'text-teal-300') { 
            if(statusMessageDisplay) {
                statusMessageDisplay.textContent = message;
                statusMessageDisplay.className = `mt-2 text-sm ${colorClass}`;
                clearTimeout(statusTimeout);
                statusTimeout = setTimeout(() => { statusMessageDisplay.textContent = ''; }, 3000);
            }
        }
         function spawnParticle(x, y, color) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.width = p.style.height = (12 + Math.random()*10) + 'px';
            p.style.background = color;
            document.body.appendChild(p);
            setTimeout(()=>p.remove(), 700);
        }


        // --- Inicialización y Flujo del Juego ---
        function init() {
            // Obtener referencias a elementos DOM primero
            mainMenuPanel = document.getElementById('mainMenuPanel');
            difficultyPanel = document.getElementById('difficultyPanel');
            settingsPanel = document.getElementById('settingsPanel');
            levelEditorPanel = document.getElementById('levelEditorPanel');
            shopPanelUI = document.getElementById('shopPanel');
            infoPanelUI = document.getElementById('infoPanel');
            levelInfoUI = document.getElementById('levelInfo');
            coinInfoUI = document.getElementById('coinInfo');
            crosshairUI = document.getElementById('crosshair');
            powerUpInfoUI = document.getElementById('powerUpInfo');
            slowMoInfoUI = document.getElementById('slowMoInfo');
            inventoryBarUI = document.getElementById('inventoryBar');
            victoryScreenUI = document.getElementById('victoryScreen');

            worldSeedDisplay = document.getElementById('worldSeed');
            // FIX: Ensure infoPanelUI exists before querying its children
            gamePlaySeedInput = infoPanelUI ? infoPanelUI.querySelector('.seed-input-container input[type="text"]') : null;
            maxDistanceDisplay = document.getElementById('maxDistance');
            statusMessageDisplay = document.getElementById('statusMessage');
            levelCounterDisplay = document.getElementById('levelCounter');
            coinCounterDisplay = document.getElementById('coinCounter');
            shopCoinCounterDisplay = document.getElementById('shopCoinCounter');
            shopItemsContainer = document.getElementById('shopItemsContainer');
            
            graphicsQualitySelect = document.getElementById('graphicsQuality');
            soundVolumeSlider = document.getElementById('soundVolume');
            volumeValueDisplay = document.getElementById('volumeValue');
            slowMoToggleButton = document.getElementById('slowMoToggle');
            experimentalFeaturesToggle = document.getElementById('experimentalFeaturesToggle');
            experimentalOptionsPanel = document.getElementById('experimentalOptions');
            dayNightToggle = document.getElementById('dayNightToggle');

            editorSeedInput = document.getElementById('editorSeedInput');
            platformSpreadSliderUI = document.getElementById('platformSpread');
            platformHeightVarSliderUI = document.getElementById('platformHeightVariation');
            platformForwardGapSliderUI = document.getElementById('platformForwardGap');
            platformSizeMinSliderUI = document.getElementById('platformSizeMin');
            platformSizeMaxSliderUI = document.getElementById('platformSizeMax');
            checkpointFrequencySliderUI = document.getElementById('checkpointFrequency');
            collectibleFrequencySliderUI = document.getElementById('collectibleFrequency');
            
            saveSlotsPanel = document.getElementById('saveSlotsPanel');
            saveSlotsContainer = document.getElementById('saveSlotsContainer');
            closeSaveSlotsPanelBtn = document.getElementById('closeSaveSlotsPanel');
            saveSlotsButton = document.getElementById('saveSlotsButton');
            saveSlotsButtonIngame = document.getElementById('saveSlotsButtonIngame');

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200); 
            renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: graphicsSettings.antialias });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            const renderPass = new THREE.RenderPass(scene, camera);
            if (typeof THREE.CopyShader !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') { 
                bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
                bloomPass.threshold = 0.21; 
                bloomPass.strength = 0.5;  
                bloomPass.radius = 0.55;   
                bloomPass.enabled = false; 
            } else {
                console.error("THREE.CopyShader or UnrealBloomPass is not defined. UnrealBloomPass cannot be initialized.");
                bloomPass = { enabled: false, render: () => {} }; 
            }
            
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderPass);
            if (bloomPass && bloomPass.render && typeof THREE.CopyShader !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') { 
                 composer.addPass(bloomPass);
            }

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(20, 30, 15);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            configureShadows(graphicsSettings.quality); 

            controls = new THREE.PointerLockControls(camera, renderer.domElement);
            scene.add(controls.getObject());
            setupEventListeners();
            
            loadAllPersistentData();
            loadSaveSlotsFromStorage();
            applyEquippedItems(); 
            
            currentGameState = GAME_STATE.MAIN_MENU; 
            updateUIVisibility(); 
            
            populateShop();
            setupInventoryUI();

            if (scene.background && scene.background.setHSL) {
                 scene.background.setHSL(randomFunc(), 0.6, 0.05);
            } else {
                 scene.background = new THREE.Color().setHSL(randomFunc(), 0.6, 0.05);
            }
            camera.position.set(0, 5, 10); 
            camera.lookAt(0,1,0);

            animate();
        }

        function configureShadows(quality) { 
            switch(quality) {
                case 'low':
                    directionalLight.castShadow = false; 
                    renderer.shadowMap.enabled = false;
                    break;
                case 'medium':
                    directionalLight.castShadow = true;
                    renderer.shadowMap.enabled = true;
                    directionalLight.shadow.mapSize.width = 1024;
                    directionalLight.shadow.mapSize.height = 1024;
                    break;
                case 'high':
                    directionalLight.castShadow = true;
                    renderer.shadowMap.enabled = true;
                    directionalLight.shadow.mapSize.width = 2048;
                    directionalLight.shadow.mapSize.height = 2048;
                    break;
                case 'ultra':
                case 'rtx5090': 
                    directionalLight.castShadow = true;
                    renderer.shadowMap.enabled = true;
                    directionalLight.shadow.mapSize.width = 4096; 
                    directionalLight.shadow.mapSize.height = 4096;
                    break;
            }
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 150; 
            directionalLight.shadow.camera.left = -70; 
            directionalLight.shadow.camera.right = 70;
            directionalLight.shadow.camera.top = 70;
            directionalLight.shadow.camera.bottom = -70;
            if (directionalLight.shadow.map) {
                directionalLight.shadow.map.dispose();
                directionalLight.shadow.map = null;
            }
        }
        
        function setupEventListeners() {
            document.getElementById('playButton').addEventListener('click', () => {
                 if (currentGameState === GAME_STATE.PAUSED) {
                     switchGameState(GAME_STATE.PLAYING); 
                 } else {
                     switchGameState(GAME_STATE.DIFFICULTY_SELECT); 
                 }
            });
            document.getElementById('levelEditorButton').addEventListener('click', () => {
                if(editorSeedInput) editorSeedInput.value = (Math.random().toString(36).substring(2, 10)).toUpperCase(); // Pre-fill with random
                editorParams.seed = editorSeedInput ? editorSeedInput.value : '';
                // Reset sliders to default or last used editor params
                if(platformSpreadSliderUI) { platformSpreadSliderUI.value = editorParams.spread; document.getElementById('spreadValue').textContent = editorParams.spread; }
                if(platformHeightVarSliderUI) { platformHeightVarSliderUI.value = editorParams.heightVar; document.getElementById('heightVarValue').textContent = editorParams.heightVar; }
                if(platformForwardGapSliderUI) { platformForwardGapSliderUI.value = editorParams.forwardGap; document.getElementById('forwardGapValue').textContent = editorParams.forwardGap; }
                if(platformSizeMinSliderUI) { platformSizeMinSliderUI.value = editorParams.sizeMin; document.getElementById('sizeMinValue').textContent = editorParams.sizeMin; }
                if(platformSizeMaxSliderUI) { platformSizeMaxSliderUI.value = editorParams.sizeMax; document.getElementById('sizeMaxValue').textContent = editorParams.sizeMax; }
                if(checkpointFrequencySliderUI) { checkpointFrequencySliderUI.value = editorParams.checkpointFreq; document.getElementById('checkpointFreqValue').textContent = editorParams.checkpointFreq; }
                if(collectibleFrequencySliderUI) { collectibleFrequencySliderUI.value = editorParams.collectibleFreq; document.getElementById('collectibleFreqValue').textContent = editorParams.collectibleFreq; }

                switchGameState(GAME_STATE.LEVEL_EDITOR);
            });
            document.getElementById('shopButtonMainMenu').addEventListener('click', () => switchGameState(GAME_STATE.SHOP));
            document.getElementById('settingsButtonMainMenu').addEventListener('click', () => switchGameState(GAME_STATE.SETTINGS));
            document.getElementById('loadGameButton').addEventListener('click', () => {
                showSaveSlotsPanel();
            });


            if(difficultyPanel) difficultyPanel.querySelectorAll('button[data-difficulty]').forEach(button => {
                button.addEventListener('click', (e) => {
                    selectedDifficulty = e.target.dataset.difficulty;
                    startGame();
                });
            });
            if(document.getElementById('backToMenuFromDifficulty')) document.getElementById('backToMenuFromDifficulty').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));
            
            if(graphicsQualitySelect) graphicsQualitySelect.addEventListener('change', (e) => applyGraphicsSettings(e.target.value));
            if(soundVolumeSlider) soundVolumeSlider.addEventListener('input', (e) => {
                if(volumeValueDisplay) volumeValueDisplay.textContent = e.target.value;
            });
             if(experimentalFeaturesToggle) experimentalFeaturesToggle.addEventListener('change', (e) => {
                experimentalFeaturesEnabled = e.target.checked;
                if(experimentalOptionsPanel) experimentalOptionsPanel.style.display = experimentalFeaturesEnabled ? 'block' : 'none';
                if (!experimentalFeaturesEnabled) { 
                    dayNightCycleActive = false;
                    if(dayNightToggle) {
                        dayNightToggle.dataset.enabled = "false";
                        dayNightToggle.textContent = "Desactivado";
                    }
                    applyEquippedItems(); 
                }
            });
            if(dayNightToggle) dayNightToggle.addEventListener('click', () => {
                if (!experimentalFeaturesEnabled) {
                    showStatusMessage("Activa las Funciones Experimentales primero.", "text-orange-400");
                    return;
                }
                dayNightCycleActive = !dayNightCycleActive;
                if(dayNightToggle) {
                    dayNightToggle.dataset.enabled = dayNightCycleActive;
                    dayNightToggle.textContent = dayNightCycleActive ? 'Activado' : 'Desactivado';
                }
                if (!dayNightCycleActive) { 
                    if(directionalLight) directionalLight.intensity = 0.6; 
                    applyEquippedItems(); 
                } else {
                    timeOfDay = 0.25; 
                }
            });
            if(document.getElementById('backToMenuFromSettings')) document.getElementById('backToMenuFromSettings').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));

            // Level Editor Sliders
            const sliders = [
                { el: platformSpreadSliderUI, param: 'spread', displayId: 'spreadValue' },
                { el: platformHeightVarSliderUI, param: 'heightVar', displayId: 'heightVarValue' },
                { el: platformForwardGapSliderUI, param: 'forwardGap', displayId: 'forwardGapValue' },
                { el: platformSizeMinSliderUI, param: 'sizeMin', displayId: 'sizeMinValue' },
                { el: platformSizeMaxSliderUI, param: 'sizeMax', displayId: 'sizeMaxValue' },
                { el: checkpointFrequencySliderUI, param: 'checkpointFreq', displayId: 'checkpointFreqValue' },
                { el: collectibleFrequencySliderUI, param: 'collectibleFreq', displayId: 'collectibleFreqValue' },
            ];
            sliders.forEach(sliderConfig => {
                if (sliderConfig.el) {
                    sliderConfig.el.addEventListener('input', e => {
                        editorParams[sliderConfig.param] = parseFloat(e.target.value);
                        const displayEl = document.getElementById(sliderConfig.displayId);
                        if(displayEl) displayEl.textContent = e.target.value;
                    });
                }
            });

            if(document.getElementById('generateAndPlayEditor')) document.getElementById('generateAndPlayEditor').addEventListener('click', () => {
                if(editorSeedInput) editorParams.seed = editorSeedInput.value;
                selectedDifficulty = 'normal'; 
                startGame(true); 
            });
            if(document.getElementById('backToMenuFromEditor')) document.getElementById('backToMenuFromEditor').addEventListener('click', () => switchGameState(GAME_STATE.MAIN_MENU));

            if(document.getElementById('gameCanvas')) document.getElementById('gameCanvas').addEventListener('click', () => {
                if (currentGameState === GAME_STATE.PLAYING && controls && !controls.isLocked) {
                    controls.lock();
                }
            });
             if(controls) {
                 controls.addEventListener('lock', () => {
                    if (currentGameState === GAME_STATE.PLAYING || currentGameState === GAME_STATE.PAUSED) {
                        currentGameState = GAME_STATE.PLAYING;
                        updateUIVisibility();
                    }
                });
                controls.addEventListener('unlock', () => {
                    if (currentGameState === GAME_STATE.PLAYING) {
                        if (!shopOpen) switchGameState(GAME_STATE.PAUSED);
                    }
                });
             }
            document.addEventListener('pointerlockerror', () => showStatusMessage("Bloqueo de puntero falló.", 'text-red-400'));
            
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            window.addEventListener('resize', onWindowResize); // This listener now correctly references the function defined above

            if(document.getElementById('victoryBackToMenu')) document.getElementById('victoryBackToMenu').addEventListener('click', () => {
                switchGameState(GAME_STATE.MAIN_MENU);
            });
             if(document.getElementById('saveGameButtonIngame')) { 
                document.getElementById('saveGameButtonIngame').addEventListener('click', () => {
                    saveAllPersistentData();
                    showStatusMessage("¡Progreso guardado (conceptual)!", "text-green-400");
                });
            }
            if (saveSlotsButton) saveSlotsButton.addEventListener('click', showSaveSlotsPanel);
            if (saveSlotsButtonIngame) saveSlotsButtonIngame.addEventListener('click', showSaveSlotsPanel);
            if (closeSaveSlotsPanelBtn) closeSaveSlotsPanelBtn.addEventListener('click', hideSaveSlotsPanel);
            window.saveSlot = saveSlot;
            window.loadSlot = loadSlot;
            window.deleteSlot = deleteSlot;
             // Moved global button listeners here
             document.querySelectorAll('.panel button').forEach(btn=>{
                btn.addEventListener('mouseenter',()=>{btn.style.background='#2563eb';btn.style.color='#fff';});
                btn.addEventListener('mouseleave',()=>{btn.style.background='';btn.style.color='';});
                btn.addEventListener('click',()=>{
                    userInteracted = true;
                    safePlay(uiClickSound);
                });
            });
            window.addEventListener('mousedown', ()=>{ userInteracted = true; });
            window.addEventListener('keydown', ()=>{ userInteracted = true; });
        }

        function switchGameState(newState) { 
            if (currentGameState === GAME_STATE.SHOP && newState !== GAME_STATE.SHOP) {
                shopOpen = false; 
            }
            if (currentGameState === GAME_STATE.PLAYING && newState !== GAME_STATE.PLAYING && newState !== GAME_STATE.PAUSED) {
                 if(controls && controls.isLocked) controls.unlock();
            }

            currentGameState = newState;
            updateUIVisibility();

            if (newState === GAME_STATE.PLAYING) {
                if (controls && !controls.isLocked) controls.lock();
            } else {
                if (controls && controls.isLocked) controls.unlock();
            }
            if (newState === GAME_STATE.SHOP) {
                shopOpen = true;
                populateShop();
            }
        }
        function updateUIVisibility() { 
            if(mainMenuPanel) mainMenuPanel.style.display = (currentGameState === GAME_STATE.MAIN_MENU || currentGameState === GAME_STATE.PAUSED) ? 'block' : 'none';
            if(difficultyPanel) difficultyPanel.style.display = currentGameState === GAME_STATE.DIFFICULTY_SELECT ? 'block' : 'none';
            if(settingsPanel) settingsPanel.style.display = currentGameState === GAME_STATE.SETTINGS ? 'block' : 'none';
            if(levelEditorPanel) levelEditorPanel.style.display = currentGameState === GAME_STATE.LEVEL_EDITOR ? 'block' : 'none';
            if(shopPanelUI) shopPanelUI.style.display = currentGameState === GAME_STATE.SHOP ? 'block' : 'none';
            if(victoryScreenUI) victoryScreenUI.style.display = currentGameState === GAME_STATE.VICTORY ? 'flex' : 'none';
            if(saveSlotsPanel) saveSlotsPanel.style.display = currentGameState === GAME_STATE.SAVE_SLOTS ? 'block' : 'none';

            const gameActive = currentGameState === GAME_STATE.PLAYING;
            if(infoPanelUI) infoPanelUI.style.display = gameActive ? 'block' : 'none';
            if(levelInfoUI) levelInfoUI.style.display = gameActive ? 'block' : 'none';
            if(coinInfoUI) coinInfoUI.style.display = gameActive ? 'block' : 'none';
            if(crosshairUI) crosshairUI.style.display = gameActive && controls && controls.isLocked ? 'block' : 'none';
            if(inventoryBarUI) inventoryBarUI.style.display = gameActive ? 'flex' : 'none';
            if(powerUpInfoUI) powerUpInfoUI.style.display = gameActive && activePowerUp ? 'block' : 'none';
            if(slowMoInfoUI) slowMoInfoUI.style.display = gameActive && slowMoActive ? 'block' : 'none';

            if (currentGameState === GAME_STATE.PAUSED) {
                 if(mainMenuPanel) {
                     const h2 = mainMenuPanel.querySelector('h2');
                     const playBtn = mainMenuPanel.querySelector('#playButton');
                     const shopBtn = mainMenuPanel.querySelector('#shopButtonMainMenu');
                     const settingsBtn = mainMenuPanel.querySelector('#settingsButtonMainMenu');
                     const editorBtn = mainMenuPanel.querySelector('#levelEditorButton');
                     const loadBtn = mainMenuPanel.querySelector('#loadGameButton');

                     if(h2) h2.textContent = "Juego Pausado";
                     if(playBtn) playBtn.textContent = "Reanudar";
                     if(shopBtn) shopBtn.style.display = 'block';
                     if(settingsBtn) settingsBtn.style.display = 'block';
                     if(editorBtn) editorBtn.style.display = 'none'; 
                     if(loadBtn) loadBtn.style.display = 'none';
                 }
            } else if (currentGameState === GAME_STATE.MAIN_MENU) {
                 if(mainMenuPanel) {
                     const h2 = mainMenuPanel.querySelector('h2');
                     const playBtn = mainMenuPanel.querySelector('#playButton');
                     const shopBtn = mainMenuPanel.querySelector('#shopButtonMainMenu');
                     const settingsBtn = mainMenuPanel.querySelector('#settingsButtonMainMenu');
                     const editorBtn = mainMenuPanel.querySelector('#levelEditorButton');
                     const loadBtn = mainMenuPanel.querySelector('#loadGameButton');

                     if(h2) h2.textContent = "Mundo Descosido: Edición Definitiva";
                     if(playBtn) playBtn.textContent = "Jugar";
                     if(shopBtn) shopBtn.style.display = 'block';
                     if(settingsBtn) settingsBtn.style.display = 'block';
                     if(editorBtn) editorBtn.style.display = 'block';
                     if(loadBtn) loadBtn.style.display = 'block';
                 }
            }
        }
        function startGame(fromEditor = false) { 
            if (fromEditor) {
                setSeed(editorParams.seed, worldSeedDisplay, gamePlaySeedInput); 
            } else {
                generateRandomSeedAndSet(worldSeedDisplay, gamePlaySeedInput); 
            }
            resetGameLogic();
            switchGameState(GAME_STATE.PLAYING);
        }
        function resetGameLogic() { 
             platforms.forEach(p => scene.remove(p.mesh));
             platforms.length = 0;
             collectibles.forEach(c => scene.remove(c.mesh));
             collectibles.length = 0;

             checkpointPlatformMesh = null;
             lastGeneratedChunkZ = 0;
             currentDistance = 0;
             currentDistanceAtCheckpoint = 0;
             playerInventory.fill(null);
             updateInventoryUI();

             jumpsAvailable = 1;
             currentPlayerSpeed = basePlayerSpeed;
             currentJumpStrength = baseJumpStrength;
             if(powerUpInfoUI) powerUpInfoUI.style.display = 'none';
             clearTimeout(powerUpTimeout);
             activePowerUp = null;
             slowMoActive = false;
             if(slowMoInfoUI) slowMoInfoUI.style.display = 'none';
             gravityMultiplier = 1.0; // Reset gravity multiplier

             updateCoinDisplay();
             if(levelCounterDisplay) levelCounterDisplay.textContent = "0m"; 
             
             applyEquippedItems(); 

             generateChunk(0, currentGameState === GAME_STATE.LEVEL_EDITOR); 
             generateChunk(platformChunkSize * 4, currentGameState === GAME_STATE.LEVEL_EDITOR);

             lastCheckpointPosition.set(0, playerHeight + 0.5, 0);
             if(controls && controls.getObject()){
                 controls.getObject().position.copy(lastCheckpointPosition);
                 camera.position.copy(lastCheckpointPosition); 
                 camera.rotation.set(0,0,0); 
                 controls.getObject().rotation.set(0,0,0);
             }
             playerVelocity.set(0,0,0);
             playerOnGround = true;

             loadMaxDistance(); 
             updateMaxDistanceDisplay();

             showStatusMessage(`¡Comenzando partida! Dificultad: ${selectedDifficulty}`, 'text-green-400');
        }

        // --- Generación de Nivel ---
        function generateChunk(startZ, useEditorParams = false) { 
            let currentPos = new THREE.Vector3(0, 0, startZ);
            const numPlatformsInChunk = platformChunkSize;

            if (startZ === 0) {
                 const startPlatform = createPlatform(new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 1.5, 5), 0x78716C); // stone-500
                 platforms.push(startPlatform);
                 currentPos.z += 4; 
            } else {
                 if (platforms.length > 0) {
                     let lastPlatform = platforms[0];
                     for(let i = 1; i < platforms.length; i++) {
                         if (platforms[i].mesh.position.z > lastPlatform.mesh.position.z) {
                             lastPlatform = platforms[i];
                         }
                     }
                     currentPos.copy(lastPlatform.mesh.position);
                     currentPos.y -= getPlatformHeight(lastPlatform.mesh) / 2;
                     currentPos.z += getPlatformDepth(lastPlatform.mesh) / 2; 
                 } else {
                     currentPos.set(0, 0, startZ);
                 }
            }

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
                
                if (currentPlatformShape === 'sphere') sizeY = Math.max(0.5, Math.min(sizeX, sizeZ)); 
                else if (currentPlatformShape === 'cylinder') sizeY = Math.max(0.5, getRandomInRange(0.8, 2.5 - difficultyFactor));


                const offsetX = getRandomInRange(offsetX_min, offsetX_max) * (randomFunc() < 0.5 ? 1 : -1);
                const offsetY = getRandomInRange(offsetY_min, offsetY_max);
                const offsetZ = getRandomInRange(offsetZ_min, offsetZ_max);

                currentPos.x += offsetX;
                currentPos.y += offsetY;
                currentPos.z += offsetZ;

                if (currentPos.y < -60) currentPos.y = -60 + getRandomInRange(0, 5); // Lower fall limit

                let platformData;
                let platformColor = new THREE.Color().setHSL(randomFunc(), 0.6, 0.5).getHex();
                let isCheckpoint = false;

                const checkpointChance = selectedDifficulty === 'extreme' ? baseCheckpointFreq / 2 : baseCheckpointFreq;
                if (randomFunc() < checkpointChance && i > 3 && startZ + currentPos.z > 30) { 
                    platformColor = 0xffff00;
                    isCheckpoint = true;
                }
                
                platformData = createPlatform(currentPos.clone(), new THREE.Vector3(sizeX, sizeY, sizeZ), platformColor, isCheckpoint, currentPlatformShape);
                platforms.push(platformData);

                const collectibleChance = selectedDifficulty === 'extreme' ? baseCollectibleFreq / 2 : baseCollectibleFreq;
                if (randomFunc() < collectibleChance && !isCheckpoint) { 
                     const type = randomFunc() < 0.6 ? 'coin' : 'powerUp'; 
                     if (type === 'powerUp') {
                        createCollectible(new THREE.Vector3(currentPos.x, currentPos.y + getPlatformHeight(platformData.mesh) / 2 + 0.7, currentPos.z), 'powerUp');
                     } else {
                        const numCoins = Math.floor(randomFunc() * (selectedDifficulty === 'extreme' ? 2 : 3)) + 1;
                         for(let j = 0; j < numCoins; j++){
                             const coinOffsetX = (randomFunc() - 0.5) * (sizeX * 0.6);
                             const coinOffsetZ = (randomFunc() - 0.5) * (sizeZ * 0.6);
                             createCollectible(new THREE.Vector3(currentPos.x + coinOffsetX, currentPos.y + getPlatformHeight(platformData.mesh) / 2 + 0.4 + j * 0.6, currentPos.z + coinOffsetZ), 'coin');
                         }
                     }
                }
            }
            lastGeneratedChunkZ = currentPos.z;
        }
        function getPlatformHeight(mesh) { 
            if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1; 
            if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.height;
            if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
            if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.height;
            return 1;
        }
        function getPlatformDepth(mesh) { 
             if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1;
            if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.depth;
            if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
            if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.radiusTop * 2; 
            return 1;
        }
        function getPlatformWidth(mesh) { 
            if (!mesh || !mesh.geometry || !mesh.geometry.parameters) return 1;
            if (mesh.geometry.type === 'BoxGeometry') return mesh.geometry.parameters.width;
            if (mesh.geometry.type === 'SphereGeometry') return mesh.geometry.parameters.radius * 2;
            if (mesh.geometry.type === 'CylinderGeometry') return mesh.geometry.parameters.radiusTop * 2; 
            return 1;
        }
        function removeOldChunks() { 
            if (!controls || !controls.getObject()) return; 
            const playerZ = controls.getObject().position.z;
            const platformsToRemove = platforms.filter(p => p.mesh.position.z < playerZ - chunkRemoveDistance);
            platformsToRemove.forEach(pData => { if(pData.mesh) scene.remove(pData.mesh); });
            const remainingPlatforms = platforms.filter(p => p.mesh.position.z >= playerZ - chunkRemoveDistance);
            platforms.length = 0;
            platforms.push(...remainingPlatforms);

            const collectiblesToRemove = collectibles.filter(c => c.mesh.position.z < playerZ - chunkRemoveDistance);
            collectiblesToRemove.forEach(cData => { if(cData.mesh) scene.remove(cData.mesh); });
            const remainingCollectibles = collectibles.filter(c => c.mesh.position.z >= playerZ - chunkRemoveDistance);
            collectibles.length = 0;
            collectibles.push(...remainingCollectibles);
        }
        function createPlatform(position, size, color, isCheckpoint = false, shape = 'box') { 
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

            if (randomFunc() < 0.35 && !isCheckpoint && shape === 'box') { 
                platformMesh.rotation.x = (randomFunc() - 0.5) * 0.5;
                platformMesh.rotation.z = (randomFunc() - 0.5) * 0.5;
            }
            scene.add(platformMesh);
            return { mesh: platformMesh, isCheckpoint, type: 'platform', originalColor: color, activated: false, shape: shape };
        }
        function createCollectible(position, type) { 
            let geometry, material, collectibleId, color; 
            if (type === 'powerUp') {
                 geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
                 const randomPowerUp = getRandomElement(POWER_UP_TYPES.filter(pu => !pu.experimental || experimentalFeaturesEnabled)); 
                 if (!randomPowerUp) return; 
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
            scene.add(collectibleMesh);
            collectibles.push({ mesh: collectibleMesh, type: type, collectibleId: collectibleId, color: color }); 
        }
        function adjustShadowCamera() { 
             if (!controls || !controls.getObject() || !directionalLight) return;
             const playerPos = controls.getObject().position;
             const playerZ = playerPos.z;
             const areaMinZ = playerZ - chunkRemoveDistance * 0.5; 
             const areaMaxZ = playerZ + chunkLoadDistance * 0.8; 
             let levelBoundingBox = new THREE.Box3();
             levelBoundingBox.setFromCenterAndSize(playerPos, new THREE.Vector3(5,5,5)); 

             platforms.forEach(pData => {
                 if (pData.mesh && pData.mesh.position.z >= areaMinZ && pData.mesh.position.z <= areaMaxZ) {
                     pData.mesh.updateWorldMatrix(true, false);
                     const platformBox = new THREE.Box3().setFromObject(pData.mesh);
                     levelBoundingBox.union(platformBox);
                 }
             });
             if (!levelBoundingBox.isEmpty()) {
                 const center = new THREE.Vector3();
                 levelBoundingBox.getCenter(center);
                 const size = new THREE.Vector3();
                 levelBoundingBox.getSize(size);
                 
                 const maxDim = Math.max(size.x, size.z) * 1.2; 
                 const shadowCamSize = Math.max(maxDim, 60); 
                 
                 directionalLight.shadow.camera.left = -shadowCamSize / 2;
                 directionalLight.shadow.camera.right = shadowCamSize / 2;
                 directionalLight.shadow.camera.top = shadowCamSize / 2;    
                 directionalLight.shadow.camera.bottom = -shadowCamSize / 2; 
                 directionalLight.shadow.camera.near = 0.1;
                 directionalLight.shadow.camera.far = Math.max(shadowCamSize * 2, size.z + 100); 

                 directionalLight.position.set(center.x, center.y + shadowCamSize, center.z - shadowCamSize * 0.5); 
                 if(directionalLight.target) {
                     directionalLight.target.position.copy(center);
                     directionalLight.target.updateMatrixWorld();
                 }
                 directionalLight.shadow.camera.updateProjectionMatrix();
             }
        }

        // --- Controles y Movimiento ---
        let lastDashTime = 0;
        const dashCooldown = 1500; 
        const dashSpeed = 25;
        let phaseThroughPlatforms = false; // For phase platform power-up

        function onKeyDown(event) { 
            const key = event.key.toLowerCase();
            if (currentGameState === GAME_STATE.SHOP && key !== 't' && key !== 'escape') return;
            if (currentGameState === GAME_STATE.SETTINGS && key !== 'escape') return;
            if (currentGameState === GAME_STATE.LEVEL_EDITOR && key !== 'escape') return;
            if (currentGameState === GAME_STATE.DIFFICULTY_SELECT && key !== 'escape') return;
             if (currentGameState === GAME_STATE.VICTORY && key !== 'escape') return;


            if (key === 'escape') {
                if (currentGameState === GAME_STATE.PLAYING) switchGameState(GAME_STATE.PAUSED);
                else if (currentGameState === GAME_STATE.PAUSED || currentGameState === GAME_STATE.SHOP || currentGameState === GAME_STATE.SETTINGS || currentGameState === GAME_STATE.LEVEL_EDITOR || currentGameState === GAME_STATE.DIFFICULTY_SELECT) {
                    switchGameState(GAME_STATE.MAIN_MENU);
                }
                return;
            }
            
            if (currentGameState !== GAME_STATE.PLAYING) return; 

            switch (key) {
                case 'w': case 'arrowup': moveState.forward = 1; break;
                case 's': case 'arrowdown': moveState.backward = 1; break;
                case 'a': case 'arrowleft': moveState.left = 1; break;
                case 'd': case 'arrowright': moveState.right = 1; break;
                case ' ': 
                    if (playerOnGround) {
                        playerVelocity.y = currentJumpStrength;
                        playerOnGround = false;
                        jumpsAvailable = (activePowerUp && activePowerUp.type === 'doubleJump') ? 2 : 1;
                        if (activePowerUp && activePowerUp.type === 'doubleJump') jumpsAvailable--;
                    } else if (jumpsAvailable > 0 && activePowerUp && activePowerUp.type === 'doubleJump') {
                        playerVelocity.y = currentJumpStrength * 0.85; 
                        jumpsAvailable--;
                    }
                    else if (!playerOnGround && isNearWall()) {
                        const wallNormal = getWallNormal(); 
                        playerVelocity.y = currentJumpStrength * 0.7;
                        playerVelocity.x += wallNormal.x * currentJumpStrength * 0.5;
                        playerVelocity.z += wallNormal.z * currentJumpStrength * 0.5;
                    }
                    break;
                case 'r': respawnPlayer(); break;
                case 't': switchGameState(GAME_STATE.SHOP); break;
                case 'l': 
                    slowMoActive = !slowMoActive;
                    if(slowMoInfoUI) slowMoInfoUI.style.display = slowMoActive ? 'block' : 'none';
                    showStatusMessage(`Cámara Lenta ${slowMoActive ? 'Activada' : 'Desactivada'}`, 'text-blue-400');
                    break;
                case 'shift': 
                     if (event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) { 
                        const now = Date.now();
                        if (now - lastDashTime > dashCooldown) {
                            const dashDirection = new THREE.Vector3();
                            if(controls) controls.getDirection(dashDirection);
                            dashDirection.y = 0; 
                            dashDirection.normalize();
                            playerVelocity.addScaledVector(dashDirection, dashSpeed);
                            if(playerOnGround) playerVelocity.y += 2; 
                            lastDashTime = now;
                            showStatusMessage("¡Dash!", 'text-purple-400');
                        }
                    }
                    break;
                case '1': case '2': case '3':
                    activateInventoryItem(parseInt(key) - 1);
                    break;
            }
        }
        function onKeyUp(event) { 
            const key = event.key.toLowerCase();
            if (currentGameState !== GAME_STATE.PLAYING) return;
             switch (key) {
                case 'w': case 'arrowup': moveState.forward = 0; break;
                case 's': case 'arrowdown': moveState.backward = 0; break;
                case 'a': case 'arrowleft': moveState.left = 0; break;
                case 'd': case 'arrowright': moveState.right = 0; break;
            }
        }
        function isNearWall() { return false; }
        function getWallNormal() { return new THREE.Vector3(0,0,0); }
        function updatePlayer(deltaTime) { 
            if (!controls || !controls.getObject()) return;

            const moveSpeed = currentPlayerSpeed * deltaTime; 
            if (moveState.forward) controls.moveForward(moveSpeed);
            if (moveState.backward) controls.moveForward(-moveSpeed);
            if (moveState.right) controls.moveRight(moveSpeed);
            if (moveState.left) controls.moveLeft(moveSpeed); // FIX: Use moveLeft for left movement

            controls.getObject().position.x += playerVelocity.x * deltaTime;
            controls.getObject().position.z += playerVelocity.z * deltaTime;
            playerVelocity.x *= (1 - 10 * deltaTime);
            playerVelocity.z *= (1 - 10 * deltaTime);

            playerVelocity.y += gravity * gravityMultiplier * deltaTime; // Apply gravity multiplier
            controls.getObject().position.y += playerVelocity.y * deltaTime;

            playerOnGround = false;
            const playerWorldPosition = controls.getObject().position;
            const playerBox = new THREE.Box3().setFromCenterAndSize(
                playerWorldPosition, new THREE.Vector3(playerRadius * 2, playerHeight, playerRadius * 2)
            );
            const playerBottomY = playerWorldPosition.y - playerHeight / 2;

            for (const pData of platforms) {
                const platformMesh = pData.mesh;
                if (!platformMesh) continue; // Skip if mesh is removed

                const platformBox = new THREE.Box3().setFromObject(platformMesh);

                if (playerBox.intersectsBox(platformBox)) {
                    // Phase through logic
                    if (phaseThroughPlatforms) {
                         phaseThroughPlatforms = false; // Effect is for one platform
                         showStatusMessage("¡Faseado!", 'text-purple-400');
                         continue; // Skip collision for this platform
                    }

                    const pHeight = getPlatformHeight(platformMesh);
                    if (playerVelocity.y <= 0 && playerBottomY <= platformBox.max.y + 0.2 && playerBottomY >= platformBox.max.y - pHeight * 0.5) {
                        if (playerWorldPosition.x > platformBox.min.x - playerRadius && playerWorldPosition.x < platformBox.max.x + playerRadius &&
                            playerWorldPosition.z > platformBox.min.z - playerRadius && playerWorldPosition.z < platformBox.max.z + playerRadius) {
                            
                            playerWorldPosition.y = platformBox.max.y + playerHeight / 2;
                            playerVelocity.y = 0;
                            playerOnGround = true;
                            jumpsAvailable = (activePowerUp && activePowerUp.type === 'doubleJump') ? 2 : 1;

                            if (pData.isCheckpoint && !pData.activated) {
                                lastCheckpointPosition.copy(platformMesh.position);
                                lastCheckpointPosition.y += getPlatformHeight(platformMesh) / 2 + playerHeight / 2 + 0.1;
                                currentDistanceAtCheckpoint = currentDistance;
                                platformMesh.material.color.set(0x34D399); 
                                pData.activated = true;
                                showStatusMessage("¡Checkpoint alcanzado!", 'text-yellow-400');
                            }
                            if (!playerOnGround && playerVelocity.y < 0 && Math.abs(playerWorldPosition.y - (platformBox.max.y + playerHeight / 2)) < 0.5) {
                                if (Math.abs(playerWorldPosition.x - platformMesh.position.x) < getPlatformWidth(platformMesh)/2 + playerRadius &&
                                    Math.abs(playerWorldPosition.z - platformMesh.position.z) < getPlatformDepth(platformMesh)/2 + playerRadius ) {
                                    
                                    playerWorldPosition.y = platformBox.max.y + playerHeight / 2;
                                    playerVelocity.set(0,0,0); 
                                    playerOnGround = true; 
                                    showStatusMessage("¡Borde Agarrado!", 'text-cyan-400');
                                }
                            }
                        }
                    }
                    else if (playerVelocity.y > 0 && playerWorldPosition.y + playerHeight/2 > platformBox.min.y && playerWorldPosition.y - playerHeight/2 < platformBox.min.y) {
                         playerVelocity.y = -0.1; 
                    }
                    else {
                        const overlap = playerBox.intersect(platformBox).getSize(new THREE.Vector3());
                        if (overlap.x < overlap.z && overlap.x > 0.01) {
                            playerWorldPosition.x += (playerWorldPosition.x > platformMesh.position.x ? overlap.x : -overlap.x) * 0.5;
                        } else if (overlap.z > 0.01) {
                            playerWorldPosition.z += (playerWorldPosition.z > platformMesh.position.z ? overlap.z : -overlap.z) * 0.5;
                        }
                    }
                }
            }
            
            for (let i = collectibles.length - 1; i >= 0; i--) { 
                const collectible = collectibles[i];
                 if (!collectible.mesh) continue; // Skip if mesh is removed
                const collectibleBox = new THREE.Box3().setFromObject(collectible.mesh);
                if (playerBox.intersectsBox(collectibleBox)) {
                    scene.remove(collectible.mesh);
                    const collectedItem = collectibles.splice(i, 1)[0]; 
                    
                    if(collectedItem.type === 'powerUp') {
                        const powerUpDetails = POWER_UP_TYPES.find(pu => pu.id === collectedItem.collectibleId); 
                        if (powerUpDetails) {
                            addPowerUpToInventory(powerUpDetails);
                        }
                    } else if (collectedItem.collectibleId === 'coin') { 
                        playerCoins++;
                        updateCoinDisplay();
                        showStatusMessage("¡Moneda recogida!", 'text-yellow-400');
                    }
                }
            }

            if (playerWorldPosition.y < -60) respawnPlayer(); 
            currentDistance = Math.max(0, playerWorldPosition.z);
            if(levelCounterDisplay) levelCounterDisplay.textContent = `${Math.floor(currentDistance)}m`;
            if (currentDistance > maxDistanceReached) {
                 maxDistanceReached = currentDistance;
                 saveMaxDistance();
                 updateMaxDistanceDisplay();
            }
            if (currentDistance >= gameEndPoint && currentGameState !== GAME_STATE.VICTORY) {
                switchGameState(GAME_STATE.VICTORY);
            }

            if (playerWorldPosition.z > lastGeneratedChunkZ - chunkLoadDistance) {
                generateChunk(lastGeneratedChunkZ, currentGameState === GAME_STATE.LEVEL_EDITOR); 
                removeOldChunks();
            }
        }

        // --- Power-ups e Inventario ---
        function addPowerUpToInventory(powerUp) { 
            for (let i = 0; i < inventorySlots; i++) {
                if (!playerInventory[i]) {
                    playerInventory[i] = powerUp;
                    updateInventoryUI();
                    showStatusMessage(`¡${powerUp.name} añadido al inventario! (Tecla ${i+1})`, 'text-green-400');
                    return;
                }
            }
            showStatusMessage("Inventario lleno.", 'text-orange-400');
        }
        function activateInventoryItem(slotIndex) { 
            if (slotIndex >= 0 && slotIndex < inventorySlots && playerInventory[slotIndex]) {
                const powerUpToActivate = playerInventory[slotIndex];
                playerInventory[slotIndex] = null; 
                updateInventoryUI();
                applyPowerUpEffect(powerUpToActivate.id, powerUpToActivate.name);
            }
        }
        function setupInventoryUI() { 
            if(!inventoryBarUI) return;
            inventoryBarUI.innerHTML = ''; 
            for (let i = 0; i < inventorySlots; i++) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'inventory-slot empty';
                slotDiv.dataset.slotIndex = i;
                slotDiv.innerHTML = `<span class="powerup-name">${i+1}</span>`; 
                slotDiv.addEventListener('click', () => activateInventoryItem(i));
                inventoryBarUI.appendChild(slotDiv);
            }
        }
        function updateInventoryUI() { 
            if(!inventoryBarUI) return;
            const slots = inventoryBarUI.children;
            for (let i = 0; i < inventorySlots; i++) {
                const slotDiv = slots[i];
                const powerUp = playerInventory[i];
                if (powerUp) {
                    slotDiv.classList.remove('empty');
                    slotDiv.innerHTML = `<div class="powerup-icon" style="background-color: ${powerUp.iconColor || '#888'};"></div><span class="powerup-name">${i+1}</span>`;
                } else {
                    slotDiv.classList.add('empty');
                    slotDiv.innerHTML = `<span class="powerup-name">${i+1}</span>`;
                }
            }
        }
        function applyPowerUpEffect(typeId, name) { 
            clearTimeout(powerUpTimeout);
            resetPowerUpEffects(); 
            let message = "";
            let duration = (8 + randomFunc() * 4); 
            let effectMagnitude = (1.4 + randomFunc() * 0.4); 

            switch (typeId) {
                case 'jumpBoost': currentJumpStrength = baseJumpStrength * effectMagnitude; break;
                case 'speedBoost': currentPlayerSpeed = basePlayerSpeed * effectMagnitude; break;
                case 'doubleJump': jumpsAvailable = 2; duration = 15; break; 
                case 'charliXCX': 
                    currentPlayerSpeed = basePlayerSpeed * (1.8 + randomFunc() * 0.7);
                    currentJumpStrength = baseJumpStrength * (1.3 + randomFunc() * 0.3);
                    playerCoins += Math.floor(randomFunc() * 15) + 10; 
                    updateCoinDisplay();
                    duration = 10 + randomFunc() * 5;
                    if (scene.background && scene.background.setHSL) scene.background.setHSL(0.9, 0.8, 0.7); 
                    else scene.background = new THREE.Color(0xE879F9); 
                    setTimeout(() => applyEquippedItems(), duration * 1000); 
                    break;
                 // Experimental Power-ups
                case 'tempPlatform':
                    if(controls && controls.getObject()){
                         const platformPos = controls.getObject().position.clone();
                         platformPos.y -= playerHeight / 2 + 0.5; 
                         const tempPlat = createPlatform(platformPos, new THREE.Vector3(2, 0.5, 2), 0xCCCCCC, false, 'box');
                         platforms.push(tempPlat);
                         setTimeout(() => {
                             if(tempPlat.mesh) scene.remove(tempPlat.mesh);
                             const index = platforms.indexOf(tempPlat);
                             if (index !== -1) platforms.splice(index, 1);
                         }, 5000); 
                    }
                    duration = 0.1; 
                    break;
                case 'shortTeleport':
                    if(controls && controls.getObject()){
                        const direction = new THREE.Vector3();
                        controls.getDirection(direction);
                        controls.getObject().position.addScaledVector(direction, 10); 
                    }
                    duration = 0.1;
                    break;
                case 'coinMagnet':
                    // Conceptual effect - would need implementation in updatePlayer
                    showStatusMessage("¡Imán de Monedas Activado!", "text-yellow-300");
                    duration = 10;
                    break;
                case 'wideView':
                    camera.fov = 90; camera.updateProjectionMatrix();
                    setTimeout(() => { camera.fov = 75; camera.updateProjectionMatrix(); }, 7000);
                    duration = 7;
                    break;
                case 'phasePlatform':
                    phaseThroughPlatforms = true;
                    showStatusMessage("¡Próximo salto atraviesa plataformas!", "text-purple-400");
                    duration = 5; 
                    break;
                case 'lowGravity':
                    gravityMultiplier = 0.3; // Lower gravity
                    setTimeout(() => { gravityMultiplier = 1.0; }, 8000); // Reset gravity
                    duration = 8;
                    break;
            }
            message = `${name} (${duration.toFixed(0)}s)`;
            activePowerUp = { name: name, type: typeId, endTime: Date.now() + duration * 1000 };
            if(powerUpInfoUI) {
                powerUpInfoUI.textContent = message;
                powerUpInfoUI.style.display = 'block';
            }


            if(duration > 0.1) {
                powerUpTimeout = setTimeout(() => {
                    resetPowerUpEffects();
                    showStatusMessage(`Efecto de ${name} terminado.`, 'text-gray-400');
                }, duration * 1000);
            } else { 
                 setTimeout(() => { if(powerUpInfoUI) powerUpInfoUI.style.display = 'none'; }, 500);
                 activePowerUp = null;
            }
        }
        function resetPowerUpEffects() { 
            currentPlayerSpeed = basePlayerSpeed;
            currentJumpStrength = baseJumpStrength;
            if (activePowerUp && activePowerUp.type === 'doubleJump') {
                 if (!playerOnGround) jumpsAvailable = 1;
            } else {
                 jumpsAvailable = 1;
            }
            if(powerUpInfoUI) powerUpInfoUI.style.display = 'none';
            activePowerUp = null;
            gravityMultiplier = 1.0; // Ensure gravity is reset
            phaseThroughPlatforms = false; // Ensure phasing is off
            camera.fov = 75; camera.updateProjectionMatrix(); // Reset FOV
        }
        function updateCoinDisplay() { 
            if(coinCounterDisplay) coinCounterDisplay.textContent = playerCoins;
            if(shopCoinCounterDisplay) shopCoinCounterDisplay.textContent = playerCoins; 
            savePlayerCoins(); 
        }

        // --- Tienda ---
        function populateShop() { 
            if(!shopItemsContainer) return;
            shopItemsContainer.innerHTML = ''; 
            SHOP_ITEMS.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                itemDiv.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Precio: <span class="font-bold text-yellow-300">${item.price}</span> monedas</p>
                `;
                const buyButton = document.createElement('button');
                buyButton.className = 'buy-button';
                if (item.purchased) {
                    buyButton.textContent = 'Adquirido';
                    buyButton.disabled = true;
                } else {
                    buyButton.textContent = 'Comprar';
                    buyButton.disabled = playerCoins < item.price;
                    buyButton.onclick = () => buyShopItem(item.id);
                }
                itemDiv.appendChild(buyButton);

                if (item.purchased && (item.type === 'platform_shape' || item.type === 'background_style')) {
                    const equipButton = document.createElement('button');
                    equipButton.className = `equip-button ${item.equipped ? 'equipped-button' : ''}`;
                    equipButton.textContent = item.equipped ? 'Equipado' : 'Equipar';
                    equipButton.onclick = () => equipShopItem(item.id);
                    itemDiv.appendChild(equipButton);
                }
                shopItemsContainer.appendChild(itemDiv);
            });
            if(shopCoinCounterDisplay) shopCoinCounterDisplay.textContent = playerCoins;
        }
        function buyShopItem(itemId) { 
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (item && !item.purchased && playerCoins >= item.price) {
                playerCoins -= item.price;
                item.purchased = true;
                updateCoinDisplay();
                saveShopItems();
                populateShop(); 
                showStatusMessage(`¡Has comprado "${item.name}"!`, 'text-green-400');
                if (item.type === 'platform_shape' || item.type === 'background_style') {
                    equipShopItem(itemId); 
                }
            } else if (item && playerCoins < item.price) {
                showStatusMessage("¡No tienes suficientes monedas!", 'text-red-400');
            }
        }
        function equipShopItem(itemId) { 
            const itemToEquip = SHOP_ITEMS.find(i => i.id === itemId);
            if (!itemToEquip || !itemToEquip.purchased) return;

            SHOP_ITEMS.forEach(item => {
                if (item.type === itemToEquip.type && item.id !== itemToEquip.id) {
                    item.equipped = false;
                }
            });
            itemToEquip.equipped = !itemToEquip.equipped; 

            applyEquippedItems();
            saveShopItems();
            populateShop(); 
        }
        function applyEquippedItems() { 
            currentPlatformShape = 'box';
            currentBackgroundStyle = 'default';

            SHOP_ITEMS.forEach(item => {
                if (item.purchased && item.equipped) {
                    if (item.type === 'platform_shape') currentPlatformShape = item.value;
                    else if (item.type === 'background_style') currentBackgroundStyle = item.value;
                }
            });
            
            if (currentBackgroundStyle === 'nebula') {
                 if(scene.background && scene.background.set) scene.background.set(0x0f0529); else scene.background = new THREE.Color(0x0f0529);
            } else if (currentBackgroundStyle === 'alien_sunset') {
                 if(scene.background && scene.background.set) scene.background.set(0xd94f00); else scene.background = new THREE.Color(0xd94f00);
            } else { 
                 if(scene.background && scene.background.setHSL) scene.background.setHSL(randomFunc(), 0.5, 0.1); else scene.background = new THREE.Color().setHSL(randomFunc(), 0.5, 0.1);
            }
            applyGraphicsSettings(graphicsSettings.quality); 
        }


        // --- Ajustes Gráficos ---
        function applyGraphicsSettings(quality) {
            graphicsSettings.quality = quality;
            console.log(`Aplicando calidad gráfica: ${quality}`);
            switch(quality) {
                case 'low':
                    graphicsSettings.bloomEnabled = false;
                    graphicsSettings.shadowMapSize = 512;
                    graphicsSettings.antialias = false;
                    break;
                case 'medium':
                    graphicsSettings.bloomEnabled = false;
                    graphicsSettings.shadowMapSize = 1024;
                    graphicsSettings.antialias = true;
                    break;
                case 'high':
                    graphicsSettings.bloomEnabled = false; 
                    graphicsSettings.shadowMapSize = 2048;
                    graphicsSettings.antialias = true;
                    break;
                case 'ultra':
                    graphicsSettings.bloomEnabled = false;
                    graphicsSettings.shadowMapSize = 4096;
                    graphicsSettings.antialias = true;
                    break;
                case 'rtx5090':
                    graphicsSettings.bloomEnabled = true;
                    graphicsSettings.shadowMapSize = 8192; 
                    graphicsSettings.antialias = true;
                    if (bloomPass && bloomPass.strength !== undefined) { 
                        bloomPass.strength = 0.7;
                        bloomPass.radius = 0.6;
                        bloomPass.threshold = 0.15;
                    }
                    console.warn("¡MODO PC GAMER ULTRA 4K CON RTX 5090 ACTIVADO! ¡PREPÁRATE PARA EL DESPEGUE!");
                    showStatusMessage("¡MODO RTX 5090 ACTIVADO!", 'text-red-500');
                    break;
            }
            
            configureShadows(quality); 
            if (bloomPass && bloomPass.enabled !== undefined) { 
                bloomPass.enabled = graphicsSettings.bloomEnabled;
            }

            if (renderer) {
                 renderer.antialias = graphicsSettings.antialias; // Apply antialias setting
                 renderer.setSize(window.innerWidth, window.innerHeight); 
            }
        }


        // --- Persistencia ---
        const SAVE_SLOTS_COUNT = 5;
        let saveSlots = [];

        function getCurrentSaveData() {
            return {
                seed: currentSeedStringInternal,
                coins: playerCoins,
                maxDistance: maxDistanceReached,
                date: new Date().toISOString(),
                difficulty: selectedDifficulty,
                editorParams: {...editorParams},
                inventory: playerInventory.map(pu => pu ? pu.id : null),
                shopItems: SHOP_ITEMS.map(i => ({id: i.id, purchased: i.purchased, equipped: i.equipped}))
            };
        }
        function applySaveData(data) {
            if (!data) return;
            setSeed(data.seed, worldSeedDisplay, gamePlaySeedInput);
            playerCoins = data.coins || 0;
            maxDistanceReached = data.maxDistance || 0;
            selectedDifficulty = data.difficulty || 'normal';
            if (data.editorParams) Object.assign(editorParams, data.editorParams);
            if (data.inventory) {
                playerInventory = data.inventory.map(id => id ? POWER_UP_TYPES.find(pu => pu.id === id) : null);
                updateInventoryUI();
            }
            if (data.shopItems) {
                SHOP_ITEMS.forEach(item => {
                    const s = data.shopItems.find(si => si.id === item.id);
                    if (s) { item.purchased = s.purchased; item.equipped = s.equipped; }
                });
            }
            updateCoinDisplay();
            saveShopItems();
            applyEquippedItems();
            saveAllPersistentData();
            resetGameLogic();
            switchGameState(GAME_STATE.PLAYING);
        }
        function saveSlot(idx) {
            saveSlots[idx] = getCurrentSaveData();
            localStorage.setItem('mundoDescosido_saveSlots', JSON.stringify(saveSlots));
            showStatusMessage(`Partida guardada en slot ${idx+1}`, 'text-green-400');
            renderSaveSlotsPanel();
        }
        function loadSlot(idx) {
            const slot = saveSlots[idx];
            if (slot) {
                applySaveData(slot);
                showStatusMessage(`Partida cargada de slot ${idx+1}`, 'text-blue-400');
                hideSaveSlotsPanel();
            }
        }
        function deleteSlot(idx) {
            saveSlots[idx] = null;
            localStorage.setItem('mundoDescosido_saveSlots', JSON.stringify(saveSlots));
            showStatusMessage(`Partida eliminada del slot ${idx+1}`, 'text-red-400');
            renderSaveSlotsPanel();
        }
        function renderSaveSlotsPanel() {
            if (!saveSlotsContainer) return;
            saveSlotsContainer.innerHTML = '';
            for (let i = 0; i < SAVE_SLOTS_COUNT; i++) {
                const slot = saveSlots[i];
                const div = document.createElement('div');
                div.className = 'save-slot';
                if (slot) {
                    div.innerHTML = `
                        <div class="slot-info">
                            <b>Slot ${i+1}</b> | <span class="text-yellow-300">${slot.seed}</span>
                            <br>Monedas: <b>${slot.coins}</b> | Distancia: <b>${slot.maxDistance}m</b> | Dificultad: <b>${slot.difficulty}</b>
                            <br><span class="text-xs text-gray-400">${new Date(slot.date).toLocaleString()}</span>
                        </div>
                        <div class="slot-actions">
                            <button onclick="loadSlot(${i})" class="bg-blue-600 hover:bg-blue-700">Cargar</button>
                            <button onclick="saveSlot(${i})" class="bg-green-600 hover:bg-green-700">Sobrescribir</button>
                            <button onclick="deleteSlot(${i})" class="bg-red-600 hover:bg-red-700">Borrar</button>
                        </div>
                    `;
                } else {
                    div.innerHTML = `
                        <div class="slot-info save-slot-empty">
                            <b>Slot ${i+1}</b> | Vacío
                        </div>
                        <div class="slot-actions">
                            <button onclick="saveSlot(${i})" class="bg-green-600 hover:bg-green-700">Guardar aquí</button>
                        </div>
                    `;
                }
                saveSlotsContainer.appendChild(div);
            }
        }
        function showSaveSlotsPanel() {
            if (!saveSlotsPanel) return;
            renderSaveSlotsPanel();
            saveSlotsPanel.style.display = 'block';
        }
        function hideSaveSlotsPanel() {
            if (!saveSlotsPanel) return;
            saveSlotsPanel.style.display = 'none';
        }
        function loadSaveSlotsFromStorage() {
            try {
                const slots = JSON.parse(localStorage.getItem('mundoDescosido_saveSlots'));
                saveSlots = Array.isArray(slots) ? slots : new Array(SAVE_SLOTS_COUNT).fill(null);
            } catch {
                saveSlots = new Array(SAVE_SLOTS_COUNT).fill(null);
            }
        }
        function saveAllPersistentData() { savePlayerCoins(); saveShopItems(); saveMaxDistance(); }
        function loadAllPersistentData() { loadPlayerCoins(); loadShopItems(); /* Max distance se carga por semilla */ }
        function savePlayerCoins() { try { localStorage.setItem('mundoDescosido_playerCoins', playerCoins.toString()); } catch (e) { console.error("Error saving coins:", e); }}
        function loadPlayerCoins() { 
            try {
                const storedCoins = localStorage.getItem('mundoDescosido_playerCoins');
                playerCoins = storedCoins !== null ? parseInt(storedCoins) : 0;
            } catch (e) { playerCoins = 0; console.error("Error loading coins:", e); }
            updateCoinDisplay();
        }
        function saveShopItems() { try { localStorage.setItem('mundoDescosido_shopItems', JSON.stringify(SHOP_ITEMS.map(i => ({id: i.id, purchased: i.purchased, equipped: i.equipped })))); } catch (e) { console.error("Error saving shop items:", e); }}
        function loadShopItems() { 
            try {
                const storedItems = localStorage.getItem('mundoDescosido_shopItems');
                if (storedItems) {
                    const loadedItems = JSON.parse(storedItems);
                    SHOP_ITEMS.forEach(item => {
                        const loadedItem = loadedItems.find(li => li.id === item.id);
                        if (loadedItem) {
                            item.purchased = loadedItem.purchased;
                            item.equipped = loadedItem.equipped;
                        }
                    });
                }
            } catch (e) { console.error("Error loading shop items:", e); }
        }
        function loadMaxDistance() { 
             const storedDistances = localStorage.getItem('mundoDescosido_maxDistances');
             if (storedDistances) {
                 try {
                     const distances = JSON.parse(storedDistances);
                     maxDistanceReached = distances[currentSeedStringInternal] || 0;
                 } catch (e) { maxDistanceReached = 0; console.error("Error loading max distances:", e); }
             } else { maxDistanceReached = 0; }
             updateMaxDistanceDisplay();
        }
        function saveMaxDistance() { 
             const storedDistances = localStorage.getItem('mundoDescosido_maxDistances');
             let distances = {};
             if (storedDistances) {
                 try { distances = JSON.parse(storedDistances); }
                 catch (e) { console.error("Error parsing max distances:", e); }
             }
             distances[currentSeedStringInternal] = Math.floor(maxDistanceReached);
             try { localStorage.setItem('mundoDescosido_maxDistances', JSON.stringify(distances)); }
             catch (e) { console.error("Error saving max distances:", e); }
        }
        function updateMaxDistanceDisplay() { if(maxDistanceDisplay) maxDistanceDisplay.textContent = `${Math.floor(maxDistanceReached)}m`; }
        function respawnPlayer() { 
            if(controls && controls.getObject()){
                if (currentDistance > maxDistanceReached) {
                    maxDistanceReached = currentDistance;
                    saveMaxDistance();
                    updateMaxDistanceDisplay();
                }
                controls.getObject().position.copy(lastCheckpointPosition);
                playerVelocity.set(0, 0, 0);
                playerOnGround = true;
                jumpsAvailable = (activePowerUp && activePowerUp.type === 'doubleJump') ? 2 : 1;
                showStatusMessage("¡Caíste! Reintentando desde el último checkpoint!", 'text-red-400');
                clearTimeout(powerUpTimeout);
                resetPowerUpEffects();
            }
        }
        function lerp(a, b, t) { return a + (b - a) * t; }

        // --- Bucle de Animación Principal ---
        let menuBackgroundHue = randomFunc();
        function animate() {
            requestAnimationFrame(animate);
            const deltaTime = Math.min(clock.getDelta(), 0.1); 
            const effectiveDeltaTime = deltaTime * (slowMoActive && currentGameState === GAME_STATE.PLAYING ? slowMoFactor : 1);


            if (currentGameState === GAME_STATE.PLAYING) {
                updatePlayer(effectiveDeltaTime); 
                 platforms.forEach(pData => { 
                    if (pData.mesh && pData.mesh.material && pData.mesh.material.color) {
                         if (pData.isCheckpoint && pData.activated) {
                             pData.mesh.material.color.set(0x34D399);
                         } else {
                             pData.mesh.material.color.set(pData.originalColor);
                         }
                     }
                 });
                collectibles.forEach(collectible => { 
                    if (collectible.mesh) {
                        collectible.mesh.rotation.x += 3 * effectiveDeltaTime;
                        collectible.mesh.rotation.y += 3.5 * effectiveDeltaTime;
                    }
                });
                if(activePowerUp) { 
                    const timeLeft = Math.max(0, (activePowerUp.endTime - Date.now()) / 1000);
                    if (timeLeft > 0) {
                         if(powerUpInfoUI) powerUpInfoUI.textContent = `${activePowerUp.name} (${timeLeft.toFixed(1)}s)`;
                    } else {
                         resetPowerUpEffects();
                         showStatusMessage(`Efecto de ${activePowerUp.name} terminado.`, 'text-gray-400');
                    }
                }
                if (dayNightCycleActive && experimentalFeaturesEnabled) {
                    timeOfDay = (timeOfDay + effectiveDeltaTime * 0.01) % 1; 
                    let lightIntensityFactor = 1;
                    let ambientIntensityFactor = 1;
                    if (timeOfDay < 0.2 || timeOfDay > 0.8) { 
                        lightIntensityFactor = 0.2; ambientIntensityFactor = 0.3;
                        if(scene.background && scene.background.setHSL) scene.background.setHSL(0.6, 0.5, 0.05 + Math.sin(timeOfDay * Math.PI * 2) * 0.03); 
                    } else if (timeOfDay > 0.4 && timeOfDay < 0.6) { 
                        lightIntensityFactor = 1.0; ambientIntensityFactor = 0.6;
                         if(scene.background && scene.background.setHSL) scene.background.setHSL(0.55, 0.7, 0.4 + Math.sin(timeOfDay * Math.PI * 2) * 0.1); 
                    } else { 
                        lightIntensityFactor = 0.6; ambientIntensityFactor = 0.4;
                         if(scene.background && scene.background.setHSL) scene.background.setHSL(0.1 + (timeOfDay - 0.2)*0.5 , 0.7, 0.3 + Math.sin(timeOfDay * Math.PI * 2) * 0.05); 
                    }
                    if(directionalLight) directionalLight.intensity = 0.6 * lightIntensityFactor;
                    const ambient = scene.children.find(c => c.isAmbientLight);
                    if(ambient) ambient.intensity = 0.4 * ambientIntensityFactor;

                    if (randomFunc() < 0.001 * effectiveDeltaTime) { 
                        if (timeOfDay < 0.2 || timeOfDay > 0.8) showStatusMessage("Una estrella fugaz cruza el cielo...", "text-purple-300");
                        else if (timeOfDay > 0.4 && timeOfDay < 0.6) showStatusMessage("El sol brilla intensamente...", "text-yellow-200");
                    }
                }


            } else if (currentGameState === GAME_STATE.MAIN_MENU || currentGameState === GAME_STATE.SETTINGS || currentGameState === GAME_STATE.LEVEL_EDITOR || currentGameState === GAME_STATE.DIFFICULTY_SELECT || currentGameState === GAME_STATE.SHOP || currentGameState === GAME_STATE.PAUSED || currentGameState === GAME_STATE.VICTORY) {
                if (currentBackgroundStyle === 'default' && scene.background && scene.background.setHSL) { 
                     menuBackgroundHue = (menuBackgroundHue + deltaTime * 0.003) % 1;
                     scene.background.setHSL(menuBackgroundHue, 0.6, 0.05 + Math.sin(Date.now()*0.00003)*0.02);
                }
                if (currentGameState === GAME_STATE.MAIN_MENU) {
                    if(camera) {
                        camera.position.x = Math.sin(Date.now() * 0.0001) * 5;
                        camera.position.z = Math.cos(Date.now() * 0.0001) * 5 + 5; 
                        camera.lookAt(0,1,0); 
                    }
                }
            }


            if (currentGameState === GAME_STATE.PLAYING && !shopOpen) {
                 adjustShadowCamera();
            }

            if (graphicsSettings.bloomEnabled && composer && bloomPass && bloomPass.enabled && bloomPass.render ) {
                composer.render(effectiveDeltaTime); 
            } else {
                renderer.render(scene, camera);
            }
        }

        // --- Utilidades ---
        // These are now defined outside init()


        window.onload = function () { init(); }
    </script>
</body>
</html>
