
export function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coord of mouse pointer
  var y = ev.clientY; // y coord of mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// from https://learnersbucket.com/examples/interview/convert-rgb-to-hex-color-in-javascript/
function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function sendTextToHTML(text, htmlID) {
	let html_element = document.getElementById(htmlID);
	if (!html_element) {
		console.log("Failed to get " + htmlID + " from HTML");
		return;
	}
	html_element.innerHTML = text;
}

// Color GUI Helper class
export class ColorGUIHelper {
	constructor( object, property ) {
		this.object = object;
		this.property = property;
	}
	
	get value() {
		return `#${this.object[ this.property ].getHexString()}`;
	}
	
	set value( hexString ) {
		this.object[ this.property ].set( hexString );
	}
}

