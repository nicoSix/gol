export default function SketchObject(p5) {
    // increasing squareSize makes squares smaller
    let squareSize = 0;
    let height = 0;
    let width = 0;
    let devMode = false;
    let squareGrid = [];
    let parentRendered = false;

    p5.setup = () => p5.createCanvas(width, height);

    p5.myCustomRedrawAccordingToNewPropsHandler = props => {
        if(props.dimensions.height !== height || props.dimensions.width !== width) {
            height = props.dimensions.h;
            width = props.dimensions.w;
            p5.resizeCanvas(width, height);
        }
        if(props.devMode) {
            devMode = true;
        }
        
        squareSize = props.squareSize;
        squareGrid = props.squareGrid;
        parentRendered = true;
    }

    p5.draw = () => {
        if(parentRendered && squareGrid.length) {
            p5.background(250);

            //grid is displayed on devmode only
            if(devMode) {
                p5.stroke('orange');
                p5.strokeWeight(1);
            }
            else {
                p5.strokeWeight(0);
            }

            p5.noFill();

            var stol = parseInt(width / squareSize);
            for(let i =0; i < squareSize;i++) {
                for(let j=0; j < parseInt(squareSize*(height/width));j++) {
                    if(squareGrid[i][j]['living']) {
                        if(squareGrid[i][j]["rgb"]) {
                            p5.fill(squareGrid[i][j]["rgb"]);
                        }
                        else {
                            p5.fill('#222222');
                        }
                    }
                    else p5.noFill(); 
                    p5.rect(i*stol,j*stol,stol,stol);
                }
            }
        }
    }
  };
