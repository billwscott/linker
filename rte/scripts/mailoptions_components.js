ListEditor = Class.create();

/**
 * Adds editable list behaivors to an assumed HTML structure of 
 * a scrollable div containing a <UL> within it and a text field
 * and 2 buttons to provide add/delete capability...
 */
ListEditor.prototype = {
  
    initialize: function( panelIndex, anId, options ) {
        
        this.panelIndex = panelIndex;
        this.setOptions(options);
        this.selectedIndex = -1;
        this.numItems      = 0;
        this.listComponent = $(anId+'_list');
        this.listItems     = null;
        if ( ! this.options.supressadd ) {
            this.textComponent = $(anId+'_text');
            this.addButton     = $(anId+'_add');
        }
        this.removeButton  = $(anId+'_remove');
        this.scroller      = $(anId+'_scroller');
        this.dynamicLabel  = $(anId+'_label');
        this.hiddenField   = $(anId+'_hidden');
        this.focused       = false;
        this._hookupSelectionEvents();
        this._hookupEvents();

        if ( this.numItems > 0 ) {
            this.selectedIndex = 0;
            this.updateSelection();
        }

        if ( !MailOptions.Util.isIE() )
            this.listComponent.style.display = 'inline';
        
        if ( this.options.onload )
            this.options.onload(this);
    },

    setOptions: function(options) {
        this.options = {
           onadd       : null,
           onremove    : null,
           onvalidate  : null,
           onload      : null,
           limit       : null
        };
        Object.extend(this.options, options || {});
    },
    
    deselect: function(n) {
        var li = this.listItems[n];
        li.className = 'mailoptions_listEditorLine';
        this.selectedIndex = 0;
    },
    
    select: function(n) {
        var li = this.listItems[n];
        var selectClassName = this.focused ? 'selectedListItem' : 'secondarySelectedListItem';
        li.className = 'mailoptions_listEditorLine ' + selectClassName;
        this.selectedIndex = n;
    },
    
    setDynamicLabel: function(str) {
        this.dynamicLabel.innerHTML = str;
    },
    
    updateSelection: function() {
        if ( this.selectedIndex == -1 )
            return;
        this.select(this.selectedIndex);
    },
    
    /* 0 == valid, any other return value is an error message... */
    validate: function(textValue) {
        if ( this.options.onvalidate )
            return this.options.onvalidate(this,textValue);
        return 0;
    },
    
    addItemFromText: function() {
        
        var textValue = this.textComponent.value;
        if ( textValue == null || textValue == "" )
            return;
        
        var validated= this.validate(textValue);
        if ( validated != 0 ) {
            alert(validated);
            return;
        }
        
        if ( this.numItems == 0 ) {
            this.scroller.style.display = '';
            this.removeButton.style.display = '';
        }
        
        // create a prototypical LI
        var newLi = document.createElement("li");
        newLi.onselectstart = function() { return false; };
        newLi.className = 'mailoptions_listEditorLine';
        newLi.innerHTML = textValue;
        this.listComponent.appendChild(newLi);
        newLi.scrollIntoView(false);
        
        this.updateHiddenValue( "add", textValue );
        
        // recreate the list item events
        this._hookupSelectionEvents();
        if ( this.selectedIndex >= 0 )
            this.deselect(this.selectedIndex);
        this.select( this.numItems - 1 );
        
        // clear the text field...
        this.textComponent.value = "";
        
        if ( this.options.onadd )
            this.options.onadd(this);
        
        if ( this.options.limit && (this.numItems == this.options.limit) )
            this.addButton.disabled = true;
        if ( this.numItems != 0 )
            this.removeButton.disabled = false;

    },
    
    updateHiddenValue: function (op, value) {
        var currentValue = this.hiddenField.value;
        var newValue = null;
        
        if ( op == "add" ) {
            newValue = currentValue + value + "|";
        }
        else if ( op == "delete" ) {
            // do delete stuff...
            var valueAsArray = currentValue.split("|");
            var newArray = [];
            var k = 0;
            for ( var i = 0 ; i < valueAsArray.length ; i++ )
                if ( i != value && (valueAsArray[i] != "") )
                    newArray[k++] = valueAsArray[i];
            newValue = newArray.join('|');
            if ( newValue && newValue.length > 0 && newValue[newValue.length-1] != '|' )
                newValue += '|';
        }

        // set the new value...
        this.hiddenField.value = newValue;
        
        // tell the panel that it's dirty dirty...
        var panel = MailOptions.MailOptionsPage.getInstance().panels[this.panelIndex];
        panel.setDirty(true);
    },
    
    removeSelectedItem: function() {

        if ( this.numItems == 0 )
            return;
        
        if ( !(this.selectedIndex >= 0 && this.selectedIndex < this.numItems ) )
            return;
        
        var li = this.listItems[this.selectedIndex];
        li.onclick = null;
        this.listComponent.removeChild(li);
        this._hookupSelectionEvents();
        
        this.updateHiddenValue( "delete", this.selectedIndex )

        if ( this.numItems == 0 ) {
            this.scroller.style.display = 'none';
            this.removeButton.style.display = 'none';
        }
        
        if ( this.selectedIndex >= this.numItems )
            this.selectedIndex = this.numItems - 1;
        this.updateSelection();

        if ( this.options.onremove )
            this.options.onremove(this);

        if ( this.options.limit && (this.numItems < this.options.limit) ) {
            if ( !this.options.supressadd )
                this.addButton.disabled = false;
        }
        if ( this.numItems == 0 )
            this.removeButton.disabled = true;

    },
    
    _listFocused: function() {
        this.focused = true;
        this.updateSelection();
    },
    
    _listBlurred: function() {
        this.focused = false;
        this.updateSelection();
    },
    
    _listItemSelected: function(n) {
        if ( this.selectedIndex != n && this.selectedIndex != -1 )
            this.deselect(this.selectedIndex);
        //this.focused = true;
        this.select(n);
    },
    
    
    _hookupSelectionEvents: function() {
        this.numItems = 0;
        this.listItems = this.listComponent.getElementsByTagName("li");
        if ( this.listItems && this.listItems.length > 0 ) {
            this.numItems = this.listItems.length;
            for ( var i = 0 ; i < this.listItems.length ; i++ )
                this.listItems[i].onclick = this._buildSelectionClosure(i);
        }
    },
    
    _buildSelectionClosure: function(i) {
        var oThis = this;
        return function() { oThis._listItemSelected(i); };
    },

    _hookupEvents: function() {
        if ( !this.options.supressadd ) {    
            this.addButton.onclick       = this.addItemFromText.bind(this);
            this.textComponent.onkeydown = this._textKeyDown.bindAsEventListener(this);
        }
        
        this.removeButton.onclick    = this.removeSelectedItem.bind(this);
        this.scroller.onkeydown      = this._scrollerKeyDown.bindAsEventListener(this);
        this.scroller.onfocus        = this._listFocused.bind(this);
        this.scroller.onblur         = this._listBlurred.bind(this);
    },
    
    _previous: function() {
        if ( this.selectedIndex > 0 ) {
            var saveIndex = this.selectedIndex;
            this.deselect(this.selectedIndex);
            this.select(saveIndex-1);
            this.listItems[this.selectedIndex].scrollIntoView(true);
            return true
        }
        return false;
    },
    
    _next: function() {
        if ( this.selectedIndex < (this.numItems-1) ) {
            var saveIndex = this.selectedIndex;
            this.deselect(this.selectedIndex);
            this.select(saveIndex+1);
            this.listItems[this.selectedIndex].scrollIntoView(false);
            return true;
        }
        return false;
    },
    
    _textKeyDown: function(e) {
        if ( e.keyCode == 13 ) {
            setTimeout( this.addItemFromText.bind(this), 10 );
            return false; /* prevent submit on IE */
        }
    },
    
    _scrollerKeyDown: function(e) {
        var keyUp   = 38;
        var keyDown = 40;
        var handled = false;
        if ( e.keyCode == keyUp )
            handled = this._previous();
        else if ( e.keyCode == keyDown )
            handled = this._next();
        
        if ( handled ) {
            if ( e.preventDefault )
                e.preventDefault();
            return false;
        }
    }
        
};


ShowConfirmEditor = Class.create();


ShowConfirmEditor.prototype = {
  
        
   initialize: function(n, name) {
       this.checkbox           = $( n + '_' + name);
       this.everyMsgRadio      = $( n + '_' + name + '_0'); 
       this.newRecipientsRadio = $( n + '_' + name + '_1');
       this.labels = [];
       this.labels[0] = $( n + '_' + name + '_0_label' );
       this.labels[1] = $( n + '_' + name + '_1_label' );
       
       this.checkbox.onclick           = this.updateRadioStyle.bind(this);
       this.everyMsgRadio.onclick      = this.radioClicked.bind(this);
       this.newRecipientsRadio.onclick = this.radioClicked.bind(this);
       
       this.updateRadioStyle();
       
   },
   
   updateRadioStyle: function() {
       if ( this.checkbox.checked ) {
           this.labels[0].style.color = '#000000';
           this.labels[1].style.color = '#000000';
       }
       else {
           this.labels[0].style.color = '#aaaaaa';
           this.labels[1].style.color = '#aaaaaa';
       }
   },
      
   radioClicked: function() {
       if ( this.everyMsgRadio.checked || this.newRecipientsRadio.checked ) {
           this.checkbox.checked = true;
           this.updateRadioStyle();
       }
   }
        
};

/**
 * Class is responsible for marking the panel dirty when a select 
 * box changes and ensuring that the number of days in the day
 * box is appropriate for the month/year combination...
 */
DatePicker = Class.create();

DatePicker.DAY_MAP = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

DatePicker.prototype = {
        
        initialize: function( index, name ) {
            this.panelIndex = index;

            this.monthBox = $( index + "_" + name + "_month" );
            this.dayBox   = $( index + "_" + name + "_day"   );
            this.yearBox  = $( index + "_" + name + "_year"  );
            
            this.monthBox.onchange = this.monthChanged.bind(this);
            this.dayBox.onchange   = this.dirty.bind(this);
            this.yearBox.onchange  = this.yearChanged.bind(this);
            this.monthChanged(false);
        },

        dirty: function() {
            // tell the panel that it's dirty dirty...
            var panel = MailOptions.MailOptionsPage.getInstance().panels[this.panelIndex];
            panel.setDirty(true);
        },
        
        monthChanged: function( makeDirty ) {
            
            if ( arguments.length == 0 )
                makeDirty = true;
            
            if ( makeDirty )
                this.dirty();
            
            var month   = parseInt(this.monthBox.value);
            var numDaysToShow = DatePicker.DAY_MAP[month-1];
            if ( month == 2 && this.isLeapYear() )
                numDaysToShow++;

            if ( numDaysToShow < this.dayBox.options.length ) {
                this.dayBox.options.length = numDaysToShow;
            }
            else if ( numDaysToShow > this.dayBox.options.length ){
                var start = this.dayBox.options.length;
                for ( var i = start ; i < numDaysToShow ; i++ ) {
                    var newOpt = document.createElement("option");
                    newOpt.value = i+1;
                    newOpt.innerHTML = i+1;
                    this.dayBox.appendChild(newOpt);
                 }
            }
        },
        
        yearChanged: function() {
            this.dirty();
            var month   = parseInt(this.monthBox.value);
            if ( month == 2 )
                this.monthChanged(false); /* force leap year recalc */
        },
        
        isLeapYear: function() {
            var year = parseInt(this.yearBox.value);
            if( year % 4 == 0 ) {
                if( year % 100 != 0 )
                    return true;
                else
                    return year % 400 == 0 ? true : false;
            }
            return false;
        }
};

/**
 *  Example Usage:
 *  
 *     # style a div with the 4th icon in the folder_icons film-strip
 *  
 *     var imgData = FilmStripImageData.folderIcons(3);
 *     var iconDiv = document.createElement("div");
 *     imgData.setElementStyle(iconDiv);
 *     
 *     -or-
 *     
 *     var imgData = FilmStripImageData.folderIcons(3);
 *     var html = "<div style='" + imgData.getStyleHTML() + "'>";
 *   
 */
FilmStripImageData = Class.create();


FilmStripImageData.clone = function(other) {
    return new FilmStripImageData( other.filmstripUrl, 
                                   other.filmstripIndex,
                                   other.width,
                                   other.height,
                                   other.horizontal,
                                   other.repeat );
}


FilmStripImageData.prototype = {
    
    initialize: function( url, index, w, h, horizontal, repeat ) {
        this.filmstripUrl   = url;
        this.filmstripIndex = index;
        this.width          = w;
        this.height         = h;
        
        this.horizontal = true;
        this.repeat     = false;
        
        if ( arguments.length >= 5 )
            this.horizontal = horizontal;
        if ( arguments.length == 6 )
            this.repeat = repeat;
        
    },
    
    setIndex: function( anIndex ) {
        this.filmstripIndex = anIndex;
    },
    
    createImageElement: function() {
        var div = document.createElement("div");
        this.setElementStyle(div);
        return div;
    },
    
    /**
     * Set the style of the element based on the
     * data we are constructed with...
     * note: this assumes that anElement is NOT an inline element
     */
    setElementStyle: function(anElement) {
        
        if ( this.horizontal ) {
            anElement.style.width = this.width + "px";
            if ( !this.repeat )
                anElement.style.height = this.height + "px";
        }
        else {
            anElement.style.height = this.height   + "px";
            if ( !this.repeat )
                anElement.style.width = this.width + "px";
        }
        
        anElement.style.backgroundImage = this.filmstripUrl;
        this.setElementBgPosition(anElement);
        anElement.style.backgroundRepeat = this.repeat ? (this.horizontal ? "repeat-y" : "repeat-x" ) : "no-repeat";
    },

    /**
     * Only set the background image position style attribute, assuming
     * all widths/heights and background repeat attrs have already been
     * applied...
     */
    setElementBgPosition: function(anElement) {
        if ( this.horizontal )
            anElement.style.backgroundPosition = (this.width * - this.filmstripIndex) + "px 0px";
        else
            anElement.style.backgroundPosition = "0px " + (this.height * - this.filmstripIndex) + "px";
    },
    
    /**
     * Produce a string appropriate to be used as the content of
     * the style attribute of a non-inline HTML element...
     */
    getStyleHTML: function() {
        
        var sizeStr = "";
        if ( this.horizontal ) {
            sizeStr = "width:"  + this.width  + "px;";
            if ( !this.repeat )
                sizeStr += "height:" + this.height + "px;"
        }
        else {
            sizeStr = "height:" + this.height + "px;"
            if ( !this.repeat )
                sizeStr += "width:"  + this.width  + "px;";
        }

        var bgPosition;
        if ( this.horizontal )
            bgPosition = "background-position:" + (this.width * -this.filmstripIndex) + "px 0px;";
        else
            bgPosition = "background-position:0px " + (this.height * - this.filmstripIndex) + "px;";
        
        var repeatStr = this.repeat ? (this.horizontal ? "repeat-y" : "repeat-x" ) : "no-repeat";
        
        return sizeStr + 
               "background-image:" + this.filmstripUrl + ";" +
               bgPosition + 
               "background-repeat:" + repeatStr;
    }
    
}

SignatureSwitch = Class.create();

SignatureSwitch.prototype = {
  
    initialize: function( name, panelIndex, isRich, plainLinkText, richLinkText ) {
        this.isRichText    = isRich;
        this.plainLinkText = plainLinkText;
        this.richLinkText  = richLinkText;
        this.panelIndex    = panelIndex;
        this.name          = name;
        
        this.switchLink         = $(name+'_switchLink');
        this.plainTextContainer = $(name+'_plainTextContainer');
        this.richTextContainer  = $(name+'_richTextContainer');
        this.typeField          = $(name+'_type');
        this.richTextHidden     = $( panelIndex + '_' + name+ '_text' );
        this.plainTextField     = $( panelIndex + '_' + name );
        
        this.switchLink.onclick = this.toggleRichText.bindAsEventListener(this);
    },
    
    toggleRichText: function(event) {

        this.switchLink.innerHTML = this.isRichText ? this.richLinkText : this.plainLinkText;
        if ( this.isRichText ) {
            this.richTextContainer.style.display  = 'none';
            this.plainTextContainer.style.display = '';
            
            this.plainTextField.value = this.convertHtmlToPlainText();
        }
        else {
            this.richTextContainer.style.display  = '';
            this.plainTextContainer.style.display = 'none';

            /* can't initialize until it's visible ! */
            if ( this.rtEditor && !this.rtEditor._editorDocument )
                this.rtEditor.initializeDocument();
            
            // copy whatever has been entered in here over to the RT editor 
            var plainTextValue = this.convertPlainTextToHtml();
            this.rtEditor.setContent( plainTextValue );
            this.richTextHidden = plainTextValue;

            // on FF we have to defer the enabling/disabling of the RTE to
            // the point when it's actually visible... this achieves that.
            if ( ! MailOptions.Util.isIE() )
                MailOptions.Util.updateSignature(this.panelIndex,this.name,true);
        }
        
        this.isRichText = ! this.isRichText;
        this.typeField.value = this.isRichText ? 'dhtml' : 'plain';
    },
    
    convertPlainTextToHtml: function() {
        var plainText = this.plainTextField.value;
        plainText = plainText.replace( /\r\n/g, "<br/>" );
        plainText = plainText.replace( /\n/g,   "<br/>" );
        return plainText;
    },
    
    convertHtmlToPlainText: function(element) {
        
        if ( arguments.length == 0 ) {
            if ( !this.rtEditor || this.rtEditor._editorDocument == null )
                return "";
            element = this.rtEditor._editorDocument.body;
        }
        
        var innerText = element.innerText;
        if ( innerText != null )
            return innerText;

        var nodeType = element.nodeType;
        var numChildren = element.childNodes.length;

        if ( nodeType == element.ELEMENT_NODE && numChildren == 1 && 
             element.firstChild.nodeType == element.TEXT_NODE )
            return element.firstChild.nodeValue;

        // primitive nodes...
        if ( (nodeType == element.TEXT_NODE ||
              nodeType == element.ATTRIBUTE_NODE ||
              nodeType == element.CDATA_SECTION_NODE) && element.nodeValue != null ) {
            return element.nodeValue;
        }

        if ( nodeType == element.COMMENT_NODE || numChildren == 0 )
            return "";

        var contents = [];
        var newlineStr = "";
        for ( var i=0, elNodes=element.childNodes; i<numChildren; ++i ) {
      
            newlineStr = (elNodes[i].tagName == "DIV" || elNodes[i].tagName == "P" ||
                          elNodes[i].tagName == "BR") ? '\r\n' : '';
            contents[contents.length] = this.convertHtmlToPlainText (elNodes[i]) + newlineStr;
        }
        return contents.join("");
        
    },
    
    setRichTextEditor: function( rtEditor ) {
        this.rtEditor = rtEditor;
    }
        
};

function vacationResponseToggleInit( panelIndex, optionName ) {
    var checkbox = $(panelIndex + "_" + optionName)
    
    var toggleClosure = function() { toggleVacationResponseUI( checkbox, panelIndex, optionName ); }; 
    checkbox.onclick =  toggleClosure;
    setTimeout( toggleClosure, 1000 );
}

function toggleVacationResponseUI( checkBox, panelIndex, optionName ) {
    if ( checkBox.checked ) {
        $( panelIndex + "_vrStartDate_container" ).style.display = '';
        $( panelIndex + "_vrEndDate_container"   ).style.display = '';
        //$( panelIndex + "_vrSubject"             ).parentNode.parentNode.style.display = '';
        //$( panelIndex + "_vrSubject_topLabel"    ).style.display = '';
        $( panelIndex + "_vrMessage"             ).style.display = '';
        $( panelIndex + "_vrMessage_topLabel"    ).style.display = '';
        $( panelIndex + "_vrSampleToInbox"       ).parentNode.style.display = '';
    }
    else {
        $( panelIndex + "_vrStartDate_container" ).style.display = 'none';
        $( panelIndex + "_vrEndDate_container"   ).style.display = 'none';
        //$( panelIndex + "_vrSubject"             ).parentNode.parentNode.style.display = 'none';
        //$( panelIndex + "_vrSubject_topLabel"    ).style.display = 'none';
        $( panelIndex + "_vrMessage"             ).style.display = 'none';
        $( panelIndex + "_vrMessage_topLabel"    ).style.display = 'none';
        $( panelIndex + "_vrSampleToInbox"       ).parentNode.style.display = 'none';
    }
}

/**
 * For Rich Text Editor, get's called before the editor content is 'saved', 
 * we use this to get the content of the editor and place it's value 
 * in a hidden field...
 * 
 */
function rtePrepareToSaveHandler( rte, panelIndex, optionName ) {
    MailOptions.MailOptionsPage.getInstance().cmdMgr.setMessage('prep.');
    var content = rte.getEditorContent();
    $( "" + panelIndex + "_" + optionName + "_text" ).value = content;
    return true;
}

/**
 *  mailoptions_strings.invalid_date_msg1  => The end date you selected is prior to the start date. Please correct the dates.     
 *  mailoptions_strings.invalid_date_msg2  => The start date you selected is prior to today. Please correct the dates.      
 *  mailoptions_strings.invalid_date_msg3  => The start and end dates you selected are prior to today. Please correct the dates.     
 *
 **/
function validateVacationDates( panelIndex, optionName ) {
    
    var vacationResponseOn = $(panelIndex + "_vrOn").checked;
    if ( !vacationResponseOn )
        return true; /* bypass validation of turning off VR */
    
    // get values from GUI for start date....
    var startYear  = $( panelIndex + "_vrStartDate_year").value;
    var startMonth = $( panelIndex + "_vrStartDate_month").value;
    var startDay   = $( panelIndex + "_vrStartDate_day").value;

    // get values from GUI for end date...
    var endYear  = $( panelIndex + "_vrEndDate_year").value;
    var endMonth = $( panelIndex + "_vrEndDate_month").value;
    var endDay   = $( panelIndex + "_vrEndDate_day").value;
    
    var todayRaw  = new Date();
    var today     = new Date( todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate() );
    var startDate = new Date( startYear, startMonth-1, startDay );
    var endDate   = new Date( endYear, endMonth-1, endDay );

    var isValid = false;
    if ( startDate.getTime() < today.getTime() && endDate.getTime() < today.getTime() )
        alert( mailoptions_strings.invalid_date_msg3 );
    else if ( startDate.getTime() < today.getTime() )
        alert( mailoptions_strings.invalid_date_msg2 );
    else if ( endDate.getTime() < startDate.getTime() )
        alert( mailoptions_strings.invalid_date_msg1 );
    else
        isValid = true;

    return isValid;
}

/**
 *  Replaces all occurrences of each variable name in the string with the appropriate
 *  value as specified by the arguments passed.  Each argument is of the form name=value.
 *  Name must be alphanumeric or underscore characters only.  Value can be anything.
 *
 *   "I %how_much% like %dessert%!".toMessage( "how_much=really", "dessert=Ice Cream" );
 *      result  =>  I really like Ice Cream!
 *
 *  There is a similar function in PHP - see toMessage()
 +*/
String.prototype.toMessage = function( /* arguments */ ) {
    
    if ( arguments.length == 0 )
       return this;

    var copyOfString = this;
    
  
    for ( var i = 0 ; i < arguments.length ; i++ ) {
       try {
            var curArg = arguments[i];
           var splitAt  = curArg.indexOf("=");
           var argName  = curArg.substring(0,splitAt);
           var argValue = curArg.substring(splitAt+1);

           var matchString = '%' + argName + '%';
           var matchIndex  = copyOfString.indexOf(matchString);
           var startIndex  = 0;
           while ( matchIndex != -1 ) {
               
               var endIndex = matchIndex + matchString.length;
               if ( endIndex == copyOfString.length ) {
                   copyOfString = copyOfString.substring(0, matchIndex) + argValue;
               }
               else {
                   var theChar = copyOfString.charAt(endIndex);
                   if ( ( theChar >= 'a' && theChar <= 'z' ) ||
                        ( theChar >= 'A' && theChar <= 'Z' ) ||
                        ( theChar >= '0' && theChar <= '9' ) ||
                        theChar == '_' ) {
                       startIndex = endIndex;
                   }
                   
                   var firstPart = copyOfString.substring(0, matchIndex);
                   var lastPart  = copyOfString.substring(matchIndex+matchString.length);
                   copyOfString  = firstPart + argValue + lastPart;
                   
               }
               matchIndex = copyOfString.indexOf(matchString,startIndex);
           }
       }
       catch(err) { 
           // silently ignore...
       }
    }
    

    return copyOfString;
}




