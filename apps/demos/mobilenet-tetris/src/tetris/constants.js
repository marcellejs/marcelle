export const ROWS = 20;
export const COLS = 10;
export const BLOCK_SIZE = 25; // size of each square in the grid, in pixels

////////////////////////////////////////////////////////////////////////////
// Normalizing keys for user input
////////////////////////////////////////////////////////////////////////////
  
// Normalized key names used in KEY_MAP defined below
export const KEYS = {
  UP: "upArrow",
  DOWN: "downArrow",
  LEFT: "leftArrow",
  RIGHT: "rightArrow",
  X: "x",
  Z: "z",
  CTRL: "control",
  SPACE: "space"
};

// KEY_MAP --
// Normalizing KeyboardEvent values for "key" and "keyCode" properties
// References:
//  https://w3c.github.io/uievents/
//  https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
//  https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a
//  
//  Summary:
//    - Modern browsers implement "key" property, but IE/Edge use different values for some keys
//    - keyCode "is supported in effectively all browsers (since IE6+, Firefox 2+, Chrome 1+ etc)"
//      via https://caniuse.com/#search=KeyboardEvent.keyCode
export const KEY_MAP = {
  "ArrowUp": KEYS.UP,
  "Up": KEYS.UP,
  "38": KEYS.UP,

  "ArrowDown": KEYS.DOWN,
  "Down": KEYS.DOWN,
  "40": KEYS.DOWN,

  "ArrowLeft": KEYS.LEFT,
  "Left": KEYS.LEFT,
  "37": KEYS.LEFT,

  "ArrowRight": KEYS.RIGHT,
  "Right": KEYS.RIGHT,
  "39": KEYS.RIGHT,

  " ": KEYS.SPACE,
  "Spacebar": KEYS.SPACE,
  "32": KEYS.SPACE,
  
  "Control": KEYS.CTRL,
  "17": KEYS.CTRL, // left control (still need to check about the right one, lol)

  "x": KEYS.X,
  "88": KEYS.X,
  "z": KEYS.Z,
  "90": KEYS.Z
};

////////////////////////////////////////////////////////////////////////////
// Gameplay
////////////////////////////////////////////////////////////////////////////
  
// Constants for naming game moves/actions
export const MOVES = {
  LEFT: "left",
  RIGHT: "right",
  SOFT_DROP: "soft-drop",
  LEFT_SOFT_DROP: "left-soft-drop",
  RIGHT_SOFT_DROP: "right-soft-drop",
  HARD_DROP: "hard-drop",
  ROTATE_CLOCKWISE: "rotate-clockwise",
  ROTATE_COUNTER_CLOCKWISE: "rotate-counterclockwise"
};


// Tetrominos: name, shape, and color
// 2d array for their shapes:
//  - 0: no square in this position
//  - 1: a square exists here
//  - 2: a square exists, AND it's the center of rotation
export const TETROMINOES = [
  {
    shapeName: "O",
    color: "#47fffd",  // cyan
    shapeTemplate:
    [
      [1,1],
      [1,1]
    ]
  },

  { 
    shapeName: "I",
    color: "#ffeaa7", // yellow
    shapeTemplate: [[1,2,1,1]]
  },

  {
    shapeName: "T",
    color: "#c4b1ff", // purple
    shapeTemplate:
    [
      [0,1,0],
      [1,2,1]
    ]
  },

  {
    shapeName: "L",
    color: "#ffb347", // orange
    shapeTemplate:
    [
      [0,0,1],
      [1,2,1]
    ]
  },

  {
    shapeName: "J",
    color: "#62b1ff", // blue
    shapeTemplate:
    [
      [1,0,0],
      [1,2,1]
    ]
  },

  {
    shapeName: "S",
    color: "#a8e4a0", // green
    shapeTemplate: 
    [
      [0,2,1],
      [1,1,0]
    ]
  },

  {
    shapeName: "Z",
    color: "#ff7675", // red
    shapeTemplate: 
    [
      [1,2,0],
      [0,1,1]
    ]
  }
];


  
////////////////////////////////////////////////////////////////////////////
// Canvas drawing / dimensions
////////////////////////////////////////////////////////////////////////////
const CANVAS_MARGINS = {
  TOP: 5,
  LEFT: 15,
  RIGHT: 10
};

// For drawing the game's playfield (dimensions in pixels)
export const PLAYFIELD_DIMENSIONS = {
  X: CANVAS_MARGINS.LEFT,
  Y: CANVAS_MARGINS.TOP,
  WIDTH: BLOCK_SIZE * COLS,
  HEIGHT: BLOCK_SIZE * ROWS,
};

// Margin between the playfield and the queue of next terominoes
const NEXTQUEUE_MARGIN_LEFT = 0.2 * PLAYFIELD_DIMENSIONS.WIDTH; 

// For drawing queue of upcoming tetrominoes (dimensions in pixels)
export const NEXTQUEUE_DIMENSIONS = {
  X: PLAYFIELD_DIMENSIONS.X + PLAYFIELD_DIMENSIONS.WIDTH + NEXTQUEUE_MARGIN_LEFT,
  Y: CANVAS_MARGINS.TOP + 50,
  WIDTH: BLOCK_SIZE * 4
  // HEIGHT: BLOCK_SIZE * ROWS // not being used
};

export const CANVAS_WIDTH = CANVAS_MARGINS.LEFT + CANVAS_MARGINS.RIGHT + PLAYFIELD_DIMENSIONS.WIDTH + NEXTQUEUE_DIMENSIONS.WIDTH + NEXTQUEUE_MARGIN_LEFT;

export const CANVAS_HEIGHT = PLAYFIELD_DIMENSIONS.HEIGHT + 75;

export const ASCII_EMOJIS = [
  "(╯°□°）╯︵ ┻━┻",
  "(ᵟຶ︵ ᵟຶ)",
  "(T＿T)",
  "┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻",
  "ಥ╭╮ಥ",
  ".·´¯`(>▂<)´¯`·.",
  "	( º﹃º )",
  "(ノಠ益ಠ)ノ彡┻━┻",
  "｡ﾟ･（>﹏<）･ﾟ｡",
  "(≧︿≦)",
  "‧º·(˚ ˃̣̣̥⌓˂̣̣̥ )‧º·˚",
  "(︶︹︶)"
];

