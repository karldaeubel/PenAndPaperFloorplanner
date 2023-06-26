/* exported canvas ctx projection settings furniture labels*/

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const Mode = {
    Room: "Room",
    Furniture: "Furniture"
};

const FurnitureType = {
    Rectangle: "Rectangle",
    Circle: "Circle",
    L: "L",
    U: "U",
};

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

const settings = {
    language: "en",
    mode: Mode.Room,
    type: FurnitureType.Rectangle,
    zoomFactor: 1.05,
    deleteDim: {
        w: 50,
        h: 50
    },
    nodeTransSize: 50,
    nodeExtendSize: 100,
    nodeSnapDist: 100,

    furnitureRotateSize: 100,
    furnitureSnapAngle: 5
};

const furniture = [
];

const labels = [
];