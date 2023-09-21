type FloorplanImageJSON = { image: string, distance: number, node1: CornerJSON, node2: CornerJSON };
interface FloorplanImage {
    image: HTMLImageElement | null,
    distance: number,
    node1: CornerNode,
    node2: CornerNode,
    readonly nodeSize: number,

    reset: () => void,

    handleClick: (e: Point) => boolean,
    handleMove: (e: Point) => boolean,
    handleUnclick: () => void,

    draw: () => void,
    drawEdge: () => void,
    drawNodes: () => void,

    toJSON: () => FloorplanImageJSON | {},
}

const floorplanImage: FloorplanImage = {
    image: null,
    distance: 1000,
    node1: new CornerNode(0, 0, -20),
    node2: new CornerNode(1, 1000, -20),
    nodeSize: 15,

    reset: function () {
        this.image = null;
        this.node1 = new CornerNode(0, 0, -20);
        this.node2 = new CornerNode(1, this.distance, -20);
    },

    // e, the click position; e is in screen space
    handleClick: function (e: Point): boolean {
        if (this.image === null || settings.mode !== Mode.Floorplan) {
            return false;
        }
        let selected = false;
        const clickPos = floorplanProjection.to(e);

        const dist1 = distance(clickPos, this.node1.p);
        const dist2 = distance(clickPos, this.node2.p);

        const node = dist1 <= dist2 ? this.node1 : this.node2;
        const dist = dist1 <= dist2 ? dist1 : dist2;

        if (dist <= this.nodeSize) {
            selected = true;
            node.translate = true;
            node.delta.x = e.x;
            node.delta.y = e.y;
        }
        return selected;
    },
    handleMove: function (e: Point): boolean {
        if (this.image === null || settings.mode !== Mode.Floorplan) {
            return false;
        }
        let changed = false;
        for (const node of [this.node1, this.node2]) {
            if (node.translate) {
                changed = true;

                node.p.x = node.p.x + (e.x - node.delta.x) / floorplanProjection.scale;
                node.p.y = node.p.y + (e.y - node.delta.y) / floorplanProjection.scale;

                node.delta.x = e.x;
                node.delta.y = e.y;
            }
        }
        return changed;
    },
    handleUnclick: function () {
        for (const node of [this.node1, this.node2]) {
            node.remove = false;
            node.translate = false;
            node.extend = false;
            node.snap = { x: null, y: null, edge: null, pos: null };
            node.delta = { x: 0, y: 0 };
        }
    },
    draw: function () {
        if (this.image !== null) {
            const currentScale = settings.mode === Mode.Floorplan ? 1 : this.distance / distance(this.node1.p, this.node2.p);
            ctx.drawImage(this.image, 0, 0, this.image.width * currentScale, this.image.height * currentScale);
            if (settings.mode === Mode.Floorplan) {
                this.drawEdge();
                this.drawNodes();
            }
        }
    },
    drawEdge: function () {
        ctx.beginPath();
        ctx.moveTo(this.node1.p.x, this.node1.p.y);
        ctx.lineTo(this.node2.p.x, this.node2.p.y);
        ctx.stroke();

        setFontSize(20, false);

        ctx.save();
        const c = {
            x: (this.node1.p.x + this.node2.p.x) / 2,
            y: (this.node1.p.y + this.node2.p.y) / 2,
        };
        ctx.translate(c.x, c.y);
        const angle = Math.atan2(this.node2.p.y - this.node1.p.y, this.node2.p.x - this.node1.p.x);

        ctx.rotate(angle < -Math.PI / 2 || angle > Math.PI / 2 ? angle + Math.PI : angle);
        ctx.fillText(String(this.distance), 0, 0, distance(this.node1.p, this.node2.p));

        ctx.restore();
    },
    drawNodes: function () {
        const angle = Math.atan2(this.node1.p.y - this.node2.p.y, this.node1.p.x - this.node2.p.x);

        ctx.beginPath();
        ctx.arc(this.node1.p.x, this.node1.p.y, this.nodeSize, angle - Math.PI / 2, angle + Math.PI / 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.node2.p.x, this.node2.p.y, this.nodeSize, angle + Math.PI / 2, angle - Math.PI / 2);
        ctx.fill();

        restoreDefaultContext();
    },
    toJSON: function (): FloorplanImageJSON | {} {
        if (this.image !== null) {
            const tmpCanvas = document.createElement('canvas') as HTMLCanvasElement;
            const tmpCtx = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
            tmpCanvas.style.display = "none";
            tmpCanvas.height = this.image.naturalHeight;
            tmpCanvas.width = this.image.naturalWidth;
            tmpCtx.drawImage(this.image, 0, 0);
            const dataURL = tmpCanvas.toDataURL();

            return {
                image: dataURL,
                distance: this.distance,
                node1: this.node1,
                node2: this.node2,
            }
        }
        return {};
    }
};
