Gui = function(id, options){
  if (! (this instanceof Gui)) {
    throw new Error("GUI is a class, not a function. Instantiate it using 'new'.")
  }
	
  this.svg = null
  this.connecting_dialog = false
  this.ready = false
  this.SVGDoc = null
  this.SVGRoot = null
  this.root = null
  
  //Pan and Zoom state variables
  this.zoomScale = 0.4; // Zoom sensitivity
  this.st = 'none';
  this.svgRoot = null;
  this.stTarget;
  this.stOrigin;
  this.stTf;
  this.ready = false;
 
};

Gui.prototype.setupGraph = function(svg_, that) {
  
  svg = svg_;
	
  var shadow='<filter id="dropshadow" height="130%">'+
             '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/> <!-- stdDeviation is how much to blur -->' +
             '<feOffset dx="2" dy="2" result="offsetblur"/> <!-- how much to offset -->' +
             '<feMerge> '+
	         ' <feMergeNode/> <!-- this contains the offset blurred image -->'+
	         ' <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->'+
	         '</feMerge>'+
	         '</filter>'
  var w=$('div#body').width()
  var h=$('div#body').height()
  
  svg.load("static/img/gui.svg")
  
  if(that)
    that.setupViewpoint(that)
  else
    this.setupViewpoint()
}

/**
 * @short Resets viewpoint values
 */
Gui.prototype.setupViewpoint = function(source){
  
  var that
  if(source)
    that=source
  else
    that = this
  
  that.svgRoot = null;
  that.viewpoint=svg.group('viewpoint')
  //var r=svg.circle(viewpoint, 100,100, 30,{fill:'#333',stroke:'none',id:'origin'})
  var o=svg.image(viewpoint, 50,50, 90,90,"static/img/origin.png")
  that.edges=svg.group(that.viewpoint,'edges')	
  that.root = $('#svgGui').svg('get').root();  	
  that.setupHandlers(that);
  that.getRoot(that);
  // mark Gui as ready to work with it
  that.ready = true;
}

/**
 * @short Adds mouse events to be handled by svg Gui

Gui.prototype.setupHandlers = function(source){
  
	var that
	if(source) 
	  that=source
	else
	  that = this
	  
	if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
		window.addEventListener('mousewheel', function(evt){that.handleMouseWheel(evt,that);}, false); // Chrome/Safari
	else
		window.addEventListener('DOMMouseScroll', function(evt){that.handleMouseWheel(evt,that);}, false); // Others
	
	
	
	window.addEventListener('mouseup', function(evt){that.handleMouseUp(evt,that);}, false);
	window.addEventListener('mousedown', function(evt){that.handleMouseDown(evt,that);}, false);
	window.addEventListener('mousemove', function(evt){that.handleMouseMove(evt,that);}, false);
	window.addEventListener('mouseout', function(evt){that.handleMouseUp(evt,that);}, false);
	window.addEventListener('dblclick', function(evt){that.handleDoubleClick(evt,that);}, false);
	
}
*/
Gui.prototype.getRoot = function (source){
  
  	var that
	if(source)
	  that=source
	else
	  that = this
	  
	if(that.svgRoot == null) {
		var r = that.root.getElementById("viewpoint") ? that.root.getElementById("viewpoint") : that.root.documentElement, t = r;

		while(t != that.root) {
			if(t.getAttribute("viewBox")) {
				that.setCTM(r, t.getCTM());

				t.removeAttribute("viewBox");
			}

			t = t.parentNode;
		}

		that.svgRoot = r;
	}
	
	return that.svgRoot;
}

/**
 * @short Instance an SVGPoint object with given event coordinates.
 */
Gui.prototype.getEventPoint = function (evt) {
	var p = this.root.createSVGPoint();

	p.x = evt.clientX;
	p.y = evt.clientY;

	return p;
}

/**
 * @short Sets the current transform matrix of an element.
 */
Gui.prototype.setCTM = function (element, matrix) {
	var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
	element.setAttribute("transform", s);
}

/**
 * @short Handle mouse move event.
 */
Gui.prototype.handleMouseMove = function (evt,source) {
  
  
  var that
  if(source)
    that=source
  else
    that = this
  
  if(evt.target.tagName!='svg')
    return
  if(evt.preventDefault)
	  evt.preventDefault();

  evt.returnValue = false;

  var g
  if(!that.svgRoot)
    g = that.getRoot(that.root);
  else
    g = that.svgRoot
  
  if(that.st == 'pan') {
    // Pan mode
    var p = that.getEventPoint(evt).matrixTransform(that.stTf);
    that.setCTM(g, that.stTf.inverse().translate(p.x - that.stOrigin.x, p.y - that.stOrigin.y));

  }
}

/**
 * @short Handle click event.
 */
Gui.prototype.handleMouseDown = function (evt,source) {

	var that
	if(source)
	  that=source
	else
	  that = this
	  
	if(evt.target.tagName!='svg')
	  return
	  
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	  var g
	  if(!that.svgRoot)
	    g = that.getRoot(that.root);
	  else
	    g = that.svgRoot
	
	// Pan mode
	that.st = 'pan';
	that.stTf = g.getCTM().inverse();
	that.stOrigin = that.getEventPoint(evt).matrixTransform(that.stTf);

}

/**
 * @short Handle mouse button release event.
 */
Gui.prototype.handleMouseUp = function (evt,source) {
      
	var that
	if(source)
	  that=source
	else
	  that = this
	  
	if(evt.target.tagName!='svg')
	  return
	
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	if(that.st == 'pan') {
	  var g
	  if(!that.svgRoot)
	    g = that.getRoot(that.root);
	  else
	    g = that.svgRoot
	  
	  that.stTf = g.getCTM().inverse();
	  // Quit pan/scroll mode
	  that.st = '';
	  
	  this.updateServer(g.getCTM().inverse())
	}
}

/**
 * @short Handle mouse wheel event.
 */
Gui.prototype.handleMouseWheel = function (evt,source) {

	var that
	if(source){
	  that=source
	  
	} else {
	  that = this
	}
	var delta;

	if(evt.wheelDelta)
		delta = evt.wheelDelta / 360; // Chrome/Safari
	else
		delta = evt.detail / -9; // Mozilla
		
		
	// If on top of '#tools' or its children, let list of actions/events scroll
	if(that.toolShowedName != 'none' && (evt.target.tagName == 'DIV' || evt.target.tagName == 'UL' || evt.target.tagName == 'IMG')) {
	  if(delta < 0)
	    that.toolsScrollR()
	  else
	    that.toolsScrollL()
	    
	  return  
	}
	
	if(evt.target.tagName!='svg')
		return
    
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var z = Math.pow(1 + that.zoomScale, delta);
	
	var g
	if(!that.svgRoot)
	  g = that.getRoot(that.root);
	else
	  g = that.svgRoot

	var p = that.getEventPoint(evt);
	p = p.matrixTransform(g.getCTM().inverse());

	// Compute new scale matrix in current mouse position
	var k = that.root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

        that.setCTM(g, g.getCTM().multiply(k));


	that.stTf = g.getCTM().inverse();

	
	this.updateServer(g.getCTM().inverse())
}


/**
 * @short Reset Pan and Zoom when doube clicked.
 */
Gui.prototype.handleDoubleClick = function (evt,source) {
    
  var that
  if(source)
    that=source
  else
    that = this
	  
  if(evt.target.tagName!='svg')
    return
  if(evt.preventDefault)
	  evt.preventDefault();

  evt.returnValue = false;
  
  that.resetViewpoint()
}

/**
 * @short Show all nodes in Gui.
 */
Gui.prototype.viewAll = function () {

  var g

  if(!this.svgRoot)
   g = this.getRoot(this.root);
  else
    g = this.svgRoot
  
  this.setCTM(g, g.getCTM().inverse().multiply(g.getCTM()));
  this.stTf = g.getCTM().inverse();
  
  var max_x, max_y, min_y, min_x
  
  var state = this.behaviour.state
  for (var i in state){
    
    if(!max_x || !max_y || !min_x || !min_y) {
      max_y = state[i].y + state[i].height
      max_x = state[i].x + state[i].width
      min_y = state[i].y
      min_x = state[i].x
      
    } else {
      if( (state[i].y + state[i].height) > max_y)
	max_y = state[i].y + state[i].height
      if((state[i].x + state[i].width)> max_x)
	max_x = state[i].x + state[i].width
      if(state[i].y < min_y)
	min_y = state[i].y
      if(state[i].x < min_x)
	min_x = state[i].x
    }
  }
  var p = this.root.createSVGPoint();
  var Gui_center = this.root.createSVGPoint();
  
  var z = 0;
  
  p.x = Math.round((min_x+max_x)/2);
  p.y = Math.round((min_y+max_y)/2);
   
  var w=$(window).width()
  var h=$(window).height()-$('#header').height()-$('#tools').height()
  
  Gui_center.x = Math.round(w/2)
  Gui_center.y = Math.round(h/2)
    
  xscale = (w-50)/Math.abs(max_x-min_x)
  yscale = (h-30)/Math.abs(max_y-min_y)
  
  if(yscale < xscale)
     z = yscale
   else z = xscale

  this.setCTM(g, this.stTf.inverse().translate(Gui_center.x-p.x, Gui_center.y-p.y));
  this.stTf = g.getCTM().inverse();
  
  // Compute new scale matrix in current mouse position
  var k = this.root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
	
  this.setCTM(g, g.getCTM().multiply(k)); 

  this.stTf = this.stTf.multiply(k.inverse());
  
  this.updateServer(g.getCTM().inverse())
	
}

/**
 * @short Reset Pan and Zoom.
 */
Gui.prototype.resetViewpoint = function() {
  
  var g
  
  if(!this.svgRoot)
   g = this.getRoot(this.root);
  else
    g = this.svgRoot
  
  this.setCTM(g, g.getCTM().inverse().multiply(g.getCTM()));
  this.stTf = g.getCTM().inverse();

  this.updateServer(g.getCTM().inverse())
}

/**
 * @short Sets a given viewpoint (s is a string: matrix(a,b,c,d,e,f)
 */
Gui.prototype.setViewpoint = function(s) {
  
  if(this.svgRoot == null)
    return

  var g = this.svgRoot

  g.setAttribute("transform", s)
  this.stTf = g.getCTM()
  this.setCTM(g, g.getCTM().inverse())

}
