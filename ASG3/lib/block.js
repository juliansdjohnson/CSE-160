import { Vector3, Matrix4 } from "./cuon-matrix-cse160.js";
import { Cube } from "./cube.js";
import { AABB } from "./collisionbox.js";

export class Block {

	constructor (position, rotation, scale, type, program) {
	
	
    this.position = position ? new Vector3(position) : new Vector3([0, 0, 0]);
    this.rotation = rotation ? new Vector3(rotation) : new Vector3([0, 0, 0]);
    this.scale = scale ? new Vector3(scale) : new Vector3([1, 1, 1]);
		
		this.type = type;
		
		// children
		this.cube = new Cube(this.position, 
												 this.rotation, 
												 this.scale, 
												 this.type, 
												 program);

		this.AABB = new AABB( this.position, this.scale );
	}
	
	giveFace(dir) {
		return (this.cube.giveFace(dir));
	}
}