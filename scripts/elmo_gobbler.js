YAHOO.namespace("elmo");
// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
// E L M O   G O B B L E R   U I
// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------

YAHOO.elmo.GobblerUI = function(response, interactionGroup, restPrefix, cfg) {
	YAHOO.elmo.GobblerUI.superclass.constructor.call(this, response, interactionGroup, restPrefix, cfg);
};

YAHOO.extend(YAHOO.elmo.GobblerUI, YAHOO.gobbler.GobblerUI);

YAHOO.elmo.GobblerUI.PROJECT_TITLE = "yahoo-gobbler-proj-title";		
YAHOO.elmo.GobblerUI.PROJECT_DIVIDER = "yahoo-gobbler-proj-divider";		
YAHOO.elmo.GobblerUI.SCRATCH_TITLE = "yahoo-gobbler-scratch-title";		
YAHOO.elmo.GobblerUI.SCRATCH_DIVIDER = "yahoo-gobbler-scratch-divider";		
YAHOO.elmo.GobblerUI.PROJECT_LINK_PREFIX = "yahoo-gobbler-proj-link-";
YAHOO.elmo.GobblerUI.PROJECT_LINK = "yahoo-gobbler-proj-link";
YAHOO.elmo.GobblerUI.CREATE_BUTTON = "yahoo-gobbler-create-button";
YAHOO.elmo.GobblerUI.CREATE_BUTTON_IMAGE_ID = "yahoo-gobbler-create-button-image";
YAHOO.elmo.GobblerUI.CREATE_BUTTON_IMAGE = "http://us.i1.yimg.com/us.yimg.com/i/us/tch/newproject-button.gif";
YAHOO.elmo.GobblerUI.DROP_CONTAINER = "yahoo-gobbler-drop-container";
YAHOO.elmo.GobblerUI.SCRATCH_CONTAINER = "yahoo-gobbler-scratch-container";
YAHOO.elmo.GobblerUI.PROJ_CONTAINER = "yahoo-gobbler-proj-container";
YAHOO.elmo.GobblerUI.SCRATCHPAD_LINK_ID = "yahoo-gobbler-scratchpad-link-id";
YAHOO.elmo.GobblerUI.SCRATCHPAD_LINK = "yahoo-gobbler-scratchpad-link";
YAHOO.elmo.GobblerUI.SCRATCHPAD = "yahoo-gobbler-scratchpad";
YAHOO.elmo.GobblerUI.SCRATCHPAD_DROP_INVITE = "yahoo-gobbler-scratchpad-dropinvite";
YAHOO.elmo.GobblerUI.PROJ_DROP_INVITE = "yahoo-gobbler-proj-dropinvite";
YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX = "yahoo-gobbler-drop-";
YAHOO.elmo.GobblerUI.TITLE_BAR_IMAGE = "http://us.i1.yimg.com/us.yimg.com/i/us/tch/gobbler-panel-title.gif";

// specific to Elmo Gobbler
YAHOO.elmo.GobblerUI.prototype.wireGobblerEvents = function(dropZones) {

	// Wire up drop zones
	for(i=0; i<dropZones.length; i++) {
		new YAHOO.util.DDTarget(dropZones[i], this.interactionGroup);
	}
	new YAHOO.util.DDTarget(YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX + "scratchpad", this.interactionGroup);
	this.response.collections[i].dropId = YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX + "scratchpad";

	// Create Button
	YAHOO.util.Event.addListener(YAHOO.elmo.GobblerUI.CREATE_BUTTON, "click", 
									this.createNewProject, this);
	
	// Add Site Links
	for(var i=0; i<dropZones.length; i++) {
		YAHOO.util.Event.addListener(YAHOO.elmo.GobblerUI.PROJECT_LINK_PREFIX + i, 
					"click", this.bookmarkSiteToProj, [this, dropZones[i]]);
	}
	YAHOO.util.Event.addListener(YAHOO.elmo.GobblerUI.SCRATCHPAD_LINK_ID, 
				"click", this.bookmarkSiteToProj, [this, YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX + "scratchpad"]);
	
};
	
YAHOO.elmo.GobblerUI.prototype.createPanelHeaderUI = function() {
		return '<img id="yahoo-elmo-gobbler-title" alt="@STAMP@" src="' + 
					YAHOO.elmo.GobblerUI.TITLE_BAR_IMAGE + '"/>';	
};

YAHOO.elmo.GobblerUI.prototype.createGobblerUI = function(inline, dropZones) {
		
	var projectInnerHTML = "";
	var addSiteLink = "<div style='height:5px;></div>'";
						
	for(var i=0; i<dropZones.length; i++) {
		if(!inline) {
			addSiteLink = '<a href="#" id="' + YAHOO.elmo.GobblerUI.PROJECT_LINK_PREFIX + i + 
						'" class="' + YAHOO.elmo.GobblerUI.PROJECT_LINK + '">(add this site)</a>';
		}
		var editUrl = this.getProjEditUrl(i);
		projectInnerHTML += '<div class="' + YAHOO.elmo.GobblerUI.PROJ_CONTAINER + '"><a id="' + 
						YAHOO.elmo.GobblerUI.PROJECT_TITLE + '-' + i + '" ' +
						'class="' + 
						YAHOO.elmo.GobblerUI.PROJECT_TITLE + '" href="' + 
						editUrl + 
						'">' + YAHOO.gobbler.Util.trunc(this.response.collections[i].title, 20) +
						'</a>' + 
						'<div ' + 
						'id="' + dropZones[i] + '" ' + 
						'class="' + YAHOO.elmo.GobblerUI.DROP_CONTAINER + '"' + 
						'>' + 
						'<div class="' + YAHOO.elmo.GobblerUI.PROJ_DROP_INVITE + '"></div>' + 
						'</div>' + 
						addSiteLink + 
				'<div class="' + YAHOO.elmo.GobblerUI.PROJECT_DIVIDER + '"></div>' + 
						'</div>';
	}
	
	var newButtonInnerHTML = 
				'<div class="create-new-container">' + 
				'<a id="' + YAHOO.elmo.GobblerUI.CREATE_BUTTON + '">' + 
				'<img id="' + YAHOO.elmo.GobblerUI.CREATE_BUTTON_IMAGE_ID + '" src="' + 
								YAHOO.elmo.GobblerUI.CREATE_BUTTON_IMAGE + '"></img>' + 
				'</a>' + 
				'</div>';
				
	var scratchpadInnerHTML = 
				'<div class="' + YAHOO.elmo.GobblerUI.SCRATCH_CONTAINER + '">' + 
				'<div class="' + YAHOO.elmo.GobblerUI.SCRATCH_DIVIDER + '"></div>' + 
				'<span class="' + YAHOO.elmo.GobblerUI.SCRATCH_TITLE + '">Scratchpad</span>' + 
				'<div id="' + YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX + 'scratchpad" ' + 
				'class="' + YAHOO.elmo.GobblerUI.SCRATCHPAD + '">' + 
				'<div class="' + YAHOO.elmo.GobblerUI.SCRATCHPAD_DROP_INVITE + '">' + 
				'</div>' + 
				'</div>' + 
				'<a href="#" id="' + YAHOO.elmo.GobblerUI.SCRATCHPAD_LINK_ID + '" ' + 
				'class="' + YAHOO.elmo.GobblerUI.SCRATCHPAD_LINK + '">(add this site)</a>' +
				'<div class="' + YAHOO.elmo.GobblerUI.SCRATCH_DIVIDER + '"></div>' + 
				'</div>';
				
				
	projectInnerHTML = 			
				'<div class="yahoo-gobbler-proj-main">' +
				projectInnerHTML + 
				'<p style="font-size:9px;">Version: @STAMP@</p>' + 
				'</div>';
// to debug set the this.inline to false temporarily
	var gobblerInnerHTML;
	if(inline) {
		gobblerInnerHTML = projectInnerHTML;
	} else {
		gobblerInnerHTML = newButtonInnerHTML + scratchpadInnerHTML + projectInnerHTML;		
		//gobblerInnerHTML = "<div style='height:100px;overflow:auto;position:relative;border:1px solid blue;background-color:yellow;'><div style='height:400px;'>Some Content</div></div>";	
	}
	return gobblerInnerHTML;
};

YAHOO.elmo.GobblerUI.prototype.bookmarkSiteToProj = function(e, args) {
		var gobbler = args[0];
		var dropZoneID = args[1];

		var innerHtml = gobbler.createAnchorInnerHtml(document.location.href, 
								document.title, document.title, document.title);
		YAHOO.util.Dom.get(dropZoneID).innerHTML = innerHtml;
		YAHOO.elmo.addAnchorToProject(gobbler.response, dropZoneID, 
							document.location.href, document.title, document.title);

};

/**
 * CHANGEME
 * Fix to the appropriate link or logic for a popup edit window for this project
 * Currently a hack.
 */
YAHOO.elmo.GobblerUI.prototype.getProjEditUrl = function(idx) {
	//return "http://travel.yahoo.com/trip?action=viewjournal&pid=" + 
	//					this.response.ResultSet.Result[idx].id;
	return this.restPrefix + "pid=" + this.response.collections[idx].pid + "&action=view";
},
	
/**
 * CHANGEME
 * This will take us to the page that create a new lesson plan.
 **/
YAHOO.elmo.GobblerUI.prototype.createNewProject = function(e, gobbler) {
	// should be inline somehow
	//document.location.href = "http://travel.yahoo.com/trip?_crumb=dummy&action=create";
	document.location.href = gobbler.restPrefix + "_crumb=" + gobbler.response.crumb + "&action=create";
};

YAHOO.elmo.GobblerUI.prototype.closePanel = function(e, gobbler) {
	var grabber = YAHOO.gobbler.grabber;
	YAHOO.util.Event.removeListener(document, 'mousemove', grabber.watchForInteraction); 
	YAHOO.util.Event.removeListener(document, 'mousedown', grabber.watchForInteraction); 

	var currElem = grabber.currElem;
	
	if(currElem) {
		YAHOO.util.Event.purgeElement(currElem, false, "mousedown");
		YAHOO.util.Event.purgeElement(currElem, false, "mouseout");
		grabber.currElem = null;
	}
	
	if(grabber.currDD) {
		grabber.currDD.unreg();
		grabber.currDD = null;
	}

    var hd = document.getElementsByTagName("head")[0];
    try {hd.removeChild(YAHOO.util.Dom.get("ie_gobbler"));} catch (e) {}
	try {hd.removeChild(YAHOO.util.Dom.get("moz_gobbler"));} catch (e) {}
	try {hd.removeChild(YAHOO.util.Dom.get("container_css"));} catch (e) {}
	try {hd.removeChild(YAHOO.util.Dom.get("gobbler_css"));} catch (e) {}
	try {hd.removeChild(YAHOO.util.Dom.get("__bs"));} catch (e) {}
	
	grabber.hideTextDragHandle();
	grabber.hideMovieDragHandle();
	YAHOO.gobbler.grabber = null;
	__bsg_invoked = false;
};

YAHOO.elmo.GobblerUI.prototype.getDropZoneIDs = function(response) {
	var fixedCollections = [];
	// Remove the scratchpad from the collections list
	for(var i=0,j=0;i<response.collections.length; i++) {
		// if this is the scratch then skip it.
		if(response.collections[i].pid == response.scratch) {
			continue;
		}
		fixedCollections[j] = {pid:response.collections[i].pid, 
								title:response.collections[i].title};
		j++;
	}
	
	fixedCollections[j] = {pid: response.scratch, title: ""};

	response.collections = fixedCollections;
	
	var numDropWells = response.collections.length-1; // ignore scratchpad in the list

	var dropZoneIDs = [];
	for(i=0; i<numDropWells; i++) {
		dropZoneIDs[i] = YAHOO.elmo.GobblerUI.DROP_ZONE_PREFIX + i;
		response.collections[i].dropId = dropZoneIDs[i];
	}

	return dropZoneIDs;
};

YAHOO.elmo.GobblerUI.prototype.createAnchorInnerHtml = function(href, text, title, alt) {
	var innerHtml = '<div class="yahoo-gobbler-proj-anchor">' + 
				'<img src="http://us.i1.yimg.com/us.yimg.com/i/nt/ic/ut/bsc/newwin12_1.gif"/>' + 
					'<a href="' + 
					href + 
					'" alt="' + 
					alt + 
					'" title="' + 
					title + 
					'">' +
					text + 
					'</a></div><div class="yahoo-gobbler-proj-anchor-href">' + 
					href + '</div>';
	return innerHtml;	 
};

/**
 * These make the call to the server to store the new items
 */
  
	
YAHOO.elmo.GobblerUI.prototype.addAnchorToProject = function(response, dropId, url, title, alt) {
		
/*title: any title for the item
type : url | image | text
url: if bookmarking a site
imgurl: if saving an image
description: clipped text
*/		
	var myTitle = (title && title !== "") ? title : escape(url);
	
	var pid = this.getPIDfromID(response, dropId);
	var addUrl = this.restPrefix + "_crumb=" + response.crumb + 
	 					"&action=gobble&pid=" + pid + 
	 					"&type=url&url=" + escape(url) + "&title=" + myTitle;
	 					
	if(alt && alt !== "") {
		addUrl += ("&description=" + alt);
	}
	
	YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-addanchor-req", addUrl, "YAHOO.elmo.addStatusCallback");
};

//http://p7.travel.scd.yahoo.com/elmo?action=gobble&_crumb=yGtmszOQItV&pid=230928&type=text&description=DESCRIPTION2&title=TITLE2&url=http://yahoo.com
YAHOO.elmo.GobblerUI.prototype.addCitationToProject = function(response, dropId, citeUrl, text) {
	var pid = this.getPIDfromID(response, dropId);
	var addUrl = this.restPrefix + "_crumb=" + response.crumb + 
	 					"&action=gobble&pid=" + pid + 
	 					"&type=text&description=" + escape(text) + "&title=" + escape("Quote from: " + citeUrl) + 
	 					"&url=" + escape(citeUrl);
	YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-addtext-req", addUrl, "YAHOO.elmo.addStatusCallback");
};

/**
 * Add the logic to create a JSON object and pass it along to the service
 */
//http://p7.travel.scd.yahoo.com/elmo?action=gobble&_crumb=yGtmszOQItV&pid=230928&type=image&description=DESCRIPTION&title=TITLE&imgurl=http://www.google.com/intl/en/images/logo.gif&url=http://google.com
YAHOO.elmo.GobblerUI.prototype.addImageToProject = function(response, dropId, imgInfo ) { 
	var imageElem = imgInfo.elem;
	var src = imgInfo.src;
	
	var pid = this.getPIDfromID(response, dropId);
	var addUrl = this.restPrefix + "_crumb=" + response.crumb + 
	 					"&action=gobble&pid=" + pid + 
	 					"&type=image&imgurl=" + escape(src);
	addUrl += ("&title=" + document.title);
	addUrl += ("&url=" + location.href);
	
	YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-addimg-req", addUrl, "YAHOO.elmo.addStatusCallback");
};

// -- Generalize
YAHOO.elmo.GobblerUI.prototype.getPIDfromID = function(response, dropId) {

	for(var i=0; i<response.collections.length; i++) {
		if(response.collections[i].dropId == dropId) {
			return response.collections[i].pid;
		}
	}
	
	return -1;
};


// global function for status return
/*
dummy({"response":"OK",
"iid":64});
*/
YAHOO.elmo.addStatusCallback = function(status) {
	var statusMsg = status.response; // OK	
	//YAHOO.gobbler.Util.debugMsg("STATUS:" + statusMsg);
	
};

// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
// B O O T S T R A P   C O D E
// -----------------------------------------------------
// -----------------------------------------------------
// -----------------------------------------------------
/**
 * URL prefix for the location of the gobbler code. Used to find
 * resources like images at runtime.
 * Example: http://billwscott.com/elmo/
 */
YAHOO.elmo.restPrefix = null;

var yahoo_elmo_init_gobbler = function(restPrefix) {	
	YAHOO.elmo.restPrefix = restPrefix;
	YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-search-req", 
			YAHOO.elmo.restPrefix + "action=listcollections",
			"YAHOO.elmo.getPlansCallback");
};
var gobblerInlineDivID;

var yahoo_elmo_init_gobbler_inline = function(inlineDivID, restPrefix, callback) {
	YAHOO.elmo.restPrefix = restPrefix;
	gobblerInlineDivID = inlineDivID;
	var userCallback = "YAHOO.elmo.getPlansCallbackInline";
	if(typeof(callback)!="undefined" && !callback) {
		userCallback = callback;
	}
	YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-search-req", 
			YAHOO.elmo.restPrefix + "action=listcollections",
			callback);
};


/**
 * Gets called when the response for plans comes back from server

{
	"collections":
		[
			{"pid":230961, "title":"Revolutionary War"},
			{"pid":230960, "title":"Spanish-American War"},
			{"pid":230959, "title":"Civil War Battles"},
			{"pid":230956, "title":""}
		],
	"scratch":230956,
	"crumb":"FxHa.enF/We"
}

 */
// TODO: show most recently gobbled item in each project/scratchpad
YAHOO.elmo.getPlansCallback = function(response) {
	// TODO: Pass in the interaction group to both the gobbler and the grabber, then remove the constant inside each
	// change to use cfg object instead of these passed in parameters
	YAHOO.gobbler.grabber = new YAHOO.gobbler.ContentGrabber(response, YAHOO.gobbler.INTERACTION_GROUP);
	var gobblerUI = new YAHOO.elmo.GobblerUI(response, 
			YAHOO.gobbler.INTERACTION_GROUP, 
			YAHOO.elmo.restPrefix);
	YAHOO.gobbler.grabber.setGobblerUI(gobblerUI);
	//?action=getproject&pid=PID&start=IDX&results=RESULTS&callback=foo
	// Add logic here to query for the last clipping for each project...
	/*	for(var i=0;i<response.collections.length; i++) {
			// if this is the scratch then skip it.
			var pid = response.collections[i].pid;
			YAHOO.gobbler.Util.jsonCall("yahoo-gobbler-getproj-"+pid, 
					YAHOO.elmo.restPrefix + "action=getproject&pid="+pid+"&start=1&results=1",
					"YAHOO.elmo.getProjCallback");		
		}
	*/	
		// http://twiki.corp.yahoo.com/view/APG/RositaAPIGetProject
		// push this GobblerUI construction into the callback for getting 
		// results for
};

// Default callback for inline gobbler if one is not specified
YAHOO.elmo.getPlansCallbackInline = function(response) {
	new YAHOO.elmo.GobblerUI(response, 
			YAHOO.gobbler.INTERACTION_GROUP, 
			YAHOO.elmo.restPrefix,
			{ 
				"container": gobblerInlineDivID,
				"inline": true 
			});
};

// TODO: store results for each project 
// once all projects have been returned, 
// then notify gobbler OR add results to 
// gobbler as they come in...
YAHOO.elmo.getProjCallback = function(response) {
	console.log(response.pid);
};

