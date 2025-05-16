import { initShaders } from "./cuon-utils.js"

export function getContext() {
  // Retrieve <canvas> element
  const canvas = document.getElementById("webgl");

//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

  // Get the rendering context for WebGL
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
  }
  
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	


//   window.addEventListener("resize", (e) => {
//     gl.canvas.width = window.innerWidth;
//     gl.canvas.height = window.innerHeight;
// 
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//   });

  return gl;
}


const VSHADER_SOURCE =
 `uniform mat4 u_ProjectionMatrix;
 	uniform mat4 u_ModelMatrix;
	uniform mat4 u_ViewMatrix;
  	
 	attribute vec4 a_Position;
 	uniform vec4 u_Color;
 	
 	attribute vec2 a_UV;
 	varying vec2 v_UV;
 	 	
 	varying vec4 v_Color;
 	
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    
    v_Color = u_Color;
    v_UV = a_UV;
  }`

// Fragment shader program
const FSHADER_SOURCE = 
 `precision mediump float;
 	
 	uniform sampler2D u_Texture0;
 	uniform sampler2D u_Texture1;
 	
 	varying vec2 v_UV;
 	varying vec4 v_Color;
	uniform int u_WhichTexture; 
  void main() {
  
  	vec4 image0 = texture2D(u_Texture0, v_UV);
    vec4 image1 = texture2D(u_Texture1, v_UV);
    
    if (u_WhichTexture == 0)
    	gl_FragColor = image0;
    if (u_WhichTexture == 1)
    	gl_FragColor = image1;

  }`
