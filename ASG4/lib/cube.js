// brazenly and unethically adapted from our lab section.
import { Matrix4, Vector3, Vector4 } from "./cuon-matrix-cse160.js";
import { Material } from "./light.js"

///////////////////////////////////////////////////////////////////////////////
// PRIMITIVE
///////////////////////////////////////////////////////////////////////////////
export class Primitive {

	// Constructor for Primitive class.
	// Primitives can't be seen but they can still be transformed!
	// INPUT: obj options, a set of options for the constructor:
	constructor(options){
		this.type = 'Primitive';
	}
	
	update(matrix) {
		return this;
	}
	
	render(gl, camera) {
		return this;
	}
	
	findNormal(v1, v2, v3) {  		
		let t1 = new Vector3();
		let t2 = new Vector3();
		let n = new Vector3();
		
		t1.set(v1).sub(v2);
		t2.set(v1).sub(v3);
		n.set(Vector3.cross(t2, t1));
		
// 		this.checkNormal(n, v1, v2, v3);
		n.normalize();
		
		return n;
	}
	
	
	static findBarycenter(v1, v2, v3) {
		return (new Vector3().set(v1).add(v2).add(v3).div(3));
	}
	
	checkNormal(n, v1, v2, v3) {

// 		let tmp = new Vector3().set(v1)
// 		tmp.add(n);
// 		
// 		if (tmp.magnitude() <= this.radius) {
// 			console.log(v1, v2, v3);
// 			n.mul(-1);
// 		}

		let b = Primitive.findBarycenter(v1, v2, v3);
			
		let e = this.position.elements;
		let c = new Vector3(e[0], e[1], e[2]);
		
		b.sub(c);

		if (Vector3.dot(n, b) < 0) {
			console.log(v1.elements, v2.elements, v3.elements, n.elements);
			n.mul(-1);
		} 
	}

}

///////////////////////////////////////////////////////////////////////////////
// CUBE
///////////////////////////////////////////////////////////////////////////////
export class Cube extends Primitive {
	// options expects:
	// color,
	// program,

  constructor(position, rotation, scale, options) {
  
  	super(options);
  	this.type = 'Cube';
  	
  	// set options.
		this.material = new Material().set(options.material);
  	let program = options.program;
  	
//   	this.color = color ? new Vector4().set(color) : new Vector4([1.0, 1.0, 1.0, 1.0]);  	
//   	this.program = program;
  	
  	
  	// set position.
  	this.position = new Vector4().set(position);
    this.rotation = new Vector4().set(rotation);
    this.scale = new Vector4().set(scale);
    this.modelMatrix = new Matrix4();
    this.normalMatrix = new Matrix4();
  	
  	// set vertices
    this.vertices = null;
    this.vertexBuffer = null;
		this.setVertices();


// 		this.colors = null;
// 		this.colorBuffer = null;
// 		this.setColors();

		// set normals.
		this.normals = null;
		this.normalBuffer = null;
		this.setNormals();

  }


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
  
//   setColors() {
//   	let colors = [];
//   	let t = new Vector4()
//   	for ( let i = 0; i < 36; i++) {
//   		t.set(this.color);
//   		t.elements[0] = Math.min(1.0, this.color.elements[0] + (Math.random() - 0.5) * 0.1);
//   		t.elements[0] = Math.min(1.0, t.elements[0]);
//   		t.elements[0] = Math.max(0.0, t.elements[0]);
//   		
//   		t.elements[1] = Math.min(1.0, this.color.elements[1] + (Math.random() - 0.5) * 0.1);
//     	t.elements[1] = Math.min(1.0, t.elements[1]);
//   		t.elements[1] = Math.max(0.0, t.elements[1]);
// 
//   		t.elements[2] = Math.min(1.0, this.color.elements[2] + (Math.random() - 0.5) * 0.1);
//   		t.elements[2] = Math.min(1.0, t.elements[2]);
//   		t.elements[2] = Math.max(0.0, t.elements[2]);
// 
//   		colors.push(...t.elements);
//   	}
//   	this.colors = new Float32Array(colors);
//   }
  
  setNormals() {
  	// so i from 1 to 12
  	let vs = this.vertices;
  	let normals = [];
  	let n = new Vector3();
  	let t1 = new Vector3();
  	let t2 = new Vector3();
  	let f, p1, v1, p2, v2, p3, v3;
  	
  	for (let i = 0; i < this.vertices.length / 9; i++) {
  		// face index
  		let f = i * 9;
  		// vertex 1
  		let p1 = f + 0;
  		let v1 = new Vector3([ vs[p1+0], vs[p1+1], vs[p1+2] ]);
  		
  		// vertex 2
  		let p2 = f + 3;
  		let v2 = new Vector3([ vs[p2+0], vs[p2+1], vs[p2+2] ]);
  		
  		// vertex 3
  		let p3 = f + 6;
  		let v3 = new Vector3([ vs[p3+0], vs[p3+1], vs[p3+2] ]);
  		
  		n = this.findNormal(v1, v2, v3);
  		
  		normals.push(...n.elements);
  		normals.push(...n.elements);
  		normals.push(...n.elements);
  	}
  	
  	this.normals = new Float32Array(normals);
  }

//   setUvs() {
// 
//     this.uvs = new Float32Array([
//       // FRONT
//       0.5,0.25, 0.5,0.5, 0.25,0.5, 0.5, 0.25, 0.25,0.5, 0.25,0.25,
//       // LEFT
//       0.75,0, 0.75,0.25, 0.5,0.25, 0.75,0, 0.5,0.25, 0.5,0,
//       // RIGHT
//       0.5,0.75, 0.5,0.5, 0.75,0.5, 0.5,0.75, 0.75,0.5, 0.75,0.75,
//       // TOP
//       0.25,0.25, 0.25,0.5, 0,0.5, 0.25,0.25, 0,0.5, 0,0.25,
//       // BACK //bca
//       0.75,0.5, 1,0.5, 0.75,0.25, 0.75, 0.25, 1, 0.5, 1, 0.25,
//       // BOTTOM 
//       0.75,0.25, 0.75,0.5, 0.5,0.5, 0.75,0.25, 0.5,0.5, 0.5,0.25
//     ]);
//   }
  
//   giveFace(dir) {
//   
//   	if (this.faces[dir]) {
//   		return this.faces[dir];
//   	} else {
//   		let f = new Face(this, dir);
//   		this.faces[dir] = f;
//   		return f;
//   	}
//   }

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
  
  update(matrix) {
  	this.calculateMatrix();
  	this.modelMatrix.multiply(matrix);
  	this.normalMatrix.set(this.modelMatrix).invert().transpose();
  }

  render(gl, camera) {
    
		//     gl.useProgram(this.program);
		
		
		this.material.addToProgram(gl, gl.program);

		const u_CameraPosition = gl.getUniformLocation(gl.program, "u_CameraPosition");
		gl.uniform4f(u_CameraPosition, ...camera.position.elements, 1.0);

    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_UV = gl.getAttribLocation(gl.program, "a_UV");
    const a_Color = gl.getAttribLocation(gl.program, "a_Color");
    const a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(
      gl.program,
      "u_ProjectionMatrix"
    );
    const u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

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

//     if (this.colorBuffer === null) {
//       this.colorBuffer = gl.createBuffer();
//       if (!this.colorBuffer) {
//         console.log("Failed to create the buffer object");
//         return -1;
//       }
//     }
// 
//     gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
//     gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(a_Color);
    
    if (this.normalBuffer === null) {
      this.normalBuffer = gl.createBuffer();
      if (!this.normalBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);

// 		gl.disableVertexAttribArray(a_Position);
//     gl.disableVertexAttribArray(a_Color);
//     gl.disableVertexAttribArray(a_Normal);
  }
}

///////////////////////////////////////////////////////////////////////////////
// SPHERE
///////////////////////////////////////////////////////////////////////////////
export class Sphere extends Primitive {

	constructor(position, rotation, scale, options) {
		// expects:
		// 		material
		// 		program
		// 		radius
		// 		sectorCount
		// 		stackCount

  	super(options);
  	this.type = 'Sphere';
  	
  	// set options.
//   	let color = options.color;  	
//   	this.color = color ? new Vector4().set(color) : new Vector4([1.0, 1.0, 1.0, 1.0]); 
		this.material = new Material().set(options.material);
  	this.program = options.program;
  	
  	
  	// set position.
  	this.position = new Vector4().set(position);
    this.rotation = new Vector4().set(rotation);
    this.scale = new Vector4().set(scale);
    this.modelMatrix = new Matrix4();
    this.normalMatrix = new Matrix4();

		this.radius = options.radius ? options.radius : 1;
		this.sectorCount = options.sectorCount ? options.sectorCount : 10;
		this.stackCount = options.stackCount ? options.stackCount : 10;
		
		this.vertices = null;
		this.vertexBuffer = null;
		
		this.normals = null;
		this.normalBuffer = null;
		
// 		this.colors = null;
// 		this.colorBuffer = null;
		
		this.setVerticesNormals();
// 		this.setColors();
	}

	setVerticesNormals() {

		// make my life easier
		let PI = Math.PI;
		let sectorCount = this.sectorCount;
		let stackCount = this.stackCount;

		let sectorStep = 2 * PI / sectorCount;
		let stackStep = PI / stackCount;
		let sectorAngle, stackAngle;
		
		let t_vertices = [];


		// compute all vertices first, each vertex contains (x,y,z,s,t) except normal
		for(let i = 0; i <= stackCount; i++)
		{
				stackAngle = PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
				let xy = this.radius * Math.cos(stackAngle);       // r * cos(u)
				let z = this.radius * Math.sin(stackAngle);        // r * sin(u)

				// add (sectorCount+1) vertices per stack
				// the first and last vertices have same position and normal, but different tex coords
				for(let j = 0; j <= sectorCount; ++j)
				{
						sectorAngle = j * sectorStep;           // starting from 0 to 2pi

						let vertex = [];
						vertex[0] = xy * Math.cos(sectorAngle);      // x = r * cos(u) * cos(v)
						vertex[1] = xy * Math.sin(sectorAngle);      // y = r * cos(u) * sin(v)
						vertex[2] = z;                           // z = r * sin(u)
						t_vertices.push(vertex);
				}
		}
		
		let normals = [];
		let vertices = [];
		
		let v1 = [];
		let v2 = [];
		let v3 = [];
		let v4 = [];
		let n, n1, n2;


		let p1, p2;

		for(let i = 0; i < stackCount; i++) {
			p1 = i * (sectorCount + 1);                // index of tmpVertices
			p2 = (i + 1) * (sectorCount + 1);

			for(let j = 0; j < sectorCount; j++, p1++, p2++) {
				// get 4 vertices per sector
				//  v1--v3
				//  |    |
				//  v2--v4
				v1 = t_vertices[p1];
				v2 = t_vertices[p2];
				v3 = t_vertices[p1 + 1];
				v4 = t_vertices[p2 + 1];

				// if 1st stack and last stack, store only 1 triangle per sector
				// otherwise, store 2 triangles (quad) per sector
				if(i == 0) // a triangle for first stack ==========================
				{
					// put a triangle
					vertices.push(...v1);
					vertices.push(...v2);
					vertices.push(...v4);

					// put normal
					n = this.findNormal(new Vector3(v1), 
																	 new Vector3(v2),
																	 new Vector3(v4));

// 					this.checkNormal(n, v1, v2, v4);


					normals.push(...n.elements);
					normals.push(...n.elements);
					normals.push(...n.elements);

				}
				else if(i == (stackCount-1)) // a triangle for last stack =========
				{
					// put a triangle
					vertices.push(...v1);
					vertices.push(...v2);
					vertices.push(...v3);


					n = this.findNormal(new Vector3(v1), 
																	 new Vector3(v2),
																	 new Vector3(v3));

// 					this.checkNormal(n, v1, v2, v3);

					normals.push(...n.elements);
					normals.push(...n.elements);
					normals.push(...n.elements);
						
				}
				else // 2 triangles for others ====================================
				{
											
					vertices.push(...v1);
					vertices.push(...v2);
					vertices.push(...v3);
					
					vertices.push(...v2);
					vertices.push(...v4);
					vertices.push(...v3);

					// put normal
					n1 = this.findNormal(new Vector3(v1), 
																	  new Vector3(v2),
																	  new Vector3(v3));

// 					this.checkNormal(n1, v1, v2, v3);

					n2 = this.findNormal(new Vector3(v2), 
															 new Vector3(v4),
															 new Vector3(v3));
														
// 					this.checkNormal(n2, v3, v2, v4);
				
// 					n1 = new Vector3([0, 0, 0]);
// 					n2 = new Vector3([0, 0, 0])
				
					normals.push(...n1.elements);
					normals.push(...n1.elements);
					normals.push(...n1.elements);
					normals.push(...n2.elements);
					normals.push(...n2.elements);
					normals.push(...n2.elements);

				}
				
			}
		}
		
		this.vertices = new Float32Array(vertices);
		this.normals = new Float32Array(normals);	
	}
			
// 	setColors() {
// 		let color = this.color.elements
// 		let colors = []
// 		for (let i = 0; i < this.vertices.length; i++) {
// 			colors.push(color[0], color[1], color[2], color[3]);
// 		}
// 		
// 		this.colors = new Float32Array(colors);
// 	}
	
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
  
  update(matrix) {
  	this.calculateMatrix();
  	this.modelMatrix.multiply(matrix);
  	this.normalMatrix.set(this.modelMatrix).invert().transpose();
  }

  render(gl, camera) {
    
		//     gl.useProgram(this.program);		
		
		this.material.addToProgram(gl, gl.program);
		
		const u_CameraPosition = gl.getUniformLocation(gl.program, "u_CameraPosition");
		gl.uniform4f(u_CameraPosition, ...camera.position.elements, 1.0);


    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_UV = gl.getAttribLocation(gl.program, "a_UV");
    const a_Color = gl.getAttribLocation(gl.program, "a_Color");
    const a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(
      gl.program,
      "u_ProjectionMatrix"
    );
    const u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

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

//     if (this.colorBuffer === null) {
//       this.colorBuffer = gl.createBuffer();
//       if (!this.colorBuffer) {
//         console.log("Failed to create the buffer object");
//         return -1;
//       }
//     }
// 
//     gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
//     gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(a_Color);
    
    if (this.normalBuffer === null) {
      this.normalBuffer = gl.createBuffer();
      if (!this.normalBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    
//     gl.disableVertexAttribArray(a_Position);
//     gl.disableVertexAttribArray(a_Color);
//     gl.disableVertexAttribArray(a_Normal);

  }
}
