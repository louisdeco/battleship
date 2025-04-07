/**
 * @jest-environment jsdom
 */

import Game from '../modules/game.js';

describe('game', () => {
  let game;
  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
        <div class="player1-grid"></div>
        <div class="player2-grid"></div>
        <dialog class="ship-placement">
        <button class="rotate">Rotate</button>
        <div class="placement-grid"></div>
        </dialog>
        <dialog class="endgame">
        <p class="endgame-message"></p>
        <button class="play-again">Play Again</button>
        </dialog>
        `;
    // Mock dialog methods
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
    // Create the game
    game = Game();
  });
  it('initializes the display without errors', () => {
    expect(() => game.initialize()).not.toThrow();
  });
});
