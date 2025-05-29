import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

export class CameraControls {
  constructor(gl, camera) {
    this.canvas = gl.canvas;
    this.target = camera;
    
    this.default_pos = new Vector3().set(this.target.position);
    this.rotation = new Vector3();

    this.mouse = new Vector3(); // will use as a vector2
    this.lerpRotation = new Vector3(); // another epic vec2
    this.dragging = false;

		this.lerpZoom = 0;

    this.setHandlers();
    
  }

  setHandlers() {
    this.canvas.onmousedown = (e) => {
      let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      this.mouse.elements.set([x, y, 0]);
      this.dragging = true;
    };

    this.canvas.onmouseup = () => {
      this.dragging = false;
    };

    this.canvas.onmousemove = (e) => {
      let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      if (this.dragging) {
      	let dx = x - this.mouse.elements[0];
      	let dy = y - this.mouse.elements[1];
      	
      	this.lerpRotation.elements[0] -= dx;
      	this.lerpRotation.elements[1] -= dy;

				let t = this.lerpRotation.elements[1];
				t = Math.max(t, -Math.PI/2 + 0.01);
				t = Math.min(t, Math.PI/2 - 0.01)
				this.lerpRotation.elements[1] = t;

      }
    };
    
    this.canvas.onwheel = (e) => {
    
    	e.preventDefault();
			this.lerpZoom += e.deltaY * -0.01;
    };
  }

  update() {

		let d_r = this.lerpZoom * 0.1;
		this.target.updateRadius(d_r);
		this.lerpZoom -= d_r;

    let x = 0.9 * this.rotation.elements[0] +
    				0.1 * this.lerpRotation.elements[0];

    let y = 0.9 * this.rotation.elements[1] +
    				0.1 * this.lerpRotation.elements[1];

		this.rotation.setList([x, y, 0]);

		// rotate about the lookat point.
		
		let pos = new Vector3();
		let tar = new Vector3().set(this.target.target)

 		pos.elements[0] = -this.target.radius * Math.sin(x) * Math.cos(y);
 		pos.elements[1] =  this.target.radius * Math.sin(y);
 		pos.elements[2] = -this.target.radius * Math.cos(x) * Math.cos(y)
		
		this.target.position.set(pos);
  }
}
