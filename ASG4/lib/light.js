import { Vector4, Vector3, Matrix4 } from "./cuon-matrix-cse160.js";
import { hexToRgb, rgbToHex } from "./misc-util.js";

export class Light {
	constructor(options) {
		this.type = options.type;
		
		this.diff_color = new Vector3().set(options.diff_color);
		this.spec_color = new Vector3().set(options.spec_color);
		this.c_ambient = options.c_ambient;
		this.c_diffuse = options.c_diffuse;
		this.c_specular = options.c_specular;
		
		this.position = new Vector3().set(options.position);
		this.ambient = new Vector3().set(this.diff_color)
																.mul(this.c_ambient);
		this.diffuse = new Vector3().set(this.diff_color)
																.mul(this.c_diffuse);
		this.specular = new Vector3().set(this.spec_color)
																 .mul(this.c_specular);

		this.modelMatrix = new Matrix4();
		this.vertexBuffer = null;
		this.setVertices();
	}
	
	setVertices() {
	    this.vertices = new Float32Array([
      //FRONT
      -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
      -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      //LEFT
      -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      //RIGHT
      0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
      0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
      //TOP
      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
      //BACK
      0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
      -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
      //BOTTOM
      -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
    ]);
	}
	
	addToProgram(gl, program) {
		return;
	}
	
	calculateMatrix() {
		this.modelMatrix.setTranslate(...this.position.elements)
										.scale(0.1, 0.1, 0.1);
	
	}
	
	render(gl, camera) {
		const a_Position = gl.getAttribLocation(gl.program, "a_Position");
		const u_Color = gl.getUniformLocation(gl.program, "u_Color");

    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    const u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    const u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

		gl.uniform3f(u_Color, ...this.diff_color.elements);
		
    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      if (!this.vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);


		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);

	}
}

export class PointLight extends Light {
	constructor(options) {
		options.type = "PointLight";
		super(options);
		this.move = false;
		this.dx = 1;
	}
	
	addToProgram(gl, program) {

		let position = gl.getUniformLocation(program, "u_Light0.position");
		let ambient = gl.getUniformLocation(program, "u_Light0.ambient");
		let diffuse = gl.getUniformLocation(program, "u_Light0.diffuse");
		let specular = gl.getUniformLocation(program, "u_Light0.specular");
		
		gl.uniform3f(position, ...this.position.elements);
		gl.uniform3f(ambient, ...this.ambient.elements);
		gl.uniform3f(diffuse, ...this.diffuse.elements);
		gl.uniform3f(specular, ...this.specular.elements);
	
	}
	
	update() {
		if (this.move) {
			let p = this.position.elements[0];
			let speed = 0.1
			if (Math.abs(p) > 6.0) {
				this.dx = -this.dx;
			}
			
			this.position.elements[0] = p + this.dx * speed;
			
		}
		
		this.calculateMatrix();
	
		this.ambient = new Vector3().set(this.diff_color)
																.mul(this.c_ambient);
		this.diffuse = new Vector3().set(this.diff_color)
																.mul(this.c_diffuse);
		this.specular = new Vector3().set(this.spec_color)
																 .mul(this.c_specular);	
	}
	
	connectToDOM(docInterfaceId) {
		const container = document.createElement('div');
		container.name = "light-container";
		container.addEventListener('click', this);
		
		container.appendChild( document.createTextNode("Point Light:") );
		container.appendChild( document.createElement('br') );
		
		let anim_button = document.createElement("input");
		anim_button.type = "button";
		anim_button.value = "animate";
		anim_button.addEventListener("click", (e) => {
			this.move = !this.move;
		});
		container.appendChild( anim_button );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("diffuse color:") );
		container.appendChild( document.createElement('br') );
		
		let diff_color_picker = document.createElement("input");
		diff_color_picker.type = "color";
		let d = this.diff_color.elements;
		diff_color_picker.value =  rgbToHex(d[0]*255, d[1]*255, d[2]*255);
		diff_color_picker.addEventListener("change", (e) => {
			this.diff_color = new Vector3(hexToRgb(e.target.value)).div(255);
		});
		container.appendChild( diff_color_picker );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("specular color:") );
		container.appendChild( document.createElement( 'br' ));

		let spec_color_picker = document.createElement("input");
		spec_color_picker.type = "color";
		let s = this.spec_color.elements;
		spec_color_picker.value =  rgbToHex(s[0]*255, s[1]*255, s[2]*255);
		spec_color_picker.addEventListener("change", (e) => {
			this.spec_color = new Vector3(hexToRgb(e.target.value)).div(255);
		});
		container.appendChild( spec_color_picker );
		container.appendChild( document.createElement('br') );

		
		container.appendChild( document.createTextNode("ambient coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_ambient_picker = document.createElement("input");
		c_ambient_picker.type = "range";
		c_ambient_picker.min = 0.0;
		c_ambient_picker.max = 1.0;
		c_ambient_picker.step = "any";
		c_ambient_picker.value = this.c_ambient;
		c_ambient_picker.addEventListener("change", (e) => {
			this.c_ambient = e.target.value;
		});
		container.appendChild( c_ambient_picker );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("diffuse coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_diffuse_picker = document.createElement("input");
		c_diffuse_picker.type = "range";
		c_diffuse_picker.min = 0.0;
		c_diffuse_picker.max = 1.0;
		c_diffuse_picker.step = "any";
		c_diffuse_picker.value = this.c_diffuse;
		c_diffuse_picker.addEventListener("change", (e) => {
			this.c_diffuse = e.target.value;
		});
		container.appendChild( c_diffuse_picker );
		container.appendChild( document.createElement('br') );

		
		container.appendChild( document.createTextNode("specular coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_specular_picker = document.createElement("input");
		c_specular_picker.type = "range";
		c_specular_picker.min = 0.0;
		c_specular_picker.max = 1.0;
		c_specular_picker.step = "any";
		c_specular_picker.value = this.c_specular;
		c_specular_picker.addEventListener("change", (e) => {
			this.c_specular = e.target.value;
		});
		container.appendChild( c_specular_picker );
		container.appendChild( document.createElement('br') );

		container.appendChild( document.createTextNode("x position:") );
		container.appendChild( document.createElement('br') );
		
		let xpos_box = document.createElement("input");
		xpos_box.type = "number";
		xpos_box.min = "-100";
		xpos_box.max = "100";
		xpos_box.step = "any";
		xpos_box.value = this.position.elements[0];
		xpos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[0] = e.target.value;
			}
		});
		container.appendChild(xpos_box);
		container.appendChild( document.createElement('br') );

		container.appendChild( document.createTextNode("y position:") );
		container.appendChild( document.createElement('br') );
		
		let ypos_box = document.createElement("input");
		ypos_box.type = "number";
		ypos_box.min = "-100";
		ypos_box.max = "100";
		ypos_box.step = "any";
		ypos_box.value = this.position.elements[1];
		ypos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[1] = e.target.value;
			}
		});
		container.appendChild(ypos_box);
		container.appendChild( document.createElement('br'));

		container.appendChild( document.createTextNode("z position:") );
		container.appendChild( document.createElement( 'br' ));
		
		let zpos_box = document.createElement("input");
		zpos_box.type = "number";
		zpos_box.min = "-100";
		zpos_box.max = "100";
		zpos_box.step = "any";
		zpos_box.value = this.position.elements[2];
		zpos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[2] = e.target.value;
			}
		});
		container.appendChild(zpos_box);
		container.appendChild( document.createElement('br'));

		const doc_interface = document.getElementById(docInterfaceId);
		doc_interface.appendChild(container);
		doc_interface.appendChild(document.createElement( 'br' ));

	}
}

export class SpotLight extends Light {
	constructor(options) {
		options.type = "SpotLight";
		super(options);
		
		this.direction = new Vector3().set(options.direction);
		this.limit = Math.cos(options.limit * Math.PI / 180);
	}
	
	addToProgram(gl, program) {
		let position = gl.getUniformLocation(program, "u_Light1.position");
		let ambient = gl.getUniformLocation(program, "u_Light1.ambient");
		let diffuse = gl.getUniformLocation(program, "u_Light1.diffuse");
		let specular = gl.getUniformLocation(program, "u_Light1.specular");
		let direction = gl.getUniformLocation(program, "u_Light1.direction");
		let limit = gl.getUniformLocation(program, "u_Light1.limit");
		
		gl.uniform3f(position, ...this.position.elements);
		gl.uniform3f(ambient, ...this.ambient.elements);
		gl.uniform3f(diffuse, ...this.diffuse.elements);
		gl.uniform3f(specular, ...this.specular.elements);
		gl.uniform3f(direction, ...this.direction.elements);
		gl.uniform1f(limit, this.limit);	
	}

	connectToDOM(docInterfaceId) {
		const container = document.createElement('div');
		container.name = "light-container";
		container.addEventListener('click', this);
		
		container.appendChild( document.createTextNode("Spot Light:") );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("diffuse color:") );
		container.appendChild( document.createElement('br') );
		
		let diff_color_picker = document.createElement("input");
		diff_color_picker.type = "color";
		let d = this.diff_color.elements;
		diff_color_picker.value =  rgbToHex(d[0]*255, d[1]*255, d[2]*255);
		diff_color_picker.addEventListener("change", (e) => {
			this.diff_color = new Vector3(hexToRgb(e.target.value)).div(255);
		});
		container.appendChild( diff_color_picker );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("specular color:") );
		container.appendChild( document.createElement( 'br' ));

		let spec_color_picker = document.createElement("input");
		spec_color_picker.type = "color";
		let s = this.spec_color.elements;
		spec_color_picker.value =  rgbToHex(s[0]*255, s[1]*255, s[2]*255);
		spec_color_picker.addEventListener("change", (e) => {
			this.spec_color = new Vector3(hexToRgb(e.target.value)).div(255);
		});
		container.appendChild( spec_color_picker );
		container.appendChild( document.createElement('br') );

		
		container.appendChild( document.createTextNode("ambient coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_ambient_picker = document.createElement("input");
		c_ambient_picker.type = "range";
		c_ambient_picker.min = 0.0;
		c_ambient_picker.max = 1.0;
		c_ambient_picker.step = "any";
		c_ambient_picker.value = this.c_ambient;
		c_ambient_picker.addEventListener("change", (e) => {
			this.c_ambient = e.target.value;
		});
		container.appendChild( c_ambient_picker );
		container.appendChild( document.createElement('br') );
		
		container.appendChild( document.createTextNode("diffuse coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_diffuse_picker = document.createElement("input");
		c_diffuse_picker.type = "range";
		c_diffuse_picker.min = 0.0;
		c_diffuse_picker.max = 1.0;
		c_diffuse_picker.step = "any";
		c_diffuse_picker.value = this.c_diffuse;
		c_diffuse_picker.addEventListener("change", (e) => {
			this.c_diffuse = e.target.value;
		});
		container.appendChild( c_diffuse_picker );
		container.appendChild( document.createElement('br') );

		
		container.appendChild( document.createTextNode("specular coefficient:") );
		container.appendChild( document.createElement('br') );
		
		let c_specular_picker = document.createElement("input");
		c_specular_picker.type = "range";
		c_specular_picker.min = 0.0;
		c_specular_picker.max = 1.0;
		c_specular_picker.step = "any";
		c_specular_picker.value = this.c_specular;
		c_specular_picker.addEventListener("change", (e) => {
			this.c_specular = e.target.value;
		});
		container.appendChild( c_specular_picker );
		container.appendChild( document.createElement('br') );

		container.appendChild( document.createTextNode("x position:") );
		container.appendChild( document.createElement('br') );
		
		let xpos_box = document.createElement("input");
		xpos_box.type = "number";
		xpos_box.min = "-100";
		xpos_box.max = "100";
		xpos_box.step = "any";
		xpos_box.value = this.position.elements[0];
		xpos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[0] = e.target.value;
			}
		});
		container.appendChild(xpos_box);
		container.appendChild( document.createElement('br') );

		container.appendChild( document.createTextNode("y position:") );
		container.appendChild( document.createElement('br') );
		
		let ypos_box = document.createElement("input");
		ypos_box.type = "number";
		ypos_box.min = "-100";
		ypos_box.max = "100";
		ypos_box.step = "any";
		ypos_box.value = this.position.elements[1];
		ypos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[1] = e.target.value;
			}
		});
		container.appendChild(ypos_box);
		container.appendChild( document.createElement('br'));

		container.appendChild( document.createTextNode("z position:") );
		container.appendChild( document.createElement( 'br' ));
		
		let zpos_box = document.createElement("input");
		zpos_box.type = "number";
		zpos_box.min = "-100";
		zpos_box.max = "100";
		zpos_box.step = "any";
		zpos_box.value = this.position.elements[2];
		zpos_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.position.elements[2] = e.target.value;
			}
		});
		container.appendChild(zpos_box);
		container.appendChild( document.createElement('br'));

		container.appendChild( document.createTextNode("x direction:") );
		container.appendChild( document.createElement('br') );
		
		let xdir_box = document.createElement("input");
		xdir_box.type = "number";
		xdir_box.min = "-1";
		xdir_box.max = "1";
		xdir_box.step = "any";
		xdir_box.value = this.direction.elements[0];
		xdir_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.direction.elements[0] = e.target.value;
			}
		});
		container.appendChild(xdir_box);
		container.appendChild( document.createElement('br') );

		container.appendChild( document.createTextNode("y direction:") );
		container.appendChild( document.createElement('br') );
		
		let ydir_box = document.createElement("input");
		ydir_box.type = "number";
		ydir_box.min = "-1";
		ydir_box.max = "1";
		ydir_box.step = "any";
		ydir_box.value = this.direction.elements[1];
		ydir_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.direction.elements[1] = e.target.value;
			}
		});
		container.appendChild(ydir_box);
		container.appendChild( document.createElement('br'));

		container.appendChild( document.createTextNode("z direction:") );
		container.appendChild( document.createElement( 'br' ));
		
		let zdir_box = document.createElement("input");
		zdir_box.type = "number";
		zdir_box.min = "-1";
		zdir_box.max = "1";
		zdir_box.step = "any";
		zdir_box.value = this.direction.elements[2];
		zdir_box.addEventListener("change", (e) => {
			if (e.target.value || e.target.value === 0) {
				this.direction.elements[2] = e.target.value;
			}
		});
		container.appendChild(zdir_box);
		container.appendChild( document.createElement('br'));
		
		container.appendChild( document.createTextNode("limit:") );
		container.appendChild( document.createElement('br'));
		let limit_slider = document.createElement("input");
		limit_slider.type = "range";
		limit_slider.min = 0;
		limit_slider.max = 180;
		limit_slider.step = "any";
		limit_slider.value = this.limit;
		limit_slider.addEventListener("change", (e) => {
			this.limit = Math.cos(e.target.value * Math.PI / 180);
		});
		container.appendChild( limit_slider );
		container.appendChild( document.createElement('br') );


		const doc_interface = document.getElementById(docInterfaceId);
		doc_interface.appendChild(container);
		doc_interface.appendChild(document.createElement( 'br' ));
	}
	
	update() {
	
		this.calculateMatrix();
		
		this.ambient = new Vector3().set(this.diff_color)
																.mul(this.c_ambient);
		this.diffuse = new Vector3().set(this.diff_color)
																.mul(this.c_diffuse);
		this.specular = new Vector3().set(this.spec_color)
																 .mul(this.c_specular);	
	}
}

export class Material {
	// options expects:
	//  vec3 ambient
	// 	vec3 diffuse
	// 	vec3 specular
	// 	float shininess
	constructor(options) {
	
		if (!options) {
			this.ambient = new Vector3([0.0, 0.0, 0.0]);
			this.diffuse = new Vector3([0.0, 0.0, 0.0]);
			this.specular = new Vector3([0.0, 0.0, 0.0]);
			this.shininess = 0.0;
			
			return this;
		}
		this.ambient = options.ambient ? options.ambient : new Vector3([0.0, 0.0, 0.0]);
		this.diffuse = options.diffuse ? options.diffuse : new Vector3([0.0, 0.0, 0.0]);
		this.specular = options.specular ? options.specular : new Vector3([0.0, 0.0, 0.0]);
		this.shininess = options.shininess ? options.shininess : 0.0;
		
		return this;
	}
	
	set(src) {
		this.ambient = src.ambient;
		this.diffuse = src.diffuse;
		this.specular = src.specular;
		this.shininess = src.shininess;
		
		return this;
	}
	
	addToProgram(gl, program) {
		let ambient = gl.getUniformLocation(program, "u_Mat0.ambient");
		let diffuse = gl.getUniformLocation(program, "u_Mat0.diffuse");
		let specular = gl.getUniformLocation(program, "u_Mat0.specular");
		let shininess = gl.getUniformLocation(program, "u_Mat0.shininess");

		gl.uniform3f(ambient, ...this.ambient.elements);
		gl.uniform3f(diffuse, ...this.diffuse.elements);
		gl.uniform3f(specular, ...this.specular.elements);
		gl.uniform1f(shininess, this.shininess);
	}
}