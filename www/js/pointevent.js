
PANORAMA.onMousePointMove(function(event,data){
    if(data.hint){
        creatHint(event.pageX,event.pageY,data.hint,data.hint_type);
        hintEvent = event;
        hintData = data;
    }

    console.log('Move');
});
PANORAMA.onMousePointIn(tmp = function(event,data){
    console.log('In');
});
PANORAMA.onMousePointOut(tmp = function(event,data){
    destoryHint();
    console.log('Out');
});
PANORAMA.onMousePointDown(tmp = function(event,data){
    console.log('Down');
});
PANORAMA.onMousePointUp(tmp = function(event,data){
    console.log('Up');
});
PANORAMA.onMousePointClick(function(event,data,obj){
	if(data.type == "next") {
		obj.next(data.next_index);
	}   
	else if(data.type == "gallery"){
		initGallery(data.gallery);
	}
	else if(data.type == "media" ) {
		initMedia(data.media);
	}
	else if(data.type == "ifream") {
		initIfreamBox(data.url);
	}


	console.log('Click');
});
function initGallery(data){
	$("#gallery").html();
	var obj = {},
		html ="";
	for(var i=0; i<data.length ; i++){
		obj = data[i];
		html += '<a class="fancybox-button" rel="fancybox-button" href="img/gallery/'+obj.src+'" title="'+obj.title+'">'+
			'<img src="img/gallery/'+obj.src+'" alt="" /></a>';
			
	}
	$("#gallery").html(html);
	$(".fancybox-button").fancybox({
		prevEffect		: 'none',
		nextEffect		: 'none',
		closeBtn		: false,
		helpers		: {
			title	: { type : 'inside' },
			buttons	: {}
		}
	});
	$(".fancybox-button").first().click();
}
function initMedia(data){
	$("#gallery").html();
	var html ="";
	html += '<a class="fancybox-media" href="'+data+'">'+data+'</a>';
	
	$("#gallery").html(html);
	$('.fancybox-media').fancybox({
		helpers : {
			media : {}
		}
	});
	$(".fancybox-media").first().click();
}
function creatHint(id,left,top,data,hintType){
	/*left -= 10;
	top -= 10;
	var className = "tt-wrapper";
	if(hintType){
		className += "-"+hintType;
	}*/
    var el = $("#"+id);
    el.css({
        'left':left,
        'top':top
    });
    el.addClass("showe");
    var curs = $('#container').css("cursor");
    el.css({"cursor":curs});
/*
	var curs = $('#container').css("cursor");
	$("#hint").prop({"class":className});
	$("#hint").css({"cursor":curs});
	$("#hint-text").html(data);
	$("#hint").css({
		'left':left,
		'top':top,
		'dysplay':'block'
	});
		*/
}
function destoryHint(){

	/*$("#hint").css({
		'left':-500,
		'top':-500,
		'dysplay':'none'
	});*/
}
function hintClick(){
	onPointMouseClick(hintEvent,hintData);
}
function initIfreamBox(url){
	$("#gallery").html();
	var html ="";
	html += '<a class="fancybox-ifream" href="'+url+'">'+url+'</a>';
	
	$("#gallery").html(html);
	$(".fancybox-ifream").fancybox({
		'width'				: '80%',
		'height'			: '80%',
        'autoScale'     	: false,
        'transitionIn'		: 'none',
		'transitionOut'		: 'none',
		'type'				: 'iframe'
	});
	$(".fancybox-ifream").first().click();
}
function toggleMenu(){
	$("#bt-menu").toggleClass("bt-menu-open");
	$("#bt-menu").toggleClass("bt-menu-close");
}









