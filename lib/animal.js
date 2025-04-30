
// MANAGER gets an ANIMAL from me.
// MANAGER has:
// 		a way to talk to the DOM
// 		a set of canned animations
// MANAGER a list of NAMED JOINTS from ANIMAL. it then:
// 		sets up a DOM interface for:
//  			animation flags
// 				joint parameters
// Then, in real time it:
// 		collects relevant data from the DOM and animations
// 		modifies the animal accordingly


class Manager {
	
	constructor(animal, doc_interface_Id, ...animations) {
		this.animal = animal;
		
		this.doc_interface = document.getElementById(doc_interface_Id);
		
		// set up dictionary of named animations, with flags
		this.animations = {};
		for (let anim of animations) {
			this.animations[anim.name] = { active : false, animation : anim };
		}
		
		this.transform_dict = new TransformDict(animal.named_joints)	
	}

	connectToDOM() {
	
		const anim_container = document.createElement('div');
		anim_container.id = "anim-container";
		anim_container.addEventListener('click', this);


		const button_title = document.createTextNode("animations:");
		anim_container.appendChild(button_title);
		anim_container.appendChild( document.createElement('br') );

				
		for (let anim_name in this.animations) {
			let new_button = document.createElement("button");
			
			new_button.innerHTML = anim_name;
			new_button.id = anim_name;

			new_button.classList.add('anim-button');
			anim_container.appendChild(new_button);
			anim_container.appendChild( document.createElement('br') );
		}
		
		this.doc_interface.appendChild(anim_container);
		this.doc_interface.appendChild( document.createElement('br') );
		
		const slider_container = document.createElement('div');
		slider_container.id = "slider-container";
		slider_container.addEventListener('mousemove', this);
		
		const slider_title = document.createTextNode("joints:");
		slider_container.appendChild(slider_title);
		slider_container.appendChild( document.createElement('br') );

		
		for (let joint_name in this.animal.named_joints) {
			let joint = this.animal.named_joints[joint_name];
			for (let option_name of ['x_rotation', 'y_rotation', 'z_rotation']) {
				if (!joint[option_name]) { continue; }

				let new_slider;
				let new_label;
				new_slider = document.createElement("input");
				new_slider.type = "range";
				new_slider.id = joint_name + " " + option_name;
				new_slider.min = joint[option_name]['min'];
				new_slider.max = joint[option_name]['max'];
				new_slider.value = joint[option_name]['value'];
				new_slider.classList.add('joint-slider');
						
				new_label = document.createElement("label");
				new_label.setAttribute("for", joint_name + " " + option_name);
				new_label.innerHTML = joint_name + " " + option_name + ": ";
				
				slider_container.appendChild(new_slider);
				slider_container.appendChild(new_label);
				slider_container.appendChild( document.createElement('br') );
			}
		}
		
		this.doc_interface.appendChild(slider_container);
		this.doc_interface.appendChild( document.createElement('br') );
	}
	
	handleEvent(ev) {
		switch(ev.type) {
			case 'click':
				if (ev.target.classList.contains('anim-button')) {
					for (let anim_name in this.animations) {
						if (anim_name = ev.target.id) {
							this.animations[anim_name].active = !this.animations[anim_name].active;
						} else {
						this.animations[anim_name].active = false;
						}
					}
				}
				break;
			case 'mousemove':
				if (ev.target.classList.contains('joint-slider')) {
					let [joint_name, option_name] = ev.target.id.split(" ");
						this.transform_dict.append(joint_name,
																			 new Transform( option_name, 
																			 								"set", 
																			 								ev.target.value ));
// 					this.animal.named_joints[joint_name][option_name]['value'] = ev.target.value;
				}
				break;
		}
	}

	modifyAnimal() {
		for (let anim_name in this.animations) {
			let anim = this.animations[anim_name];
			if (anim.active) {
				anim.animation.pushToTransformDict(this.transform_dict);
			}
		}
		this.transform_dict.apply(this.animal);	
		this.transform_dict.flush();
	}
	
	updateDOM() {
		for (let joint_name in this.animal.named_joints) {
			let joint = this.animal.named_joints[joint_name];
			for (let option_name of ['x_rotation', 'y_rotation', 'z_rotation']) {
				if (!joint[option_name]) { continue; }
				let elem = document.getElementById(joint_name + " " + option_name);
				if (!elem) {
					console.log("Failed to get " + joint_name + " " + option_name + " from HTML");
					continue;
				}
				elem.value = joint[option_name].value;
			}
		}
	}
	
}


class Animation {
	// binds transforms to joints through a dictionary of joint names.
	// can operate on a transform dictionary by adding modifications to the transform dictionary

	constructor(name, animal) {
		this.name = name;
		this.joints = {};
	}
	
	add_rule(joint_name, option, operation, funct, ...f_params) {
		this.joints[joint_name] = { 'option' : option, 
															  'operation' : operation, 
															  'function' : funct,
															  'f_params' : f_params
															};												
	}
	
	pushToTransformDict(t_dict) {
		let rule;
		for (let joint_name in this.joints) {
			if (!t_dict[joint_name]) { t_dict[joint_name] = []; }
			rule = this.joints[joint_name];
			t_dict.append(joint_name, new Transform(rule['option'],
																							rule['operation'],
																							rule['function']( ...rule['f_params']) ));
		}
	}
	
	
}


class TransformDict {
	// just a wrapper for a dictionary of lists. append-only.
	
	//functionality:
	
	// add things to the list,
	// flush the list
	
	constructor(joint_list={}) {
		this.dict = {};
	}
	
	append(joint_name, transform) {
		if (!this.dict[joint_name]) { this.dict[joint_name] = []; }
		this.dict[joint_name].push(transform);
	}
	
	flush() {
		for (let joint_name in this.dict) {
			this.dict[joint_name] = [];
		}
	}
	
	apply(animal) {
		for (let joint_name in this.dict) {
			let joint = animal.get_named_joint(joint_name);
			if (!joint) { return; }
			for (let transform of this.dict[joint_name]) {
				transform.apply(joint);
			}
		}
	}	
		
}

class Transform {
	constructor(option, operation, val) {
		this.option = option;
		this.operation = operation;
		this.val = val;
	}
	
	apply(joint) {
		
		// a little annoying, I wish I could just put the operation in the object.
		switch (this.operation) {
			case 'add':
				joint.add(this.option, this.val);
				break;
			case 'mul':
				joint.mul(this.option, this.val);
				break;
			case 'set':
				joint.set_opt(this.option, this.val);
				break;
		}
		return;
	
	}

}


// Animal is defined as a directed graph, with parts as the vertices and joints as the 
// edges. Animal is rendered through a DFS traversal rooted at the center of rotation
// for the animal. Vertices store primitives, and edges store transform matrices. As the 
// graph is traversed, the vertices are transformed by the product of the matrices at
// each edge traversed.
class Animal {


	constructor() {
		this.named_nodes = {};
		this.named_joints = {};
		
		this.root = new Part("root", Primitive, null);
		this.add_named_part(this.root);
	}

	add_named_part(part) {
		this.named_nodes[part.name] = part;
	}
	
	// TODO: add names to joints, null, etc.
	add_named_joint(joint) {
		this.named_joints[joint.name] = joint;
	}
	
	get_named_node(name) {
		let tmp = this.named_nodes[name];
		return tmp ? tmp : null;
	}
	
	get_named_joint(name) {
		let tmp = this.named_joints[name];
		return tmp ? tmp : null;
	}

	render(matrix) {
		this.root.render(matrix);
	}
	
};

// The means by which parts communicate. Directed graph vertex. Contains transform to child
// relative to parent.
class Joint {

	// builds a joint.
	constructor(name=null, head, matrix=null, options={}) {
		this.type = 'static';
		
		this.name = name;
		this.head = head;
		this.matrix = matrix ? new Matrix4().set(matrix) : new Matrix4();
		return this;
	}
	
	set(src) {
		this.type = src.type;
		this.name = src.name;
		this.head = src.head;
		this.matrix = new Matrix4().set(src.matrix);
		return this;
	}
	
	// traverses the edge to the head
	traverse(matrix) {
		this.head.render(new Matrix4().set(matrix).multiply(this.matrix));
	}
	
	// wrapper for matrix translate
	translate(x, y, z) {		
		this.matrix.translate(x, y, z);
		return this;
	}
	
	rotate(x, y, z, a) {
		this.matrix.rotate(x, y, z, a);
		return this;
	}
	
	scale(x, y, z) {
		this.matrix.scale(x, y, z);
		return this;
	}

}

class DynamicJoint extends Joint {

	// options:
	//		min
	// 		max
	// 		value
	constructor(name=null, head, matrix=null, options) {
		super(name, head, matrix, options);
		this.type = 'dynamic';

		this.x_rotation = null;
		this.y_rotation = null;
		this.z_rotation = null;
		
		for (let option in options) {
			this[option] = {};
			this[option]['min'] = options[option]['min'];
			this[option]['max'] = options[option]['max'];
			this[option]['value'] = options[option]['value']
		}
		return this;
	}
	
	traverse(matrix) {
		let tmp = new Matrix4().set(this.matrix);
		if (this.x_rotation) { tmp.rotate(this.x_rotation.value, 1, 0, 0) };
		if (this.y_rotation) { tmp.rotate(this.y_rotation.value, 0, 1, 0) };
		if (this.z_rotation) { tmp.rotate(this.z_rotation.value, 0, 0, 1) };
		this.head.render(new Matrix4().set(matrix).multiply(tmp));
	}
	
	add(option, val) {
		if (!this[option]) { return this; }
	
		this[option].value += val;
		DynamicJoint.guard(this[option])
	
		return this;
	}
	
	mul(option, val) {
		if (!this[option]) { return this; }
		
		this[option].value *= val;
		DynamicJoint.guard(this[option]);
		
		return this;
	}
	
	set_opt(option, val) {
		if (!this[option]) { return this; }	
		this[option].value = val;
		DynamicJoint.guard(this[option]);
		return this;
	}
	
	set(src) {
		this.type = src.type;
		this.name = src.name;
		this.head = src.head;
		this.matrix = new Matrix4().set(src.matrix);

		this.x_rotation = src.x_rotation ? Object.assign({}, src.x_rotation) : null;
		this.y_rotation = src.y_rotation ? Object.assign({}, src.y_rotation) : null;
		this.z_rotation = src.z_rotation ? Object.assign({}, src.z_rotation) : null;
		return this;
	}
		
	// class method, protects overflows
	static guard(option) {
		option.value = Math.min(option.value, option.max);
		option.value = Math.max(option.value, option.min);
	}


}

class FollowerJoint extends Joint {

	// options:
	//		min
	// 		max
	// 		value
	constructor(name=null, head, matrix=null, delay, options={}) {
		super(name, head, matrix, options);
		this.type = 'follower';

		this.queue = new SetLengthQueue(delay, new Matrix4());		
		return this;
	}
	
	traverse(matrix) {
		let m = this.queue.enqueue(new Matrix4().set(matrix));
		if (m) {
			this.head.render(new Matrix4().set(m).multiply(this.matrix))
		} else {
			// should never happen. this just makes sure the whole animal doesn't break.
			this.head.render(new Matrix4().set(matrix).multiply(this.matrix))
		}
	}
}

// queue of a set length. There is no dequeue,
// enqueues return values if it pushes a value out of the queue.
class SetLengthQueue {
	constructor(length, fill_value=null) {
		this.length = length;
		this.queue = [];
		if (fill_value) { this.populate(fill_value); }
	}

	// populates the queue with a value
	populate(value) {
		for (let i = 0; i < this.length; i++) {
			this.queue.push(value);
		}
	}
	
	enqueue(value) {
		this.queue.push(value);
		if (this.queue.length > this.length) {
			return this.queue.shift();
		} else {
			return null;
		}
	}
}

class Part {
	// constructor for part. default 0-dim primitive with no children and no name
	// INPUT: string name=NULL
	// 				function Prim
	// 				array children=NULL
	//				array child_edges=NULL
	constructor(name=null, Prim=Primitive, options={ color : null }) {
		this.name = name;
		this.child_edges = [];
		
		this.prim = new Prim(options);
		return this;
	}
	
	set(src) {
		this.name = src.name;
		this.prim = new Prim(src.options);
		this.child_edges = [];
		for (let e of src.child_edges) {			
			this.child_edges.push( new e.prototype.constructor(e.name, e.head, e.matrix, Object.assign({}, e.options)))
		}
		return this;
	}
	
	add_edge(joint) {
		this.child_edges.push(joint)
		return this;
	}
	
	render(matrix) {
		this.prim.render(matrix);
		this.child_edges.forEach((element) => element.traverse(matrix));	
	}
}
