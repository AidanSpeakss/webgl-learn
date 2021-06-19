//GIVE STUDENT glMatrix https://glmatrix.net
let vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec3 vertColor;',
        'attribute vec3 vertPosition;',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        '',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        ' fragColor = vertColor;',
        //matrix multiplications go right to left (reverse order)
        ' gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
        '}'
    ].join('\n')

let fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n')

//Wait for glMatrix to load and mat4 to be available before init
let startInitDemo = function(){
    if(glMatrix !== undefined){
        InitDemo();
    } else {
        setTimeout(startInitDemo, 50);
    }
}
let gl;
let InitDemo = function() {
    let canvas = document.getElementById("gameSurface");
     gl = canvas.getContext('webgl');

    //adds compatibility for older browsers with the beta webgl
    if(!gl){
        console.log("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext('experimental-webgl');
    }

    //replace body with webgl not supported message,
    if(!gl){
        document.body.innerHTML = "<h1>Your browser does not support WebGL.</h1><h2><a href='https://get.webgl.org/'>Get WebGL</a></h2>";
    }

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    //this is how we fix the blurry ness issue, it changes what webgl thinks its rendering too
    gl.viewport(0,0, document.body.clientWidth, document.body.clientHeight);

    //change canvas size with window resize
    document.addEventListener("resize", function(){
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gl.viewport(0,0, document.body.clientWidth, document.body.clientHeight);

    })

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);


    //Create shaders
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //think of a program as entire graphics card, and a shader as a single component
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('ERROR linking program', gl.getProgramInfoLog(program));
        return;
    }

    //catches additional errors (ONLY DO IN TESTING) 'REMOVE IN PUB'
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('ERROR validating program', gl.getProgramInfoLog(program));
        return;
    }

    // Create buffer
    let boxVertices =
        [ // X, Y, Z           R, G, B
            // Top
            -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
            -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
            1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
            1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

            // Left
            -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
            -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
            -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
            -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

            // Right
            1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
            1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
            1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
            1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

            // Front
            1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
            1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
            -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
            -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

            // Back
            1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
            1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
            -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
            -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

            // Bottom
            -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
            -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
            1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
            1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
        ];


    let boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,

            // Left
            5, 4, 6,
            6, 4, 7,

            // Right
            8, 9, 10,
            8, 10, 11,

            // Front
            13, 12, 14,
            15, 14, 12,

            // Back
            16, 17, 18,
            16, 18, 19,

            // Bottom
            21, 20, 22,
            22, 20, 23
        ];

    let boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    let boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //Num of elements per attribute
        gl.FLOAT, //Type of elements
        false, //Whether or not the data is normalized
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //Num of elements per attribute
        gl.FLOAT, //Type of elements
        false, //Whether or not the data is normalized
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );


    //Tell OpenGl state machine which program should be active
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0])
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(56), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);

    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);

    //Main render loop
    let identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    let angle = 0;
    let loop = function() {
        //One full rotation every 6 seconds
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

        gl.clearColor(0.75,0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        //will not call this function if tab is not in focus (good for perf)
        requestAnimationFrame(loop);

    };
    requestAnimationFrame(loop);




};
