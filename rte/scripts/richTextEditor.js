/** ================================================================================
 * 
 *   CLASS RichTextEditor
 *    Usage:
 *     <div> <!-- any container -->
 *        <script>
 *           var rte = new RichTextEditor('compose');
 *           document.write(rte);
 *           rte.finishSetup();
 *        </script>
 *     </div>
 * 
 * ================================================================================ */

RichTextEditor = Class.create();

function RichTextEditorEmptyFunction() {}

RichTextEditor.prototype = {
  
    initialize: function(id,options) {
        this._buttons     = [];
        this._rendered    = false;
        this._id          = id;
        this._isDirty     = true;
        this._isIE        =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;
        this._setOptions(options);
        this._filmStrip = new FilmStripImageData( 'url(' + this.options.filmStrip + ')', 0, 
                                                  this.options.buttonWidth, 
                                                  this.options.buttonHeight,
                                                  true,
                                                  false );
    },
    
    _setOptions: function(options) {
        this.options = {
           styleClass         : 'richTextEditorComp',
           width              : 664,
           bgColor            : '#ffffff',
           disabledBgColor    : '#f3f3f0',
           editorHeight       : 200,
           filmStrip          : "http://us.i1.yimg.com/us.yimg.com/i/us/pim/dclient/d/img/md5/699f4f9b844489ab8f6db723ad6398e1_1.gif",
           numButtons         : 13,
           filmStripIndexes   : [ 23, 24, 25, 18, 15, 3, 29, 34, 28, 30, 27, 26, 11 ],
           buttonNames        : [ "bold", "italic", "underline", "textColor", "hiliteColor", "emoticon", "insertLink", 
                                  "insertDivider", "align", "bullets", "indentRight", "indentLeft", "stationary" ],
           fontFamilies       : [ 'Arial', 'Bookman Old Style', 'Courier', 'Garamond', 'Lucida Console', 
                                  'Symbol', 'Tahoma', 'Times New Roman', 'Verdana' ], 
           fontFamilyValues   : [ "arial, helvetica, sans-serif",
                                  "bookman old style, new york, times, serif",
                                  "courier, monaco, monospace, sans-serif",
                                  "garamond, new york, times, serif",
                                  "lucida console, sans-serif",
                                  "symbol",
                                  "tahoma, new york, times, serif",
                                  "times new roman, new york, times, serif",
                                  "verdana, helvetica, sans-serif" ],
           alignmentMenuOptions: { flushLeftText: "Flush Left", flushRightText: "Flush Right", centeredText: "Centered" },
           bulletMenuOptions   : { numberedListText: "Numbered List", bulletedListText: "Bulleted List"},
           htmlPostProcessor   : null,
           blurHandler         : null,
           insertLinkPromptText: "Insert Link To?",
           noColorText         : "No Color",
           emoticonsComingSoon : "Emoticons coming soon!",
           stationarySoon      : "Stationary coming soon!",
           fontSizes           : [ 8, 10, 12, 14, 18, 24, 36 ],
           fontSizeValues      : [ 1, 2, 3, 4, 5, 6, 7 ],
           fontFamiliesWidth   : 140,
           fontSizesWidth      : 50,
           buttonWidth         : 30,
           buttonHeight        : 24,
           leftPad             :  7,
           padding             :  3,
           paddingTop          : 10,
           paddingBottom       :  2,
           cssCompliantBoxModel: navigator.userAgent.toLowerCase().indexOf("msie") == -1
        };
        Object.extend(this.options, options || {} );
    },
    
    /**
     * Construction only initializes data.  then, a document.write(anInstance)
     * emits the shell of the component into the document. then finishSetup()
     * adds the DHTML behaivors to it...
     * 
     * ...finish bootstrapping the component.
     */
    finishSetup: function() {
        this._roundTopCorners();
        this._addFontSelectBehaivors();
        this._createDhtmlButtons();
        this._createColorPickMenu();
        this._createAlignmentMenu();
        this._createBulletMenu();
    },
    
    setEnabled: function(isEnabled) {
        if ( ! this._editorDocument ) {
            this.pendingDisable = !isEnabled;
            return;
        }
        this.pendingDisable = false;
        this.makeDocumentEditable(isEnabled);
        
        var newBgColor = isEnabled ? this.options.bgColor : this.options.disabledBgColor;
        $( this._id + "_editorArea" ).style.backgroundColor = newBgColor;
        this._editorDocument.body.style.backgroundColor = newBgColor;
    },
    
    setContent: function( contentStr ) {
        
        if ( this._editorDocument ) {
            try {
                this._editorDocument.body.innerHTML = contentStr;
                this._pendingContent = null;
            }
            catch(err) {
                /** 
                 * bug #760962. IE seems to intermittently throw an
                 * exception when doing the  body.innerHTML = blah
                 * line above, so set the document content via
                 * document.write() in those cases and reinitialize
                 * the document again.... sigh...
                 * need to do further investigation into why this fails.
                 * make sure and null out pending content first!
                 **/
                this._pendingContent = null;
                this._editorDocument.write(contentStr);
                this._editorDocument.close();
                this.initializeDocument();
            }
        }
        else
            this._pendingContent = contentStr;
    },
    
    getEditorContent: function() {
        
        if ( !this._editorDocument || !this._editorDocument.body )
            return "";
        
        return this._htmlPostProcess( this._editorDocument.body.innerHTML );
    },
    
    _htmlPostProcess: function(theHTML) {
        if ( this.options.htmlPostProcessor )
            return this.options.htmlPostProcessor(theHTML);
        return theHTML;
    },
    
    _addFontSelectBehaivors: function() {
        var fontFamilySelect = $(this._id + '_fontFamilies' );
        var fontSizeSelect   = $(this._id + '_fontSizes' );
        fontFamilySelect.onchange = this._doFontFamily.bindAsEventListener(this);
        fontSizeSelect.onchange   = this._doFontSize.bindAsEventListener(this);
    },
    
    _createDhtmlButtons: function() {
        
        // for ie these can't be selectable, because they take the focus from the editor
        DhtmlButton.unselectableInIE = true;
        
        var parent = $(this._id + '_palette');
        for ( var i = 0 ; i < this.options.numButtons ; i++ ) {
            
            var btnName = this.options.buttonNames[i];
            var handlerName = '_do' + btnName.substring(0,1).toUpperCase() + btnName.substring(1);
            var action = this[ handlerName ].bindAsEventListener(this);
            this._createDhtmlButton(parent,action,i);
        }

        DhtmlButton.unselectableInIE = false;

    },
    
    _createDhtmlButton: function(parent,action,btnIndex) {

        var suffix = this.options.buttonNames[btnIndex];
        this._filmStrip.setIndex( this.options.filmStripIndexes[btnIndex] );
        var leftOffset = this.options.leftPad +
                         this.options.fontFamiliesWidth + 
                         this.options.fontSizesWidth + 
                         (this.options.padding * 2);
        var left = (leftOffset + 
                   (btnIndex * ( this.options.buttonWidth + 2 + this.options.padding ))) + "px";
        left = parseInt(left) + this.options.padding + "px";

        var button = new DhtmlButton( '', action, FilmStripImageData.clone(this._filmStrip), 4 );
        this._buttons[ this._buttons.length ] = button;
        var buttonGUI = button.getGUI();
        
        if ( this._isIE )
            buttonGUI.style.width = (this.options.buttonWidth + 2) + "px";
        
        buttonGUI.style.position = "absolute";
        buttonGUI.style.top = this.options.paddingTop + "px";
        buttonGUI.style.left = left;
        parent.appendChild(buttonGUI);
    },
    
    _createColorPickMenu: function() {
        
        this._colorPicker = document.createElement("div");
        this._colorPicker.style.border = '2px solid #aaaaaa';
        this._colorPicker.style.backgroundColor = '#ffffff';
        this._colorPicker.style.position = "absolute";
        this._colorPicker.style.top      = (this.options.paddingTop + this.options.buttonHeight + 3) + "px"; 
        this._colorPicker.style.display  = 'none';
        
        this._colorPalette = new ColorPalette('picker', { noColorText: this.options.noColorText } );
        this._colorPicker.innerHTML = this._colorPalette;
        $(this._id + '_palette').appendChild(this._colorPicker);
        
        /** Register Psuedo Menu, only needs an isVisble() and hide() method to qualify... */
        var colorPicker = this._colorPicker;
        SimplePopupMenu.register( {
            isVisible: function() {return colorPicker.style.display != 'none'; },
            hide:      function() {colorPicker.style.display = 'none'; }
        });
    },

    _createAlignmentMenu: function() {
        this._alignmentMenu = new AlignmentMenu(this, this.options.alignmentMenuOptions);
    },
    
    _createBulletMenu: function() {
        this._bulletMenu = new BulletMenu(this, this.options.bulletMenuOptions);
    },
    
    getSelectedText: function() {
        try {
            if ( this._isIE ) {
                var s = this._editorDocument.selection;
                if ( s && s.type == "Text" )
                    return s.text;
            } 
            else {
                var editor = $( this._id + "_editorArea" );
                var s = editor.contentWindow.getSelection();
                if ( s )
                    return s.toString();
            }
        } catch (e) { }

        return "";
    },
    
    replaceSelection: function ( text ) {
        try {
            var editor = $( this._id + "_editorArea" );
            var richTextWindow = editor.contentWindow;

            if ( richTextWindow.getSelection != null ) { // Moz
                this.replaceWindowSelectionMozilla (text);
            } 
            else {
                var selection = this._editorDocument.selection;
                var range = selection.createRange();
                if ( range != null )
                    range.text = text;
            }
        } 
        catch (e)  { } 
    },
    
    replaceWindowSelectionMozilla: function ( text ) {

        var editor = $( this._id + "_editorArea" );
        var richTextWindow = editor.contentWindow;
        
        var selection = richTextWindow.getSelection();
        if ( ! selection )
            return;
            
        // delete prior selection via iterating over ranges...
        var range = null;
        for ( var i = selection.rangeCount-1; i >= 0 ; --i ) {
            range = selection.getRangeAt(i);
            if ( range )
                range.deleteContents ();
        }

        // repalace last range w/ text
        if ( range ) {
            var textNode = (typeof text == "string") ? document.createTextNode (text) : text;

            // get location of current selection
            var startContainer = range.startContainer;
        
            if ( startContainer.nodeType == 3 && textNode.nodeType == 3 ) {
                startContainer.insertData ( range.startOffset, textNode.nodeValue );
                var sOffset = range.startOffset + textNode.length;
                range.setEnd( startContainer, sOffset );
                range.setStart( startContainer, sOffset );
            } 
            else {
                range = range.cloneRange();
                selection.removeAllRanges();

                range.insertNode( textNode );
                range.setEndAfter( textNode );
                range.setStartAfter( textNode );
                range.collapse(false); 
                selection.addRange (range);
            }
        }
    },
    
    _roundTopCorners: function() {
        var gui = $(this._id + '_palette');

        Rico.Corner.round( gui, {corners:'tl tr',border:'#b3b6b0'} );
        var roundingContainer = gui.firstChild;
        var spanSlice2 = roundingContainer.childNodes[1];
        var spanSlice3 = roundingContainer.childNodes[2];
        var spanSlice4 = roundingContainer.childNodes[3];
        
        // based on color of gradient img used...
        spanSlice2.style.backgroundColor = '#f8f8f0';
        spanSlice3.style.backgroundColor = '#f8f8f0';
        spanSlice4.style.backgroundColor = '#f8f8f0';
    },
    
    initializeDocument: function() {
        var editor = $(this._id+'_editorArea');
        var editorDocument;
        if ( this._isIE ) {
            editorDocument = editor.contentWindow.document;
        }
        else
            editorDocument = editor.contentDocument;

        this._editorDocument = editorDocument;
        this._addEventHandlersToEditorDocument();

        this._adjustStyleForEditorDocument();
        
        if ( this._pendingContent ) {
            this.setContent(this._pendingContent);
            if ( this._isIE ) {
                editor.blur();
            }
        }

        if ( this.pendingDisable ) 
            this.setEnabled(false);
        else
            this.makeDocumentEditable(true);
        
    },
    
    /**
     * Adds a style rules that removes margins from <p> tags
     * generated by IE... puts it in both browsers so that 
     * if the editor was used in IE but later viewed in FF,
     * it still looks right...
     */
    _adjustStyleForEditorDocument: function() {
        if ( this._isIE ) {
            /* add a style rule that removes margins from <p> tags... */
            var sheet = this._addStyleSheet ( this._editorDocument );
            this._addStylesheetRule ( sheet, "P",  "margin:0px;" );
            this._addStylesheetRule ( sheet, "UL", "margin-top:5px;margin-bottom:5px;" );
            this._addStylesheetRule ( sheet, "OL", "margin-top:5px;margin-bottom:5px;" );
        }
        else {
            var head = this._editorDocument.getElementsByTagName ("HEAD") [0];
            head.innerHTML = '<STYLE TYPE="text/css">\nP {margin:0px;}\nUL,OL{margin-top:5px;margin-bottom:5px}\n</STYLE>';
        }
        
        this._editorDocument.body.hideFocus = true;
    },

    _addStyleSheet: function (doc) {
        var styleElt = doc.createElement( "STYLE" );
        doc.getElementsByTagName( "HEAD" ).item( 0 ).appendChild( styleElt );
        return doc.styleSheets[ doc.styleSheets.length-1 ];
    },

    _addStylesheetRule: function ( styleSheet, name, styles ) {
        // generally we prefer "can we do X?" tests,
        // versus "what browser are we running?" tests 
        if ( typeof styleSheet.addRule != "undefined" )
            styleSheet.addRule( name, styles );
        else if ( typeof styleSheet.insertRule != "undefined" )
            styleSheet.insertRule( name + " { " + styles + " }", styleSheet.cssRules.length );
    },
    
    makeDocumentEditable: function( aFlag ) {
        if ( this._isIE )
            this._editorDocument.body.contentEditable = aFlag;
        else {
            // turning the design mode off and then back on seems
            // to fix several FF big-cursor/small-cursor issues...
            if ( aFlag )
                this._editorDocument.designMode = 'Off';
            this._editorDocument.designMode = aFlag ? 'On' : 'Off';
        }
    },
    
    _addEventHandlersToEditorDocument: function() {
        
        this._blurClosure       = this._handleBlur.bindAsEventListener(this);
        this._clickClosure      = this._handleEditorClick.bindAsEventListener(this);
        this._keyDownClosure    = this._handleEditorKeyDown.bindAsEventListener(this);
        this._updateFontClosure = this._handleUpdateFont.bindAsEventListener(this);

        if ( this._isIE ) {
            this._editorDocument.body.onblur = this._blurClosure;
            this._editorDocument.onclick   = this._clickClosure;
            this._editorDocument.onkeydown = this._keyDownClosure;
            this._editorDocument.onkeyup   = this._updateFontClosure;
            this._editorDocument.onmouseup = this._updateFontClosure;
            this._editorDocument.onselect  = this._updateFontClosure;
        }
        else {
            this._editorDocument.designMode = 'Off';
            this._editorDocument.addEventListener( "blur",   this._blurClosure,       true )
            this._editorDocument.addEventListener( "click",  this._clickClosure,      true );
            this._editorDocument.addEventListener( "keydown",this._keyDownClosure,    true );
            this._editorDocument.addEventListener ("keyup",  this._updateFontClosure, true);
            this._editorDocument.addEventListener ("mouseup",this._updateFontClosure, true);
            this._editorDocument.addEventListener ("select", this._updateFontClosure, true);
        }
    },
    
    _handleEditorKeyDown: function(event) {
        SimplePopupMenu.hideAll();
        event = (event == null) ? $(this._id+'_editorArea').contentWindow.event : event;
        if ( this._isIE && event.keyCode == 9 )
            return this._handleIETabKey(event);
        
        if ( this.onchange )
            this.onchange();
    },
    
    _handleIETabKey: function(event) {
        
        if ( event.ctrlKey || event.shiftKey )
            return;
        var nbsp = String.fromCharCode(160);
        this.replaceSelection( nbsp+nbsp+nbsp+String.fromCharCode(32) );
        return false;
    },
    
    _handleEditorClick: function(event) {
        SimplePopupMenu.hideAll();
    },
    
    _handleBlur: function(event) {
        try {
            if ( this.options.blurHandler )
                this.options.blurHandler(this);
        }
        catch(err) { }
    },
    
    _handleUpdateFont: function(event) {
        try {
            this._updateFontFamilyFromSelection();
            this._updateFontSizeFromSelection();
        }
        catch(err) {
            /* various reasons this can happen on FF */
        }
    },
    
    _updateFontFamilyFromSelection: function() {
        var fontFamilySelect = $(this._id + '_fontFamilies' );
        var cmdValue = this._editorDocument.queryCommandValue("FontName");
        if ( !cmdValue )
            return;
        cmdValue = cmdValue.split(/,+/)[0].toLowerCase();
        
        for ( var i = 0 ; i < fontFamilySelect.options.length  ; i++ ) {
            var option = fontFamilySelect.options[i];
            if ( option.value.toLowerCase().indexOf(cmdValue) != -1 ) {
                if ( !option.selected )
                    option.selected = true;
                break;
            }
        }
        
    },
    
    _updateFontSizeFromSelection: function() {
        var fontSizeSelect = $(this._id + '_fontSizes' );
        var cmdValue = this._editorDocument.queryCommandValue("FontSize");
        if ( !cmdValue )
            return;
        
        for ( var i = 0 ; i < fontSizeSelect.options.length ; i++ ) {
            var option = fontSizeSelect.options[i];
            if ( parseInt(option.value) == parseInt(cmdValue) ) {
                if ( ! option.selected )
                    option.selected = true;
                break;
            }
        }
    },
    
    _doFontFamily: function(event) {
        SimplePopupMenu.hideAll();
        
        this.ensureEditorFocusIE();
        var fontFamilySelect = $(this._id + '_fontFamilies' );
        this._editorDocument.execCommand("FontName", false, fontFamilySelect.value );
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doFontSize: function(event) {
        SimplePopupMenu.hideAll();

        this.ensureEditorFocusIE();
        var fontSizeSelect = $(this._id + '_fontSizes' );
        this._editorDocument.execCommand("FontSize", false, fontSizeSelect.value );
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },

    _doBold: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("Bold") : 
                     this._editorDocument.execCommand("Bold", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doItalic: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("Italic") : 
                     this._editorDocument.execCommand("Italic", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doUnderline: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("Underline") : 
                     this._editorDocument.execCommand("Underline", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doTextColor: function(event) {

        var e = event.srcElement ? event.srcElement : event.target;
        while ( e.style.left == '' )
            e = e.offsetParent;
        
        if ( this._colorPicker.style.display == 'none' ) {
            SimplePopupMenu.hideAll();
            this._colorPalette.setAction( "setTextColor", this._setTextColor.bind(this) );
            this._colorPicker.style.left = e.style.left;
            this._colorPicker.style.display = '';
        }
        else if ( this._colorPalette.getAction() == "setTextColor" ) {
            this._colorPicker.style.display = 'none';
        }
        else {
            this._colorPalette.setAction( "setTextColor", this._setTextColor.bind(this) );
            this._colorPicker.style.left = e.style.left;
        }
    },
    
    _setTextColor: function(str) {
        this.ensureEditorFocusIE();
        
        var hexColor = (str == 'nocolor') ? null : '#'+str;
        this._editorDocument.execCommand("ForeColor", false, hexColor );
        this._colorPicker.style.display = 'none';
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doHiliteColor: function(event) {
        var e = event.srcElement ? event.srcElement : event.target;
        while ( e.style.left == '' )
            e = e.offsetParent;
        
        if ( this._colorPicker.style.display == 'none' ) {
            SimplePopupMenu.hideAll();
            this._colorPalette.setAction( "setHiliteColor", this._setHiliteColor.bind(this) );
            this._colorPicker.style.left = e.style.left;
            this._colorPicker.style.display = '';
        }
        else if ( this._colorPalette.getAction() == "setHiliteColor" ) {
            this._colorPicker.style.display = 'none';
        }
        else {
            this._colorPalette.setAction( "setHiliteColor", this._setHiliteColor.bind(this) );
            this._colorPicker.style.left = e.style.left;
        }
    },
    
    _setHiliteColor: function(str) {
        var isIE =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;
        var cmdName = isIE ? "BackColor" : "HiliteColor";
        
        this.ensureEditorFocusIE();
        var hexColor = (str == 'nocolor') ? null : '#'+str;
        this._editorDocument.execCommand(cmdName, false, hexColor );
        this._colorPicker.style.display = 'none';
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doEmoticon: function() {
        SimplePopupMenu.hideAll();
        alert( this.options.emoticonsComingSoon );
    },
    
    _doInsertLink: function() {
        SimplePopupMenu.hideAll();
        if ( this._isIE ) {
            this.ensureEditorFocusIE();
            this._editorDocument.execCommand( "CreateLink", true, null );
        }
        else
            this._doInsertLinkMozilla();
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    focusEditor: function() {
        var richTextWindow = $(this._id + "_editorArea").contentWindow;
        try {
            richTextWindow.focus();
        }
        catch(err) { }
    },
    
    _focusEditorDeferred: function() {
        setTimeout( this.focusEditor.bind(this), 1 );
    },
    
    _doInsertLinkMozilla: function() {
        
        // pop up our own dialog, 
        var url = prompt( this.options.insertLinkPromptText );
        if ( url == null || url == "")
            return;
        
        // if no text selected, just put it in...
        var selectedText = this.getSelectedText();
        if ( selectedText == "" ) {
            var anchorNode = this._editorDocument.createElement ( "A" );
            anchorNode.setAttribute ( "HREF", url );
            anchorNode.appendChild ( this._editorDocument.createTextNode ( url ));
            this.replaceSelection (anchorNode);
        }
        else
            this._editorDocument.execCommand( "CreateLink", false, url );
    },
    
    _doInsertDivider: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("InsertHorizontalRule") : 
                     this._editorDocument.execCommand("InsertHorizontalRule", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doAlign: function(event) {
        
        var e = event.srcElement ? event.srcElement : event.target;
        while ( e.style.left == '' )
            e = e.offsetParent;

        this._alignmentMenu.positionRelativeTo(e);
        this._alignmentMenu.toggle();
    },
    
    _doFlushLeft: function(event) {
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("JustifyLeft") : 
                     this._editorDocument.execCommand("JustifyLeft", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doCentered: function(event) {
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("JustifyCenter") : 
                     this._editorDocument.execCommand("JustifyCenter", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doFlushRight: function(event) {
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("JustifyRight") : 
                     this._editorDocument.execCommand("JustifyRight", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doBullets: function(event) {
        var e = event.srcElement ? event.srcElement : event.target;
        while ( e.style.left == '' )
            e = e.offsetParent;

        this._bulletMenu.positionRelativeTo(e);
        this._bulletMenu.toggle();
    },
    
    _doNumberedList: function(event) {
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("insertorderedlist") : 
                     this._editorDocument.execCommand("insertorderedlist", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doBulletedList: function(event) {
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("insertunorderedlist") : 
                     this._editorDocument.execCommand("insertunorderedlist", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doIndentRight: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("Indent") : 
                     this._editorDocument.execCommand("Indent", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doIndentLeft: function() {
        SimplePopupMenu.hideAll();
        this.ensureEditorFocusIE();
        this._isIE ? this._editorDocument.execCommand("Outdent") : 
                     this._editorDocument.execCommand("Outdent", false, null);
        this._focusEditorDeferred();

        if ( this.onchange )
            this.onchange();
    },
    
    _doStationary: function() {
        SimplePopupMenu.hideAll();
        alert( this.options.stationarySoon );
    },
    
    /**
     * Dont allow the command to execute on IE if the editor is not
     * the active element in the document...
     */
    ensureEditorFocusIE: function() {
        if ( ! this._isIE )
            return;
        
        var editor = $( this._id + '_editorArea' );
        if( document.activeElement != editor )
            this.focusEditor();
    },
    
    toString: function() { 
        return this.htmls(); 
    },
    
    htmls: function() {

        var html = [];
        
        var width  =  this.options.width + "px";
        var height =  (this.options.buttonHeight + 
                       this.options.paddingTop + 
                       this.options.paddingBottom) + "px";
        
        html[ html.length ] = "<div id='";
        html[ html.length ] = this._id;
        html[ html.length ] = "_palette' style='position:relative;width:";
        html[ html.length ] = width;
        //html[ html.length ] = ";height:";
        //html[ html.length ] = height;
        html[ html.length ] = "' class='";
        html[ html.length ] = this.options.styleClass;
        html[ html.length ] = "'>";
        
        this._addButtonsHTML( html );

        html[ html.length ] = "<div style='height:"+ height + "'></div></div>";
        
        // now add the iframe
        this._addEditorArea( html );
        
        return html.join("");
    },
    
    _addButtonsHTML: function( html ) {

        this._fontSelectHTML( html, this.options.fontFamilies, this.options.fontFamilyValues, "fontFamilies", this.options.fontFamiliesWidth, this.options.leftPad + this.options.padding );
        this._fontSelectHTML( html, this.options.fontSizes, this.options.fontSizeValues, "fontSizes", this.options.fontSizesWidth, 
                              this.options.leftPad + this.options.fontFamiliesWidth + (this.options.padding * 2) );

        //for ( var i = 0 ; i < this.options.numButtons ; i++ )
        //    this._buttonHTML( html, i );
    },
    
    _fontSelectHTML: function( html, fArray, fValueArray, suffix, width, leftOffset ) {
        
        html[ html.length ] = "<select unselectable='on' id='";
        html[ html.length ] = this._id;
        html[ html.length ] = "_" + suffix + "' style='width:";
        html[ html.length ] = width;
        html[ html.length ] = "px;position:absolute;top:";
        html[ html.length ] = this.options.paddingTop;
        html[ html.length ] = "px;left:"+leftOffset+"px'>";
        
        for ( var i = 0 ; i < fArray.length ; i++ ) { 
            html[ html.length ] = "<option value='"; 
            html[ html.length ] = fValueArray[i];
            html[ html.length ] = "'>";
            html[ html.length ] = fArray[i];
            html[ html.length ] = "</option>";
        }
        
        html[ html.length ] = "</select>";
    },
    
    _addEditorArea: function( html ) {
        
        var fudgeFactor = this._isIE ? 9 : 7;

        html [ html.length ] = "<iframe id='"; 
        html [ html.length ] = this._id;
        html [ html.length ] = "_editorArea' ";
        html [ html.length ] = "src='about:blank' frameborder='0' marginwidth='0' marginheight='0' allowTransparency='true' ";
        html [ html.length ] = "hspace='0' vspace='0'  "; 
        html [ html.length ] = "style='width:"; 
        //html [ html.length ] = this.options.cssCompliantBoxModel ? this.options.width : this.options.width - 2; 
        html [ html.length ] = this.options.width - fudgeFactor;
        html [ html.length ] = "px;height:"; 
        html [ html.length ] = this.options.editorHeight;
        html [ html.length ] = "px;";
        html [ html.length ] = "border:1px solid #b3b6b0;padding-top:5px;padding-left:5px;'>";
        html [ html.length ] = "</iframe>";
    },
    
    cleanup: function() {

        if ( this._isIE ) {
            this._editorDocument.onblur    = RichTextEditorEmptyFunction;
            this._editorDocument.onclick   = RichTextEditorEmptyFunction;
            this._editorDocument.onkeydown = RichTextEditorEmptyFunction;
            this._editorDocument.onkeyup   = RichTextEditorEmptyFunction;
            this._editorDocument.onmouseup = RichTextEditorEmptyFunction;
            this._editorDocument.onselect  = RichTextEditorEmptyFunction;
        }
        else {
            this._editorDocument.designMode = 'Off';
            this._editorDocument.removeEventListener( "blur",   this._blurClosure,       true );
            this._editorDocument.removeEventListener( "click",  this._clickClosure,      true );
            this._editorDocument.removeEventListener( "keydown",this._keyDownClosure,    true );
            this._editorDocument.removeEventListener( "keyup",  this._updateFontClosure, true );
            this._editorDocument.removeEventListener( "mouseup",this._updateFontClosure, true );
            this._editorDocument.removeEventListener( "select", this._updateFontClosure, true );
        }
        
        this._blurClosure    = null;
        this._clickClosure   = null;
        this._keyDownClosure = null;

        // buttons....
        for ( var i = 0 ; i < this._buttons.length ; i++ )
            this._buttons[i].cleanup();

        // menus....
        this._alignmentMenu.cleanup();
        this._bulletMenu.cleanup();
        this._colorPalette.setAction( "", null );
        this._colorPalette = null;
    }
        
};

RichTextEditor.create = function (parent, options) {
   var rte = new RichTextEditor('compose', options);
   document.write(rte);
   rte.finishSetup();
   return rte;
}

/** ================================================================================
 * 
 *   CLASS ColorPaleete
 *   ...used to generate the html for a palette of color choices, used by RTE
 *   
 *        
 * 
 * ================================================================================ */
ColorPalette = Class.create();

ColorPalette.COLOR_SWATCHES = [
   [ '000000', '111111', '2d2d2d', '434343', '5b5b5b', '737373', '8b8b8b', 'a2a2a2', 'b9b9b9', 'd0d0d0', 'e6e6e6', 'ffffff' ],
   [ '7f7f00', 'bfbf00', 'ffff00', 'ffff40', 'ffff80', 'ffffbf', '525330', '898a49', 'aea945', 'c3be71', 'e0dcaa', 'fcfae1' ],
   [ '407f00', '60bf00', '80ff00', 'a0ff40', 'c0ff80', 'dfffbf', '3b5738', '668f5a', '7f9757', '8a9b55', 'b7c296', 'e6ebd5' ],
   [ '007f40', '00bf60', '00ff80', '40ffa0', '80ffc0', 'bfffdf', '033d21', '438059', '7fa37c', '8dae94', 'acc6b5', 'ddebe2' ],
   [ '007f7f', '00bfbf', '00ffff', '40ffff', '80ffff', 'bfffff', '033d3d', '347d7e', '609a9f', '96bdc4', 'b5d1d7', 'e2f1f4' ],
   [ '00407f', '0060bf', '0080ff', '40a0ff', '80c0ff', 'bfdfff', '1b2c48', '385376', '57708f', '7792ac', 'a8bed1', 'deebf6' ],
   [ '00007f', '0000bf', '0000ff', '4040ff', '8080ff', 'bfbfff', '212143', '373e68', '444f75', '585e82', '8687a4', 'd2d1e1' ],
   [ '40007f', '6000bf', '8000ff', 'a040ff', 'c080ff', 'dfbfff', '302449', '54466f', '655a7f', '726284', '9e8fa9', 'dcd1df' ],
   [ '7f007f', 'bf00bf', 'ff00ff', 'ff40ff', 'ff80ff', 'ffbfff', '4a234a', '794a72', '936386', '9d7292', 'c0a0b6', 'ecdae5' ],
   [ '7f003f', 'bf005f', 'ff007f', 'ff409f', 'ff80bf', 'ffbfdf', '451528', '823857', 'a94a76', 'bc6f95', 'd8a5bb', 'f7dde9' ],
   [ '800000', 'c00000', 'ff0000', 'ff4040', 'ff8080', 'ffc0c0', '441415', '82393c', 'aa4d4e', 'bc6e6e', 'd8a3a4', 'f8dddd' ],
   [ '7f3f00', 'bf5f00', 'ff7f00', 'ff9f40', 'ffbf80', 'ffdfbf', '482c1b', '855a40', 'b27c51', 'c49b71', 'e1c4a8', 'fdeee0' ]
     ];

ColorPalette.instances = [];

ColorPalette.selectColor = function( id, r, c ) {
    var instance = ColorPalette.instances[id];
    instance.selectColor(ColorPalette.COLOR_SWATCHES[r][c]);
}

ColorPalette.noColor = function(id) {
    var instance = ColorPalette.instances[id];
    instance.noColor();
}


ColorPalette.prototype = {

    initialize: function(id,options) {
        this._id = id;
        ColorPalette.instances[id] = this;
        this.options = options || {};
        if ( ! this.options.noColorText )
            this.options.noColorText = 'No Color';
    },
    
    getAction: function() {
        return this.actionStr;
    },
    
    setAction: function(str,anAction) {
        this.actionStr = str; 
        this.action    = anAction;
    },
    
    noColor: function() {
        this.action('nocolor');
    },
    
    selectColor: function( colorStr ) {
        this.action(colorStr)
    },
    
    toString: function() {
        
        var html = [];
        html[ html.length ] = "<table width=168 height=168 border=0 cellspacing=0 cellpadding=0 unselectable='on'><tbody>";
        for (row=0; row < 12; row++ ) {
            
            html[ html.length ] = '<tr>';
            for ( col=0; col < 12; col++ ) {
                html[ html.length ] = "<td bgcolor=";
                html[ html.length ] = ColorPalette.COLOR_SWATCHES[row][col];
                html[ html.length ] = " style='font-size:1px;width:12px;height:12px;overflow:hidden;border:1px solid white;' ";
                html[ html.length ] = "onMouseOver='this.style.border=\"1px inset black\";' ";
                html[ html.length ] = "onMouseOut='this.style.border=\"1px solid white\";' unselectable='on' ";
                html[ html.length ] = "onClick=\"ColorPalette.selectColor('";
                html[ html.length ] = this._id + "'," + row + "," + col + ")\"";
                html[ html.length ] = ">&nbsp;</td>"
            }
            html[ html.length ] = "</tr>";
        }
        html[ html.length ] = "</tbody></table>";
        html[ html.length ] = "<div unselectable='on' style=\"cursor:pointer;cursor:hand;font-family:arial;font-size:8pt;\" onclick=\"ColorPalette.noColor('";
        html[ html.length ] = this._id + "')\">";
        html[ html.length ] = this.options.noColorText + "</div>";
        
        return html.join("");
    }
};

/** ================================================================================
 * 
 *   CLASS SimplePopupMenu
 *   Base Class for generating very simple popup menus. See AlignmentMenu
 *   and BulletMenu for derived instances...
 *        
 * 
 * ================================================================================ */
SimplePopupMenu = Class.create();

SimplePopupMenu.allMenus = [];

SimplePopupMenu.register = function(aMenu) {
    SimplePopupMenu.allMenus[ SimplePopupMenu.allMenus.length ] = aMenu;
}

SimplePopupMenu.hideAll = function() {
    for  ( var i = 0 ; i < SimplePopupMenu.allMenus.length ; i++ ) {
        var aMenu = SimplePopupMenu.allMenus[i];
        if ( aMenu.isVisible() )
            aMenu.hide();
    }
}

SimplePopupMenu.prototype = {
  
    initialize: function( buttons, options ) {
        this._buttons = buttons;
        this.setOptions(options);
        this._createGUI();
    },
    
    setOptions: function(options) {
        this.options = {
           className: 'SimpleMenuClass'
        }
        Object.extend(this.options, options || {} );
    },
    
    _createGUI: function() {
        var isIE =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;

        this._gui = isIE ? document.createElement("<div unselectable='on'>") : document.createElement("div");
        this._gui.className = this.options.className;
        this._gui.style.display  = 'none';
        this._gui.style.position = 'absolute';
        for ( var i = 0 ; i < this._buttons.length ; i++ )
            this._gui.appendChild(this._buttons[i].getGUI());
    },
    
    positionRelativeTo: function( anElement ) {
        this._gui.style.left = anElement.offsetLeft + "px";
        this._gui.style.top  = (anElement.offsetTop + anElement.offsetWidth) + "px";
    },

    toggle: function() {
        if ( this.isVisible() )
            this.hide();
        else
            this.show();
    },
    
    isVisible: function() {
        return this._gui.style.display != 'none';
    },
    
    show: function() {
        SimplePopupMenu.hideAll();
        this._gui.style.display = '';
    },
    
    hide: function() {
        this._gui.style.display = 'none';
    },

    cleanup: function() {
        for ( var i = 0 ; i < this._buttons.length ; i++ )
            this._buttons[i].cleanup();
    }

};

/** ================================================================================
 * 
 *   Class for generating the RTE menu for Alignment Options 
 *        [Flush Left]
 *        [Centered]
 *        [Flush Right]
 * 
 * ================================================================================ */
AlignmentMenu = Class.create();

AlignmentMenu.prototype = Object.extend( new SimplePopupMenu([]), {

   initialize: function( richTextEditor, options ) {
       
       this._richTextEditor = richTextEditor;
       this.setOptions(options);
       
       if  ( ! this.options.width )
           this.options.width = 80;
       if ( ! this.options.flushLeftText )
           this.options.flushLeftText = "Flush Left";
       if ( ! this.options.centeredText )
           this.options.centeredText = "Centered";
       if ( ! this.options.flushRightText )
           this.options.flushRightText = "Flush Right";

       this._buttons = [];
       DhtmlButton.unselectableInIE = true;
       this._buttons[0] =  new DhtmlMenuButton( this.options.flushLeftText, this._doFlushLeft.bindAsEventListener(this)  );
       this._buttons[1] =  new DhtmlMenuButton( this.options.centeredText,  this._doCentered.bindAsEventListener(this)   );
       this._buttons[2] =  new DhtmlMenuButton( this.options.flushRightText,this._doFlushRight.bindAsEventListener(this) );
       DhtmlButton.unselectableInIE = false;
       this._createGUI();
       this._gui.style.width = this.options.width + "px";

       var parent = $(richTextEditor._id + '_palette');
       parent.appendChild(this._gui);
       SimplePopupMenu.register(this);
   },
   
   _doFlushLeft: function(event) {
       this._richTextEditor._doFlushLeft(event);
       this.hide();
   },
   
   _doCentered: function(event) {
       this._richTextEditor._doCentered(event);
       this.hide();
   },
   
   _doFlushRight: function(event) {
       this._richTextEditor._doFlushRight(event);
       this.hide();
   }

} );

/** ================================================================================
 * 
 *   Class for generating the RTE menu for Bullets 
 *        [Numbered List]
 *        [Bulleted List]
 * 
 * 
 * ================================================================================ */
BulletMenu = Class.create();

BulletMenu.prototype = Object.extend( new SimplePopupMenu([]), {

   initialize: function( richTextEditor, options ) {
       
       this._richTextEditor = richTextEditor;
       this.setOptions(options);
       
       if  ( ! this.options.width )
           this.options.width = 90;
       if ( ! this.options.numberedListText )
           this.options.numberedListText = "Numbered List";
       if ( ! this.options.bulletedListText )
           this.options.bulletedListText = "Bulleted List";

       this._buttons = [];
       DhtmlButton.unselectableInIE = true;
       this._buttons[0] =  new DhtmlMenuButton( this.options.numberedListText, this._doNumberedList.bindAsEventListener(this));
       this._buttons[1] =  new DhtmlMenuButton( this.options.bulletedListText, this._doBulletedList.bindAsEventListener(this));
       DhtmlButton.unselectableInIE = false;
       this._createGUI();
       this._gui.style.width = this.options.width + "px";

       var parent = $(richTextEditor._id + '_palette');
       parent.appendChild(this._gui);
       SimplePopupMenu.register(this);
   },
   
   _doNumberedList: function(event) {
       this._richTextEditor._doNumberedList(event);
       this.hide();
   },
   
   _doBulletedList: function(event) {
       this._richTextEditor._doBulletedList(event);
       this.hide();
   }
} );

