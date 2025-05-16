import { Vector3, Matrix4 } from "../lib/cuon-matrix-cse160.js";

export class AABB {

	constructor(position, scale) {
		
		this.position = position;
		this.scale = new Vector3().set(scale);
	
		this.minX = null;
		this.maxX = null;
		this.minY = null;
		this.maxY = null;
		this.minZ = null;
		this.maxZ = null;
		
		this.updateBounding();
	}
	
	updateBounding(position, scale) {
		if (position) { this.position = position }
		if (scale) { this.scale = scale }
	
		let x_size = this.scale.elements[0] / 2;
		let y_size = this.scale.elements[1] / 2;
		let z_size = this.scale.elements[2] / 2;
	
		let x_pos = this.position.elements[0];
		let y_pos = this.position.elements[1];
		let z_pos = this.position.elements[2];
	
		this.minX = x_pos - x_size;
		this.maxX = x_pos + x_size;
		this.minY = y_pos - y_size;
		this.maxY = y_pos + y_size;
		this.minZ = z_pos - z_size;
		this.maxZ = z_pos + z_size;
	}
	
	
	// wants vec3
	// taken from https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
	detectPoint(point) {
		return (
			point.elements[0] >= this.minX &&
			point.elements[0] <= this.maxX &&
			point.elements[1] >= this.minY &&
			point.elements[1] <= this.maxY &&
			point.elements[2] >= this.minZ &&
			point.elements[2] <= this.maxZ
		)
	}
	
	// wants AABB
	// taken from https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
	detectBox(box) {
		return (
			this.minX <= box.maxX &&
    	this.maxX >= box.minX &&
			this.minY <= box.maxY &&
			this.maxY >= box.minY &&
			this.minZ <= box.maxZ &&
			this.maxZ >= box.minZ
		)
	}
}