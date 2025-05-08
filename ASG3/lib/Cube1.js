class Primitive {

	// Constructor for Primitive class.
	// Primitives can't be seen but they can still be transformed!
	// INPUT: obj options, a set of options for the constructor:
	constructor(options){
		this.type = 'Primitive';
	}
	
	render() {
		return this;
	}
}



class Cube extends Primitive {


	// constructor for cube class.
	// INPUT: obj options, a set of options for the constructor:
	//					* color, a color to draw the cube with

	constructor(options={ color : null }){
	
		super(options);
		this.type = 'cube';
		this.color = options.color ? new Vector4().set(options.color) : new Vector4([1.0, 1.0, 1.0, 1.0]);
	}
	
	// Cube!
	//	
	// 		 v7-------v6		
	//	  /|        /|
	// 	v3-------v2  |
	//	|	 |		 |   |
	//	|	 v4- - | -v5
	//	| /      | /
	//	v0-------v1
	
	// establish 2 arrays, one of vertices:
	
	// the idea of setting the vertices this way was stolen from Keshav Dubey, dragon man,
	// who, in turn, stole it from someone else.
	// set up a cube that rotates about its center.
	
	static def_x = 0.5;
	static def_y = 0.5;
	static def_z = 0.5;
	
	static default_vertices = [
		[-Cube.def_x, -Cube.def_y, -Cube.def_z],
		[Cube.def_x, -Cube.def_y, -Cube.def_z],
		[Cube.def_x, Cube.def_y, -Cube.def_z],
		[-Cube.def_x, Cube.def_y, -Cube.def_z],

		[-Cube.def_x, -Cube.def_y, Cube.def_z],
		[Cube.def_x, -Cube.def_y, Cube.def_z],
		[Cube.def_x, Cube.def_y, Cube.def_z],
		[-Cube.def_x, Cube.def_y, Cube.def_z],


	];
	
		static default_triangles = [
		// front face
		[2, 3, 0],
		[2, 0, 1],
		
		// right face
		[2, 1, 5],
		[2, 5, 6],
		
		// top face
		[2, 6, 7],
		[2, 7, 3],
		
		// left face
		[3, 7, 4],
		[3, 4, 0],
		
		// bottom face
		[4, 5, 1],
		[4, 1, 0],
		
		// back face
		[5, 4, 7],
		[5, 7, 6]
	
	];


	render(matrix) {
	
		var rgba = this.color.giveList();
				
		gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
		
		let vertices = [];
		let colors = [];
		
		var num_triangles = Cube.default_triangles.length;
		for (var i = 0; i < num_triangles; i++) {
			let c = 1.0 - (i * 0.01)
			colors.push(rgba[0]*c, rgba[1]*c, rgba[2]*c, rgba[3]);
			vertices.push(
				...Cube.default_vertices[Cube.default_triangles[i][0]],
				...Cube.default_vertices[Cube.default_triangles[i][1]],
				...Cube.default_vertices[Cube.default_triangles[i][2]]
				)
		}
		Triangle3D.drawTriangles(vertices, colors);
	}
}


// class Sphere extends Primitive {
// 	constructor (options={ color : null, subdivision : 5}) {
// 		super(options);
// 		this.type = 'sphere';
// 		this.color = options.color ? new Vector4().set(options.color) : new Vector4([1.0, 1.0, 1.0, 1.0]);
// 		
// 		this.radius = 0.5;
// 		this.subdivision = options.subdivision;
// 				
// 		this.triangles = [];
// 		this.buildTriangles();
// 	
// 	}
// 
// 	// adapted from blog.form.dev/webgl/webgl-sphere
// 	buildTriangles() {
// 	
// 		// a circle with a p points on r rings
// 		let points = this.subdivision;
// 		let rings = this.subdivision;
// 		
// 		let curr_ring;
// 		let last_ring = [];
// 		let ring_y;
// 		let ring_r;
// 
// 		let d_theta = (Math.PI / (rings - 1))
// 		let d_phi;
// 		for(let theta = d_theta; theta < 2*Math.PI - d_theta; theta+=d_theta) {
// 				ring_y = Math.cos(theta);
// 				ring_r = Math.sin(theta);
// 				
// 				curr_ring = [];
// 				d_phi = (Math.PI / (points - 1))
// 				for (let phi = 0; phi < 2*Math.PI; phi+=d_phi) {
// 					curr_ring.push([ring_r * Math.cos(phi), ring_y, ring_r * Math.sin(phi)])
// 				}
// 		
// 			let j;
// 			if (last_ring.length > 0) {
// 				for(let i = 0; i < points; i++) {
// 					j = i === 0 ? points - 1 : i - 1;
// 					this.triangles.push([last_ring[i], last_ring[j], curr_ring[j]]);
// 					this.triangles.push([last_ring[i], curr_ring[j], curr_ring[i]]);
// 				}
// 			}
// 			last_ring = curr_ring;	
// 
// 		}
// 		
// // 		curr_ring = []
// // 		for (let i = 0; i < points; i++) {
// // 			curr_ring.push([0, this.radius, 0]);
// // 		}
// // 
// // 		
// // 		for (let i = 0; i < points; i++) {
// // 			this.triangles.push([last_ring[i], last_ring[j], curr_ring[j]]);
// // 			this.triangles.push([last_ring[i], curr_ring[j], curr_ring[i]]);
// // 		
// // 		}
// 		
// 	}
// 
// 	render(matrix) {
// 		var rgba = this.color.giveList();
// 		
// 		gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
// 		
// 		let num_triangles = this.triangles.length;
// 		for (let i = 0; i < num_triangles; i++) {
// 			let c = 1.0 - i * 0.01;
// 			gl.uniform4f(u_FragColor, rgba[0]*c, rgba[1]*c, rgba[2]*c, rgba[3]);
// 			Triangle3D.draw( [...this.triangles[i][0], 
// 											 ...this.triangles[i][1], 
// 											 ...this.triangles[i][2]]);
// 		}
// 	}
// 
// 
// }

// class BeveledCube extends Primitive {
// 	// constructor for cube class.
// 	// INPUT: obj options, a set of options for the constructor:
// 	//					* color, a color to draw the cube with
// 
// 	constructor(options={ color : null, offset : null }){
// 	
// 		super(options);
// 		this.type = 'beveledcube';
// 		this.color = options.color ? new Vector4().set(options.color) : new Vector4([1.0, 1.0, 1.0, 1.0]);
// 		this.offset = options.offset ? options.offset : 0.4;
// 		
// 		this.face_triangles = [
//  			// front face
// 			[2, 3, 0],
// 			[2, 0, 1],
// 			
// 			// right face
// 			[2, 1, 5],
// 			[2, 5, 6],
// 			
// 			// top face
// 			[2, 6, 7],
// 			[2, 7, 3],
// 			
// 			// left face
// 			[3, 7, 4],
// 			[3, 4, 0],
// 			
// 			// bottom face
// 			[4, 5, 1],
// 			[4, 1, 0],
// 			
// 			// back face
// 			[5, 4, 7],
// 			[5, 7, 6]
// 		]
// 		
// 		for (let i in this.face_triangles) {
// 			for (let j in this.face_triangles[i]) {
// 				this.face_triangles[i][j] = Cube.default_vertices[this.face_triangles[i][j]];
// 			}
// 		}
// 		
// 		let o = options.offset
// 		let offset_matrix = [
// 			[o, o, 1],
// 			[1, o, o],
// 			[o, 1, o],
// 			[1, o, o],
// 			[o, 1, o],
// 			[o, o, 1],
// 		]
// 		
// 		for (let i = 0, i < 6, i++) {
// 			for (j = 0, j < 3, j++) {
// 				this.face_triangles[i*2][j] *= offset_matrix[i][j]
// 				this.face_triangles[i*2+1][j] *= offset_matrix[i][j]
// 			}
// 		}
// 		
// 		this.bevel_triangles = [
// 			[]
// 		
// 		
// 		]
// 		
// 		
// 		
// 		}
// 		
// 	}
// 	
// 	// Cube!
// 	//	
// 	// 		 v7-------v6		
// 	//	  /|        /|
// 	// 	v3-------v2  |
// 	//	|	 |		 |   |
// 	//	|	 v4- - | -v5
// 	//	| /      | /
// 	//	v0-------v1
// 	
// 	// establish 2 arrays, one of vertices:
// 	
// 	static def_x = 0.5;
// 	static def_y = 0.5;
// 	static def_z = 0.5;
// 	
// 	static default_vertices = [
// 		[-Cube.def_x, -Cube.def_y, -Cube.def_z], // 0
// 		[Cube.def_x, -Cube.def_y, -Cube.def_z], // 1
// 		[Cube.def_x, Cube.def_y, -Cube.def_z], // 2
// 		[-Cube.def_x, Cube.def_y, -Cube.def_z], // 3
// 
// 		[-Cube.def_x, -Cube.def_y, Cube.def_z], // 4
// 		[Cube.def_x, -Cube.def_y, Cube.def_z], // 5
// 		[Cube.def_x, Cube.def_y, Cube.def_z], // 6
// 		[-Cube.def_x, Cube.def_y, Cube.def_z], // 7
// 
// 
// 	];
// 	
// 	
// 	static default_triangles = [
// 		// front face
// 		[2, 3, 0],
// 		[2, 0, 1],
// 		
// 		// right face
// 		[2, 1, 5],
// 		[2, 5, 6],
// 		
// 		// top face
// 		[2, 6, 7],
// 		[2, 7, 3],
// 		
// 		// left face
// 		[3, 7, 4],
// 		[3, 4, 0],
// 		
// 		// bottom face
// 		[4, 5, 1],
// 		[4, 1, 0],
// 		
// 		// back face
// 		[5, 4, 7],
// 		[5, 7, 6]
// 	
// 	];
// 	
// 	static default_aux_triangles = [
// 	
// 		
// 	
// 	
// 	]
// 	
// 
// 
// 	render(matrix) {
// 	
// 		var rgba = this.color.giveList();
// 				
// 		gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
// 		
// 		var num_triangles = Cube.default_triangles.length;
// 		for (var i = 0; i < num_triangles; i++) {
// 			let c = 1.0 - (i * 0.01)
// 			gl.uniform4f(u_FragColor, rgba[0]*c, rgba[1]*c, rgba[2]*c, rgba[3]);
// 			Triangle3D.draw( [
// 				...Cube.default_vertices[Cube.default_triangles[i][0]],
// 				...Cube.default_vertices[Cube.default_triangles[i][1]],
// 				...Cube.default_vertices[Cube.default_triangles[i][2]]
// 				]
// 			)
// 		}
// 	
// 		
// 	}
// }
