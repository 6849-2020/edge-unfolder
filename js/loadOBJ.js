/**
 * Created by joonhaengLee on 11/16/20
 */

// LoadOBJ
// Read the file uploaded into 'myInput' line by line and save data, only v and f, in userOBJ

// computeOBJ
// remove duplicated vertices, create json data with vertex, face, and edge

function loadOBJ() {
    return new Promise(resolve => {

        userOBJ = {
            "name":"userOBJ",
            "category":["Custom"],
            "vertex":[],
            "read_vertex":[],
            "edge":[],
            "face":[],
            "read_face":[]
        }

        //console.log("loadOBJ Start!")

        // Your code here
        var file = document.getElementById('myInput').files[0]
        var reader = new FileReader();
        reader.onload = function (progressEvent) {

            // By lines
            var lines = this.result.split('\n');
            for (var line = 0; line < lines.length; line++) {

                lineFirstChar = lines[line].charAt(0);
                if (lineFirstChar === 'v') {

                    var data = lines[line].split(/\s+/);

                    switch (data[0]) {

                        case 'v':
                            userOBJ.read_vertex.push(
                                parseFloat(data[1]),
                                parseFloat(data[2]),
                                parseFloat(data[3])
                            );

                            break;

                    }


                } else if (lineFirstChar === 'f') {

                    // you are in single line now.
                    var lineData = lines[line].substr(1).trim();
                    var vertexData = lineData.split(/\s+/);
                    var faceVertices = [];

                    // Parse the face vertex data into an easy to work with format

                    for (var j = 0, jl = vertexData.length; j < jl; j++) {

                        var vertex = vertexData[j];
                        if (vertex.length > 0) {
                            var vertexParts = vertex.split('/');
                            faceVertices.push(parseInt(vertexParts[0]));
                        }
                    }
                    userOBJ.read_face.push(faceVertices)
                }
            }
        }
        reader.readAsText(file);

        // this part to be update
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}

// computeOBJ
// Read the file uploaded into 'myInput' line by line and save data in userOBJ

function computeOBJ(){
    return new Promise(resolve => {
        console.log("compute OBJ Start!")
        console.log(userOBJ.read_vertex.length)
        console.log(userOBJ.read_face.length)

        // Now remove duplicated vertices from both vertexList and faceList
        var vertexList = [];
        var faceList = [];
        var edgeList = [];
        var temp = [];
        var tempVIndex = []
        var duplicatedFlag = 0;
        var tempVIndexMax = 0

        for (i = 0; i < userOBJ.read_vertex.length / 3; i++) {
            temp.push(userOBJ.read_vertex.slice(i * 3, i * 3 + 3))
        }

        // compute duplicate vertices and create vertex list
        for (i = 0; i < temp.length; i++) {

            if (i == 0) {
                vertexList.push(temp[i])
                tempVIndex.push(0)

            } else {
                // is it duplicated?
                for (j = 0; j < vertexList.length; j++) {
                    var a = vertexList[j][0] - temp[i][0];
                    var b = vertexList[j][1] - temp[i][1];
                    var c = vertexList[j][2] - temp[i][2];

                    if (a == 0 && b == 0 && c == 0) {
                        duplicatedFlag = 1;
                        break;
                    }
                }
                if (duplicatedFlag == 0) {
                    // Unique Vertex
                    vertexList.push(temp[i]);
                    tempVIndexMax += 1
                    tempVIndex.push(tempVIndexMax)

                } else {
                    // Dup Vertex
                    duplicatedFlag = 0;
                    tempVIndex.push(j)
                }
            }
        }

        for (i = 0; i < userOBJ.read_face.length ; i++){

            temp = []


            // If face has three vertices
            if (userOBJ.read_face[i].length == 3){
                for (j = 0; j < userOBJ.read_face[i].length ; j++){
                    temp.push(tempVIndex[userOBJ.read_face[i][j] - 1]) // add new index of vertex in temp
                    tempEdge = []
                    tempEdge.push(tempVIndex[userOBJ.read_face[i][j] - 1])
                    tempEdge.push(tempVIndex[userOBJ.read_face[i][(j+1)%3] - 1])
                    edgeList.push(tempEdge)

                }
                faceList.push(temp)
            }

            // rectangle face = > divide into 2 triangles
            else{
                console.log("FOUR")
                face1 = [userOBJ.read_face[i][0],userOBJ.read_face[i][1],userOBJ.read_face[i][2]]
                face2 = [userOBJ.read_face[i][2],userOBJ.read_face[i][3],userOBJ.read_face[i][0]]


                temp = []
                for (j = 0; j < face1.length ; j++){
                    temp.push(tempVIndex[face1[j] - 1]) // add new index of vertex in temp
                    tempEdge = []
                    tempEdge.push(tempVIndex[face1[j] - 1])
                    tempEdge.push(tempVIndex[face1[(j+1)%3] - 1])
                    edgeList.push(tempEdge)

                }
                faceList.push(temp)

                temp = []
                for (j = 0; j < face2.length ; j++){
                    temp.push(tempVIndex[face2[j] - 1]) // add new index of vertex in temp
                    tempEdge = []
                    tempEdge.push(tempVIndex[face2[j] - 1])
                    tempEdge.push(tempVIndex[face2[(j+1)%3] - 1])
                    edgeList.push(tempEdge)

                }
                faceList.push(temp)
            }
        }

        var finaledgeList = []
        for(i = 0; i <edgeList.length ; i++){

            if (i == 0 ) finaledgeList.push(edgeList[i])
            else{
                var dup = 0;
                for(j = 0; j <finaledgeList.length ; j++){
                    if( (edgeList[i][0] == finaledgeList[j][0]) + (edgeList[i][1] == finaledgeList[j][1]) + (edgeList[i][0] == finaledgeList[j][1]) + (edgeList[i][1] == finaledgeList[j][0]) == 2 ){
                        dup +=1;
                    }
                }
                if(dup ==0){
                    finaledgeList.push(edgeList[i])
                }
            }
        }

        userOBJ.vertex = vertexList
        userOBJ.face = faceList
        userOBJ.edge = finaledgeList

        //console.log("end")
        console.log(userOBJ)


        setTimeout(() => {
            resolve('resolved');
        }, 2000);

    });


}

