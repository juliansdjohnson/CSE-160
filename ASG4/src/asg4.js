// TODO: Set up event handlers for sliders.
// TODO:


// basic shader
// camera with rotate controls.
// render foreach shapes

// get cube going
// get sphere
// find a way to generate normals, attach them in the right places.

// basic phong shader


// refactor fish a little bit from manager -> animal to fish -> body.

// wishlist:
// shadowing?????

import { Matrix4, Vector3, Vector4} from "../lib/cuon-matrix-cse160.js";
import { getContext } from "../lib/context.js";
import { Camera } from "../lib/camera.js";
import { CameraControls } from "../lib/controls.js";
import { Primitive, Cube, Sphere } from "../lib/cube.js";
import { PointLight, SpotLight } from "../lib/light.js";
import { Animal, 
				 Animation, 
				 TransformDict, 
				 Transform, 
				 Body, 
				 Joint, 
				 DynamicJoint, 
				 FollowerJoint,
				 SetLengthQueue,
				 Part } from "../lib/animal.js";
import { convertCoordinatesEventToGL, hexToRgb, sendTextToHTML } from "../lib/misc-util.js";


let gl;
let g_shapes = [];
let g_lights = [];
let g_camera;
let g_controls;

let g_mode = 0;

let g_seconds = null;
let g_last_time = null;
let g_curr_time = null;

window.addEventListener('DOMContentLoaded', main, false);
function main() {  
	
	
	// create ALL program/shaders:
	// TODO: normal "light"
	// 				flat "light"
	// 				spot light
	
	gl = getContext();
	
	
	
	
	// ADD ALL THE OBJECTS: 
	
	g_camera = new Camera(gl, [2, 0, 0], [0, 0, 0]);
	g_controls = new CameraControls(gl, g_camera);
	
	let defaultSphereMat = { ambient : new Vector3([1.0, 1.0, 1.0]),
										   	 	 diffuse : new Vector3([1.0, 1.0, 1.0]),
										   		 specular : new Vector3([1.0, 1.0, 1.0]),
										       shininess : 128.0 };

	let defaultSphereOptions = { program : gl.program,
												 	   	 radius : 1,
												 	   	 sectorCount : 200,
												 	   	 stackCount : 100,
												 	   	 material : defaultSphereMat };
	
	
	g_shapes.push( new Sphere( new Vector3([1.0, 0, -1.0]),
												 new Vector3([0, 0, 0]),
												 new Vector3([0.5, 0.5, 0.5]),
												 defaultSphereOptions ));
												 

	let defaultCubeOptions = { color : new Vector4([1.0, 1.0, 1.0, 1.0]),
												 	   program : gl.program,
												 	   material : defaultSphereMat };

	g_shapes.push( new Cube( new Vector3([-1.0, 0, 0]),
													 new Vector3([0, 0, 0]),
													 new Vector3([0.5, 0.5, 0.5]),
													 defaultCubeOptions ));


	let fishBody = makeBody(new Vector3([0, 0, 0]),
													new Vector3([0, 0, 0]), 
													new Vector3([2.0, 2.0, 2.0]),
													gl.program);
	let swim = makeSwim(fishBody);
	let fish = new Animal(fishBody, "controls", gl.program, swim);
	g_shapes.push( fish );



	// ADD ALL THE LIGHTS : 
	let defaultLightOptions = { position : new Vector3([1, 3, 0]),
															diff_color : new Vector3([1.0, 1.0, 1.0]),
															spec_color : new Vector3([1.0, 1.0, 1.0]),
															c_ambient : 0.1,
															c_diffuse : 0.4,
															c_specular : 0.5 }
	g_lights.push( new PointLight(defaultLightOptions) );
	
	let lc1 = new Vector3([0.0, 0.0, 1.0]);
	let defaultSpotLightOptions = { position : new Vector3([1, 3, 0]),
															diff_color : new Vector3([0.92, 0.91, 0.55]),
															spec_color : new Vector3([1.0, 1.0, 1.0]),
															c_ambient : 0.1,
															c_diffuse : 0.4,
															c_specular : 0.5,
															limit : 10,
															direction : new Vector3([0, 0, 0]).sub(new Vector3([1, 3, 0])) }
	g_lights.push( new SpotLight(defaultSpotLightOptions) );

	
	gl.useProgram(gl.programs.object);
	gl.program = gl.programs.object;
  let bg_color = new Vector4(hexToRgb("1bb6c4")).div(255);
  bg_color.elements[3] = 1.0;
  gl.clearColor(...bg_color.elements);
  
  

	// TODO: Connect everything to the DOM	
	document.getElementById("mode").addEventListener("change", (e) => {
		let m = e.target.value;
		if (m === "lit") {
			g_mode = 0;
		}
		if (m === "normal") {
			g_mode = 1;
		}
		if (m === "unlit") {
			g_mode = 2;
		}
	
	});
	
	g_lights.forEach( (light) => {
		light.connectToDOM("controls");
	})
	
	fish.connectToDOM("controls");




  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
  requestAnimationFrame( tick );
  
}

function tick(time) {
		
// 	g_managers.forEach((element) => {	
// 		element.modifyAnimal(); });

	if (!g_last_time) { g_last_time = performance.now() / 1000; }
	g_curr_time = performance.now() / 1000;
	g_seconds = g_curr_time - g_last_time;

	g_controls.update();
	g_camera.calculateViewProjection();

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


	gl.useProgram(gl.programs.object);
	gl.program = gl.programs.object;
	const u_Mode = gl.getUniformLocation(gl.program, "u_Mode");
	gl.uniform1i(u_Mode, g_mode);


	// geometry pass: write shape data to buffer


	// for each light that's enabled,
	// render.
	
	
	// draw the lights.

	g_lights.forEach( (light) => {
		light.update();
		light.addToProgram(gl, gl.program);
	});

	g_shapes.forEach( (shape) => {
// 		shape.update( new Matrix4().rotate((g_curr_time % (2 * Math.PI)) * 100 , 1, 0, 0) );
		shape.update( new Matrix4() );
		shape.render( gl, g_camera, g_lights );
	});	
	
	gl.useProgram(gl.programs.light);
	gl.program = gl.programs.light;
	
	g_lights.forEach( (light) => {
		light.render( gl, g_camera );
	});
	
		
	requestAnimationFrame(tick);
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


function sinAnim(amp, period, phase, offset) {
	let b = 2*Math.PI / period
	return amp * Math.sin(b * g_seconds + phase) + offset
}


function makeBody(position, rotation, scale, program) {
	let animal = new Body();
		
	
	// dummies
	let tmp_mat;
	let tmp_part;
	let tmp_joint;
	let tmp_joint2;
	
	
	let defaultMat = { ambient : new Vector3([1.0, 1.0, 1.0]),
										 diffuse : new Vector3([1.0, 1.0, 1.0]),
										 specular : new Vector3([1.0, 1.0, 1.0]),
										 shininess : 128.0 };

	
	
	// new Vector4(hexToRgb("*")).div(256)
	
	let c_fin_white1 = new Vector3(hexToRgb("ff830e")).div(255);
	
	let c_head_orange1 = new Vector3(hexToRgb("fea20d")).div(255);

	let c_head_orange2 = new Vector3(hexToRgb("ff830e")).div(255);

	let c_head_white1 = new Vector3(hexToRgb("ebd585")).div(255);

	let c_body_white1 = new Vector3(hexToRgb("ffcd62")).div(255);

	let c_body_white2 = new Vector3(hexToRgb("e2dbb7")).div(255);

	let c_body_white3 = new Vector3(hexToRgb("f5edcb")).div(255);
	
	let c_body_white4 = new Vector3(hexToRgb("c4c79b")).div(255);

	let c_pupil_black1 = new Vector3(hexToRgb("050803")).div(255);

	let c_eye_white1 = new Vector3(hexToRgb("9cc048")).div(255);

	let black = new Vector3([0.0, 0.0, 0.0]);
	let spec1 = new Vector3([0.5, 0.5, 0.5]);
	let sp = 0.3;
	let shiny = 0.05 * 128.0;

	let fin_white1 = { ambient : c_fin_white1,
										 diffuse : c_fin_white1,
										 specular : new Vector3().set(c_fin_white1).mul(sp),
										 shininess : shiny };
	
	let head_orange1 = { ambient : c_head_orange1,
											 diffuse : c_head_orange1,
											 specular :  new Vector3().set(c_head_orange1).mul(sp),
											 shininess : shiny };

	let head_orange2 = { ambient : c_head_orange2,
											 diffuse : c_head_orange2,
											 specular :  new Vector3().set(c_head_orange2).mul(sp),
											 shininess : shiny };

	let head_white1 = { ambient : c_head_white1,
											diffuse : c_head_white1,
											specular :  new Vector3().set(c_head_white1).mul(sp),
											shininess : shiny };

	let body_white1 = { ambient : c_body_white1,
											diffuse : c_body_white1,
											specular :  new Vector3().set(c_body_white1).mul(sp),
											shininess : shiny };

	let body_white2 = { ambient : c_body_white2,
											diffuse : c_body_white2,
											specular :  new Vector3().set(c_body_white2).mul(sp),
											shininess : shiny };

	let body_white3 = { ambient : c_body_white3,
											diffuse : c_body_white3,
											specular :  new Vector3().set(c_body_white3).mul(sp),
											shininess : shiny };
	
	let body_white4 = { ambient : c_body_white4,
											diffuse : c_body_white4,
											specular :  new Vector3().set(c_body_white4).mul(sp),
											shininess : shiny };

	let pupil_black1 = { ambient : c_pupil_black1,
											 diffuse : c_pupil_black1,
											 specular :  new Vector3().set(c_pupil_black1).mul(sp),
											 shininess : shiny };

	let eye_white1 = { ambient : c_eye_white1,
										 diffuse : c_eye_white1,
										 specular :  new Vector3().set(c_eye_white1).mul(sp),
										 shininess : shiny };

	
	// * set up major locuses:
	// Cervical 7th Vertebra. No clue if a fish has this. but it's important in humans
	let c7 = new Part("c7", Primitive, null);
	
	// thoracic 1st vertebra.
	let t1 = new Part("t1", Primitive, null);
	
	// head
	let head = new Part("head", Primitive, null);
	
	// body
	let body = new Part("body", Primitive, null);
	
	//  Mid Back joint.
	let midBack = new Part("midBack", Primitive, null);
	
	//  Waist
	let waist = new Part("waist", Primitive, null);
	
	// Tail
	let tail = new Part("tail", Primitive, null);
	
	// right pectoral fin
	let rightPectoral = new Part("rightPectoral", Primitive, null);
	
	//  left pectoral fin
	let leftPectoral = new Part("leftPectoral", Primitive, null);
	
	// right pelvic fin
	let rightPelvic = new Part("rightPelvic", Primitive, null);
	
	/// left pelvic fin
	let leftPelvic = new Part("leftPelvic", Primitive, null);
	
	
	// root to c7. just a scale and translate joint.
	let root_to_c7 = new Joint("root_to_c7", 
																 c7,
																 new Matrix4().translate(...position.elements)
																 							.rotate(...rotation.elements)
																 							.scale(...scale.elements));
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
												 new Part( "head", Cube, { 'material' : head_orange1, 'program' : program }),
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
												  new Part( "left_cheek_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "right_cheek_prim", Cube, { 'material' : head_white1, 'program' : program }),
												  new Matrix4()
												  );
							
	tmp_joint2.rotate(-10, 1, 0, 0);
 	tmp_joint2.rotate(-9, 0, 1, 0);
	tmp_joint2.scale(0.2, 0.9, 0.7);

									
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );

	
	// eyes
	tmp_joint = new Joint( "head_to_right_iris",
												 new Part( "right_iris", Cube, { 'material' : pupil_black1, 'program' : program }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(0.4, -0.6125, 0.75);
	tmp_joint.scale(0.17, 0.17, 0.17);
	tmp_joint.rotate(-10, 1, 0, 0);

	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_right_white",
												 new Part( "right_white", Cube, { 'material' : eye_white1, 'program' : program }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(0.4, -0.6125, 0.75);
	tmp_joint.scale(0.13, 0.3, 0.3);
	tmp_joint.rotate(-10, 1, 0, 0);
	
	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_left_iris",
												 new Part( "left_iris", Cube, { 'material' : pupil_black1, 'program' : program }),
												 new Matrix4()
												 );
	
	tmp_joint.translate(-0.4, -0.6125, 0.75);
	tmp_joint.scale(0.17, 0.17, 0.17);
	tmp_joint.rotate(-10, 1, 0, 0);

	head.add_edge( tmp_joint );

	tmp_joint = new Joint( "head_to_left_white",
												 new Part( "left_white", Cube, { 'material' : eye_white1, 'program' : program }),
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
												  new Part( "chin_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "right_jowel_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "left_jowel_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "right_jowel2_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "left_jowel2_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "upper_lip_prim", Cube, { 'material' : head_white1, 'program' : program }),
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
												  new Part( "brow_prim", Cube, { 'material' : head_orange2, 'program' : program }),
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
												  new Part( "jaw_prim", Cube, { 'material' : head_white1, 'program' : program }),
												  new Matrix4()
												  );
	
	tmp_joint.rotate(-25, 1, 0, 0);
	tmp_joint.scale(0.9, 0.5, 1)		
													  
	tmp_joint.head.add_edge(tmp_joint2);
	
	head.add_edge( tmp_joint );


	
	// ------ upper torso ------
	tmp_joint = new Joint( "t1_to_upper_torso",
											 	 new Part( "upper_torso", Cube, { 'material' : body_white3, 'program' : program }),
											 	 new Matrix4() 
										 );
  tmp_joint.rotate(15, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.125);
	tmp_joint.translate(0, -0.4, -0.5);

	t1.add_edge( tmp_joint );

	// ------ ribcage ------
	tmp_joint = new Joint( "t1_to_right_ribcage",
											 	 new Part( "right_ribcage", Cube, { 'material' : body_white2, 'program' : program }),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(10, 1, 0, 0);
  tmp_joint.rotate(10, 0, 0, 1);
	tmp_joint.scale(0.5, 1.2, 1.2);
	tmp_joint.translate(0.2, -0.7, -0.5);

	t1.add_edge( tmp_joint );
	
	tmp_joint = new Joint( "t1_to_left_ribcage",
											 	 new Part( "left_ribcage", Cube, { 'material' : body_white2, 'program' : program } ),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(10, 1, 0, 0);
  tmp_joint.rotate(-10, 0, 0, 1);
	tmp_joint.scale(0.5, 1.2, 1.2);
	tmp_joint.translate(-0.2, -0.7, -0.5);

	t1.add_edge( tmp_joint );
	
	tmp_joint = new Joint( "t1_to_right_lower_ribcage",
											 	 new Part( "right_lower_ribcage", Cube, { 'material' : body_white4, 'program' : program }),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
  tmp_joint.rotate(-25, 0, 0, 1);
	tmp_joint.scale(0.5, 0.5, 1.2);
	tmp_joint.translate(1.4, -1.8, -0.85);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_left_lower_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'material' : body_white4, 'program' : program }),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
  tmp_joint.rotate(25, 0, 0, 1);
	tmp_joint.scale(0.5, 0.5, 1.2);
	tmp_joint.translate(-1.4, -1.8, -0.85);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_bottom_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'material' : body_white4, 'program' : program }),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(-7.5, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.4);
	tmp_joint.translate(0, -2.5, -0.7);

	t1.add_edge( tmp_joint );

	tmp_joint = new Joint( "t1_to_back_ribcage",
											 	 new Part( "left_lower_ribcage", Cube, { 'material' : body_white4, 'program' : program }),
											 	 new Matrix4() 
										   );
  tmp_joint.rotate(105, 1, 0, 0);
	tmp_joint.scale(0.85, 0.5, 1.4);
	tmp_joint.translate(0, -2.5, 0.85);

	t1.add_edge( tmp_joint );


	// lower back
	tmp_joint = new Joint( "midBack_to_oblique",
												 new Part( "oblique", Cube, { 'material' : body_white3, 'program' : program }),
												 new Matrix4()
											 );
									
	tmp_joint.translate(0, -0.4, -0.5625);		 
	tmp_joint.rotate(-24, 1, 0, 0);

	tmp_joint.scale(0.5, 0.5, 1.125);
	midBack.add_edge( tmp_joint );


	tmp_joint = new Joint( "midBack_to_below_ribcage",
												 new Part( "below_ribcage", Cube, { 'material' : body_white3, 'program' : program }),
												 new Matrix4()
												 );
	
	tmp_joint.rotate(-20, 1, 0, 0);
	tmp_joint.scale(0.8, 1.0, 1.0);
	tmp_joint.translate(0, -0.7, -0.7);
	
	midBack.add_edge( tmp_joint );
					 

	// lumbar
	tmp_joint = new Joint ("waist_to_lumbar",
												 new Part( "lumbar", Cube, { 'material' : body_white3, 'program' : program }),
												 new Matrix4()
											 	);
	
	tmp_joint.translate(0, -0.4, -0.45);
	tmp_joint.rotate(-35, 1, 0, 0);
	tmp_joint.scale(0.5, 0.5, 1.125)
	
	waist.add_edge( tmp_joint );


	tmp_joint = new Joint ("waist_to_waist_fat",
												 new Part( "waist_fat", Cube, { 'material' : body_white3, 'program' : program }),
												 new Matrix4()
											 	);
	
	tmp_joint.rotate(-35, 1, 0, 0);
	tmp_joint.scale(0.7, 0.7, 1);
	tmp_joint.translate(0, -0.6, -0.6);
	
	waist.add_edge( tmp_joint );



	tmp_joint = new Joint ("tail_to_tail_bump",
												 new Part( "tail_bump", Cube, { 'material' : body_white3, 'program' : program }),
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
																 new Part( "seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(45, 1, 0, 0);
	curr_seg.rotate(10, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	rightPectoral.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.25);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.5);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.15);
	
	prev_seg.head.add_edge(curr_seg);

	
	
	// left pectoral
	
	curr_seg = new FollowerJoint( "leftPectoral_to_seg",
																 new Part( "seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(45, 1, 0, 0);
	curr_seg.rotate(-10, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	leftPectoral.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.25);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.5);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.15);
	
	prev_seg.head.add_edge(curr_seg);

	
	
	
	// right pelvic
	
	curr_seg = new FollowerJoint( "rightPelvic_to_seg",
																 new Part( "seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(15, 1, 0, 0);
	curr_seg.rotate(30, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	rightPelvic.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.1);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0.1);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.05);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);

	// left pelvic
	
	curr_seg = new FollowerJoint( "leftPelvic_to_seg",
																 new Part( "seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(15, 1, 0, 0);
	curr_seg.rotate(-30, 0, 1, 0);
	curr_seg.translate(0, -0.1, 0);
	curr_seg.scale(0.1, 0.1, 0.3);
	
	leftPelvic.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.1);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0.1);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.05);
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(-0.5, -1, -0.1);
	
	prev_seg.head.add_edge(curr_seg);
	
	
	
	// tail
	
	curr_seg = new FollowerJoint( "tail_to_seg",
																 new Part( "seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.rotate(135, 1, 0, 0);
	curr_seg.translate(0, -0.1, 0.2);
	curr_seg.scale(0.1, 0.1, 0.8);
	
	tail.add_edge( curr_seg );

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, -0.1);
	curr_seg.scale(1, 1, 1.5)

	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, -0.2);
	curr_seg.scale(1, 1, 1.5)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 1.2)
	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;

	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 1.1)

	
	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);

	
	prev_seg.head.add_edge(curr_seg);

	
	
	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
																 new Matrix4(),
																 finDelay );
	curr_seg.translate(0, -1, 0);
	curr_seg.scale(1, 1, 0.9)

	prev_seg.head.add_edge(curr_seg);

	prev_seg = curr_seg;
	
	curr_seg = new FollowerJoint( "curr_seg_to_prev_seg",
																 new Part( "curr_seg", Cube, { 'material' : fin_color, 'program' : program }),
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

function makeSwim(body) {

	let swim = new Animation("swim", body);
	swim.add_rule("waist_to_tail", "y_rotation", "set", sinAnim, 15, 0.75, 0, 0);
  swim.add_rule("c7_to_head", "y_rotation", "set", sinAnim, 10, 0.75, 1*Math.PI, 0);
	swim.add_rule("c7_to_t1", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);
	swim.add_rule("t1_to_midBack", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);
	swim.add_rule("midBack_to_waist", "y_rotation", "set", sinAnim, 5, 0.75, 0, 0);

	swim.add_rule("body_to_rightPectoral", "z_rotation", "set", sinAnim, 25, 0.4, 0, 0);
	swim.add_rule("body_to_leftPectoral", "z_rotation", "set", sinAnim, 25, 0.4, 0, 0);


	return swim;
}


