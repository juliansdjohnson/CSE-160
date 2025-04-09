// DrawRectangle.js

canvas = undefined, ctx = undefined;

const vecBtn = document.querySelector('input[id="DrawVec"]');

vecBtn.onclick = () => {
  ctx.handleDrawEvent();
}

const opBtn = document.querySelector('input[id="DrawOp"]');

opBtn.onclick = () => {
  ctx.handleDrawOperationEvent();
}

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // fill canvas black
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // black! 
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

CanvasRenderingContext2D.prototype.drawVector = function(v, color) {
  cWidthMid = this.canvas.width / 2;
  cHeightMid = this.canvas.height / 2;

  this.strokeStyle = color;
  this.beginPath(); // start a new path
  this.moveTo(cWidthMid, cHeightMid);
  this.lineTo(cWidthMid + v.elements[0] * 20, cHeightMid - v.elements[1] * 20);
  this.stroke();
}

CanvasRenderingContext2D.prototype.handleDrawEvent = function() {
  // clear canvas
  this.clearRect(0, 0, canvas.width, canvas.height);
  this.fillStyle = 'rgba(0, 0, 0, 1.0)';
  this.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // read values of the text boxes to create v1
  const v1x = document.querySelector('input[name="v1x"]');
  const v1y = document.querySelector('input[name="v1y"]');
  const v2x = document.querySelector('input[name="v2x"]');
  const v2y = document.querySelector('input[name="v2y"]');

  var v1 = new Vector3();
  v1.elements[0] = v1x.value;
  v1.elements[1] = v1y.value;

  var v2 = new Vector3();
  v2.elements[0] = v2x.value;
  v2.elements[1] = v2y.value;

  // call drawVector(v1, "red")
  this.drawVector(v1, 'red');
  this.drawVector(v2, 'blue');
}

CanvasRenderingContext2D.prototype.handleDrawOperationEvent = function() {
  // clear canvas
  this.clearRect(0, 0, canvas.width, canvas.height);
  this.fillStyle = 'rgba(0, 0, 0, 1.0)';
  this.fillRect(0, 0, this.canvas.width, this.canvas.height);

  const v1x = document.querySelector('input[name="v1x"]');
  const v1y = document.querySelector('input[name="v1y"]');
  const v2x = document.querySelector('input[name="v2x"]');
  const v2y = document.querySelector('input[name="v2y"]');

  var v1 = new Vector3();
  v1.elements[0] = v1x.value;
  v1.elements[1] = v1y.value;

  var v2 = new Vector3();
  v2.elements[0] = v2x.value;
  v2.elements[1] = v2y.value;

  this.drawVector(v1, 'red');
  this.drawVector(v2, 'blue');
  
  const opsel = document.querySelector('select[id="op-select"]');
  var op = opsel.value;

  const scalarsel = document.querySelector('input[id="scalar"]');
  var scalar = scalarsel.value;

  var v3 = new Vector3();
  var v4 = new Vector3();
  v3.set(v1);
  v4.set(v2);

  switch (op) {
    case "add":
      v3.add(v2);
      this.drawVector(v3, 'green');
      break;
    case "sub":
      v3.sub(v2);
      this.drawVector(v3, 'green');
      break;
    case "div":
      v3.div(scalar);
      v4.div(scalar);
      this.drawVector(v3, 'green');
      this.drawVector(v4, 'green');
      break;
    case "mul":
      v3.mul(scalar);
      v4.mul(scalar);
      this.drawVector(v3, 'green');
      this.drawVector(v4, 'green'); 
      break;
    case "mag":
      console.log("v1 magnitude: %f", v3.magnitude());
      console.log("v2 magnitude: %f", v4.magnitude());
      break;
    case "nor":
      v3.normalize();
      v4.normalize();
      this.drawVector(v3, 'green');
      this.drawVector(v4, 'green');
      break;
    case "ang":
      v3.normalize();
      v4.normalize();
      dp = Vector3.dot(v3, v4);
      console.log("Angle: %f", Math.acos(dp) * 180/Math.PI);
      break;
    case "are":
      var v5 = new Vector3();
      v5 = Vector3.cross(v3, v4);
      console.log("Area: %f", v5.magnitude() / 2);
      break;
    default:
      return;
  }
}
