const graphs = {
    triangle: {
        nodes: [{id: 0}, {id: 1}, {id: 2}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 0, weight: 1}
        ]
    },
    square: {
        nodes: [{id: 0}, {id: 1}, {id: 2}, {id: 3}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 3, weight: 1},
            {source: 3, target: 0, weight: 1}
        ]
    },
    pentagon: {
        nodes: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 3, weight: 1},
            {source: 3, target: 4, weight: 1},
            {source: 4, target: 0, weight: 1}
        ]
    },
    hexagon: {
        nodes: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 3, weight: 1},
            {source: 3, target: 4, weight: 1},
            {source: 4, target: 5, weight: 1},
            {source: 5, target: 0, weight: 1}
        ]
    },
    petersen: {
        nodes: d3.range(10).map(i => ({id: i})),
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 3, weight: 1},
            {source: 3, target: 4, weight: 1},
            {source: 4, target: 0, weight: 1},
            {source: 5, target: 6, weight: 1},
            {source: 6, target: 7, weight: 1},
            {source: 7, target: 8, weight: 1},
            {source: 8, target: 9, weight: 1},
            {source: 9, target: 5, weight: 1},
            {source: 0, target: 5, weight: 1},
            {source: 1, target: 6, weight: 1},
            {source: 2, target: 7, weight: 1},
            {source: 3, target: 8, weight: 1},
            {source: 4, target: 9, weight: 1}
        ]
    },
    complete10: {
        nodes: d3.range(10).map(i => ({id: i})),
        links: []
    }
};

// Generate links for complete10
for (let i = 0; i < 10; i++) {
    for (let j = i + 1; j < 10; j++) {
        graphs.complete10.links.push({source: i, target: j, weight: 1});
    }
}

let currentGraph = null;
let simulation = null;
let svg = null;

const container = d3.select("#graph-container");
const width = container.node().getBoundingClientRect().width;
const height = 700;

function computeSums() {
    currentGraph.nodes.forEach(node => {
        node.sum = currentGraph.links
            .filter(link => link.source.id === node.id || link.target.id === node.id)
            .reduce((sum, link) => sum + link.weight, 0);
    });
}

function update() {
    computeSums();
    svg.selectAll(".link text").text(d => d.weight);
    svg.selectAll(".node text").text(d => d.sum);
    const hasConflict = currentGraph.links.some(d => d.source.sum === d.target.sum);
    svg.selectAll(".link").classed("red", d => d.source.sum === d.target.sum).classed("green", !hasConflict);
}

function drawGraph(graphKey) {
    currentGraph = JSON.parse(JSON.stringify(graphs[graphKey])); // deep copy

    // Resolve link source/target to node objects
    currentGraph.links.forEach(link => {
        link.source = currentGraph.nodes.find(n => n.id === link.source);
        link.target = currentGraph.nodes.find(n => n.id === link.target);
    });

    computeSums();

    if (svg) svg.remove();
    svg = container.append("svg").attr("width", width).attr("height", height);

    const defs = svg.append("defs");

    const filter = defs.append("filter")
        .attr("id", "green-glow")
        .attr("x", "-200%")
        .attr("y", "-200%")
        .attr("width", "400%")
        .attr("height", "400%");

    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 6)
        .attr("result", "blur");

    filter.append("feColorMatrix")
        .attr("in", "blur")
        .attr("type", "matrix")
        .attr("values", `
            0 0 0 0 0
            0 1 0 0 0
            0 0 0 0 0
            0 0 0 1 0
        `)
        .attr("result", "greenBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "greenBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        
    const link = svg.selectAll(".link")
        .data(currentGraph.links)
        .enter().append("g")
        .attr("class", "link");

    link.append("line");

    link.append("text")
        .attr("dy", -5)
        .text(d => d.weight);

    link.on("click", function(event, d) {
        d.weight = Math.min(20, d.weight + 1);
        update();
    });

    link.on("contextmenu", function(event, d) {
        event.preventDefault();
        d.weight = Math.max(1, d.weight - 1);
        update();
    });

    const node = svg.selectAll(".node")
        .data(currentGraph.nodes)
        .enter().append("g")
        .attr("class", "node");

    node.append("circle")
        .attr("r", 25);

    node.append("text")
        .text(d => d.sum);

    simulation = d3.forceSimulation(currentGraph.nodes)
        .force("link", d3.forceLink(currentGraph.links)
            .id(d => d.id)
            .distance(220)          // vorher 150
            .strength(0.8)
        )
        .force("charge", d3.forceManyBody()
            .strength(-900)         // vorher -400
        )
        .force("collision", d3.forceCollide()
            .radius(40)             // Kreisradius 25 → also >25
            .strength(1)
        )
        .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
        link.select("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        link.select("text")
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    update(); // Set initial classes and texts
}

d3.select("#graph-select").on("change", function() {
    const selected = d3.select(this).property("value");
    drawGraph(selected);
});

// Initial draw
drawGraph("triangle");