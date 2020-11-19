// given a polyhedron and selected edges, returns a FOLD json that corresponds
// to the same polyhedron with these edges cut.
// this requires to re-assign vertices - as cut edges might or might not lead to new vertices
// in the unfolded state
// to do so, we start by multiplting all vertices by all their faces, and then
// joining vertices that still share an UNCUT edge
function exportToFold(polyhedron, edges) {
  // first, we create a new vector where every vertex is multplied by the number of faces its in
  var new_v = [];
  var old_v_to_new_v = {}; // key is [vertex_id, face_id]
  for (var i = 0; i < polyhedron.face.length; i++) {
    let f = polyhedron.face[i];
    for (var j = 0; j < f.length; j++) {
      old_v_to_new_v[[f[j], i]] = new_v.length;
      new_v.push(f[j]);
    }
  }

  // now we unify every pair of [vertex, face1] [vertex, face2] if those two faces
  // share an UNCUT edge
  // to do so, we use disjoint set data structure
  var disjointSet = new DisjointSet(new_v.length);
  for (var uuid in edges) {
    if (!edges[uuid].selected) {
      // if the edge still exists - unite the vertices on both side of it
      let v1 = polyhedron.edge[edges[uuid].index][0];
      let v2 = polyhedron.edge[edges[uuid].index][1];
      let f1 = edges[uuid].edge_faces[0];
      let f2 = edges[uuid].edge_faces[1];

      console.log("Union vertices", v1, v2, " of faces ", f1, f2);
      disjointSet.union(old_v_to_new_v[[v1, f1]], old_v_to_new_v[[v1, f2]]);
      disjointSet.union(old_v_to_new_v[[v2, f1]], old_v_to_new_v[[v2, f2]]);
    }
  }

  // now, create a new vertex vector, one vertex per disjoint set
  var vertices_coords = [];
  var parent_to_coord = {};
  for (var i = 0; i < new_v.length; i++) {
    let parent = disjointSet.find(i);
    if (!(parent in parent_to_coord)) {
      parent_to_coord[parent] = vertices_coords.length;
      vertices_coords.push(polyhedron.vertex[new_v[i]]);
    }
  }

  // next, create updated edge data structures with the new vertex mappings
  var edges_vertices = [];
  var edges_assignment = [];
  var edges_foldAngle = [];
  for (var uuid in edges) {
    var eIdx = edges[uuid].index;
    let v1 = polyhedron.edge[eIdx][0];
    let v2 = polyhedron.edge[eIdx][1];
    let f1 = edges[uuid].edge_faces[0];
    let f2 = edges[uuid].edge_faces[1];

    // if edge is cut - split it into two boundary edges, with the correct vertex assignment
    if (edges[uuid].selected) {
      let new_v1_f1 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v1, f1]])];
      let new_v2_f1 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v2, f1]])];
      let new_v1_f2 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v1, f2]])];
      let new_v2_f2 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v2, f2]])];

      edges_vertices.push([new_v1_f1, new_v2_f1]);
      edges_assignment.push("B");
      edges_foldAngle.push(0);

      edges_vertices.push([new_v1_f2, new_v2_f2]);
      edges_assignment.push("B");
      edges_foldAngle.push(0);
    } else {
      // otherwise, keep it as one edge with the correct folding angle
      let new_v1 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v1, f1]])];
      let new_v2 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v2, f1]])];

      edges_vertices.push([new_v1, new_v2]);
      edges_assignment.push("M");
      edges_foldAngle.push(-180+edges[uuid].angle);
    }
  }

  // last, create the face vector
  // usually, we would just transform the vertices
  // however, origami simulator seems to have a hard time with non triangular faces
  // so... we triangulate the mesh, adding flat edges (0 degrees) for every face that has more than three faces
  // this requires new vertices and new edges (for every face that has more than 3 vertices)
  var faces_vertices = [];
  for (var i = 0; i < polyhedron.face.length; i++) {
    if (polyhedron.face[i].length == 3) {
      var f = [];
      for (var j = 0; j < polyhedron.face[i].length; j++) {
        let new_v = parent_to_coord[disjointSet.find(old_v_to_new_v[[polyhedron.face[i][j], i]])];
        f.push(new_v);
      }
      faces_vertices.push(f);
    } else {
      // calculate the center of the face
      let f = polyhedron.face[i];
      var center_v = [0, 0, 0];
      for (var j = 0; j < f.length; j++) {
        let v = vertices_coords[parent_to_coord[disjointSet.find(old_v_to_new_v[[f[j], i]])]];
        center_v[0] += v[0];
        center_v[1] += v[1];
        center_v[2] += v[2];
      }
      center_v[0] /= f.length;
      center_v[1] /= f.length;
      center_v[2] /= f.length;

      let center_v_idx = vertices_coords.length;
      // add the center vertex
      vertices_coords.push(center_v);

      for (var j = 0; j < f.length; j++) {
        let v1 = parent_to_coord[disjointSet.find(old_v_to_new_v[[f[j], i]])];
        let v2 = parent_to_coord[disjointSet.find(old_v_to_new_v[[f[(j + 1) % f.length], i]])];

        // add a new edge
        edges_vertices.push([v1, center_v_idx]);
        edges_assignment.push("F");
        edges_foldAngle.push(0);

        // add the triangular face
        let new_face = [v1, v2, center_v_idx];
        faces_vertices.push(new_face);
      }
    }

  }

  var fold = {
    file_spec : 1.1,
    file_creator : "EDGE UNFOLDER v0.1",
    file_classes : ["singleModel"],
    frame_classes: ["foldedForm"],
    frame_attributes: ["3D"],
    vertices_coords : vertices_coords,
    faces_vertices : faces_vertices,
    edges_vertices : edges_vertices,
    edges_assignment : edges_assignment,
    edges_foldAngle : edges_foldAngle
  }

  return fold;
}

var simulator, ready, onReady;
function simulate(polyhedron, edges) {
  var fold = exportToFold(polyhedron, edges);
  if(simulator && !simulator.closed) {
    simulator.focus();
  } else {
    ready = false;
    simulator = window.open('https://origamisimulator.org/?model=', 'simulator');
  }
  onReady = function() {
    simulator.postMessage({op: 'importFold', fold: fold}, '*');
  }
  checkReady();
}
function checkReady() {
  if(ready && onReady) {
    onReady();
    onReady = null;
  }
}
window.addEventListener('message', function(e) {
  if(e.data && e.data.from === 'OrigamiSimulator' && e.data.status === 'ready') {
    ready = true;
    checkReady();
  }
});
