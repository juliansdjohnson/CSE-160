
import { Cube } from "../lib/Cube.js";
import { Camera } from "../lib/Camera.js";
import { Block } from "../lib/block.js"
import { getContext } from "../lib/Context.js";
import { World } from "../lib/world.js";
import { SkyBox } from "../lib/skybox.js";

import { Matrix4, Vector3, Vector4 } from "../lib/cuon-matrix-cse160.js";
import { initShaders, getWebGLContext } from "../lib/cuon-utils.js";

// "imports," I feel like they belong up here, even though they don't
const g_textures = [
							 			 "../lib/img/grass.png",
							 			 "../lib/img/stone.png"
							 		 ]


// Various initialization
let gl;
window.addEventListener('DOMContentLoaded', main, false);


// Shader variables //

let g_startTime;
let g_time;
let g_seconds;

let g_world;
let g_texture0;
let g_texture1;
let imagestoload = 2;

// end shader variables //


function main() {
  
  g_startTime = performance.now()/1000.0
	
	gl = getContext();  
		
	// set up camera
	// set up controls.
	
	buildTextures(gl);
	
	let sky = new SkyBox(gl);
	
	let c = new Camera(gl, [0, 1, 2], [0, 0, 0]);	
	
	let chunk_size = new Vector3([16, 16, 16]);
	
	let world_options = { draw_distance : 1 }
	let gen_options = { sea_level : 3, dynamic_range: 20 }
	
	g_world = new World(chunk_size, gl, c, sky, world_options, gen_options);
	
  // Specify the color for clearing <canvas>
  let bg_color = new Vector4(hexToRgb("12090e")).div(255);
  bg_color.elements[3] = 1.0;
  gl.clearColor(...bg_color.giveList());

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//   addActionsForHtmlUI();
    
    
  g_world.update();
}


// TODO: tick Animation
function tick() {
		
		
	g_seconds = performance.now()/1000.0 - g_startTime;
	let startTime = performance.now()/1000.0;
	
	
	let time = performance.now()/1000.0;
	let delta_time = time - g_time;
	g_time = time;
	
	delta_time *= 0.01;


	g_world.update();



// 	g_world.update();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  renderAllShapes();  
  
  
	// render everything.

	requestAnimationFrame(tick);






	let duration = performance.now() / 1000.0 - startTime;
	sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "perf")

}


function renderAllShapes(){


	let startTime= performance.now();

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

  // Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	g_world.render();
	
	
// 	for (let b of g_blocks) {
// 		for (let dir of ["+z", "-z", "+x", "-x", "+y", "-y"]) {
// 			g_faces.push(b.giveFace(dir));
// 		}
// 	}
// 	g_faces.forEach( (element) => element.render(gl, g_camera) )
	
	
	
	

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



// builds textures from a dictionary of "type," "pathway"
// returns a dictionary of "type", texture numbers.
// this function is not dynamic.
function buildTextures(gl) {

		g_texture0 = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		const u_Texture0 = gl.getUniformLocation(gl.program, "u_Texture0");
		if (u_Texture0 < 0) console.error("Could not get uniform");

		const img0 = new Image();
		img0.onload = () => {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, g_texture0);
			
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				img0
			);
			console.log("loaded grass");
			onImgLoad();
		};
		
		gl.uniform1i(u_Texture0, 0);
		
		img0.crossOrigin = "anonymous";
		img0.src = g_textures[0];
		
		
		
		g_texture1 = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		const u_Texture1 = gl.getUniformLocation(gl.program, "u_Texture1");
		if (u_Texture1 < 0) console.error("Could not get uniform");

		const img1 = new Image();
		img1.onload = () => {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, g_texture1);
			
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				img1
			);
			console.log("loaded stone");
			onImgLoad();
		};
		
		gl.uniform1i(u_Texture1, 1);
		
		img1.crossOrigin = "anonymous";
		img1.src = g_textures[1];
		
}

function onImgLoad () {
	--imagestoload;
	
	if (imagestoload === 0) {
		  requestAnimationFrame( tick );
	}

}

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