import React, { useEffect, useState, useRef } from 'react'
import P5Wrapper from 'react-p5-wrapper';
import './style.css';
import SketchObject from './sketch';
import { Image } from 'image-js';
import logo from './image.jpg'
import { cloneDeep } from 'lodash';

const INITIAL_SQUARE_NUMBER_WIDTH = 200;

const DEV_MODE = false;

const GOL = () => {
    const parseRgbArray = (pixelArray, width) => {
        var newArray = []
        for (var i = 0; i < pixelArray.length / width; i++) {
            newArray.push(pixelArray.slice(i*width, (i+1)*width))
        }

        return newArray;
    }

    const initGrid = async () => {
        var loaded = await Image.load(logo);
        loaded = loaded.resize({width: 60})
        const maxX = parseInt(INITIAL_SQUARE_NUMBER_WIDTH);
        const maxY = parseInt(INITIAL_SQUARE_NUMBER_WIDTH*(window.innerHeight/window.innerWidth));
        var rgbArray = parseRgbArray(loaded.getPixelsArray(), loaded.width);
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


    const handleDimensionChange = p => {
        setState({
            ...state, 
            squareGrid: initGrid(),
            dimensions: { 
                w: window.innerWidth,
                h: window.innerHeight
            },
            squareDimensions: {
                w: parseInt(INITIAL_SQUARE_NUMBER_WIDTH),
                h: parseInt(INITIAL_SQUARE_NUMBER_WIDTH*(window.innerHeight/window.innerWidth))
            }
        })
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
        var newSquareGrid = cloneDeep(state.squareGrid);

        for (let x = 0; x < newSquareGrid.length; x++) {
            for (let y = 0; y < newSquareGrid[0].length; y++) {
                var nbNeighbours = countNeighbours(x, y, [...state.squareGrid]);
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

        setState({
            ...state, 
            squareGrid: newSquareGrid
        })
    }

    const [state, setState] = useState({
        dimensions: {
            w: window.innerWidth,
            h: window.innerHeight
        },
        squareGrid: [],
        squareSize: INITIAL_SQUARE_NUMBER_WIDTH
    })

    useEffect(() => {
        // UNSTABLE (need to handle the removal of squares)
        window.addEventListener("resize", handleDimensionChange);
        
        const interval = setInterval(gameRoundHandler, 400);

        return () => {
            window.removeEventListener("resize", handleDimensionChange);
            clearInterval(interval)
        }
    })

    useEffect(() => {
        initGrid().then(grid => {
            setState({
                ...state,
                squareGrid: grid
            })
        })
    }, []);
  
    // Note : the component triggers a redraw + prop change whenever the parent component (GOF) is mounted
    return <P5Wrapper sketch={SketchObject} dimensions={state.dimensions} squareSize={state.squareSize} squareGrid={state.squareGrid} devMode={DEV_MODE}/>
}

export default GOL