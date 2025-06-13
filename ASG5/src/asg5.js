import { convertCoordinatesEventToGL,
         hexToRgb,
         rgbToHex,
         sendTextToHTML,
         ColorGUIHelper } from "../lib/misc-util.js";
import { LSystem } from '../lib/lsystem.js';
import { Plant, Flower, Leaf, Seed, DualSeed } from '../lib/plants.js';
import { Ground } from "../lib/ground.js";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

////////////////////////////////////////////////////////////////
// INIT
////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 0, 10 );
camera.lookAt( 0, 0, 0 );

const controls = new FlyControls( camera, renderer.domElement );
// controls.target.set(0, 5, 0);
controls.movementSpeed = 10;
controls.rollSpeed = Math.PI / 6;
controls.autoForward = false;
controls.dragToLook = true;

const scene = new THREE.Scene();

const gui = new GUI();


// ground plane
{
	const planeSize = 1000;

// 	const loader = new THREE.TextureLoader();
// 	const texture = loader.load('../lib/resources/checker.png');
// 	texture.wrapS = THREE.RepeatWrapping;
// 	texture.wrapT = THREE.RepeatWrapping;
// 	texture.magFilter = THREE.NearestFilter;
// 	texture.colorSpace = THREE.SRGBColorSpace;
// 	const repeats = planeSize / 2;
// 	texture.repeat.set(repeats, repeats);


	const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	const planeMat = new THREE.MeshPhongMaterial({
		color: 0x779840,
		side: THREE.DoubleSide
	});
	const mesh = new THREE.Mesh(planeGeo, planeMat);
	mesh.rotation.x = Math.PI * -.5;
	scene.add(mesh);
}


// skybox
{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('../lib/Resources/Sky_Day_BlueSky_Equirect.png');
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.encoding = THREE.sRGBEncoding;
	scene.background = texture;

}


let computer = null;

// computer
{
	const loader = new GLTFLoader();
	
	
	loader.load( '../lib/Resources/computer/computer.glb', function ( gltf ) {
		computer = gltf.scene;
		scene.add( gltf.scene );
	
	}, undefined, function ( error ) {
		
		console.error(error);
		
	} ); 
}


let flower = null;

{
	const mats = { stemMaterial : new THREE.MeshPhongMaterial( { color : 0xFF91A4 } )
											
							 };


// 	const L1 = new LSystem ( [..."X"], {'X': [...'F[+/X]F[-X]+X'], 'F': [...'FF']} )
	const axiom = [..."A"]
	const rules = { "A" : [..."[&FL!A]/////[&FL!A]///////[&FL!A]"],
									"F" : [..."S/////F"],
									"S" : [..."FL"],
								}
	
	const L1 = new LSystem ( axiom, rules )
	const defPlantOptions = { lsystem : L1,
														n_iterations: 7,
														materials: mats,
														position : new THREE.Vector3(0, 0, 0),
													};

	const plant = new Plant(defPlantOptions);
	let scl = 0.3
	plant.body.scale.x = scl;
	plant.body.scale.y = scl;
	plant.body.scale.z = scl;

	plant.body.position.z -= 2;
	
	scene.add(plant.body);

// 	let plants = { "plant1" : plant };
// 	let defGroundOptions = { position : new THREE.Vector3(0, 0, 0),
// 													size : new THREE.Vector3(20, 20),
// 													subdivisions : 20,
// 												}

// 	let g = new Ground(plants, defGroundOptions);
// 	scene.add( g.container );

	let defFlowerOptions = { pNum : 6,
													 fD : 100,
													 pLen : 400,
													 pSharp : 0.4,
													 fHeight : 200,
													 curve1 : 0.8,
													 curve2 : 0.8,
													 b : 2.0,
													 bNum : 5,
													 material : mats.stemMaterial,
													 resolution : 30,
													 scale : 1,
												 }

	let f = new Flower(defFlowerOptions);
	f.mesh.scale.x = 0.005;
	f.mesh.scale.y = 0.005;
	f.mesh.scale.z = 0.005;
	
	f.mesh.translateY(3);
	f.mesh.translateZ(5);
	f.mesh.rotateY(Math.PI / 2)
	
	
	flower = f;
	scene.add(f.mesh);
	f.connectToGUI(gui);
	
	
// 	let defLeafOptions = { length : 10,
// 												 size1 : 5,
// 												 size2 : 5,
// 												 resolution : 50,
// 												 curve : 4,
// 												 material : mats.stemMaterial,
// 												}
// 	
// 	let l = new Leaf(defLeafOptions);
// 	scene.add(l.mesh);
// 	scene.add(l.markers);

// 	let defSeedOptions = { length : 10,
// 												 size : 1,
// 												 resolution : 50, 
// 												 material : mats.stemMaterial,
// 												 angle : 15 * Math.PI / 180,
// 											 }
// 											 
// 	let d = new DualSeed(defSeedOptions);
// 	scene.add(d.mesh);


	

}

// lines
// {
// 	const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
// 	const points = [];
// 	points.push( new THREE.Vector3( -10, 0, 0 ) );
// 	points.push( new THREE.Vector3( 0, 10, 0 ) );
// 	points.push( new THREE.Vector3( 10, 0, 0 ) );
// 	const line_geometry = new THREE.BufferGeometry().setFromPoints( points );
// 	const line = new THREE.Line( line_geometry, material );
// 	scene.add( line );
// }



// lights

{
	const color = 0xFFFFFF;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(0, 10, 0);
	light.target.position.set(-5, 0, 0);
	scene.add(light);
	scene.add(light.target);
	
	gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' )
	gui.add( light, 'intensity', 0, 5, 0.01 );
	gui.add( light.target.position, 'x', -10, 10 );
	gui.add( light.target.position, 'z', -10, 10);
	gui.add( light.target.position, 'y', 0, 10);
	
	const light1 = new THREE.AmbientLight(0x040404)
	scene.add(light1);
		
	const hemLight = new THREE.HemisphereLight( 0x0695c9, 0x81b620);
	scene.add(hemLight);
}



////////////////////////////////////////////////////////////////
// ANIMATE
////////////////////////////////////////////////////////////////

function animate() {
  controls.update(0.01);

	flower.mesh.rotateZ(0.001);
  
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
