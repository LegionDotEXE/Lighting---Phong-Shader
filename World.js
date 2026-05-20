// World.js
// Main file that sets up WebGL, loads textures, and contains the main render loop

// Added a story line and a lost baby goat to find in the world, with a reunion message when you find it.

// Baby goat follows you after you find it. Awesome??


// Vertex shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '}\n';

// Fragment shader
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform sampler2D u_Sampler2;\n' +
    'uniform sampler2D u_Sampler3;\n' +
    'uniform sampler2D u_Sampler4;\n' +
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '  if (u_whichTexture == -1) {\n' +
    '    gl_FragColor = u_FragColor;\n' +
    '  } else if (u_whichTexture == 0) {\n' +
    '    gl_FragColor = texture2D(u_Sampler0, v_UV);\n' +
    '  } else if (u_whichTexture == 1) {\n' +
    '    gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
    '  } else if (u_whichTexture == 2) {\n' +
    '    gl_FragColor = texture2D(u_Sampler2, v_UV);\n' +
    '  } else if (u_whichTexture == 3) {\n' +
    '    gl_FragColor = texture2D(u_Sampler3, v_UV);\n' +
    '  } else if (u_whichTexture == 4) {\n' +
    '    gl_FragColor = texture2D(u_Sampler4, v_UV);\n' +
    '  } else {\n' +
    '    gl_FragColor = vec4(1, 0.2, 0.2, 1);\n' +
    '  }\n' +
    '}\n';

// WebGL globals
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;

// Camera
var camera;

// Goat
// var g_goat;
var g_babyGoat;
var g_foundKid = false;
// var g_reunionProgress = 0;

// Time
var g_startTime = performance.now() / 1000.0;
var g_seconds = 0;

// Mouse
var g_mouseDown = false;
var g_lastMouseX = 0;
var g_lastMouseY = 0;

// Reusable cubes for performance
var g_skyCube = null;
var g_groundCube = null;
var g_sandCube = null;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get WebGL context');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
}

// Initialize textures and start render loop
function initTextures() {
    loadTexture('textures/grass.png', 0);
    loadTexture('textures/wall.png', 1);
    loadTexture('textures/stone.png', 2);
    loadTexture('textures/sky.png', 3);
    loadTexture('textures/sand.png', 4);
}

function loadTexture(path, texUnit) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create texture object for ' + path);
        return;
    }
    var image = new Image();
    image.onload = function() {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (texUnit == 0) gl.uniform1i(u_Sampler0, 0);
        if (texUnit == 1) gl.uniform1i(u_Sampler1, 1);
        if (texUnit == 2) gl.uniform1i(u_Sampler2, 2);
        if (texUnit == 3) gl.uniform1i(u_Sampler3, 3);
        if (texUnit == 4) gl.uniform1i(u_Sampler4, 4);
        console.log('Loaded texture: ' + path);
    };
    image.src = path;
}

// Collision detection with walls
function canMoveTo(x, z) {
    // avoid clipping by the walls by 0.15 units
  var padding = 0.15;
  
  var checks = [
    [x + padding, z + padding],
    [x + padding, z - padding],
    [x - padding, z + padding],
    [x - padding, z - padding],
    [x, z],
  ];

  for (var i = 0; i < checks.length; i++) {
    var mapX = Math.floor(checks[i][0] + 16);
    var mapZ = Math.floor(checks[i][1] + 16);

    if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) return false;
    if (g_map[mapX][mapZ] > 0) return false;
  }

  return true;
}

// Keyboord Handlers for movement
function setupKeyHandlers() {
    document.onkeydown = function(ev) {
       // Save old position
        var oldEyeX = camera.eye.elements[0];
        var oldEyeZ = camera.eye.elements[2];
        var oldAtX = camera.at.elements[0];
        var oldAtZ = camera.at.elements[2];

        switch(ev.key) {
            case 'w': case 'W': camera.moveForward();  break;
            case 's': case 'S': camera.moveBackwards(); break;
            case 'a': case 'A': camera.moveLeft();      break;
            case 'd': case 'D': camera.moveRight();     break;
            case 'q': case 'Q': camera.panLeft();       break;
            case 'e': case 'E': camera.panRight();      break;
        }

        // collision check
        if (!canMoveTo(camera.eye.elements[0], camera.eye.elements[2])) {
            camera.eye.elements[0] = oldEyeX;
            camera.eye.elements[2] = oldEyeZ;
            camera.at.elements[0] = oldAtX;
            camera.at.elements[2] = oldAtZ;
            camera.updateView();
        }
    };
}

// Mouse Handlers for looking around
function setupMouseHandlers() {
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            removeBlock();
        } else {
            addBlock();
        }
        g_mouseDown = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    };
    canvas.onmouseup = function(ev) {
        g_mouseDown = false;
    };
    canvas.onmousemove = function(ev) {
        if (!g_mouseDown) return;
        var dx = ev.clientX - g_lastMouseX;
        var dy = ev.clientY - g_lastMouseY;
        camera.panLeft(dx * 0.04);              // sensitivity set to 0.04 after testings for balanced look speed
        camera.panUp(dy * 0.04);   
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    };
    canvas.onclick = function() {
        canvas.requestPointerLock();
    };
    document.addEventListener('pointerlockchange', function() {
        if (document.pointerLockElement === canvas) {
            document.onmousemove = function(ev) {
                camera.panLeft(ev.movementX * 0.04); 
                camera.panUp(ev.movementY * 0.04);   
            };
        } else {
            document.onmousemove = null;
        }
    });
}

// Get the block coordinates in front of the player based on camera direction
function getBlockInFront() {
    var f = new Vector3();
    f.set(camera.at);
    f.sub(camera.eye);
    f.normalize();
    f.mul(2); 
    var targetX = Math.floor(camera.eye.elements[0] + f.elements[0] + 16);
    var targetZ = Math.floor(camera.eye.elements[2] + f.elements[2] + 16);
    targetX = Math.max(0, Math.min(31, targetX));
    targetZ = Math.max(0, Math.min(31, targetZ));
    return [targetX, targetZ];
}

function addBlock() {
    var pos = getBlockInFront();
    var x = pos[0];
    var z = pos[1];
    if (g_map[x][z] < 4) {
        g_map[x][z] += 1;
    }
}

function removeBlock() {
    var pos = getBlockInFront();
    var x = pos[0];
    var z = pos[1];
    if (g_map[x][z] > 0) {
        g_map[x][z] -= 1;
    }
}

// Story and finding the lost kid logic
// Check distance to the lost kid and update story text

function checkStory() {
    if (g_foundKid) return;

    var px = camera.eye.elements[0];
    var pz = camera.eye.elements[2];

    var kx = g_babyGoat.position[0];
    var kz = g_babyGoat.position[2];

    var dx = px - kx;
    var dz = pz - kz;
    var dist = Math.sqrt(dx * dx + dz * dz);

    document.getElementById('hud').innerHTML = "Dist to kid: " + dist.toFixed(1);

    if (dist < 1.5) {
        g_foundKid = true;
        document.getElementById('story').innerHTML = "You found the Lost Kid!";
        document.getElementById('story').style.color = "#00FF00";

        setTimeout(function() {
            document.getElementById('story').innerHTML = "";
        }, 5000);
    }
}

// Render the entire scene
function renderScene() {
    var startTime = performance.now();

    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Skybox
    if (!this.skyCube) this.skyCube = new Cube();
    var sky = this.skyCube || new Cube();
    sky.color = [0.5, 0.7, 1.0, 1.0];
    sky.textureNum = 3; 
    sky.matrix.setTranslate(-50, -50, -50);
    sky.matrix.scale(100, 100, 100);
    sky.render();

    // Ground   
    if (!this.groundCube) this.groundCube = new Cube();
    var ground = this.groundCube || new Cube();
    ground.color = [0.4, 0.8, 0.3, 1.0];
    ground.textureNum = 0; 
    ground.matrix.setTranslate(-16, -0.05, -16); 
    ground.matrix.scale(32, 0.1, 32); 
    ground.render();

    // // Sand 
    if (!this.sandCube) this.sandCube = new Cube();
    var sand = this.sandCube || new Cube();
    sand.color = [0.9, 0.85, 0.6, 1.0];
    sand.textureNum = 4; 
    sand.matrix.setTranslate(-16, -0.06, -16);
    sand.matrix.scale(32, 0.1, 32);
    sand.render();

    // Walls
    drawMap();

    // Baby goat 
    // always render it, but before finding it stays at hidden spot
    // after finding it follows the player
    g_babyGoat.updateAnimation(g_seconds);

    if (g_foundKid) {
        // follow the player at a distance
        var followDist = 2.0;
        var px = camera.eye.elements[0];
        var pz = camera.eye.elements[2];

        var dx = px - g_babyGoat.position[0];
        var dz = pz - g_babyGoat.position[2];
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > followDist) {
            g_babyGoat.position[0] += dx * 0.03;
            g_babyGoat.position[2] += dz * 0.03;
            // face the player
            g_babyGoat.rotation = Math.atan2(dx, dz) * 180 / Math.PI;
        }
    }

    g_babyGoat.render();

    checkStory();

    var duration = performance.now() - startTime;
    sendTextToHTML("ms: " + Math.floor(duration) + "  fps: " + Math.floor(1000 / duration), "perf");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) return;
    htmlElm.innerHTML = text;
}

// Main render loop
function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    renderScene();
    requestAnimationFrame(tick);
}

// Main 
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    initTextures();
    setupKeyHandlers();
    setupMouseHandlers();

    // Create camera
    camera = new Camera();
    camera.eye = new Vector3([2, 0.5, 2]);
    camera.at = new Vector3([2, 0.5, 1]);
    camera.updateView();

    // Create the baby goat at the lost kid location
    // g_kidLocation is [25,25] in map coords
    g_babyGoat = new Goat();
    g_babyGoat.position = [10, 0.15, 10];
    g_babyGoat.rotation = 0;
    g_babyGoat.scale = 1.2;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.getElementById('story').innerHTML = "Find the Lost Kid!";

    tick();
}

main();