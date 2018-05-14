class Painting {
	constructor(w, h, x, y, d, a, clockwise, img_src = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=') {

		this.w = w;							// width of painting.									(millimeter).
		this.h = h;							// height of painting.									(millimeter).
		this.x = x;							// x position of disc. x=0 is left border of painting.	(millimeter).
		this.y = y;							// y position of disc. y=0 is top border of painting.	(millimeter).
		this.d = d;							// disc diameter.										(millimeter).
		this.a = a;							// original angle.										(degrees).
		this.sense = clockwise ? 1 : -1;	// clockwise, which way it rotates. 						(boolean).
		this.img = new Image();
		this.img.src = img_src;				// image source. (default is 1x1 transparent gif).		(string).

		this.p;								// div container of painting.
		this.cv;							// canvas.
		this.c;								// canvas context.
		this.disc;							// image of disc.
		this.cdisc;							// div container of disc image.

		this.oa = a;
		this.img.onload = () => {
			this.build();
			this.paint();
		};
	}

	build() {

		// setup div container
		this.p = document.createElement('div');
		this.p.className = 'painting';
		this.p.style.flex = '0 0 ' + this.w * scale + 'vw';
		this.p.style.height = this.h * scale + 'vw';

		// setup canvas
		this.cv = document.createElement('canvas');
		this.cv.width = this.w + '';
		this.cv.height = this.h + '';
		this.c = this.cv.getContext('2d');

		//setup disc container
		this.cdisc = document.createElement('div');
		this.cdisc.className = 'discontainer';
		// transform millimeter to percentage.
		var px = map(this.x, this.w);
		var py = map(this.y, this.h);
		var dx = map(this.d, this.w);
		var dy = map(this.d, this.h);
		this.cdisc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';
		this.cdisc.style.height = dy + '%';
		this.cdisc.style.width = dx + '%';
		this.cdisc.style.left = px + '%';
		this.cdisc.style.top = py + '%';

		// setup image of disc
		this.disc = document.createElement('img');
		this.disc.className = 'disc';
		//resize image to match canvas size
		this.disc.style.height = map(100, dy) + '%';
		this.disc.style.left = 50 - map(px, dx) +'%';
		this.disc.style.top = 50 - map(py, dy) +'%';

		// prevent dragging image.
		this.cdisc.ondragstart = () => false;

		// place elements in html body.
		this.cdisc.appendChild(this.disc);
		this.p.appendChild(this.cv);
		this.p.appendChild(this.cdisc);
		//document.body.appendChild(this.p);
		document.getElementById("painting-container").appendChild(this.p);
	}

	paint() {

		// fill canvas.
		this.c.fillStyle = 'white';
		this.c.fillRect(0, 0, this.cv.width, this.cv.height);



		// draw image.
		this.c.drawImage(this.img, 0, 0, this.cv.width, this.cv.height);

		//bevel edges.
		this.drawBorder(4);
		

		// draw disc from canvas.
		this.disc.src = this.cv.toDataURL("image/png");
		// this.disc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';

		// listen to mouse.
		this.cdisc.onmousemove = e => this.turn(e);
		this.cdisc.onmouseleave = e => mousePressed = false;
		this.cdisc.onmousedown = e => mousePressed = true;

		// listen to rotation.
		window.addEventListener('rotated', e => this.selfturn(e));
	}

	selfturn(e) {

		// cancel if own disc.
		if(e.srcElement == this.disc) return;

		// rotate disc.
		this.a += e.detail.a * this.sense;
		this.oa = this.a;
		this.cdisc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';
	}

	turn(e) {

		// get position of disc based on the viewport.
		var rect = this.cv.getBoundingClientRect();
		var ax = rect.left + document.body.scrollLeft + map(this.x, this.w, rect.width);
		var ay = rect.top + document.body.scrollTop + map(this.y, this.h, rect.height);

		// calculate angle.
		var a = deg(Math.atan2(e.clientY - ay, e.clientX - ax));

		// rotate disc
		if(mousePressed) {
			this.a += a - this.oa;
			this.cdisc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';

			// update other discs
			this.cdisc.dispatchEvent(new CustomEvent('rotated', {bubbles: true, detail: {a: (a - this.oa)*this.sense}}));
		}

		// update previous angle
		this.oa = a;
	}

	hardTurn(angle) {
		// set the css animation style based on change in angle
		// set a timeout for the transform
		// calculate angle change fabs(this.a - angle)
		// map that to a time ()
		// this.cdisc.style.transition = "transform " + timing + "s linear";
		// setTimeout( ()=>{ 
		// 	this.a = angle;
		// 	this.cdisc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';
		// } 100);
		this.a = angle;
		this.cdisc.style.transform = 'translate(-50%, -50%) rotate(' + this.a + 'deg)';

		//to make it animated (request animation frame or css animation (timing on how far it is going))
	}

	drawBorder(lineWidth) {
		this.c.lineWidth = lineWidth;

		this.c.beginPath();
		this.c.moveTo(0, 0);
		this.c.lineTo(0, this.cv.height);
		this.c.moveTo(this.cv.width, 0);
		this.c.lineTo(this.cv.width, this.cv.height);
		this.c.strokeStyle = 'rgba(0,0,0,.2)';
		this.c.stroke();
		this.c.beginPath();
		this.c.moveTo(0, this.cv.height);
		this.c.strokeStyle = 'rgba(0,0,0,.5)';
		this.c.lineTo(this.cv.width, this.cv.height);
		this.c.stroke();
		this.c.beginPath();
		this.c.moveTo(0, 0);
		this.c.lineTo(this.cv.width, 0);
		this.c.strokeStyle = 'rgba(255,255,255,.2)';
		this.c.stroke();
	}
}