const $win=$(window),
			$el=$('.dashes'),
			nx=$el.css('--w'),
			ny=$el.css('--h'),
			n=nx*ny, dots=[];

function vec2(x=0, y){
	if (!new.target) return new vec2(x, y);
	if (x.xy) [x, y]=x.xy;
	this.xy = [x, y??x];
};
vec2.prototype = {
	mult: function(val) {
		val=val.xy||[val, val];
		this.xy[0] *= val[0]||val
		this.xy[1] *= val[1]||val
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
		this.mult(length/this.l)
	},
	setL: function(length) {
		return this.mult(length/this.l)
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
		$('<div />').css('transform', `translate(${x}em, ${y}em)`).appendTo($el)
	}
};
const $dot=$el.children();
let touch;
$win.on('mousemove touchstart touchmove', function setTarg(e){
	if (!e.touches) {
		const {left, top, width, height} = $el[0].getBoundingClientRect();
		touch=vec2(
			(e.clientX - left)/width*nx,
			(e.clientY - top)/height*ny
		)
		//console.log(touch.xy)
	} else setTarg(e.changedTouches[0]);
})
let t0=0;
requestAnimationFrame(function anim(t){
	const dt = Math.min(t-t0, 10);
	t0=t;
	requestAnimationFrame(anim);
	if (!touch) return;

	for (let i=0; i<n; i++) {
		let {pos0, pos, v} = dots[i];
		const
			dTouch = vec2(pos).sub(touch),

			dPos = vec2(pos0).sub(pos),

			f=dTouch.setL(5280/(dTouch.l2**4)).add(dPos.mult(.005));//

		v.add(f.mult(dt*.5)).setL(Math.min(v.l, .3)).mult(1/(1+dt*.05));

		const [x, y] = pos.add(vec2(v).mult(dt)).xy;
		
		$dot[i].style.transform=`translate(${x}em, ${y}em)`;

	}
	//targets.length = 0;
})