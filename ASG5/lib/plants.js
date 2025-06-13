import * as THREE from 'three';
import { LSystem } from './lsystem.js';
import { ColorGUIHelper } from './misc-util.js';

export class Plant {

	// options wants:
	// l system
	// number of iterations
	constructor(options) {		
		
		let position = options.position ? options.position : new THREE.Vector3(0, 0, 0);
		this.body = new THREE.Object3D();
		this.body.position.x = position.x;
		this.body.position.y = position.y;
		this.body.position.z = position.z;
		
		// movement attributes
		this.yaw =  THREE.MathUtils.degToRad(22.5);
		this.pitch = THREE.MathUtils.degToRad(22.5);
		this.roll = THREE.MathUtils.degToRad(22.5);
		
		// stem attributes
		this.stemHeight = 1.0;
		this.radialSegments = 10;
		
		// materials
		this.materials = {};
		Object.assign(this.materials, options.materials);
		
		
		this.lsystem = new LSystem().set(options.lsystem);
		this.n_iterations = options.n_iterations
		this.grow(this.n_iterations);
		
		this.build();
		
		return this;
	}
	
	setPos(x, y, z) {
		this.body.position.x = x;
		this.body.position.y = y;
		this.body.position.z = z;
		return this;
	}
	
	
	grow(n) {
		for (let i = 0; i < n; i++) {
			this.lsystem.iterate();
		}
		
		return this;
	}
	
	clone() {
		const options = { lsystem : new LSystem().set(this.lsystem),
											position : this.body.position,
											n_iterations : this.n_iterations,
											materials : this.materials,		
										}
		const newplant = new Plant(options);
		return newplant;
	
	}
	
	build() {
		let res = this.lsystem.result;
		let resLength = res.length;
		
		let cursor = { position : new THREE.Vector3(0, 0, 0),
									 rotation : new THREE.Vector3(0, 0, 0),
									 node : this.body,
									 stem : [],
									 stemBase : this.body,
									 radius : 0.05,
									};
									
		let pushdown = [];


		const leafOptions = { length : 1,
													 size1 : 0.5,
													 size2 : 0.5,
													 resolution : 20,
													 curve : -0.5,
													 material : new THREE.MeshPhongMaterial({ color : 0x98c24c }),
												}


		cursor.stem.push(new THREE.Vector3().copy(this.body.position));		
		
		let tip;
		for (let i = 0; i < resLength; ++i) {
			let ins = res[i];
			switch(ins) {
				case ('F'):
					{
					// continue the current stem.
					// set stem's properties to cursor's properties
					// place a new object3d at the stem's tip's LOCATION, but under the current object3d
					// make cursor point at current tip
					
					tip = new THREE.Object3D();					
					cursor.node.add( tip );
					
					tip.rotation.x = cursor.rotation.x;
					tip.rotation.y = cursor.rotation.y;
					tip.rotation.z = cursor.rotation.z;

					tip.position.y += this.stemHeight;
					

					
					let new_pt = new THREE.Vector3().copy(tip.position)
					tip.localToWorld(new_pt);

					cursor.stemBase.worldToLocal(new_pt);																					
					
					cursor.stem.push( new_pt );
					
					cursor.rotation.set(0, 0, 0);
					cursor.position.set(0, 0, 0);
					
					
					
					
// 					// marker
// 					let geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
// 					let material = this.materials.stemMaterial;
// 					let mesh = new THREE.Mesh( geometry, material );
// 					mesh.position.copy(new_pt);
					// end marker

// 					cursor.stemBase.add(mesh);
					
					
// 					let geometry1 = new THREE.BoxGeometry(0.1+c, 0.1+c, 0.1+c);
// 					let material1 = new THREE.MeshPhongMaterial( { color : 0xff0000} );
// 					let mesh1 = new THREE.Mesh( geometry1, material1 );
// 					// end marker
// 					
// 					tip.add(mesh1);
// 					c += 0.1;


					cursor.rotation.set(0, 0, 0);
					cursor.position.set(0, 0, 0);
					cursor.node = tip;
										
					}
					
					break;
				case('L'):
					{
					
					
					const leaf = new Leaf(leafOptions);
					cursor.node.add(leaf.mesh);
					
					
					}
				
				case('['):
					{
					
					// end current stem:
					
					const stemLength = cursor.stem.length;
					if (stemLength > 1) {
						const curve = new THREE.CatmullRomCurve3( [...cursor.stem] );
						const geometry = new THREE.TubeGeometry(curve, 20 * stemLength, cursor.radius, 8, false );
						const material = this.materials.stemMaterial;
						const mesh = new THREE.Mesh(geometry, material);
			
						cursor.stemBase.add(mesh);
						
						cursor.stemBase = cursor.node;
						cursor.stem = [ new THREE.Vector3().copy(cursor.node.position) ];
					}
					
					
					// start new branch
					
					
					let t = {};
					
					Object.assign(t, cursor);
					t.position = new THREE.Vector3().copy(cursor.position);
					t.rotation = new THREE.Vector3().copy(cursor.rotation);
					t.stem = [ ...cursor.stem ];
					pushdown.push(t);
					}
					
					break;

				case(']'):
					{
					
					const stemLength = cursor.stem.length;
					if (stemLength > 1) {
						const curve = new THREE.CatmullRomCurve3( [...cursor.stem] );
						const geometry = new THREE.TubeGeometry(curve, 20 * stemLength, cursor.radius, 8, false );
						const material = this.materials.stemMaterial;
						const mesh = new THREE.Mesh(geometry, material);
			
						cursor.stemBase.add(mesh);
			
						
					}
					
					// end branch
					let t = pushdown.pop();
					Object.assign(cursor, t);
					cursor.position = new THREE.Vector3().copy(t.position);
					cursor.rotation = new THREE.Vector3().copy(t.rotation);
					cursor.stem = [ ...t.stem ];
					
					}
					
					break;
				case ('+'):
					// turn left
					cursor.rotation.x -= ( this.yaw );
					break;
				case('-'):
					// turn right
					cursor.rotation.x += ( this.yaw );
					break;
				case('\\'):
					// roll left
					cursor.rotation.z -= ( this.roll );
					break;
				case('/'):
					// roll right
					cursor.rotation.z += ( this.roll );
					break;
				case('^'):
					// pitch up
					cursor.rotation.y += ( this.pitch );
					break;
				case("&"):
					// pitch down
					cursor.rotation.y -= ( this.pitch );
					break;
				default:
					break;
			};
			
		}
		console.dir(cursor.stem);
		const stemLength = cursor.stem.length;
		if (stemLength > 1) {			
			const curve = new THREE.CatmullRomCurve3( [...cursor.stem] );
			const geometry = new THREE.TubeGeometry(curve, 20 * stemLength, cursor.radius, 8, false );
			const material = this.materials.stemMaterial;
			const mesh = new THREE.Mesh(geometry, material);

			cursor.stemBase.add(mesh);

			
			cursor.stemBase = cursor.node;
			cursor.stem = [ cursor.stem[stemLength - 1] ];
		}
		
		return this;
	}
	
// 	makeStem(radiusBottom, radiusTop) {
// 		const geometry = new THREE.CylinderGeometry(
// 			radiusTop, radiusBottom, this.stemHeight, this.radialSegments);
// 			
// 		geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, this.stemHeight/2, 0));
// 		const material = this.materials.stemMaterial;
// 		const mesh = new THREE.Mesh( geometry, material );
// 		return mesh;
// 	}
}

export class Flower {
	constructor(options) {
		this.pNum = options.pNum;        // petal number
		this.fD = options.fD;						 // flower diameter
		this.pLen = options.pLen;        // petal length
		this.pSharp = options.pSharp;    // petal sharpness
		this.fHeight = options.fHeight;  // flower height
		this.curve1 = options.curve1;    // curvature 1. For internal curve
		this.curve2 = options.curve2;    // curvature 2. For bends on tip of flowers
		this.b = options.b;              // bump coeff
		this.bNum = options.bNum;        // number of bumps
		this.resolution = options.resolution // amount of rotations.
		
		this.scale = options.scale;
		
		this.vertices = null;
		this.normals = null;

		this.build();
		
		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ));
		this.geometry.setAttribute( 'normal', new THREE.BufferAttribute(this.normals, 3));
		this.geometry.translate( 0, 0, -1);
		this.material = options.material;
		this.material.side = THREE.DoubleSide;
		
		this.mesh = new THREE.Mesh( this.geometry, this.material );
	}

	build() {

		let pNum = this.pNum;        // petal number
		let fD = this.fD;						 // flower diameter
		let pLen = this.pLen;        // petal length
		let pSharp = this.pSharp;    // petal sharpness
		let fHeight = this.fHeight;  // flower height
		let curve1 = this.curve1;    // curvature 1. For internal curve
		let curve2 = this.curve2;    // curvature 2. For bends on tip of flowers
		let b = this.b;              // bump coeff
		let bNum = this.bNum;        // number of bumps

		let rows = this.resolution, cols = this.resolution * 2;
		let c = Math.PI * 2;

		let v0 = [];
		for(let theta = 0; theta < rows; theta += 1) {
			v0.push([]);
			for(let phi = 0; phi < cols; phi += 1) {
				let r = (pLen * Math.pow( Math.abs( Math.sin( pNum/2 * phi * c / cols )), pSharp) + fD) * theta / rows;
				let x = r * Math.cos(phi * c / cols);
				let y = r * Math.sin(phi * c / cols);
				let z = Flower.vShape(fHeight, r / 100, curve1, curve2, 1.5) +
					Flower.bumpiness(b, r/100, bNum, phi * c / cols);
				
				let pos = [x, y, z];
				v0[theta].push(pos);
			
			}
		}
				
		let v = [];
		let n = [];
		
		let tri = new THREE.Triangle();
		let v1 = new THREE.Vector3(),
				v2 = new THREE.Vector3(),
				v3 = new THREE.Vector3(),
				n0 = new THREE.Vector3();
		
		for(let theta = 0; theta < v0.length; theta++) {
			for(let phi = 0; phi < v0[theta].length; phi++) {
				if( theta < v0.length-1 && phi < v0[theta].length-1) {
					v.push(...v0[theta][phi]); // 0
					v.push(...v0[theta+1][phi]); // 1
					v.push(...v0[theta+1][phi+1]); // 2
					v.push(...v0[theta+1][phi+1]); // 2
					v.push(...v0[theta][phi+1]); // 3
					v.push(...v0[theta][phi]); // 0
					
					v1.set(...v0[theta][phi]);
					v2.set(...v0[theta+1][phi]);
					v3.set(...v0[theta+1][phi+1]);
										
				} else if(theta < v0.length-1 && phi == v0[theta].length-1) {
					v.push(...v0[theta][phi]); // 0
					v.push(...v0[theta][0]); // 1
					v.push(...v0[theta+1][0]); // 2
					v.push(...v0[theta+1][0]); // 2
					v.push(...v0[theta+1][phi]); // 3
					v.push(...v0[theta][phi]); // 0

					v1.set(...v0[theta][phi]);
					v2.set(...v0[theta][0]);
					v3.set(...v0[theta+1][0]);

				}
				
				tri.set(v1, v2, v3);
				tri.getNormal(n0);
				for (let i = 0; i < 6; i++) {
					n.push(n0.x, n0.y, n0.z);
				}

			}
		}
		
		this.vertices = new Float32Array(v);
		this.normals = new Float32Array(n);
	}
	
	rebuild() {
		this.build();
		this.geometry.setAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ));
		this.geometry.setAttribute( 'normal', new THREE.BufferAttribute(this.normals, 3));	
		this.geometry.translate(0, 0, -1);
		this.mesh.scale.x = this.scale;
		this.mesh.scale.y = this.scale;
		this.mesh.scale.z = this.scale;
	}
	
	connectToGUI(gui) {
		const folder = gui.addFolder('Flower');
		folder.add(this, 'pNum', 1, 20, 1);
		folder.add(this, 'fD', 20, 250, 10);
		folder.add(this, 'pLen', 1, 300, 10);
		folder.add(this, 'pSharp', 0.0, 10.0, 0.1);
		folder.add(this, 'fHeight', 0, 600, 10);
		folder.add(this, 'curve1', 0.0, 4.0, 0.1);
		folder.add(this, 'curve2', 0.0, 1.0, 0.05);
		folder.add(this, 'b', 0.0, 5.0, 0.5);
		folder.add(this, 'bNum', 0, 20, 1);
		folder.add(this, 'resolution', 5, 360, 1);
		
		folder.add(this, 'scale', 0.001, 0.5);
		
		folder.onFinishChange( event => { event.object.rebuild() } )
	}
	
	static vShape(A, r, a, b, c) {
		return A * Math.pow(Math.E, -b * Math.pow(Math.abs(r), c))
						 * Math.pow(Math.abs(r), a);
	}
	
	static bumpiness(A, r, f, angle) {
		return 1 + A * Math.pow(r, 2) * Math.sin(f * angle);
	}
	
}

export class Leaf {
	constructor(options) {
		this.length = options.length;
		this.size1 = options.size1;
		this.size2 = options.size2;
		this.curve = options.curve;
		this.resolution = options.resolution;
	
		this.vertices = null;
		this.normals = null;
		
		this.markers = new THREE.Object3D();
	
		this.build();
		
		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ));
		this.geometry.setAttribute( 'normal', new THREE.BufferAttribute( this.normals, 3));
		this.material = options.material;
		this.material.side = THREE.DoubleSide;
		
		this.mesh = new THREE.Mesh( this.geometry, this.material );
		
		return this;
		
	}
	
	
	build() {
		// somehow get two curves going.
		// i need:
		//     start point (0, 0, 0)
		// 		 end point (start + length)
		// 		 two midpoints
		
		// curve with z offsets 
		
		let length = this.length;
		let size1 = this.size1;
		let size2 = this.size2;
		let curve = this.curve;
		let resolution = this.resolution;
		
		let curl = 0;
		
		
		const L1 = new THREE.Vector3(0, 0, 0),
		  		L2 = new THREE.Vector3(-size1, 0, length / 3),
		  		L3 = new THREE.Vector3(-size1, 0, length * 2 / 3),
		  		L4 = new THREE.Vector3(0, 0, length);
		
		const R1 = new THREE.Vector3(0, 0, 0),
		  		R2 = new THREE.Vector3(size1, 0, length / 3),
		  		R3 = new THREE.Vector3(size1, 0, length * 2 / 3),
		  		R4 = new THREE.Vector3(0, 0, length);
				
		const Y1 = new THREE.Vector3(0, 0, 0),
		  		Y2 = new THREE.Vector3(0, 0, length / 2),
		  		Y3 = new THREE.Vector3(0, curve, length);
		
		const LCurve = new THREE.CubicBezierCurve3(L1, L2, L3, L4);
		const RCurve = new THREE.CubicBezierCurve3(R1, R2, R3, R4);
		const YCurve = new THREE.QuadraticBezierCurve3(Y1, Y2, Y3);
		
		const LPoints = LCurve.getPoints(resolution);
		const RPoints = RCurve.getPoints(resolution);
		const YPoints = YCurve.getPoints(resolution);
		
		console.log(LPoints);
		
		const LMaterial = new THREE.LineBasicMaterial( {color: 0xff0000, linewidth: 1})
		const RMaterial = new THREE.LineBasicMaterial( {color: 0x00ff00, linewidth: 1})
		const YMaterial = new THREE.LineBasicMaterial( {color: 0x0000ff, linewidth: 1})
		
		const LGeometry = new THREE.BufferGeometry().setFromPoints(LPoints);
		const RGeometry = new THREE.BufferGeometry().setFromPoints(RPoints);
		const YGeometry = new THREE.BufferGeometry().setFromPoints(YPoints);
		
		const LLine = new THREE.Line(LGeometry, LMaterial);
		const RLine = new THREE.Line(RGeometry, RMaterial);
		const YLine = new THREE.Line(YGeometry, YMaterial);
		
		this.markers.add(LLine);
		this.markers.add(RLine);
		this.markers.add(YLine);
		
		let V1 = new THREE.Vector3(),
		    V2 = new THREE.Vector3(),
		    V3 = new THREE.Vector3(),
		    V4 = new THREE.Vector3(),
		    V5 = new THREE.Vector3(),
		    V6 = new THREE.Vector3();
		
		let v = [];
		let n = [];
		
		let tri = new THREE.Triangle();
		let n0 = new THREE.Vector3(),
			  n1 = new THREE.Vector3();
		
		for (let i = 0; i < resolution - 1; ++i) {
		
		
			V1.copy(LPoints[i]);
			V2.copy(LPoints[i+1]);
			V1.y += YPoints[i].y + curl;
			V2.y += YPoints[i+1].y + curl;	
			
			V3.copy(YPoints[i]);
			V4.copy(YPoints[i+1]);
			
			V5.copy(RPoints[i]);
			V6.copy(RPoints[i+1])
			V5.y += YPoints[i].y + curl;
			V6.y += YPoints[i+1].y + curl;
			
			v.push(V1.x, V1.y, V1.z);
			v.push(V2.x, V2.y, V2.z);
			v.push(V3.x, V3.y, V3.z);
			v.push(V3.x, V3.y, V3.z);
			v.push(V2.x, V2.y, V2.z);
			v.push(V4.x, V4.y, V4.z);

			v.push(V4.x, V4.y, V4.z);
			v.push(V6.x, V6.y, V6.z);
			v.push(V5.x, V5.y, V5.z);
			v.push(V5.x, V5.y, V5.z);
			v.push(V3.x, V3.y, V3.z);
			v.push(V4.x, V4.y, V4.z);

			
			
			tri.set(V1, V2, V3);
			tri.getNormal(n0);
			for (let i = 0; i < 6; ++i) {
				n.push(n0.x, n0.y, n0.z);
			}

			tri.set(V3, V4, V5);
			tri.getNormal(n1);
			for (let i = 0; i < 6; ++i) {
				n.push(n1.x, n1.y, n1.z);
			}

		}
		
		let V7 = new THREE.Vector3(0, curve + curl, length);
		
		v.push(V2.x, V2.y, V2.z);
		v.push(V7.x, V7.y, V7.z);
		v.push(V4.x, V4.y, V4.z);
		v.push(V4.x, V4.y, V4.z);
		v.push(V7.x, V7.y, V7.z);
		v.push(V6.x, V6.y, V6.z);
		
		tri.set(V2, V7, V4);
		tri.getNormal(n0);
		for (let i = 0; i < 3; ++i) {
			n.push(n0.x, n0.y, n0.z);
		}
		
		tri.set(V4, V7, V6);
		tri.getNormal(n1);
		for (let i = 0; i < 3; ++i) {
			n.push(n1.x, n1.y, n1.z);
		}
		
		this.vertices = new Float32Array(v);
		this.normals = new Float32Array(n);
		
		return this;
	}
}

export class Seed {

	constructor(options) {
		this.length = options.length;
		this.size = options.size;
		this.resolution = options.resolution;
		this.material = options.material;
	
		this.build()
		this.mesh = new THREE.Mesh( this.geometry, this.material );
		
		return this;
	}
	
	build() {
		const length = this.length;
		const size = this.size;
		const resolution = this.resolution;
		
		const V1 = new THREE.Vector2( 0, 0 ),
					V2 = new THREE.Vector2( this.size, this.length / 5 ),
					V3 = new THREE.Vector2( 0, this.length );

		const profile = new THREE.QuadraticBezierCurve( V1, V2, V3 );
		const segments_profile = resolution;
		const v2array = profile.getPoints(segments_profile);
		const segments_lathe = resolution;
		const phi_start = 0;
		const phi_length = Math.PI * 2;
		const geometry = new THREE.LatheGeometry( v2array, 
																							segments_lathe, 
																							phi_start, 
																							phi_length 
																						);
		
		this.geometry = geometry;
		
		return this;
	}

}

export class DualSeed {
	constructor(options) {
		this.length = options.length;
		this.size = options.size;
		this.resolution = options.resolution;
		this.material = options.material;
		this.angle = options.angle;
	
		const seedOptions = { length : this.length,
													size : this.size,
													resolution : this.resolution,
													material : this.material,
												};

		this.s1 = new Seed(seedOptions);
		this.s2 = new Seed(seedOptions);
		
		this.s1.mesh.rotation.z -= this.angle / 2;
		this.s2.mesh.rotation.z += this.angle / 2;
		
		this.mesh = new THREE.Object3D;
		this.mesh.add(this.s1.mesh);
		this.mesh.add(this.s2.mesh);
	}

}




