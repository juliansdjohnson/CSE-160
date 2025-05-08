import { Vector3 } from "../lib/cuon-matrix-cse160.js";

export class Player {
	constructor(gl,
							camera, 
							position=new Vector3([0, 0, 0]), 
							cam_angle=new Vector3([0, 0, 0])) {
	
		this.canvas = gl.canvas;
		this.camera = camera;
		
		this.state = {	
								  	'position' : position,
										'velocity' : new Vector3([0, 0, 0]),

										'cam_angle' : cam_angle
										
										'grounded' : false
								 }
		
		this.attributes = {
												acceleration : 1;
												friction : 0.3;
												gravity : 1;
												max_vel : 2;
										  }
		
		this.flags = {
								   left_pressed : false,
								   right_pressed : false,
								   forward_pressed : false,
								   back_pressed : false,
								   
								   pointer_locked : false
								   
								 }
		
		this.setHandlers();	

	}
	
	setHandlers() {
		document.addEventHandler("keydown", (ev) => {
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
			};
		})
		
		document.addEventHandler("keyup", (ev) => {
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
			};
		})
		
		this.canvas.addEventHandler("click", (ev) => {
			if (!document.pointerLockElement) {
				this.canvas.requestPointerLock({ unadjustedMovement : true });
				this.pointer_locked = true;
			}
			// TODO: add robust event handling for clicks
		
		})
		
		this.canvas.onmousemove = (e) => {
			if (!this.pointer_locked) {
				return;
			}
			
			// TODO: add mouse move functionality
			
			//-event.movementX, -Y
			
			let scale = 1
			this.state.cam_theta += event.movementX;
			this.state.cam_phi += event.movementY;
		
		}
		
		
	}
	
	updateState() {
	
		// ----- update position -----
		let acceleration = new Vector3([0, 0, 0]);
		if (this.left_pressed) {
			acceleration.elements[0] -= this.attributes.acceleration;
		}
		if (this.right_pressed) {
			acceleration.elements[0] += this.attributes.acceleration;
		}
		if (this.forward_pressed) {
			acceleration.elements[1] += this.attributes.acceleration;
		}
		if (this.back_pressed) {
			acceleration.elements[1] -= this.attributes.acceleration;
		}

		// TOOD: make this actually work
		this.state.velocity.add(acceleration);
		this.state.velocity.cap(this.attributes.max_vel);

		let d_position = new Vector3();
		
		// TODO: MAKE THE MODIFICATIONS WORK. 
		// You're currently in a coordinate plane with:
		// up as your +z,
		// up cross d as your +x
		// (up cross d) cross up as your +y
		// make it make sense in reverse!

		this.state.position.add(this.state.velocity);
		
		this.state.velocity.mul(this.attributes.friction);
				
		// ----- update camera -----
		
		
		this.camera.position = new Vector3().set(this.state.position);
		
		let lookat = new Vector3();
		lookat.elements[0] = this.camera.radius * Math.sin(this.state.cam_angle[0]) * Math.cos(this.state.cam_angle[1]);
		lookat.elements[1] = this.camera.radius * Math.sin(this.state.cam_angle[0]) * Math.sin(this.state.cam_angle[1]);
		lookat.elements[3] = this.camera.radius * Math.cos(this.state.cam_angle[0]);
		
		this.camera.target = new Vector3().set(this.camera.position).add(lookat);
		
	
	}
	

	
}