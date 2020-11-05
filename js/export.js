// given a polyhedron and selected edges, returns a FOLD json that corresponds
// to the same polyhedron with these edges cut
// (re-assigns new vertices)
function exportToFold(polyhedron, edges) {
  var new_v = [];
  var old_v_to_new_v = {}; // key is [vertex_id, face_id]
  for (var i = 0; i < polyhedron.face.length; i++) {
    let f = polyhedron.face[i];
    for (var j = 0; j < f.length; j++) {
      old_v_to_new_v[[f[j], i]] = new_v.length;
      new_v.push(f[j]);
    }
  }

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

    // if edge is selected - split it to two Boundary edges, and split the vertices, and change the faces...
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
      let new_v1 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v1, f1]])];
      let new_v2 = parent_to_coord[disjointSet.find(old_v_to_new_v[[v2, f1]])];

      edges_vertices.push([new_v1, new_v2]);
      edges_assignment.push("M");
      edges_foldAngle.push(-edges[uuid].angle);
    }
  }

  // last, create a new face vector, just with the updated vertex indices
  var faces_vertices = [];
  for (var i = 0; i < polyhedron.face.length; i++) {
    var f = [];
    for (var j = 0; j < polyhedron.face[i].length; j++) {
      let new_v = parent_to_coord[disjointSet.find(old_v_to_new_v[[polyhedron.face[i][j], i]])];
      f.push(new_v);
    }
    faces_vertices.push(f);
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
