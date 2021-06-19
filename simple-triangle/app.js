let vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec3 vertColor;',
        'attribute vec2 vertPosition;',
        '',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        ' fragColor = vertColor;',
        ' gl_Position = vec4(vertPosition, 0.0, 1.0);',
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

let InitDemo = function() {
    let canvas = document.getElementById("gameSurface");
    let gl = canvas.getContext('webgl');

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
    let triangleVertices =
    [ //x, y          R, G, B
      0.0, 0.5,       1.0, 1.0, 0.0,
      -0.5, -0.5,     0.7, 0.0, 1.0,
      0.5, -0.5,      0.1, 1.0, 0.6
    ];

    let triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        2, //Num of elements per attribute
        gl.FLOAT, //Type of elements
        gl.FALSE, //Whether or not the data is normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //Num of elements per attribute
        gl.FLOAT, //Type of elements
        gl.FALSE, //Whether or not the data is normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);


    //Main render loop
    //Normally: var loop = function () { updateWorld; RenderWorld; etc etc };
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);



}
