// brazenly and unethically stolen from our lab section.

import { Matrix4, Vector3 } from "./cuon-matrix-cse160.js";

export class Cube {
  constructor(position, rotation, scale, type) {
  
  	this.type = type;
  	this.texture = null;
  	if (this.type === "stone") {
  		this.texture = 1;
  	} else if (this.type === "grass") {
  		this.texture = 0;
  	}
  	
//   	this.program = program;
  	
  	
    this.vertices = null;
    this.uvs = null;
    this.vertexBuffer = null;
    this.uvBuffer = null;

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.modelMatrix = new Matrix4();

    this.setVertices();
    this.setUvs();
    
    this.faces = {};
  }

// 	setImage(gl, imagePath, index) {
// 		setImage
// 		
// 	
// 	}

  setVertices() {
  
    this.vertices = new Float32Array([
      //FRONT
      -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
      -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      //LEFT
      -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      //RIGHT
      0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
      0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
      //TOP
      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
      //BACK
      0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
      -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
      //BOTTOM
      -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
    ]);
  }

  setUvs() {

    this.uvs = new Float32Array([
      // FRONT
      0.5,0.25, 0.5,0.5, 0.25,0.5, 0.5, 0.25, 0.25,0.5, 0.25,0.25,
      // LEFT
      0.75,0, 0.75,0.25, 0.5,0.25, 0.75,0, 0.5,0.25, 0.5,0,
      // RIGHT
      0.5,0.75, 0.5,0.5, 0.75,0.5, 0.5,0.75, 0.75,0.5, 0.75,0.75,
      // TOP
      0.25,0.25, 0.25,0.5, 0,0.5, 0.25,0.25, 0,0.5, 0,0.25,
      // BACK //bca
      0.75,0.5, 1,0.5, 0.75,0.25, 0.75, 0.25, 1, 0.5, 1, 0.25,
      // BOTTOM 
      0.75,0.25, 0.75,0.5, 0.5,0.5, 0.75,0.25, 0.5,0.5, 0.5,0.25
    ]);
  }
  
  giveFace(dir) {
  
  	if (this.faces[dir]) {
  		return this.faces[dir];
  	} else {
  		let f = new Face(this, dir);
  		this.faces[dir] = f;
  		return f;
  	}
  }

  calculateMatrix() {
    let [x, y, z] = this.position.elements;
    let [rx, ry, rz] = this.rotation.elements;
    let [sx, sy, sz] = this.scale.elements;

    this.modelMatrix
      .setTranslate(x, y, z)
      .rotate(rx, 1, 0, 0)
      .rotate(ry, 0, 1, 0)
      .rotate(rz, 0, 0, 1)
      .scale(sx, sy, sz);
  }

  render(gl, camera) {
    this.calculateMatrix();
    
		//     gl.useProgram(this.program);

    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_UV = gl.getAttribLocation(gl.program, "a_UV");
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(
      gl.program,
      "u_ProjectionMatrix"
    );

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(
      u_ProjectionMatrix,
      false,
      camera.projectionMatrix.elements
    );

    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      if (!this.vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}

export class Face {
	// points to its parent cube, holds a direction.
	// possible directions:
	// +z, -z
	// +y, -y
	// +x, -x
	constructor(cube, direction) {
		this.cube = cube;
		this.direction = direction;
		
		this.type = cube.type;
		this.texture = cube.texture;

  	this.program = cube.program;
  	
    this.vertices = null;
    this.uvs = null;
    this.vertexBuffer = null;
    this.uvBuffer = null;

    this.position = cube.position
    this.rotation = cube.rotation
    this.scale = cube.scale
    this.modelMatrix = new Matrix4();

    this.setVertices(direction);
    this.setUvs(direction);
	}
	
	// relies HEAVILY on the current ordering of faces
	setVertices(direction) {
	
		switch (direction) {
			case("+z"):
				// FRONT
				this.vertices = this.cube.vertices.slice(0, 18);
				break;
			case("-x"):
				// LEFT
				this.vertices = this.cube.vertices.slice(18, 36);
				break;
			case("+x"):
				// RIGHT
				this.vertices = this.cube.vertices.slice(36,54);
				break;
			case("+y"):
				// TOP
				this.vertices = this.cube.vertices.slice(54,72);
				break;
			case("-z"):
				// BACK
				this.vertices = this.cube.vertices.slice(72,90);
				break;
			case("-y"):
				// BOTTOM
				this.vertices = this.cube.vertices.slice(90,108);
				break;
		}
	}
	
	
	setUvs(direction) {
	
		switch (direction) {
			case("+z"):
				// FRONT
				this.uvs = this.cube.uvs.slice(0, 12);
				break;
			case("-x"):
				// LEFT
				this.uvs = this.cube.uvs.slice(12, 24);
				break;
			case("+x"):
				// RIGHT
				this.uvs = this.cube.uvs.slice(24,36);
				break;
			case("+y"):
				// TOP
				this.uvs = this.cube.uvs.slice(36,48);
				break;
			case("-z"):
				// BACK
				this.uvs = this.cube.uvs.slice(48,60);
				break;
			case("-y"):
				// BOTTOM
				this.uvs = this.cube.uvs.slice(60,72);
				break;
		}
	}

	
  calculateMatrix() {
    let [x, y, z] = this.position.elements;
    let [rx, ry, rz] = this.rotation.elements;
    let [sx, sy, sz] = this.scale.elements;

    this.modelMatrix
      .setTranslate(x, y, z)
      .rotate(rx, 1, 0, 0)
      .rotate(ry, 0, 1, 0)
      .rotate(rz, 0, 0, 1)
      .scale(sx, sy, sz);
  }

	render(gl, camera) {
    this.calculateMatrix();
    
    const color = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    
		const u_Color = gl.getUniformLocation(gl.program, "u_Color");
		gl.uniform4fv(u_Color, color);

    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_UV = gl.getAttribLocation(gl.program, "a_UV");
    const u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(
      gl.program,
      "u_ProjectionMatrix"
    );
    
		gl.uniform1i(u_WhichTexture, this.texture);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(
      u_ProjectionMatrix,
      false,
      camera.projectionMatrix.elements
    );

    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      if (!this.vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}





