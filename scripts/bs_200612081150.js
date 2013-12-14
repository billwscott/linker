function __bsg(servicePrefix) {
	alert('triggered')
	if(typeof(YAHOO)!=="undefined" && YAHOO.linker && YAHOO.linker.LinkerObj &&
				YAHOO.util.Dom.getStyle(YAHOO.linker.LinkerObj.panel.element, 'display')==="none") {
		YAHOO.linker.LinkerObj.show();
		return;
	}
	if(typeof(__bsg_invoked) !== "undefined" && __bsg_invoked === true) {
		return;
	}
	__bsg_invoked = true;
	
	// This makes sure that other versions of the library are not loaded
	// and that the version I am loading is the one that will be used.
	// I should save these and when the close happens, just re-assign
	// the original values.
	// Also, should null everything that I am about to define.
/*	if(typeof(YAHOO)!=="undefined" && YAHOO.util && YAHOO.util.Event) YAHOO.util.Event=null;
	if(typeof(YAHOO)!=="undefined" && YAHOO.util && YAHOO.util.Dom) YAHOO.util.Dom=null;
	if(typeof(YAHOO)!=="undefined" && YAHOO.util && YAHOO.util.Animation) YAHOO.util.Animation=null;
*/	
	// If we have frames and not iframes...
	alert("creating linker");
	if(document.getElementsByTagName("frameset").length > 0 && window.frames.length > 0) {
		for(var i=0;i<window.frames.length;i++) {
			var theFrame = window.frames[i];

			var frmHead = theFrame.document.getElementsByTagName("head")[0];
			createCSSNode(theFrame.document, frmHead, "frame_css", 
			"http://fw-int.paris.kelkoo.net/~bscott/linker/css/frames_200612081150.css");
	
			var maxWidth = 200;
			var maxHeight = 200;
			var divX = 0;
			var divY = 0;
			
			var geom = getWindowGeom(theFrame);
			if(geom.width > maxWidth) {
				divX = geom.width/2 - maxWidth/2;
			}
			if(geom.height > maxHeight) {
				divY = geom.height/2 - maxHeight/2;
			}
			var d=theFrame.document.createElement('div');
			d.id='linker_frame_invitation';
			d.style.cssText='filter:alpha(opacity=80);' + 	
					'-moz-opacity:0.8;opacity:0.8;position:absolute;' + 
					'background-color:gray;border:solid 2px #CCC;' + 
					'padding:4px;left:'+divX+'px;top:'+divY+'px;z-index:999;' + 	
					'-moz-border-radius:10px;color:white;' + 
					'font-family:verdana,arial;max-width:'+maxHeight+'px;';
			d.innerHTML='<p style="font-size:1em;">Click to expand frame.</p>' + 
				'<p style="font-size:.5em;">' + 
				'The linker does not work with pages that use "frames". Just click the frame area you would like to create links within. When the frame reloads as a full page, select the linker again.' + 
				'</p>';

			addEvent("mousedown", d, 
				function (frm) {
					return function(e) {
						document.location.href = frm.document.location.href;
					};
				}(theFrame) );
						
			theFrame.document.body.appendChild(d);
		}

		return;
	}

    var hd = document.getElementsByTagName("head")[0];
    var gjs = null;
    
   	gjs = document.getElementById("linker");
	if (!gjs) {
		gjs = createJSNode(hd, "linker", 
				"http://fw-int.paris.kelkoo.net/~bscott/linker/scripts/linker_200612081150.js",
				function() {
					YAHOO.linker.LinkerInit();
				}
			);							
		createCSSNode(document, hd, "container_css", 
		"http://us.js2.yimg.com/us.js.yimg.com/lib/common/widgets/2/container/css/container_2.1.0.css");
		//	createCSSNode(document, hd, "container_css", 
		//"http://us.js2.yimg.com/us.js.yimg.com/lib/common/widgets/2/logger/css/logger_2.1.0.css");
			createCSSNode(document, hd, "linker_css", 
		"http://fw-int.paris.kelkoo.net/~bscott/linker/css/linker_200612081150.css");	
	} else {
/*		debugger;
		if(YAHOO && YAHOO.linker && YAHOO.linker.LinkerObj) {
			YAHOO.linker.LinkerObj.panel.show();
		}
		//YAHOO.linker.LinkerInit();
*/	}
    


};

function addEvent(eventType, element, handler) {
    if (element.addEventListener) {
      element.addEventListener(eventType, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + eventType, handler);
    }
}

function createJSNode(hd, id, src, callback) {
	var js = document.createElement("script");
	js.src = src;
	js.id = id;
	if(callback) {
		js.onload=js.onreadystatechange=(function(){setTimeout(callback,500)});
	}
	hd.appendChild(js);
	return js;
}

function createCSSNode(doc, hd, id, src) {
    var lnk = doc.createElement("link");
    lnk.rel = "stylesheet";
    lnk.type = "text/css";
    lnk.id = id;
    lnk.href = src;
    hd.appendChild(lnk);
    return lnk;
}

function getWindowGeom(win) {
	var dimension = {};
	
	if(window.innerWidth) { // All non-IE browsers
		dimension.width = win.innerWidth;
		dimension.height = win.innerHeight;
	} else if (win.document.documentElement && win.document.documentElement.clientWidth) {
		dimension.width = win.document.documentElement.clientWidth;
		dimension.height = win.document.documentElement.clientHeight;
	} else if (win.document.body.clientWidth) {
		dimension.width = win.document.body.clientWidth;
		dimension.height = win.document.body.clientHeight;
	}
	
	return dimension;
}
