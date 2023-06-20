const $win=$(window),
      $el=$('.dashes'),
      nx=$el.css('--w'),
      ny=$el.css('--h'),
      n=nx*ny, rot=[];
for (let i=0; i<n; i++) {
  $el.append('<div style="transform: rotate(0deg)"/>')
  rot[i]=[0, 0]
};
const $dash=$el.children();
let target;
$win.on('mousemove touchstart touchmove', function setTarg(e){
  if (!e.touches) target={x: e.clientX, y: e.clientY}
  else setTarg(e.changedTouches[0]);
})
let t0=0;
requestAnimationFrame(function anim(t){
  const dt = Math.min(t-t0, 10);
  t0=t;
  requestAnimationFrame(anim);
  if (!target) return;
  const box=$el[0].getBoundingClientRect(),
        x0=box.left, y0=box.top,
        w0=box.width/nx,
        h0=box.height/ny;
  for (let j=0; j<ny; j++) {
   const y=y0+h0*(j+.5);
   for (let i=0; i<nx; i++) {
     const x=x0+w0*(i+.5),
           dx=target.x - x,
           dy=target.y - y,
           f=Math.atan(15*w0*h0/(dx*dx+dy*dy))/3*8,
           targ=f*90,
           ind = j*nx+i,
           delta = (targ - rot[ind][0])*dt*.01*Math.max(f*f/3, .5);
     
     rot[ind][0] += delta;
     rot[ind][1] += delta;
     if (Math.abs(rot[ind][1])>1) {
       $dash[ind].style.transform=`rotate(${rot[ind][0]}deg)`;
       rot[ind][1] = 0
     }
   }
  }
  //targets.length = 0;
})