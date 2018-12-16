function main(){
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d')
  var cw = window.innerWidth;
  var ch = window.innerHeight;
  var t0 = (new Date()).getTime();
  var t1 = 0;
  var dt = 0;
  var windowsize = oldwindowsize = cw > ch ? cw : ch;
  var deltasize;

  var bfield = [0, 0, 10]; //units of 1 nT = 1 E-9 T
  var lorentzforce;
  var velocity;
  var acceleration;

  // //deprecated as of v0.6
  // var bfieldstrength = 10; //units of 1 nT = 1 E-9 T
  // var bfielddirection = 'out';
  var key = '';

  var obj = new circle(30, 30, 15, 150, 300);

  window.addEventListener('keydown', usercontrols);
  window.requestAnimationFrame(gameloop);

  function gameloop(){
    t1 = (new Date()).getTime();
    dt = (t1 - t0) / 1000;
    update(dt);
    t0 = t1;
    window.requestAnimationFrame(gameloop);
  }

  function update() {
    ctx.clearRect(0,0,cw,ch);
    resize(canvas, obj);

    /*insert draw loop here -- make it iterate over every entity,
      determine what type of entity, and based on the type go through
      the appropriate steps to draw.
    */
    drawfield(bfield);

    //width and height indicators
    ctx.fillStyle = 'red';
    ctx.fillText("Width: " + cw, 10, 50);
    ctx.fillText("Height: " + ch, 10, 70);
    ctx.fillText("Key: " + obj.vel, 10, 130);

    //bouncing ball
    obj.r = obj.r0 * obj.scale * windowsize;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    if ((obj.x >= cw && obj.vx > 0) || (obj.x <= 0 && obj.vx < 0)) {
        obj.vx *= -1;
    }
    if ((obj.y >= ch && obj.vy > 0) || (obj.y <= 0 && obj.vy < 0)) {
        obj.vy *= -1;
    }


    //kinematic computations
    velocity = [obj.vx, obj.vy, 0];
    lorentzforce = cross3(velocity, bfield).map(function (coord){
      return coord * obj.q;
    });
    acceleration = lorentzforce.map(function (coord){
      return coord / obj.m;
    })
    obj.update(acceleration, dt, obj.scale * windowsize)

  }

  function resize(canvas, obj) {
    var displayWidth = window.innerWidth;
    var displayHeight = window.innerHeight;


    if (cw != displayWidth || ch != displayHeight){
          cw = displayWidth;
          ch = displayHeight;
          windowsize = cw > ch ? cw : ch;
    }

  }

  //draw magnetic field
  function drawfield(field) {
    var r = 15;
    var x, y;
    var xmaxflux = 100; //specifies max flux along x-axis
    var flux, windowsize, spacing;
    var scale = 0.0008

    //determine flux density
    flux = xmaxflux * magnitude3(field) / 100;
    windowsize = cw > ch ? cw : ch;
    spacing = Math.ceil(windowsize / flux);
    r *= scale * windowsize;
    x = y = spacing / 2;

    while (x <= cw + r){
      while (y <= ch + r){
        //draw an 'X'
        if ( field[0] === 0 &&
            field[1] === 0 &&
            field[2] > 0 ){
          ctx.beginPath();
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 3 * scale * windowsize;
          ctx.moveTo(x - r, y - r);
          ctx.lineTo(x + r, y + r);
          ctx.stroke();
          ctx.moveTo(x + r, y - r);
          ctx.lineTo(x - r, y + r);
          ctx.stroke();
        }

        //draw a dot
        else if ( field[0] === 0 &&
                  field[1] === 0 &&
                  field[2] < 0 ){
          ctx.beginPath();
          ctx.fillStyle = 'rgba(0, 128, 0, 0.6)';
          ctx.arc(x, y, r / 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }

        y += spacing;
      }

      y = spacing / 2;
      x += spacing;
    }
    //for debugging/////////////////////////////////////////////////////////////////////////////////////
    ctx.fillStyle = 'red';
    ctx.fillText("spacing: " + spacing, 10, 90);
    ctx.fillText("flux: " + flux, 10, 110);
  }

  function usercontrols(e) {
    switch (e.which) {
            case 81: bfield[2] =  Math.abs(bfield[2]); key = e.which; break;
            case 69: bfield[2] =  -1 * Math.abs(bfield[2]); key = e.which; break;
            default: key = e.which;
        }

  }

}

main();
