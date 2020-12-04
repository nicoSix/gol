import React, { useEffect, useState, useRef } from 'react'
import P5Wrapper from 'react-p5-wrapper';
import './style.css';
import SketchObject from './sketch';
import { Image } from 'image-js';
import logo from './logo.jpg'
import { cloneDeep } from 'lodash';

// Number of squares on width line
const INITIAL_SQUARE_NUMBER_WIDTH = 100;
// If turned on, display a grid for debugging
const DEV_MODE = false;
// Number of random points at starting
const NB_RANDOM_POINTS = 5000;
// Delay (in ms) before starting the game
const DELAY_BEFORE_STARTING_ANIMATION = 3000

/**
 * GOL: Game of Life component
 * The GOL component can be instanciated in any React app as a loading screen and be
 * customized a lot!
 */
const GOL = () => {
    /**
     * transposeArray: transpose a 2D array like a matrix
     * @param {Array} array 
     */
    const transposeArray = (array) => {
        var newArray = [];
        for(var i = 0; i < array.length; i++){
            newArray.push([]);
        };
    
        for(var i = 0; i < array.length; i++){
            for(var j = 0; j < array.length; j++){
                newArray[j].push(array[i][j]);
            };
        };
    
        return newArray;
    }

    /**
     * parseRgbArray: parse an 1D-array into a 2D-array knowing the dimensions
     * @param {Array} pixelArray 
     * @param {int} width 
     */
    const parseRgbArray = (pixelArray, width) => {
        var newArray = []
        for (var i = 0; i < pixelArray.length / width; i++) {
            newArray.push(pixelArray.slice(i*width, (i+1)*width))
        }

        return transposeArray(newArray);
    }

    /**
     * getRandomInt: generates a random int in a defined interval
     * @param {int} max 
     */
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    
    /**
     * addRandomPoints: add a defined amount of random points before starting the game
     * @param {3D} grid 3-dimentional grid (width, height, json)
     * @param {int} maxX 
     * @param {int} maxY 
     */
    const addRandomPoints = (grid, maxX, maxY) => {
        for (var i = 0; i < NB_RANDOM_POINTS; i++) {
            grid[getRandomInt(maxX)][getRandomInt(maxY)] = {
                living: true,
                rgb: null
            }
        }

        return grid;
    }

    /**
     * initGrid: initializes the grid by loading our logo as pixels and random points
     */
    const initGrid = async () => {
        var loaded = await Image.load(logo);
        loaded = loaded.resize({width: 60})
        const maxX = INITIAL_SQUARE_NUMBER_WIDTH;
        const maxY = parseInt(INITIAL_SQUARE_NUMBER_WIDTH*(window.innerHeight/window.innerWidth));
        // Image is converted to a 1D array of RGB pixels
        const rgbArray = parseRgbArray(loaded.getPixelsArray(), loaded.width);
        var widthRgbArray = rgbArray.length;
        var heightRgbArray = rgbArray[0].length;
        var xStartImage = parseInt((maxX/2) - (widthRgbArray/2))
        var yStartImage = parseInt((maxY/2) - (heightRgbArray/2))


        let newSquareGrid = Array.from(
            Array(maxX), 
            () => new Array(maxY).fill({
                living: false,
                rgb: null
            })
        )

        newSquareGrid = addRandomPoints(newSquareGrid, maxX, maxY);

        for(var i = 0; i < widthRgbArray; i++) {
            for(var j = 0; j < heightRgbArray; j++) {
                // White pixel filtering
                if((rgbArray[i][j][0] + rgbArray[i][j][1] + rgbArray[i][j][2]) < 700)
                    newSquareGrid[xStartImage + i][yStartImage + j] = {
                        living: true,
                        rgb: rgbArray[i][j]
                    }
            }
        }

        return newSquareGrid;
    }


    /**
     * handleDimensionChange: handles a resize of width or height of the window
     */
    const handleDimensionChange = () => {
        setState({
            ...state, 
            dimensions: { 
                w: window.innerWidth,
                h: window.innerHeight
            },
            squareDimensions: {
                w: parseInt(INITIAL_SQUARE_NUMBER_WIDTH),
                h: parseInt(INITIAL_SQUARE_NUMBER_WIDTH*(window.innerHeight/window.innerWidth))
            }
        })
        
        setSquareGrid(initGrid())
    }

    const countNeighbours = (x, y, grid) => {
        var nbNeighbours = 0;
        for(let i = -1; i <= 1; i++) {
            for(let j = -1; j <= 1; j++) {
                if(i !== 0 || j !== 0) {
                    if((x + i > 0) && (y + j > 0) && (x + i < grid.length) && (y + j < grid[0].length)) {
                        nbNeighbours += (grid[x + i][y + j].living ? 1 : 0);
                    }
                }
            }
        }

        return nbNeighbours;
    }

    const gameRoundHandler = p => {
        if(!staticDisplay) {
            var newSquareGrid = cloneDeep(squareGrid);

            for (let x = 0; x < newSquareGrid.length; x++) {
                for (let y = 0; y < newSquareGrid[0].length; y++) {
                    var nbNeighbours = countNeighbours(x, y, [...squareGrid]);
                    if(newSquareGrid[x][y].living) {
                        if (nbNeighbours !== 2 && nbNeighbours !== 3) newSquareGrid[x][y] = {
                            ...newSquareGrid[x][y],
                            living: false,
                        };
                    }
                    else {
                        if (nbNeighbours === 3) newSquareGrid[x][y] = {
                            living: true,
                        };
                    }
                }
            }

            setSquareGrid(newSquareGrid);
        }
    }

    const [state, setState] = useState({
        dimensions: {
            w: window.innerWidth,
            h: window.innerHeight
        },
        squareSize: INITIAL_SQUARE_NUMBER_WIDTH
    })

    const [staticDisplay, setStaticDisplay] = useState(true);
    const [doTheDraw, setDoTheDraw] = useState(true);
    const [squareGrid, setSquareGrid] = useState([])
    /**
     * Rendering useEffect: called at each render
     * Responsible of catching window resizing through listeners and set refresh intervals
     */
    useEffect(() => {
        //Implemented but not working as-is
        //window.addEventListener("resize", handleDimensionChange);
        const interval = setInterval(gameRoundHandler, 100);

        return () => {
            //window.removeEventListener("resize", handleDimensionChange);
            clearInterval(interval)
        }
    })

    /**
     * clickHandler: supposed to get clicks from the user to generate cells
     * @param {event} p 
     */
    const clickHandler = (p) => {
        try {
            console.log(squareGrid)
            const x = parseInt((p.clientX / state.dimensions.w)*200)
            const y = parseInt((p.clientY / state.dimensions.h)*200)
            var newSquareGrid = JSON.parse(JSON.stringify(squareGrid));
            newSquareGrid[x][y] = {
                ...newSquareGrid[x][y],
                living: true
            }
            setSquareGrid(newSquareGrid); 
        }
        catch(e) {
            console.log(e)
        }
    }

    /**
     * handleDisplayComponent: can turn off-on the drawing
     */
    const handleDisplayComponent = () => {
        if(doTheDraw) {
            setDoTheDraw(false);
        }
        else {
            setDoTheDraw(false);
            setSquareGrid(initGrid());
        }
    }

    /**
     * Constructor useEffect: acts as a constructor for the component
     * Initializes the grid, and set the on-screen time of the logo before destructuring
     * into the game of life.
     */
    useEffect(() => {
        //Implemented but not working as-is
        //window.addEventListener("click", clickHandler);

        initGrid().then(grid => {
            setSquareGrid(grid);
        })

        setTimeout(() => {
            setStaticDisplay(false);
        }, DELAY_BEFORE_STARTING_ANIMATION)

        // Can stop the drawing to save resources
        //setTimeout(handleDisplayComponent, 5000);

    }, []);
  
    // Note : the component triggers a redraw + prop change whenever the parent component (GOF) is mounted
    return <P5Wrapper sketch={SketchObject} dimensions={state.dimensions} squareSize={state.squareSize} squareGrid={squareGrid} devMode={DEV_MODE} doTheDraw={doTheDraw}/>
}

export default GOL