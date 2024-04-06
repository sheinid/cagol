const COLS = 64;
const ROWS = COLS;

type State = number;
type Board = State[][];

function initializeBoard(): Board {
  const board: Board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 0)
  );

  return board;
}

const stateColors = ["#323232", "#3178C6", "#E6E6E6"];

const canvasId = "canvas";

const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
if (canvas === null) {
  throw new Error(`Canvas not found ${canvasId}`);
}

const width = 800;
const height = 800;

const CELL_WIDTH = width / COLS;
const CELL_HEIGHT = height / ROWS;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");
if (ctx === null) {
  throw new Error(`Could not get 2d context`);
}

const nextId = "next";
const next = document.getElementById(nextId) as HTMLButtonElement;
if (next == null) {
  throw new Error(`Could not get next button ${nextId}`);
}

const playId = "play";
const play = document.getElementById(playId) as HTMLButtonElement;
if (play == null) {
  throw new Error(`Could not get play button ${playId}`);
}

const clearId = "clear";
const clear = document.getElementById(clearId) as HTMLButtonElement;
if (clear == null) {
  throw new Error(`Could not get clear button ${clearId}`);
}

let currentBoard = initializeBoard();
let nextBoard = initializeBoard();

// Wrap the board around
function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function countNeighbors(
  board: Board,
  neighbors: number[],
  row: number,
  col: number
) {
  neighbors.fill(0);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr !== 0 || dc !== 0) {
        const r = mod(row + dr, ROWS);
        const c = mod(col + dc, COLS);

        neighbors[board[r][c]]++;
      }
    }
  }
}

// Tried to implement the transitions table
// const GameOfLifeTable = [
//   [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 1, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//   ],
//   [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 1, 0, 0, 0, 0, 0],
//     [0, 0, 1, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//   ],
// ];

function computeNextBoard(states: number, current: Board, next: Board) {
  const DEAD = 0;
  const ALIVE = 1;
  const neighbors = new Array(states).fill(0);
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      countNeighbors(current, neighbors, i, j);
      // next[i][j] =
      // GameOfLifeTable[current[i][j]][neighbors[DEAD]][neighbors[ALIVE]];
      switch (current[i][j]) {
        case DEAD:
          if (neighbors[ALIVE] == 3) {
            next[i][j] = ALIVE;
          } else {
            next[i][j] = DEAD;
          }
          break;
        case ALIVE:
          if (neighbors[ALIVE] == 2 || neighbors[ALIVE] == 3) {
            next[i][j] = ALIVE;
          } else {
            next[i][j] = DEAD;
          }
          break;
      }
    }
  }
}

function clearBoard(ctx: CanvasRenderingContext2D, board: Board) {
  ctx.fillStyle = "#323232";

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      board[i][j] = 0;
    }
  }
}

function update(ctx: CanvasRenderingContext2D, board: Board) {
  ctx.fillStyle = "#323232";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#3178C6";
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const x = j * CELL_WIDTH;
      const y = i * CELL_HEIGHT;
      ctx.fillStyle = stateColors[board[i][j]];
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    }
  }
}

canvas.addEventListener("click", (e) => {
  const pos_col = Math.floor(e.offsetX / CELL_WIDTH);
  const pos_row = Math.floor(e.offsetY / CELL_HEIGHT);

  const state = document.getElementsByName(
    "state"
  ) as NodeListOf<HTMLInputElement>;
  for (let i = 0; i < state.length; i++) {
    if (state[i].checked) {
      currentBoard[pos_row][pos_col] = i;
      update(ctx, currentBoard);
      return;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons != 1) return;
  const pos_col = Math.floor(e.offsetX / CELL_WIDTH);
  const pos_row = Math.floor(e.offsetY / CELL_HEIGHT);

  const state = document.getElementsByName(
    "state"
  ) as NodeListOf<HTMLInputElement>;
  for (let i = 0; i < state.length; i++) {
    if (state[i].checked) {
      currentBoard[pos_row][pos_col] = i;
      update(ctx, currentBoard);
      return;
    }
  }
});

next.addEventListener("click", () => {
  computeNextBoard(2, currentBoard, nextBoard);
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  update(ctx, currentBoard);
});

let interval: number | null = null;

play.addEventListener("click", () => {
  if (interval == null) {
    interval = setInterval(() => {
      computeNextBoard(2, currentBoard, nextBoard);
      [currentBoard, nextBoard] = [nextBoard, currentBoard];
      update(ctx, currentBoard);
    }, 50);
  } else {
    clearInterval(interval);
    interval = null;
  }
  play.textContent = interval == null ? "Play" : "Pause";
});

play.textContent = interval == null ? "Play" : "Pause";

clear.addEventListener("click", () => {
  clearBoard(ctx, currentBoard);
  update(ctx, currentBoard);
});

update(ctx, currentBoard);
