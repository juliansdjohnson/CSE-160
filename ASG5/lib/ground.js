import * as THREE from 'three';
import { createNoise2D } from "./node_modules/simplex-noise/dist/esm/simplex-noise.js";
import { LSystem } from './lsystem.js';

export class Ground {

	constructor(plants, options) {
	
		this.position = new THREE.Vector3().copy(options.position);
		this.size = new THREE.Vector2().copy(options.size);
		this.subdivisions = options.subdivisions;
		this.plants = Object.assign({}, plants);
		this.deadSpot = options.deadSpot;			

		this.genM = createNoise2D();

		this.container = new THREE.Object3D();
		this.build(this.genM);		

	}
	
	build(genM) {
	
		let size = this.size;
		let subdivisions = this.subdivisions;
		let plants = this.plants;
	
	
		let plantArray = [];
		for (let i = 0; i < subdivisions; ++i) {
			plantArray[i] = new Array(subdivisions).fill(null);
		}
		
		function noiseM(nx, ny) { return genM(nx, ny)/2 + 0.5; }
		
		let locuses = []
		let plant = null;
		let plantsList = Object.keys(plants);

		
		for (let x = 0; x < subdivisions; ++x) {
			for (let y = 0; y < subdivisions; ++y) {
				let nx = (x / subdivisions) - 0.5;
				let ny = (y / subdivisions) - 0.5;
				let m = (3.0 * noiseM( 1 * nx,  1 * ny)
							 + 0.6 * noiseM( 2 * nx,  2 * ny)
							 + 0.4 * noiseM( 4 * nx,  4 * ny)
							 + 0.3 * noiseM( 8 * nx,  8 * ny)
							 + 0.3 * noiseM(16 * nx, 16 * ny)
							 + 0.5 * noiseM(32 * nx, 32 * ny));
				m = m / (3.0 + 0.6 + 0.4 + 0.3 + 0.3 + 0.5);
				if (m) {
    			plant = plants[plantsList[ plantsList.length * Math.random() << 0]];
					let newPlant = plant.clone();
					
					newPlant.setPos( this.position.x + (x * this.size.x / subdivisions) - this.size.x / 2,
													 this.position.y,
													 this.position.z + (y * this.size.y / subdivisions) - this.size.y / 2,
					               );
					plantArray[x][y] = newPlant;
				}
				
				if (m > 0.6) {
					locuses.push( new THREE.Vector3( this.position.x + (x * this.size.x / subdivisions) - this.size.x / 2,
																					 this.position.y,
																					 this.position.z + (y * this.size.y / subdivisions) - this.size.y / 2
																				 ));
				}
			}
		}
		
		let minDistance = 10000, distance = 0, pos = 0;
		let displacement = new THREE.Vector3();
		let t = new THREE.Vector3();
				
		for (let x = 0; x < subdivisions; ++x) {
			for (let y = 0; y < subdivisions; ++y) {
				plant = plantArray[x][y];
				if (!plant) { continue; }
				
				displacement.set(0, 0, 0);
				pos = plant.body.position;

				let closest = null;
				
				for (let locus of locuses) {
					distance = pos.distanceTo(locus);
					t.copy(locus).sub(pos);
					t.normalize();
					t.multiplyScalar(0.5 / distance);
					t.clampLength(0, distance);
					
					displacement.add(t); 
				}
				
				plant.body.position.add(displacement);
				this.container.add(plant.body);
			}
		}
	}
}