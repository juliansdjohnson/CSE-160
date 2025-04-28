
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
	constructor(name=null, head, matrix=null) {
		this.type = 'static';
		
		this.name = name
		this.head = head;
		this.matrix = matrix ? new Matrix4().set(matrix) : new Matrix4();
	}
	
	// traverses the edge to the head
	traverse(matrix) {
		this.head.render(new Matrix4().set(matrix).multiply(this.matrix));
	}
	
	// wrapper for matrix translate
	translate(x, y, z) {		
		this.matrix.translate(x, y, z);
	}
	
	rotate(x, y, z, a) {
		this.matrix.rotate(x, y, z, a);
	}
	
	scale(x, y, z) {
		this.matrix.scale(x, y, z);
	}

}

class DynamicJoint extends Joint {

	// options:
	//		min
	// 		max
	// 		value
	constructor(name=null, head, options, matrix=null) {
		super(name, head, matrix);
		this.type = 'dynamic';

		this.x_rotation = null;
		this.y_rotation = null;
		this.z_rotation = null;
		
		for (let option in options) {
			this[option] = {};
			this[option]['min'] = options[option]['min'];
			this[option]['max'] = options[option]['max'];
			this[option]['value'] = options[option]['value']
			this[option]['DOM'] = options[option]['DOM'];
		}
	}
	
	traverse(matrix) {
		let tmp = new Matrix4().set(matrix);
		if (this.x_rotation) { tmp.rotate(this.x_rotation.value, 1, 0, 0) };
		if (this.y_rotation) { tmp.rotate(this.y_rotation.value, 0, 1, 0) };
		if (this.z_rotation) { tmp.rotate(this.z_rotation.value, 0, 0, 1) };
		this.head.render(new Matrix4().set(matrix).multiply(tmp));
	}
}

class Part {
	// constructor for part. default 0-dim primitive with no children and no name
	// INPUT: string name=NULL
	// 				function Prim
	// 				array children=NULL
	//				array child_edges=NULL
	constructor(name=null, Prim=Primitive, options) {
		this.name = name
		this.child_edges = [];
		
		this.prim = new Prim(options);
		return;
	}
	
	add_edge(joint) {
		this.child_edges.push(joint)
		return;
	}
	
	render(matrix) {
		this.prim.render(matrix);
		this.child_edges.forEach((element) => element.traverse(matrix));	
	}
}

// HELPER FUNCTIONS!

function addJointToPage(joint, page_location, options) {
	
	let new_slider_group = document.createElement('div');
	
	let new_title = document.createTextNode(joint.name + ":");
	new_slider_group.appendChild(new_title);

	let new_slider;
	let new_label;
	
	for (let option of options) {
		if (!joint.option) { continue; }
		new_slider = document.createElement("input");
		new_slider.type = "range";
		new_slider.id = joint.name + option;
		new_slider.min = options[option]['min'];
		new_slider.max = options[option]['max'];
		new_slider.value = options[option]['value'];
				
		let new_label = document.createElement("label");
		new_label.setAttribute("for", joint.name + option);
		new_label.innerHTML = joint.name + " " + option + ": ";
		
		new_slider_group.appendChild(new_slider);
		new_slider_group.appendChild(new_label);
		
		document
			.getElementById(joint.name + option)
			.addEventListener('mousemove', joint.)

	}

		
		
	
	page_location.appendChild(new_slider);
	
	document.getElementById(joint + option).addEventListener('mousemove', function() {
		joint.options.option.value = this.value;
	})



}
