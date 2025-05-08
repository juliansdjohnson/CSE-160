// brazenly and unethically stolen from our lab section.

import { Matrix4, Vector3 } from "./cuon-matrix-cse160.js";

export default class Cube {
  constructor(position, rotation, scale) {
    this.vertices = null;
    this.uvs = null;
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.texture0 = null;
    this.texture1 = null;

    this.position = position ? new Vector3(position) : new Vector3([0, 0, 0]);
    this.rotation = rotation ? new Vector3(rotation) : new Vector3([0, 0, 0]);
    this.scale = scale ? new Vector3(scale) : new Vector3([1, 1, 1]);
    this.modelMatrix = new Matrix4();

    this.setVertices();
    this.setUvs();
  }

  setImage(gl, imagePath, index) {
    if (index === 0) {
      if (this.texture0 === null) {
        this.texture0 = gl.createTexture();
      }

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      const u_Texture0 = gl.getUniformLocation(gl.program, "u_Texture0");
      console.log(u_Texture0);
      if (u_Texture0 < 0) console.error("Could not get uniform");

      const img = new Image();

      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );
      };

      gl.uniform1i(u_Texture0, 0);

      img.crossOrigin = "anonymous";
      img.src = imagePath;

    } else if (index === 1) {
      if (this.texture1 === null) {
        this.texture1 = gl.createTexture();
      }

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      const u_Texture1 = gl.getUniformLocation(gl.program, "u_Texture1");
      if (u_Texture1 < 0) console.error("Could not get uniform");

      const img = new Image();
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );

        gl.uniform1i(u_Texture1, 1);
      };

      img.crossOrigin = "anonymous";
      img.src = imagePath;
    }
  }

  setVertices() {
  
    this.vertices = new Float32Array([
      //FRONT
      -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
      -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      //LEFT
      -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      //RIGHT
      0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
      0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
      //TOP
      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
      //BACK
      0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
      -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
      //BOTTOM
      -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
    ]);
  }

  setUvs() {

    this.uvs = new Float32Array([
      // FRONT
      0.5,0.25, 0.5,0.5, 0.25,0.5, 0.5, 0.25, 0.25,0.5, 0.25,0.25,
      // LEFT
      0.75,0, 0.75,0.25, 0.5,0.25, 0.75,0, 0.5,0.25, 0.5,0,
      // RIGHT
      0.5,0.75, 0.5,0.5, 0.75,0.5, 0.5,0.75, 0.75,0.5, 0.75,0.75,
      // TOP
      0.25,0.25, 0.25,0.5, 0,0.5, 0.25,0.25, 0,0.5, 0,0.25,
      // BACK //bca
      0.75,0.5, 1,0.5, 0.75,0.25, 0.75, 0.25, 1, 0.5, 1, 0.25,
      // BOTTOM 
      0.75,0.25, 0.75,0.5, 0.5,0.5, 0.75,0.25, 0.5,0.5, 0.5,0.25
    ]);
  }

  calculateMatrix() {
    let [x, y, z] = this.position.elements;
    let [rx, ry, rz] = this.rotation.elements;
    let [sx, sy, sz] = this.scale.elements;

    this.modelMatrix
      .setTranslate(x, y, z)
      .rotate(rx, 1, 0, 0)
      .rotate(ry, 0, 1, 0)
      .rotate(rz, 0, 0, 1)
      .scale(sx, sy, sz);
  }

  render(gl, camera) {
    this.calculateMatrix();

    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_UV = gl.getAttribLocation(gl.program, "a_UV");
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(
      gl.program,
      "u_ProjectionMatrix"
    );

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(
      u_ProjectionMatrix,
      false,
      camera.projectionMatrix.elements
    );

    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      if (!this.vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}
