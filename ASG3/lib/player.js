import { Vector3, Matrix4 } from "../lib/cuon-matrix-cse160.js";
import { World } from "./world.js"
import { AABB } from "./collisionbox.js"

export class Player {
	constructor(gl,
							camera, 
							position=new Vector3([0, 0, 0]), 
							cam_theta, cam_phi, size, world) {
	
		this.canvas = gl.canvas;
		this.camera = camera;
		this.world = world;
		
		this.state = {	
								  	"position" : position,
										"velocity" : new Vector3([0, 0, 0]),
										"movement_matrix": new Matrix4(),

										"cam_theta" : cam_theta,
										"cam_phi" : cam_phi,
										"grounded" : false,
								 }
		
		this.attributes = {
												acceleration : 0.001,
												friction : 0.8,
												gravity : 1,
												max_vel : 0.5,
												cam_sensitivity : 0.01,
												max_vertical_look : Math.PI/2 - 0.01,
												"size" : size
										  }
		
		this.flags = {
								   left_pressed : false,
								   right_pressed : false,
								   forward_pressed : false,
								   back_pressed : false,
								   up_pressed : false,
								   down_pressed : false,
								   
								   pointer_locked : false
								 }
		
		this.AABB = new AABB(this.state.position, this.attributes.size);

		this.setHandlers();	

	}
	
	setHandlers() {
		document.addEventListener("keydown", (ev) => {
			switch (ev.code) {
				case "KeyA":
					this.flags.left_pressed = true;
					break;
				case "KeyD":
					this.flags.right_pressed = true;
					break;
				case "KeyW":
					this.flags.forward_pressed = true;
					break;
				case "KeyS":
					this.flags.back_pressed = true;
					break;
				case "KeyQ":
					this.flags.up_pressed = true;
					break;
				case "KeyE":
					this.flags.down_pressed = true;
					break;
			};
			
		})
		
		document.addEventListener("keyup", (ev) => {
			switch (ev.code) {
				case "KeyA":
					this.flags.left_pressed = false;
					break;
				case "KeyD":
					this.flags.right_pressed = false;
					break;
				case "KeyW":
					this.flags.forward_pressed = false;
					break;
				case "KeyS":
					this.flags.back_pressed = false;
					break;
				case "KeyQ":
					this.flags.up_pressed = false;
					break;
				case "KeyE":
					this.flags.down_pressed = false;
					break;
			};
			
		})
		
		this.canvas.addEventListener("click", (ev) => {
			if (!document.pointerLockElement) {
				this.canvas.requestPointerLock({ unadjustedMovement : true });
			}
			// TODO: add robust event handling for clicks
		
		})
		
		this.canvas.onmousemove = (e) => {
			if (!this.pointer_locked) {
				return;
			}
			
			// TODO: add mouse move functionality
						
			this.state.cam_theta -= e.movementX * this.attributes.cam_sensitivity % (2 * Math.PI);
			let phi = this.state.cam_phi - e.movementY * this.attributes.cam_sensitivity;
			
			phi = Math.max(phi, -this.attributes.max_vertical_look);
			phi = Math.min(phi,  this.attributes.max_vertical_look)

			this.state.cam_phi = phi;

		}
		
		document.addEventListener("pointerlockchange", () => {
			if (document.pointerLockElement === this.canvas) {
				console.log("pointer locked");
				this.pointer_locked = true;
			} else {
				console.log("pointer unlocked");
				this.pointer_locked = false;
			}
		})
	}
	
	collide(world) {
		let pos = new Vector3().set(this.state.position);
		pos.elements[0] = Math.floor(pos.elements[0]);
		pos.elements[1] = Math.floor(pos.elements[1]);
		pos.elements[2] = Math.floor(pos.elements[2]);
		
		let s = this.attributes.size;
		let s_x = s.elements[0];
		let s_y = s.elements[1];
		let s_z = s.elements[2];
		
		let b_list = world.getBlocks(pos.elements[0] - s_x, pos.elements[0] + s_x, 
																 pos.elements[1] - s_y, pos.elements[1] + s_y,
																 pos.elements[2] - s_z, pos.elements[2] + s_z);

		let collisions = [];
		for (let b of b_list) {
			if (this.AABB.detectBox(b.AABB)) {
				collisions.push(b);
			}
		}
		
		return collisions;
	}
	
	// adapted from https://noonat.github.io/intersect/#aabb-vs-aabb
	nudge(block) {// 
		let p_pos = new Vector3().set(this.state.position);
		let b_pos = new Vector3().set(block.position);

		let p_pos_x = p_pos.elements[0];
		let p_pos_y = p_pos.elements[1];
		let p_pos_z = p_pos.elements[2];

		let b_pos_x = b_pos.elements[0];
		let b_pos_y = b_pos.elements[1];
		let b_pos_z = b_pos.elements[2];

		let p_sz = this.attributes.size;
		let b_sz = block.scale;
		
		let p_sz_x = p_sz.elements[0];
		let p_sz_y = p_sz.elements[1];
		let p_sz_z = p_sz.elements[2];

		let b_sz_x = b_sz.elements[0];
		let b_sz_y = b_sz.elements[1];
		let b_sz_z = b_sz.elements[2];

    const dx = b_pos_x - p_pos_x;
    const px = (b_sz_x + p_sz_x)/2 - Math.abs(dx);

    const dy = b_pos_y - p_pos_y;
    const py = (b_sz_y + p_sz_y)/2 - Math.abs(dy);
    
    const dz = b_pos_z - p_pos_z;
    const pz = (b_sz_z + p_sz_z)/2 - Math.abs(dz);

		const smallest = Math.min(px, py, pz);
		let delta = new Vector3();
    if (px === smallest) {
      const sx = Math.sign(dx);
      delta.elements[0] = px * sx;
      
      this.state.velocity.elements[0] = 0;

    } else if (py === smallest) {
      const sy = Math.sign(dy);
      delta.elements[1] = py * sy;
      
      this.state.velocity.elements[1] = 0;
    } else {
    	const sz = Math.sign(dz);
    	delta.elements[2] = pz * sz;
    	
    	this.state.velocity.elements[2] = 0;
    }
    
    this.state.position.add(delta);
  }

// 		
// 		let d = new Vector3().set(p_pos);
// 		d.sub(b_pos);
// 		
// 		let d_x, d_y, d_z;
// 		d_x = d.elements[0];
// 		d_y = d.elements[1];
// 		d_z = d.elements[2];
// 		
// 		let min_d = Math.min(Math.abs(d_x), Math.abs(d_y), Math.abs(d_z));
// 		
// 		let p_sz = this.attributes.size;
// 		let b_sz = block.scale;
// 		
// 		if (min_d === Math.abs(d_y)) {
// 			let p_y_sz = p_sz.elements[1];
// 			let b_y_sz = b_sz.elements[1];
// 			
// 			let c;
// 			if (d_y < 0) {
// 				c = d_y + (p_y_sz + b_y_sz)/2;
// 			} else if (0 < d_y) {
// 				c = d_y - (p_y_sz + b_y_sz)/2;
// 			}
// 			
// 			this.state.position.elements[1] -= c;
// 		} else if (min_d === Math.abs(d_x)) {
// 			let p_x_sz = p_sz.elements[0];
// 			let b_x_sz = b_sz.elements[0];
// 			
// 			let c;
// 			if (d_x < 0) {
// 				c = d_x + (p_x_sz + b_x_sz)/2;
// 			} else if (0 < d_x) {
// 				c = d_x - (p_x_sz + b_x_sz)/2;
// 			}
// 			
// 			this.state.position.elements[0] -= c;
// 		} else {
// 			let p_z_sz = p_sz.elements[2];
// 			let b_z_sz = b_sz.elements[2];
// 			
// 			let c;
// 			if (d_z < 0) {
// 				c = d_z + (p_z_sz + b_z_sz)/2;
// 			} else if (0 < d_z) {
// 				c = d_z - (p_z_sz + b_z_sz)/2;
// 			}
// 			
// 			this.state.position.elements[2] -= c;
// 		}
	
		// https://gamedev.stackexchange.com/questions/47362/cast-ray-to-select-block-in-voxel-game/49423#49423
		raycast(origin, direction, radius, reach, world) {
		// The foundation of this algorithm is a parameterized representation of
		// the provided ray,
		//                    origin + t * direction,
		// except that t is not actually stored; rather, at any given point in the
		// traversal, we keep track of the *greater* t values which we would have
		// if we took a step sufficient to cross a cube boundary along that axis
		// (i.e. change the integer part of the coordinate) in the variables
		// tMaxX, tMaxY, and tMaxZ.
		
		// Cube containing origin point.
		var x = Math.floor(origin.elements[0]);
		var y = Math.floor(origin.elements[1]);
		var z = Math.floor(origin.elements[2]);

		// Break out direction vector.		
		var dx = direction.elements[0];
		var dy = direction.elements[1];
		var dz = direction.elements[2];
		
		// Direction to increment x,y,z when stepping.
		var stepX = Math.sign(dx);
		var stepY = Math.sign(dy);
		var stepZ = Math.sign(dz);
		
		// See description above. The initial values depend on the fractional
		// part of the origin.
		var tMaxX = Player.intbound(origin.elements[0], dx);
		var tMaxY = Player.intbound(origin.elements[1], dy);
		var tMaxZ = Player.intbound(origin.elements[2], dz);
		
		// The change in t when taking a step (always positive).
		var tDeltaX = stepX/dx;
		var tDeltaY = stepY/dy;
		var tDeltaZ = stepZ/dz;
		
		// Buffer for reporting faces to the callback.
		 /// *******
		
		// Avoids an infinite loop.
		if (dx === 0 && dy === 0 && dz === 0)
			throw new RangeError("Raycast in zero direction!");
		
		// Rescale from units of 1 cube-edge to units of 'direction' so we can
		// compare with 't'.
		radius /= Math.sqrt(dx*dx+dy*dy+dz*dz);
		
		let b = null;
		while ((x < reach) && (y < reach) && (z < reach)) {
		
			// Invoke the callback, unless we are not *yet* within the bounds of the
			// world.
			if (b = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z))) {
				return b;
			}
		
			// tMaxX stores the t-value at which we cross a cube boundary along the
			// X axis, and similarly for Y and Z. Therefore, choosing the least tMax
			// chooses the closest cube boundary. Only the first case of the four
			// has been commented in detail.
			if (tMaxX < tMaxY) {
				if (tMaxX < tMaxZ) {
					if (tMaxX > radius) break;
					// Update which cube we are now in.
					x += stepX;
					// Adjust tMaxX to the next X-oriented boundary crossing.
					tMaxX += tDeltaX;
					// Record the normal vector of the cube face we entered.

				} else {
					if (tMaxZ > radius) break;
					z += stepZ;
					tMaxZ += tDeltaZ;

				}
			} else {
				if (tMaxY < tMaxZ) {
					if (tMaxY > radius) break;
					y += stepY;
					tMaxY += tDeltaY;

				} else {
					// Identical to the second case, repeated for simplicity in
					// the conditionals.
					if (tMaxZ > radius) break;
					z += stepZ;
					tMaxZ += tDeltaZ;

				}
			}
		}
		}
		
	static intbound(s, ds) {
	// Find the smallest positive t such that s+t*ds is an integer.
		if (ds < 0) {
			return intbound(-s, -ds);
		} else {
			s = mod(s, 1);
			// problem is now s+t*ds = 1
			return (1-s)/ds;
		}
	}
	
	signum(x) {
	return x > 0 ? 1 : x < 0 ? -1 : 0;
	}
	
	mod(value, modulus) {
	return (value % modulus + modulus) % modulus;
	}
		
	
	
	updateState() {
	
	
			// ----- update camera -----
		
		
		this.camera.position = new Vector3().set(this.state.position);
		
		let theta = this.state.cam_theta;
		let phi = this.state.cam_phi;

		let lookat = new Vector3();

 		lookat.elements[0] = -this.camera.radius * Math.sin(theta) * Math.cos(phi);
 		lookat.elements[1] =  this.camera.radius * Math.sin(phi);
 		lookat.elements[2] = -this.camera.radius * Math.cos(theta) * Math.cos(phi)


		this.camera.target = new Vector3().set(this.camera.position).add(lookat);

		

		// ... and movement matrix.
			
		// ----- update position -----
		let acc = new Vector3([0, 0, 0]);
		if (this.flags.left_pressed) {
			acc.elements[0] -= this.attributes.acceleration;
		}
		if (this.flags.right_pressed) {
			acc.elements[0] += this.attributes.acceleration;
		}
		if (this.flags.up_pressed) {
			acc.elements[1] += this.attributes.acceleration;
		}
		if (this.flags.down_pressed) {
			acc.elements[1] -= this.attributes.acceleration;
		}
		if (this.flags.forward_pressed) {
			acc.elements[2] -= this.attributes.acceleration;
		}
		if (this.flags.back_pressed) {
			acc.elements[2] += this.attributes.acceleration;
		}
		

		let fd = new Vector3().set(this.camera.position);
		fd.sub(this.camera.target);
		
		let up = new Vector3([0, 1, 0]);
		
		let lr = Vector3.cross(fd, up);
		lr.normalize();
		
		fd = Vector3.cross(up, lr);
		fd.normalize();
		
		fd.mul(acc.elements[2]);
		up.mul(acc.elements[1]);
		lr.mul(-acc.elements[0]);
		
		let acceleration = new Vector3();
		acceleration.add(fd);
		acceleration.add(up);
		acceleration.add(lr);
		
		
		if (acceleration.magnitude_squared() > 0) { acceleration.normalize(); }
		
		this.state.velocity.add(acceleration);
		this.state.velocity.cap(this.attributes.max_vel);

		this.state.position.add(this.state.velocity);
		this.camera.target.add(this.state.velocity);
		this.camera.position.add(this.state.velocity);
		
		this.state.velocity.mul(this.attributes.friction);
		
		this.camera.calculateViewProjection();
		
		this.AABB.updateBounding();

		let collisions = this.collide(this.world);
		
// 		for (let block of collisions) {
// 			this.nudge(block);
// 		}
		
	}
}