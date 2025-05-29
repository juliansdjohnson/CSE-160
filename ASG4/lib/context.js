import { initShaders, createProgram } from "./cuon-utils.js"

export function getContext() {
  // Retrieve <canvas> element
  const canvas = document.getElementById("webgl");

//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

  // Get the rendering context for WebGL
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
  }
  
  let programs = {};
  
  programs.object = createProgram(gl, VSHADER_OBJ, FSHADER_OBJ);
  programs.light = createProgram(gl, VSHADER_LIGHT, FSHADER_LIGHT);

	gl.programs = programs;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);


//   window.addEventListener("resize", (e) => {
//     gl.canvas.width = window.innerWidth;
//     gl.canvas.height = window.innerHeight;
// 
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//   });

  return gl;
}


const VSHADER_OBJ =
 `
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_NormalMatrix;
	
attribute vec4 a_Position;
varying vec4 v_Position;

attribute vec4 a_Normal;
varying vec4 v_Normal;

// 	attribute vec4 a_Color;
// 	varying vec4 v_Color;

void main() {
	
	
	
	gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
	

//     v_Color = a_Color;
	v_Position =  u_ModelMatrix * a_Position;
	v_Normal =  u_NormalMatrix * vec4(a_Normal.xyz, 0.0);
}`;

// Fragment shader program
const FSHADER_OBJ = 
`
precision mediump float;

struct Light {
	vec3 position;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct SpotLight {
	vec3 position;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	vec3 direction;
	float limit;
};

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};
			
uniform Light u_Light0;
uniform SpotLight u_Light1;
uniform Material u_Mat0;

uniform vec4 u_CameraPosition;

varying vec4 v_Position;
varying vec4 v_Normal;

uniform int u_Mode;

void main() {

	vec3 pos = v_Position.xyz;

	// normal vector
	vec3 n = normalize(v_Normal.xyz);
	
	// unit vector between point and eye
	vec3 e = normalize( u_CameraPosition.xyz - pos.xyz );

	vec3 l, r, diffuse, specular, ambient;
	float diff, spec;

	// LIGHT0
		
	// unit vector between point and light
	l = normalize( u_Light0.position - pos );
	
	// reflected light vector
	r = reflect(-l, n);
	
	diff = max(dot(n, -l), 0.0);
	diffuse = u_Light0.diffuse * (diff * u_Mat0.diffuse);
			
	spec = pow(max(dot(e, r), 0.0), u_Mat0.shininess);
	specular = u_Light0.specular * (spec * u_Mat0.specular);
	
	ambient = u_Light0.ambient * u_Mat0.ambient;
	
	vec3 c_l0 = diffuse + specular + ambient;
	
	
	// LIGHT1
		
	// unit vector between point and light
	l = normalize( u_Light1.position - pos );
	
	// reflected light vector
	r = reflect(-l, n);
	
	diff = max(dot(n, -l), 0.0);
	diffuse = u_Light1.diffuse * (diff * u_Mat0.diffuse);

	spec = pow(max(dot(e, r), 0.0), u_Mat0.shininess);
	specular = u_Light1.specular * (spec * u_Mat0.specular);
	
	ambient = u_Light1.ambient * u_Mat0.ambient;
	
	float d = dot(l, -normalize(u_Light1.direction));
	
	vec3 c_l1 = step(u_Light1.limit, d) * (diffuse + specular) + ambient;
	
	gl_FragColor = float(u_Mode == 0) * vec4(c_l0 + c_l1, 1.0)
							 + float(u_Mode == 1) * vec4(n, 1.0)
							 + float(u_Mode == 2) * vec4(u_Mat0.ambient, 1.0);

}`;

const VSHADER_LIGHT = 
`
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;

attribute vec4 a_Position;

void main() {

	gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;

}
`



const FSHADER_LIGHT = 
`
precision mediump float;
uniform vec3 u_Color;

void main()
{           
    gl_FragColor = vec4(u_Color, 1.0);
}
`


