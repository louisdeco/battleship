import './css/styles.css';
import Game from './modules/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = Game();
  game.initialize();
});
