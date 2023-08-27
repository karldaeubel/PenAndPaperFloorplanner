function loadOpenable(openable: OpenableJSON, graph: Graph): Openable {
    const newOpenable = new Openable(openable.openableType, openable.p.x, openable.p.y, openable.dim.w, openable.dim.h);
    newOpenable.angle = openable.angle;

    newOpenable.snap.pos = openable.snap.pos;
    newOpenable.snap.orientation = openable.snap.orientation;
    if (openable.snap.edge) {
        newOpenable.snap.edge = graph.edges[openable.snap.edge.id1]![openable.snap.edge.id2]!;
        newOpenable.snap.edge.snapOpenables.push(newOpenable);
    }

    newOpenable.stroke = openable.mov.stroke;
    newOpenable.fill = openable.mov.fill;
    return newOpenable;
}
function loadCircle(circle: CircleJSON): Circle {
    const newCircle = new Circle(circle.name, circle.c.x, circle.c.y, circle.r);
    newCircle.stroke = circle.mov.stroke;
    newCircle.fill = circle.mov.fill;
    return newCircle;
}
function loadEllipse(ellipse: EllipseJSON): Ellipse {
    const newEllipse = new Ellipse(ellipse.name, ellipse.c.x, ellipse.c.y, ellipse.rX, ellipse.rY);
    newEllipse.stroke = ellipse.mov.stroke;
    newEllipse.fill = ellipse.mov.fill;
    newEllipse.angle = ellipse.angle;
    return newEllipse;
}
function loadRectangle(rect: RectangleJSON): Rectangle {
    const newFur = new Rectangle(rect.name, rect.mov.type, rect.p.x, rect.p.y, 100, 100);
    newFur.dims = rect.dims;
    newFur.angle = rect.angle;
    newFur.stroke = rect.mov.stroke;
    newFur.fill = rect.mov.fill;
    return newFur;
}

function createState(): string {
    return JSON.stringify({ graph, labels, openables, furniture, floorplanImage }, null, "");
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
        floorplanImage.reset();

        if (floorPlanner.graph) {
            graph.count = floorPlanner.graph.count;
            for (const id in floorPlanner.graph.nodes) {
                const node = floorPlanner.graph.nodes[id] as CornerJSON;
                graph.nodes[node.id] = new CornerNode(node.id, node.p.x, node.p.y);
            }

            for (const i in floorPlanner.graph.edges) {
                for (const j in floorPlanner.graph.edges[i]) {
                    const edge = floorPlanner.graph.edges[i][j] as EdgeJSON;
                    graph.addEdge(edge.id1, edge.id2);
                }
            }
        }

        if (floorPlanner.labels) {
            for (const label of floorPlanner.labels) {
                labels.push(loadRectangle(label as RectangleJSON));
            }
        }

        if (floorPlanner.openables) {
            for (const openable of floorPlanner.openables) {
                openables.push(loadOpenable(openable as OpenableJSON, graph));
            }
        }

        if (floorPlanner.furniture) {
            for (const fur of floorPlanner.furniture) {
                switch (fur.mov.type) {
                    case MovableType.Circle: {
                        furniture.push(loadCircle(fur as CircleJSON));
                        break;
                    }
                    case MovableType.Ellipse: {
                        furniture.push(loadEllipse(fur as EllipseJSON));
                        break;
                    }
                    case MovableType.Rectangle:
                    case MovableType.L:
                    case MovableType.U: {
                        furniture.push(loadRectangle(fur as RectangleJSON));
                        break;
                    }
                }
            }
        }

        if (floorPlanner.floorplanImage && floorPlanner.floorplanImage.image) {
            const floorplanImageJson = floorPlanner.floorplanImage as FloorplanImageJSON;
            const img = new Image();
            img.onload = (onLoadResult) => {
                const image = onLoadResult.target as HTMLImageElement;
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

        getText(loc.help.introFloorplan) + "\n" +
        getText(loc.help.explanationFloorplan) + "\n\n" +

        getText(loc.help.introRoom) + "\n" +
        getText(loc.help.explanationRoom) + "\n\n" +

        getText(loc.help.introFurniture) + "\n" +
        getText(loc.help.explanationFurniture) + "\n\n" +

        getText(loc.help.introDisplay) + "\n" +
        getText(loc.help.explanationDisplay) + "\n\n" +

        getText(loc.help.creator) + "\n\n");
});