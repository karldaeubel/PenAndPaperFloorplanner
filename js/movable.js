// A movable is an abstract object that can be translated and rotated on the canvas
class Movable {
    constructor(type) {
        this.type = type;
        this.delta = {
            x: 0,
            y: 0
        };
        this.translate = false;
        this.rotate = false;
        this.remove = false;

        this.stroke = "black";
        this.fill = "";
    }

    getFill(isDisabled, highlight = false) {
        return this.remove ? "red" : isDisabled ? "gray" : highlight && (this.translate || this.rotate) ? "green" : this.fill;
    }
    getStroke(isDisabled, highlight = false) {
        return this.remove ? "red" : isDisabled ? "gray" : highlight && (this.translate || this.rotate) ? "green" : this.stroke;
    }

    setStyle(isDisabled, highlight = false) {
        ctx.fillStyle = this.getFill(isDisabled, highlight);
        ctx.strokeStyle = this.getStroke(isDisabled, highlight);
    }

    toJSON() {
        return { type: this.type, stroke: this.stroke, fill: this.fill };
    }
}

// snap utility
function snap(angle, value, diff) {
    return angle % value < diff || angle % value > value - diff;
}

function handleSnap(mov, values, angle, diff) {
    for (const value of values) {
        if (snap(angle, value, diff)) {
            mov.angle = value % 360;
            mov.delta = projection.from(rotate(mov.center(),
                mov.angleSnapPoint(),
                value % 360
            ));
            return true;
        }
    }
    return false;
}

function mouseUpForMovables(movables) {
    for (let i = movables.length - 1; i >= 0; --i) {
        const mov = movables[i];
        if (mov.remove) {
            if (mov.type === MovableType.Openable) {
                if (mov.snap.edge) {
                    for (let i = mov.snap.edge.snapOpenables.length - 1; i >= 0; --i) {
                        if (mov.snap.edge.snapOpenables[i] === mov) {
                            mov.snap.edge.snapOpenables.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            movables.splice(i, 1);
        } else {
            mov.translate = false;
            mov.rotate = false;
            mov.delta.x = 0;
            mov.delta.y = 0;
        }
    }
}

// An openable is a door or window, it can be moved and rotated
class Openable extends Movable {
    constructor(type, x, y, w, h) {
        super(MovableType.Openable);
        this.openableType = type;
        this.p = {
            x,
            y
        };
        this.dim = {
            w,
            h
        };
        this.angle = 0;
        this.snap = {
            edge: null,
            pos: null,
            orientation: null,
        }
    }

    center() {
        return {
            x: this.p.x + this.dim.w / 2,
            y: this.p.y
        };
    }

    handle() {
        return {
            x: this.p.x,
            y: this.p.y - this.dim.h
        }
    }

    pointInRotCircle(other, radius) {
        const pRot = rotate(this.center(), other, -this.angle);
        return pointInCircle(translate(this.handle(), { w: radius, h: radius }), radius, pRot);
    }

    getRotateSize() {
        if (this.dim.w / 2 <= settings.furnitureRotateSize || this.dim.h / 2 <= settings.furnitureRotateSize) {
            return Math.min(this.dim.w, this.dim.h) / 2;
        }
        return settings.furnitureRotateSize;
    }

    pointInRotRectangle(other) {
        const pRot = rotate(this.center(), other, -this.angle);
        const h = this.handle();
        if (h.x <= pRot.x && h.x + this.dim.w >= pRot.x && h.y <= pRot.y && h.y + this.dim.h >= pRot.y) {
            return true;
        }
        return false;
    }

    handleClick(e) {
        if (!this.snap.edge && this.pointInRotCircle(projection.to(e), this.getRotateSize() / 2)) {
            this.rotate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        } else if (this.pointInRotRectangle(projection.to(e))) {
            this.translate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        }
        return false;
    }

    handleSnap(values, angle, diff) {
        for (const value of values) {
            if (snap(angle, value, diff)) {
                this.angle = value % 360;
                this.delta = projection.from(rotate(this.center(),
                    { x: this.p.x, y: this.p.y - this.dim.h },
                    value % 360
                ));
                return true;
            }
        }
        return false;
    }

    handleEdgeSnap(p, graph) {
        const clickPos = projection.to(p);

        let minDist = null;
        let minEdge = null;
        let minT = null;
        let minOrientation = null;

        for (const id1 in graph.edges) {
            for (const id2 in graph.edges[id1]) {
                const edge = graph.edges[id1][id2];
                const node1 = graph.nodes[edge.id1];
                const node2 = graph.nodes[edge.id2];

                const t =
                    ((node2.p.x - node1.p.x) * (clickPos.x - node1.p.x) + (node2.p.y - node1.p.y) * (clickPos.y - node1.p.y)) /
                    ((node2.p.x - node1.p.x) ** 2 + (node2.p.y - node1.p.y) ** 2);

                if (t < 0 || t > 1) {
                    continue;
                }
                const orientationDist =
                    ((node2.p.x - node1.p.x) * (node1.p.y - clickPos.y) - (node1.p.x - clickPos.x) * (node2.p.y - node1.p.y)) /
                    distance(node2.p, node1.p);
                const dist = Math.abs(orientationDist);
                if (dist < settings.nodeExtendSize && (!minDist || dist < minDist)) {
                    minDist = dist;
                    minEdge = edge;
                    minT = t;
                    minOrientation = Math.sign(orientationDist) < 0 ? 1 : 0;

                    const proj = {
                        x: node1.p.x + t * (node2.p.x - node1.p.x),
                        y: node1.p.y + t * (node2.p.y - node1.p.y)
                    };

                    const shift = { x: proj.x - this.dim.w / 2, y: proj.y };
                    this.p = shift;
                    this.delta = projection.from(proj);
                    this.angle = toDeg(Math.atan2(node2.p.y - node1.p.y, node2.p.x - node1.p.x)) + minOrientation * 180;
                }
            }
        }

        this.snap.pos = minT;
        this.snap.orientation = minOrientation;

        if (this.snap.edge && this.snap.edge !== minEdge) {
            for (let i = this.snap.edge.snapOpenables.length - 1; i >= 0; --i) {
                if (this.snap.edge.snapOpenables[i] === this) {
                    this.snap.edge.snapOpenables.splice(i, 1);
                    break;
                }
            }
        }
        if (this.snap.edge !== minEdge) {
            this.snap.edge = minEdge;
            if (this.snap.edge) {
                this.snap.edge.snapOpenables.push(this);
            }
        }

        if (minDist === null) {
            this.snap.edge = null;
            this.snap.pos = null;
            this.snap.orientation = null;

            this.p.x += (p.x - this.delta.x) / projection.scale;
            this.p.y += (p.y - this.delta.y) / projection.scale;

            this.delta.x = p.x;
            this.delta.y = p.y;
        }
    }

    handleMove(e, graph) {
        let changed = false;
        if (this.translate) {
            changed = true;

            this.handleEdgeSnap(e, graph);

            if (willRemove(e)) {
                this.remove = true;
            } else {
                this.remove = false;
            }
        } else if (this.rotate) {
            changed = true;
            const a = angleBetweenPoints(projection.from(this.center()),
                this.delta,
                e);
            if (!this.handleSnap([360, 270, 180, 90], Math.abs((this.angle + a + 360) % 360), settings.furnitureSnapAngle)) {
                this.angle += a;

                this.delta.x = e.x;
                this.delta.y = e.y;
            }
        }

        return changed;
    }

    draw() {
        ctx.save();

        const c = this.center();

        ctx.translate(c.x, c.y);
        ctx.rotate(toRad(this.angle));

        this.setStyle(settings.mode !== Mode.Room);

        switch (this.openableType) {
            case OpenableType.Left: {
                ctx.beginPath();
                ctx.moveTo(-this.dim.w / 2, 0);
                ctx.lineTo(-this.dim.w / 2, this.dim.w);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(-this.dim.w / 2, 0, this.dim.w, 0, Math.PI / 2);
                ctx.stroke();
                break;
            }
            case OpenableType.Right: {
                ctx.beginPath();
                ctx.moveTo(this.dim.w / 2, 0);
                ctx.lineTo(this.dim.w / 2, this.dim.w);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(this.dim.w / 2, 0, this.dim.w, Math.PI / 2, Math.PI);
                ctx.stroke();
                break;
            }
            case OpenableType.Double: {
                ctx.beginPath();
                ctx.moveTo(-this.dim.w / 2, 0);
                ctx.lineTo(-this.dim.w / 2, this.dim.w / 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(-this.dim.w / 2, 0, this.dim.w / 2, 0, Math.PI / 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.dim.w / 2, 0);
                ctx.lineTo(this.dim.w / 2, this.dim.w / 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(this.dim.w / 2, 0, this.dim.w / 2, Math.PI / 2, Math.PI);
                ctx.stroke();
                break;
            }
        }

        const rotateSize = this.getRotateSize();

        if (settings.mode === Mode.Room) {
            ctx.beginPath();
            ctx.rect(-this.dim.w / 2, -this.dim.h, this.dim.w, this.dim.h);
            ctx.stroke();

            if (!this.snap.edge) {
                ctx.beginPath();
                ctx.arc(
                    -this.dim.w / 2 + rotateSize / 2,
                    -this.dim.h + rotateSize / 2,
                    rotateSize / 2,
                    0,
                    2 * Math.PI
                );
                ctx.stroke();
            }
        }

        if (this.translate || this.rotate) {
            setFontSize(rotateSize * 2);

            ctx.beginPath();
            ctx.fillText(this.dim.w, 0, -this.dim.h + rotateSize * 2, this.dim.w);
            ctx.stroke();

            if (this.snap.edge) {
                const node1 = graph.nodes[this.snap.edge.id1];
                const node2 = graph.nodes[this.snap.edge.id2];

                const dist = distance(node1.p, node2.p);
                const dist1 = (dist * this.snap.pos - this.dim.w / 2).toFixed(1);
                const dist2 = (dist * (1 - this.snap.pos) - this.dim.w / 2).toFixed(1);

                if (dist1 > 0) {
                    ctx.textAlign = this.snap.orientation === 0 ? "right" : "left";
                    ctx.beginPath();
                    ctx.fillText(dist1, (this.snap.orientation - 1 / 2) * this.dim.w, -this.dim.h + rotateSize * 2, dist1);
                    ctx.stroke();
                }

                if (dist2 > 0) {
                    ctx.textAlign = this.snap.orientation === 1 ? "right" : "left";
                    ctx.beginPath();
                    ctx.fillText(dist2, (-this.snap.orientation + 1 / 2) * this.dim.w, -this.dim.h + rotateSize * 2, dist2);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }

    toJSON() {
        return { mov: super.toJSON(), openableType: this.openableType, p: this.p, dim: this.dim, angle: this.angle, snap: this.snap };
    }
}

// A generalized rectangle with multiple segments of different dimensions, it can be moved and rotated
class Rectangle extends Movable {
    constructor(name, type, x, y, w, h) {
        super(type);
        this.name = name;
        this.p = {
            x,
            y
        };
        this.dims = [{
            w,
            h
        }];
        this.angle = 0;
    }

    getMaxDim() {
        let result = { w: 0, h: 0 };
        for (const dim of this.dims) {
            result.w += dim.w;
            result.h = Math.max(result.h, dim.h);
        }
        return result;
    }

    getMinDim() {
        let result = { w: 0, h: Number.MAX_VALUE };
        for (const dim of this.dims) {
            result.w += dim.w;
            result.h = Math.min(result.h, dim.h);
        }
        return result;
    }

    center() {
        const maxDim = this.getMaxDim();
        return {
            x: this.p.x + maxDim.w / 2,
            y: this.p.y + maxDim.h / 2
        };
    }

    pointInRotCircle(other, radius) {
        const pRot = rotate(this.center(), other, -this.angle);
        return pointInCircle(translate(this.p, { w: radius, h: radius }), radius, pRot);
    }

    getRotateSize() {
        const minDim = this.getMinDim();
        if (minDim.w / 2 <= settings.furnitureRotateSize || minDim.h / 2 <= settings.furnitureRotateSize) {
            return Math.min(minDim.w, minDim.h) / 2;
        }
        return settings.furnitureRotateSize;
    }

    pointInRotRectangle(other) {
        const pRot = rotate(this.center(), other, -this.angle);
        let currX = this.p.x;
        for (const dim of this.dims) {
            if (currX <= pRot.x && currX + dim.w >= pRot.x && this.p.y <= pRot.y && this.p.y + dim.h >= pRot.y) {
                return true;
            }
            currX += dim.w;
        }
        return false;
    }

    setFontSize() {
        setFontSize(1);
        const textDim = ctx.measureText(this.name);
        const minDim = this.getMinDim();
        setFontSize(Math.min(Math.min(160, minDim.h), minDim.w / textDim.width));
    }

    angleSnapPoint() {
        return this.p;
    }

    handleClick(e) {
        if (this.pointInRotCircle(projection.to(e), this.getRotateSize() / 2)) {
            this.rotate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        } else if (this.pointInRotRectangle(projection.to(e))) {
            this.translate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        }
        return false;
    }

    handleMove(e) {
        let changed = false;
        if (this.translate) {
            changed = true;

            this.p.x += (e.x - this.delta.x) / projection.scale;
            this.p.y += (e.y - this.delta.y) / projection.scale;

            this.delta.x = e.x;
            this.delta.y = e.y;

            if (willRemove(e)) {
                this.remove = true;
            } else {
                this.remove = false;
            }
        } else if (this.rotate) {
            changed = true;
            const a = angleBetweenPoints(projection.from(this.center()),
                this.delta,
                e);
            if (!handleSnap(this, [360, 270, 180, 90], Math.abs((this.angle + a + 360) % 360), settings.furnitureSnapAngle)) {
                this.angle += a;

                this.delta.x = e.x;
                this.delta.y = e.y;
            }
        }

        return changed;
    }

    draw() {
        ctx.save();

        const c = this.center();
        const maxDim = this.getMaxDim();
        const minDim = this.getMinDim();

        ctx.translate(c.x, c.y);
        ctx.rotate(toRad(this.angle));

        this.setStyle(settings.mode !== Mode.Furniture, true);

        ctx.beginPath();

        let currX = -maxDim.w / 2;
        let currY = -maxDim.h / 2;
        ctx.moveTo(currX, currY);
        currY += this.dims[0].h;
        ctx.lineTo(currX, currY);
        currX += this.dims[0].w;
        ctx.lineTo(currX, currY);

        for (let i = 1; i < this.dims.length; ++i) {
            const prevDim = this.dims[i - 1];
            const dim = this.dims[i];
            currY += dim.h - prevDim.h;
            ctx.lineTo(currX, currY);
            currX += dim.w;
            ctx.lineTo(currX, currY);
        }

        currY = -maxDim.h / 2;
        ctx.lineTo(currX, currY);
        ctx.closePath();

        ctx.stroke();

        ctx.beginPath();

        this.setFontSize();
        ctx.textBaseline = "middle";
        ctx.fillText(this.name, 0, - maxDim.h / 2 + minDim.h / 2, minDim.w);
        ctx.textBaseline = "alphabetic";

        const rotateSize = this.getRotateSize();

        if (settings.mode === Mode.Furniture) {
            ctx.beginPath();
            ctx.arc(
                -maxDim.w / 2 + rotateSize / 2,
                -maxDim.h / 2 + rotateSize / 2,
                rotateSize / 2,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        if (this.translate || this.rotate) {
            setFontSize(rotateSize);

            ctx.beginPath();

            ctx.moveTo(-maxDim.w / 2, -maxDim.h / 2 + rotateSize);
            ctx.lineTo(-maxDim.w / 2 + maxDim.w, -maxDim.h / 2 + rotateSize);
            ctx.fillText(maxDim.w, 0, -maxDim.h / 2 + rotateSize, maxDim.w);

            ctx.moveTo(-maxDim.w / 2 + rotateSize, -maxDim.h / 2);
            ctx.lineTo(-maxDim.w / 2 + rotateSize, -maxDim.h / 2 + maxDim.h);

            ctx.translate(-maxDim.w / 2 + rotateSize, 0);
            ctx.rotate(toRad(-90));
            ctx.fillText(maxDim.h, 0, 0, maxDim.h);

            ctx.stroke();
        }

        ctx.restore();
    }

    toJSON() {
        return { mov: super.toJSON(), name: this.name, p: this.p, dims: this.dims, angle: this.angle };
    }
}

// A circle, it can be moved and rotated
class Circle extends Movable {
    constructor(name, x, y, r) {
        super(MovableType.Circle);
        this.name = name;
        this.c = {
            x,
            y
        };
        this.r = r;
    }

    center() {
        return this.c;
    }

    getDimSize() {
        if (this.r <= settings.furnitureRotateSize) {
            return this.r;
        }
        return settings.furnitureRotateSize;
    }

    setFontSize() {
        setFontSize(1);
        const textDim = ctx.measureText(this.name);
        setFontSize(Math.min(Math.min(160, 2 * this.r), 2 * this.r / textDim.width));
    }

    handleClick(e) {
        if (pointInCircle(this.c, this.r, projection.to(e))) {
            this.translate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        }
        return false;
    }

    handleMove(e) {
        let changed = false;
        if (this.translate) {
            changed = true;

            this.c.x += (e.x - this.delta.x) / projection.scale;
            this.c.y += (e.y - this.delta.y) / projection.scale;

            this.delta.x = e.x;
            this.delta.y = e.y;

            if (willRemove(e)) {
                this.remove = true;
            } else {
                this.remove = false;
            }
        }

        return changed;
    }

    draw() {
        ctx.save();

        ctx.translate(this.c.x, this.c.y);

        this.setStyle(settings.mode !== Mode.Furniture, true);

        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();

        this.setFontSize();
        ctx.textBaseline = "middle";
        ctx.fillText(this.name, 0, 0, 2 * this.r);
        ctx.textBaseline = "alphabetic";

        const rotateSize = this.getDimSize();

        if (this.translate) {
            setFontSize(rotateSize);

            ctx.beginPath();

            ctx.moveTo(-this.r, -this.r);
            ctx.lineTo(this.r, -this.r);
            ctx.fillText(2 * this.r, 0, -this.r + rotateSize, 2 * this.r);

            ctx.stroke();
        }

        ctx.restore();
    }

    toJSON() {
        return { mov: super.toJSON(), name: this.name, c: this.c, r: this.r };
    }
}

// An ellipse, it can be moved and rotated
class Ellipse extends Movable {
    constructor(name, x, y, rX, rY) {
        super(MovableType.Ellipse);
        this.name = name;
        this.c = {
            x,
            y
        };
        this.rX = rX;
        this.rY = rY;
        this.f = Math.sqrt(Math.max(this.rX, this.rY) ** 2 - Math.min(this.rX, this.rY) ** 2);
        this.z = Math.min(this.rX, this.rY) ** 2 / Math.max(this.rX, this.rY);
        this.angle = 0;
    }

    center() {
        return this.c;
    }

    getF1() {
        return this.rX < this.rY ? { x: this.c.x, y: this.c.y - this.f } : { x: this.c.x - this.f, y: this.c.y };
    }

    getF2() {
        return this.rX < this.rY ? { x: this.c.x, y: this.c.y + this.f } : { x: this.c.x + this.f, y: this.c.y };
    }

    getRotateSize() {
        if (this.z <= settings.furnitureRotateSize) {
            return this.z;
        }
        return settings.furnitureRotateSize;
    }

    getDimSize() {
        if (this.rX <= settings.furnitureRotateSize || this.rY <= settings.furnitureRotateSize) {
            return Math.min(this.rX, this.rY);
        }
        return settings.furnitureRotateSize;
    }

    pointInEllipse(p) {
        return distance(p, this.getF1()) + distance(p, this.getF2()) <= 2 * Math.max(this.rX, this.rY);
    }

    pointInRotCircle(other, radius) {
        const pRot = rotate(this.center(), other, -this.angle);
        return pointInCircle(this.angleSnapPoint(), radius, pRot);
    }

    pointInRotEllipse(other) {
        const pRot = rotate(this.center(), other, -this.angle);
        return this.pointInEllipse(pRot);
    }

    setFontSize() {
        setFontSize(1);
        const textDim = ctx.measureText(this.name);
        setFontSize(Math.min(Math.min(160, 2 * this.rY), 2 * this.rX / textDim.width));
    }

    angleSnapPoint() {
        return this.getF2();
    }

    handleClick(e) {
        if (this.rX !== this.rY && this.pointInRotCircle(projection.to(e), this.getRotateSize() / 2)) {
            this.rotate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        } else if (this.pointInRotEllipse(projection.to(e))) {
            this.translate = true;
            this.delta.x = e.x;
            this.delta.y = e.y;
            return true;
        }
        return false;
    }

    handleMove(e) {
        let changed = false;
        if (this.translate) {
            changed = true;

            this.c.x += (e.x - this.delta.x) / projection.scale;
            this.c.y += (e.y - this.delta.y) / projection.scale;

            this.delta.x = e.x;
            this.delta.y = e.y;

            if (willRemove(e)) {
                this.remove = true;
            } else {
                this.remove = false;
            }
        } else if (this.rotate) {
            changed = true;
            const a = angleBetweenPoints(projection.from(this.center()),
                this.delta,
                e);
            if (!handleSnap(this, [360, 270, 180, 90], Math.abs((this.angle + a + 360) % 360), settings.furnitureSnapAngle)) {
                this.angle += a;

                this.delta.x = e.x;
                this.delta.y = e.y;
            }
        }

        return changed;
    }

    draw() {
        ctx.save();

        ctx.translate(this.c.x, this.c.y);
        ctx.rotate(toRad(this.angle));

        this.setStyle(settings.mode !== Mode.Furniture, true);

        ctx.beginPath();
        ctx.ellipse(0, 0, this.rX, this.rY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();

        this.setFontSize();
        ctx.textBaseline = "middle";
        ctx.fillText(this.name, 0, 0, 2 * this.rX);
        ctx.textBaseline = "alphabetic";

        const rotateSize = this.getRotateSize();

        if (settings.mode === Mode.Furniture && this.rX !== this.rY) {
            ctx.beginPath();
            const f = this.angleSnapPoint();
            ctx.arc(
                f.x - this.c.x,
                f.y - this.c.y,
                rotateSize / 2,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        const dimSize = this.getDimSize();

        if (this.translate || this.rotate) {
            setFontSize(dimSize);

            ctx.beginPath();

            ctx.moveTo(-this.rX, -this.rY);
            ctx.lineTo(this.rX, -this.rY);
            ctx.fillText(2 * this.rX, 0, -this.rY + dimSize, 2 * this.rX);

            ctx.moveTo(-this.rX, -this.rY);
            ctx.lineTo(-this.rX, this.rY);

            ctx.translate(-this.rX + dimSize, 0);
            ctx.rotate(toRad(-90));
            ctx.fillText(2 * this.rY, 0, 0, 2 * this.rY);

            ctx.stroke();
        }

        ctx.restore();
    }

    toJSON() {
        return { mov: super.toJSON(), name: this.name, c: this.c, rX: this.rX, rY: this.rY, angle: this.angle };
    }
}
