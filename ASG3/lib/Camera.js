import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

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

  calculateViewProjection() {
    this.viewMatrix.setLookAt(
      ...this.position.elements,
      ...this.target.elements,
      ...this.up.elements
    );

    this.projectionMatrix.setPerspective(90, this.aspect, 0.01, 30);
  }
}
