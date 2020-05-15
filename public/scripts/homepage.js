var camera, scene, renderer, light1, plane;
var mouseX = 0, mouseY = 0, cursorX, cursorY;
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

var windowHalfX = SCREEN_WIDTH / 2;
var windowHalfY = SCREEN_HEIGHT / 2;

var raycaster, line;

var intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
};
var mouse = new THREE.Vector2();
var intersects = [];

var textureLoader = new THREE.TextureLoader();
var decalDiffuse = textureLoader.load('../textures/decal-diffuse.png');
var decalNormal = textureLoader.load('../textures/decal-normal.jpg');

var decalMaterial = new THREE.MeshPhongMaterial({
    specular: 0x444444,
    map: decalDiffuse,
    normalMap: decalNormal,
    normalScale: new THREE.Vector2(1, 1),
    shininess: 30,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: - 4,
    wireframe: false
});

var decals = [];
var mouseHelper;
var position = new THREE.Vector3();
var orientation = new THREE.Euler();
var size = new THREE.Vector3(10, 10, 10);

var params = {
    minScale: 0.3,
    maxScale: 3,
    rotate: true,
    clear: function () {
        removeDecals();
    }
};

var init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xfdfdfd, 1);
    document.body.appendChild(renderer.domElement);
    $(renderer.domElement).addClass('homePageCanvas');
    camera.position.z = 5.5;
    camera.position.y = -0.5;

    var geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

    line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
    line.visible = false;
    scene.add(line);

    raycaster = new THREE.Raycaster();

    mouseHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
    mouseHelper.visible = false;
    scene.add(mouseHelper);

    
    if (window.innerWidth < 1000 && window.innerWidth > 700) {
        $('.homePageCanvas').css('top', '-2rem');
    }
    else if( window.innerWidth < 700) {
        $('.homePageCanvas').css('top', '-5rem');
    }
    else {
        $('.homePageCanvas').css('top', '0');
    }
    if (window.innerWidth > 500) {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener( 'touchmove', onDocumentMouseMove, false );
    }
    var moved = false;

    window.addEventListener('mousedown', function () {
        moved = false;
    }, false);

    window.addEventListener('mouseup', function (e) {
        if($('.nav').css('left') === '100%'){
            checkIntersection();
            if (!moved && intersection.intersects) {shoot();}}
    });

    var checkIntersection = () => {
        if (!plane) return;
        raycaster.setFromCamera(mouse, camera);
        raycaster.intersectObject(plane, false, intersects);

        if (intersects.length > 0) {

            var p = intersects[0].point;
            mouseHelper.position.copy(p);
            intersection.point.copy(p);

            var n = intersects[0].face.normal.clone();
            n.transformDirection(plane.matrixWorld);
            n.multiplyScalar(10);
            n.add(intersects[0].point);

            intersection.normal.copy(intersects[0].face.normal);
            mouseHelper.lookAt(n);

            var positions = line.geometry.attributes.position;
            positions.setXYZ(0, p.x, p.y, p.z);
            positions.setXYZ(1, n.x, n.y, n.z);
            positions.needsUpdate = true;

            intersection.intersects = true;

            intersects.length = 0;

        } else {

            intersection.intersects = false;

        }

    }

    $('.restart').click(function(){
        removeDecals();
    });


}

var animate = () => {
    requestAnimationFrame(animate);
    render();
}

var render = () => {
    if (camera.position.x > 0.8) { camera.position.x = 0.8; }
    if (camera.position.x < -0.8) { camera.position.x = -0.8; }
    if (camera.position.y > 0.8) { camera.position.y = 0.8; }
    if (camera.position.y < -0.8) { camera.position.y = -0.8; }
    if (Math.abs(camera.position.x) <= 0.8) { camera.position.x += (mouseX - camera.position.x) * .0001; }
    if (Math.abs(camera.position.y) <= 0.8) { camera.position.y += (- mouseY - camera.position.y) * .00025; }
    light1.position.x = cursorX;
    light1.position.y = cursorY;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

var createPhotoPlane = () => {
    var pWidth = calculatePlaneSize(window.innerWidth);
    var pHeight = calculatePlaneHeight(pWidth);
    var geometry = new THREE.PlaneGeometry(pWidth, pHeight, 1, 1);

    var material = new THREE.MeshPhongMaterial({
        specular: 0x121212,
        shininess: 75, roughness: 1
    });

    textureLoader.load('../images/prof.jpg',
        function (texture) {
            material.map = texture;
            material.needsUpdate = true;
        });

    plane = new THREE.Mesh(geometry, material);
    plane.position.y = 0.5;
    scene.add(plane);
    var light = new THREE.AmbientLight(0xDCDCDC);
    scene.add(light);
}

var calculatePlaneSize = (width) => {
    if (width < 1250 && width > 742) {
        var margin = (1250 - (1250 - width)) / 1000;
        return (margin * 8)
    }
    else if (width < 742) {
        var margin = (1500 - (1500 - width)) / 700;
        return (margin * 8)
    }
    else return 7;
}

var calculatePlaneHeight = (width) => {
    return ((width / 8) * 2.62);
}

var addPointLight = () => {
    var sphere = new THREE.SphereBufferGeometry(0.05, 8, 8);
    light1 = new THREE.PointLight(0xB0E2FF, 0.75, 50, 2);
    //light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
    light1.position.z = 1;
    scene.add(light1);
}

window.addEventListener('resize', onResize, false);
if(window.innerWidth > 500){
    init();
    createPhotoPlane();
    addPointLight();
    animate();
}

function onResize() {
    location.reload();
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 2;
    mouseY = (event.clientY - windowHalfY) * 2;

    lightCursor();

    var x, y;

    if (event.changedTouches) {

        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;

    } else {

        x = event.clientX;
        y = event.clientY;

    }

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;

}

var lightCursor = () => {
    var tempx = (event.pageX / window.innerWidth) * 2 - 1;
    var tempy = -(event.pageY / window.innerHeight) * 2 + 1;

    // Make the sphere follow the mouse
    var vector = new THREE.Vector3(tempx, tempy, 1);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    cursorX = pos.x;
    cursorY = pos.y;
}

function shoot() {

    position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);

    if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

    var scale = params.minScale + Math.random() * (params.maxScale - params.minScale);
    size.set(scale, scale, scale);

    var material = decalMaterial.clone();
    material.color.setHex(Math.random() * 0xffffff);

    var m = new THREE.Mesh(new THREE.DecalGeometry(plane, position, orientation, size), material);

    decals.push(m);
    scene.add(m);

}

function removeDecals() {

    decals.forEach(function (d) {

        scene.remove(d);

    });

    decals = [];

}