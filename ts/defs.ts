const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

enum Mode {
    Floorplan,
    Room,
    Furniture,
    Presentation,
};

enum MovableType {
    Openable = "Openable",
    Rectangle = "Rectangle",
    Ellipse = "Ellipse",
    Circle = "Circle",
    L = "L",
    U = "U",
};

enum OpenableType {
    Left = "Left",
    Right = "Right",
    Double = "Double",
};

enum FurnitureType {
    Rectangle,
    Circle,
    L,
    U,
};

interface Point {
    x: number,
    y: number,
};
interface Dim {
    w: number,
    h: number,
};

enum Direction {
    Up,
    Down,
    Right,
    Left,
}

class Projection {
    scale: number;
    p: Point;
    drag: boolean;
    delta: Point;

    constructor(scale: number, x: number = 0, y: number = 0) {
        this.scale = scale;
        this.p = { x: x, y: y };
        this.drag = false;
        this.delta = { x: 0, y: 0 };
    }
    to(q: Point): Point {
        return {
            x: (q.x - this.p.x) / this.scale,
            y: (q.y - this.p.y) / this.scale
        };
    };
    from(q: Point): Point {
        return {
            x: this.p.x + q.x * this.scale,
            y: this.p.y + q.y * this.scale
        };
    };
};

const projection = new Projection(0.1);
const floorplanProjection = new Projection(1, 50, 50);

interface Settings {
    language: string,
    mode: Mode,
    openableType: OpenableType,
    type: FurnitureType,
    readonly zoomFactor: number,
    readonly minZoom: number,
    readonly maxZoom: number,
    readonly deleteDim: Dim,
    isRemove: boolean,

    nodeTransSize: number,
    nodeExtendSize: number,
    nodeSnapDist: number,

    readonly furnitureRotateSize: number,
    readonly furnitureSnapAngle: number,

    showEdgeLabels: boolean,
    showRoomSize: boolean,
};

const settings: Settings = {
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
    showRoomSize: false,
};

function getCurrProjection() {
    return settings.mode === Mode.Floorplan ? floorplanProjection : projection;
}

type optionalPoint = { x: optionalNumber, y: optionalNumber };
type optionalString = string | null;
type optionalNumber = number | null;

// state will lazily track changes since init or last save/load as string
let state: optionalString = null;

const labels: Rectangle[] = [];

const openables: Openable[] = [];

const furniture: (Circle | Ellipse | Rectangle)[] = [];
