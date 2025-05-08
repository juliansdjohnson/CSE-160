class Triangle3D {
  	constructor(options) {
  	this.type='cube';
		return;
	}
	
	
	static drawTriangles(vertices, colors) {
	
		// vertices
		let vertex_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

		
		
		gl.enableVertexAttribArray(a_Position);

		gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

		
		// colors
		let color_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

		
		gl.enableVertexAttribArray(a_Color);

		
				
// 		size = 3;
// 		type = gl.FLOAT;
// 		normalize = false;
// 		vstride = 0;
// 		offset = 0;
		
		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0)		
	
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
	}
	
	static draw(vertices, color) {
		let n = 3;
  
  	// create a buffer object
  	let vertexBuffer = gl.createBuffer();
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