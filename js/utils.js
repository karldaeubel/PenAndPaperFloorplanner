"use strict";
function toNextNumber(p) {
    return { x: Math.round(p.x), y: Math.round(p.y) };
}
function distance(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
function translate(p, dim, sc = 1) {
    return {
        x: p.x + dim.w / sc,
        y: p.y + dim.h / sc
    };
}
function toRad(angle) {
    return Math.PI * angle / 180;
}
function toDeg(angle) {
    return 180 * angle / Math.PI;
}
function rotate(c, p, angle) {
    const rad = toRad(angle);
    return {
        x: Math.cos(rad) * (p.x - c.x) - Math.sin(rad) * (p.y - c.y) + c.x,
        y: Math.sin(rad) * (p.x - c.x) + Math.cos(rad) * (p.y - c.y) + c.y
    };
}
function angleBetweenPoints(p1, p2, p3) {
    return toDeg(Math.atan2(p3.y - p1.y, p3.x - p1.x) -
        Math.atan2(p2.y - p1.y, p2.x - p1.x));
}
function pointInCircle(c, r, p) {
    return distance(c, p) <= r;
}
function getIntersectionPoint(center, border, wall1, wall2) {
    const denom = (center.x - border.x) * (wall1.y - wall2.y) - (center.y - border.y) * (wall1.x - wall2.x);
    if (denom === 0) {
        return null;
    }
    const t = ((center.x - wall1.x) * (wall1.y - wall2.y) - (center.y - wall1.y) * (wall1.x - wall2.x)) / denom;
    const u = ((center.x - wall1.x) * (center.y - border.y) - (center.y - wall1.y) * (center.x - border.x)) / denom;
    if (t > 1 && u >= 0 && u <= 1) {
        return { x: center.x + t * (border.x - center.x), y: center.y + t * (border.y - center.y) };
    }
    return null;
}
