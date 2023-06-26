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
        delete this.edges[id];
        for (const id1 in this.edges) {
            for (const id2 in this.edges[id1]) {
                const edge = this.edges[id1][id2];
                if (edge.id1 === id || edge.id2 === id) {
                    delete this.edges[id1][id2];
                }
            }
        }
    },
    addEdge: function (id1, id2) {
        console.log("new Edge:", id1, id2);
        if (id1 < id2) {
            if (!(id1 in this.edges)) {
                this.edges[id1] = {};
            }
            this.edges[id1][id2] = new Edge(id1, id2);
        } else if (id2 < id1) {
            if (!(id2 in this.edges)) {
                this.edges[id2] = {};
            }
            this.edges[id2][id1] = new Edge(id2, id1);
        }
    },
    mergeNodes: function (fromId, toId) {
        console.log("merge:", fromId, toId);
        for (const id1 in this.edges) {
            for (const id2 in this.edges[id1]) {
                const edge = this.edges[id1][id2];
                if (edge.id1 === fromId && edge.id2 !== toId) {
                    this.addEdge(toId, edge.id2);
                } else if (edge.id2 === fromId && edge.id1 !== toId) {
                    this.addEdge(toId, edge.id1);
                }
            }
        }

        this.removeNode(fromId);
    },
    reset: function () {
        this.count = 0;
        this.nodes = {};
        this.edges = {};
    }
};
