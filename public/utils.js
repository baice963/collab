// map value, default is 100.
function map(pos, total, newtotal = 100) {
	return pos * newtotal/total;
};

// mouse press boolean.
var mousePressed = false;
window.addEventListener('mouseup', () => mousePressed = false);

// converts from degrees to radians.
function rad (degrees) {
	return degrees * Math.PI / 180;
};

// converts from radians to degrees.
function deg (radians) {
	return radians * 180 / Math.PI;
};

//rotate all discs. (degrees).
function rotate(angle) {
	window.dispatchEvent(new CustomEvent('rotated', {bubbles: true, detail: {a: angle}}));
}
