import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

export default class Camera {
  constructor(gl, position = [0, 1, 2], target = [0, 0, 0]) {
    this.position = new Vector3(position);
    this.target = new Vector3(target);
    
    let tmp = new Vector3().set(target);
    tmp.sub(position);
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

    this.projectionMatrix.setPerspective(90, this.aspect, 0.01, 10);
  }
}
