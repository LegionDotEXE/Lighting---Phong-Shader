// World.js

var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'attribute vec3 a_Normal;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform vec3 u_LightPos;\n' +
    'varying vec2 v_UV;\n' +
    'varying vec3 v_WorldPos;\n' +
    'varying vec3 v_NormalDir;\n' +
    'varying vec3 v_LightDir;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '  vec3 worldPos = (u_ModelMatrix * a_Position).xyz;\n' +
    '  v_WorldPos = worldPos;\n' +
    '  v_NormalDir = normalize((u_NormalMatrix * vec4(a_Normal, 0.0)).xyz);\n' +
    '  v_LightDir = u_LightPos - worldPos;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'varying vec3 v_WorldPos;\n' +
    'varying vec3 v_NormalDir;\n' +
    'varying vec3 v_LightDir;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform sampler2D u_Sampler2;\n' +
    'uniform sampler2D u_Sampler3;\n' +
    'uniform sampler2D u_Sampler4;\n' +
    'uniform int u_whichTexture;\n' +
    'uniform float u_ShowNormals;\n' +
    'uniform float u_EnableLighting;\n' +
    'uniform float u_Emissive;\n' +
    'uniform float u_LightIntensity;\n' +
    'uniform vec3 u_LightPos;\n' +
    'uniform vec3 u_LightColor;\n' +
    'uniform vec3 u_CamPos;\n' +
    'uniform float u_EnableSpot;\n' +
    'uniform vec3 u_SpotPos;\n' +
    'uniform vec3 u_SpotDir;\n' +
    'uniform float u_SpotInner;\n' +
    'uniform float u_SpotOuter;\n' +
    'void main() {\n' +
    '  vec3 N = normalize(v_NormalDir);\n' +
    '  if (u_ShowNormals > 0.5) {\n' +
    '    gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);\n' +
    '    return;\n' +
    '  }\n' +
    '  vec4 base;\n' +
    '  if (u_whichTexture == -1) {\n' +
    '    base = u_FragColor;\n' +
    '  } else if (u_whichTexture == 0) {\n' +
    '    base = texture2D(u_Sampler0, v_UV);\n' +
    '  } else if (u_whichTexture == 1) {\n' +
    '    base = texture2D(u_Sampler1, v_UV);\n' +
    '  } else if (u_whichTexture == 2) {\n' +
    '    base = texture2D(u_Sampler2, v_UV);\n' +
    '  } else if (u_whichTexture == 3) {\n' +
    '    base = texture2D(u_Sampler3, v_UV);\n' +
    '  } else if (u_whichTexture == 4) {\n' +
    '    base = texture2D(u_Sampler4, v_UV);\n' +
    '  } else {\n' +
    '    base = vec4(1, 0.2, 0.2, 1);\n' +
    '  }\n' +
    '  if (u_EnableLighting < 0.5) {\n' +
    '    gl_FragColor = base;\n' +
    '    return;\n' +
    '  }\n' +
    '  vec3 L = normalize(v_LightDir);\n' +
    '  vec3 V = normalize(u_CamPos - v_WorldPos);\n' +
    '  float ka = 0.25;\n' +
    '  float kd = 0.8;\n' +
    '  float ks = 0.6;\n' +
    '  float shininess = 32.0;\n' +
    '  float ndotl = max(dot(N, L), 0.0);\n' +
    '  vec3 R = reflect(-L, N);\n' +
    '  float spec = pow(max(dot(R, V), 0.0), shininess);\n' +
    '  float spot = 1.0;\n' +
    '  if (u_EnableSpot > 0.5) {\n' +
    '    vec3 S = normalize(v_WorldPos - u_SpotPos);\n' +
    '    float cosTheta = dot(normalize(u_SpotDir), S);\n' +
    '    spot = smoothstep(u_SpotOuter, u_SpotInner, cosTheta);\n' +
    '  }\n' +
    '  vec3 ambient = base.rgb * ka;\n' +
    '  vec3 diffuseSpec = base.rgb * (u_LightColor * (u_LightIntensity * spot)) * (kd * ndotl + ks * spec);\n' +
    '  vec3 outRgb = ambient + diffuseSpec + base.rgb * u_Emissive;\n' +
    '  gl_FragColor = vec4(clamp(outRgb, 0.0, 1.0), base.a);\n' +
    '}\n';

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_ShowNormals;
let u_EnableLighting;
let u_Emissive;
let u_LightIntensity;
let u_LightPos;
let u_LightColor;
let u_CamPos;
let u_EnableSpot;
let u_SpotPos;
let u_SpotDir;
let u_SpotInner;
let u_SpotOuter;

//let u_NormalMatrix;

var camera;

var g_babyGoat;
var g_foundKid = false;

var g_startTime = performance.now() / 1000.0;
var g_seconds = 0;

var g_mouseDown = false;
var g_lastMouseX = 0;
var g_lastMouseY = 0;

var g_skyCube = null;
var g_groundCube = null;
var g_sandCube = null;

var g_showNormals = false;
var g_enableLighting = true;
var g_enableSpot = true;
var g_lightPos = [0, 3, 0];
var g_lightColor = [1.0, 1.0, 1.0];
var g_lightAnimate = true;
var g_lightAngle = 0;
var g_lightRadius = 3.0;
var g_spotInnerDeg = 15;
var g_spotOuterDeg = 25;

var g_sphere1 = null;
var g_sphere2 = null;
var g_lightCube = null;
var g_teapot = null;

var g_prevTime = performance.now() / 1000.0;

// open area center for objects and light orbit
// map[16][16] is world (0,0), map[17-19][14-18] should be open
var g_objectCenter = [0, 0, 0];

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
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    u_ShowNormals = gl.getUniformLocation(gl.program, 'u_ShowNormals');
    u_EnableLighting = gl.getUniformLocation(gl.program, 'u_EnableLighting');
    u_Emissive = gl.getUniformLocation(gl.program, 'u_Emissive');
    u_LightIntensity = gl.getUniformLocation(gl.program, 'u_LightIntensity');
    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    u_CamPos = gl.getUniformLocation(gl.program, 'u_CamPos');
    u_EnableSpot = gl.getUniformLocation(gl.program, 'u_EnableSpot');
    u_SpotPos = gl.getUniformLocation(gl.program, 'u_SpotPos');
    u_SpotDir = gl.getUniformLocation(gl.program, 'u_SpotDir');
    u_SpotInner = gl.getUniformLocation(gl.program, 'u_SpotInner');
    u_SpotOuter = gl.getUniformLocation(gl.program, 'u_SpotOuter');
}

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

function canMoveTo(x, z) {
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

function setupKeyHandlers() {
    document.onkeydown = function(ev) {
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

        if (!canMoveTo(camera.eye.elements[0], camera.eye.elements[2])) {
            camera.eye.elements[0] = oldEyeX;
            camera.eye.elements[2] = oldEyeZ;
            camera.at.elements[0] = oldAtX;
            camera.at.elements[2] = oldAtZ;
            camera.updateView();
        }
    };
}

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
        camera.panLeft(dx * 0.04);
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
    if (g_map[pos[0]][pos[1]] < 4) g_map[pos[0]][pos[1]] += 1;
}

function removeBlock() {
    var pos = getBlockInFront();
    if (g_map[pos[0]][pos[1]] > 0) g_map[pos[0]][pos[1]] -= 1;
}

function checkStory() {
    if (g_foundKid) return;
    var px = camera.eye.elements[0];
    var pz = camera.eye.elements[2];
    var dx = px - g_babyGoat.position[0];
    var dz = pz - g_babyGoat.position[2];
    var dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 1.5) {
        g_foundKid = true;
        document.getElementById('story').innerHTML = "You found the Lost Kid!";
        document.getElementById('story').style.color = "#00FF00";
        setTimeout(function() {
            document.getElementById('story').innerHTML = "";
        }, 5000);
    }
}

function renderScene() {
    console.log("Drawing sphere1 at", g_objectCenter[0]-2, 1, g_objectCenter[2]);
    var normalMatrix = new Matrix4();
    var startTime = performance.now();
    var now = performance.now() / 1000.0;
    var dt = now - g_prevTime;
    g_prevTime = now;

    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    gl.uniform1f(u_ShowNormals, g_showNormals ? 1.0 : 0.0);
    gl.uniform1f(u_EnableLighting, g_enableLighting ? 1.0 : 0.0);
    gl.uniform1f(u_LightIntensity, 1.0);
    gl.uniform1f(u_Emissive, 0.0);
    gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform3f(u_CamPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

    gl.uniform1f(u_EnableSpot, g_enableSpot ? 1.0 : 0.0);
    gl.uniform3f(u_SpotPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    var e = camera.eye.elements;
    var a = camera.at.elements;
    var sdx = a[0]-e[0], sdy = a[1]-e[1], sdz = a[2]-e[2];
    var slen = Math.sqrt(sdx*sdx+sdy*sdy+sdz*sdz) || 1.0;
    gl.uniform3f(u_SpotDir, sdx/slen, sdy/slen, sdz/slen);
    gl.uniform1f(u_SpotInner, Math.cos(g_spotInnerDeg * Math.PI / 180));
    gl.uniform1f(u_SpotOuter, Math.cos(g_spotOuterDeg * Math.PI / 180));

    if (g_lightAnimate) {
        g_lightAngle += dt;
        g_lightPos[0] = g_objectCenter[0] + g_lightRadius * Math.cos(g_lightAngle);
        g_lightPos[2] = g_objectCenter[2] + g_lightRadius * Math.sin(g_lightAngle);
        g_lightPos[1] = 3 + 0.5 * Math.sin(g_lightAngle * 2.0);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disableVertexAttribArray(a_Normal);
    gl.vertexAttrib3f(a_Normal, 0, 0, 1);

    var nm = new Matrix4();

    // Sky
    if (!g_skyCube) g_skyCube = new Cube();
    g_skyCube.color = [0.5, 0.7, 1.0, 1.0];
    g_skyCube.textureNum = 3;
    g_skyCube.matrix.setTranslate(-50, -50, -50);
    g_skyCube.matrix.scale(100, 100, 100);
    nm.setInverseOf(g_skyCube.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_skyCube.render();

    // Ground
    if (!g_groundCube) g_groundCube = new Cube();
    g_groundCube.color = [0.4, 0.8, 0.3, 1.0];
    g_groundCube.textureNum = 0;
    g_groundCube.matrix.setTranslate(-16, -0.05, -16);
    g_groundCube.matrix.scale(32, 0.1, 32);
    nm.setInverseOf(g_groundCube.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_groundCube.render();

    // Sand
    if (!g_sandCube) g_sandCube = new Cube();
    g_sandCube.color = [0.9, 0.85, 0.6, 1.0];
    g_sandCube.textureNum = 4;
    g_sandCube.matrix.setTranslate(-16, -0.06, -16);
    g_sandCube.matrix.scale(32, 0.1, 32);
    nm.setInverseOf(g_sandCube.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_sandCube.render();

    // Walls
    drawMap();

    //Light marker
    gl.uniform1f(u_Emissive, 1.0);
    if (!g_lightCube) g_lightCube = new Cube();
    g_lightCube.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
    g_lightCube.textureNum = -1;
    g_lightCube.matrix.setTranslate(g_lightPos[0]-0.1, g_lightPos[1]-0.1, g_lightPos[2]-0.1);
    g_lightCube.matrix.scale(0.2, 0.2, 0.2);
    nm.setInverseOf(g_lightCube.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_lightCube.render();
    gl.uniform1f(u_Emissive, 0.0);

    // Sphere 1 - red, left of center
    if (!g_sphere1) g_sphere1 = new Sphere();
    g_sphere1.color = [1.0, 0.3, 0.3, 1.0];
    g_sphere1.textureNum = -1;
    g_sphere1.matrix.setTranslate(g_objectCenter[0] - 2, 0.5, g_objectCenter[2]);
    g_sphere1.matrix.scale(0.5, 0.5, 0.5);
    nm.setInverseOf(g_sphere1.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_sphere1.render();

    // Sphere 2 - blue, right of center
    if (!g_sphere2) g_sphere2 = new Sphere();
    g_sphere2.color = [0.3, 0.3, 1.0, 1.0];
    g_sphere2.textureNum = -1;
    g_sphere2.matrix.setTranslate(g_objectCenter[0] + 2, 0.5, g_objectCenter[2]);
    g_sphere2.matrix.scale(0.5, 0.5, 0.5);
    nm.setInverseOf(g_sphere2.matrix); nm.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
    g_sphere2.render();

    // Teapot OBJ - center
    if (g_teapot && g_teapot.isFullyLoaded) {
        g_teapot.matrix.setTranslate(g_objectCenter[0], 0.3, g_objectCenter[2]);
        g_teapot.matrix.scale(0.15, 0.15, 0.15);
        g_teapot.matrix.rotate(g_seconds * 20, 0, 1, 0);
        g_teapot.render(gl);
    }

    // Baby goat
    g_babyGoat.updateAnimation(g_seconds);
    if (g_foundKid) {
        var followDist = 2.0;
        var px = camera.eye.elements[0];
        var pz = camera.eye.elements[2];
        var dx = px - g_babyGoat.position[0];
        var dz = pz - g_babyGoat.position[2];
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > followDist) {
            g_babyGoat.position[0] += dx * 0.03;
            g_babyGoat.position[2] += dz * 0.03;
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

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    renderScene();
    requestAnimationFrame(tick);
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    initTextures();
    setupKeyHandlers();
    setupMouseHandlers();


    // g_objectCenter = [0, 0, 0];

    // // force those map cells open so objects arent inside walls
    // g_map[16][16] = 0;
    // g_map[15][16] = 0;
    // g_map[17][16] = 0;
    // g_map[16][15] = 0;
    // g_map[16][17] = 0;
    // g_map[14][16] = 0;
    // g_map[18][16] = 0;

    // // camera starts looking at the objects
    // camera = new Camera();
    // camera.eye = new Vector3([0, 0.5, 5]);
    // camera.at = new Vector3([0, 0.5, 0]);
    // camera.updateView();

    g_objectCenter = [2, 0, 2];

    for (var mx = 16; mx < 22; mx++) {
        for (var mz = 16; mz < 22; mz++) {
            g_map[mx][mz] = 0;
        }
    }

    camera = new Camera();
    camera.eye = new Vector3([2, 0.5, 8]);
    camera.at = new Vector3([2, 0.5, 2]);
    camera.updateView();

    console.log("Object center world:", g_objectCenter);
    console.log("Sphere1 at world:", g_objectCenter[0]-2, 1, g_objectCenter[2]);
    console.log("Sphere2 at world:", g_objectCenter[0]+2, 1, g_objectCenter[2]);
    console.log("Teapot at world:", g_objectCenter[0], 0.5, g_objectCenter[2]);
    console.log("Map at sphere1:", g_map[Math.floor(g_objectCenter[0]-2+16)][Math.floor(g_objectCenter[2]+16)]);
    console.log("Map at sphere2:", g_map[Math.floor(g_objectCenter[0]+2+16)][Math.floor(g_objectCenter[2]+16)]);
    console.log("Map at teapot:", g_map[Math.floor(g_objectCenter[0]+16)][Math.floor(g_objectCenter[2]+16)]);
    console.log("Map at camera:", g_map[Math.floor(2+16)][Math.floor(8+16)]);

    g_babyGoat = new Goat();
    g_babyGoat.position = [10, 0.15, 10];
    g_babyGoat.rotation = 0;
    g_babyGoat.scale = 1.2;

    g_teapot = new Model(gl, "teapot.obj");
    g_teapot.color = [0.8, 0.5, 0.2, 1.0];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.getElementById('story').innerHTML = "Find the Lost Kid!";

    document.getElementById('btnNormal').onclick = function() {
        g_showNormals = !g_showNormals;
        document.getElementById('btnNormal').innerText =
            g_showNormals ? "Normals: ON" : "Normals: OFF";
    };
    document.getElementById('btnLight').onclick = function() {
        g_enableLighting = !g_enableLighting;
        document.getElementById('btnLight').innerText =
            g_enableLighting ? "Lighting: ON" : "Lighting: OFF";
    };
    document.getElementById('btnSpot').onclick = function() {
        g_enableSpot = !g_enableSpot;
        document.getElementById('btnSpot').innerText =
            g_enableSpot ? "Spot: ON" : "Spot: OFF";
    };
    document.getElementById('btnAnimate').onclick = function() {
        g_lightAnimate = !g_lightAnimate;
        document.getElementById('btnAnimate').innerText =
            g_lightAnimate ? "Animate: ON" : "Animate: OFF";
    };

    document.getElementById('lightX').oninput = function() {
        g_lightPos[0] = parseFloat(this.value);
        g_lightAnimate = false;
    };
    document.getElementById('lightY').oninput = function() {
        g_lightPos[1] = parseFloat(this.value);
    };
    document.getElementById('lightZ').oninput = function() {
        g_lightPos[2] = parseFloat(this.value);
        g_lightAnimate = false;
    };

    document.getElementById('lightR').oninput = function() {
        g_lightColor[0] = parseFloat(this.value) / 255;
    };
    document.getElementById('lightG').oninput = function() {
        g_lightColor[1] = parseFloat(this.value) / 255;
    };
    document.getElementById('lightB').oninput = function() {
        g_lightColor[2] = parseFloat(this.value) / 255;
    };

    tick();
}

main();