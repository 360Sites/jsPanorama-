var RoomTransition = (function(){

    function inAlpha(panorama) {
        if(panorama.scale.x >= 0) return false;
        panorama.scale.x += 0.01;
        //panorama.material.opacity -= 0.01;
        return true;
    }
    function outAlpha (panorama) {
        if(panorama.scale.x <= -1) return false;
        panorama.scale.x -= 0.01;

        return true;
    }


    return {
        inAlpha : inAlpha,
        outAlpha : outAlpha
    };
})();