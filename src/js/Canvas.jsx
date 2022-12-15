import React from "react"
import '../css/Canvas.css'

const CANVAS_DIMENSION = 100;

class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();
        this.clicking = false;
        this.prevPos = { x: null, y: null};
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext('2d');
        this.cellLength = this.canvasRef.current.width / CANVAS_DIMENSION;
    }

    handleClick(e) {
        if (e.button !== 0)
            return;

        this.clicking = true;
        let pos = this.getMousePosition(e);
        let coords = this.convertToCellUnits(pos);
        this.fillCell(coords.x, coords.y);
        this.prevPos = {x: pos.x, y: pos.y};
    }

    handleMouseMove(e) {
        if (!this.clicking)
            return
        console.log(this.prevPos);

        let pos = this.getMousePosition(e);
        let coords = this.convertToCellUnits(pos);

        if (this.prevPos.x === null)
        {
            this.prevPos = pos;
            this.fillCell(coords.x, coords.y);
            return;
        }

        let prev = this.convertToCellUnits(this.prevPos);
        this.prevPos = pos;

        let currX = coords.x;
        let currY = coords.y;
        let prevX = prev.x;
        let prevY = prev.y;

        let right = (currX - prevX) >= 0;
        let up = (currY - prevY) >= 0;

        while ((currX !== prevX) || (currY !== prevY)) {
            this.fillCell(prevX, prevY);
            if ((currX !== prevX))
            {
                if (right)
                    prevX += 1;
                else
                    prevX -= 1;
            }
            if ((currY !== prevY)) 
            {
                if (up)
                    prevY += 1;
                else
                    prevY -= 1;
            }
        }
        this.fillCell(coords.x, coords.y);
    }

    getMousePosition(e) {
        const boundRect = this.canvasRef.current.getBoundingClientRect();
        let x = (e.clientX - boundRect.left) / (boundRect.right - boundRect.left) * this.canvasRef.current.width;
        let y = (e.clientY - boundRect.top) / (boundRect.bottom - boundRect.top) * this.canvasRef.current.height;
        return {x, y};
    }

    fillCell(x, y, width = 1) {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(x * this.cellLength, y * this.cellLength, this.cellLength * width, this.cellLength * width);
    } 

    convertToCellUnits(pos) {
        return { x: Math.floor(pos.x / this.cellLength), y: Math.floor(pos.y / this.cellLength)};
    }

    render() {
        return <canvas width={"500px"} height={"500px"} ref={this.canvasRef} 
        onMouseDown={(e) => this.handleClick(e)}
        onMouseUp={(e) => { this.clicking = false; }}
        onMouseLeave={(e) => { 
            this.clicking = false; 
            this.prevPos = { x: null, y: null};
        }}
        onMouseMove={(e) => this.handleMouseMove(e)}
        ></canvas>
    }
}


export default Canvas