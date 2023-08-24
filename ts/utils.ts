function toNextNumber(p: Point): Point {
    return { x: Math.round(p.x), y: Math.round(p.y) };
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function translate(p: Point, dim: Dim, sc: number = 1): Point {
    return {
        x: p.x + dim.w / sc,
        y: p.y + dim.h / sc
    };
}

function toRad(angle: number): number {
    return Math.PI * angle / 180;
}
function toDeg(angle: number): number {
    return 180 * angle / Math.PI;
}

function rotate(c: Point, p: Point, angle: number): Point {
    const rad = toRad(angle);
    return {
        x: Math.cos(rad) * (p.x - c.x) - Math.sin(rad) * (p.y - c.y) + c.x,
        y: Math.sin(rad) * (p.x - c.x) + Math.cos(rad) * (p.y - c.y) + c.y
    };
}

function angleBetweenPoints(p1: Point, p2: Point, p3: Point): number {
    return toDeg(Math.atan2(p3.y - p1.y, p3.x - p1.x) -
        Math.atan2(p2.y - p1.y, p2.x - p1.x));
}

function pointInCircle(c: Point, r: number, p: Point): boolean {
    return distance(c, p) <= r;
}