const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const Mode = {
    Room: "Room",
    Furniture: "Furniture",
};

const MovableType = {
    Openable: "Openable",
    Rectangle: "Rectangle",
    Ellipse: "Ellipse",
    Circle: "Circle",
    L: "L",
    U: "U",
};

const OpenableType = {
    Left: "Left",
    Right: "Right",
    Double: "Double",
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
    furnitureSnapAngle: 5
};

// state will lazily track changes since init or last save/load as string
let state = null;

const labels = [
];

const openables = [
];

const furniture = [
];