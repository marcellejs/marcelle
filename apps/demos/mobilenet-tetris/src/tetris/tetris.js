// import {p5} from "./node_modules/p5/lib/p5.min.js"
import {Tetromino} from "./tetromino.js"
import {getRandomIntInclusive} from "./helperFunctions.js";
import {TETROMINOES} from "./constants.js";
import {TICKS_UNTIL_LOCK, TETROMINO_QUEUE_LENGTH} from "./config.js";

export function Tetris (rows, cols) {

  this.fallenSquares = [];
  this.gameLoopTicks = 0;
  this.score = 0;
  this.gameOver = false;
  
  // Generate 2D array based on rows / cols, each element populated with 0s
  this.gameGrid = new Array(rows).fill(null).map(row => new Array(cols).fill(0));
  
  //console.log("****** GRID CREATED *********");

 
  // To see the grid in console:
  this.print = function(gameGrid) {
    let grid = [...gameGrid];
    let stringGrid = grid.reduce( (str, row) => {
      return str += row.join(" ") + "\n";
    }, "\n");
    //console.log(stringGrid);
  };


  // Return a new tetromino to be spawned in left/center col, with a random shape
  this.createTetromino = function() {
    // Assign a random shape to each new tetromino
    let randomShape = TETROMINOES[getRandomIntInclusive(0, TETROMINOES.length-1)];

    // Spawn location: middle or left-middle columns
    let centerPlayfieldCol = Math.floor( this.gameGrid[0].length / 2 ) - 1; // shift to left; starts at col 0
    let centerTetrominoCol = Math.floor( randomShape.shapeTemplate[0].length / 2);
      
    // If length is even, then bias the center to the left (otherwise it'll be biased to the right)
    if (randomShape.shapeTemplate[0].length % 2 === 0) {
      centerTetrominoCol--;
    }

    // The center col value is also the offset value from the tetromino's left col; subtract that from center of playfield
    // to get the column that the tetromino's left corner should start in
    let tetrominoLeftCol = centerPlayfieldCol - centerTetrominoCol;

    return new Tetromino(0, tetrominoLeftCol, randomShape);
  };


  // Generate an array of the next randomized tetrominoes
  this.createTetrominoQueue = function (numberOfTetrominoes) {

    //console.log("called createTetrominoQueue");

    return new Array(numberOfTetrominoes).fill(null).map(tetromino => {
      return this.createTetromino();
    });

 };//end createTetrominoQueue
 


  // Push new tetrominoes to the queue. Note: updates in place
  this.addToTetrominoQueue = function (numberOfTetrominoes) {

    //console.log("called addToTetrominoQueue");

    let tetrominoesToPush = new Array(numberOfTetrominoes).fill(null).map(tetromino => {
      return this.createTetromino();
    });

    // Add new tetrominoes to the end of the queue
    this.tetrominoQueue = [...this.tetrominoQueue, ...tetrominoesToPush];

  };// end addToTetrominoQueue



  // Set the next current tetromino, update queue, update fallenSquares
  // Note: updates multiple things in place!
  this.incrementTetromino = function () {
    
    //console.log("called incrementTetromino");

    // Save current tetromino's squares (if currentTetromino was already initialized
    if (this.currentTetromino) {
      this.fallenSquares = [...this.fallenSquares, ...this.currentTetromino.squares];

      //console.log("new fallenSquares:");
      //console.log([...this.fallenSquares]);
    }
  
    // Add another tetromino to the queue each time
    this.addToTetrominoQueue(1);
  
    // Return the next current tetromino (and removes it from queue)
    return this.tetrominoQueue.shift();
 
  };// end incrementTetromino



  // Initialize queue
  this.tetrominoQueue = this.createTetrominoQueue(TETROMINO_QUEUE_LENGTH);

  //console.log([...this.tetrominoQueue]);

  // Initialize current tetromino (and queue will now contain 1 less!)
  this.currentTetromino = this.incrementTetromino();

  //console.log("**** INITIALIZED FIRST TETROMINO ****");
  //console.log([...this.currentTetromino.squares]);
  //console.log({...this.currentTetromino});
 
  this.gameLoopTick = function(nextMove) {

    //console.log("called gameLoopTick with nextMove: " + nextMove);

    // Update count for how often to move the tetromino down (every X milliseconds or game ticks)
    this.gameLoopTicks++; // for now, just counting frames

    //console.log("lastTick: " + this.gameLoopTicks);  
 
    // Handle left/right/rotate on EVERY TICK
    if (nextMove && nextMove !== "hard-drop" && nextMove !== "soft-drop") {

      //console.log(nextMove);
     
      //console.log("gameGrid before updating:");
      this.print(this.gameGrid);
  
      // Save copy of original coordinates
      let prevSquares = [...this.currentTetromino.squares];
      
      // Get updated tetromino object with updated coordinates for potential move
      let updatedTetromino = this.currentTetromino.getNewTetromino(nextMove);
      //console.log("updatedTetromino obj:");
      //console.log(updatedTetromino);
      this.print(this.gameGrid);
  
      if (!this.overlapsOtherSquares(updatedTetromino, this.gameGrid, prevSquares)) {
  
        this.currentTetromino = updatedTetromino;
  
        this.gameGrid = this.updateGameGrid(prevSquares, this.currentTetromino.squares, this.gameGrid); 
  
      } 
    
      this.print(this.gameGrid);

    } // end if move is not down or undefined


    // Move block down on this frame if hard drop, soft drop, or every X ticks
    if (
         (nextMove && ( nextMove === "hard-drop" || nextMove.includes("soft-drop") ) )
         || this.gameLoopTicks % TICKS_UNTIL_LOCK === 0
    ) {

      //console.log("next move part 2: " + nextMove);
      //console.log("Time to move the block down!!! Next move: " + nextMove);

      // Save copy of original coordinates
      let prevSquares = [...this.currentTetromino.squares];
 
      // Get updated tetromino object with updated coordinates for potential move
      let updatedTetromino = this.currentTetromino.getNewTetromino("down");

      // If no collisions, run the loop at least ONCE; for hard-drop, run until collisions is detected
      let repeatLoop = true;
      let roomBelow = false;

      // Continuosly move down the current tetromino as long as there's still room below:
      while (!this.overlapsOtherSquares(updatedTetromino, this.gameGrid, prevSquares) && repeatLoop) {

        // If this is NOT toggled, trigger the ELSE condition for the condition above (no such thing as a while/else?)
        roomBelow = true;
        
        // Only run this loop once if this is not a hard drop
        if (nextMove !== "hard-drop") {
          repeatLoop = false;
        } else {
          // A hard-drop will always end in a collision, so always trigger the next tetromino to be dropped immediately afterwards
          roomBelow = false;
        }

        // Save the new coordinates (so if loop ends after this iteration, this will be the final move)
        this.currentTetromino = updatedTetromino;
      
        // Get updated tetromino object with updated coordinates for potential move
        updatedTetromino = updatedTetromino.getNewTetromino("down");
        //console.log("updatedTetromino obj:");
        //console.log(updatedTetromino);
      }
      
      // Once a collision has been detected, update the game grid to reflect the update
      // (or if no move is possible at all, 
      this.gameGrid = this.updateGameGrid(prevSquares, this.currentTetromino.squares, this.gameGrid); 

     
      // Otherwise if the current tetromino has landed (and fits on the screen), drop the next one!
      if (!roomBelow) {
       
        // Drop the next tetromino
        this.currentTetromino = this.incrementTetromino();
   
        //console.log(this.currentTetromino);
        this.print(this.gameGrid); 

        // Immediately check if the new tetromino overlaps any existing squares; if so, game over!
        if ( this.overlapsOtherSquares(this.currentTetromino, this.gameGrid) ) {
          //console.log("new tetromino overlaps; game over!");
          this.gameOver = true;
        } else {
          // Otherwise if the new Tetromino DOES fit, immediately update the gameGrid
          this.gameGrid = this.updateGameGrid(this.currentTetromino.squares, this.currentTetromino.squares, this.gameGrid); 
          //console.log("Updated grid upon creation of next tetromino:");
          this.print(this.gameGrid);
        }

 
        // Check if a row has been completed
        let completedRows = this.getCompletedRows(this.gameGrid);
        
        if (completedRows.length > 0) {
          // Update fallenSquares to remove completed rows, shift down other rows as needed
          let prevSquares = [...this.fallenSquares];
          this.fallenSquares = this.clearAndUpdateSquares(completedRows, this.fallenSquares);
          this.gameGrid = this.updateGameGrid(prevSquares, this.fallenSquares, this.gameGrid);

          // Update score: for now, just the number of cleared rows:
          this.score += completedRows.length;
        }


      }// end if no room below
    }//end if next move is down or lastTickTimestamp..


    //console.log("gameGrid after updating:");
    this.print(this.gameGrid);

    // Return for game state: squares array (previous and current), score number, and gameOver boolean
    return {
            score: this.score,
            squares: [...this.fallenSquares, ...this.currentTetromino.squares],
            gameOver: this.gameOver,
            tetrominoQueue: this.tetrominoQueue
          };
  }; 



  // Return true if any of current tetromino's squares lie on top of occupied squares of the gameGrid
  this.overlapsOtherSquares = function (currentTetromino, gameGrid, prevSquares) {

    let prevCoords = [];

    // If prevSquares argument is given,
    if (prevSquares != undefined) {
      // Keep an array of coordinates to ignore for collisions
      for (let prevSquare of prevSquares) {
        prevCoords.push(prevSquare.row + "-" + prevSquare.col); 
      }
    }

    // For each updated square, there's a collision if the row or col is off the grid,
    // OR if it overlaps an existing square on the grid (excluding previous coords of the current tetromino)
     for (let square of currentTetromino.squares) {
      
      if (!gameGrid[square.row] || ( gameGrid[square.row][square.col] !== 0 && !prevCoords.includes(square.row+"-"+square.col) )  ) {
        //console.log("square at " + square.row + ", " + square.col + "has a collision!!!");
        return true;
      }
    }

    // Otherwise if all squares are on the screen, return false
    //console.log("All squares fit on screen");
    return false;

  };


  // Return updated game grid after switching squares on/off based on prev and next coords
  // TODO: update based on completed rows too, if any
  // TODO: pass in nextMove param ???
  this.updateGameGrid = function(prevSquares, newSquares, gameGrid) {
    //console.log("called updateGameGrid");

    //console.log("prev quesres:");
    //console.log(prevSquares);
    //console.log("new sq:");
    //console.log(newSquares);

    // Modify a copy of previous gameGrid, return new array instead of mutating
    let newGameGrid = [...gameGrid];

    // Switch off previous coordinates for each square:
    for (let prevSquare of prevSquares) {
      // Only switch off previous position if this tetromino is already on the screen
      if (prevSquare.row >= 0) {
        newGameGrid[prevSquare.row][prevSquare.col] = 0;
      }

    } 

    // Switch on new coordinates for each square:
    for (let newSquare of newSquares) {
      newGameGrid[newSquare.row][newSquare.col] = 1;
    }

    return newGameGrid;

  }; // end updateGameGrid()


  // PURE FUNCTION -- given a gameGrid, return array of row indexes that have been completed
  this.getCompletedRows = function (gameGrid) {
  
    //console.log("called getCompletedRows");
  
    return gameGrid.map ( (row, index) => {
      let rowSum = row.reduce( (square,sum) => sum + square);
       
      if (rowSum === row.length) {
        return index;
      }
    }).filter(row => row != undefined); 
  
  }
 
  
  // Remove and shift down squares as needed after rows have been completed
  this.clearAndUpdateSquares = function (completedRows, fallenSquares) {
  
    //console.log("called clearAndUpdateSquares");
  
    // Filter fallenSquares array to remove any that belonged to any of completedRows,
    let remainingSquares = fallenSquares.filter(square => completedRows.indexOf(square.row) === -1 );
  
    //console.log("After filtering clear rows:");
    //console.log(remainingSquares); 


    // Shift each remaining square's row down X times, where X is the number of cleared rows below it
    let updatedFallenSquares = remainingSquares.map(square => {

      let numClearedRowsBelow = completedRows.filter(rowIndex => rowIndex > square.row).length;
      return {...square, row: square.row + numClearedRowsBelow};

    });


    //console.log("after moving squares down:");
    //console.log(updatedFallenSquares);

    return updatedFallenSquares;
 
  }
  
}; // end Tetris() constructor

