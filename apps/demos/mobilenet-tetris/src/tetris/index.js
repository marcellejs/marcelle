/* eslint-disable */
import { Tetris } from './tetris';
import { getRandomIntInclusive } from './helperFunctions';
import {
  MOVES,
  KEYS,
  KEY_MAP,
  ASCII_EMOJIS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYFIELD_DIMENSIONS,
  NEXTQUEUE_DIMENSIONS,
  ROWS,
  COLS,
  BLOCK_SIZE,
} from './constants';
import { TICKS_PER_SECOND, KEY_REPEAT_DELAY, KEY_MOVE_MAP, OVERRIDE_KEYS } from './config';

///////////////////////////////////////////////////////////////////////
// Interface variables (needed for multiple interface functions)
///////////////////////////////////////////////////////////////////////

let gameState; // Keep a reference to gameState across animation loop ticks
let nextMove; // Action for next game loop tick
let gameOver = false;

// Track when a key was initially pressed down (used for repeating moves after a delay)
let keyDownTimestamp = 0;
let pressedKeys = {}; // Manually track which keys are being held
let lastDirectionKeyDown; // Repeat left/right/down continuously

let nextGameLoopTimestamp = 0; // for game loop (separate from animation speed)
let nextFrameTimestamp = 0; // for blocky animation in animate()

///////////////////////////////////////////////////////////////////////
// Initialize the game!
///////////////////////////////////////////////////////////////////////

let tetris, animationId;
// Create canvas, save reference to 2d drawing context
const canvasContext = createCanvas('game', CANVAS_WIDTH, CANVAS_HEIGHT);
export function reset() {
  // Create instance of Tetris module
  tetris = new Tetris(ROWS, COLS);

  // Start the animation! Save the ID to turn the animation off later
  animationId = window.requestAnimationFrame(animate);
}

export function stop() {
  window.cancelAnimationFrame(animationId);
}

///////////////////////////////////////////////////////////////////////
// User input / event listeners
///////////////////////////////////////////////////////////////////////

document.addEventListener('keydown', function (event) {
  // Normalize key codes across browsers (see notes in constants.js)
  const currentKey = KEY_MAP[event.key || event.keyCode];

  // Prevent default behavior for keys being used as game controls (except for Ctrl)
  if (OVERRIDE_KEYS.includes(currentKey)) {
    event.preventDefault();
  }

  // If this key isn't part of game controls, or this key is already currently pressed,
  // don't do anything!
  // NOTE: Key repeat rates are inconsistent across operating systems/devices,
  // so let's not rely on that for game behavior =P
  if (currentKey === undefined || pressedKeys[currentKey]) {
    return;
  }

  // If left and right keys are pressed down at the same time, use the most recent
  if (currentKey === KEYS.LEFT && pressedKeys[KEYS.RIGHT]) {
    pressedKeys[KEYS.RIGHT] = false;
  } else if (currentKey === KEYS.RIGHT && pressedKeys[KEYS.LEFT]) {
    pressedKeys[KEYS.LEFT] = false;
  }
  // NOTE: #TIL keyboards differ in how they handle simultaneous key presses!
  // See: https://en.wikipedia.org/wiki/Rollover_(key)
  // Key jamming: it's not a bug, it's a feature! ¯\_(ツ)_/¯

  // Track when a game key was initially pressed down (used for repeating moves after a delay)
  // NOTE: important to do this *after* the return condition above; track INITIAL keypress only!
  keyDownTimestamp = window.performance.now();

  pressedKeys[currentKey] = true; // Track which keys are being held down

  // Set the next move to whichever key was most recently held down
  // (this may be overridden based on multiple keys / key repeat delay)
  nextMove = KEY_MOVE_MAP[currentKey];
}); // end keyDown handler

// Remove from pressedKeys when a key is released
document.addEventListener('keyup', function (event) {
  const currentKey = KEY_MAP[event.key || event.keyCode];
  if (currentKey === undefined) {
    return;
  } // only handle game control keys
  pressedKeys[currentKey] = false; // Remove from pressedKeys once released
});

// Release all keys when window loses focus
// (to prevent weird bugs when switching windows while keys are still held down)
// Thanks to p5js library source code for making me aware of this issue!
window.addEventListener('blur', function (event) {
  pressedKeys = {};
});

///////////////////////////////////////////////////////////////////////
// Game loop / animation functions
///////////////////////////////////////////////////////////////////////

// Run game loop every X milliseconds (TICKS_PER_SECOND) -- or initiate
// This allows for game actions (like automatically moving the tetromino down) to be a certain speed independent of the animation frame rate
function updateGame() {
  // Update game state with next move, returns updated state with: sqaures array, score number, gameOver, and tetrominoQueue array
  // NOTE: must run this BEFORE key repeat/reset conditions below; otherwise, non-repeatable moves like rotation WON'T be triggered at all
  gameState = tetris.gameLoopTick(nextMove);

  // For left/right, repeat on keydown but only after a delay! Matches original game better, and easier to move 1 space at a time if needed
  // (Otherwise, it's easy to accidentally move 2 or more spaces if you don't release the key soon enough)
  if (
    window.performance.now() - keyDownTimestamp >= KEY_REPEAT_DELAY &&
    (pressedKeys[KEYS.LEFT] || pressedKeys[KEYS.RIGHT])
  ) {
    if (pressedKeys[KEYS.DOWN] && pressedKeys[KEYS.LEFT]) {
      nextMove = MOVES.LEFT_SOFT_DROP;
    } else if (pressedKeys[KEYS.DOWN] && pressedKeys[KEYS.RIGHT]) {
      nextMove = MOVES.RIGHT_SOFT_DROP;
    } else if (pressedKeys[KEYS.LEFT]) {
      nextMove = MOVES.LEFT;
    } else if (pressedKeys[KEYS.RIGHT]) {
      nextMove = MOVES.RIGHT;
    }

    // Soft-drop is the only move that repeats immediately on keydown (no delay before repeating)
  } else if (pressedKeys[KEYS.DOWN]) {
    nextMove = MOVES.SOFT_DROP;

    // For all other moves, don't repeat them on keydown! Reset nextMove after each tick of game loop
  } else {
    nextMove = undefined;
  }

  return gameState;
} // end updateGame

function drawFrame(gameState, canvasContext) {
  // Clear canvas between frames and draw the playfield
  clearFrame(canvasContext);

  // Draw all tetrominoes on each frame, in the playfield and the queue
  gameState.squares.forEach(drawPlayfieldSquare);
  drawNextQueueTetrominoes(canvasContext, gameState.tetrominoQueue);

  // Draw score
  drawCanvasSmallHeading(
    canvasContext,
    'Score: ' + gameState.score,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - 5,
  );

  // Draw "Next" above the queue
  drawCanvasSmallHeading(
    canvasContext,
    'Next:',
    NEXTQUEUE_DIMENSIONS.X + NEXTQUEUE_DIMENSIONS.WIDTH / 2,
    NEXTQUEUE_DIMENSIONS.Y - 30,
  );

  // If player lost, draw game over screen and stop animation
  // (TODO: replay option; add a subtle animation)
  if (gameState.gameOver) {
    cancelAnimationFrame(animationId);
    drawGameOver(canvasContext);
  }
} // end drawFrame()

// Animation loop with requestAnimationFrame
function animate(currentTimestamp) {
  // Repeat the animation loop forever (until we stop it)
  // NOTE: Important to run this *before* updating game state,
  // otherwise when game is over, animation will restart after
  // being cancelled in updateGame()
  animationId = window.requestAnimationFrame(animate);

  // Only update game state every [TICKS_PER_SECOND]
  if (currentTimestamp >= nextGameLoopTimestamp) {
    // Update the timestamp for the next tick
    nextGameLoopTimestamp = currentTimestamp + 1000 / TICKS_PER_SECOND;

    gameState = updateGame();
  }

  // Draw frames as often as possible (between game loop ticks),
  // so future transitions / particle effects / etc still look smooth
  // while keeping the Tetris game movements nice and blocky
  drawFrame(gameState, canvasContext);
}

////////////////////////////////////////////////////////////////////////////
// Canvas drawing functions
////////////////////////////////////////////////////////////////////////////

// Create canvas, add to the web page, and return the 2d drawing context
function createCanvas(containerElemId, width, height) {
  let canvasElem = document.createElement('canvas');
  canvasElem.setAttribute('width', width);
  canvasElem.setAttribute('height', height);
  canvasElem.textContent =
    "This is a Tetris game! But you'll need a modern web browser with JavaScript enabled to play the game.";
  document.getElementById(containerElemId).appendChild(canvasElem);

  // Return 2d drawing context for access to all drawing functions
  return canvasElem.getContext('2d');
}

// Set shadow properties using canvas API:
//  canvasContext: drawing context for the canvas element
//  color: a string like "#fff" or "rgba(0,0,0,0.5)"
//  xOffset, yOffset, blurRadius: integer value
function setCanvasShadow(canvasContext, color, xOffset, yOffset, blurRadius) {
  canvasContext.shadowOffsetX = xOffset;
  canvasContext.shadowOffsetY = yOffset;
  canvasContext.shadowBlur = blurRadius;
  canvasContext.shadowColor = color;
}

// Reset shadow (0 opacity)
// TODO: look this up; surely there's a better way, lol!
function resetShadow(canvasContext) {
  canvasContext.shadowColor = 'rgba(0, 0, 0, 0.0)';
}

// Canvas styles for small headings
// text: string of text to draw
// xPos, yPos: integer value for top/left starting coordinate in pixels
function drawCanvasSmallHeading(canvasContext, text, xPos, yPos) {
  setCanvasShadow(canvasContext, 'rgba(0, 0, 0, 0.3)', 1, 1, 2);
  canvasContext.fillStyle = '#555';
  canvasContext.font = '30px sans-serif';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(text, xPos, yPos);
  setCanvasShadow(canvasContext, 'rgba(0, 0, 0, 0.4)', 1, 1, 4);
  resetShadow(canvasContext);
}

// Clear canvas between frames and draw background color
function clearFrame(canvasContext) {
  // Clear entire canvas between frames
  canvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw playfield background
  canvasContext.fillStyle = '#eee';
  setCanvasShadow(canvasContext, 'rgba(0, 0, 0, 0.4)', 2, 2, 4);
  canvasContext.fillRect(
    PLAYFIELD_DIMENSIONS.X,
    PLAYFIELD_DIMENSIONS.Y,
    PLAYFIELD_DIMENSIONS.WIDTH,
    PLAYFIELD_DIMENSIONS.HEIGHT,
  );

  // Draw outline around playfield
  resetShadow(canvasContext);
  canvasContext.strokeStyle = '#222';
  canvasContext.strokeRect(
    PLAYFIELD_DIMENSIONS.X,
    PLAYFIELD_DIMENSIONS.Y,
    PLAYFIELD_DIMENSIONS.WIDTH,
    PLAYFIELD_DIMENSIONS.HEIGHT,
  );
}

// Given a square for a tetromino on the playfield, draw it!
function drawPlayfieldSquare(s) {
  // Actual coordinates for drawing: multiply row/col by the BLOCK_SIZE
  let xPos = PLAYFIELD_DIMENSIONS.X + s.col * BLOCK_SIZE;
  let yPos = PLAYFIELD_DIMENSIONS.Y + s.row * BLOCK_SIZE;

  canvasContext.fillStyle = s.color;
  canvasContext.strokeStyle = '#444';
  canvasContext.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
  canvasContext.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
}

// Given an array of upcoming tetrominoes, draw them in the queue!
function drawNextQueueTetrominoes(canvasContext, tetrominoQueue) {
  // Starting coordinates for first tetromino in the queue
  // Updates at end of loop, to draw each tetromio underneath the last
  let nextXStart = NEXTQUEUE_DIMENSIONS.X;
  let nextYStart = NEXTQUEUE_DIMENSIONS.Y;

  tetrominoQueue.forEach((tetromino) => {
    let xPos, yPos;

    // Get the lowest (left-most) column value; use that to remove the offset, shift back to column 0
    let colOffset = tetromino.squares
      .map((s) => s.col)
      .reduce((min, cur) => {
        return Math.min(min, cur);
      }, COLS);
    [0].col;

    // Draw each square based on its coordinates but relative to the queue section
    // and remove offset so the column values start at 0 (unlike in the game, where they spawn in the center column)
    tetromino.squares.forEach((s) => {
      xPos = nextXStart + (s.col - colOffset) * BLOCK_SIZE;
      yPos = nextYStart + s.row * BLOCK_SIZE;

      canvasContext.fillStyle = s.color;
      canvasContext.strokeStyle = '#444';
      setCanvasShadow(canvasContext, 'rgba(0, 0, 0, 0.3)', 2, 2, 3);
      canvasContext.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
      resetShadow(canvasContext);
      canvasContext.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
    });

    // Next tetromino will be drawn below the previous one, with a margin of 1 row
    // NOTE: the last yPos will be from the bottom-most square, squares in a tetromino are in order from top left to bottom right
    nextYStart = yPos + BLOCK_SIZE * 2;
  }); // end forEach tetromino
} // end drawNextQueueTetrominoes

// Draw "Game over" text and a sad/mad ASCII emoji
function drawGameOver(canvasContext) {
  // Semi-transparent white mask over the game
  canvasContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
  canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Large "game over" text
  canvasContext.fillStyle = '#555';
  canvasContext.font = '50px sans-serif';
  canvasContext.textAlign = 'center';
  setCanvasShadow(canvasContext, 'rgba(0, 0, 0, 0.3)', 1, 1, 3);
  canvasContext.fillText('Game over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 65);

  // Draw a random sad or mad ASCII emoji from array in constants.js
  const EMOJI = ASCII_EMOJIS[getRandomIntInclusive(0, ASCII_EMOJIS.length - 1)];
  canvasContext.font = '40px sans-serif';
  canvasContext.fillText(EMOJI, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
  resetShadow(canvasContext);
}

export function setMove(move) {
  nextMove = move;
}
