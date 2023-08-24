"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var Mode;
(function (Mode) {
    Mode[Mode["Room"] = 0] = "Room";
    Mode[Mode["Furniture"] = 1] = "Furniture";
    Mode[Mode["Presentation"] = 2] = "Presentation";
})(Mode || (Mode = {}));
;
var MovableType;
(function (MovableType) {
    MovableType[MovableType["Openable"] = 0] = "Openable";
    MovableType[MovableType["Rectangle"] = 1] = "Rectangle";
    MovableType[MovableType["Ellipse"] = 2] = "Ellipse";
    MovableType[MovableType["Circle"] = 3] = "Circle";
    MovableType[MovableType["L"] = 4] = "L";
    MovableType[MovableType["U"] = 5] = "U";
})(MovableType || (MovableType = {}));
;
var OpenableType;
(function (OpenableType) {
    OpenableType[OpenableType["Left"] = 0] = "Left";
    OpenableType[OpenableType["Right"] = 1] = "Right";
    OpenableType[OpenableType["Double"] = 2] = "Double";
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
;
const projection = {
    scale: 0.1,
    p: {
        x: 0,
        y: 0
    },
    drag: false,
    delta: {
        x: 0,
        y: 0
    },
    to: function (q) {
        return {
            x: (q.x - this.p.x) / this.scale,
            y: (q.y - this.p.y) / this.scale
        };
    },
    from: function (q) {
        return {
            x: this.p.x + q.x * this.scale,
            y: this.p.y + q.y * this.scale
        };
    }
};
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
