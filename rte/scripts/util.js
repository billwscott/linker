<!--

// Detection for A-Grade browsers
var g_bABrowser = (window.XMLHttpRequest || window.ActiveXObject);

function GetWindowInnerHeight() {

    var nHeight = null;

    if(window.innerHeight) {
        
        nHeight = window.innerHeight;
        
    }
    else {
    
        if(document.compatMode) {
            nHeight = document.documentElement.clientHeight;
        }
        else {
            nHeight = document.body.clientHeight;
        }
    
    }
    
    return nHeight;

};

function classContains(o,cStr) {
    return (o.className?o.className.indexOf(cStr)+1:false);
};


function addClass(o,cStr) {
    if (classContains(o,cStr)) return false;
    o.className = (o.className?o.className+" ":"")+cStr;
};


function removeClass(o,cStr) {
    if (!classContains(o,cStr)) return false;
    o.className = o.className.replace(new RegExp("("+cStr+")|("+cStr+")","g"),""); 
};

function AddEventListener(p_oObject, p_sEvent, p_oFunction) {

    if(typeof g_bABrowser != "undefined"  && g_bABrowser) {

        if(p_oObject.attachEvent)
            p_oObject.attachEvent(("on" +p_sEvent), p_oFunction);
        else if(p_oObject.addEventListener)
            p_oObject.addEventListener(p_sEvent, p_oFunction, false);

    }
    
};

function RemoveEventListener(p_oObject, p_sEvent, p_oFunction) {

    if(p_oObject.detachEvent)
        p_oObject.detachEvent(("on" +p_sEvent), p_oFunction);
    else if(p_oObject.removeEventListener)
        p_oObject.removeEventListener(p_sEvent, p_oFunction, false);

};

function ToggleSelectsVisibility(p_sVisibility) {

    var aSelects = document.getElementsByTagName("select");
    
    if(aSelects.length && p_sVisibility)
    {
        var i = (aSelects.length-1);
        
        do {
            aSelects[i].style.visibility = p_sVisibility;
        }
        while(i--);
    }
};

function FormatFileSize(p_nSize) {

    var nSize = p_nSize;
    var nSizeLength = p_nSize.toString().length;
    var sSize = "";
    
    if(nSizeLength < 4)
        sSize = nSize + "B";
    else if(nSize < 1024000 && nSizeLength > 3 && nSizeLength < 7)
        sSize = Math.round((nSize/1000)) + "K";
    else
        sSize = Math.round((nSize/1000000),1) + "MB";

    return sSize;

};

function addStyleSheet(p_oDocument) {

	var oStyle = p_oDocument.createElement("STYLE");
	p_oDocument.getElementsByTagName("HEAD")[0].appendChild(oStyle);
	
    return document.all ? p_oDocument.styleSheets[p_oDocument.styleSheets.length-1] : oStyle;

};            

function addStylesheetRule(p_oStylesheet, p_sSelector, p_sStyles) {

	if(typeof p_oStylesheet.addRule != "undefined")
		p_oStylesheet.addRule(p_sSelector, p_sStyles);
	else {
        var oRule = document.createTextNode(p_sSelector + "{" + p_sStyles + "}");
        p_oStylesheet.appendChild(oRule);
	}
};

function associateObjWithEvent(p_oObject, p_sMethodName) {
    return (function(p_oEvent){
        return p_oObject[p_sMethodName](p_oEvent);
    });
};


function Collection() {

    this.count = 0;
    this.items = {};

};

Collection.prototype.add = function(p_sKey, p_oObject) {
    
    if(!this.items[p_sKey]) {
        this.items[p_sKey] = p_oObject;
        this.count++;   
    }
    
};

Collection.prototype.remove = function(p_sKey) {

    if(this.items[p_sKey]) {
        delete this.items[p_sKey];
        this.count--;
    }
    
};


// An array of function to be called by CallDOMLoadedHandlers
var g_aDOMLoadedHandlers = [];

function AddDOMLoadedHandler(p_oFunction) {
    g_aDOMLoadedHandlers[g_aDOMLoadedHandlers.length] = p_oFunction;
}

/*
    Because the onload event for the window object can be unreliable, a call to 
    CallDOMLoadedHandlers is added to the document just after the closing tag 
    for the BODY. 
*/

function CallDOMLoadedHandlers() {

    for (var i = 0; i < g_aDOMLoadedHandlers.length; i++) {
        g_aDOMLoadedHandlers[i]();
    }

};


StandardModuleManager.prototype = new Collection();
StandardModuleManager.prototype.constructor = StandardModuleManager;

function StandardModuleManager() {

    this.idPrefix = "standardmodule";
    this.idCounter = 0;

};

StandardModuleManager.prototype.createId = function() {

    this.idCounter++;

    return (this.idPrefix+this.idCounter);

};

var g_oStandardModuleManager = new StandardModuleManager();

var g_oButtonManager = new Collection();


// Creates a standard module container according to the format recommended by the 
// platform team: http://twiki.corp.yahoo.com/view/Devel/StandardModuleFormat

function StandardModule(p_sId) {

    if(p_sId) {
        this.init(p_sId);
    }
    
};

StandardModule.prototype.init = function(p_sId) {

    this.id = p_sId;

    var oDIV = document.createElement("div");

    var oModule = oDIV.cloneNode(true);
    oModule.id = p_sId;
    
    var oHead = oDIV.cloneNode(true);
    oHead.className = "hd";
    oModule.appendChild(oHead);
                    
    var oBody = oDIV.cloneNode(true);
    oBody.className = "bd";
    oModule.appendChild(oBody);
    
    var oFoot = oDIV.cloneNode(true);
    oFoot.className = "ft";
    oModule.appendChild(oFoot);
    
    document.body.appendChild(oModule);
    
    g_oStandardModuleManager.add(this.id, this);

};

StandardModule.prototype.getChildNode = function(p_nIndex) {
    
    var oModule = document.getElementById(this.id);

    if(
        oModule.childNodes[p_nIndex] &&
        oModule.childNodes[p_nIndex].nodeType == 1
    )
        oNode = oModule.childNodes[p_nIndex];
    else
        oNode = oModule.childNodes[(p_nIndex+1)];
        
    return oNode;

};

StandardModule.prototype.getHeadNode = function() {

    return this.getChildNode(0);

};

StandardModule.prototype.getBodyNode = function() {

    return this.getChildNode(1);   

}

StandardModule.prototype.getFootNode = function() {

    return this.getChildNode(2);

};

StandardModule.prototype.setHeadHTML = function(p_sValue) {

    var oHead = this.getHeadNode();
    oHead.innerHTML = p_sValue;

};

StandardModule.prototype.setBodyHTML = function(p_sValue) {

    var oBody = this.getBodyNode();
    oBody.innerHTML = p_sValue;                

}; 

StandardModule.prototype.setFootHTML = function(p_sValue) {

    var oFoot = this.getFootNode();
    oFoot.innerHTML = p_sValue;                

};

// -->