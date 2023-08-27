function loadOpenable(mov: Openable & { mov: Movable }, graph: Graph): Openable {
    const newOpenable = new Openable(mov.openableType, mov.p.x, mov.p.y, mov.dim.w, mov.dim.h);
    newOpenable.angle = mov.angle;

    newOpenable.snap.pos = mov.snap.pos;
    newOpenable.snap.orientation = mov.snap.orientation;
    if (mov.snap.edge) {
        newOpenable.snap.edge = graph.edges[mov.snap.edge.id1]![mov.snap.edge.id2]!;
        newOpenable.snap.edge.snapOpenables.push(newOpenable);
    }

    newOpenable.stroke = mov.mov.stroke;
    newOpenable.fill = mov.mov.fill;
    return newOpenable;
}
function loadCircle(mov: Circle & { mov: Movable }): Circle {
    const newCircle = new Circle(mov.name, mov.c.x, mov.c.y, mov.r);
    newCircle.stroke = mov.mov.stroke;
    newCircle.fill = mov.mov.fill;
    return newCircle;
}
function loadEllipse(mov: Ellipse & { mov: Movable }): Ellipse {
    const newEllipse = new Ellipse(mov.name, mov.c.x, mov.c.y, mov.rX, mov.rY);
    newEllipse.stroke = mov.mov.stroke;
    newEllipse.fill = mov.mov.fill;
    newEllipse.angle = mov.angle;
    return newEllipse;
}
function loadRectangle(mov: Rectangle & { mov: Movable }): Rectangle {
    const newFur = new Rectangle(mov.name, mov.mov.type, mov.p.x, mov.p.y, 100, 100);
    newFur.dims = mov.dims;
    newFur.angle = mov.angle;
    newFur.stroke = mov.mov.stroke;
    newFur.fill = mov.mov.fill;
    return newFur;
}

function createState(): string {
    return JSON.stringify({ graph, labels, openables, furniture }, null, "");
}
function setState() {
    state = createState();
}

document.getElementById("loadInput")!.addEventListener("change", (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    const file = files?.item(0);

    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = readerEvent => {
        const content = readerEvent.target!.result;
        let floorPlanner;
        try {
            floorPlanner = JSON.parse(content as string);
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

        setState();

        drawMain();
    };
});

document.getElementById("saveButton")!.addEventListener("click", () => {
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

document.getElementById("exportButton")!.addEventListener("click", () => {
    const pom = document.createElement("a");
    pom.setAttribute("href", canvas.toDataURL());

    pom.setAttribute("download", "house.png");

    pom.style.display = "none";
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
});

document.getElementById("printButton")!.addEventListener("click", () => {
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

document.getElementById("helpButton")!.addEventListener("click", () => {
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
