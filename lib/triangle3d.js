class Triangle3D {
  	constructor(options) {
  	this.type='cube';
		return;
	}
	
	static draw(vertices) {
		var n = 3;
  
  	// create a buffer object
  	var vertexBuffer = gl.createBuffer();
  	if (!vertexBuffer) {
  	  console.log('Failed to create the buffer object');
  	  return -1;
  	}


  	// link the buffer to openGL
  	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// write data into buffer object
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  	// Push and draw the triangle!
  	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

		// enable the assignment to a_Position variable
  	gl.enableVertexAttribArray(a_Position);


  	gl.drawArrays(gl.TRIANGLES, 0, n);
	}
	
}