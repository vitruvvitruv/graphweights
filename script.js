function createRandomLinks(nodeCount, probability) {
    const links = [];
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() < probability) {
                links.push({source: i, target: j, weight: 1});
            }
        }
    }
    return links;
}

const graphs = {
    triangle: {
        nodes: [{id: 0}, {id: 1}, {id: 2}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 0, weight: 1}
        ]
    },
    path: {
        nodes: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}],
        links: [
            {source: 0, target: 1, weight: 1},
            {source: 1, target: 2, weight: 1},
            {source: 2, target: 3, weight: 1},
            {source: 3, target: 4, weight: 1},
            {source: 4, target: 5, weight: 1},
            {source: 5, target: 6, weight: 1}
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
    petersen: {
        nodes: d3.range(10).map(i => ({id: i})),
        links: [
            {source: 0, target: 2, weight: 1},
            {source: 1, target: 3, weight: 1},
            {source: 2, target: 4, weight: 1},
            {source: 3, target: 0, weight: 1},
            {source: 4, target: 1, weight: 1},
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
    random10: {
        nodes: d3.range(10).map(i => ({id: i})),
        links: createRandomLinks(10, 0.4)
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
const height = container.node().getBoundingClientRect().height;
const nodeRadius = 25;

function positionNodesOnCircle(nodes, radius) {
    const angleStep = (2 * Math.PI) / nodes.length;
    nodes.forEach((node, index) => {
        node.x = width / 2 + radius * Math.cos(index * angleStep - Math.PI / 2);
        node.y = height / 2 + radius * Math.sin(index * angleStep - Math.PI / 2);
    });
}

function positionNodesOnLine(nodes) {
    const spacing = Math.min(width / (nodes.length + 1), 120);
    const startX = (width - spacing * (nodes.length - 1)) / 2;
    const y = height / 2;
    nodes.forEach((node, index) => {
        node.x = startX + index * spacing;
        node.y = y;
    });
}

function positionNodesOnTwoCircles(nodes, innerRadius, outerRadius) {
    const centerX = width / 2;
    const centerY = height / 2;
    const inner = nodes.slice(0, 5);
    const outer = nodes.slice(5, 10);
    const innerStep = (2 * Math.PI) / inner.length;
    const outerStep = (2 * Math.PI) / outer.length;

    inner.forEach((node, index) => {
        node.x = centerX + innerRadius * Math.cos(index * innerStep - Math.PI / 2);
        node.y = centerY + innerRadius * Math.sin(index * innerStep - Math.PI / 2);
    });

    outer.forEach((node, index) => {
        node.x = centerX + outerRadius * Math.cos(index * outerStep - Math.PI / 2);
        node.y = centerY + outerRadius * Math.sin(index * outerStep - Math.PI / 2);
    });
}

function applyFixedLayout(graphKey) {
    if (graphKey === "triangle") {
        positionNodesOnCircle(currentGraph.nodes, 180);
    } else if (graphKey === "pentagon") {
        positionNodesOnCircle(currentGraph.nodes, 180);
    } else if (graphKey === "petersen") {
        positionNodesOnTwoCircles(currentGraph.nodes, 140, 260);
    } else if (graphKey === "path") {
        positionNodesOnLine(currentGraph.nodes);
    }
}

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

    const fixedLayout = ["triangle", "path", "pentagon", "petersen"].includes(graphKey);
    if (fixedLayout) {
        applyFixedLayout(graphKey);
    }

    computeSums();

    if (svg) svg.remove();
    svg = container.append("svg").attr("width", width).attr("height", height);

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

    function renderPositions() {
        currentGraph.nodes.forEach(node => {
            node.x = Math.max(nodeRadius, Math.min(width - nodeRadius, node.x));
            node.y = Math.max(nodeRadius, Math.min(height - nodeRadius, node.y));
        });

        link.select("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        link.select("text")
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    if (!fixedLayout) {
        simulation = d3.forceSimulation(currentGraph.nodes)
            .force("link", d3.forceLink(currentGraph.links)
                .id(d => d.id)
                .distance(220)
                .strength(0.8)
            )
            .force("charge", d3.forceManyBody()
                .strength(-900)
            )
            .force("collision", d3.forceCollide()
                .radius(40)
                .strength(1)
            )
            .force("center", d3.forceCenter(width / 2, height / 2));

        simulation.on("tick", renderPositions);
    } else {
        renderPositions();
    }

    update(); // Set initial classes and texts
}

d3.select("#graph-select").on("change", function() {
    const selected = d3.select(this).property("value");
    drawGraph(selected);
});

// Initial draw
drawGraph("triangle");