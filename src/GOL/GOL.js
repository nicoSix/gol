import React, { useEffect, useState, useRef } from 'react'
import P5Wrapper from 'react-p5-wrapper';
import './style.css';
import SketchObject from './sketch';

const INITIAL_SQUARE_NUMBER_WIDTH = 400;
const INITIAL_FILLINGS = [
    {x: 5, y:5},
    {x: 5, y:6},
    {x: 5, y:7},
    {x: 5, y:8},
    {x: 4, y:5}
]
const DEV_MODE = false;

const GOL = () => {
    const initGrid = () => {
        const maxX = parseInt(INITIAL_SQUARE_NUMBER_WIDTH);
        const maxY = parseInt(INITIAL_SQUARE_NUMBER_WIDTH*(window.innerHeight/window.innerWidth));

        let newSquareGrid = Array.from(
            Array(maxX), 
            () => new Array(maxY).fill(0)
        )

        INITIAL_FILLINGS.forEach(value => {
            if(value.x < maxX && value.y < maxY && value.x >= 0 && value.y >= 0) {
                newSquareGrid[value.x][value.y] = 1;
            }
            
        })

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
                        nbNeighbours += grid[x + i][y + j];
                    }
                }
            }
        }

        return nbNeighbours;
    }

    const gameRoundHandler = p => {
        var newSquareGrid = JSON.parse(JSON.stringify(state.squareGrid));

        for (let x = 0; x < newSquareGrid.length; x++) {
            for (let y = 0; y < newSquareGrid[0].length; y++) {
                var nbNeighbours = countNeighbours(x, y, [...state.squareGrid]);
                if(newSquareGrid[x][y]) {
                    if (nbNeighbours !== 2 && nbNeighbours !== 3) newSquareGrid[x][y] = 0;
                }
                else {
                    if (nbNeighbours === 3) newSquareGrid[x][y] = 1;
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
        squareGrid: initGrid(),
        squareSize: INITIAL_SQUARE_NUMBER_WIDTH
    })

    useEffect(() => {
        // UNSTABLE (need to handle the removal of squares)
        window.addEventListener("resize", handleDimensionChange);
        const interval = setInterval(gameRoundHandler, 100);

        return () => {
            window.removeEventListener("resize", handleDimensionChange);
            clearInterval(interval)
        }
    })
  
    // Note : the component triggers a redraw + prop change whenever the parent component (GOF) is mounted
    return <P5Wrapper sketch={SketchObject} dimensions={state.dimensions} squareSize={state.squareSize} squareGrid={state.squareGrid} devMode={DEV_MODE}/>
}

export default GOL