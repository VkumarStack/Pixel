class CanvasHelper {
    // Ideally make the canvas dimension an even number, preferably a power of 10
    constructor(canvasDimension) {
        this.canvasDimension = canvasDimension;
    }

    fillCell(ctx, cellLength, x, y, color = "#000000", width = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellLength, y * cellLength, cellLength * width, cellLength * width);
    } 

    convertToCellUnits(cellLength, pos) {
        return { x: Math.floor(pos.x / cellLength), y: Math.floor(pos.y / cellLength)};
    }

    convertToGridUnits(cellLength, pos) {
        return { x: pos.x * cellLength, y: pos.y * cellLength };
    }
    
    importCanvas(cellLength, ctx, data) {
        for (let r = 0, i = 0; r < this.canvasDimension && i < data.length; r++) {
            for (let c = 0; c < this.canvasDimension && i < data.length; c++, i+=4) {
                this.fillCell(ctx, cellLength, c, r, `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, ${data[i + 3]})`);
            }
        }
    }
}

export default CanvasHelper;