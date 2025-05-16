import { Block } from "./block.js";
import { Vector3, Matrix4 } from "./cuon-matrix-cse160.js";

export class Chunk {
// what does it store?
// 	-  blocks
// 	-  mesh
// 	-  dirty blocks
// 	
// What does it do?
// 	- Renders itself
// 	- Checks adjacency/transparency
// 
// 	- take operations on chunk coordinates, turn them into operations on blocks
// 

	constructor(x_size, y_size, z_size, world, x_pos, z_pos) {
		this.x_size = x_size;
		this.y_size = y_size;
		this.z_size = z_size;
		
		this.x_pos = x_pos;
		this.z_pos = z_pos;
		
		this.world = world;

		let blocks = new Array(this.x_size);
		for (let x = 0; x < this.x_size; x++) {
			blocks[x] = new Array(this.y_size);
			for (let y = 0; y < this.y_size; y++) {
				blocks[x][y] = new Array(this.z_size).fill(null);
			}
		}
		
		this.blocks = blocks;
		
		this.dirty_blocks = [];
		this.mesh = new Mesh();
	}
	
	// bullshit structure that's only here cos I am the SOLE MASTER
	// of this domain. this is completely inscrutable.
	static {
		let adj = [
			// front
			[new Vector3( [0, 0, 1] ), "+z", "-z"],
			// left
			[new Vector3( [-1, 0, 0] ), "-x", "+x"],
			// right
			[new Vector3( [1, 0, 0] ), "+x", "-x"],
			// top
			[new Vector3( [0, 1, 0] ), "+y", "-y"],
			// back
			[new Vector3( [0, 0, -1] ), "-z", "+z"],
			// bottom
			[new Vector3( [0, -1, 0] ), "-y", "+y"],
		]
		
		this.adj = adj;
	}
	
	
	
	placeBlock(x, y, z, block) {
		if (!this.checkBounds(x, y, z)) {
			console.error("could not place block");
			return;
		}
		this.blocks[x][y][z] = block;
		this.markDirty(x, y, z);
	}
	
	
	placeBlockClean(x, y, z, block) {
		if (!checkBounds(x, y, z)) {
			console.error("could not place block");
			return;
		}
		this.blocks[x][y][z] = block;
	}
	
	removeBlock(x, y, z) {
		this.blocks[x][y][z] = null;
		markDirty(x, y, z);
	}
	
	isDirty() {
		return (this.dirty_blocks.length != 0);
	}
	
	markDirty(x, y, z) {
		this.dirty_blocks.push([x, y, z]);
	}

	markAllDirty() {
		for (let x = 0; x < this.x_size; x++) {
			for (let y = 0; y < this.y_size; y++) {
				for (let z = 0; z < this.z_size; z++) {
					if (this.blocks[x][y][z]) {
						this.markDirty(x, y, z);
					}
				}
			}
		}
	}
	
	markSideDirty(dir) {
	
	dir.normalize();
	
	let min_x, max_x;
	let min_z, max_z;
	let min_y, max_y;
	
	min_y = 0
	max_y = this.y_size - 1;
	
	if (dir.elements[0] == 0) {
		min_x = 0
		max_x = this.x_size - 1;
		if (dir.elements[2] < 0) {
			min_z = max_z = 0;
		} else {
			min_z = max_z = this.z_size - 1;
		}
	} else if (dir.elements[2] == 0) {
		min_z = 0
		max_z = this.z_size - 1;
		if (dir.elements[2] < 0) {
			min_x = max_x = 0;
		} else {
			min_x = max_x = this.x_size - 1;
		}
	}
	
	for (let x = min_x; x <= max_x; x++) {
		for (let y = min_y; y <= max_y; y++) {
			for (let z = min_z; z <= max_z; z++) {
				if (this.blocks[x][y][z]) { this.markDirty(x, y, z); }
			}
		}	
	}
	
	
	
// 		let half_x = (this.x_size - 1) / 2;
// 		let half_z = (this.z_size - 1) / 2;
// 		
// 		let h_sz = new Vector3([half_x, 0, half_z]);
// 		
// 		h_sz.elements[0] *= dir.elements[0];
// 		h_sz.elements[1] *= dir.elements[1];
// 		h_sz.elements[2] *= dir.elements[2];
// 
// 		
// 		if (h_sz.elements[0] == 0) {
// 		
// 			let z = Math.round(half_z + h_sz.elements[2]);
// 			for (let x = 0; x < this.x_size; x++) {
// 				for (let y = 0; y < this.y_size; y++) {
// 					if (this.blocks[x][y][z]) { this.markDirty(x, y, z); }
// 				}
// 			}
// 		
// 		} else if (h_sz.elements[2] == 0) {
// 			let x = Math.round(half_x + h_sz.elements[0]);
// 			for (let z = 0; z < this.z_size; z++) {
// 				for (let y = 0; y < this.y_size; y++) {
// 					if (this.blocks[x][y][z]) { this.markDirty(x, y, z); }
// 				}
// 			}
// 		}
	}
	
	getBlock(x, y, z) {
		if (!this.checkBounds(x, y, z)) {
			return null;
		}
		return this.blocks[x][y][z];
	}
	
	checkBounds(x, y, z) {
		if (x < 0 || x >= this.x_size || y < 0 || y >= this.y_size || z < 0 || z >= this.z_size) {
			return false;
		} else {
			return true;
		}
	}
	
	generate(gen_options, genE, genM) {

		console.log("generating new chunk...");
		
		function noiseE(nx, ny) { return genE(nx, ny)/2 + 0.5; }
		function noiseM(nx, ny) { return genM(nx, ny)/2 + 0.5; }
		
		let sea_level = gen_options.sea_level;
		let dynamic_range = gen_options.dynamic_range;
		
		for (let x = 0; x < this.x_size; x++) {
			for (let z = 0; z < this.z_size; z++) {      
				let nx = (this.x_pos + x)/this.x_size - 0.5; 
				let nz = (this.z_pos + z)/this.z_size - 0.5;		
				let e = (1.5 * noiseE( 1 * nx,  1 * nz)
							 + 0.6 * noiseE( 2 * nx,  2 * nz)
							 + 0.4 * noiseE( 4 * nx,  4 * nz)
							 + 0.3 * noiseE( 8 * nx,  8 * nz)
							 + 0.3 * noiseE(16 * nx, 16 * nz)
							 + 0.5 * noiseE(32 * nx, 32 * nz));
				e = e / (1.5 + 0.6 + 0.4 + 0.3 + 0.3 + 0.5);
				e = Math.round(Math.pow(e, 5.00) * dynamic_range + sea_level);
				if (e >= this.y_size) { e = this.y_size - 1 }

				
				for (let y = e; y >= 0; y--) {
					let b_x = this.x_pos * this.x_size + x;
					let b_y = y;
					let b_z = this.z_pos * this.z_size + z;
				
				 	var m = (1.00 * noiseM( 1 * nx,  1 * nz)
 							 + 0.5 * noiseM( 2 * nx,  2 * nz)
 							 + 0.5 * noiseM( 4 * nx,  4 * nz)
 							 + 0.5 * noiseM( 8 * nx,  8 * nz)
 							 + 0 * noiseM(16 * nx, 16 * nz)
 							 + 0 * noiseM(32 * nx, 32 * nz));
 					m = m / (1.00 + 0.5 + 0.5 + 0.5 + 0 + 0);				

					let type = "stone";
					if (m < 0.5) {
						type = "grass";
					}
					let b = new Block([b_x, b_y, b_z], null, null, type, null);
					this.placeBlock(x, y, z, b);
				}
			}
		}
						
		this.buildMesh();
		
		let c;
		if ( c = this.world.getChunk(this.x_pos - 1, this.z_pos) ) {
			let dir = new Vector3( [ this.x_pos - c.x_pos , 0 , this.z_pos - c.z_pos ] );
			c.markSideDirty(dir);
		}
		if ( c = this.world.getChunk(this.x_pos + 1, this.z_pos) ) {
			let dir = new Vector3( [ this.x_pos - c.x_pos , 0 , this.z_pos - c.z_pos ] );
			c.markSideDirty(dir);
		}
		if ( c = this.world.getChunk(this.x_pos, this.z_pos - 1) ) {
			let dir = new Vector3( [ this.x_pos - c.x_pos , 0 , this.z_pos - c.z_pos ] );
			c.markSideDirty(dir);
		}
		if ( c = this.world.getChunk(this.x_pos, this.z_pos + 1) ) {
			let dir = new Vector3( [ this.x_pos - c.x_pos , 0 , this.z_pos - c.z_pos ] );
			c.markSideDirty(dir);
		}
		
		console.log("finished generating new chunk...");
	}


	buildMesh() {
		// check each dirty block, find which faces to push. 
		
		for (let i = 0; i < this.dirty_blocks.length; i++) {
			
			let b0_coords = this.dirty_blocks[i];
			let b0 = this.getBlock(...b0_coords);
			if (!b0) continue;
			
			let tmp = new Vector3();
			for (let a = 0; a < 6; a++) {
				tmp.setList(b0_coords).add(Chunk.adj[a][0]);
				let b1_coords = tmp.elements;
				
				let b1;
				if (!this.checkBounds(...b1_coords)) { 
					b1 = this.world.getBlockChunk(...b1_coords, this); 
				} else {
					b1 = this.getBlock(...b1_coords);
				}
				
				let f = b0.giveFace(Chunk.adj[a][1]);
				if (b1) {
					this.mesh.remove(f);
				} else {
					this.mesh.add(f);
				}
			}
		}
		
		this.dirty_blocks = [];
	}
	
	rebuildMesh() {
		// check each dirty block, find which faces to push.
		// difference is this is a little greedier, checks neighbors' faces too.
		// saves the work of checking faces we know are chill.
		for (let i = 0; i < this.dirty_blocks.length; i++) {
			
			let b0_coords = this.dirty_blocks[i];
			let b0 = this.getBlock(...b0_coords);
			
			let tmp = new Vector3();
			for (let a = 0; a < 6; a++) {
				tmp.setList(b0_coords).add(Chunk.adj[a][0]);
				let b1_coords = tmp.elements;
				
				let b1;
				let inside = true;
				if (!this.checkBounds(...b1_coords)) { 
					b1 = this.world.getBlockChunk(...b1_coords, this);
					inside = false;
				} else {
					b1 = this.getBlock(...b1_coords);
				}


// 				let f0 = b0.giveFace(Chunk.adj[a][1]);
// 				let f1 = b1.giveFace(Chunk.adj[a][2]);


				if (b0) {
					let f0 = b0.giveFace(Chunk.adj[a][1]);
					if (b1) {
						let f1 = b1.giveFace(Chunk.adj[a][2]);
						this.mesh.remove(f0);
						this.mesh.remove(f1);
					} else {
						this.mesh.add(f0);
					}
				} else {
					if (b1 && inside) {
						let f1 = b1.giveFace(Chunk.adj[a][2]);
						this.mesh.add(f1);
					}
				}
			}
		}
		
		this.dirty_blocks = [];
	}
	
	render(gl, camera) {
		if (this.isDirty()) {
			this.rebuildMesh();
		}
		this.mesh.render(gl, camera);
	}
}


class Mesh {
	// TODO: add buffer to this object, so it can render faces more efficiently.
	// data structure of faces that can be accessed by coordinates.
	// can render itself.
	constructor() {
		this.faces = new Map();
	}
	
	add(face) {
		if (!face) {
			return;
		}
	
		let key = this.vec_to_key( face.position );
		let dir = face.direction;
		
		
		if (this.faces.has(key)) {
			this.faces.get(key)[dir] = face;
		} else {
			let f = {};
			f[dir] = face;
			this.faces.set(key, f);
		}
	}
	
	remove(face) {
		if (!face) {
			return;
		}
	
		let key = this.vec_to_key( face.position );
		
		if (this.faces.has(key)) {
			// js just lets you delete shit that doesn't exist.
			let l = this.faces.get(key);
			delete l[face.direction];
		}
	}
	
	removeBlock( pos ) {		
		let key = this.vec_to_key( pos );
		
		if (this.faces.has(key)) {
			this.faces.delete(key);
		}
	}
	
	render(gl, camera) {
		for ( let group of this.faces.values() ) {
			for ( let dir in group ) {
				let face = group[dir];
				face.render(gl, camera)
			}
		}
	}


	vec_to_key( vec ) {
		return (vec.elements[0] 
		+ "_" + vec.elements[1] 
	  + "_" + vec.elements[2]);
	}
	
	key_to_arr( key ) {
		return ( key.split("_") );
	}
	
	key_to_vec( key ) {
		return ( new Vector3(key_to_arr( key )) );
	}

}