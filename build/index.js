class J{disposables;own(H){if(!this.disposables)this.disposables=new Set;return this.disposables.add(H),H}destroy(){this.disposables?.forEach((H)=>H.destroy())}}var _=function(H,W,j){function K(M,Q){function z(U){return U===H?.VERTEX_SHADER?"vertex":U===H?.FRAGMENT_SHADER?"fragment":void 0}if(Q!==H.VERTEX_SHADER&&Q!==H.FRAGMENT_SHADER)throw new Error(`Shader error in ${z(Q)}`);const Y=H.createShader(Q);if(!Y)throw new Error(`Unable to generate ${z(Q)} shader.`);if(H.shaderSource(Y,M),H.compileShader(Y),!H.getShaderParameter(Y,H.COMPILE_STATUS))console.error(`Shader compile error in ${z(Q)}:`+H.getShaderInfoLog(Y));return Y}const q=H.createProgram();if(!q)throw new Error("Unable to create program.");const w=K(W,H.VERTEX_SHADER),$=K(j,H.FRAGMENT_SHADER);if(H.attachShader(q,w),H.attachShader(q,$),H.linkProgram(q),H.detachShader(q,w),H.detachShader(q,$),H.deleteShader(w),H.deleteShader($),H.validateProgram(q),!H.getProgramParameter(q,H.LINK_STATUS))throw new Error("Unable to initialize the shader program:\n"+H.getProgramInfoLog(q));return q},D=function(H,W){H.deleteProgram(W)};class F extends J{gl;program;constructor(H,W,j){super();this.gl=H,this.program=_(H,W.trim(),j.trim())}use(){this.gl.useProgram(this.program)}destroy(){super.destroy(),D(this.gl,this.program)}}class E extends J{activeProgramId="";gl;programs={};constructor(H){super();this.gl=H}addProgram(H,W,j){if(this.programs[H])this.removeProgram(H);this.programs[H]=this.own(new F(this.gl,W,j))}useProgram(H){if(this.activeProgramId!==H)this.activeProgramId=H,this.programs[H].use()}removeProgram(H){this.programs[H].destroy(),delete this.programs[H]}getProgram(H){return this.programs[H??this.activeProgramId]?.program}}class R extends J{gl;triangleArray;constructor(H){super();this.gl=H,this.triangleArray=H.createVertexArray(),H.bindVertexArray(this.triangleArray)}destroy(){this.gl.deleteVertexArray(this.triangleArray)}}class B extends J{bufferRecord={};lastBoundBuffer;gl;programs;constructor(H,W){super();this.gl=H,this.programs=W}getAttributeLocation(H,W){const j=this.programs.getProgram(W);return j?this.gl.getAttribLocation(j,H)??-1:-1}createBuffer(H){this.deleteBuffer(H);const W=this.gl?.createBuffer();if(!W)throw new Error(`Unable to create buffer "${H}"`);const j={buffer:W,location:this.getAttributeLocation(H)};return this.bufferRecord[H]=j,j}deleteBuffer(H){if(this.bufferRecord[H])this.gl.deleteBuffer(this.bufferRecord[H].buffer),delete this.bufferRecord[H]}getAttributeBuffer(H,W){const j=this.bufferRecord[H];if(!j){if(W)return this.createBuffer(H);throw new Error(`Attribute "${H}" not created. Make sure "createBuffer" is called.`)}return j}bufferData(H,W,j,K,q){const w=this.getAttributeBuffer(W);if(j)this.gl.bufferData(H,j,q);else this.gl.bufferData(H,K,q);w.bufferSize=K||j?.length,w.bufferArray=j??new Float32Array(w.bufferSize/Float32Array.BYTES_PER_ELEMENT).fill(0),w.usage=q,w.target=H}bufferSubData(H,W,j,K,q){if(K)this.gl.bufferSubData(H,j,W,K,q);else this.gl.bufferSubData(H,j,W)}bindBuffer(H,W){if(this.lastBoundBuffer!==W)this.lastBoundBuffer=W,this.gl.bindBuffer(H,W.buffer)}destroy(){Object.keys(this.bufferRecord).forEach((H)=>this.deleteBuffer(H))}}class P extends J{gl;programs;constructor(H,W){super();this.gl=H,this.programs=W}getUniformLocation(H,W){const j=this.programs.getProgram(W);return j?this.gl.getUniformLocation(j,H)??void 0:void 0}}var Z="position",V="index",X="transform";var C=function(H){return new Proxy(H,{get(j,K){const q=j,w=q[K];if(typeof w==="function")return(...M)=>{const Q=w.apply(q,M);return console.log(`gl.${String(K)}(`,M,") = ",Q),Q};else return console.log(`gl.${String(K)} = `,w),w}})},N={alpha:!0,antialias:!1,depth:!0,desynchronized:!0,failIfMajorPerformanceCaveat:void 0,powerPreference:"default",premultipliedAlpha:!0,preserveDrawingBuffer:!1,stencil:!1},k=WebGL2RenderingContext;class T extends J{gl;programs;attributeBuffers;uniforms;constructor(H,W){super();this.gl=C(H.getContext("webgl2",{...N,...W})),this.programs=this.own(new E(this.gl)),this.attributeBuffers=this.own(new B(this.gl,this.programs)),this.uniforms=this.own(new P(this.gl,this.programs))}initialize(){this.gl.enable(k.DEPTH_TEST),this.gl.depthFunc(k.LEQUAL),this.gl.enable(k.BLEND),this.gl.blendFunc(k.SRC_ALPHA,k.ONE_MINUS_SRC_ALPHA),this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight);{this.attributeBuffers.createBuffer(V);const H=this.attributeBuffers.getAttributeBuffer(V);this.attributeBuffers.bindBuffer(k.ELEMENT_ARRAY_BUFFER,H),this.attributeBuffers.bufferData(k.ELEMENT_ARRAY_BUFFER,V,Uint16Array.from([0,1,2,3,0,2]),0,k.STATIC_DRAW)}{this.attributeBuffers.createBuffer(Z);const H=this.attributeBuffers.getAttributeBuffer(Z);this.attributeBuffers.bindBuffer(k.ARRAY_BUFFER,H),this.gl.vertexAttribPointer(H.location,3,k.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(H.location),this.attributeBuffers.bufferData(k.ARRAY_BUFFER,Z,Float32Array.from([1,1,0,1,-1,0,-1,-1,0,-1,1,0]),0,k.STATIC_DRAW)}{this.attributeBuffers.createBuffer(X);const H=this.attributeBuffers.getAttributeBuffer(X);this.attributeBuffers.bindBuffer(k.ARRAY_BUFFER,H);for(let W=0;W<4;W++){const j=H.location+W;this.gl.vertexAttribPointer(j,4,k.FLOAT,!1,16*Float32Array.BYTES_PER_ELEMENT,W*4*Float32Array.BYTES_PER_ELEMENT),this.gl.enableVertexAttribArray(j),this.gl.vertexAttribDivisor(j,1)}this.attributeBuffers.bufferData(k.ARRAY_BUFFER,X,Float32Array.from([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0.5,0,0,0,0,0.5,0,0,0,0,0.5,0,0,0,0,1]),0,k.DYNAMIC_DRAW)}}updateTrianglePosition(H,W){const j=this.attributeBuffers.getAttributeBuffer(Z);this.attributeBuffers.bindBuffer(k.ARRAY_BUFFER,j),this.attributeBuffers.bufferSubData(k.ARRAY_BUFFER,Float32Array.from(W),H*4*3*Float32Array.BYTES_PER_ELEMENT)}drawArrays(H){this.gl.drawArrays(k.TRIANGLES,0,H)}drawElementsInstanced(H,W){this.gl.clear(k.COLOR_BUFFER_BIT|k.DEPTH_BUFFER_BIT),this.gl.drawElementsInstanced(k.TRIANGLES,H,k.UNSIGNED_SHORT,0,W)}bindVertexArray(){this.own(new R(this.gl))}}function o(){console.log("Hello World!")}function g(H){const W=new T(H);return W.programs.addProgram("test",`
            #version 300 es

            precision highp float;
            
            layout (location=0) in vec4 position;
            layout (location=1) in mat4 transform;

            void main() {
                gl_Position = transform * position;
                // gl_Position = position;
            }
        `,`
            #version 300 es

            precision highp float;
            out vec4 fragColor;
            
            void main() {
                fragColor = vec4(1.0, 0.0, 0.0, 0.5);
            }
        `),W.programs.useProgram("test"),W.initialize(),W.drawElementsInstanced(6,2),W}export{g as testCanvas,o as hello};

//# debugId=742300361FF3CBF564756e2164756e21
