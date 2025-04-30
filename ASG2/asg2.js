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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle;
let g_animalRotation = [0, 0, 0, 0];
let g_managers = [];
let g_startTime;
let g_seconds;

function main() {
  
  g_startTime = performance.now()/1000.0
  
  setupWebGL();

  connectVariablesToGLSL();
	
  // Specify the color for clearing <canvas>
  bg_color = new Vector4(hexToRgb("1bb6c4")).div(255);
  bg_color.elements[3] = 1.0;
  gl.clearColor(...bg_color.giveList());

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  addActionsForHtmlUI();
  
  let fish = makeAnimal();
  let swim = makeSwim(fish);
  
  let FishManager = new Manager(fish, "dummy", swim)
  
  g_managers.push( FishManager );
  
  FishManager.connectToDOM();
    
  requestAnimationFrame( tick );
  
}

// TODO: tick Animation
function tick() {
		
	g_managers.forEach((element) => {	
		element.modifyAnimal(); });

	renderAllShapes(g_managers);

	requestAnimationFrame(tick);

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
		renderAllShapes(g_managers);
	})
	g_globalAngle = camera_angle.value;

}


function renderAllShapes(managers){


	g_seconds = performance.now()/1000.0 - g_startTime;

	let startTime= performance.now();


	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

  // Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	

	let global_rotate_matrix = new Matrix4();
	global_rotate_matrix.rotate(g_globalAngle, 0, 1, 0);
	
	managers.forEach((element) => {
		element.animal.render(global_rotate_matrix)
		element.updateDOM();
	});
	
	
	let duration = performance.now() - startTime;
	sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "perf")

}


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


function makeAnimal() {
	let animal = new Animal();
		
	
	// dummies
	let tmp_mat;
	let tmp_part;
	let tmp_joint;
	let tmp_joint2;
	
	
	// new Vector4(hexToRgb("*")).div(256)
	
	let fin_white1 = new Vector4(hexToRgb("ff830e")).div(255)
	fin_white1.elements[3] = 1.0
	
	let head_orange1 = new Vector4(hexToRgb("fea20d")).div(255)
	head_orange1.elements[3] = 1.0

	let head_orange2 = new Vector4(hexToRgb("ff830e")).div(255)
	head_orange2.elements[3] = 1.0

	let head_white1 = new Vector4(hexToRgb("ebd585")).div(255)
	head_white1.elements[3] = 1.0

	
	let body_white1 = new Vector4(hexToRgb("ffcd62")).div(255)
	body_white1.elements[3] = 1.0

	let body_white2 = new Vector4(hexToRgb("e2dbb7")).div(255)
	body_white2.elements[3] = 1.0

	let body_white3 = new Vector4(hexToRgb("f5edcb")).div(255)
	body_white3.elements[3] = 1.0
	
	
	let body_white4 = new Vector4(hexToRgb("c4c79b")).div(255)
	body_white4.elements[3] = 1.0

	
	let pupil_black1 = new Vector4(hexToRgb("050803")).div(255)
	pupil_black1.elements[3] = 1.0

	let eye_white1 = new Vector4(hexToRgb("9cc048")).div(255)
	eye_white1.elements[3] = 1.0

	
	// * set up major locuses:
	// Cervical 7th Vertebra. No clue if a fish has this. but it's important in humans
	let c7 = new Part("c7", Primitive);
	
	// thoracic 1st vertebra.
	let t1 = new Part("t1", Primitive);
	
	// head
	let head = new Part("head", Primitive);
	
	// body
	let body = new Part("body", Primitive);
	
	//  Mid Back joint.
	let midBack = new Part("midBack", Primitive);
	
	//  Waist
	let waist = new Part("waist", Primitive);
	
	// Tail
	let tail = new Part("tail", Primitive);
	
	// right pectoral fin
	let rightPectoral = new Part("rightPectoral", Primitive);
	
	//  left pectoral fin
	let leftPectoral = new Part("leftPectoral", Primitive);
	
	// right pelvic fin
	let rightPelvic = new Part("rightPelvic", Primitive);
	
	/// left pelvic fin
	let leftPelvic = new Part("leftPelvic", Primitive);
	
	
	// root to c7. just a scale and translate joint.
	let root_to_c7 = new Joint("root_to_c7", 
																 c7,
																 new Matrix4());
	// scale the fish down by 1 -> c
	// in fish world, one fish head is one unit. so, universal scale up here let's
	// one fish world unit be c opengl world units
	const c = 0.2;
	root_to_c7.scale(c, c, c);
	
	animal.root.add_edge( root_to_c7 );
	animal.add_named_joint( root_to_c7 );
	
	
	// important dynamic joints:
	let default_options =	{ 'x_rotation' : { 'min': -90, 'max': 90, 'value': 0},
												  'y_rotation' : { 'min': -90, 'max': 90, 'value': 0},
												  'z_rotation' : { 'min': -90, 'max': 90, 'value': 0}}

	// c7 to head.
	let c7_to_head = new DynamicJoint("c7_to_head",
														 				head,
														 				new Matrix4(),
														 				default_options);
	
	c7_to_head.rotate(15, 1, 0, 0);
	c7_to_head.translate(0, 0, 0.1);
	
	c7.add_edge( c7_to_head );
	animal.add_named_joint( c7_to_head );
	
	
	// c7 to t1
	let c7_to_t1 = new DynamicJoint("c7_to_t1",
																	t1,
																	new Matrix4(),
																	default_options);
	c7.add_edge( c7_to_t1 );
	animal.add_named_joint( c7_to_t1 )
	
	// c7 to mid back.
	let t1_to_midBack = new DynamicJoint("t1_to_midBack",
																			 midBack,
																			 new Matrix4(),
																			 default_options);
	t1_to_midBack.rotate(15, 1, 0, 0);
	t1_to_midBack.translate(0, 0, -1.0);
	t1.add_edge( t1_to_midBack );
	animal.add_named_joint( t1_to_midBack );

	// mid back to waist
	let midBack_to_waist = new DynamicJoint("midBack_to_waist",
																	 				waist,
																	 				new Matrix4(),
																	 				default_options);
	midBack_to_waist.rotate(-25, 1, 0, 0);
	midBack_to_waist.translate(0, 0, -1.125);

	midBack.add_edge( midBack_to_waist );
	animal.add_named_joint( midBack_to_waist );
	
	// waist to tail
	let waist_to_tail = new DynamicJoint("waist_to_tail",
																			 tail,
																			 new Matrix4(),
																			 default_options);

	waist_to_tail.rotate(-40, 1, 0, 0);
	waist_to_tail.translate(0, 0, -1);
	waist.add_edge( waist_to_tail );
	animal.add_named_joint ( waist_to_tail );
	
	// c7 to body
	let t1_to_body = new DynamicJoint("t1_to_body",
														 				body,
														 				new Matrix4(),
														 				default_options);

	t1_to_body.rotate(35, 1, 0, 0);
	t1_to_body.translate(0, -0.5, 0);
	t1.add_edge( t1_to_body );
	animal.add_named_joint( t1_to_body );
	
	// body to fins
	// right pectoral fin
	let body_to_rightPectoral = new DynamicJoint("body_to_rightPectoral", 
																			  rightPectoral,
																			  new Matrix4(),
																			  default_options);
	body_to_rightPectoral.rotate(-35, 1, 0, 0);
	body_to_rightPectoral.rotate(40, 0, 0, 1);

	body_to_rightPectoral.translate(0, -0.9, 0);
	body.add_edge( body_to_rightPectoral );
	animal.add_named_joint( body_to_rightPectoral );

	
	//  left pectoral fin
	let body_to_leftPectoral = new DynamicJoint("body_to_leftPectoral", 
																				leftPectoral,
																			  new Matrix4(),
																			  default_options);
	
	body_to_leftPectoral.rotate(-35, 1, 0, 0);
	body_to_leftPectoral.rotate(-40, 0, 0, 1);

	body_to_leftPectoral.translate(0, -0.9, 0);
	body.add_edge( body_to_leftPectoral );
	animal.add_named_joint( body_to_leftPectoral );

	// right pelvic fin
	let body_to_rightPelvic = new DynamicJoint("body_to_rightPelvic", 
																			  rightPelvic,
																			  new Matrix4(),
																			  default_options);
	
	body_to_rightPelvic.rotate(0, 1, 0, 0);
	body_to_rightPelvic.rotate(10, 0, 0, 1);
	
	body_to_rightPelvic.translate(0, -1.5, 0);

	body.add_edge( body_to_rightPelvic );
	animal.add_named_joint( body_to_rightPelvic );

	
	/// left pelvic fin
	let body_to_leftPelvic = new DynamicJoint("body_to_leftPelvic", 
																			  leftPelvic,
																			  new Matrix4(),
																			  default_options);
	body_to_leftPelvic.rotate(0, 1, 0, 0);
	body_to_leftPelvic.rotate(-10, 0, 0, 1);
	
	body_to_leftPelvic.translate(0, -1.5, 0);

	body.add_edge( body_to_leftPelvic );
	animal.add_named_joint( body_to_leftPelvic );



	// new Joint( "name", new Part( "name2", Cube ), new Matrix4().scale(0.1, 0.1, 0.1) );
	
	
	// ---- head ------
	tmp_joint = new Joint( "head_to_head",
												 new Part( "head", Cube, { 'color' : head_orange1}),
												 new Matrix4()
												 );
	
	tmp_joint.rotate(5, 1, 0, 0);
	tmp_joint.scale(0.85, 0.8, 0.95);
	tmp_joint.translate(0, -0.7, 0.6);
	
	head.add_edge( tmp_joint );
		

	// cheeks
	tmp_joint = new Joint( "head_to_left_cheek",
												 new Part( "left_cheek", Primitive ),
												 new Matrix4()
												 );

	tmp_joint.translate(-0.45, -0.6, 0.2);

	tmp_joint2 = new Joint( "left_cheek_to_prim",
												  new Part( "left_cheek_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(-10, 1, 0, 0);
 	tmp_joint2.rotate(9, 0, 1, 0);
	tmp_joint2.scale(0.2, 0.9, 0.7);

									
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );
	
	
	tmp_joint = new Joint( "head_to_right_cheek",
												 new Part( "right_cheek", Primitive ),
												 new Matrix4()
												 );

	tmp_joint.translate(0.45, -0.6, 0.2);

	tmp_joint2 = new Joint( "right_cheek_to_prim",
												  new Part( "right_cheek_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(-10, 1, 0, 0);
 	tmp_joint2.rotate(-9, 0, 1, 0);
	tmp_joint2.scale(0.2, 0.9, 0.7);

									
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );

	
	// eyes
	tmp_joint = new Joint( "head_to_right_iris",
												 new Part( "right_iris", Cube, { 'color' : pupil_black1 }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(0.4, -0.6125, 0.75);
	tmp_joint.scale(0.17, 0.17, 0.17);
	tmp_joint.rotate(-10, 1, 0, 0);

	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_right_white",
												 new Part( "right_white", Cube, { 'color' : eye_white1 }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(0.4, -0.6125, 0.75);
	tmp_joint.scale(0.13, 0.3, 0.3);
	tmp_joint.rotate(-10, 1, 0, 0);
	
	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_left_iris",
												 new Part( "left_iris", Cube, { 'color' : pupil_black1 }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(-0.4, -0.6125, 0.75);
	tmp_joint.scale(0.17, 0.17, 0.17);
	tmp_joint.rotate(-10, 1, 0, 0);

	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_left_white",
												 new Part( "left_white", Cube, { 'color' : eye_white1 }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(-0.4, -0.6125, 0.75);
	tmp_joint.scale(0.13, 0.3, 0.3);
	tmp_joint.rotate(-10, 1, 0, 0);
	
	head.add_edge( tmp_joint );


	// chin
	tmp_joint = new Joint( "head_to_chin",
												 new Part( "chin", Primitive ),
												 new Matrix4()
												 );

	tmp_joint.translate(0, -0.7, 1)

	tmp_joint2 = new Joint( "chin_to_prim",
												  new Part( "chin_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							

	tmp_joint2.rotate(5, 1, 0, 0);
	tmp_joint2.scale(0.7, 0.7, 0.3);									
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );
	
	// jowels
	
	tmp_joint = new Joint( "head_to_right_jowel",
												 new Part( "right_jowel", Primitive ),
												 new Matrix4()
												 );
	tmp_joint.translate(0.5, -1, 1);

	tmp_joint2 = new Joint( "right_jowel_to_prim",
												  new Part( "right_jowel_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(-35, 0, 0, 1)
	tmp_joint2.rotate(-10, 1, 0, 0);
	tmp_joint2.rotate(-25, 0, 1, 0);
	
	tmp_joint2.scale(0.2, 0.3, 0.5)
	
	tmp_joint2.translate(-0.55, 0.2, -0.2)
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );

 // * 2
	tmp_joint = new Joint( "head_to_left_jowel",
												 new Part( "left_jowel", Primitive ),
												 new Matrix4()
												 );
	tmp_joint.translate(-0.5, -1, 1);

	tmp_joint2 = new Joint( "left_jowel_to_prim",
												  new Part( "left_jowel_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(35, 0, 0, 1)
	tmp_joint2.rotate(-10, 1, 0, 0);
	tmp_joint2.rotate(25, 0, 1, 0);
	
	tmp_joint2.scale(0.2, 0.3, 0.5)
	
	tmp_joint2.translate(0.55, 0.2, -0.2)
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );

	// back jowel

	tmp_joint = new Joint( "head_to_right_jowel2",
												 new Part( "right_jowel2", Primitive ),
												 new Matrix4()
												 );
	tmp_joint.translate(0.5, -1.2, 0.5);

	tmp_joint2 = new Joint( "right_jowel2_to_prim",
												  new Part( "right_jowel2_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(-25, 0, 0, 1)
	tmp_joint2.rotate(-5, 1, 0, 0);
	tmp_joint2.rotate(-15, 0, 1, 0);
	
	tmp_joint2.scale(0.2, 0.35, 0.75)
	
	tmp_joint2.translate(-0.15, 0.25, -0.2)
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );



  // *2
	tmp_joint = new Joint( "head_to_left_jowel2",
												 new Part( "left_jowel2", Primitive ),
												 new Matrix4()
												 );
	tmp_joint.translate(-0.5, -1.2, 0.5);

	tmp_joint2 = new Joint( "left_jowel2_to_prim",
												  new Part( "left_jowel2_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(25, 0, 0, 1);
	tmp_joint2.rotate(-5, 1, 0, 0);
	tmp_joint2.rotate(15, 0, 1, 0);
	
	tmp_joint2.scale(0.2, 0.35, 0.75);
	
	tmp_joint2.translate(0.15, 0.25, -0.2);
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );


	// lips
	tmp_joint = new Joint( "head_to_upper_lip",
												 new Part( "upper_lip", Primitive ),
												 new Matrix4()
												 );
	tmp_joint.translate(0, -0.9, 1.1);

	tmp_joint2 = new Joint( "upper_lip_to_prim",
												  new Part( "upper_lip_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(15, 1, 0, 0);
	tmp_joint2.scale(0.5, 0.4, 0.3);
	tmp_joint2.translate(0, 0.15, 0);
														  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );
	
	
	// brow
	tmp_joint = new Joint( "head_to_brow",
												 new Part( "brow", Primitive ),
												 new Matrix4()
												 );

	tmp_joint.translate(0, -0.1, 0.5);

	tmp_joint2 = new Joint( "brow_to_prim",
												  new Part( "brow_prim", Cube, { 'color' : head_orange2 }),
												  new Matrix4()
												  );
	
	tmp_joint.rotate(10, 1, 0, 0);
	tmp_joint.scale(0.95, 0.4, 1)		
	tmp_joint.translate(0, 0, -0.05)
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );


	// jaw
	tmp_joint = new Joint( "head_to_jaw",
												 new Part( "jaw", Primitive ),
												 new Matrix4()
												 );

	tmp_joint.translate(0, -1.05, 0.5);

	tmp_joint2 = new Joint( "jaw_to_prim",
												  new Part( "jaw_prim", Cube, { 'color' : head_white1 }),
												  new Matrix4()
												  );
	
	tmp_joint.rotate(-25, 1, 0, 0);
	tmp_joint.scale(0.9, 0.5, 1)		
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );


	
	// ------ upper torso ------
	tmp_joint = new Joint( "t1_to_upper_torso",
											 	 new Part( "upper_torso", Cube, { 'color' : body_white3}),
											 	 new Matrix4() 
										 );
  tmp_joint.rotate(15, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.125);
	tmp_joint.translate(0, -0.4, -0.5);

	t1.add_edge( tmp_joint );

	// ------ ribcage ------
	tmp_joint = new Joint( "t1_to_right_ribcage",
											 	 new Part( "right_ribcage", Cube, { 'color' : body_white2}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(10, 1, 0, 0);
  tmp_joint.rotate(10, 0, 0, 1);
	tmp_joint.scale(0.5, 1.2, 1.2);
	tmp_joint.translate(0.2, -0.7, -0.5);

	t1.add_edge( tmp_joint );
	
	tmp_joint = new Joint( "t1_to_left_ribcage",
											 	 new Part( "left_ribcage", Cube, { 'color' : body_white2}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(10, 1, 0, 0);
  tmp_joint.rotate(-10, 0, 0, 1);
	tmp_joint.scale(0.5, 1.2, 1.2);
	tmp_joint.translate(-0.2, -0.7, -0.5);

	t1.add_edge( tmp_joint );
	
	tmp_joint = new Joint( "t1_to_right_lower_ribcage",
											 	 new Part( "right_lower_ribcage", Cube, { 'color' : body_white4}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
  tmp_joint.rotate(-25, 0, 0, 1);
	tmp_joint.scale(0.5, 0.5, 1.2);
	tmp_joint.translate(1.4, -1.8, -0.85);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_left_lower_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'color' : body_white4}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
  tmp_joint.rotate(25, 0, 0, 1);
	tmp_joint.scale(0.5, 0.5, 1.2);
	tmp_joint.translate(-1.4, -1.8, -0.85);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_bottom_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'color' : body_white4}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.4);
	tmp_joint.translate(0, -2.5, -0.7);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_back_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'color' : body_white4}),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(105, 1, 0, 0);
	tmp_joint.scale(0.85, 0.5, 1.4);
	tmp_joint.translate(0, -2.5, 0.85);

	t1.add_edge( tmp_joint );


	// lower back
	tmp_joint = new Joint( "midBack_to_oblique",
												 new Part( "oblique", Cube, { 'color' : body_white3}),
												 new Matrix4()
											 );
									
	tmp_joint.translate(0, -0.4, -0.5625);		 
	tmp_joint.rotate(-24, 1, 0, 0);

	tmp_joint.scale(0.5, 0.5, 1.125);
	midBack.add_edge( tmp_joint );


	tmp_joint = new Joint( "midBack_to_below_ribcage",
												 new Part( "below_ribcage", Cube, { 'color' : body_white3}),
												 new Matrix4()
												 );
	
	tmp_joint.rotate(-20, 1, 0, 0);
	tmp_joint.scale(0.8, 1.0, 1.0);
	tmp_joint.translate(0, -0.7, -0.7);
	
	midBack.add_edge( tmp_joint );
					 

	// lumbar
	tmp_joint = new Joint ("waist_to_lumbar",
												 new Part( "lumbar", Cube, { 'color' : body_white3}),
												 new Matrix4()
											 	);
	
	tmp_joint.translate(0, -0.4, -0.45);
	tmp_joint.rotate(-35, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.125)
	
	waist.add_edge( tmp_joint );


	tmp_joint = new Joint ("waist_to_waist_fat",
												 new Part( "waist_fat", Cube, { 'color' : body_white3}),
												 new Matrix4()
											 	);
	
	tmp_joint.rotate(-35, 1, 0, 0);
	tmp_joint.scale(0.7, 0.7, 1);
	tmp_joint.translate(0, -0.6, -0.6);
	
	waist.add_edge( tmp_joint );



	tmp_joint = new Joint ("tail_to_tail_bump",
												 new Part( "tail_bump", Cube, { 'color' : body_white3 }),
												 new Matrix4()
											 	);
	
	tmp_joint.rotate(35, 1, 0, 0);
	tmp_joint.scale(0.6, 0.8, 0.6);
	tmp_joint.translate(0, -0.3, 0);
	
	tail.add_edge( tmp_joint );

	
	// --------- FINS -------------
	
	let curr_seg;
	let prev_seg;
	let finDelay = 3;
	let fin_color = fin_white1;

	// right pectoral
	// for loop would be good here. But, I want fine control. Look at this section and
	// imagine sexier code
	curr_seg = new FollowerJoint( "rightPectoral_to_seg",
																 new Part( "seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(45, 1, 0, 0);
	curr_seg.rotate(10, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	rightPectoral.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.25);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.5);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.15);
	
	prev_seg.head.add_edge(curr_seg);

	
	
	// left pectoral
	
	curr_seg = new FollowerJoint( "leftPectoral_to_seg",
																 new Part( "seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(45, 1, 0, 0);
	curr_seg.rotate(-10, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	leftPectoral.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.25);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.5);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.15);
	
	prev_seg.head.add_edge(curr_seg);

	
	
	
	// right pelvic
	
	curr_seg = new FollowerJoint( "rightPelvic_to_seg",
																 new Part( "seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(15, 1, 0, 0);
	curr_seg.rotate(30, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	rightPelvic.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.1);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.1);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.05);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);

	// left pelvic
	
	curr_seg = new FollowerJoint( "leftPelvic_to_seg",
																 new Part( "seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(15, 1, 0, 0);
	curr_seg.rotate(-30, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	leftPelvic.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.1);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.1);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.05);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	
	
	// tail
	
	curr_seg = new FollowerJoint( "tail_to_seg",
																 new Part( "seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(135, 1, 0, 0);
	curr_seg.translate(0, -0.1, 0.2);
	curr_seg.scale(0.1, 0.1, 0.8);
	
	tail.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, -0.1);
	curr_seg.scale(1, 1, 1.5)

	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, -0.2);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 1.1)

	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);

	
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 0.9)

	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'color' : fin_color }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 0.9)

	prev_seg.head.add_edge(curr_seg);
	
	
// 	let body = new Part("body", Cube, { color : new Vector4([1.0, 1.0, 1.0, 1.0]) });
// 	
// 	let bodyJoint = new DynamicJoint( "bodyJoint",
// 	 																  body, 
// 	 																  
// 	 																  { x_rotation : { min : 0, max : 90, value : 10} },
// 	 																 	
// 	 																 	new Matrix4());
// 	bodyJoint.scale(0.5, 0.2, 0.2);
	
// 	animal.root.add_edge( bodyJoint );
// 	animal.add_named_joint( bodyJoint );
	
	return animal;

}

function makeSwim(animal) {

	let swim = new Animation("swim", animal);
	swim.add_rule("waist_to_tail", "y_rotation", "set", sinAnim, 15, 0.75, 0, 0);
  swim.add_rule("c7_to_head", "y_rotation", "set", sinAnim, 10, 0.75, 1*Math.PI, 0);
	swim.add_rule("c7_to_t1", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);
	swim.add_rule("t1_to_midBack", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);
	swim.add_rule("midBack_to_waist", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);

	swim.add_rule("body_to_rightPectoral", "z_rotation", "set", sinAnim, 25, 0.4, 0, 0);
	swim.add_rule("body_to_leftPectoral", "z_rotation", "set", sinAnim, 25, 0.4, 0, 0);


	return swim;
}

function sinAnim(amp, period, phase, offset) {
	let b = 2*Math.PI / period
	return amp * Math.sin(b * g_seconds + phase) + offset
}
