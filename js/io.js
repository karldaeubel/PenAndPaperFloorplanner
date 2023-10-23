"use strict";
function loadOpenable(openable, graph) {
    const newOpenable = new Openable(openable.openableType, openable.p.x, openable.p.y, openable.dim.w, openable.dim.h);
    newOpenable.angle = openable.angle;
    newOpenable.snap.pos = openable.snap.pos;
    newOpenable.snap.orientation = openable.snap.orientation;
    if (openable.snap.edge) {
        newOpenable.snap.edge = graph.edges[openable.snap.edge.id1][openable.snap.edge.id2];
        newOpenable.snap.edge.snapOpenables.push(newOpenable);
    }
    newOpenable.stroke = openable.mov.stroke;
    newOpenable.fill = openable.mov.fill;
    return newOpenable;
}
function loadCircle(circle) {
    const newCircle = new Circle(circle.name, circle.c.x, circle.c.y, circle.r);
    newCircle.stroke = circle.mov.stroke;
    newCircle.fill = circle.mov.fill;
    return newCircle;
}
function loadEllipse(ellipse) {
    const newEllipse = new Ellipse(ellipse.name, ellipse.c.x, ellipse.c.y, ellipse.rX, ellipse.rY);
    newEllipse.stroke = ellipse.mov.stroke;
    newEllipse.fill = ellipse.mov.fill;
    newEllipse.angle = ellipse.angle;
    return newEllipse;
}
function loadRectangle(rect) {
    const newFur = new Rectangle(rect.name, rect.mov.type, rect.p.x, rect.p.y, 100, 100);
    newFur.dims = rect.dims;
    newFur.angle = rect.angle;
    newFur.stroke = rect.mov.stroke;
    newFur.fill = rect.mov.fill;
    return newFur;
}
function createState() {
    return JSON.stringify({ graph, labels, openables, furniture, floorplanImage }, null, "");
}
function setState() {
    state = createState();
}
function loadFloorplan(content, fileName) {
    let floorPlanner;
    try {
        floorPlanner = JSON.parse(content);
    }
    catch (err) {
        alert(getText(loc.fileIO.errorAtFile) + " " + fileName + ".\n\n" + getText(loc.fileIO.errorMessage) + "\n" + err);
        console.error(err);
        return;
    }
    graph.reset();
    labels.length = 0;
    openables.length = 0;
    furniture.length = 0;
    floorplanImage.reset();
    if (floorPlanner.graph) {
        let maxId = -1;
        for (const id in floorPlanner.graph.nodes) {
            const node = floorPlanner.graph.nodes[id];
            if (maxId < node.id) {
                maxId = node.id;
            }
            graph.nodes[node.id] = new CornerNode(node.id, node.p.x, node.p.y);
        }
        graph.count = maxId + 1;
        for (const i in floorPlanner.graph.edges) {
            for (const j in floorPlanner.graph.edges[i]) {
                const edge = floorPlanner.graph.edges[i][j];
                graph.addEdge(edge.id1, edge.id2);
            }
        }
    }
    if (floorPlanner.labels) {
        for (const label of floorPlanner.labels) {
            labels.push(loadRectangle(label));
        }
    }
    if (floorPlanner.openables) {
        for (const openable of floorPlanner.openables) {
            openables.push(loadOpenable(openable, graph));
        }
    }
    if (floorPlanner.furniture) {
        for (const fur of floorPlanner.furniture) {
            switch (fur.mov.type) {
                case MovableType.Circle: {
                    furniture.push(loadCircle(fur));
                    break;
                }
                case MovableType.Ellipse: {
                    furniture.push(loadEllipse(fur));
                    break;
                }
                case MovableType.Rectangle:
                case MovableType.L:
                case MovableType.U: {
                    furniture.push(loadRectangle(fur));
                    break;
                }
            }
        }
    }
    if (floorPlanner.floorplanImage && floorPlanner.floorplanImage.image) {
        const floorplanImageJson = floorPlanner.floorplanImage;
        const img = new Image();
        img.onload = (onLoadResult) => {
            const image = onLoadResult.target;
            floorplanImage.image = image;
            setState();
            drawMain();
        };
        img.onerror = () => {
            alert(getText(loc.fileIO.errorAtFile) + ".");
        };
        img.src = floorplanImageJson.image;
        floorplanImage.distance = floorplanImageJson.distance;
        const node1 = floorplanImageJson.node1;
        floorplanImage.node1 = new CornerNode(node1.id, node1.p.x, node1.p.y);
        const node2 = floorplanImageJson.node2;
        floorplanImage.node2 = new CornerNode(node2.id, node2.p.x, node2.p.y);
    }
    setState();
    drawMain();
}
function loadRemoteExample(url) {
    let gitHubExampleRequest = new XMLHttpRequest();
    gitHubExampleRequest.onload = readerEvent => {
        const target = readerEvent.currentTarget;
        if (target) {
            const content = target.response;
            loadFloorplan(content, url);
            centerProjection();
        }
    };
    gitHubExampleRequest.open("GET", url);
    gitHubExampleRequest.send();
}
document.getElementById("loadInput").addEventListener("change", (e) => {
    const files = e.target.files;
    const file = files?.item(0);
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = readerEvent => {
        const target = readerEvent.target;
        if (target) {
            const content = target.result;
            loadFloorplan(content, file.name);
        }
    };
});
document.getElementById("saveButton").addEventListener("click", () => {
    const pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify({ graph, labels, openables, furniture, floorplanImage }, null, " ")));
    pom.setAttribute("download", "house.json");
    pom.style.display = "none";
    document.body.appendChild(pom);
    pom.click();
    document.body.removeChild(pom);
    // TODO: this is too optimistic, cancel might have been selected
    setState();
});
document.getElementById("exportButton").addEventListener("click", () => {
    const pom = document.createElement("a");
    pom.setAttribute("href", canvas.toDataURL());
    pom.setAttribute("download", "house.png");
    pom.style.display = "none";
    document.body.appendChild(pom);
    pom.click();
    document.body.removeChild(pom);
});
document.getElementById("printButton").addEventListener("click", () => {
    const dataUrl = canvas.toDataURL();
    let content = "<!DOCTYPE html>";
    content += "<html>";
    content += "<head><title>PenAndPaperFloorplanner</title></head>";
    content += "<body>";
    content += "<img src=\"" + dataUrl + "\"";
    content += "</body>";
    content += "</html>";
    const printWin = window.open("", "", "width=" + screen.availWidth + ",height=" + screen.availHeight);
    if (printWin !== null) {
        printWin.document.open();
        printWin.document.write(content);
        printWin.document.addEventListener('load', function () {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();
        }, true);
    }
});
document.getElementById("helpOpen").addEventListener("click", () => {
    const helpDialog = document.getElementById("helpDialog");
    helpDialog.showModal();
});
document.getElementById("helpClose").addEventListener("click", () => {
    const helpDialog = document.getElementById("helpDialog");
    helpDialog.close();
});
