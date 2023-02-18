import React from "react"
import canvasHelper from './CanvasHelper';
import Pako from "pako";
import '../css/Canvas.css'

class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.canvasHelper = new canvasHelper(props.dimension || 100);
        this.canvasRef = React.createRef();

        this.clicking = false;
        this.prevPos = { x: null, y: null};
        this.color = "#000000";
        this.width = 1;

    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext('2d', {willReadFrequently: true});
        this.cellLength = this.canvasRef.current.width / (this.props.dimension || 100);
        if (this.props.array)
            this.canvasHelper.importCanvas(this.cellLength, this.ctx, Pako.inflate(new Uint8ClampedArray(this.props.array)));
    }

    // Resizing the canvas is fine, but the dimension should NOT be changed
    componentDidUpdate(prevProps) {
        if (prevProps.size !== this.props.size) {
            this.cellLength = this.canvasRef.current.width / (this.props.dimension || 100);
            if (this.props.array)
                this.canvasHelper.importCanvas(this.cellLength, this.ctx, Pako.inflate(new Uint8ClampedArray(this.props.array)));
        }
        else if (this.props.array && prevProps.array !== this.props.array)
            this.canvasHelper.importCanvas(this.cellLength, this.ctx, Pako.inflate(new Uint8ClampedArray(this.props.array)));
    }

    handleClick(e, mobile) {
        if (e.button !== 0 && !mobile)
            return;

        this.clicking = true;
        let pos = this.getMousePosition(e, mobile);
        let coords = this.canvasHelper.convertToCellUnits(this.cellLength, pos);
        this.canvasHelper.fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
        this.prevPos = {x: pos.x, y: pos.y};
    }

    handleMouseMove(e, mobile) {
        if (!this.clicking)
            return

        let pos = this.getMousePosition(e, mobile);
        let coords = this.canvasHelper.convertToCellUnits(this.cellLength, pos);

        if (this.prevPos.x === null)
        {
            this.prevPos = pos;
            this.canvasHelper.fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
            return;
        }

        let prev = this.canvasHelper.convertToCellUnits(this.cellLength, this.prevPos);
        this.prevPos = pos;

        let currX = coords.x;
        let currY = coords.y;
        let prevX = prev.x;
        let prevY = prev.y;

        let right = (currX - prevX) >= 0;
        let up = (currY - prevY) >= 0;

        // If there is a gap between mouseMove events, do a linear fill between the two known positions
        while ((currX !== prevX) || (currY !== prevY)) {
            this.canvasHelper.fillCell(this.ctx, this.cellLength, prevX, prevY, this.color, this.width);
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
        this.canvasHelper.fillCell(this.ctx, this.cellLength, coords.x, coords.y, this.color, this.width);
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
        let canvasArray = Array(4 * (this.props.dimension || 100) * (this.props.dimension || 100));
        for (let r = 0, i = 0; r < (this.props.dimension || 100) && i < canvasArray.length; r++) {
            for (let c = 0; c < (this.props.dimension || 100) && i < canvasArray.length; c++, i+= 4) {
                const pos = this.canvasHelper.convertToGridUnits(this.cellLength, {x: c, y: r});
                const imageData = this.ctx.getImageData(pos.x, pos.y, 1, 1);
                const data = imageData.data;
                canvasArray[i] = data[0];
                canvasArray[i + 1] = data[1];
                canvasArray[i + 2] = data[2];
                canvasArray[i + 3] = data[3];
            }
        }

        return Pako.deflate(new Uint8ClampedArray(canvasArray));
    }

    render() {
        if (this.props.editable)
            return (
                <div className="Canvas">
                    <canvas width={this.props.size || "500px"} height={this.props.size || "500px"} ref={this.canvasRef} 
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
                </div>
            );
        else 
            return (
                <div className="Canvas">
                    <canvas width={this.props.size || "500px"} height={this.props.size || "500px"} ref={this.canvasRef} />
                </div>
            );
    }
}


export default Canvas