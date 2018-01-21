function Graphviz(outer_div, canvas_width, margin_ratio, node_radius,
                  node_color, camera_distance, camera_step, theta) {
    this.outer_div = document.getElementById(outer_div);
    this.canvas_size = canvas_width;
    this.margin_ratio = margin_ratio;
    this.node_radius = node_radius;
    this.node_color = node_color;
    this.camera_distance = camera_distance;
    this.default_camera_distance = camera_distance;
    this.camera_step = camera_step;
    this.theta = Math.abs(theta);
    this.sin_theta = Math.sin(theta); // precompute
    this.cos_theta = Math.cos(theta);
    this.learning_rate = .01;

    this.outer_div.innerHTML = '<table cellspacing="0"><tr>'
        + '<td><canvas/></td>' + '<td><select></select>'
        + '<button type="button"></button></td>' + '<td><div/></td>'
        + '</tr></table>';
    var table_row = this.outer_div.firstChild.firstChild.firstChild;
    this.canvas = table_row.firstChild.firstChild;
    this.canvas.width = this.canvas_size;
    this.canvas.height = this.canvas_size; // always a square

    this.menu = table_row.firstChild.nextSibling.firstChild;
    this.menu.innerHTML =
          '<option value="setNormal_4"  selected="selected" >正四面体</option>'
        + '<option value="setNormal_6">正六面体</option>'
        + '<option value="setNormal_8">正八面体</option>'
        + '<option value="setNormal_12">正十二面体</option>'
        + '<option value="setNormal_20">正二十面体</option>';

    this.submit_button = table_row.firstChild.nextSibling.lastChild;
    this.submit_button.innerHTML = "如果看不清楚,请点击";

    this.coordinateDiv = table_row.lastChild.firstChild;

    var obj = this;
    // TODO: Make this only the case when mouse is over
    document.body.onkeypress = function (event) {
        obj.keyPress(event);
    }
    this.submit_button.onclick = function (event) {
        obj.setGraphSelection(event);
    }
    this.menu.onchange = function (event) {
        obj.setGraphSelection(event);
    }
    setInterval(function () {
        obj.doIteration();
    }, 100);
}

Graphviz.prototype.sameKey = function (code, key) {
    var CASE_DIFFERENCE = 32;
    return code == key || code == key + CASE_DIFFERENCE;
}

Graphviz.prototype.keyPress = function (event) {
    var UP = 87; // W
    var LEFT = 65; // A
    var RIGHT = 68; // D
    var DOWN = 83; // S
    var VAR_LEFT = 81; // Q
    var VAR_RIGHT = 69; // E
    var CAMERA_IN = 75; // K
    var CAMERA_OUT = 74; // J
    var code = event.keyCode;
    var redraw = true;
    if (this.sameKey(code, LEFT)) {
        this.rotate(this.basis, this.basis[1], -this.theta);
    } else if (this.sameKey(code, DOWN)) {
        this.rotate(this.basis, this.basis[0], -this.theta);
    } else if (this.sameKey(code, UP)) {
        this.rotate(this.basis, this.basis[0], this.theta);
    } else if (this.sameKey(code, RIGHT)) {
        this.rotate(this.basis, this.basis[1], this.theta);
    } else if (this.sameKey(code, VAR_LEFT)) {
        this.rotate(this.basis,
            this.crossProduct(this.basis[0], this.basis[1]), this.theta);
    } else if (this.sameKey(code, VAR_RIGHT)) {
        this.rotate(this.basis,
            this.crossProduct(this.basis[0], this.basis[1]), -this.theta);
    } else if (this.sameKey(code, CAMERA_IN)) {
        this.zoomIn();
    } else if (this.sameKey(code, CAMERA_OUT)) {
        this.zoomOut();
    } else {
        redraw = false;
    }
    if (redraw) {
        this.drawGraph();
    }
}

Graphviz.prototype.setGraphSelection = function (event) {
    if (this.menu.value == "setNormal_4") {
        this.setNormal_4();
    } else if (this.menu.value == "setNormal_6") {
        this.setNormal_6();
    } else if (this.menu.value == "setNormal_8") {
        this.setNormal_8();
    } else if (this.menu.value == "setNormal_12") {
        this.setNormal_12();
    } else if (this.menu.value == "setNormal_20") {
        this.setNormal_20();
    }

    this.menu.blur();
    this.drawGraph();
}

Graphviz.prototype.setNormal_4 = function () {
    this.setGraphWithoutCoordinates(4, [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1],
    ]);
}
Graphviz.prototype.setNormal_6 = function () {
    this.setGraphWithoutCoordinates(8, [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
    ]);
}
Graphviz.prototype.setNormal_8 = function () {
    this.setGraphWithoutCoordinates(6, [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [5, 1], [5, 2], [5, 3], [5, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
    ]);
}
Graphviz.prototype.setNormal_12 = function () {
    this.setGraphWithoutCoordinates(20, [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
        [0, 5], [1, 7], [2, 9], [3, 11], [4, 13],
        [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 5],
        [15, 16], [16, 17], [17, 18], [18, 19], [19, 15],
        [15, 6], [16, 8], [17, 10], [18, 12], [19, 14],
    ]);
}
Graphviz.prototype.setNormal_20 = function () {
    this.setGraphWithoutCoordinates(12, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 1],
        [1, 6], [1, 7], [2, 7], [2, 8], [3, 8], [3, 9], [4, 9], [4, 10], [5, 10], [5, 6],
        [6, 7], [7, 8], [8, 9], [9, 10], [10, 6],
        [11, 6], [11, 7], [11, 8], [11, 9], [11, 10],
    ]);
}


Graphviz.prototype.start = function () {
    this.setGraphSelection();
}

Graphviz.prototype.setGraphSMT = function () {
    var nodes = [[.5, -Math.sqrt(3) / 2, 0], [0, 0, 0], [1, 0, 0],
        [.5, Math.sqrt(3) / 2, 0], [0, 0, .5], [1, 0, 1], [0, 0, 1]];
    var edges = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6]];
    var basis = [[1, 0, 0], [0, 1, 0]];
    this.setGraph(nodes, edges, basis);
}

Graphviz.prototype.setGraph = function (nodes, edges, basis) {
    this.nodes = nodes;
    this.edges = edges;
    this.basis = basis;
    // this.spring_constant = nodes.length / edges.length;
    // If all nodes are about constant distance apart, this makes
    // a fair balance between attractive & repulsive forces
    this.spring_constant = 10;
}

Graphviz.prototype.makeRandomNode = function () {
    var node = [];
    for (var i = 0; i < 3; ++i) {
        node.push(Math.random());
    }
    return node;
}

Graphviz.prototype.setGraphWithoutCoordinates = function (n, edges) {
    nodes = [];
    for (var i = 0; i < n; ++i) {
        nodes.push(this.makeRandomNode());
    }
    this.setGraph(nodes, edges, [[1, 0, 0], [0, 1, 0]]);
}

Graphviz.prototype.drawGraph = function () {
    this.canvas.getContext("2d").clearRect(0, 0, this.canvas_size,
        this.canvas_size);
    this.drawGraph3d(this.nodes, this.edges, this.basis);
}

// Fit everything in the sphere S^{n-1}
Graphviz.prototype.normalizeNodes = function (nodes) {
    if (nodes.length == 0)
        return [];
    var means = [];
    for (var i = 0; i < nodes[0].length; ++i) {
        means.push(0);
    }
    for (var i = 0; i < nodes.length; ++i) {
        for (var j = 0; j < nodes[0].length; ++j) {
            means[j] += nodes[i][j] / nodes.length;
        }
    }
    var max_dist_squared = 0;
    for (var i = 0; i < nodes.length; ++i) {
        var dist_squared = 0;
        for (var j = 0; j < nodes[i].length; ++j) {
            var delta = nodes[i][j] - means[j];
            dist_squared += delta * delta;
        }
        if (dist_squared > max_dist_squared) {
            max_dist_squared = dist_squared;
        }
    }
    var max_norm = Math.sqrt(max_dist_squared);
    var normalized_nodes = []
    for (var i = 0; i < nodes.length; ++i) {
        var normalized_node = [];
        for (var j = 0; j < nodes[i].length; ++j) {
            var normalized_coord = (nodes[i][j] - means[j]) * this.margin_ratio
                / max_norm;
            normalized_node.push(normalized_coord);
        }
        normalized_nodes.push(normalized_node);
    }
    return normalized_nodes;
}

// Converts the array of normalized coordinates
// To pixels on the canvas, modifies by reference
Graphviz.prototype.convertNormalizedToPixels = function (nodes) {
    for (var i = 0; i < nodes.length; ++i) {
        for (var j = 0; j < nodes[0].length; ++j) {
            nodes[i][j] = (nodes[i][j] + 1) * this.canvas_size / 2;
        }
    }
}

Graphviz.prototype.drawEdges = function (nodes, edges) {
    var ctx = this.canvas.getContext("2d")
    ctx.beginPath()

    for (var i = 0; i < edges.length; ++i) {
        var pt1 = nodes[edges[i][0]];
        var pt2 = nodes[edges[i][1]];
        ctx.moveTo(pt1[0], pt1[1]);
        ctx.lineTo(pt2[0], pt2[1]);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#35ff5c';
    ctx.stroke();
}

Graphviz.prototype.drawNodes = function (nodes) {
    for (var i = 0; i < nodes.length; ++i) {
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.node_color;
        ctx.beginPath();
        ctx.arc(nodes[i][0], nodes[i][1], this.node_radius, 0, Math.PI * 2,
            true);
        ctx.closePath();
        ctx.fill();
    }
}

Graphviz.prototype.drawGraph2d = function (nodes, edges) {
    var normalized_nodes = this.normalize_nodes(nodes);
    this.convertNormalizedToPixels(normalized_nodes);
    this.drawEdges(normalized_nodes, edges);
    this.drawNodes(normalized_nodes);
}

Graphviz.prototype.dotProduct = function (one, two) {
    var ans = 0;
    if (one.length == two.length) {
        for (var i = 0; i < one.length; ++i) {
            ans += one[i] * two[i];
        }
    }
    return ans;
}

// Precondition: basis is an orthonormal basis for the subspace of R3
// we're projecting onto,
// nodes are points in R3 contained inside B_1(0)
Graphviz.prototype.projectNodesOrthogonal = function (nodes, basis) {
    var projected_nodes = [];
    for (var i = 0; i < nodes.length; ++i) {
        var projection = [];
        for (var j = 0; j < basis.length; ++j) {
            projection.push(this.dotProduct(basis[j], nodes[i]));
        }
        projected_nodes.push(projection);
    }
    return projected_nodes;
}

Graphviz.prototype.crossProduct = function (a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]];
}

Graphviz.prototype.projectNodesPerspective = function (nodes, basis) {
    // Make the full basis of R3
    var full_basis = [basis[0], basis[1],
        this.crossProduct(basis[0], basis[1])];
    var basis_coordinates = this.projectNodesOrthogonal(nodes, full_basis);
    var perspective_coordinates = [];
    for (var i = 0; i < basis_coordinates.length; ++i) {
        var scale = this.default_camera_distance
            / (basis_coordinates[i][2] + this.camera_distance);
        var x = basis_coordinates[i][0] * scale;
        var y = basis_coordinates[i][1] * scale;
        perspective_coordinates.push([x, y]);
    }
    return perspective_coordinates;
}

Graphviz.prototype.drawGraph3d = function (nodes, edges, basis) {
    var normalized_nodes = this.normalizeNodes(nodes);
    // var projected_nodes = this.projectNodesOrthogonal(normalized_nodes,
    // basis);
    var projected_nodes = this.projectNodesPerspective(normalized_nodes, basis);
    this.convertNormalizedToPixels(projected_nodes);
    this.drawEdges(projected_nodes, edges);
    this.drawNodes(projected_nodes);

    // DEBUGGING CODE
    /*
     * coordinateStr = ""; for (var i = 0; i < projected_nodes.length; ++i) {
     * coordinateStr += Math.round(projected_nodes[i][0]) + ', ' +
     * Math.round(projected_nodes[i][1]) + '<br>' }
     * this.coordinateDiv.innerHTML = coordinateStr;
     */
}

// Makes a rotation matrix around the given axis of theta rads
// Likely: that |theta| = this.theta and sin/cos is precomputed
Graphviz.prototype.makeRotationMatrix = function (axis, theta) {
    if (theta == this.theta) {
        var sin = this.sin_theta;
        var cos = this.cos_theta;
    } else if (-theta == this.theta) {
        var sin = -this.sin_theta;
        var cos = this.cos_theta;
    } else {
        var sin = Math.sin(theta);
        var cos = Math.cos(theta);
    }
    return [
        [cos + axis[0] * axis[0] * (1 - cos),
            axis[0] * axis[1] * (1 - cos) - axis[2] * sin,
            axis[0] * axis[2] * (1 - cos) + axis[1] * sin],
        [axis[1] * axis[0] * (1 - cos) + axis[2] * sin,
            cos + axis[1] * axis[1] * (1 - cos),
            axis[1] * axis[2] * (1 - cos) - axis[0] * sin],
        [axis[2] * axis[0] * (1 - cos) - axis[1] * sin,
            axis[2] * axis[1] * (1 - cos) + axis[0] * sin,
            cos + axis[2] * axis[2] * (1 - cos)]];
}

// Matrices should be specified row-major
Graphviz.prototype.matrixVectorMultiply = function (matrix, vector) {
    ans = [];
    for (var i = 0; i < matrix.length; ++i) {
        ans.push(this.dotProduct(matrix[i], vector));
    }
    return ans;
}

// Precondition: basis is an orthonormal pair of vectors in R3
// Likely: that axis is one of these two vectors
Graphviz.prototype.rotate = function (basis, axis, theta) {
    var rotation_matrix = this.makeRotationMatrix(axis, theta);
    for (var i = 0; i < basis.length; ++i) {
        // basis.length == 2 is expected
        if (basis[i] != axis) {
            basis[i] = this.matrixVectorMultiply(rotation_matrix, basis[i]);
        }
    }
}

Graphviz.prototype.zoomIn = function () {
    if (this.camera_distance > 1 + this.camera_step) {
        this.camera_distance -= this.camera_step;
    }
}

Graphviz.prototype.zoomOut = function () {
    this.camera_distance += this.camera_step;
    console.log(this.nodes);
}

Graphviz.prototype.vectorAddTo = function (a, b) {
    for (var i = 0; i < a.length; ++i) {
        a[i] = a[i] + b[i];
    }
}

Graphviz.prototype.vectorSubtract = function (a, b) {
    var diff = [];
    for (var i = 0; i < a.length; ++i) {
        diff.push(a[i] - b[i]);
    }
    return diff;
}

Graphviz.prototype.scalarMultiply = function (k, x) {
    for (var i = 0; i < x.length; ++i) {
        x[i] = k * x[i];
    }
}

Graphviz.prototype.scalarMultiple = function (k, x) {
    var ans = [];
    for (var i = 0; i < x.length; ++i) {
        ans.push(k * x[i]);
    }
    return ans;
}

Graphviz.prototype.magnitudeSquared = function (v) {
    return this.dotProduct(v, v);
}

Graphviz.prototype.repulsiveForce = function (target, other) {
    var diff = this.vectorSubtract(target, other);
    var magnitude_squared = this.magnitudeSquared(diff);
    this.scalarMultiply(1 / (magnitude_squared * Math.sqrt(magnitude_squared)),
        diff);
    return diff;
}

Graphviz.prototype.computeRepulsionOnNode = function (n) {
    step = [0, 0, 0];
    for (var i = 0; i < this.nodes.length; ++i) {
        if (i == n)
            continue;
        this.vectorAddTo(step, this
            .repulsiveForce(this.nodes[n], this.nodes[i]));
    }
    return step;
}

Graphviz.prototype.addAttraction = function (steps, edge) {
    var diff = this.vectorSubtract(this.nodes[edge[0]], this.nodes[edge[1]]);
    this.vectorAddTo(steps[edge[0]], this.scalarMultiple(-this.spring_constant,
        diff));
    this.vectorAddTo(steps[edge[1]], this.scalarMultiple(this.spring_constant,
        diff));
}

Graphviz.prototype.doIteration = function () {
    steps = [];
    for (var i = 0; i < this.nodes.length; ++i) {
        steps.push(this.computeRepulsionOnNode(i));
    }
    for (var i = 0; i < this.edges.length; ++i) {
        this.addAttraction(steps, this.edges[i]);
    }
    for (var i = 0; i < this.nodes.length; ++i) {
        this.vectorAddTo(this.nodes[i], this.scalarMultiple(this.learning_rate,
            steps[i]));
    }
    this.drawGraph();
}