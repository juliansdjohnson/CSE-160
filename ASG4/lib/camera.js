import { Matrix4, Vector3 } from "./cuon-matrix-cse160.js";

// shamelessly and unethically adapted from lab3,
// takes a context, a position and a target, calculates a projection matrix
// a la cuon-matrix
export class Camera {
  constructor(gl, pos = [0, 1, 2], tar = [0, 0, 0]) {

    this.position = new Vector3(pos);
    this.target = new Vector3(tar);
    
    let tmp = new Vector3().set(this.target);
    tmp.sub(this.position);
    this.radius = Math.sqrt(Vector3.dot(tmp, tmp));
    
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.up = new Vector3([0, 1, 0]);

    this.aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

//     window.addEventListener("resize", (e) => {
//       this.aspect = window.innerWidth / window.innerHeight;
// 
//       this.calculateViewProjection();
//     });

    this.calculateViewProjection();
  }
  
  updateRadius(val) {
  
  	if (Math.abs(val) < 0.0001) {
  		return;
  	}

		const old_position = this.position;

		let d = new Vector3().set(this.target)
												 .sub(this.position)
												 .normalize();

		this.position.add(d.mul(val));
		
		// find radius
		let tmp = new Vector3().set(this.target)
													 .sub(this.position);
    const r = Math.sqrt(Vector3.dot(tmp, tmp));
    
    // if it's too small, reset.
    if (r < 1.0 && Vector3.dot(tmp, d) > 0) {
    	this.position.set(old_position);
    } else {
    	this.radius = r;
    }
	
  }

  calculateViewProjection() {
    this.viewMatrix.setLookAt(
      ...this.position.elements,
      ...this.target.elements,
      ...this.up.elements
    );

    this.projectionMatrix.setPerspective(90, this.aspect, 0.01, 30);
  }
}
