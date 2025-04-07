# Edge Unfolder

Edge Unfolder allows users to unfold a polyhedron into a 2D net
by cutting along its edges.

1. **Input:** You start by choosing a polyhedron from the list
   (which includes all [Johnson solids](https://en.wikipedia.org/wiki/Johnson_solid)),
   or by uploading your own polyhedron in
   [OBJ format](https://en.wikipedia.org/wiki/Wavefront_.obj_file).
2. **Cutting:** Next you can cut edges by clicking on them.
   * The cut edges will be highlighted in cyan.
   * Edges that are required for connectivity (so should not be cut)
     will be highlighted in yellow.
   * Alternatively, the Cut Assignment button will automatically
     cut edges until the polyhedron unfolds into one flat piece
     (possibly with overlap).
3. **Unfolding:** If you're in the default Live unfolding mode,
   then the polyhedron will partially unfold as you cut enough edges to unfold.
   (If you switch to Static mode, then the polyhedron will remain folded.)
   When you complete an unfolding, you can export it to SVG,
   [FOLD](https://github.com/edemaine/fold),
   or [Origami Simulator](https://origamisimulator.org/).

## Credits

The Johnson solid polyhedron data comes from JSON files from
[Lee Stemkoski's Demo](https://stemkoski.github.io/Three.js/Polyhedra.html),
which in turn is based on George Hart's
[Virtual Polyhedra: The Encyclopedia of Polyhedra](https://georgehart.com/virtual-polyhedra/vp.html).

This project was done by Joonhaeng Lee and Eyal Perry in the context of
[MIT class 6.849: Geometric Folding Algorithms: Linkages, Origami, Polyhedra
held in Fall 2020](https://courses.csail.mit.edu/6.849/fall20/).
