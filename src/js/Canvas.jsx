import React from "react"
import '../css/Canvas.css'
import { CANVAS_DIMENSION, convertToCellUnits, convertToGridUnits, fillCell, importCanvas } from './CanvasHelper';

class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();
        //
        this.canvasRef2 = React.createRef();

        this.clicking = false;
        this.prevPos = { x: null, y: null};
        this.color = "#000000";
        this.width = 1;
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext('2d', {willReadFrequently: true});

        //
        this.ctx2 = this.canvasRef2.current.getContext('2d');

        this.cellLength = this.canvasRef.current.width / CANVAS_DIMENSION;
    }

    handleClick(e, mobile) {
        if (e.button !== 0 && !mobile)
            return;

        this.clicking = true;
        let pos = this.getMousePosition(e, mobile);
        let coords = convertToCellUnits(this.cellLength, pos);
        fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
        this.prevPos = {x: pos.x, y: pos.y};
    }

    handleMouseMove(e, mobile) {
        if (!this.clicking)
            return

        let pos = this.getMousePosition(e, mobile);
        let coords = convertToCellUnits(this.cellLength, pos);

        if (this.prevPos.x === null)
        {
            this.prevPos = pos;
            fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
            return;
        }

        let prev = convertToCellUnits(this.cellLength, this.prevPos);
        this.prevPos = pos;

        let currX = coords.x;
        let currY = coords.y;
        let prevX = prev.x;
        let prevY = prev.y;

        let right = (currX - prevX) >= 0;
        let up = (currY - prevY) >= 0;

        // If there is a gap between mouseMove events, do a linear fill between the two known positions
        while ((currX !== prevX) || (currY !== prevY)) {
            fillCell(this.ctx, this.cellLength, prevX, prevY, this.color, this.width);
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
        fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
    }

    getMousePosition(e, mobile) {
        const boundRect = this.canvasRef.current.getBoundingClientRect();
        let clientX, clientY
        if (mobile) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let x = (clientX - boundRect.left) / (boundRect.right - boundRect.left) * this.canvasRef.current.width;
        let y = (clientY - boundRect.top) / (boundRect.bottom - boundRect.top) * this.canvasRef.current.height;
        return {x, y};
    }

    exportCanvas() {
        let canvasArray = Array(4 * CANVAS_DIMENSION * CANVAS_DIMENSION);
        for (let r = 0, i = 0; r < CANVAS_DIMENSION && i < canvasArray.length; r++) {
            for (let c = 0; c < CANVAS_DIMENSION && i < canvasArray.length; c++, i+= 4) {
                const pos = convertToGridUnits(this.cellLength, {x: c, y: r});
                const imageData = this.ctx.getImageData(pos.x, pos.y, 1, 1);
                const data = imageData.data;
                canvasArray[i] = data[0];
                canvasArray[i + 1] = data[1];
                canvasArray[i + 2] = data[2];
                canvasArray[i + 3] = data[3];
            }
        }
        return canvasArray;
    }

    render() {
        return (
            <div className="Canvas">
                <canvas width={"500px"} height={"500px"} ref={this.canvasRef} 
                onMouseDown={(e) => this.handleClick(e, false)}
                onMouseUp={(e) => { this.clicking = false; }}
                onMouseLeave={(e) => { 
                    this.clicking = false; 
                    this.prevPos = { x: null, y: null};
                }}
                onMouseMove={(e) => this.handleMouseMove(e, false)}
                onTouchMove={(e) => this.handleMouseMove(e, true)}
                onTouchStart={(e) => { this.handleClick(e, true) }}
                onTouchEnd={(e) => { this.clicking = false; }}/>
                <input type="color" onChange={(e) => {this.color = e.target.value }}/>
                <input type="range" name="width" id="width" min="1" max="5" defaultValue="1" onChange={(e) => {this.width = e.target.value}}/>
                <button type="button" onClick={(e) => {
                    const uint8array = new Uint8ClampedArray(this.exportCanvas());
                    importCanvas(this.cellLength, this.ctx2, uint8array);
                }}/>

                <canvas className="testCanvas" width={"500"} height={"500"} ref={this.canvasRef2}></canvas>
            </div>
        );
    }
}


export default Canvas