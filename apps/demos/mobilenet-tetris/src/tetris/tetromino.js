import {Square} from "./square.js";


/*
Tetromino:
  - color
  - shape
  - squares: array of square objects
  - getNewTetromino (down, down/left, down/right)
*/


export function Tetromino (topLeftRow, topLeftCol, shape) {

  //console.log("****** TETROMINO CONSTRUCTOR CALLED *********");

  this.color = shape.color;
  this.shapeName = shape.shapeName;
  this.shapeTemplate = shape.shapeTemplate;

  // Generate flat array of square objects with coordinates based on 2d array shapeTemplate and top left coords
  // and set centerSquare as its own property of this tetromino!
  let centerRow;
  let centerCol;
  
  this.squares = this.shapeTemplate.map( (row, rowIndex) => {
    return row.map ( (square, colIndex) => {
      if (square > 0) { // if this is a 1 or a 2, make a square object
        let newSquare = new Square(topLeftRow + rowIndex, topLeftCol + colIndex, this.color);
        // If this is a 2, save a reference to this square object as tetromino's centerSquare property
        if (square === 2) {
          centerRow = newSquare.row; 
          centerCol = newSquare.col;
        }
        return newSquare;
      }
    }).filter(elem => elem != undefined);
  
  }).reduce( (accum, elem) => {
     return accum.concat(elem);
  }, []);
  
  // The centerSquare property is only defined for shapes with a center of rotation, so NOT for the "O" shape
  if (centerRow == undefined || centerCol == undefined) {
    this.centerSquare = undefined;
    // console.log("Setting center square to undefined; this is an O shape!");
  } else {
    this.centerSquare = new Square(centerRow, centerCol, this.ca7ffeaolor);
    // console.log("center square: " + this.centerSquare.row + ", " + this.centerSquare.col);
  }
  

  
  // Rotate -- return copy of the shape after rotation
  // direction is 1 for clockwise, -1 for counter
  this.rotate = function(direction) {

    //console.log("called rotate, direction: " + direction);

    // If no center of rotation (for the "O" shape), just return a copy of this tetromino as-is:
    if ( this.centerSquare == undefined) {
      //console.log("No center of rotation. Returning this tetromino as-is.");
      return {...this};
    }

    let rotatedSquares = this.squares.map(curSquare => {

      // console.log("center square: " + this.centerSquare.row + ", " + this.centerSquare.col);

      let origRowOffset = curSquare.row - this.centerSquare.row;
      let origColOffset = curSquare.col - this.centerSquare.col;

      // console.log("cur square: " + curSquare.row + ", " + curSquare.col);
      // console.log("offset from center: " + origRowOffset + ", " + origColOffset);

      let newRow = this.centerSquare.row + direction * origColOffset;
      let newCol = this.centerSquare.col + direction * -1 * origRowOffset;

      // console.log("rotate: (" + curSquare.row + "," + curSquare.col + ") >> (" + newRow + "," + newCol + ")");

      return new Square(newRow, newCol, this.color);
    });

    // console.log(rotatedSquares);

    return {...this, squares: rotatedSquares};

  };//end rotate()



  // Return new Tetromino object resulting from the next move:
  this.getNewTetromino = function(nextMove) {
    //console.log("called getNewTetromino: " + nextMove);

    // Set offset values based on nextMove
    let rowOffset = 1; // default for down
    let colOffset = 0; // default for down

    if (nextMove.includes("left")) {
      rowOffset = 0;
      colOffset = -1;
    } else if (nextMove.includes("right")) {
      rowOffset = 0;
      colOffset = 1;
    } else if (nextMove === "rotate-clockwise") {
      return this.rotate(1);
    } else if (nextMove === "rotate-counterclockwise") {
      return this.rotate(-1);
    }

    // If NOT rotating, update coordinates based on offset:
    let newSquares = this.squares.map( square => {
      return new Square(square.row + rowOffset, square.col + colOffset, square.color);
    });

    let newCenterSquare;
    if (this.centerSquare != undefined) {
      newCenterSquare = new Square(this.centerSquare.row + rowOffset, this.centerSquare.col + colOffset, this.centerSquare.color);
    }

    // Return new copy of Tetromino object with updated properties:
    return {...this, squares: newSquares, centerSquare: newCenterSquare};
   
  }; // end this.getNewTetromino()
  
  
} //end Tetromino constructor

