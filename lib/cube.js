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

	constructor(options){
	
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
		
		var num_triangles = Cube.default_triangles.length;
		for (var i = 0; i < num_triangles; i++) {
			let c = 1.0 - (i * 0.01)
			gl.uniform4f(u_FragColor, rgba[0]*c, rgba[1]*c, rgba[2]*c, rgba[3]);
			Triangle3D.draw( [
				...Cube.default_vertices[Cube.default_triangles[i][0]],
				...Cube.default_vertices[Cube.default_triangles[i][1]],
				...Cube.default_vertices[Cube.default_triangles[i][2]]
				]
			)
		}
	
		
	}


}