import {KEYS, MOVES} from "./constants.js"

// Mapping keyboard controls to game moves
// Reference: https://strategywiki.org/wiki/Tetris/Controls
export const KEY_MOVE_MAP = {
  [KEYS.LEFT]: MOVES.LEFT,
  [KEYS.RIGHT]: MOVES.RIGHT,

  [KEYS.UP]: MOVES.ROTATE_CLOCKWISE,
  [KEYS.X]: MOVES.ROTATE_CLOCKWISE,

  [KEYS.Z]: MOVES.ROTATE_COUNTER_CLOCKWISE,
  [KEYS.CTRL]: MOVES.ROTATE_COUNTER_CLOCKWISE,

  [KEYS.DOWN]: MOVES.SOFT_DROP,
  [KEYS.SPACE]: MOVES.HARD_DROP,
};

// Prevent default browser behavior for these keys
// NOTE: do this for all game controls except the CTRL key, because otherwise
//       I can't do Ctrl+Shift+J to open the JS console while testing the game!
export const OVERRIDE_KEYS = [
  KEYS.LEFT,
  KEYS.RIGHT,
  KEYS.DOWN,
  KEYS.UP,
  KEYS.SPACE,
  KEYS.X,
  KEYS.Z
];

// Milliseconds until key auto-repeats for left/right/soft-drop
export const KEY_REPEAT_DELAY = 120; 

// Update the game loop every X milliseconds
// This allows for game actions (like moving left/right) to be a certain speed independent of the animation frame rate, for a blocky "oldschool" step-by-step style, instead of a smooth/continuous animation
export const TICKS_PER_SECOND = 30;

// Number of game loop ticks allowed before moving tetromino down / potentially locking it
export const TICKS_UNTIL_LOCK = 10;

// Number of tetrominoes in the "next" queue
export const TETROMINO_QUEUE_LENGTH = 4;

