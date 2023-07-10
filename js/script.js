/**
 * Basic Util
 */

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

/**
 * Util
 */

function closestNodeToClick(p, nodes) {
    let minDist = null;
    let minId = null;
    for (const id in nodes) {
        const node = nodes[id];
        const dist = distance(p, node.p);
        if (!minDist || dist < minDist) {
            minDist = dist;
            minId = node.id;
        }
    }
    return minId;
}

function willRemove(p) {
    return p.x >= canvas.width - settings.deleteDim.w && p.x <= canvas.width && p.y >= 0 && p.y <= settings.deleteDim.h;
}

/**
 * Snap Elements
 */

function handleExtendNodeSnap(node, p, snapSelf) {
    let minDist = null;
    for (const id in graph.nodes) {
        const other = graph.nodes[id];
        if (!snapSelf && other.id === node.id) {
            continue;
        }
        const dist = distance(other.p, projection.to(p));
        if (dist < settings.nodeExtendSize && (!minDist || dist < minDist)) {
            minDist = dist;
            node.delta = projection.from(other.p);
            node.snap = { x: other.id, y: other.id };
        }
    }
    return !!minDist;
}

function handleExtendNeighborSnap(node, p, snapSelf) {
    const pos = projection.to(p);
    node.snap = { x: null, y: null };
    node.delta = { x: p.x, y: p.y };
    const minDist = { x: null, y: null };
    for (const id in graph.nodes) {
        const other = graph.nodes[id];
        if (!snapSelf && other.id === node.id) {
            continue;
        }
        const dist = { x: Math.abs(other.p.x - pos.x), y: Math.abs(other.p.y - pos.y) };
        if (dist.x < settings.nodeExtendSize && (!minDist.x || dist.x < minDist.x)) {
            minDist.x = dist.x;
            node.snap.x = other.id;
            node.delta.x = projection.from(other.p).x;
        }
        if (dist.y < settings.nodeExtendSize && (!minDist.y || dist.y < minDist.y)) {
            minDist.y = dist.y;
            node.snap.y = other.id;
            node.delta.y = projection.from(other.p).y;
        }
    }
}

/**
** Mouse Events
**/

canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mousemove", mouseMove);
document.addEventListener("mouseup", mouseUp);
canvas.addEventListener("dblclick", mouseDoubleClick);
canvas.addEventListener("wheel", zoom);

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
        } else {
            mouseDown(touch);
        }
        lastClick = time;
        lastClickId = e.touches[0].identifier;
    } else if (e.touches.length === 2) {
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
    } else if (e.touches.length === 2) {
        const touch1 = touchToCoordinates(e.touches[0]);
        const touch2 = touchToCoordinates(e.touches[1]);

        const pin = { x: touch1.x / 2 + touch2.x / 2, y: touch1.y / 2 + touch2.y / 2 };

        const dist = distance(touch1, touch2);

        if (oldDist && dist !== oldDist) {
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

function zoom(e, factor) {
    const f = factor ? factor : e.deltaY > 0 ? 1 / settings.zoomFactor : e.deltaY < 0 ? settings.zoomFactor : null;
    if (f) {
        const newScale = projection.scale * f;
        if (newScale > settings.minZoom && newScale < settings.maxZoom) {
            projection.scale = newScale;
            projection.p.x = e.x - (e.x - projection.p.x) * f;
            projection.p.y = e.y - (e.y - projection.p.y) * f;

            drawMain();
        }
    }
}

function mouseDoubleClick(e) {
    if (settings.mode === Mode.Furniture) {
        // add furniture double click
    } else if (settings.mode === Mode.Room) {
        graph.addNode(toNextNumber(projection.to(e)));
    }

    drawMain();
}

function mouseDown(e) {
    let selected = false;

    if (settings.mode === Mode.Furniture) {
        for (const fur of furniture) {
            if (fur.handleClick(e)) {
                selected = true;
                break;
            }
        }
    } else if (settings.mode === Mode.Room) {
        const clickPos = projection.to(e);
        const nodeId = closestNodeToClick(clickPos, graph.nodes);
        if (nodeId !== null) {
            const node = graph.nodes[nodeId];
            const dist = distance(node.p, clickPos);
            if (dist <= settings.nodeTransSize) {
                selected = true;
                node.translate = true;
                node.delta.x = e.x;
                node.delta.y = e.y;
            } else if (dist <= settings.nodeExtendSize) {
                selected = true;
                node.extend = true;
                node.delta.x = e.x;
                node.delta.y = e.y;
            }
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

    if (settings.mode === Mode.Furniture) {
        for (const fur of furniture) {
            if (fur.handleMove(e)) {
                changed = true;
            }
        }
    } else if (settings.mode === Mode.Room) {
        for (const id in graph.nodes) {
            const node = graph.nodes[id];
            if (node.translate) {
                changed = true;

                if (!handleExtendNodeSnap(node, e, false)) {
                    handleExtendNeighborSnap(node, e, false);
                }

                node.p = toNextNumber(projection.to(node.delta));

                for (const id1 in graph.edges) {
                    for (const id2 in graph.edges[id1]) {
                        const edge = graph.edges[id1][id2];
                        if (edge.id1 === node.id || edge.id2 === node.id) {
                            const node1 = graph.nodes[id1];
                            const node2 = graph.nodes[id2];
                            for (const openable of edge.snapOpenables) {
                                const proj = {
                                    x: node1.p.x + openable.snap.pos * (node2.p.x - node1.p.x),
                                    y: node1.p.y + openable.snap.pos * (node2.p.y - node1.p.y)
                                };
                                const shift = { x: proj.x - openable.dim.w / 2, y: proj.y };
                                openable.p = shift;
                                openable.angle = toDeg(Math.atan2(node2.p.y - node1.p.y, node2.p.x - node1.p.x)) + openable.snap.orientation * 180;
                            }
                        }
                    }
                }

                if (willRemove(e)) {
                    node.remove = true;
                } else {
                    node.remove = false;
                }
            } else if (node.extend) {
                changed = true;

                if (!handleExtendNodeSnap(node, e, true)) {
                    handleExtendNeighborSnap(node, e, true);
                }

                if (willRemove(e)) {
                    node.remove = true;
                } else {
                    node.remove = false;
                }
            }
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

function mouseUp(e) {
    if (settings.mode === Mode.Furniture) {
        mouseUpForMovables(furniture);
    } else if (settings.mode === Mode.Room) {
        for (const id in graph.nodes) {
            const node = graph.nodes[id];
            if (node.remove && node.translate) {
                graph.removeNode(node.id);
                continue;
            } else if (node.translate) {
                if (node.snap.x !== null && node.snap.y !== null && node.snap.x === node.snap.y && node.snap.x !== node.id) {
                    graph.mergeNodes(node.id, node.snap.x);
                }
            } else if (node.extend && !node.remove) {
                if (node.snap.x !== null && node.snap.y !== null && node.snap.x === node.snap.y) {
                    if (node.snap.x !== node.id) {
                        graph.addEdge(node.id, node.snap.x);
                    }
                } else {
                    const newId = graph.addNode(toNextNumber(projection.to({ x: node.snap.x === null ? e.x : node.delta.x, y: node.snap.y === null ? e.y : node.delta.y })));
                    graph.addEdge(node.id, newId);
                }
            }
            node.remove = false;
            node.translate = false;
            node.extend = false;
            node.snap = { x: null, y: null };
            node.delta = { x: 0, y: 0 };
        }
        mouseUpForMovables(openables);
        mouseUpForMovables(labels);
    }

    projection.drag = false;
    projection.delta.x = 0;
    projection.delta.y = 0;

    drawMain();
}

/**
 * Draw Elements
 */

function setFontSize(size, fixed = true) {
    ctx.font = (size / (fixed ? 1 : projection.scale)) + "px Segoe UI, Segoe UI, sans-serif";
}

function restoreDefaultContext() {
    ctx.lineWidth = 1.5 / projection.scale;
    setFontSize(15);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
}

function drawMain() {
    ctx.reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(projection.p.x, projection.p.y);
    ctx.scale(projection.scale, projection.scale);

    // global properties
    restoreDefaultContext();

    drawScale();
    drawDeletionField();

    if (Object.keys(graph.nodes).length === 0 && furniture.length === 0 && openables.length === 0 && labels.length === 0) {
        drawHelp();
    } else {
        for (let i = labels.length - 1; i >= 0; i--) {
            drawLabel(labels[i]);
        }

        for (let i = openables.length - 1; i >= 0; i--) {
            openables[i].draw();
        }

        drawGraph();

        for (let i = furniture.length - 1; i >= 0; i--) {
            furniture[i].draw();
        }
    }
}

function drawHelp() {
    const ul = { x: -projection.p.x / projection.scale, y: -projection.p.y / projection.scale };
    const br = projection.to({ x: canvas.width, y: canvas.height });

    ctx.fillStyle = "gray";
    setFontSize(40, false);

    ctx.beginPath();
    ctx.fillText(settings.mode === Mode.Room ? getText(loc.room.help) : getText(loc.furniture.help), (ul.x + br.x) / 2, (ul.y + br.y) / 2);
    ctx.stroke();

    ctx.fillStyle = "lightgray";
    setFontSize(30, false);

    ctx.beginPath();
    ctx.fillText(getText(loc.help.findHelp), (ul.x + br.x) / 2, ul.y * 4 / 10 + br.y * 6 / 10);
    ctx.stroke();

    restoreDefaultContext();
}

function drawGraph() {
    for (const id1 in graph.edges) {
        const node1 = graph.nodes[id1];
        for (const id2 in graph.edges[id1]) {
            const node2 = graph.nodes[id2];
            const edge = graph.edges[id1][id2];

            if ((node1.remove && node1.translate) || (node2.remove && node2.translate)) {
                ctx.fillStyle = "red";
                ctx.strokeStyle = "red";
            }

            const dist = distance(node1.p, node2.p);

            ctx.beginPath();
            ctx.moveTo(node1.p.x, node1.p.y);

            // uncomment for gaps in windows
            // for (const openable of edge.snapOpenables) {
            //     const relWidth = openable.dim.w / dist;
            //     const t1 = Math.max(0, openable.snap.pos - relWidth / 2);
            //     const t2 = Math.min(1, openable.snap.pos + relWidth / 2);

            //     ctx.lineTo(node1.p.x + t1 * (node2.p.x - node1.p.x), node1.p.y + t1 * (node2.p.y - node1.p.y));
            //     ctx.moveTo(node1.p.x + t2 * (node2.p.x - node1.p.x), node1.p.y + t2 * (node2.p.y - node1.p.y));
            // }

            ctx.lineTo(node2.p.x, node2.p.y);
            ctx.stroke();

            if ((!node1.remove && node1.translate) || (!node2.remove && node2.translate)) {
                const node = node1.translate ? node2 : node1;
                const other = node1.translate ? node1 : node2;
                const ul = { x: -projection.p.x / projection.scale, y: -projection.p.y / projection.scale };
                const br = projection.to({ x: canvas.width, y: canvas.height });
                const borderPos = {
                    x: Math.min(Math.max(node.p.x, ul.x), br.x),
                    y: Math.min(Math.max(node.p.y, ul.y), br.y)
                };

                const sx = node.p.x === other.p.x ? 1 : (borderPos.x - other.p.x) / (node.p.x - other.p.x);
                const sy = node.p.y === other.p.y ? 1 : (borderPos.y - other.p.y) / (node.p.y - other.p.y);

                const scaling = Math.min(sx, sy) / 2;

                setFontSize(18, false);

                ctx.fillText(
                    distance(node1.p, node2.p).toFixed(1),
                    other.p.x * (1 - scaling) + node.p.x * scaling,
                    other.p.y * (1 - scaling) + node.p.y * scaling
                );
            }

            restoreDefaultContext();
        }
    }

    if (settings.mode === Mode.Room) {
        for (const id in graph.nodes) {
            const node = graph.nodes[id];

            if (node.remove && node.translate) {
                ctx.fillStyle = "red";
                ctx.strokeStyle = "red";
            }

            // stroke
            ctx.beginPath();
            ctx.arc(node.p.x, node.p.y, settings.nodeExtendSize, 0, 2 * Math.PI);
            ctx.stroke();

            // fill
            ctx.beginPath();
            ctx.arc(node.p.x, node.p.y, settings.nodeTransSize, 0, 2 * Math.PI);
            ctx.fill();

            restoreDefaultContext();
        }

        for (const id in graph.nodes) {
            const node = graph.nodes[id];
            if (node.extend) {
                const newPos = projection.to(node.delta);
                if (node.remove) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "red";
                } else {
                    ctx.fillStyle = "gray";
                    ctx.strokeStyle = "gray";
                }
                // stroke
                ctx.beginPath();
                ctx.arc(newPos.x, newPos.y, settings.nodeExtendSize, 0, 2 * Math.PI);
                ctx.stroke();

                // fill
                ctx.beginPath();
                ctx.arc(newPos.x, newPos.y, settings.nodeTransSize, 0, 2 * Math.PI);
                ctx.fill();

                // line
                ctx.moveTo(node.p.x, node.p.y);
                ctx.lineTo(newPos.x, newPos.y);
                ctx.stroke();

                if (!node.remove) {
                    setFontSize(18, false);

                    ctx.fillText(distance(node.p, newPos).toFixed(1), (node.p.x + newPos.x) / 2, (node.p.y + newPos.y) / 2);
                }
            }

            restoreDefaultContext();
        }
    }
}

function drawLabel(label) {
    ctx.save();

    const c = label.center();
    const maxDim = label.getMaxDim();

    ctx.translate(c.x, c.y);
    ctx.rotate(toRad(label.angle));

    ctx.fillStyle = label.remove ? "red" : "lightgray";
    ctx.strokeStyle = label.remove ? "red" : "lightgray";

    setFontSize(maxDim.h);
    ctx.textBaseline = "middle";

    ctx.fillText(label.name, 0, 0);

    const rotateSize = label.getRotateSize();
    if (settings.mode === Mode.Room) {
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

    ctx.restore();
}

function drawScale() {
    const lhs = projection.to({ x: 0, y: 0 });
    const rhs = projection.to({ x: canvas.width, y: 0 });
    const scaleWidth = (rhs.x - lhs.x) / 3;
    let range = 0.1;
    while (scaleWidth / (range * 10) > 2) {
        range *= 10;
    }
    let units = 1000;
    let unit = "m";
    if (range === 100 || range === 10) {
        units = 10;
        unit = "cm";
    } else if (range < 10) {
        units = 1;
        unit = "mm";
    }
    ctx.beginPath();

    setFontSize(15, false);

    let i = 0;
    for (; i < scaleWidth; i += range) {
        ctx.moveTo((-projection.p.x + 20) / projection.scale + i, (-projection.p.y + 17) / projection.scale);
        ctx.lineTo((-projection.p.x + 20) / projection.scale + i, (-projection.p.y + 27) / projection.scale);
        if (i % (10 * range) === 0 || Math.floor(scaleWidth / range) < 10) {
            ctx.fillText((i / units) + unit,
                (-projection.p.x + 20) / projection.scale + i,
                (-projection.p.y + 15) / projection.scale,
                Math.floor(scaleWidth / range) < 10 ? range : scaleWidth / 2);
        }
    }

    ctx.moveTo((-projection.p.x + 20) / projection.scale, (-projection.p.y + 22) / projection.scale);
    ctx.lineTo((-projection.p.x + 20) / projection.scale + i - range, (-projection.p.y + 22) / projection.scale);

    ctx.stroke();
    restoreDefaultContext();
}

function drawDeletionField() {
    ctx.beginPath();

    ctx.strokeStyle = "red";
    const a = projection.to({ x: canvas.width - settings.deleteDim.w, y: 0 });
    const d = projection.to({ x: canvas.width, y: settings.deleteDim.h });

    ctx.rect(a.x, a.y, d.x - a.x, d.y - a.y);

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(d.x, d.y);

    ctx.moveTo(a.x, d.y);
    ctx.lineTo(d.x, a.y);

    ctx.stroke();

    restoreDefaultContext();
}

/**
 * Remaining Events
 */

document.getElementById("roomButton").addEventListener("click", changeToRoomMode);
document.getElementById("furnitureButton").addEventListener("click", changeToFurnitureMode);

function changeMode(e, mode) {
    const tabContent = document.getElementsByClassName("tabContent mode");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks mode");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.mode = mode;

    document.getElementById(mode === Mode.Room ? "roomTab" : "furnitureTab").style.display = "block";
    e.currentTarget.className += " active";

    drawMain();
}

function changeToRoomMode(e) {
    changeMode(e, Mode.Room);
}

function changeToFurnitureMode(e) {
    changeMode(e, Mode.Furniture);
}

// openable type tabs

document.getElementById("leftOpenableButton").addEventListener("click", changeToLeftOpenableType);
document.getElementById("rightOpenableButton").addEventListener("click", changeToRightOpenableType);
document.getElementById("doubleOpenableButton").addEventListener("click", changeToDoubleOpenableType);

function changeOpenableType(e, type) {
    const tabContent = document.getElementsByClassName("tabContent openableType");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks openableType");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.openableType = type;

    e.currentTarget.className += " active";

    drawMain();
}

function changeToLeftOpenableType(e) { changeOpenableType(e, OpenableType.Left); }
function changeToRightOpenableType(e) { changeOpenableType(e, OpenableType.Right); }
function changeToDoubleOpenableType(e) { changeOpenableType(e, OpenableType.Double); }

// furniture type tabs

document.getElementById("rectangleButton").addEventListener("click", changeToRectangleType);
document.getElementById("circleButton").addEventListener("click", changeToCircleType);
document.getElementById("LButton").addEventListener("click", changeToLType);
document.getElementById("UButton").addEventListener("click", changeToUType);

function changeFurnitureType(e, type) {
    const tabContent = document.getElementsByClassName("tabContent furnitureType");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks furnitureType");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.type = type;

    switch (type) {
        case FurnitureType.Rectangle:
            document.getElementById("rectangleTab").style.display = "contents";
            break;
        case FurnitureType.Circle:
            document.getElementById("circleTab").style.display = "contents";
            break;
        case FurnitureType.L:
            document.getElementById("LTab").style.display = "contents";
            break;
        case FurnitureType.U:
            document.getElementById("UTab").style.display = "contents";
            break;
    }

    e.currentTarget.className += " active";

    drawMain();
}

function changeToRectangleType(e) { changeFurnitureType(e, FurnitureType.Rectangle); }
function changeToCircleType(e) { changeFurnitureType(e, FurnitureType.Circle); }
function changeToLType(e) { changeFurnitureType(e, FurnitureType.L); }
function changeToUType(e) { changeFurnitureType(e, FurnitureType.U); }

function validNumericInput(...values) {
    for (const value of values) {
        if (isNaN(value) || value < 1) {
            return false;
        }
    }
    return true;
}

// Room Mode

document.getElementById("addLabelButton").addEventListener("click", (e) => {
    e.preventDefault();
    const labelName = document.getElementById("labelNameInput").value;
    const labelHeight = document.getElementById("labelHeightInput").valueAsNumber;

    if (!validNumericInput(labelHeight) || !labelName) {
        alert(getText(loc.room.label.inputError));
        return;
    }
    const start = projection.to({ x: 10, y: 100 });
    setFontSize(labelHeight);
    labels.push(new Rectangle(labelName, MovableType.Rectangle, start.x, start.y, ctx.measureText(labelName).width, labelHeight));
    console.log("add Label:", labelName);
    drawMain();
});

document.getElementById("addOpenableButton").addEventListener("click", (e) => {
    e.preventDefault();
    const openableWidth = document.getElementById("openableWidthInput").valueAsNumber;

    if (!validNumericInput(openableWidth)) {
        alert(getText(loc.room.openable.inputError));
        return;
    }

    const start = projection.to({ x: 10, y: 100 });
    openables.push(new Openable(settings.openableType, start.x, start.y, openableWidth, 180));
    console.log("add Openable:", settings.openableType);
    drawMain();
});

// Furniture Mode

document.getElementById("addFurnitureButton").addEventListener("click", (e) => {
    e.preventDefault();

    const furName = document.getElementById("nameInput").value;

    switch (settings.type) {
        case FurnitureType.Rectangle: {
            const furWidth = document.getElementById("widthInput").valueAsNumber;
            const furHeight = document.getElementById("heightInput").valueAsNumber;
            if (!validNumericInput(furWidth, furHeight)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            furniture.push(new Rectangle(furName, MovableType.Rectangle, start.x, start.y, furWidth, furHeight));
            break;
        }
        case FurnitureType.Circle: {
            const circleWidth = document.getElementById("circleWidthInput").valueAsNumber;
            const circleHeight = document.getElementById("circleHeightInput").valueAsNumber;
            if (!validNumericInput(circleWidth, circleHeight)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            furniture.push(circleWidth === circleHeight ?
                new Circle(furName, start.x + circleWidth / 2, start.y + circleWidth / 2, circleWidth / 2) :
                new Ellipse(furName, start.x + circleWidth / 2, start.y + circleHeight / 2, circleWidth / 2, circleHeight / 2));
            break;
        }
        case FurnitureType.L: {
            const LWidth1 = document.getElementById("LWidthInput1").valueAsNumber;
            const LHeight1 = document.getElementById("LHeightInput1").valueAsNumber;

            const LWidth2 = document.getElementById("LWidthInput2").valueAsNumber;
            const LHeight2 = document.getElementById("LHeightInput2").valueAsNumber;
            if (!validNumericInput(LWidth1, LHeight1, LWidth2, LHeight2)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            let newRect = new Rectangle(furName, MovableType.L, start.x, start.y, LWidth1, LHeight1);
            newRect.dims.push({ w: LWidth2, h: LHeight2 });
            furniture.push(newRect);
            break;
        }
        case FurnitureType.U: {
            const UWidth1 = document.getElementById("UWidthInput1").valueAsNumber;
            const UHeight1 = document.getElementById("UHeightInput1").valueAsNumber;

            const UWidth2 = document.getElementById("UWidthInput2").valueAsNumber;
            const UHeight2 = document.getElementById("UHeightInput2").valueAsNumber;

            const UWidth3 = document.getElementById("UWidthInput3").valueAsNumber;
            const UHeight3 = document.getElementById("UHeightInput3").valueAsNumber;

            if (!validNumericInput(UWidth1, UHeight1, UWidth2, UHeight2, UWidth3, UHeight3)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            let newRect = new Rectangle(furName, MovableType.U, start.x, start.y, UWidth1, UHeight1);
            newRect.dims.push({ w: UWidth2, h: UHeight2 });
            newRect.dims.push({ w: UWidth3, h: UHeight3 });
            furniture.push(newRect);
            break;
        }
    }

    console.log("add %s: %s", settings.type, furName);
    drawMain();
});

document.getElementById("loadInput").addEventListener("change", loadFile);

function loadMovable(mov, graph) {
    switch (mov.mov.type) {
        case MovableType.Openable: {
            const newOpenable = new Openable(mov.openableType, mov.p.x, mov.p.y, mov.dim.w, mov.dim.h);
            newOpenable.angle = mov.angle;

            newOpenable.snap.pos = mov.snap.pos;
            newOpenable.snap.orientation = mov.snap.orientation;
            if (mov.snap.edge) {
                newOpenable.snap.edge = graph.edges[mov.snap.edge.id1][mov.snap.edge.id2];
                newOpenable.snap.edge.snapOpenables.push(newOpenable);
            }

            newOpenable.stroke = mov.mov.stroke;
            newOpenable.fill = mov.mov.fill;
            return newOpenable;
        }
        case MovableType.Circle: {
            const newCircle = new Circle(mov.name, mov.c.x, mov.c.y, mov.r);
            newCircle.stroke = mov.mov.stroke;
            newCircle.fill = mov.mov.fill;
            return newCircle;
        }
        case MovableType.Ellipse: {
            const newEllipse = new Ellipse(mov.name, mov.c.x, mov.c.y, mov.rX, mov.rY);
            newEllipse.stroke = mov.mov.stroke;
            newEllipse.fill = mov.mov.fill;
            newEllipse.angle = mov.angle;
            return newEllipse;
        }
        case MovableType.Rectangle:
        case MovableType.L:
        case MovableType.U: {
            const newFur = new Rectangle(mov.name, mov.type, mov.p.x, mov.p.y, 100, 100);
            newFur.dims = mov.dims;
            newFur.angle = mov.angle;
            newFur.stroke = mov.mov.stroke;
            newFur.fill = mov.mov.fill;
            return newFur;
        }
    }
}

function loadFile(e) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = readerEvent => {
        const content = readerEvent.target.result;
        let floorPlanner;
        try {
            floorPlanner = JSON.parse(content);
        } catch (err) {
            alert(getText(loc.fileIO.errorAtFile) + " " + file.name + ".\n\n" + getText(loc.fileIO.errorMessage) + "\n" + err);
            console.error(err);
            return;
        }

        graph.reset();
        labels.length = 0;
        openables.length = 0;
        furniture.length = 0;

        if (floorPlanner.graph) {
            graph.count = floorPlanner.graph.count;
            for (const id in floorPlanner.graph.nodes) {
                const node = floorPlanner.graph.nodes[id];
                graph.nodes[node.id] = new CornerNode(node.id, node.p.x, node.p.y);
            }

            for (const i in floorPlanner.graph.edges) {
                for (const j in floorPlanner.graph.edges[i]) {
                    const edge = floorPlanner.graph.edges[i][j];
                    graph.addEdge(edge.id1, edge.id2);
                }
            }
        }

        if (floorPlanner.labels) {
            for (const label of floorPlanner.labels) {
                labels.push(loadMovable(label));
            }
        }

        if (floorPlanner.openables) {
            for (const openable of floorPlanner.openables) {
                openables.push(loadMovable(openable, graph));
            }
        }

        if (floorPlanner.furniture) {
            for (const fur of floorPlanner.furniture) {
                furniture.push(loadMovable(fur));
            }
        }

        drawMain();
    };
}

document.getElementById("saveButton").addEventListener("click", () => {
    const pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify({ graph, labels, openables, furniture }, null, " ")));

    pom.setAttribute("download", "house.json");

    pom.style.display = "none";
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
});

document.getElementById("helpButton").addEventListener("click", () => {
    alert(
        getText(loc.help.welcome) + "\n\n" +
        getText(loc.help.intro) + "\n\n" +
        getText(loc.help.explanation) + "\n\n" +
        getText(loc.help.introRoom) + "\n" +
        getText(loc.help.explanationRoom) + "\n\n" +
        getText(loc.help.introFurniture) + "\n" +
        getText(loc.help.explanationFurniture) + "\n\n" +
        getText(loc.help.creator) + "\n\n");
});