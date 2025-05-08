
import Cube from "../lib/Cube.js";
import Camera from "../lib/Camera.js";
import getContext from "../lib/Context.js";
import RotateControls from "../lib/Controls.js";
// "imports," I feel like they belong up here, even though they don't
const uvImg = "../lib/img/uvCoords.png";
const diceImg = "../lib/img/dice.png";


import { Matrix4, Vector3, Vector4 } from "../lib/cuon-matrix-cse160.js";
import { initShaders, getWebGLContext } from "../lib/cuon-utils.js";

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
 `uniform mat4 u_ProjectionMatrix;
 	uniform mat4 u_ModelMatrix;
	uniform mat4 u_ViewMatrix;
 
 	attribute vec4 a_Position;
 	attribute vec4 a_Color;
 	
 	attribute vec2 a_UV;
 	varying vec2 v_UV;
 	 	
 	varying vec4 v_Color;
 	
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =
 `precision mediump float;
 	
 	uniform sampler2D u_Texture0;
 	uniform sampler2D u_Texture1;
 	
 	varying vec2 v_UV;
 	varying vec4 v_Color;
 
  void main() {
  	vec4 image0 = texture2D(u_Texture0, v_UV);
    vec4 image1 = texture2D(u_Texture1, v_UV);
    
    gl_FragColor = image0;
  }`

// Various initialization
const gl = getContext();
window.addEventListener('DOMContentLoaded', main, false);


// Shader variables //

let g_time;
let g_seconds;

// end shader variables //

let camera;
let cubes;
let controls;

function main() {
  
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  	console.log("Failed to initialize shaders.");
  }
  
  camera = new Camera(gl);
  cubes = []
  cubes.push( new Cube(null, null, null));
  
  for (let c in cubes) {
  	cubes[c].setImage(gl, uvImg, 0);
  	cubes[c].setImage(gl, diceImg, 1);
	}

	var controls = [];
	for (let c in cubes) {
		controls.push(new RotateControls(gl, cubes[c]))
	}
  
  g_time = performance.now()/1000.0
  
//   connectVariablesToGLSL();
	
  // Specify the color for clearing <canvas>
  let bg_color = new Vector4(hexToRgb("12090e")).div(255);
  bg_color.elements[3] = 1.0;
  gl.clearColor(...bg_color.giveList());

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//   addActionsForHtmlUI();
    
  requestAnimationFrame( tick );
  
}

// TODO: tick Animation
function tick() {
		
		
	let time = performance.now()/1000.0;
	let delta_time = time - g_time;
	g_time = time;
	
	delta_time *= 0.01;
	
	for (let c in controls) {
    if (!controls[c].dragging) {
      controls[c].lerpRotation.elements[1] += delta_time;
    }
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  for (let c in controls) {
    controls[c].update();
  }
  for (let c in cubes) {
    cubes[c].render(gl, camera);
  }
	
	requestAnimationFrame(tick);

}


function renderAllShapes(managers){


	g_seconds = performance.now()/1000.0 - g_startTime;

	let startTime= performance.now();


	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

  // Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
	
	let duration = performance.now() - startTime;
	sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "perf")

}


function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Color
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (!a_Color) {
    console.log('Failed to get the storage location of a_Color');
    return;
  }
  
  // Get the storage location of a_Color
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (!a_UV) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }


  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
  	console.log('Failed to get the storage location of u_ModelMatrix');
  	return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
  	console.log('Failed to get the storage location of u_ModelMatrix');
  	return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
  
}

// // adds each element to UI and returns an object with their default values
// function addActionsForHtmlUI(){
// 	let defaults = {};
// 
// 
// 	let camera_angle = document.getElementById("CamAngle");
// 	camera_angle.addEventListener('mousemove', function() {
// 		g_globalAngle = camera_angle.value;
// 	})
// 	g_globalAngle = camera_angle.value;
// 
// }

// **** HELPER FUNCTIONS ****


function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coord of mouse pointer
  var y = ev.clientY; // y coord of mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function sendTextToHTML(text, htmlID) {
	let html_element = document.getElementById(htmlID);
	if (!html_element) {
		console.log("Failed to get " + htmlID + " from HTML");
		return;
	}
	html_element.innerHTML = text;

}