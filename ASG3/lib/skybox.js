// adapted for my needs from webglfundamentals.org/webgl/lessons/webgl-skybox.html

import { createProgram } from "./cuon-utils.js";
import { Matrix4 } from "./cuon-matrix-cse160.js";

const VSHADER_SKYBOX = 
 `
	attribute vec4 a_Position;
	varying vec4 v_Position;

	uniform mat4 u_ViewDirectionProjectionInverse;
	
	void main() {
		v_Position = u_ViewDirectionProjectionInverse * a_Position;
		gl_Position = a_Position;
		gl_Position.z = 1.0;
	}
 `

const FSHADER_SKYBOX = 
 `
	precision mediump float;
	
	uniform samplerCube u_Skybox;
	
	varying vec4 v_Position;
	void main() {
		gl_FragColor = textureCube(u_Skybox, normalize(v_Position.xyz / v_Position.w));
	}
 
 
 `

export class SkyBox {

	constructor(gl) {
		let program = createProgram(gl, VSHADER_SKYBOX, FSHADER_SKYBOX);
		if (!program) {
    	console.error('Failed to create program');
    	return false;
  	}

		this.program = program;
		this.texture = null;
		this.setImages(gl);
	
	}
	
	static {
		let vertices = new Float32Array(
			[
				-1, -1,
				 1, -1,
				-1,  1,
				-1,  1,
				 1, -1,
				 1,  1
			]);
		this.vertices = vertices;
	}
	
	setImages(gl) {
		if (this.texture === null) {
			this.texture = gl.createTexture();
		}
		
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		
		const faceInfo = [
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
				url: "../lib/img/skybox/vz_classic_right.png"
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
				url: "../lib/img/skybox/vz_classic_left.png"
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				url: "../lib/img/skybox/vz_classic_up.png"
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
				url: "../lib/img/skybox/vz_classic_down.png"
			},
			{
				target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				url: "../lib/img/skybox/vz_classic_front.png"
			},
			{
				target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
				url: "../lib/img/skybox/vz_classic_back.png"
			}
		] 
		
		faceInfo.forEach((face) => {
			const {target, url} = face;
			
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			
			
			const image = new Image();
			image.src = url;
			image.crossOrigin = "anonymous";
			image.addEventListener('load', () => {
				
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

// 				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// 				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
								
				gl.texImage2D(target, 
											0, 
											gl.RGBA, 
											gl.RGBA,
											gl.UNSIGNED_BYTE,
											image);
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
			});	
		});
		
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);	

	}
	
	render(gl, camera) {
		let a_Position = gl.getAttribLocation(this.program, "a_Position");
		let u_Skybox = gl.getUniformLocation(this.program, "u_Skybox");
		let u_ViewDirectionProjectionInverse = 
			gl.getUniformLocation(this.program, "u_ViewDirectionProjectionInverse");
	
		
		let position_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, SkyBox.vertices, gl.STATIC_DRAW);
		
		gl.useProgram(this.program);
		
		gl.enableVertexAttribArray(a_Position);
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
		
		// matrices
		
		let projectionMatrix = new Matrix4().setPerspective(90, camera.aspect, 1, 2000);		
		let viewMatrix = new Matrix4().set(camera.viewMatrix);
// 		viewMatrix.invert();
		
		viewMatrix.elements[12] = 0;
		viewMatrix.elements[13] = 0;
		viewMatrix.elements[14] = 0;
		
		let ViewDirectionProjectionMatrix = new Matrix4().setIdentity()
																						.multiply(projectionMatrix)
																						.multiply(viewMatrix);
		ViewDirectionProjectionMatrix.invert();
		
		gl.uniformMatrix4fv(u_ViewDirectionProjectionInverse, false, ViewDirectionProjectionMatrix.elements);
		gl.uniform1i(u_Skybox, 0);
		gl.depthFunc(gl.LEQUAL);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		// reset depthFunc;
		gl.depthFunc(gl.LESS);
	}

}