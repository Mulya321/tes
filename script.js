// Initiate CSS Grid animation tool
const grid = document.querySelector(".grid");
const { forceGridAnimation } = animateCSSGrid.wrapGrid(grid);

// Get all the tiles and the empty tile
const tiles = Array.from(document.querySelectorAll(".tile"));
const emptyTile = document.querySelector(".tile--empty");

// Get congratulations heading
const heading = document.querySelector(".heading");

// A key / value store of what areas to "unlock"
const areaKeys = {
	A: ["B", "D"],
	B: ["A", "C", "E"],
	C: ["B", "F"],
	D: ["A", "E", "G"],
	E: ["B", "D", "F", "H"],
	F: ["C", "E", "I"],
	G: ["D", "H"],
	H: ["E", "G", "I"],
	I: ["F", "H"]



};

// Add click listener to all tiles
tiles.map(tile => {
	tile.addEventListener("click", event => {
		// Grab the grid area set on the clicked tile and empty tile
		const tileArea = tile.style.getPropertyValue("--area");
		const emptyTileArea = emptyTile.style.getPropertyValue("--area");

		// Swap the empty tile with the clicked tile
		emptyTile.style.setProperty("--area", tileArea);
		tile.style.setProperty("--area", emptyTileArea);

		// Animate the tiles
		forceGridAnimation();

		// Unlock and lock tiles
		unlockTiles(tileArea);
	});
});

// Unlock or lock tiles based on empty tile position
const unlockTiles = currentTileArea => {
	
	// Cycle through all the tiles and check which should be disabled and enabled
	tiles.map(tile => {
		const tileArea = tile.style.getPropertyValue("--area");

		// Check if that areaKey has the tiles area in it's values
		// .trim() is needed because the animation lib formats the styles attribute
		if (areaKeys[currentTileArea.trim()].includes(tileArea.trim())) {
			tile.disabled = false;
		} else {
			tile.disabled = true;
		}
	});

	// Check if the tiles are in the right order
	isComplete(tiles);
};


const isComplete = tiles => {
	
	// Get all the current tile area values
	const currentTilesString = tiles
		.map(tile => tile.style.getPropertyValue("--area").trim())
		.toString();

	// Compare the current tiles with the areaKeys keys
	if (currentTilesString == Object.keys(areaKeys).toString()) {
		heading.children[1].innerHTML = "Kamu menang!";
		heading.style = `
			animation: popIn .3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		`;
	}
};


// Inversion calculator
const inversionCount = array => {
	
	// Using the reduce function to run through all items in the array
	// Each item in the array is checked against everything before it
	// This will return a new array with each intance of an item appearing before it's original predecessor
	return array.reduce((accumulator, current, index, array) => {
		return array
			.slice(index)
			.filter(item => {
				return item < current;
			})
			.map(item => {
				return [current, item];
			})
			.concat(accumulator);
	}, []).length;
};


// Randomise tiles
const shuffledKeys = keys => Object.keys(keys).sort(() => .5 - Math.random());

setTimeout(() => {

	// Begin with our in order area keys
	let startingAreas = Object.keys(areaKeys);
		
	// Use the inversion function to check if the keys will be solveable or not shuffled
	// Shuffle the keys until they are solvable
	while (inversionCount(startingAreas) % 2 == 1 || inversionCount(startingAreas) == 0) {
		startingAreas = shuffledKeys(areaKeys);
	}	

	// Apply shuffled areas
	tiles.map((tile, index) => {
		tile.style.setProperty("--area", startingAreas[index]);
	});

	// Initial shuffle animation
	forceGridAnimation();

	// Unlock and lock tiles
	unlockTiles(emptyTile.style.getPropertyValue("--area"));
}, 2000);



const defaultSettings = {
	selector: ".tree",
	size: {
		width: window.innerWidth,
		height: window.innerHeight
	},
	levels: 4,
	leaves: {
		count: randomInt(2, 6),
		range: randomInt(45, 75),
		widthRatio: random(0.15, 0.3),
		heightRatio: 1
	},
	height: {
		start: window.innerHeight / random(3.5, 4.5),
		multiplier: random(0.9, 1)
	},
	lineWidth: {
		start: randomInt(10, 15),
		multiplier: 0.85
	},
	angle: {
		start: 0,
		delta: randomInt(15, 20)
	},
	color: {
		start: {
			h: randomInt(175, 380),
			s: randomInt(30, 37),
			l: randomInt(45, 57)
		},
		delta: {
			h: randomInt(2, 5),
			s: random(2, 3.5),
			l: random(2, 3)
		}
	}
};

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Tree {
	canvas;
	context;

	constructor(settings) {
		this.props = Object.assign(defaultSettings, settings);

		this.setCanvas();
		this.setContext();
		this.init();
	}

	setCanvas(selector) {
		this.canvas = document.querySelector(
			selector ? selector : this.props.selector
		);
		this.canvas.width = this.props.size.width;
		this.canvas.height = this.props.size.height;
	}

	getCanvas() {
		return this.canvas;
	}

	setContext() {
		this.context = this.canvas.getContext("2d");
	}

	getContext() {
		return this.context;
	}

	init() {
		this.context.fillStyle = `
			hsl(${this.props.color.start.h - this.props.color.delta.h}, 
			${this.props.color.start.s - 3 * this.props.color.delta.s}%, 
			${this.props.color.start.l - 3 * this.props.color.delta.l}%)`;
		this.context.fillRect(0, 0, this.props.size.width, this.props.size.height);

		this.draw(
			0, // i
			this.props.size.width / 2, // x
			this.props.size.height, // y
			this.props.height.start,
			this.props.angle.start,
			this.props.lineWidth.start,
			this.props.color.start
		);
	}

	draw(i, x, y, height, angle, lineWidth, color) {
		this.context.lineWidth = lineWidth;

		this.context.beginPath();
		this.context.save();

		// Set the current color for
		this.context.strokeStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
		this.context.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

		this.context.translate(x, y);
		this.context.rotate((angle * Math.PI) / 180);
		this.context.moveTo(0, 0);
		this.context.lineTo(0, -height);
		this.context.stroke();

		// Calculating leaf-specific variables
		let angleStep = (2 * this.props.leaves.range) / (this.props.leaves.count - 1);
		const leafHeight = height * this.props.leaves.heightRatio;
		const leafWidth = height * this.props.leaves.widthRatio;

		for (let j = 0; j < this.props.leaves.count; j++) {
			const rotation = -this.props.leaves.range + j * angleStep;

			// Save the coordinates for later wink wink because why make the math more complicated
			this.context.save();
			// We want to draw the leaf on top of the line
			this.context.translate(0, -height);

			// rotate around the start point of the line
			this.context.rotate((rotation * Math.PI) / 180);

			this.context.beginPath();
			this.context.bezierCurveTo(0, 0, leafWidth, -leafHeight / 2, 0, -leafHeight);
			this.context.bezierCurveTo(
				0,
				-leafHeight,
				-leafWidth,
				-leafHeight / 2,
				0,
				0
			);
			this.context.fill();
			this.context.closePath();
			// Restore the coordinates back to the saved point
			this.context.restore();
		}

		if (i > this.props.levels) {
			this.context.restore();
			return;
		}

		const newColor = {
			h: (color.h += this.props.color.delta.h),
			s: (color.s += this.props.color.delta.s),
			l: (color.l += this.props.color.delta.l)
		};

		//todo: use the split var
		// for (let j = 0; j < this.props.splits; j++) {}

		this.draw(
			i + 1,
			0,
			-height,
			height * this.props.height.multiplier,
			angle + this.props.angle.delta,
			lineWidth * this.props.lineWidth.multiplier,
			newColor
		);
		this.draw(
			i + 1,
			0,
			-height,
			height * this.props.height.multiplier,
			angle - this.props.angle.delta,
			lineWidth * this.props.lineWidth.multiplier,
			newColor
		);

		this.context.restore();
	}
}

const tree = new Tree();