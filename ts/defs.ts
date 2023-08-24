const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

enum Mode {
    Room,
    Furniture,
    Presentation,
};

enum MovableType {
    Openable,
    Rectangle,
    Ellipse,
    Circle,
    L,
    U,
};

enum OpenableType {
    Left,
    Right,
    Double,
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

interface Projection {
    scale: number,
    p: Point,
    drag: boolean,
    delta: Point,
    readonly to: (q: Point) => Point,
    readonly from: (q: Point) => Point,
};
const projection: Projection = {
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

interface Settings {
    language: string,
    mode: Mode,
    openableType: OpenableType,
    type: FurnitureType,
    readonly zoomFactor: number,
    readonly minZoom: number,
    readonly maxZoom: number,
    readonly deleteDim: Dim,
    nodeTransSize: number,
    nodeExtendSize: number,
    nodeSnapDist: number,

    readonly furnitureRotateSize: number,
    readonly furnitureSnapAngle: number,

    showEdgeLabels: boolean,
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
    nodeTransSize: 50,
    nodeExtendSize: 150,
    nodeSnapDist: 100,

    furnitureRotateSize: 100,
    furnitureSnapAngle: 5,

    showEdgeLabels: false,
};

type optionalPoint = { x: optionalNumber, y: optionalNumber };
type optionalString = string | null;
type optionalNumber = number | null;

// state will lazily track changes since init or last save/load as string
let state: optionalString = null;

const labels: Rectangle[] = [];

const openables: Openable[] = [];

const furniture: (Circle | Ellipse | Rectangle)[] = [];
