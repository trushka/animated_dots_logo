const $win=$(window),
			$el=$('.dashes'),
			ny=$el.css('--h'),
			nx=$el.css('--w')||ny/$el.height()*$el.width(),
			n=nx*ny, dots=[],

			ctx=$el[0].getContext('2d');

function vec2(x=0, y){
	if (!new.target) return new vec2(x, y);
	if (x.xy) [x, y]=x.xy;
	this.xy = [x, y??x];
};
vec2.prototype = {
	mult: function(val) {
		val=val.xy||[val, val];
		this.xy[0] *= val[0];
		this.xy[1] *= val[1];
		if (val[0]==val[1] && '_l' in this) {
			this._l *= val[0];
			this._l2 = this._l * this._l;
		}
		else this.upd();
		return this
	},
	add: function(a, sub) {
		a=a.xy||[a, a];

		this.xy[0] += sub? -a[0] : a[0];
		this.xy[1] += sub? -a[1] : a[1];

		return this.upd()
	},
	sub: function(a){return this.add(a, true)},
	get l2() {
		return this._l2 ??
		(this._l2 = this.xy[0] * this.xy[0] + this.xy[1] * this.xy[1])
	},
	get l() {
		return this._l ?? (this._l = Math.sqrt(this.l2))
	},
	set l(length) {
		this.setL(length)
	},
	setL: function(length) {
		if (+length) length /= this.l
		return this.mult(length)
	},
	upd: function() {
		delete this._l;
		delete this._l2;
		return this
	}
}
vec2.sum = function(...vecs) {
	return vecs.reduce((sum, vec)=>{
		sum.add(vec);
	}, new vec2())  
}

for (let iy=0; iy<ny; iy++) {
	for (let ix=0; ix<nx; ix++) {
		let x, y;
		x = ix + .5;
		y = iy + .5;
		dots.push({pos0: vec2(x, y), pos: vec2(x, y), v: vec2()})
		//$('<div />').css('transform', `translate(${x}em, ${y}em)`).appendTo($el)
	}
};
const $dot=$el.children();

let touch, box, scale;
$win.on('mousemove touchstart touchmove', function setTarg(e){
	if (!e.touches) {
		const {left, top, width, height} = box;
		touch=vec2(
			(e.clientX - left)/width*nx,
			(e.clientY - top)/height*ny
		)
		//console.log(touch.xy)
	} else setTarg(e.changedTouches[0]);
})	
.resize(e=>{
 	box = $el[0].getBoundingClientRect();
 	$el[0].width = box.width*devicePixelRatio;
 	$el[0].height= box.height*devicePixelRatio;
 	ctx.setTransform(1, 0, 0, 1, 0, 0);
 	const sc = $el[0].height / ny;
 	ctx.scale(sc, sc)
	ctx.strokeStyle='#fffa';
	ctx.lineCap = "round";
	ctx.lineWidth=.7
}).resize();

let t0=0;
requestAnimationFrame(function anim(t){
	const dt = Math.min(t-t0, 10);
	t0=t;
	requestAnimationFrame(anim);
	//if (!touch) return;
	ctx.clearRect(0,0, nx, ny);

	for (let i=0; i<n; i++) {
		let {pos0, pos, v} = dots[i];
		const
			dTouch = vec2(pos).sub(touch||vec2()),

			dPos = vec2(pos0).sub(pos),

			f=touch ? dTouch.setL(5280/(dTouch.l2**4)) : vec2();

		f.add(dPos.mult(.005));//

		v.add(f.mult(dt*.1)).setL(Math.min(v.l, .2)).mult(Math.exp(-dt*.02));

		const [x, y] = pos.add(vec2(v).mult(dt)).xy;
		
	    //ctx.fillStyle = ctx.strokeStyle = color;
			ctx.beginPath()
			ctx.moveTo(x, y);
			ctx.lineTo(x, y);
			//ctx.closePath();
			ctx.stroke();

	}
	//targets.length = 0;
})

/*const gl = $el[0].getContext('webgl');//, {premultipliedAlpha: false});
//twgl.addExtensionsToContext(gl);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const programInfo = twgl.createProgramInfo(gl, [`
		precision mediump float;

		attribute vec2 coord;

		uniform vec2 resolution;
		uniform float size;
		uniform float pRatio;

		void main() {
			gl_Position.xy = coord / resolution;
			gl_Position.y = 1.


*/
