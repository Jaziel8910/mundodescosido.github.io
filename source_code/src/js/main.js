import '../css/style.css';
import { init } from './game.js';

// Wait for the DOM to be fully loaded before starting the game.
// This ensures all HTML elements are available for the UI module to cache.
window.addEventListener('load', () => {
    init();
});
