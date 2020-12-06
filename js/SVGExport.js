function drawSVG( boundaryEdges,creaseEdgesM,creaseEdgesV) {
    // Get a reference to the canvas object
    var canvas = document.getElementById('canvasSVG');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    var letter_X = 279.4;
    var letter_Y = 215.9;
    var padding = 10;

    var boundaryEdges_X = []
    var boundaryEdges_Y = []
    var creaseEdges_X = []
    var creaseEdges_Y = []

    // Create a Paper.js Path to draw a line into it:
    for( var i = 0 ; i < boundaryEdges.length ; i++ ){
        boundaryEdges_X.push(boundaryEdges[i][0])
        boundaryEdges_X.push(boundaryEdges[i][2])
        boundaryEdges_Y.push(boundaryEdges[i][1])
        boundaryEdges_Y.push(boundaryEdges[i][3])
    }


    boundaryEdges_X = boundaryEdges_X.sort(function(a, b){return a-b});
    boundaryEdges_Y = boundaryEdges_Y.sort(function(a, b){return a-b});

    var rangeX = boundaryEdges_X[boundaryEdges_X.length-1] - boundaryEdges_X[0];
    var rangeY = boundaryEdges_Y[boundaryEdges_Y.length-1] - boundaryEdges_Y[0];

    var scaleX =  (letter_X - padding) / rangeX
    var scaleY =  (letter_Y - padding) / rangeY

    var scale = Math.min(scaleX,scaleY)
    console.log( rangeX , rangeY )
    console.log( scaleX , scaleY )

    var translateX = - boundaryEdges_X[0] * scale + padding;
    var translateY = - boundaryEdges_Y[0] * scale + padding;

    for( var i = 0 ; i < boundaryEdges.length ; i++ ){
        var path = new paper.Path();
        path.strokeColor = 'black';
        var start = new paper.Point(boundaryEdges[i][0]*scale+translateX, boundaryEdges[i][1]*scale+translateY);
        var end = new paper.Point(boundaryEdges[i][2]*scale+translateX, boundaryEdges[i][3]*scale+translateY);
        path.moveTo(start);
        path.lineTo(end)
    }

    for( var i = 0 ; i < creaseEdgesM.length ; i++ ){

        var path = new paper.Path();
        path.strokeColor = 'red';
        var start = new paper.Point(creaseEdgesM[i][0]*scale+translateX, creaseEdgesM[i][1]*scale+translateY);
        var end = new paper.Point(creaseEdgesM[i][2]*scale+translateX, creaseEdgesM[i][3]*scale+translateY);
        path.moveTo(start);
        path.lineTo(end)

    }

    for( var i = 0 ; i < creaseEdgesV.length ; i++ ){

        var path = new paper.Path();
        path.strokeColor = 'blue';
        var start = new paper.Point(creaseEdgesV[i][0]*scale+translateX, creaseEdgesV[i][1]*scale+translateY);
        var end = new paper.Point(creaseEdgesV[i][2]*scale+translateX, creaseEdgesV[i][3]*scale+translateY);
        path.moveTo(start);
        path.lineTo(end)

    }

    paper.view.draw();
}