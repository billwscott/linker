<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<!-- <?php include 'shared.php'; ?> -->

<head>

<title>Test Harness for the Linker Bookmarklet</title>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/yahoo_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/event_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/animation_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/dom_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/widgets/2/container/container_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/widgets/2/logger/logger_2.1.0.js"></script>
<script type="text/javascript" src="http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/dragdrop_2.1.0.js"></script>

<link href="css/sample.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" type="text/css" href="http://us.js2.yimg.com/us.js.yimg.com/lib/common/widgets/2/logger/css/logger_2.1.0.css"> 

<!-- <link rel="stylesheet" type="text/css" href="rte/css/mailoptions.css" />
<script type="text/javascript" src="rte/scripts/prototype.js"></script>
<script type="text/javascript" src="rte/scripts/rico.js"></script>
<script type="text/javascript" src="rte/scripts/dhtmlbutton.js"></script>
<script type="text/javascript" src="rte/scripts/mailoptions_components.js"></script>
<script type="text/javascript" src="rte/scripts/richTextEditor.js"></script> -->

<style>

#list-of-links a { display:block; }
body {background-color:#EEEEEE;}
</style>

<script type="text/javascript">
function createRTE() { 
   //Rico.Corner.cssComplientBoxModel = true;
   //var options = { }; // customize here...
   //rte = RichTextEditor.create( $('rteContainer'), options ); 
} 
var pageLoad = function() {
	function __gbm(){
	    var j=document.getElementById("__bs");
	    if (!j) {
	        j=document.createElement("script");
	        j.id="__bs";
	        j.src="http://us.js2.yimg.com/us.js.yimg.com/lib/yde/linker/bs_200612081150.js";
	        j.onload=j.onreadystatechange=(function(){setTimeout(function(){__bsg();},200)});
	        document.getElementsByTagName("head")[0].appendChild(j);
	    } else {
	        __bsg();
	    }
	}
//	__gbm();

	//rte.initializeDocument();
}
YAHOO.util.Event.addListener(window, 'load', pageLoad);
</script>

</head>
<body>

<div id="main">
	<h1>Test page for Linker Bookmarklet (Version: 200612081150)</h1>
	<!-- <div id='rteContainer'><script>createRTE()</script></div> -->
</div> 

<!-- <p>Ajax Programming Development Flowers Yahoo Google Madonna</p> -->

<!-- First name:
<input id="t" type="text" name="fname" value="Mickey" />
<br />

<br/>-->

<textarea id="ta2" rows="20" cols="100">
Adding the capabilities of Ajax to a web page (removing the requirement to refresh the page for every interaction with the server) usually improves the speed of the page loading.

However, since more JavaScript is usually needed to implement Ajax techniques, the page might load slower due to more code being delivered.

You can solve this (usually) by using an efficient Ajax library that has been "minified" or reduced to the minimal size.

Page responsiveness is another issue. The right use of Ajax can make a page snappier. Witness netflix.com, rollover a movie and you get the details in a balloon popup. Lot faster than going to another page.
</textarea> <br/><br/>

<textarea id="ta" rows="10" cols="100">
JavaScript Minification
Ajax Jesse James Garrett
Netflix ajax
Ajax Performance
</textarea> <br/><br/>

</body>
</html>


<!-- You can solve this (usually) by using an efficient Ajax library that has been "minified" or reduced to the minimal size.

Page responsiveness is another issue. The right use of Ajax can make a page snappier. Witness netflix.com, rollover a movie and you get the details in a balloon popup. Lot faster than going to another page.

But if gratuitous animations and lots of back and forth communication happens during user interaction, the responsiveness will go down considerably.

Adding the capabilities of Ajax to a web page (removing the requirement to refresh the page for every interaction with the server) usually improves the speed of the page loading. -->
