"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var Mode;
(function (Mode) {
    Mode[Mode["Floorplan"] = 0] = "Floorplan";
    Mode[Mode["Room"] = 1] = "Room";
    Mode[Mode["Furniture"] = 2] = "Furniture";
    Mode[Mode["Presentation"] = 3] = "Presentation";
})(Mode || (Mode = {}));
;
var MovableType;
(function (MovableType) {
    MovableType["Openable"] = "Openable";
    MovableType["Rectangle"] = "Rectangle";
    MovableType["Ellipse"] = "Ellipse";
    MovableType["Circle"] = "Circle";
    MovableType["L"] = "L";
    MovableType["U"] = "U";
})(MovableType || (MovableType = {}));
;
var OpenableType;
(function (OpenableType) {
    OpenableType["Left"] = "Left";
    OpenableType["Right"] = "Right";
    OpenableType["Double"] = "Double";
})(OpenableType || (OpenableType = {}));
;
var FurnitureType;
(function (FurnitureType) {
    FurnitureType[FurnitureType["Rectangle"] = 0] = "Rectangle";
    FurnitureType[FurnitureType["Circle"] = 1] = "Circle";
    FurnitureType[FurnitureType["L"] = 2] = "L";
    FurnitureType[FurnitureType["U"] = 3] = "U";
})(FurnitureType || (FurnitureType = {}));
;
;
;
class Projection {
    scale;
    p;
    drag;
    delta;
    constructor(scale, x = 0, y = 0) {
        this.scale = scale;
        this.p = { x: x, y: y };
        this.drag = false;
        this.delta = { x: 0, y: 0 };
    }
    to(q) {
        return {
            x: (q.x - this.p.x) / this.scale,
            y: (q.y - this.p.y) / this.scale
        };
    }
    ;
    from(q) {
        return {
            x: this.p.x + q.x * this.scale,
            y: this.p.y + q.y * this.scale
        };
    }
    ;
}
;
const projection = new Projection(0.1);
const floorplanProjection = new Projection(1, 50, 50);
;
const settings = {
    language: "en",
    mode: Mode.Room,
    openableType: OpenableType.Left,
    type: FurnitureType.Rectangle,
    zoomFactor: 1.05,
    minZoom: 1 / 500,
    maxZoom: 100,
    deleteDim: {
        w: 50,
        h: 50
    },
    isRemove: false,
    nodeTransSize: 50,
    nodeExtendSize: 150,
    nodeSnapDist: 100,
    furnitureRotateSize: 100,
    furnitureSnapAngle: 5,
    showEdgeLabels: false,
};
// state will lazily track changes since init or last save/load as string
let state = null;
const labels = [];
const openables = [];
const furniture = [];
