
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
            const newFur = new Rectangle(mov.name, mov.mov.type, mov.p.x, mov.p.y, 100, 100);
            newFur.dims = mov.dims;
            newFur.angle = mov.angle;
            newFur.stroke = mov.mov.stroke;
            newFur.fill = mov.mov.fill;
            return newFur;
        }
    }
}

function createState() {
    return JSON.stringify({ graph, labels, openables, furniture }, null, "");
}
function setState() {
    state = createState();
}

document.getElementById("loadInput").addEventListener("change", (e) => {
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

        setState();

        drawMain();
    };
});

document.getElementById("saveButton").addEventListener("click", () => {
    const pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify({ graph, labels, openables, furniture }, null, " ")));

    pom.setAttribute("download", "house.json");

    pom.style.display = "none";
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);

    // TODO: this is too optimistic, cancel might have been selected
    setState();
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