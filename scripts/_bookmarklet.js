/**
 * Current Version To Use in Installation Link
 */
javascript:function __gbm(){var j=document.getElementById("__bs");if(!j){j=document.createElement("script");j.id="__bs";j.src="@SCRIPT_LOCATION@bs_@STAMP@.js";j.onload=j.onreadystatechange=(function(){setTimeout(function(){__bsg();},200)});document.getElementsByTagName("head")[0].appendChild(j);}else{__bsg();}}__gbm();

/**
 * Current Version Expanded
 */
javascript:
function __gbm(){
    var j=document.getElementById("__bs");
    if (!j) {
        j=document.createElement("script");
        j.id="__bs";
        j.src="@SCRIPT_LOCATION@bs_@STAMP@.js";
        j.onload=j.onreadystatechange=(function(){setTimeout(function(){__bsg();},200)});
        document.getElementsByTagName("head")[0].appendChild(j);
    } else {
        __bsg();
    }
}
__gbm();
