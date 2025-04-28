// TODO: Set up event handlers for sliders.

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
 `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =
 `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// GLOBALS!
let canvas;
let gl;
let a_Position;
let u_Fragcolor;
let u_Size;
let g_Brush;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle;
let g_animalRotation = [0, 0, 0, 0];
let g_objects = [];

function main() {
  
  setupWebGL();

  connectVariablesToGLSL();

  // set up a new empty brush object with default values
  g_Brush = new Brush(addActionsForHtmlUI());

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  g_objects.push( makeAnimal() );
  renderAllShapes(g_objects);
  
  
}

function makeAnimal() {
	let animal = new Animal();
	
	let slider_list = document.getElementById("slider-list");
	
	let body = new Part("body", Cube, { color : new Vector4([1.0, 1.0, 1.0, 1.0]) });
	
	let bodyJoint = new DynamicJoint( "bodyJoint",
	 																  body, 
	 																  
	 																  { x_rotation : { min : 0, max : 90, value : 10, DOM : true}
	 																 	})
	
	animal.root.add_edge( bodyJoint );
	animal.add_named_joint( bodyJoint );
	
	addJointsToDOM(animal.named_joints, document.getElementById('slider-list'));	
	return animal;

}

function setupWebGL(){
  // retrieve the <canvas> element
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
	gl.enable(gl.DEPTH_TEST);
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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
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

// adds each element to UI and returns an object with their default values
function addActionsForHtmlUI(){
	let defaults = {};


	let camera_angle = document.getElementById("CamAngle");
	camera_angle.addEventListener('mousemove', function() {
		g_globalAngle = camera_angle.value;
		renderAllShapes(g_objects);
	})
	g_globalAngle = camera_angle.value;

}

function addJointsToDOM(joints, page_location) {

	for (let joint in joints) {	
 		let new_slider;
 		let new_label;
 		let new_title = document.createTextNode(name + ":");
 		page_location.appendChild(new_title);

		let options = { 'x_rotation': joints[joint].x_rotation,
										'y_rotation': joints[joint].y_rotation,
										'z_rotation': joints[joint].z_rotation }

		for (let option in options) {
			if (!options[option] ) { continue; }
			if (!options[option].DOM ) { continue; }
			
			new_label = document.createElement("label");
			new_label.setAttribute("for", joint + option);
			new_label.innerHTML = joint + " " + option + ": ";
		
			page_location.appendChild(new_label);	
		
			new_slider = document.createElement("input");
			new_slider.type = "range";
			new_slider.id = joint + option;
			new_slider.min = options[option]['min'];
			new_slider.max = options[option]['max'];
			new_slider.value = options[option]['value'];
			
			page_location.appendChild(new_slider);
			
			document.getElementById(joint + option).addEventListener('mousemove', function() {
				joint.options.option.value = this.value;
			})
			
		}
	
	}

}


function renderAllShapes(objects){

  // Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
	let global_rotate_matrix = new Matrix4();
	global_rotate_matrix.rotate(g_globalAngle, 0, 1, 0);
	
	objects.forEach((element) => element.render(global_rotate_matrix));
}


// **** HELPER FUNCTIONS ****

function clearCanvas() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
