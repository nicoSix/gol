# GOL (Game of Life)

This component, made for the _Nuit de l'Info_, is rendering in React a game of life canvas. It can varies a lot thanks to hyperparameters, like taking a picture in entry and convert it to pixels for the game of life to begin (white pixels are converted to dead cells, and other to living cells).

Unfortunately many features are implemented but not working as-is, that's too bad! But they are still accessible in the code for later :)

## Hyperparameters 

// Number of squares on width line
const INITIAL_SQUARE_NUMBER_WIDTH = 100;
// If turned on, display a grid for debugging
const DEV_MODE = false;
// Number of random points at starting
const NB_RANDOM_POINTS = 5000;
// Delay (in ms) before starting the game
const DELAY_BEFORE_STARTING_ANIMATION = 3000

## Launch the app

Just perform an ```npm install``` then ```npm start``` and have fun!