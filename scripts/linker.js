YAHOO.namespace("linker");

// used by grabber
YAHOO.linker.NodeTypeEnum = {
    NODE_ELEMENT                : 1,
    NODE_ATTRIBUTE              : 2,
    NODE_TEXT                   : 3,
    NODE_CDATA_SECTION          : 4,
    NODE_ENTITY_REFERENCE       : 5,
    NODE_ENTITY                 : 6,
    NODE_PROCESSING_INSTRUCTION : 7,
    NODE_COMMENT                : 8,
    NODE_DOCUMENT               : 9,
    NODE_DOCUMENT_TYPE          : 10,
    NODE_DOCUMENT_FRAGMENT      : 11,
    NODE_NOTATION               : 12
};
YAHOO.linker.DIMMED_OPACITY = "0.6";
YAHOO.linker.LinkerObj = null;

YAHOO.linker.LinkerInit = function() {
	if(YAHOO.linker.LinkerObj !== null) return;
	
	var selectionInfo = YAHOO.linker.Util.getCurrSelection();
		
	YAHOO.linker.LinkerObj = new YAHOO.linker.Linker(selectionInfo);
	
	YAHOO.linker.LinkerObj.search(selectionInfo.selection, selectionInfo.escSelection)
};

YAHOO.linker.getYSearchResults = function(response) {
	var oThis = YAHOO.linker.LinkerObj;
	oThis.setYSearchResults(response);
	
	// Make sure it is visible
	//YAHOO.linker.LinkerObj.panel.show();
	YAHOO.util.Dom.setStyle(oThis.panel.element, "display", "block");

	// now get the delicious results
	YAHOO.linker.Util.jsonCall(
		"yahoo-linker-delicious-req", 
		"http://del.icio.us/feeds/json/billwscott/" + oThis.currentQuery + "?count=3",
		"YAHOO.linker.getDSearchResults");
}	

YAHOO.linker.getDSearchResults = function(response) {
		var oThis = YAHOO.linker.LinkerObj;

		oThis.setDSearchResults(response);

		// Make sure it is visible
		//YAHOO.linker.LinkerObj.show(); ???
		YAHOO.util.Dom.setStyle(oThis.panel.element, "display", "block");
	}

// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
// U T I L
// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------

YAHOO.linker.Util = function() {

	return {
		jsonCall: function(id, url, callback) {
    		var hd = document.getElementsByTagName("head")[0];
			var js = YAHOO.util.Dom.get(id);
			// FF does not recognize just changing the src attribute
			// So the simplest approach is to blow away the script element
			// and start over.
			if(js)
			{
				hd.removeChild(js);
			} 
    		js = document.createElement("script");
    		js.setAttribute("id", id);
    		js.setAttribute("charset", "utf-8");
    		js.setAttribute("type", "text/javascript");
			if(callback) {
    			js.setAttribute("src", url+"&callback="+callback+'&noCacheIE=' + (new Date()).getTime());
			} else {
				js.setAttribute("src", url+'&noCacheIE=' + (new Date()).getTime());
			}
    		hd.appendChild(js);
		},
		
		getCurrSelection: function(textarea) {
			var elemSelection;
			if(textarea) {
				elemSelection = this.getSelectionFromTextareas([textarea]);
			} else {
				elemSelection = this.getSelectionFromTextareas(document.getElementsByTagName("textarea"));
			}
			if(elemSelection) {
				elemSelection.escSelection = escape(elemSelection.selection);
				return elemSelection;
				// got selection from text area
			}
			
			
			// Try selection elsewhere
			var sel = window.getSelection ? 
					window.getSelection() : document.getSelection ? 
						document.getSelection() : document.selection.createRange().text;
						
			// TMP for debugging
			if(typeof(sel) == "undefined" || sel.length === 0) {
				sel = "ajax";
			}

			return {elem: null, selection: sel.toString(), escSelection: escape(sel.toString())};
		},
		
		getSelectionFromTextareas: function(textareas) {
			if(!textareas) return;
			
			for(var i=0; i<textareas.length; i++) {
				var textarea = textareas[i];
				if(textarea.selectionStart !== textarea.selectionEnd) {
					return {elem: textarea, selection: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)};
				}
			}
		}
	};
} ();

// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
// L I N K E R    U I
// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
YAHOO.linker.Linker = function(selectionInfo, cfg) {
	this.init(selectionInfo, cfg);
};
YAHOO.linker.Linker.PANEL_ID = "yahoo-linker-panel";

YAHOO.linker.Linker.prototype = {

	init: function(selectionInfo, cfg) {
		var oThis = this;
	
		this.selectionInfo = selectionInfo;

 		this.cfg = new YAHOO.util.Config(this);

		this.cfg.addProperty("panelWidth", { 
				value:190, 
				suppressEvent:true
		} );
		this.cfg.addProperty("offsetFromEdge", { 
				value:25, 
				suppressEvent:true
		} );
 		if(cfg) {
 			this.cfg.applyConfig(cfg);
 		}

		this.panelWidth = this.cfg.getProperty("panelWidth");
		this.offsetFromEdge = this.cfg.getProperty("offsetFromEdge");
						
		this.createPanel();
		this.visible = true;
		
		this.previewLinkArea = YAHOO.util.Dom.get("yahoo-linker-preview-link");
		this.linkAsHTMLToggle = YAHOO.util.Dom.get("yahoo-linker-as-html");
		this.searchButton = YAHOO.util.Dom.get("yahoo-linker-search-button");
		this.selectedTextInput = YAHOO.util.Dom.get("yahoo-linker-selected-text");
		
		YAHOO.util.Event.addListener(this.linkAsHTMLToggle, 'click', function(e) {
			oThis.showPreview();
		});
		YAHOO.util.Event.addListener(this.searchButton, 'click', function(e) {
			oThis.search(oThis.selectedTextInput.value, esc(oThis.selectedTextInput));
		});

		// Set up keyboard binding once
		YAHOO.util.Event.addListener( document, "keydown", this.handleKeyDown );
	    YAHOO.util.Event.addListener( document, "keypress", this.handleKeyPress );
	
		YAHOO.util.Event.addListener(document, 'mousedown', 
			function(e) {
				//
				return true;
			}); 		
		this.endSelectPt = new YAHOO.util.Point(-1,-1);
		this.prevSelectionInfo = {elem:null, selection:""};
		YAHOO.util.Event.addListener(document, 'mouseup', 
			function(e) {				
				var elem = YAHOO.util.Event.getTarget(e);
				if(elem && elem.tagName && elem.tagName.toLowerCase() === "textarea") {
					oThis.endSelectPt.x = e.clientX;
					oThis.endSelectPt.y = e.clientY;
					setTimeout(
						function() {
							oThis.newSelectionInfo = YAHOO.linker.Util.getCurrSelection(elem);
				
							if( oThis.prevSelectionInfo && (oThis.newSelectionInfo.selection !== oThis.prevSelectionInfo.selection ||
								oThis.newSelectionInfo.elem !== oThis.prevSelectionInfo.elem) &&
										oThis.newSelectionInfo.selection !== "") {						
								// got a different selection
  								//oThis.endSelectPt; // --> where they released on new selection						
								oThis.selectionInfo = oThis.newSelectionInfo;
								
								// If the GUI is up AND there are no results yet
								// then show the results of this new selection
								if( oThis.visible ) { //}&& !oThis.haveYResults()) {
									oThis.show(oThis.selectionInfo);
								}
							}
							if(oThis.newSelectionInfo.selection  === "") {
								// no selection
							}		
							oThis.prevSelectionInfo = oThis.newSelectionInfo;
						}, 200);
				}
			});
	},
	
	// PANEL OVERRIDE... This causes us to respect the X position of the panel and only change the
	// y position when the window scrolls or resizes.
	centerPanelY: function() {
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

		var viewPortWidth = YAHOO.util.Dom.getClientWidth();
		var viewPortHeight = YAHOO.util.Dom.getClientHeight();

		var elementWidth = this.element.offsetWidth;
		var elementHeight = this.element.offsetHeight;

		var x = (viewPortWidth / 2) - (elementWidth / 2) + scrollX;
		var y = (viewPortHeight / 2) - (elementHeight / 2) + scrollY;
		
		this.element.style.top = parseInt(y,10) + "px";
		this.syncPosition();

		this.cfg.refireEvent("iframe");
	},
		
	createPanel: function() {
		var panelDiv = document.createElement("div");
		this.panelID = YAHOO.linker.Linker.PANEL_ID;
		panelDiv.id = this.panelID;
		document.body.insertBefore(panelDiv, document.body.firstChild);

		var left = YAHOO.util.Dom.getClientWidth() - this.panelWidth - this.offsetFromEdge;
		this.panel = new YAHOO.widget.Panel (
			this.panelID, {
				width:this.panelWidth,
				fixedcenter: true,
				constraintoviewport: true, 
				close:true, 
				visible: false,
				draggable: true,
				monitorresize: false,
				iframe: true,
				x:left
				}
		);		
		this.panel.center = this.centerPanelY;
		this.panel.setHeader(this.createPanelHeaderUI());
		this.panel.setBody(this.createLinkerUI());
		this.panel.render();
		this.panel.show();	
		this.wireLinkerEvents();
	},
	
	wireLinkerEvents: function() {
	},
	
	createLinkerUI: function() {
		return '<div id="yahoo-linker-content">' + 
			'<div id="yahoo-linker-inputs">' + 
				'<label for="yahoo-linker-selected-text">Find Links For:</label>' + 
				'<input tabindex="1" id="yahoo-linker-selected-text" type="text" name="selectedText" value="' + this.selectionInfo.selection + '" />' + 
				'<button id="yahoo-linker-search-button" tabindex="2">Search</button>' + 
			'</div>' + 
			'<div id="yahoo-linker-ysearch-title">Yahoo! Search Results</div>' + 
			'<div id="yahoo-linker-ysearch"></div>' + 
			'<div id="yahoo-linker-preview">' + 
				'<div id="yahoo-linker-insert-options">' + 
				'<input id="yahoo-linker-as-html" tabindex="3" type="checkbox" checked name="html" value="htmlOn"></input>' + 
				'<span style="font-size:14px;" id="yahoo-linker-as-html-text">Insert link as HTML</span></div>' + 
				'<div id="yahoo-linker-preview-link"></div>' +  
			'</div>' + 
		'</div>';

	},
	
	setDSearchResults: function(results) {
		this.dResults = results;
		if(!this.haveDResults()) return;
		
		var searchResultArea = YAHOO.util.Dom.get("yschweb");
		if(!searchResultArea) return;
		
		var delResultArea = searchResultArea.appendChild(document.createElement('div'));
	
		var preamble = '<div id="yahoo-linker-dsearch-title">Delicious Search Results</div>' + 
		'<ol>';
		var searchResults = "";
		for(var i=0; i<results.length; i++) {
			var url = results[i].u;
			var tags = results[i].t;
			var desc = results[i].d;
			searchResults = searchResults + 
				'<li id="yahoo-linker-list-item-' + (i+4) + '"><div><a class="yschttl" href="' +
				url + 
				'">' +
				desc + 
				'</a></div><div class="yschabstr">' + 
				'Tags: ' + tags.join(", ") + 
				'</div><em class="yschurl">' +
				url +
				'</em></li>';
		}
		var postamble = '</ol>';
		
		delResultArea.innerHTML = preamble + searchResults + postamble;
		
		this.bindKeyboardNavigation("yschweb");
		this.panel.center();
		this.replaceText(this.getLinkFromSelection(this.selectedIndex), 0);
	},
	
	haveYResults: function(results) {
		return (this.yResults!==null && this.yResults.ResultSet!=null &&
			 	this.yResults.ResultSet.Result.length > 0);
	},

	haveDResults: function(results) {
		return (this.dResults!==null && this.dResults.length > 0);
	},
	
	setYSearchResults: function(results) {
		
		this.yResults = results;
		if(!this.haveYResults()) return;
		
		YAHOO.util.Dom.get("yahoo-linker-ysearch").innerHTML = results;
				
		var preamble = 
        '<div id="yschres">' + 
            '<div id="yschcont">' + 
                '<div id="yschpri">' + 
                    '<div id="yschweb">' + 
'<div>' +
                        '<ol start="1">';
		var searchResults = "";
		for(var i=0; i<4; i++) {
			var highlightStyle = (i===0)?'class="on"':'';
			searchResults = searchResults + 
						'<li ' + highlightStyle + ' id="yahoo-linker-list-item-' + i + '"><div><a class="yschttl" href="' +
						results.ResultSet.Result[i].ClickUrl + 
						'">' +
						results.ResultSet.Result[i].Title + 
						'</a></div><div class="yschabstr">' + 
						results.ResultSet.Result[i].Summary + 
						'</div><em class="yschurl">' +
						results.ResultSet.Result[i].DisplayUrl +
						'</em> - <a href="' + 
						results.ResultSet.Result[i].Cache +
						'">Cached</a></li>';
		}
		var postamble = 
                        '</ol>' + 
'</div' +
                    '</div>' + 
                '</div>' + 
            '</div>' + 
        '</div>';

		this.ysrp = YAHOO.util.Dom.get("yahoo-linker-ysearch")
		this.ysrp.innerHTML = preamble + searchResults + postamble;	    
		this.bindKeyboardNavigation("yschweb");
		this.panel.center();
		this.replaceText(this.getLinkFromSelection(this.selectedIndex), 0);
		
	},
	
	replaceText: function(text, delay) {
		var si = this.selectionInfo;
		if(si.elem) {
			var elem = si.elem;
			if(elem.tagName.toLowerCase() === "textarea") {
				var textarea = elem;
				var start = textarea.selectionStart;
				var end = textarea.selectionEnd;

				if(start===end) return;
				
				var firstPart = textarea.value.substring(0, start);
				var lastPart = textarea.value.substring(end, textarea.value.length);
				var selPart = textarea.value.substring(start, end);
				textarea.value = firstPart + text + lastPart;
				if(delay > 0) {
					setTimeout( function() {
							textarea.selectionStart = start;
							textarea.selectionEnd = start + text.length;
					}, delay);
				} else {
					textarea.selectionStart = start;
					textarea.selectionEnd = start + text.length;					
				}
			} else if (elem.tagName.toLowerCase() === "input") {
				// change text in an input box
			}
		}	
	},
		
	getLinkFromSelection: function(index) {
		
		if(this.linkAsHTMLToggle.checked) {
			return '<a href="' + this.getUrl(index) + '">' + this.selectionInfo.selection + '</a>';
		} else {
			return this.getUrl(index);
		}
	},
	
	// stitches together the yahoo & delicious results
	getUrl: function(index) {
		if(index > 3 && this.dResults.length > 0) {
			return this.dResults[index-4].u;
		}
		
		return this.yResults.ResultSet.Result[index].Url;
	},
	
	createPanelHeaderUI: function(panel) {
		return '<span id="yahoo-linker-title">Linker! - The Reference Creator</span>';	
	},
	
	show: function(selectionInfo) {
		if(selectionInfo) {
			this.selectionInfo = selectionInfo;
		} else {
			this.selectionInfo = YAHOO.linker.Util.getCurrSelection();
		}
		this.search(this.selectionInfo.selection, this.selectionInfo.escSelection);
		this.visible = true;
	},
	
	hide: function() {
		var oThis = YAHOO.linker.LinkerObj;
		YAHOO.util.Dom.setStyle(oThis.panel.element, 'display', 'none');
		//this.panel.hide();
		oThis.ysrp.innerHTML = "";
		oThis.visible = false;
	},

	search: function(text, escText) {
		this.currentQuery = escText;
		this.currentSelection = text;
		this.selectedTextInput.value = text;
		YAHOO.linker.Util.jsonCall(
			"yahoo-linker-ysearch-req", 
			"http:\/\/api.search.yahoo.com\/WebSearchService\/V1\/webSearch?" + 
					"appid=openrico&query=" + escText +
					"&output=json", 
			"YAHOO.linker.getYSearchResults");
			
	},
	
	showPreview: function() {
		this.clearPreview();
		this.previewLinkArea.appendChild(
			document.createTextNode(this.getLinkFromSelection(this.selectedIndex)));
	},
	
	clearPreview: function() {
		this.previewLinkArea.innerHTML = '';
	},
	
	bindKeyboardNavigation: function(classToHighlight) {
		// purge the old ones
		if(this.listItems) {
			for(var i=0; i<this.listItems.length; i++) {
				YAHOO.util.Event.removeListener(this.listItems[i], 'mouseover');
			}
			YAHOO.util.Event.removeListener("yahoo-linker-ysearch", 'click');
		}
		var oThis = this;
		
		// Make the list
	    this.listItems = document.getElementById( classToHighlight ).getElementsByTagName( "LI" );
	
		// Have mouse hover highlight selection
		YAHOO.util.Event.addListener(this.listItems, 'mouseover', function(e) {
			var elem = YAHOO.util.Event.getTarget(e);
			
			var par = elem;
			// if node is not document, not anchor, not img, not body, not html then keep looking
			while ( typeof(par) !== "undefined" &&  par  &&  !/yahoo-linker-list-item-/.test(par.id) ) {
				par = par.parentNode;
			}
	
			if(  (typeof(par) !== "undefined") && par  ) {
				elem = par;
			}
			
			var id = elem.id;
			var newItem = parseInt(id.substring(id.length-1, id.length), 10);
            oThis.selectListItem(newItem);
		});

		// Have any click in the window do a replace text for current selection
		YAHOO.util.Event.addListener("yahoo-linker-ysearch", 'click', function(e) {
			oThis.replaceText(oThis.getLinkFromSelection(oThis.selectedIndex), 0);
			oThis.hide();
		});

	    this.selectedIndex = 0;
		this.showPreview(this.selectedIndex);
	},

    getScrollTop: function() {
        if ( document.documentElement && typeof document.documentElement.scrollTop != "undefined" ) {
            return document.documentElement.scrollTop;
        } else {
            return document.body.scrollTop;
        }
    },

    setScrollTop: function( value ) {
        // This does not seem to work on Safari...
        if ( document.documentElement && typeof document.documentElement.scrollTop != "undefined" ) {
            document.documentElement.scrollTop = value;
        } else {
            document.body.scrollTop = value;
        }
    },

    scrollToSelectedElem: function () {
        var elem = this.listItems[this.selectedIndex];
        var y1 = YAHOO.util.Dom.getY( elem );
        var y2 = YAHOO.util.Dom.getY( elem ) + elem.offsetHeight;

        var scrollTop = this.getScrollTop();
        var viewportHeight = YAHOO.util.Dom.getViewportHeight();

        if ( y1 < scrollTop ) {
            this.setScrollTop( Math.max( y1-5, 0 ) );
        } else if ( y2 > scrollTop + viewportHeight ) {
            this.setScrollTop( y2 - viewportHeight + 5 );
        }
    },

	selectListItem: function(newIndex) {
		var oldIndex = this.selectedIndex;
		
        YAHOO.util.Dom.removeClass( this.listItems[oldIndex], "on" );
        YAHOO.util.Dom.addClass( this.listItems[newIndex], "on" );
        this.selectedIndex = newIndex;

        this.scrollToSelectedElem();
		this.showPreview();
	},
	
    handleKeyDown: function( evt ) {
		oThis = YAHOO.linker.LinkerObj;
		
        switch ( evt.keyCode ) {

            case 13: // ENTER -> Take current selected Index, replace & dismiss dialog
				if(!oThis.visible) return;

				oThis.replaceText(oThis.getLinkFromSelection(oThis.selectedIndex), 0);
				oThis.hide();
				oThis.linkAsHTMLToggle.focus();
 				
				// so that ENTER does not get passed to the textarea
				setTimeout(function() {
					oThis.selectionInfo.elem.focus();
				}, 300);
                YAHOO.util.Event.stopEvent( evt );
                break;

			case 27: // ESC -> Dismiss, no change				

				if(oThis.visible) {
					oThis.replaceText(oThis.currentSelection, 200);
					oThis.hide();
					oThis.selectionInfo.elem.focus();
				} else {
					var newItem = oThis.selectedIndex+1;
					newItem = ( newItem >= oThis.listItems.length ) ? 0: newItem;
					oThis.selectListItem(newItem);
					var textToReplace = oThis.getLinkFromSelection(newItem);
					oThis.replaceText(textToReplace, oThis.visible?0:300);
				}
				YAHOO.util.Event.stopEvent( evt );
                break;

			case 9: // TAB -> go to the text field
				if(!oThis.visible) return;
				
				oThis.selectedTextInput.focus();
				oThis.selectedTextInput.selectionStart = 0;
				oThis.selectedTextInput.selectionEnd = oThis.selectedTextInput.value.length;
				break;

            case 35: // End => If gui showing, move to bottom, select & insert item
				if(!oThis.visible) return;
				
				var newItem = oThis.listItems.length-1;
				oThis.selectListItem(newItem);
				oThis.replaceText(oThis.getLinkFromSelection(newItem), 0);
 				oThis.linkAsHTMLToggle.focus();
                YAHOO.util.Event.stopEvent( evt );
               break;

            case 36: // Home => If gui showing, move top, select & insert item
 				if(!oThis.visible) return;

				oThis.selectListItem(0);
				oThis.replaceText(oThis.getLinkFromSelection(0), 0);
 				oThis.linkAsHTMLToggle.focus();
                YAHOO.util.Event.stopEvent( evt );
              break;

            case 37: // Left arrow => select & replace regardless of whether the gui shows
            case 38: // Up arrow
				if(!oThis.visible) return;
				
				var newItem = oThis.selectedIndex-1;
				newItem = ( newItem < 0 ) ? oThis.listItems.length - 1 : newItem;
				oThis.selectListItem(newItem);
				oThis.replaceText(oThis.getLinkFromSelection(newItem), oThis.visible?0:300);
 				//oThis.linkAsHTMLToggle.focus();
                YAHOO.util.Event.stopEvent( evt );
              break;

            case 39: // Right arrow => select & replace regardless of whether the gui shows
            case 40: // Down arrow
				if(!oThis.visible) return;

				var newItem = oThis.selectedIndex+1;
				newItem = ( newItem >= oThis.listItems.length ) ? 0: newItem;
				oThis.selectListItem(newItem);
 				oThis.replaceText(oThis.getLinkFromSelection(newItem), oThis.visible?0:300);
 				//oThis.linkAsHTMLToggle.focus();
				YAHOO.util.Event.stopEvent( evt );
                break;
        }
    },

    // Prevent the key strokes from scrolling the page.
    // We take care of the scrolling ourselves.
    handleKeyPress: function( evt ) {
 		if(!oThis.visible) return;
       var kdiff = 32;
        switch ( evt.keyCode ) {
            case 35: // End
            case 36: // Home
            case 37: // Left arrow
            case 38: // Up arrow
            case 39: // Right arrow
            case 40: // Down arrow
                YAHOO.util.Event.stopEvent( evt );
                break;
        }
    }	
};

YAHOO.widget.Panel.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doHide = function(e, obj) {
		YAHOO.linker.LinkerObj.hide();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("DIV");
			YAHOO.util.Dom.addClass(this.close, "close");

			if (this.isSecure) {
				YAHOO.util.Dom.addClass(this.close, "secure");
			} else {
				YAHOO.util.Dom.addClass(this.close, "nonsecure");
			}

			this.close.innerHTML = "&nbsp;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doHide, this);	
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};


