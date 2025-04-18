// TODO: Set up event handlers for sliders.

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
 `attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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

function main() {
  
  setupWebGL();

  connectVariablesToGLSL();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // set up a new empty brush object with default values
  g_Brush = new Brush(addActionsForHtmlUI());

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
}



function setupWebGL(){
  // retrieve the <canvas> element
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// adds each element to UI and returns an object with their default values
function addActionsForHtmlUI(){
  let options = {}

  document.getElementById("clr").onclick = clearCanvas;

  // add shape
  let shape = document.getElementById("shape");
  shape.addEventListener('change', function () {
    g_Brush.shape = this.value;
  });

  options.shape = shape.value;

  // add color
  let color = document.getElementById("color");
  color.addEventListener('change', function () {
    let tmp;
    if (!(tmp = hexToRgb(this.value))) {
      console.log('failed to get color');
    } else {
      g_Brush.color.set(new Vector4(tmp));
      g_Brush.color.div(255);
      g_Brush.color.elements[3] = 1.0;
    }
  });
  
  let clr = hexToRgb(color.value)
  if (!clr) {
    console.log('failed to get color');
  } else {
    options.color = new Vector4(clr);
    options.color.div(255);
    options.color.elements[3] = 1.0;
  }

  // add size
  let size = document.getElementById("size");
  size.addEventListener('mouseup', function () {
    g_Brush.size = parseInt(this.value, 10);
  });
  
  options.size = parseInt(size.value, 10);

  // add segments
  let segments = document.getElementById("segments")
  segments.addEventListener('mouseup', function () {
    g_Brush.segments = parseInt(this.value, 10);
  });

  options.segments = parseInt(segments.value, 10);

  return options;
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



let g_shapesList = [];
function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);

  let shp;
  let opt = g_Brush.getOptions()
  opt.position = new Vector3([ x, y, 0.0 ]);

  switch (g_Brush.shape) {
    case "point":
      shp = new Point(opt);
      break;
    case "triangle":
      shp = new Triangle(opt);
      break;
    case "circle":
      shp = new Circle(opt);
      break;
    default:
      console.log("failed to  create new shape.");
      return;
  }

  g_shapesList.push(shp);

  // render all shapes!
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coord of mouse pointer
  var y = ev.clientY; // y coord of mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_shapesList.length;
  for (let i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

}

function clearCanvas() {
  g_shapesList = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
}
