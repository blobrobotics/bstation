Main = function() {

  if ( ! (this instanceof Main) )
    throw("Main is a class, not a function. Instantiate it using 'new'.")

  this.server_ready = true
  this.gui=new Gui()
  
}

/**
 * @short Show The dialog. Has several options:
 * 
 * title - The title of the dialog, by default, stays as it is
 * onclose - Which function to call on close
 * content - html to set at content
 */
Main.prototype.showDialog = function(opts){
  $('#overwindow').fadeIn('fast')
	
  this.closeDialog=this.closeDialogDefault
  $('#dialog #custom_buttons').html('')
  if (opts){
    if (opts.onclose || opts.onClose)
      this.closeDialog=opts.onclose || opts.onClose
    if (opts.title)
      $('#dialog #title').text(opts.title)
    if (opts.content)
      $('#dialog #content').html(opts.content)
  }
  $('#dialog #buttons').show()
}

Main.prototype.hideDialog = function(){
  $('#overwindow').fadeOut('fast')
}

/**
 * @short Close current dialog applying the changes
 */
Main.prototype.closeDialogDefault = function(){
  this.hideDialog()
}

Main.prototype.dialogNextOrClose = function(e){
	if (e.which==13){
		var next=$('#dialog ul #'+(Number(this.id)+1))
		if (next.length==0)
			main.closeDialog()
		next.focus()
		//e.disableEvent()
	}
}

Main.prototype.showMessage = function(msg, timeout){
	var d=$('<div id="messagebox">')
	d.attr('style','top:'+($('#svgscroll').position().top+1)+'px;')
	d.text(msg).hide()
	$('body').append(d)
	d.slideDown()
	if (timeout){
		setTimeout(hideMessage,timeout)
	}
}

Main.prototype.hideMessage = function(){
	$('#messagebox').slideUp(function(){ $('#messagebox').remove() })
}


Main.prototype.showHelp = function(){
  if($('#help').is(":visible"))
    this.hideHelp()
  else
    $('#help').fadeIn()
}

Main.prototype.hideHelp = function(){
  $('#help').fadeOut()
}

Main.prototype.loadHelp = function(section){
  $('#ihelp').attr('src','static/doc/'+section+'.html')
  this.showHelp();
}

Main.prototype.backHelp = function(){
  window.frames[0].history.back();
};

Main.prototype.setupGui = function(){
  
  var gui = this.gui;

  var that = this;
  $('#svggui').text('');
  $('#svggui').svg({ onLoad:function(svg_) {that.gui.setupGraph(svg_,that.gui);} });
  
};

$(document).ready(function(){

  main=new Main();
  main.setupGui();
  
  var timerId = setInterval(function(){
    if(main.gui.ready) { 
      clearInterval(timerId)
      main.refresh();
      document.body.style.cursor = 'default'
    }
  },500);
  
  // Some sanity to show user if connected to server, or not.
  var loadingDone = function() { 
    if (main.connecting_dialog){                                         
      main.connecting_dialog = false; 
    }
  }
  var loadingError = function() {
    if (!main.connecting_dialog) {
      main.connecting_dialog=true
    }
  }
  
})

/// Some fixes, only for debugging
// From http://stackoverflow.com/questions/690781/debugging-scripts-added-via-jquery-getscript-function
// Replace the normal jQuery getScript function with one that supports
// debugging and which references the script files as external resources
// rather than inline.
jQuery.extend({
   getScript: function(url, callback) {
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.src = url;

      // Handle Script loading
      {
         var done = false;

         // Attach handlers for all browsers
         script.onload = script.onreadystatechange = function(){
            if ( !done && (!this.readyState ||
                  this.readyState == "loaded" || this.readyState == "complete") ) {
               done = true;
               if (callback)
                  callback();

               // Handle memory leak in IE
               script.onload = script.onreadystatechange = null;
            }
         };
      }

      head.appendChild(script);

      // We handle everything using the script element injection
      return undefined;
   },
});

