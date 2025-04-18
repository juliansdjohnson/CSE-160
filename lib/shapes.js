// Shape class. Parent for the three brush shapes
class Shape{
  // variable-parameter constructor. expects an object with any of the following param.s
  // Vec3 position
  // Vec4 color
  // Float size
  constructor(options) {
    this.type='shape';
    this.position = options.position ? options.position : new Vector3([1.0, 1.0, 0.0]);
    this.color = options.color ? options.color : new Vector4([1.0, 1.0, 1.0, 1.0]);
    this.size = options.size ? options.size : 1.0;
  }

  // dummy.
  render() {
    return;
  }
};

// Point class. expects an object with any of the following param.s
// Vec3 position
// Vec4 color
// Float size
class Point extends Shape {
  // variable-parameter constructor 
  constructor(options) {
    super(options);
    this.type='point';
  }

  render() {
    var xy = this.position.giveList();
    var rgba = this.color.giveList();
    var size = this.size;

    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
};

// Triangle class. expects an object with any of the following param.s
//  Vec3 position
//  Vec4 color
//  Float size
class Triangle extends Shape {
  constructor(options) {
    super(options);
    this.type='triangle';
  }

  render() {
    var xy = this.position.giveList();
    var rgba = this.color.giveList();
    var size = this.size;


    gl.uniform4f(u_FragColor, rgba[0] ,rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_Size, size);

    let d = this.size/200.0 // delta

    drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d ]);
  }
};


// Triangle class. expects an object with any of the following param.s
//  Vec3 position
//  Vec4 color
//  Float size
//  Float segments
class Circle extends Shape {
  constructor(options) {
    super(options);
    this.type='circle';
    this.segments = options.segments ? options.segments : 10;
  }

  render() {
    var xy = this.position.giveList();
    var rgba = this.color.giveList();
    var size = this.size;
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    var d = this.size/200.0;

    let angleStep=360/this.segments;
    for(var angle = 0; angle < 360; angle=angle+angleStep) {
      let centerPt = [ xy[0], xy[1] ];
      let angle1 = angle;
      let angle2 = angle + angleStep;

      let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
      let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];

      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
    }
  }

  
};

// Helper function
function drawTriangle(vertices) {
  var n = 3;
  
  // create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // link the buffer to openGL
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Push and draw the triangle!
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);

}

