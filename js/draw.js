"use strict";
// utils
function setFontSize(size, fixed = true) {
    const proj = settings.mode === Mode.Floorplan ? floorplanProjection : projection;
    ctx.font = (size / (fixed ? 1 : proj.scale)) + "px Segoe UI, Segoe UI, sans-serif";
}
function restoreDefaultContext() {
    const proj = settings.mode === Mode.Floorplan ? floorplanProjection : projection;
    ctx.lineWidth = 1.5 / proj.scale;
    ctx.lineJoin = "miter";
    setFontSize(15);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
}
function willRemove(p) {
    return p.x >= canvas.width - settings.deleteDim.w && p.x <= canvas.width && p.y >= 0 && p.y <= settings.deleteDim.h;
}
function handleRemove(p, elem) {
    if (willRemove(p)) {
        elem.remove = true;
        settings.isRemove = true;
    }
    else {
        if (elem.remove) {
            settings.isRemove = false;
        }
        elem.remove = false;
    }
}
// main
function drawMain() {
    ctx.reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // fill background for export functionality
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (settings.mode === Mode.Floorplan) {
        ctx.translate(floorplanProjection.p.x, floorplanProjection.p.y);
        ctx.scale(floorplanProjection.scale, floorplanProjection.scale);
        // global properties
        restoreDefaultContext();
        floorplanImage.draw();
        if (floorplanImage.image === null) {
            drawHelp();
        }
        return;
    }
    ctx.translate(projection.p.x, projection.p.y);
    ctx.scale(projection.scale, projection.scale);
    // global properties
    restoreDefaultContext();
    floorplanImage.draw();
    drawScale();
    drawDeletionField();
    if (Object.keys(graph.nodes).length === 0 && furniture.length === 0 && openables.length === 0 && labels.length === 0 && floorplanImage.image === null) {
        drawHelp();
    }
    else {
        for (let i = labels.length - 1; i >= 0; i--) {
            const label = labels[i];
            if (label !== undefined) {
                drawLabel(label);
            }
        }
        for (let i = openables.length - 1; i >= 0; i--) {
            const openable = openables[i];
            if (openable !== undefined) {
                openable.draw();
            }
        }
        graph.draw();
        for (let i = furniture.length - 1; i >= 0; i--) {
            const fur = furniture[i];
            if (fur !== undefined) {
                fur.draw();
            }
        }
    }
}
function drawHelp() {
    const proj = settings.mode === Mode.Floorplan ? floorplanProjection : projection;
    const ul = { x: -proj.p.x / proj.scale, y: -proj.p.y / proj.scale };
    const br = proj.to({ x: canvas.width, y: canvas.height });
    ctx.fillStyle = "gray";
    setFontSize(40, false);
    ctx.beginPath();
    switch (settings.mode) {
        case Mode.Floorplan: {
            ctx.fillText(getText(loc.floorplan.help), (ul.x + br.x) / 2, (ul.y + br.y) / 2);
            break;
        }
        case Mode.Room: {
            ctx.fillText(getText(loc.room.help), (ul.x + br.x) / 2, (ul.y + br.y) / 2);
            break;
        }
        case Mode.Furniture: {
            ctx.fillText(getText(loc.furniture.help), (ul.x + br.x) / 2, (ul.y + br.y) / 2);
            break;
        }
        case Mode.Presentation: {
            ctx.fillText(getText(loc.presentation.help), (ul.x + br.x) / 2, (ul.y + br.y) / 2);
            break;
        }
    }
    ctx.stroke();
    // find help
    ctx.fillStyle = "lightgray";
    setFontSize(30, false);
    ctx.beginPath();
    ctx.fillText(getText(loc.help.findHelp), (ul.x + br.x) / 2, ul.y * 4 / 10 + br.y * 6 / 10);
    ctx.stroke();
    // remove help
    const del = proj.to({ x: settings.deleteDim.w, y: settings.deleteDim.h });
    ctx.beginPath();
    ctx.fillStyle = "red";
    setFontSize(20, false);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    switch (settings.mode) {
        case Mode.Floorplan:
            break;
        case Mode.Room:
            ctx.fillText(getText(loc.room.removeHelp), br.x - del.x, ul.y + del.y);
            break;
        case Mode.Furniture:
            ctx.fillText(getText(loc.furniture.removeHelp), br.x - del.x, ul.y + del.y);
            break;
        case Mode.Presentation:
            break;
    }
    ctx.stroke();
    restoreDefaultContext();
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
        ctx.arc(-maxDim.w / 2 + rotateSize / 2, -maxDim.h / 2 + rotateSize / 2, rotateSize / 2, 0, 2 * Math.PI);
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
    }
    else if (range < 10) {
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
            ctx.fillText((i / units) + unit, (-projection.p.x + 20) / projection.scale + i, (-projection.p.y + 15) / projection.scale, Math.floor(scaleWidth / range) < 10 ? range : scaleWidth / 2);
        }
    }
    ctx.moveTo((-projection.p.x + 20) / projection.scale, (-projection.p.y + 22) / projection.scale);
    ctx.lineTo((-projection.p.x + 20) / projection.scale + i - range, (-projection.p.y + 22) / projection.scale);
    ctx.stroke();
    restoreDefaultContext();
}
function drawDeletionField() {
    // only display garbage bin if needed
    if (settings.mode === Mode.Presentation) {
        return;
    }
    const a = projection.to({ x: canvas.width - settings.deleteDim.w, y: 0 });
    const d = projection.to({ x: canvas.width, y: settings.deleteDim.h });
    ctx.lineJoin = "round";
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.rect(a.x, a.y, d.x - a.x, d.y - a.y);
    ctx.stroke();
    const w = d.x - a.x;
    const h = d.y - a.y;
    // body
    ctx.beginPath();
    ctx.moveTo(a.x + .2 * w, a.y + .3 * h);
    ctx.lineTo(a.x + .25 * w, a.y + .93 * h);
    ctx.lineTo(a.x + .75 * w, a.y + .93 * h);
    ctx.lineTo(a.x + .8 * w, a.y + .3 * h);
    ctx.closePath();
    ctx.stroke();
    // stripes
    for (const i of [.375, .5, .625]) {
        ctx.beginPath();
        ctx.rect(a.x + (i - .03) * w, a.y + .38 * h, .06 * w, .47 * h);
        ctx.stroke();
    }
    if (!settings.isRemove) {
        // head
        ctx.beginPath();
        ctx.rect(a.x + .15 * w, a.y + .15 * h, .7 * w, .1 * h);
        ctx.stroke();
        // handle
        ctx.beginPath();
        ctx.rect(a.x + .4 * w, a.y + .07 * h, .2 * w, .06 * h);
        ctx.stroke();
    }
    restoreDefaultContext();
}
