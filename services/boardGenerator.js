const sudoku = require("sudoku-gen");

function generateSudokuBoard(level) {
    const board = sudoku.getSudoku(level);
    
    return {
      initialBoard: parseSudokuString(board.puzzle),
      solvedBoard: parseSudokuString(board.solution),
    };
  }

  function parseSudokuString(sudokuString) {
    const sudokuArray = [];
    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j
        const char = sudokuString[index]
        row.push(char === '-' ? 0 : Number(char))
      }
      sudokuArray.push(row);
    }
    return sudokuArray;
  }

  module.exports = { generateSudokuBoard };
