var RoomTransition = RoomTransition || {};
var ParticleEffects = ParticleEffects || {};
var PANORAMA = (function(w, d){

    var camera,
        scene,
        renderer,
        projector,
        raycaster,
        mesh,
        fov;

    var loaded = false,
        globalData =[],
        meshes = [];
    sphereMaterialCache = {};

    var WINDOW_WIDTH = window.innerWidth,
        WINDOW_HEIGHT = window.innerHeight;

    var boundingRect,
        isUserInteracting = false,
        isHoverPoint = false,
        onMouseDownMouseX = 0,
        onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0,
        mouse = { x: 0, y: 0 },
        INTERSECTED,
        INTERSECTEDDOWN;

    var emptyMap = THREE.ImageUtils.loadTexture( "img/icons/empty.png" );
    var pointTexture = { 'img/icons/empty.png' : THREE.ImageUtils.loadTexture('img/icons/empty.png')};
	var clock = new THREE.Clock();

    //////Room Transition Control//////
    var roomTransitionName = "Alpha",
        nextRoomIndex = 0,
        changeRoom = true;
        workRoomTransitionIN = false,
        workRoomTransitionOUT = false;
    //////Particle Effect ////////////
    var particleEngine,
        isWorkParticleEngine = false;
    ///////////////////////////////////

    window.onresize = function(event) {
        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;
        var xz = d.querySelector('#container');
        xz.children[0].width = WINDOW_WIDTH;
        xz.children[0].height = WINDOW_HEIGHT;
        renderer.setSize( WINDOW_WIDTH, WINDOW_HEIGHT );
    }

    // Спасибо хабраюзеру k12th за совет напоминать пользователям об отсутствии WebGL
    if ( ! Detector.webgl ) {
        Detector.addGetWebGLMessage({parent:d.querySelector('#container')});
        d.querySelector('.loader').style.display = none;
        return false;
    }

    $.getJSON('ajax/points.php').success(function(data) {
        globalData = data;
    }).done(init).done([animate, renderMenu]);

    function init() {
        var container,
            canvas,
            firstScene = globalData[0];




        if(firstScene.lon){
            lon = firstScene.lon;
        }

        container = d.querySelector('#container');
        fov = 70;
        camera        = new THREE.PerspectiveCamera( fov, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 1100 );
        camera.target = new THREE.Vector3( 0, 0, 0 );
        projector     = new THREE.Projector();
        scene         = new THREE.Scene();
        raycaster     = new THREE.Raycaster();
        renderer      = new THREE.WebGLRenderer();
        //renderer      = new THREE.CanvasRenderer();
        renderer.setSize( WINDOW_WIDTH, WINDOW_HEIGHT );

        renderSphere(firstScene);
		renderParticle();
        startParticleEffect(firstScene);


        for(var i=0; i< firstScene.points.length; i++) {
            if (pointTexture[firstScene.points[i].icons.img_def] === undefined) {
                pointTexture[firstScene.points[i].icons.img_def] = THREE.ImageUtils.loadTexture(firstScene.points[i].icons.img_def);
            }
            if (pointTexture[firstScene.points[i].icons.img_hover] === undefined) {
                pointTexture[firstScene.points[i].icons.img_hover] = THREE.ImageUtils.loadTexture(firstScene.points[i].icons.img_hover);
            }
            if (pointTexture[firstScene.points[i].icons.img_down] === undefined) {
                pointTexture[firstScene.points[i].icons.img_down] = THREE.ImageUtils.loadTexture(firstScene.points[i].icons.img_down);
            }
        }

        renderPoints(firstScene.points);



        container.appendChild( renderer.domElement );
        canvas = d.querySelector('canvas');
        boundingRect = renderer.domElement.getBoundingClientRect();

        container.addEventListener( 'mouseenter', onContainerMouseEnter, false);
        //canvas.addEventListener( 'mouseover', onContainerMouseEnter, false);
        container.addEventListener( 'mouseleave', onContainerMouseLeave, false);
        container.addEventListener( 'mousedown', onDocumentMouseDown, false);
        container.addEventListener( 'mousemove', onDocumentMouseMove, false);
        container.addEventListener( 'mousewheel', onDocumentMouseScroll, false);
        container.addEventListener( 'click', onDocumentMouseClick, false);


        d.addEventListener( 'mouseup', onDocumentMouseUp, false);
        // container.addEventListener( 'dblclick', onDocumentMouseDblclick, false);
    }

    function renderPoints(points) {

        var max = points.length,
            i = 0,
            point;

        for (; i < max; i++) {
            point = new Point(points[i], pointTexture[points[i].icons.img_def]);
            scene.add(point);
            //кэшируем
            meshes.push( point );
        }
    }

    function renderSphere(data) {

        var sphere_geometry = new THREE.SphereGeometry( 500, 60, 40 ),
            sphere_material = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( data.texture ),
                overdraw: true
                //side: THREE.BackSide
            });
        var normal = new THREE.MeshNormalMaterial();

        mesh = new THREE.Mesh( sphere_geometry, sphere_material);
        mesh.scale.x = -1;
        sphereMaterialCache[data.name] = sphere_material;
        scene.add( mesh );
    }
	
	function renderParticle() {
		////////////
		// CUSTOM //
		////////////
		
		var particleTexture = THREE.ImageUtils.loadTexture( 'img/spark.png' );

		particleGroup = new THREE.Object3D();
		particleAttributes = { startSize: [], startPosition: [], randomness: [] };
		
		var totalParticles = 20;
		var radiusRange = 50;
		for( var i = 0; i < totalParticles; i++ ) 
		{
			var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff, overdraw: true } );
			
			var sprite = new THREE.Sprite( spriteMaterial );
			sprite.scale.set( 32, 32, 1.0 ); // imageWidth, imageHeight
			sprite.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
			// for a cube:
			// sprite.position.multiplyScalar( radiusRange );
			// for a solid sphere:
			// sprite.position.setLength( radiusRange * Math.random() );
			// for a spherical shell:
			sprite.position.setLength( radiusRange * (Math.random() * 0.1 + 0.9) );
			
			// sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() ); 
			sprite.material.color.setHSL( Math.random(), 0.9, 0.7 ); 
			
			// sprite.opacity = 0.80; // translucent particles
			sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles
			
			particleGroup.add( sprite );
			// add variable qualities to arrays, if they need to be accessed later
			particleAttributes.startPosition.push( sprite.position.clone() );
			particleAttributes.randomness.push( Math.random() );
		}
		particleGroup.position.x = 150;
		//particleGroup.position.y = 150;
		scene.add( particleGroup );
	}
	function renderParticleAnimation() {
		var time = 4 * clock.getElapsedTime();
		
		for ( var c = 0; c < particleGroup.children.length; c ++ ) 
		{
			var sprite = particleGroup.children[ c ];

			// particle wiggle
			// var wiggleScale = 2;
			// sprite.position.x += wiggleScale * (Math.random() - 0.5);
			// sprite.position.y += wiggleScale * (Math.random() - 0.5);
			// sprite.position.z += wiggleScale * (Math.random() - 0.5);
			
			// pulse away/towards center
			// individual rates of movement
			var a = particleAttributes.randomness[c] + 1;
			var pulseFactor = Math.sin(a * time) * 0.1 + 0.9;
			sprite.position.x = particleAttributes.startPosition[c].x * pulseFactor;
			sprite.position.y = particleAttributes.startPosition[c].y * pulseFactor;
			sprite.position.z = particleAttributes.startPosition[c].z * pulseFactor;	
		}

		// rotate the entire group
		// particleGroup.rotation.x = time * 0.5;
		particleGroup.rotation.y = time * 0.25;
		// particleGroup.rotation.z = time * 1.0;

		
		
		//controls.update();
		//stats.update();
	}

    /*  function onDocumentMouseDblclick(event) {

     event.preventDefault();

     var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
     projector.unprojectVector( vector, camera );
     raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
     var intersects = raycaster.intersectObjects( scene.children );

     if ( intersects.length == 1 ) {
     var sprite = new THREE.Mesh( new THREE.PlaneGeometry(35, 35), new THREE.MeshPhongMaterial({map: pointTexture[0], transparent:false }));

     //ставим позиции чуть ближе к камере
     sprite.position.x = intersects[0].point.x *0.99;
     sprite.position.y = intersects[0].point.y *0.99;
     sprite.position.z = intersects[0].point.z *0.99;
     sprite.data = {};
     sprite.lookAt( camera.position );
     // console.log(sprite.position);
     console.log( "'x'=> "+sprite.position.x+",/n 'y'=> "+sprite.position.y+",/n 'z'=>"+sprite.position.z+"" );
     scene.add( sprite );
     meshes.push( sprite );
     }
     }
     */

    function animate() {
        requestAnimationFrame( animate );
        if ( !isUserInteracting && !isHoverPoint ) {
            // fov -= 0.1;
            // camera.projectionMatrix.makePerspective( fov, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 1100 );
            lon += 0.04;
            // lat = ;
        }
        // mesh.rotation.x += 0.01;
        // mesh.rotation.y += 0.02;

        if(workRoomTransitionIN) {
            workRoomTransitionIN = RoomTransition['in'+roomTransitionName](mesh);
            changeRoom = !workRoomTransitionIN;
        }

        if(workRoomTransitionOUT) {
            workRoomTransitionOUT = RoomTransition['out'+roomTransitionName](mesh);
        }
        if(changeRoom) {
            changeSphereMaterial();
        }

		renderParticleAnimation();

        render();
        updateParticleEffect();
		
    }

    function render() {
        var container = d.querySelector('#container'),
            message = d.querySelector('#panoram-message'),
            vector = new THREE.Vector3( mouse.x, mouse.y, 1),
            intersects;

        //если первая загрузка
        if(!loaded) {
            d.querySelector('.loader').style.display = 'none';
            container.style.opacity = 1;
            loaded = true;
        }

        // необходимо что бы подсказка плавала за мышкой
        if ( message ) Message.updateCoords( message );

        projector.unprojectVector( vector, camera );
        raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        intersects = raycaster.intersectObjects( meshes );

        // если луч попал в точку
        if ( intersects.length > 0 ) {

            // и действий по отображению не выполнено
            if ( INTERSECTED != intersects[ 0 ].object ) {
                isHoverPoint = true;

                //запомнить, что мы этим уже занимались
                INTERSECTED = intersects[ 0 ].object;

                // в основном нужно только для пасхалки
                if(INTERSECTED.data.active === undefined){
                    INTERSECTED.material.map = pointTexture[INTERSECTED.icons.img_hover];
                }

                var cursor = 'help';
                if(INTERSECTED.icons !== undefined && INTERSECTED.icons.cursor !== undefined){
                    cursor = INTERSECTED.icons.cursor;
                }

                container.style.cursor = cursor;

                runEvent('onMousePointIn',mouse,INTERSECTED.data);

                //Message.showMessage( INTERSECTED.data, container );
            }

            // если луч попал в сферу
        } else {
            //осталась активная точка
            if ( INTERSECTED ) {
                isHoverPoint = false;

                // в основном нужно только для пасхалки
                if(INTERSECTED.data.active === undefined) {
                    INTERSECTED.material.map = pointTexture[INTERSECTED.icons.img_def];
                }

                container.style.cursor = 'move';
                runEvent('onMousePointOut',mouse,INTERSECTED.data);

                //Message.removeMessage();
                INTERSECTED = null;
            }
        }

        //расчет широты и долготы для правильного вектора камеры
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );

        camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        camera.target.y = 500 * Math.cos( phi );
        camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( camera.target );

        renderer.render( scene, camera );

    }

    var Point = function(data, defaultImage) {

        var itemGeometry = new THREE.PlaneGeometry(data.icons.size_w, data.icons.size_h),
            point;

        point = new THREE.Mesh( itemGeometry, new THREE.MeshBasicMaterial({
            map: defaultImage,
            transparent:true
        }) );

        point.position.x = data.coords.x;
        point.position.y = data.coords.y;
        point.position.z = data.coords.z;
        point.icons ={};
        if( data.data !== undefined ){
            point.data = data.data;
        }
        if( data.icons !== undefined ){
            point.icons = data.icons;
        }

        point.lookAt( camera.position );
        return point;
    }

    var Message = (function() {

        var _private = {

            template: '<h3>{{header}}</h3><p>{{body}}</p>',

            buildMessage: function() {
                var message = d.createElement('div');
                message.id = 'panoram-message';
                return message;
            },

            renderTemplate: function(data) {
                return _private.template.replace(/\{{([\w\.]*)\}}/g, function(x, keyword){
                    return data[keyword];
                });
            },

            setTemplate: function(str) {
                // str.test(/<?script>/g)? _private.template = str: false;
            },

            updateCoords: function(elem) {
                elem.style.left = mouse.trueX +15 +'px';
                elem.style.top = mouse.trueY +15 + 'px';
            }
        };

        return {

            setTemplate: function(str) {
                return _private.setTemplate(str);
            },

            showMessage: function(data, container) {
                var m = _private.buildMessage();
                _private.updateCoords(m);
                m.innerHTML = _private.renderTemplate(data);
                container.appendChild(m);
            },

            removeMessage: function() {
                var m = d.querySelector('#panoram-message');
                m? m.parentNode.removeChild(m):false;
            },

            updateCoords: function(elem) {
                return _private.updateCoords(elem);
            }
        }
    }());

    function actionRerender(num) {
        nextRoomIndex = num;
        stopParticleEffect();
        loaded = false;
        d.querySelector('.loader').style.display = 'block';
        container.style.opacity = 0;




        var object = globalData[num],
            sphereMaterial;
        changeRoom = true;
        if(roomTransitionName) {
            workRoomTransitionIN = true;
            changeRoom = false;
        }

        if (sphereMaterialCache[object.name] === undefined) {
            loaded = true;
            sphereMaterial = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(globalData[num].texture,new THREE.UVMapping(),function(){
                    loaded = false;
                    if(changeRoom) {
                        changeSphereMaterial();
                    }
                })
                //side: THREE.BackSide
            });
            sphereMaterialCache[object.name] = sphereMaterial;
        }
        if(changeRoom && !loaded) {
            changeSphereMaterial();
        }
    }
    function changeSphereMaterial() {
        var object = globalData[nextRoomIndex];
        if( sphereMaterialCache[object.name] != undefined) {

            mesh.material = sphereMaterialCache[object.name];

            for (var i = 0; i < meshes.length; i++) {
                scene.remove(meshes[i]);
            }

            // Чистим Кэш точек
            meshes = [];

            renderPoints(object.points);

            //Ставим камеру по умолчанию
            lon = (object.lon) ? (object.lon) : 0;
            lat = 0;
            if(roomTransitionName) {
                workRoomTransitionOUT = true;
            }
            startParticleEffect(object);
            changeRoom = false;
        }
    }

    function renderMenu() {
        /*
         var localData = globalData,
         i = 0,
         dataMax = localData.length,
         curName,
         html;

         var $Menu;

         // Рисуем если JSON содержит объекты
         if(dataMax > 0) {

         html = '<nav><p>Что посмотреть:</p><br><ul>';

         for (; i < dataMax; i++) {

         curName = localData[i].name;

         (i === 0) ?
         html += '<li><a href="#" class="active" data-room=' + i +'>' + curName + '</a></li>' :
         html += '<li><a href="#" data-room=' + i +'>' + curName + '</a></li>';
         }

         html += '</ul></nav>';
         $(container).parent().append(html);

         // Ивент на клик
         $Menu = $('nav > ul li a');
         $Menu.each(function() {
         $(this).on('click', onMenuClick);
         });
         }*/
    }

    function onContainerMouseEnter() {
        // console.log('what?');
        /* var $tooltip = d.querySelector('.tooltip');
         $tooltip.children[0].style.display = 'none';
         $tooltip.children[1].style.display = 'block';*/
    }

    function onContainerMouseLeave() {
        /* var $tooltip = d.querySelector('.tooltip');
         $tooltip.children[0].style.display = 'block';
         $tooltip.children[1].style.display = 'none';*/
    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;


        var intersects = raycaster.intersectObjects( meshes );

        // если луч попал в точку
        if ( intersects.length > 0 ) {
            if(intersects[ 0 ].object.data.active === undefined) {
                intersects[ 0 ].object.material.map = pointTexture[intersects[ 0 ].object.icons.img_down];
            }

            //pointEvent
            runEvent('onMousePointDown',event,intersects[0].object.data);
        }




    }

    function onDocumentMouseMove( event ) {

        mouse.trueX = (event.clientX - boundingRect.left)*(WINDOW_WIDTH / boundingRect.width);
        mouse.trueY = (event.clientY - boundingRect.top)*(WINDOW_HEIGHT / boundingRect.height);

        mouse.x = ( mouse.trueX/ WINDOW_WIDTH ) * 2 - 1;
        mouse.y = - (  mouse.trueY/ WINDOW_HEIGHT ) * 2 + 1;

        if ( isUserInteracting ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }

        var intersects = raycaster.intersectObjects( meshes );

        // если луч попал в точку
        if ( intersects.length > 0 ) {

            //pointEvent
            runEvent('onMousePointMove',event,intersects[0].object.data);

        }

    }

    function onDocumentMouseUp( event ) {

        isUserInteracting = false;


        var intersects = raycaster.intersectObjects( meshes );
        if ( intersects.length > 0 ) {

            if(intersects[ 0 ].object.data.active === undefined) {
                intersects[ 0 ].object.material.map = pointTexture[intersects[ 0 ].object.icons.img_def];
            }
            //intersects[ 0 ].object.material.map = pointMapHovered;

            //pointEvent
            runEvent('onMousePointUp',event,intersects[0].object.data);

        }
    }
    function onDocumentMouseClick( event ) {
        var intersects = raycaster.intersectObjects( meshes );
        if ( intersects.length > 0 ) {
            if(intersects[0].object.data.active === undefined) {
                intersects[0].object.material.map = pointTexture[intersects[0].object.icons.img_def];
            }

            runEvent('onMousePointClick',event,intersects[0].object.data);
        }
    }
    function onDocumentMouseScroll( event ) {
        var oldfov = fov;
        if ( event.wheelDeltaY ) {
            fov -= event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
        } else if ( event.wheelDelta ) {
            fov -= event.wheelDelta * 0.05;
            // Firefox

        } else if ( event.detail ) {
            fov += event.detail * 1.0;
        }
        if((WINDOW_WIDTH / WINDOW_HEIGHT)*fov<20){
            fov=oldfov;
        }
        if( fov >100 ){
            fov = 100;
        }
        camera.projectionMatrix.makePerspective( fov, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 1100 );
        render();
    }

    /******** event manager ******/
    var eventList={};
    function runEvent() {
        if(arguments.length){
            var eventName = arguments[0];
            var eventArgs = [];
            for(var k=1; k < arguments.length; k++)
                eventArgs.push(arguments[k]);
            if(eventList[eventName] !== undefined) {
                for(var i=0; i<eventList[eventName].length; i++) {
                    eventList[eventName][i].apply(this,eventArgs);
                }
            }
        }
    }
    function addEvent(eventName,callBack) {
        if(eventList[eventName] === undefined) {
            eventList[eventName] = [];
        }
        eventList[eventName].push(callBack);
    }
    /******** end event manager ******/

    /*======== particleEffect ==========*/
    function startParticleEffect(obj) {
        isWorkParticleEngine = false;
        if(obj.particleEffect && ParticleEffects[obj.particleEffect] != undefined) {
            particleEngine = new ParticleEngine();
            particleEngine.setValues(ParticleEffects[obj.particleEffect]);
            particleEngine.initialize();
            isWorkParticleEngine = true;
        }
    }
    function stopParticleEffect() {
        if(isWorkParticleEngine) {
            isWorkParticleEngine = false;
            particleEngine.destroy();
        }
    }
    function updateParticleEffect() {
        if(isWorkParticleEngine) {
            var dt = clock.getDelta();
            particleEngine.update( dt * 0.5 );
        }
    }
    /*======== END particleEffect ==========*/

    return {
        onMousePointMove: function (callBack){ addEvent('onMousePointMove',callBack) },
        onMousePointIn: function (callBack){ addEvent('onMousePointIn',callBack) },
        onMousePointOut: function (callBack){ addEvent('onMousePointOut',callBack) },
        onMousePointDown: function (callBack){ addEvent('onMousePointDown',callBack) },
        onMousePointUp: function (callBack){ addEvent('onMousePointUp',callBack) },
        onMousePointClick: function (callBack){ addEvent('onMousePointClick',callBack) },

        showAt: actionRerender,

        scene: function() {return scene; }
    };
})(this, this.document);
jQuery(document).ready(function(){
    jQuery('[data-toggle="panorama"]').click(function(){
        var index = parseInt($(this).data('panorama-index'));
        PANORAMA.showAt(index);
    });
});