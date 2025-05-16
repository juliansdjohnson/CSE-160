import { Chunk } from "./chunk.js";
import { Player } from "./player.js";
import { Block } from "./block.js";
import { createNoise2D } from "./node_modules/simplex-noise/dist/esm/simplex-noise.js";
import { Vector3, Matrix4 } from "./cuon-matrix-cse160.js";

export class World {

	// accepts two vec3:
	// world_size [ x_size, und, z_size ]
	// 		amount of chunks in each direction
	// chunk_size [ x_size, y_size, z_size ]
	// 		amount of blocks in each chunk
	constructor(chunk_size, gl, camera, sky, world_options, gen_options) {
		// stores chunks
		
		
		this.sky = sky;
		
		this.chunk_x_size = chunk_size.elements[0];
		this.chunk_y_size = chunk_size.elements[1];
		this.chunk_z_size = chunk_size.elements[2];
				
		this.chunks = new PairedList();
		
		this.world_options = {};
		this.world_options.draw_distance = world_options.draw_distance 
																			? world_options.draw_distance
																			: 3;

		// noise functions.
		this.genE = createNoise2D();
		this.genM = createNoise2D();
		
		this.gen_options = {};
		this.gen_options.sea_level = gen_options.sea_level ? gen_options.sea_level : Math.floor(this.real_y_size / 2);
		this.gen_options.dynamic_range = gen_options.dynamic_range ? gen_options.dynamic_range : 10.0;
		
		this.gl = gl;
		
		// stores a player
		this.player = new Player(gl, 
														 camera, 
														 new Vector3([0, this.chunk_y_size + 2, 0]), 
														 0, 0, 
														 new Vector3([1, 1, 1]), 
														 this);

	}
	
	placeBlock(x, y, z, type, program) {
		// make a block at REAL COORDS
		// place it at CHUNK COORDS
		
		// TODO: give each block the right program and position in the texture atlas
		let b = new Block([x, y, z], null, null, type, program)
		
		let real_coords = new Vector3([x, y, z]);
		let world_coords = new Vector3();
		let chunk_coords = new Vector3();
		
		// find the position of the chunk in the world chunk array
		world_coords.elements[0] = Math.floor(real_coords.elements[0]/this.chunk_x_size);
		world_coords.elements[2] = Math.floor(real_coords.elements[2]/this.chunk_z_size);
		
		// find the position of the block in the chunk block array
		chunk_coords.elements[0] = real_coords.elements[0] % this.chunk_x_size;
		chunk_coords.elements[1] = real_coords.elements[1];
		chunk_coords.elements[2] = real_coords.elements[2] % this.chunk_z_size;
		
		let c = this.getChunk(world_coords.elements[0], world_coords.elements[2]);
		c.placeBlock(...chunk_coords.elements, b);
	}
	
	getChunk(x, z) {
		// bounds checking.
		let c = this.chunks.get(x, z);
		if (!c) {
			return null;
		}
		return c;
	}
	
	setChunk(x, z, c) {
		this.chunks.insert(x, z, c);
	}
	
	getBlock(x, y, z) {
		// make a block at REAL COORDS
		// place it at CHUNK COORDS
		
		// TODO: give each block the right program and position in the texture atlas		
		let real_coords = new Vector3([x, y, z]);
		let world_coords = new Vector3();
		let chunk_coords = new Vector3();
		
		// find the position of the chunk in the world chunk array
		world_coords.elements[0] = Math.floor(real_coords.elements[0]/this.chunk_x_size);
		world_coords.elements[2] = Math.floor(real_coords.elements[2]/this.chunk_z_size);
		
		// find the position of the block in the chunk block array
		chunk_coords.elements[0] = real_coords.elements[0] % this.chunk_x_size;
		chunk_coords.elements[1] = real_coords.elements[1];
		chunk_coords.elements[2] = real_coords.elements[2] % this.chunk_z_size;
		
		let c;
		if ( !(c = this.getChunk(world_coords.elements[0], world_coords.elements[2])) ) {
			return null;
		}

		return c.getBlock(...chunk_coords.elements);	
	}
	
	
	markDirty(x, y, z) {
		// make a block at REAL COORDS
		// place it at CHUNK COORDS
		
		// TODO: give each block the right program and position in the texture atlas		
		let real_coords = new Vector3([x, y, z]);
		let world_coords = new Vector3();
		let chunk_coords = new Vector3();
		
		// find the position of the chunk in the world chunk array
		world_coords.elements[0] = Math.floor(real_coords.elements[0]/this.chunk_x_size);
		world_coords.elements[2] = Math.floor(real_coords.elements[2]/this.chunk_z_size);
		
		// find the position of the block in the chunk block array
		chunk_coords.elements[0] = real_coords.elements[0] % this.chunk_x_size;
		chunk_coords.elements[1] = real_coords.elements[1];
		chunk_coords.elements[2] = real_coords.elements[2] % this.chunk_z_size;
		
		let c;
		if ( !(c = this.getChunk(world_coords.elements[0], world_coords.elements[2])) ) {
			return null;
		}

		c.markDirty(...chunk_coords.elements);
	}

		
	getBlocks(min_x, max_x, min_y, max_y, min_z, max_z) {
		let x_flr, y_flr, z_flr;
		let blocks = [];
		for (let x = min_x; x <= max_x; x++) {
			for (let y = min_y; y <= max_y; y++) {
				for (let z = min_z; z <= max_z; z++) {
					x_flr = Math.floor(x);
					y_flr = Math.floor(y);
					z_flr = Math.floor(z);
					
					let b = this.getBlock(x_flr, y_flr, z_flr)
					if (b) {
						blocks.push(b);
					}
				}
			}
		}
		return blocks;
	}
	
	getBlockChunk(x, y, z, chunk) {
		let x_real = x + chunk.x_pos * chunk.x_size;
		let y_real = y;
		let z_real = z + chunk.z_pos * chunk.z_size;
		
		return (this.getBlock(x_real, y_real, z_real));
	}
		
	update() {
		this.player.updateState();

		let dd = this.world_options.draw_distance;
		let p_pos = this.player.state.position.elements;
		
		let player_world_x = Math.floor(p_pos[0]/this.chunk_x_size);
		let player_world_z = Math.floor(p_pos[2]/this.chunk_z_size);
		
		let c, c_x, c_z;
		for (let x = -dd; x <= dd; x++) {
			for (let z = -dd; z <= dd; z++) {
				c_x = player_world_x + x;
				c_z = player_world_z + z;
				c = this.getChunk(c_x, c_z);
				
				if (!c) {
					let n_c = new Chunk( this.chunk_x_size,
													 this.chunk_y_size,
													 this.chunk_z_size,
													 this,
													 c_x, c_z);
					n_c.generate(this.gen_options, this.genE, this.genM);
					this.setChunk(c_x, c_z, n_c);
				}
			}
		}
	}
	
	render() {
		
		this.sky.render(this.gl, this.player.camera);
		
		this.gl.useProgram(this.gl.program);
	
		let dd = this.world_options.draw_distance;
		let p_pos = this.player.state.position.elements;
		
		let player_world_x = Math.floor(p_pos[0]/this.chunk_x_size);
		let player_world_z = Math.floor(p_pos[2]/this.chunk_z_size);

		let c, c_x, c_z;
		for (let x = -dd; x <= dd; x++) {
			for (let z = -dd; z <= dd; z++) {
				c_x = player_world_x + x;
				c_z = player_world_z + z;
				c = this.getChunk(c_x, c_z);
				c.render(this.gl, this.player.camera);
			}
		}
	}
	
	checkCollisions() {
		// find nearest blocks
		this.player.collide(this);
	
	}
}

// adapted from: https://replit.com/@rooksword1/Signed-Pairing-Function#main.py
class PairedList {
	constructor() {
		this.list = [];
	}
	
	insert(x, y, val) {
		let i = this.PairSigned(x, y);
		this.list[i] = val;
	}
	
	delete(x, y) {
		let i = this.PairSigned(x, y);
		delete this.list[i];
	}
	
	get(x, y) {
		let i = this.PairSigned(x, y);
		return this.list[i];
	}
	
	
	PairSigned(x, y) {
		let a = (x >= 0) ? (x * 2) : ((x * -2) - 1)
		let b = (y >= 0) ? (y * 2) : ((y * -2) - 1)
		
		return (a >= b) ? (a * a) + a + b : (b * b) + a;
	}
	
	Unpair(c) {
		let a = Math.floor(Math.sqrt(z));
		let b = z - (a * a);
		
		let x, y;
		if (b >= a) {
			x = a;
			y = b - a;
		} else {
			x = b;
			y = a;
		}
		
		x = x % 2 === 0 ? x / 2 : (x + 1) / -2;
		y = y % 2 === 0 ? y / 2 : (y + 1) / -2;
	}
}