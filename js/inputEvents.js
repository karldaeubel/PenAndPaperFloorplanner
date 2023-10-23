"use strict";
canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mousemove", mouseMove);
document.addEventListener("mouseup", mouseUp);
canvas.addEventListener("dblclick", mouseDoubleClick);
canvas.addEventListener("wheel", zoomEvent);
function touchToCoordinates(t) {
    return { x: t.clientX, y: t.clientY };
}
let lastClick = 0;
let lastClickId = null;
let oldDist = null;
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = touchToCoordinates(e.touches[0]);
        const date = new Date();
        const time = date.getTime();
        const time_between_taps = 200; // 200ms
        if (lastClickId === e.touches[0].identifier && time - lastClick < time_between_taps) {
            mouseDoubleClick(touch);
        }
        else {
            mouseDown(touch);
        }
        lastClick = time;
        lastClickId = e.touches[0].identifier;
    }
    else if (e.touches.length === 2) {
        const touch1 = touchToCoordinates(e.touches[0]);
        const touch2 = touchToCoordinates(e.touches[1]);
        mouseUp(touch1);
        oldDist = distance(touch1, touch2);
    }
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = touchToCoordinates(e.touches[0]);
        mouseMove(touch);
    }
    else if (e.touches.length === 2) {
        const touch1 = touchToCoordinates(e.touches[0]);
        const touch2 = touchToCoordinates(e.touches[1]);
        const pin = { x: touch1.x / 2 + touch2.x / 2, y: touch1.y / 2 + touch2.y / 2 };
        const dist = distance(touch1, touch2);
        if (oldDist !== null && dist !== oldDist) {
            zoom(pin, dist / oldDist);
        }
        oldDist = dist;
    }
});
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (e.changedTouches.length > 0) {
        mouseUp(touchToCoordinates(e.changedTouches[0]));
    }
    oldDist = null;
});
canvas.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    if (e.changedTouches.length > 0) {
        mouseUp(touchToCoordinates(e.changedTouches[0]));
    }
    oldDist = null;
});
function zoomEvent(e) {
    zoom(e, e.deltaY > 0 ? 1 / settings.zoomFactor : e.deltaY < 0 ? settings.zoomFactor : null);
}
function zoom(p, factor) {
    if (factor !== null) {
        const proj = getCurrProjection();
        const newScale = proj.scale * factor;
        if (newScale > settings.minZoom && newScale < settings.maxZoom) {
            proj.scale = newScale;
            proj.p.x = p.x - (p.x - proj.p.x) * factor;
            proj.p.y = p.y - (p.y - proj.p.y) * factor;
            drawMain();
        }
    }
}
function mouseDoubleClick(e) {
    if (settings.mode === Mode.Furniture) {
        // add furniture double click
    }
    else if (settings.mode === Mode.Room) {
        graph.addNode(toNextNumber(projection.to(e)));
    }
    drawMain();
}
function mouseDown(e) {
    let selected = false;
    if (settings.mode === Mode.Floorplan) {
        if (floorplanImage.handleClick(e)) {
            selected = true;
        }
        if (!selected) {
            floorplanProjection.drag = true;
            floorplanProjection.delta.x = e.x;
            floorplanProjection.delta.y = e.y;
        }
        drawMain();
        return;
    }
    else if (settings.mode === Mode.Furniture) {
        for (const fur of furniture) {
            if (fur.handleClick(e)) {
                selected = true;
                break;
            }
        }
    }
    else if (settings.mode === Mode.Room) {
        if (graph.handleClick(e)) {
            selected = true;
        }
        if (!selected) {
            for (const openable of openables) {
                if (openable.handleClick(e)) {
                    selected = true;
                    break;
                }
            }
        }
        if (!selected) {
            for (const label of labels) {
                if (label.handleClick(e)) {
                    selected = true;
                    break;
                }
            }
        }
    }
    if (!selected) {
        projection.drag = true;
        projection.delta.x = e.x;
        projection.delta.y = e.y;
    }
    drawMain();
}
function mouseMove(e) {
    let changed = false;
    if (settings.mode === Mode.Floorplan) {
        if (floorplanImage.handleMove(e)) {
            changed = true;
        }
        if (floorplanProjection.drag) {
            changed = true;
            floorplanProjection.p.x += (e.x - floorplanProjection.delta.x);
            floorplanProjection.p.y += (e.y - floorplanProjection.delta.y);
            floorplanProjection.delta.x = e.x;
            floorplanProjection.delta.y = e.y;
        }
        if (changed) {
            drawMain();
        }
        return;
    }
    else if (settings.mode === Mode.Furniture) {
        for (const fur of furniture) {
            if (fur.handleMove(e)) {
                changed = true;
            }
        }
    }
    else if (settings.mode === Mode.Room) {
        if (graph.handleMove(e)) {
            changed = true;
        }
        for (const openable of openables) {
            if (openable.handleMove(e, graph)) {
                changed = true;
            }
        }
        for (const label of labels) {
            if (label.handleMove(e)) {
                changed = true;
            }
        }
    }
    if (projection.drag) {
        changed = true;
        projection.p.x += (e.x - projection.delta.x);
        projection.p.y += (e.y - projection.delta.y);
        projection.delta.x = e.x;
        projection.delta.y = e.y;
    }
    if (changed) {
        drawMain();
    }
}
function mouseUp(e) {
    if (settings.mode === Mode.Floorplan) {
        floorplanImage.handleUnclick();
    }
    else if (settings.mode === Mode.Furniture) {
        mouseUpForMovables(furniture);
    }
    else if (settings.mode === Mode.Room) {
        graph.handleUnclick(e);
        mouseUpForMovables(openables);
        mouseUpForMovables(labels);
    }
    floorplanProjection.drag = false;
    floorplanProjection.delta.x = 0;
    floorplanProjection.delta.y = 0;
    projection.drag = false;
    projection.delta.x = 0;
    projection.delta.y = 0;
    settings.isRemove = false;
    drawMain();
}
function zoomToMiddle(factor) {
    zoom({ x: canvas.width / 2, y: canvas.height / 2 }, factor);
}
document.getElementById("navZoomIn").addEventListener("click", () => {
    zoomToMiddle(Math.pow(settings.zoomFactor, 4));
});
document.getElementById("navZoomOut").addEventListener("click", () => {
    zoomToMiddle(1 / Math.pow(settings.zoomFactor, 4));
});
document.getElementById("navCenter").addEventListener("click", () => {
    centerProjection();
});
document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "ArrowRight": {
            moveProjection(Direction.Right);
            break;
        }
        case "ArrowLeft": {
            moveProjection(Direction.Left);
            break;
        }
        case "ArrowUp": {
            moveProjection(Direction.Up);
            break;
        }
        case "ArrowDown": {
            moveProjection(Direction.Down);
            break;
        }
    }
});
