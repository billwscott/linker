/*
 * search-proto.js
 * Copyright (c) 2006, Yahoo! Inc. All rights reserved.
 */

function initKeyboardNavigation() {

    var _listItems = document.getElementById( "yschweb" ).getElementsByTagName( "LI" );
    var _selectedIndex = 0;

    function _getScrollTop() {
        if ( document.documentElement && typeof document.documentElement.scrollTop != "undefined" ) {
            return document.documentElement.scrollTop;
        } else {
            return document.body.scrollTop;
        }
    }

    function _setScrollTop( value ) {
        // This does not seem to work on Safari...
        if ( document.documentElement && typeof document.documentElement.scrollTop != "undefined" ) {
            document.documentElement.scrollTop = value;
        } else {
            document.body.scrollTop = value;
        }
    }

    function _scrollToSelectedElem() {
        var elem = _listItems[_selectedIndex];
        var y1 = YAHOO.util.Dom.getY( elem );
        var y2 = YAHOO.util.Dom.getY( elem ) + elem.offsetHeight;

        var scrollTop = _getScrollTop();
        var viewportHeight = YAHOO.util.Dom.getViewportHeight();

        /*alert( "y1: " + y1 +
               "\ny2: " + y2 +
               "\nscrollTop: " + scrollTop +
               "\nviewportHeight: " + viewportHeight );*/

        if ( y1 < scrollTop ) {
            _setScrollTop( Math.max( y1-5, 0 ) );
        } else if ( y2 > scrollTop + viewportHeight ) {
            _setScrollTop( y2 - viewportHeight + 5 );
        }
    }

    function _handleKeyDown( evt ) {

        switch ( evt.keyCode ) {

            case 13: // ENTER -> Navigate
                var anchor = _listItems[_selectedIndex].getElementsByTagName( "A" )[0];
                location.href = anchor.getAttribute( "href" );
                YAHOO.util.Event.stopEvent( evt );
                break;

            case 35: // End
                YAHOO.util.Dom.removeClass( _listItems[_selectedIndex], "on" );
                _selectedIndex = _listItems.length-1;
                YAHOO.util.Dom.addClass( _listItems[_selectedIndex], "on" );
                _scrollToSelectedElem();
                YAHOO.util.Event.stopEvent( evt );
                break;

            case 36: // Home
                YAHOO.util.Dom.removeClass( _listItems[_selectedIndex], "on" );
                _selectedIndex = 0;
                YAHOO.util.Dom.addClass( _listItems[_selectedIndex], "on" );
                _scrollToSelectedElem();
                YAHOO.util.Event.stopEvent( evt );
                break;

            case 37: // Left arrow
            case 38: // Up arrow
                YAHOO.util.Dom.removeClass( _listItems[_selectedIndex], "on" );
                _selectedIndex--; if ( _selectedIndex < 0 ) _selectedIndex = _listItems.length - 1;
                YAHOO.util.Dom.addClass( _listItems[_selectedIndex], "on" );
                _scrollToSelectedElem();
                YAHOO.util.Event.stopEvent( evt );
                break;

            case 39: // Right arrow
            case 40: // Down arrow
                YAHOO.util.Dom.removeClass( _listItems[_selectedIndex], "on" );
                _selectedIndex++; if ( _selectedIndex >= _listItems.length ) _selectedIndex = 0;
                YAHOO.util.Dom.addClass( _listItems[_selectedIndex], "on" );
                _scrollToSelectedElem();
                YAHOO.util.Event.stopEvent( evt );
                break;
        }
    }

    // Prevent the key strokes from scrolling the page.
    // We take care of the scrolling ourselves.
    function _handleKeyPress( evt ) {
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

    YAHOO.util.Event.addListener( document, "keydown", _handleKeyDown );
    YAHOO.util.Event.addListener( document, "keypress", _handleKeyPress );
}