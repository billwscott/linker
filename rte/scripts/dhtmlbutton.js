DhtmlButton = Class.create();

DhtmlButton.CAP_WIDTH     = 3;
DhtmlButton.HEIGHT        = 26;
DhtmlButton.LEFT_CAP_IMG  = 'url(http://us.i1.yimg.com/us.yimg.com/i/us/pim/dclient/d/img/md5/c67f651870c1f4655e8589f41ce866bf_1.gif)'; /* button_left_cap.gif */
DhtmlButton.MIDDLEBG_IMG  = 'url(http://us.i1.yimg.com/us.yimg.com/i/us/pim/dclient/d/img/md5/8e5cd6aa7849b1d52a425790043dd4d7_1.gif)'; /* img/button_bg.gif */
DhtmlButton.RIGHT_CAP_IMG = 'url(http://us.i1.yimg.com/us.yimg.com/i/us/pim/dclient/d/img/md5/63865d7062fd36bee36b1603746e898a_1.gif)'; /* button_right_cap.gif */
DhtmlButton.NORMAL        = 0;
DhtmlButton.HOVER         = 1;
DhtmlButton.CLICK         = 2;
DhtmlButton.unselectableInIE  = false;
DhtmlButton.offscreenSizer = null;

function DhtmlButtonEmptyFunction() {}

DhtmlButton.prototype = {
  
     initialize: function( text, action, imgData, iconPaddingDecrement ) {

         var isIE = navigator.userAgent.toLowerCase().indexOf("msie") != -1;
         this._isIE5 = false;
         if ( isIE ) {
            var agentString =  navigator.userAgent.toLowerCase();
            var start = agentString.indexOf("msie") + 5;
            var version = parseFloat( agentString.substring( start, start+3) );
            this._isIE5 = (version > 4.0 && version < 6.0 )
         }
         
         
         // icon for the button.....
         this._imgData = null;
         if ( arguments.length >= 3 )
             this._imgData = imgData;
         this._iconPaddingDecrement = 0;
         if ( arguments.length == 4 )
             this._iconPaddingDecrement = iconPaddingDecrement;
         
         this._label      = text;
         this._action     = action;
         this._fsLeftCap  = new FilmStripImageData( DhtmlButton.LEFT_CAP_IMG, DhtmlButton.NORMAL, 
                                                    DhtmlButton.CAP_WIDTH, DhtmlButton.HEIGHT, false );
         this._fsLabel    = new FilmStripImageData( DhtmlButton.MIDDLEBG_IMG, DhtmlButton.NORMAL, 
                                                    DhtmlButton.CAP_WIDTH, DhtmlButton.HEIGHT, false, true );
         this._fsRightCap = new FilmStripImageData( DhtmlButton.RIGHT_CAP_IMG, DhtmlButton.NORMAL, 
                                                    DhtmlButton.CAP_WIDTH, DhtmlButton.HEIGHT, false );
         this._gui        = this.createGUI();
     },
     
     hide: function() {
         this._gui.style.visibility = 'hidden';
     },
     
     show: function() {
         this._gui.style.visibility = 'visible';
     },
     
     getGUI: function() {
         return this._gui;
     },
     
     setText: function(text) {
         this._label = text;
         this._labelCell.innerHTML = text;
     },
     
     setAction: function(anAction) {
         this._action = anAction;
     },
     
     setPreferredWidth: function() {
         this._gui.style.width = this._getPreferredWidth() + "px";
     },
     
     _getPreferredWidth: function() {
         var iconWidth = 0;
         if (  this._imgData != null )
             iconWidth = this._imgData.width;
         
         var sizer = this._getOffscreenSizer();
         sizer.innerHTML = this._label;

         return sizer.offsetWidth + iconWidth + 7;
     },
     
     _getOffscreenSizer: function() {
         if ( DhtmlButton.offscreenSizer == null ) {
             var sizer = document.createElement("<nobr>");
             sizer.className    = 'DhtmlButtonText';
             sizer.style.overflow   = 'auto';
             sizer.style.position   = 'absolute';
             sizer.style.visibility = 'hidden';   
             sizer.style.top        = '-9999px';  
             sizer.style.left       = '-9999px';
             document.body.appendChild(sizer);
             DhtmlButton.offscreenSizer = sizer;
         }
         
         return DhtmlButton.offscreenSizer;
     },
     
     createGUI: function() {
         
         var table = this._createTable();

         if ( this._imgData != null ) {
             var innerTable = this._createInnerTable();
             this._imgData.setElementStyle(this._iconCell);
             if ( this._iconPaddingDecrement != 0 )
                 this._iconCell.style.width = (this._imgData.width - this._iconPaddingDecrement) + "px"; 
             this._middleCell.appendChild(innerTable);
         }
         else
             this._labelCell = this._middleCell;
         
         this._labelCell.className = 'DhtmlButtonText';
         this._labelCell.innerHTML = this._label;
         
         // apply the styles for the button & button caps...
         this._fsLeftCap.setElementStyle(this._leftCap);
         this._fsLabel.setElementStyle(this._middleCell);
         this._fsRightCap.setElementStyle(this._rightCap);
         
         // hookup events...
         table.onmouseover = this.handleMouseOver.bindAsEventListener(this);
         table.onmouseout  = this.handleMouseOut.bindAsEventListener(this);
         table.onmousedown = this.handleMouseDown.bindAsEventListener(this);
         table.onmouseup   = this.handleMouseUp.bindAsEventListener(this);
         table.onclick     = this.handleClick.bindAsEventListener(this);
         
         return table;
     },
     
     _updateButtonGUI: function(inset) {
         
         this._fsLeftCap.setElementBgPosition(this._leftCap);
         this._fsLabel.setElementBgPosition(this._middleCell);
         this._fsRightCap.setElementBgPosition(this._rightCap);
         
         if ( inset ) {
             this._middleCell.style.paddingLeft = '1px';
             this._middleCell.style.paddingTop = '1px';
         }
         else {
             this._middleCell.style.paddingLeft = '0px';
             this._middleCell.style.paddingTop = '0px';
         }
         
         
     },
     
     _createTable: function() {
         
         var table = this._createTableImpl();
         table.className   = 'dhtmlButton'
         table.cellSpacing = 0;
         table.cellPadding = 0;
         table.border      = 0;
         table.tabIndex    = 0;
         table.hideFocus   = true;
         table.style.tableLayout = 'fixed';
         table.style.cursor  = this._isIE5 ? 'hand' : 'pointer';
         table.onselectstart = function() { return false; };
         table.onkeydown = this.handleKeyDown.bindAsEventListener(this);
         table.onfocus   = this.handleFocus.bindAsEventListener(this);
         table.onblur    = this.handleBlur.bindAsEventListener(this);
         
         var tBody = document.createElement("tbody");
         var tRow  = document.createElement("tr");
         table.appendChild(tBody);
         tBody.appendChild(tRow);

         this._leftCap    = this._createTableCell();
         this._middleCell = this._createTableCell();
         this._rightCap   = this._createTableCell();
         
         tRow.appendChild(this._leftCap);
         tRow.appendChild(this._middleCell);
         tRow.appendChild(this._rightCap);
         
         return table;
     },
     
     _createTableImpl: function() {
         var isIE =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;
         return isIE && DhtmlButton.unselectableInIE ?
             table = document.createElement("<table unselectable='on'>") :
             table = document.createElement("table");
     },
     
     _createTableCell: function() {
         var isIE =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;
         return isIE && DhtmlButton.unselectableInIE ? 
                 document.createElement("<td unselectable='on'>") : 
                 document.createElement("td");
     },
     
     // for accessibility...
     handleKeyDown: function(e) {
         var kEnterKey = 13;
         if ( e.keyCode == 13 )
             this.handleClick(e);
     },
     
     handleFocus: function(e) {
         this.hasFocus = true;
         this.handleMouseOver(e);
     },
     
     handleBlur: function(e) {
         this.hasFocus = false;
         this.handleMouseOut(e);
     },
     
     _createInnerTable: function() {
         var table = this._createTableImpl();
         table.cellSpacing = 0;
         table.cellPadding = 0;
         table.border = 0;
         table.style.tableLayout = 'fixed';
         table.onselectstart = function() { return false; };
         
         var tBody = document.createElement("tbody");
         var tRow  = document.createElement("tr");
         table.appendChild(tBody);
         tBody.appendChild(tRow);
         
         this._iconCell  = this._createTableCell();
         this._labelCell = this._createTableCell();
         tRow.appendChild(this._iconCell);
         tRow.appendChild(this._labelCell);
         
         return table;
     },

     handleMouseOver: function(e) {
         
         var n = DhtmlButton.HOVER;
         
         this._fsLeftCap.setIndex(n);
         this._fsLabel.setIndex(n);
         this._fsRightCap.setIndex(n);
         this._updateButtonGUI();
     },

     handleMouseOut: function(e) {
         
         /* dont want to remove the hover affect if we're focused,
          * because we wouldn't visually be able to tell that a
          * press of the enter key would cause the click action to
          * occur...
          */
         if ( this.hasFocus )
             return;
         
         this._fsLeftCap.setIndex(DhtmlButton.NORMAL);
         this._fsLabel.setIndex(DhtmlButton.NORMAL);
         this._fsRightCap.setIndex(DhtmlButton.NORMAL);
         this._updateButtonGUI(false);
     },

     handleMouseDown: function(e) {
         this._fsLeftCap.setIndex(DhtmlButton.CLICK);
         this._fsLabel.setIndex(DhtmlButton.CLICK);
         this._fsRightCap.setIndex(DhtmlButton.CLICK);
         this._updateButtonGUI(true);
     },

     handleMouseUp: function(e) {
         this.handleMouseOver(e);
     },

     handleClick: function(e){
         if ( this._action )
             this._action(e);
     },
     
     /**
      * For memory cleanup garbage collection...
      * Call when the button is no longer part of the UI
      */
     cleanup: function() {
         this._gui.onmouseover = DhtmlButtonEmptyFunction;
         this._gui.onmouseout  = DhtmlButtonEmptyFunction;
         this._gui.onmousedown = DhtmlButtonEmptyFunction;
         this._gui.onmouseup   = DhtmlButtonEmptyFunction;
         this._gui.onclick     = DhtmlButtonEmptyFunction;
         this._gui.onkeydown   = DhtmlButtonEmptyFunction;
         this._gui.onfocus     = DhtmlButtonEmptyFunction;
         this._gui.onblur      = DhtmlButtonEmptyFunction;
     }
};


DhtmlMenuButton = Class.create();

DhtmlMenuButton.STYLE_CLASS = "dhtmlMenuButton";

DhtmlMenuButton.prototype = {
  
   initialize: function( text, action ) {
       this._label   = text;
       this._action = action;

       var isIE = navigator.userAgent.toLowerCase().indexOf("msie") != -1;
       this._isIE5 = false;
       if ( isIE ) {
          var agentString =  navigator.userAgent.toLowerCase();
          var start = agentString.indexOf("msie") + 5;
          var version = parseFloat( agentString.substring( start, start+3) );
          this._isIE5 = (version > 4.0 && version < 6.0 )
       }
       
       this._gui = this._createGUI();
   },

   hide: function() {
       this._gui.style.visibility = 'hidden';
   },
   
   show: function() {
       this._gui.style.visibility = 'visible';
   },
   
   getGUI: function() {
       return this._gui;
   },

   setText: function(text) {
       this._label = text;
   },
   
   setAction: function(anAction) {
       this._action = anAction;
   },
   
   _createGUI: function() {

       var isIE =  navigator.userAgent.toLowerCase().indexOf("msie") != -1;
       var div = isIE ? document.createElement("<div unselectable='on'>") : document.createElement("div");
       div.className     = DhtmlMenuButton.STYLE_CLASS;
       div.style.cursor  = this._isIE5 ? 'hand' : 'pointer';
       div.innerHTML     = this._label;
       div.onmouseover   = this.handleMouseOver.bindAsEventListener(this);
       div.onmouseout    = this.handleMouseOut.bindAsEventListener(this);
       div.onclick       = this.handleClick.bindAsEventListener(this);
       div.onselectstart = function() { return false; };
       div.onkeydown     = this.handleKeyDown.bindAsEventListener(this);
       div.onfocus       = this.handleFocus.bindAsEventListener(this);
       div.onblur        = this.handleBlur.bindAsEventListener(this);

       return div;
   },
   
   handleMouseOver: function(e) {
       this._gui.className = DhtmlMenuButton.STYLE_CLASS + "_over";
   },
   
   handleMouseOut: function(e) {

       if ( this.hasFocus )
           return;

       this._gui.className = DhtmlMenuButton.STYLE_CLASS;
   },
   
   handleClick: function(e) {
       if ( this._action )
           this._action(e);
   },
   
   handleKeyDown: function(e) {
       var kEnterKey = 13;
       if ( e.keyCode == 13 )
           this.handleClick(e);
   },

   handleFocus: function(e) {
       this.hasFocus = true;
       this.handleMouseOver(e);
   },
   
   handleBlur: function(e) {
       this.hasFocus = false;
       this.handleMouseOut(e);
   },
   
   /**
    * For memory cleanup garbage collection...
    * Call when the button is no longer part of the UI
    */
   cleanup: function() {
       this._gui.onmouseover = DhtmlButtonEmptyFunction;
       this._gui.onmouseout  = DhtmlButtonEmptyFunction;
       this._gui.onclick     = DhtmlButtonEmptyFunction;
       this._gui.onkeydown   = DhtmlButtonEmptyFunction;
       this._gui.onfocus     = DhtmlButtonEmptyFunction;
       this._gui.onblur      = DhtmlButtonEmptyFunction;
   }
};




