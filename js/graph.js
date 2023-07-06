/* exported graph */

class CornerNode {
    constructor(id, x, y) {
        this.id = id;
        this.p = {
            x,
            y
        };
        this.delta = {
            x: 0,
            y: 0
        };
        this.translate = false;
        this.extend = false;
        this.snap = {
            x: null,
            y: null
        };
        this.remove = false;
    }

    toJSON() {
        return { id: this.id, p: this.p };
    }
}

class Edge {
    constructor(id1, id2) {
        this.id1 = id1;
        this.id2 = id2;
        this.stroke = "black";
        this.snapOpenables = [];
    }
    toJSON() {
        return { id1: this.id1, id2: this.id2, stroke: this.stroke };
    }
}

const graph = {
    count: 0,
    nodes: {},
    edges: {},
    addNode: function (p) {
        const id = this.count++;
        this.nodes[id] = new CornerNode(id, p.x, p.y);

        console.log("new Node:", id);
        return id;
    },
    removeNode: function (id) {
        console.log("remove Node:", id);
        delete this.nodes[id];
        for (const id1 in this.edges) {
            for (const id2 in this.edges[id1]) {
                const edge = this.edges[id1][id2];
                if (edge.id1 === id || edge.id2 === id) {
                    for (const openable of edge.snapOpenables) {
                        openable.snap.edge = null;
                        openable.snap.pos = null;
                        openable.snap.orientation = null;
                    }
                    delete this.edges[id1][id2];
                }
            }
        }
        delete this.edges[id];
    },
    addEdge: function (id1, id2) {
        console.log("new Edge:", id1, id2);
        if (id1 < id2) {
            if (!(id1 in this.edges)) {
                this.edges[id1] = {};
            }
            if (!this.edges[id1][id2]) {
                this.edges[id1][id2] = new Edge(id1, id2);
            }
            return this.edges[id1][id2];
        } else if (id2 < id1) {
            if (!(id2 in this.edges)) {
                this.edges[id2] = {};
            }
            if (!this.edges[id2][id1]) {
                this.edges[id2][id1] = new Edge(id2, id1);
            }
            return this.edges[id2][id1];
        }
    },
    mergeNodes: function (fromId, toId) {
        console.log("merge:", fromId, toId);
        for (const id1 in this.edges) {
            for (const id2 in this.edges[id1]) {
                const edge = this.edges[id1][id2];
                if (edge.id1 === fromId && edge.id2 !== toId) {
                    const newEdge = this.addEdge(toId, edge.id2);
                    newEdge.snapOpenables.push(...edge.snapOpenables);
                    for (const openable of edge.snapOpenables) {
                        openable.snap.edge = newEdge;
                        if (newEdge.id1 !== toId) {
                            openable.snap.pos = 1 - openable.snap.pos;
                            openable.snap.orientation = (openable.snap.orientation + 1) % 2;
                        }
                    }
                } else if (edge.id2 === fromId && edge.id1 !== toId) {
                    const newEdge = this.addEdge(toId, edge.id1);
                    newEdge.snapOpenables.push(...edge.snapOpenables);
                    for (const openable of edge.snapOpenables) {
                        if (newEdge.id1 === toId) {
                            openable.snap.pos = 1 - openable.snap.pos;
                            openable.snap.orientation = (openable.snap.orientation + 1) % 2;
                        }
                        openable.snap.edge = newEdge;
                    }
                }
            }
        }

        this.removeNode(fromId);
    },
    reset: function () {
        this.count = 0;
        this.nodes = {};
        this.edges = {};
    },
};
