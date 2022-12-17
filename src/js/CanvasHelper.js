const CANVAS_DIMENSION = 100;

function fillCell(ctx, cellLength, x, y, color = "#000000", width = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellLength, y * cellLength, cellLength * width, cellLength * width);
} 

function convertToCellUnits(cellLength, pos) {
    return { x: Math.floor(pos.x / cellLength), y: Math.floor(pos.y / cellLength)};
}

// Given cell units, return the top-left coordinate of the rectangle corresponding to the location on the canvas
function convertToGridUnits(cellLength, pos) {
    return { x: pos.x * cellLength, y: pos.y * cellLength };
}

function importCanvas(cellLength, ctx, data) {
    for (let r = 0, i = 0; r < CANVAS_DIMENSION && i < data.length; r++) {
        for (let c = 0; c < CANVAS_DIMENSION && i < data.length; c++, i+=4) {
            fillCell(ctx, cellLength, c, r, `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, ${data[i + 3]})`);
        }
    }
}

export { CANVAS_DIMENSION, fillCell, convertToCellUnits, convertToGridUnits, importCanvas };