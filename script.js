class Game {
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.size = rows * cols;

		this.moves = 0;
		this.board = [];
		for (let row = 0; row < rows; row++) {
			this.board[row] = [];
			for (let col = 0; col < cols; col++) {
				this.board[row][col] = (row * rows + col + 1) % this.size;
			}
		}
	}

	getTilePosition(value) {
		for (let row = 0; row < this.rows; row++)
			for (let col = 0; col < this.cols; col++)
				if (this.board[row][col] === value)
					return [row, col];
		return null;
	}

	makeMove(row, col, incrementMoves) {
		// Find if the empty tile is adjacent to the given tile
		let [emptyRow, emptyCol] = this.getTilePosition(0);
		let deltaRow = Math.abs(emptyRow - row);
		let deltaCol = Math.abs(emptyCol - col);
		if (deltaRow + deltaCol !== 1)
			return false;

		// Swap the two tiles if it is
		let temp = this.board[row][col];
		this.board[row][col] = this.board[emptyRow][emptyCol];
		this.board[emptyRow][emptyCol] = temp;
		if (incrementMoves)
			this.moves++;
		return true;
	}

	makeRandomMove(ignoreMove) {
		let [ignoreRow, ignoreCol] = ignoreMove;
		let [emptyRow, emptyCol] = this.getTilePosition(0);
		// Locate tiles adjacent to the empty tile
		let adjacentTiles = [];
		let adjacentTilesAdd = (row, col) => (0 <= row && row < this.rows && 0 <= col && col < this.cols) && !(ignoreRow === row && ignoreCol === col) && adjacentTiles.push([row, col]);
		adjacentTilesAdd(emptyRow - 1, emptyCol);
		adjacentTilesAdd(emptyRow + 1, emptyCol);
		adjacentTilesAdd(emptyRow, emptyCol - 1);
		adjacentTilesAdd(emptyRow, emptyCol + 1);
		// Choose a random adjacent tile to make the move on
		let randomMoveIdx = Math.floor(Math.random() * adjacentTiles.length);
		let randomMove = adjacentTiles[randomMoveIdx];
		let [moveRow, moveCol] = randomMove;
		this.makeMove(moveRow, moveCol, false);
		return [emptyRow, emptyCol];
	}

	checkSolved() {
		for (let row = 0; row < this.rows; row++)
			for (let col = 0; col < this.cols; col++)
				if (this.board[row][col] !== (row * this.rows + col + 1) % this.size)
					return false;
		return true;
	}
}

/* ENTRY POINT */
let game = new Game(4, 4);
let gameStarted = false; // If the game has been started
let gameActive = false;  // If the game allows user input
let tiles = new Array(16).fill(0).map((_, tileId) => document.getElementById(tileId));

// Tile repositioning
function getTilePosition(tile, row, col) {
	return [
		row * tile.offsetWidth  + (row + 1) * 10,
		col * tile.offsetHeight + (col + 1) * 10,
	];
}

function setTilePosition(tile, row, col) {
	let [posX, posY] = getTilePosition(tile, row, col);
	tile.style.top  = posX + "px";
	tile.style.left = posY + "px";
}

function repositionTiles() {
	for (let row = 0; row < game.rows; row++) {
		for (let col = 0; col < game.cols; col++) {
			let tileIdx = game.board[row][col];
			setTilePosition(tiles[tileIdx], row, col);
		}
	}
}

repositionTiles();
window.addEventListener("resize", repositionTiles);

// Tile movement handler
let movesDisplay = document.getElementById("moves");

function display() {
	repositionTiles();
	movesDisplay.innerText = `Moves: ${game.moves}`;
}

for (let [tileValue, tile] of tiles.entries()) {
	tile.addEventListener("click", () => {
		if (gameStarted && gameActive) {
			let [tileRow, tileCol] = game.getTilePosition(tileValue);
			game.makeMove(tileRow, tileCol, true);
			display();
		}
	});
}

// Game controls handler
let controlsForm = document.getElementById("controls");
let startButton = document.querySelector("#controls > input[type=button]");

startButton.addEventListener("click", () => {
	if (gameStarted || gameActive) return;

	let lastRandomMove = [-1, -1];
	let randomMoves =
		controlsForm.difficulty.value == "Easy" ? 250
		: controlsForm.difficulty.value == "Medium" ? 500
		: controlsForm.difficulty.value == "Hard" ? 1000
		: -1;

	if (randomMoves === -1) {
		return alert("Select a difficulty");
	}

	game = new Game(4, 4);
	gameStarted = true;
	gameActive = false;

	display();

	// "for" loop with timer
	let i = 0, interval;
	interval = setInterval(() => {
		if (++i > randomMoves) {
			gameActive = true;
			return clearInterval(interval);
		}
		lastRandomMove = game.makeRandomMove(lastRandomMove);
		repositionTiles();
	}, 5);
});
