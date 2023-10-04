var W0=Object.defineProperty;var Z0=(H,M)=>{for(var Q in M)W0(H,Q,{get:M[Q],enumerable:!0,configurable:!0,set:(W)=>M[Q]=()=>W})};class v{disposables;own(H){if(!this.disposables)this.disposables=new Set;return this.disposables.add(H),H}destroy(){this.disposables?.forEach((H)=>H.destroy())}}var k0=function(H,M,Q){function W(V,K){function $(F){return F===H?.VERTEX_SHADER?"vertex":F===H?.FRAGMENT_SHADER?"fragment":void 0}if(K!==H.VERTEX_SHADER&&K!==H.FRAGMENT_SHADER)throw new Error(`Shader error in ${$(K)}`);const Y=H.createShader(K);if(!Y)throw new Error(`Unable to generate ${$(K)} shader.`);if(H.shaderSource(Y,V),H.compileShader(Y),!H.getShaderParameter(Y,H.COMPILE_STATUS))console.error(`Shader compile error in ${$(K)}:`+H.getShaderInfoLog(Y));return Y}const Z=H.createProgram();if(!Z)throw new Error("Unable to create program.");const k=W(M,H.VERTEX_SHADER),J=W(Q,H.FRAGMENT_SHADER);if(H.attachShader(Z,k),H.attachShader(Z,J),H.linkProgram(Z),H.detachShader(Z,k),H.detachShader(Z,J),H.deleteShader(k),H.deleteShader(J),H.validateProgram(Z),!H.getProgramParameter(Z,H.LINK_STATUS))throw new Error("Unable to initialize the shader program:\n"+H.getProgramInfoLog(Z));return Z},J0=function(H,M){H.deleteProgram(M)};class x extends v{gl;program;constructor(H,M,Q){super();this.gl=H,this.program=k0(H,M.trim(),Q.trim())}use(){this.gl.useProgram(this.program)}destroy(){super.destroy(),J0(this.gl,this.program)}}class m extends v{activeProgramId="";gl;programs={};constructor(H){super();this.gl=H}addProgram(H,M,Q){if(this.programs[H])this.removeProgram(H);this.programs[H]=this.own(new x(this.gl,M,Q))}useProgram(H){if(this.activeProgramId!==H)this.activeProgramId=H,this.programs[H].use()}removeProgram(H){this.programs[H].destroy(),delete this.programs[H]}getProgram(H){return this.programs[H??this.activeProgramId]?.program}}class l extends v{gl;triangleArray;constructor(H){super();this.gl=H,this.triangleArray=H.createVertexArray(),H.bindVertexArray(this.triangleArray)}destroy(){this.gl.deleteVertexArray(this.triangleArray)}}class y extends v{bufferRecord={};lastBoundBuffer;gl;programs;constructor(H,M){super();this.gl=H,this.programs=M}getAttributeLocation(H,M){const Q=this.programs.getProgram(M);return Q?this.gl.getAttribLocation(Q,H)??-1:-1}createBuffer(H){this.deleteBuffer(H);const M=this.gl?.createBuffer();if(!M)throw new Error(`Unable to create buffer "${H}"`);const Q={buffer:M,location:this.getAttributeLocation(H)};return this.bufferRecord[H]=Q,Q}deleteBuffer(H){if(this.bufferRecord[H])this.gl.deleteBuffer(this.bufferRecord[H].buffer),delete this.bufferRecord[H]}getAttributeBuffer(H,M){const Q=this.bufferRecord[H];if(!Q){if(M)return this.createBuffer(H);throw new Error(`Attribute "${H}" not created. Make sure "createBuffer" is called.`)}return Q}bufferData(H,M,Q,W,Z){const k=this.getAttributeBuffer(M);if(Q)this.gl.bufferData(H,Q,Z);else this.gl.bufferData(H,W,Z);k.bufferSize=W||Q?.length,k.bufferArray=Q??new Float32Array(k.bufferSize/Float32Array.BYTES_PER_ELEMENT).fill(0),k.usage=Z,k.target=H}bufferSubData(H,M,Q,W,Z){if(W)this.gl.bufferSubData(H,Q,M,W,Z);else this.gl.bufferSubData(H,Q,M)}bindBuffer(H,M){if(this.lastBoundBuffer!==M)this.lastBoundBuffer=M,this.gl.bindBuffer(H,M.buffer)}destroy(){Object.keys(this.bufferRecord).forEach((H)=>this.deleteBuffer(H))}}class s extends v{gl;programs;constructor(H,M){super();this.gl=H,this.programs=M}getUniformLocation(H,M){const Q=this.programs.getProgram(M);return Q?this.gl.getUniformLocation(Q,H)??void 0:void 0}}var n="position",z="index",f="transform";var _=0.000001,i=typeof Float32Array!=="undefined"?Float32Array:Array;var BH=Math.PI/180;if(!Math.hypot)Math.hypot=function(){var H=0,M=arguments.length;while(M--)H+=arguments[M]*arguments[M];return Math.sqrt(H)};var p={};Z0(p,{transpose:()=>{{return R0}},translate:()=>{{return h0}},targetTo:()=>{{return x0}},subtract:()=>{{return Q0}},sub:()=>{{return o0}},str:()=>{{return m0}},set:()=>{{return F0}},scale:()=>{{return C0}},rotateZ:()=>{{return N0}},rotateY:()=>{{return D0}},rotateX:()=>{{return U0}},rotate:()=>{{return P0}},perspectiveZO:()=>{{return c0}},perspectiveNO:()=>{{return H0}},perspectiveFromFieldOfView:()=>{{return g0}},perspective:()=>{{return p0}},orthoZO:()=>{{return z0}},orthoNO:()=>{{return M0}},ortho:()=>{{return n0}},multiplyScalarAndAdd:()=>{{return r0}},multiplyScalar:()=>{{return s0}},multiply:()=>{{return o}},mul:()=>{{return u0}},lookAt:()=>{{return f0}},invert:()=>{{return B0}},identity:()=>{{return u}},getTranslation:()=>{{return S0}},getScaling:()=>{{return a}},getRotation:()=>{{return L0}},frustum:()=>{{return i0}},fromZRotation:()=>{{return I0}},fromYRotation:()=>{{return O0}},fromXRotation:()=>{{return G0}},fromValues:()=>{{return X0}},fromTranslation:()=>{{return T0}},fromScaling:()=>{{return A0}},fromRotationTranslationScaleOrigin:()=>{{return v0}},fromRotationTranslationScale:()=>{{return w0}},fromRotationTranslation:()=>{{return t}},fromRotation:()=>{{return _0}},fromQuat2:()=>{{return q0}},fromQuat:()=>{{return d0}},frob:()=>{{return l0}},exactEquals:()=>{{return e0}},equals:()=>{{return b0}},determinant:()=>{{return j0}},create:()=>{{return $0}},copy:()=>{{return Y0}},clone:()=>{{return V0}},adjoint:()=>{{return E0}},add:()=>{{return y0}}});function $0(){var H=new i(16);if(i!=Float32Array)H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[11]=0,H[12]=0,H[13]=0,H[14]=0;return H[0]=1,H[5]=1,H[10]=1,H[15]=1,H}function V0(H){var M=new i(16);return M[0]=H[0],M[1]=H[1],M[2]=H[2],M[3]=H[3],M[4]=H[4],M[5]=H[5],M[6]=H[6],M[7]=H[7],M[8]=H[8],M[9]=H[9],M[10]=H[10],M[11]=H[11],M[12]=H[12],M[13]=H[13],M[14]=H[14],M[15]=H[15],M}function Y0(H,M){return H[0]=M[0],H[1]=M[1],H[2]=M[2],H[3]=M[3],H[4]=M[4],H[5]=M[5],H[6]=M[6],H[7]=M[7],H[8]=M[8],H[9]=M[9],H[10]=M[10],H[11]=M[11],H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15],H}function X0(H,M,Q,W,Z,k,J,V,K,$,Y,F,B,R,j,E){var X=new i(16);return X[0]=H,X[1]=M,X[2]=Q,X[3]=W,X[4]=Z,X[5]=k,X[6]=J,X[7]=V,X[8]=K,X[9]=$,X[10]=Y,X[11]=F,X[12]=B,X[13]=R,X[14]=j,X[15]=E,X}function F0(H,M,Q,W,Z,k,J,V,K,$,Y,F,B,R,j,E,X){return H[0]=M,H[1]=Q,H[2]=W,H[3]=Z,H[4]=k,H[5]=J,H[6]=V,H[7]=K,H[8]=$,H[9]=Y,H[10]=F,H[11]=B,H[12]=R,H[13]=j,H[14]=E,H[15]=X,H}function u(H){return H[0]=1,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=1,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=1,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function R0(H,M){if(H===M){var Q=M[1],W=M[2],Z=M[3],k=M[6],J=M[7],V=M[11];H[1]=M[4],H[2]=M[8],H[3]=M[12],H[4]=Q,H[6]=M[9],H[7]=M[13],H[8]=W,H[9]=k,H[11]=M[14],H[12]=Z,H[13]=J,H[14]=V}else H[0]=M[0],H[1]=M[4],H[2]=M[8],H[3]=M[12],H[4]=M[1],H[5]=M[5],H[6]=M[9],H[7]=M[13],H[8]=M[2],H[9]=M[6],H[10]=M[10],H[11]=M[14],H[12]=M[3],H[13]=M[7],H[14]=M[11],H[15]=M[15];return H}function B0(H,M){var Q=M[0],W=M[1],Z=M[2],k=M[3],J=M[4],V=M[5],K=M[6],$=M[7],Y=M[8],F=M[9],B=M[10],R=M[11],j=M[12],E=M[13],X=M[14],h=M[15],N=Q*V-W*J,D=Q*K-Z*J,U=Q*$-k*J,C=W*K-Z*V,P=W*$-k*V,q=Z*$-k*K,G=Y*E-F*j,O=Y*X-B*j,I=Y*h-R*j,S=F*X-B*E,L=F*h-R*E,w=B*h-R*X,T=N*w-D*L+U*S+C*I-P*O+q*G;if(!T)return null;return T=1/T,H[0]=(V*w-K*L+$*S)*T,H[1]=(Z*L-W*w-k*S)*T,H[2]=(E*q-X*P+h*C)*T,H[3]=(B*P-F*q-R*C)*T,H[4]=(K*I-J*w-$*O)*T,H[5]=(Q*w-Z*I+k*O)*T,H[6]=(X*U-j*q-h*D)*T,H[7]=(Y*q-B*U+R*D)*T,H[8]=(J*L-V*I+$*G)*T,H[9]=(W*I-Q*L-k*G)*T,H[10]=(j*P-E*U+h*N)*T,H[11]=(F*U-Y*P-R*N)*T,H[12]=(V*O-J*S-K*G)*T,H[13]=(Q*S-W*O+Z*G)*T,H[14]=(E*D-j*C-X*N)*T,H[15]=(Y*C-F*D+B*N)*T,H}function E0(H,M){var Q=M[0],W=M[1],Z=M[2],k=M[3],J=M[4],V=M[5],K=M[6],$=M[7],Y=M[8],F=M[9],B=M[10],R=M[11],j=M[12],E=M[13],X=M[14],h=M[15];return H[0]=V*(B*h-R*X)-F*(K*h-$*X)+E*(K*R-$*B),H[1]=-(W*(B*h-R*X)-F*(Z*h-k*X)+E*(Z*R-k*B)),H[2]=W*(K*h-$*X)-V*(Z*h-k*X)+E*(Z*$-k*K),H[3]=-(W*(K*R-$*B)-V*(Z*R-k*B)+F*(Z*$-k*K)),H[4]=-(J*(B*h-R*X)-Y*(K*h-$*X)+j*(K*R-$*B)),H[5]=Q*(B*h-R*X)-Y*(Z*h-k*X)+j*(Z*R-k*B),H[6]=-(Q*(K*h-$*X)-J*(Z*h-k*X)+j*(Z*$-k*K)),H[7]=Q*(K*R-$*B)-J*(Z*R-k*B)+Y*(Z*$-k*K),H[8]=J*(F*h-R*E)-Y*(V*h-$*E)+j*(V*R-$*F),H[9]=-(Q*(F*h-R*E)-Y*(W*h-k*E)+j*(W*R-k*F)),H[10]=Q*(V*h-$*E)-J*(W*h-k*E)+j*(W*$-k*V),H[11]=-(Q*(V*R-$*F)-J*(W*R-k*F)+Y*(W*$-k*V)),H[12]=-(J*(F*X-B*E)-Y*(V*X-K*E)+j*(V*B-K*F)),H[13]=Q*(F*X-B*E)-Y*(W*X-Z*E)+j*(W*B-Z*F),H[14]=-(Q*(V*X-K*E)-J*(W*X-Z*E)+j*(W*K-Z*V)),H[15]=Q*(V*B-K*F)-J*(W*B-Z*F)+Y*(W*K-Z*V),H}function j0(H){var M=H[0],Q=H[1],W=H[2],Z=H[3],k=H[4],J=H[5],V=H[6],K=H[7],$=H[8],Y=H[9],F=H[10],B=H[11],R=H[12],j=H[13],E=H[14],X=H[15],h=M*J-Q*k,N=M*V-W*k,D=M*K-Z*k,U=Q*V-W*J,C=Q*K-Z*J,P=W*K-Z*V,q=$*j-Y*R,G=$*E-F*R,O=$*X-B*R,I=Y*E-F*j,S=Y*X-B*j,L=F*X-B*E;return h*L-N*S+D*I+U*O-C*G+P*q}function o(H,M,Q){var W=M[0],Z=M[1],k=M[2],J=M[3],V=M[4],K=M[5],$=M[6],Y=M[7],F=M[8],B=M[9],R=M[10],j=M[11],E=M[12],X=M[13],h=M[14],N=M[15],D=Q[0],U=Q[1],C=Q[2],P=Q[3];return H[0]=D*W+U*V+C*F+P*E,H[1]=D*Z+U*K+C*B+P*X,H[2]=D*k+U*$+C*R+P*h,H[3]=D*J+U*Y+C*j+P*N,D=Q[4],U=Q[5],C=Q[6],P=Q[7],H[4]=D*W+U*V+C*F+P*E,H[5]=D*Z+U*K+C*B+P*X,H[6]=D*k+U*$+C*R+P*h,H[7]=D*J+U*Y+C*j+P*N,D=Q[8],U=Q[9],C=Q[10],P=Q[11],H[8]=D*W+U*V+C*F+P*E,H[9]=D*Z+U*K+C*B+P*X,H[10]=D*k+U*$+C*R+P*h,H[11]=D*J+U*Y+C*j+P*N,D=Q[12],U=Q[13],C=Q[14],P=Q[15],H[12]=D*W+U*V+C*F+P*E,H[13]=D*Z+U*K+C*B+P*X,H[14]=D*k+U*$+C*R+P*h,H[15]=D*J+U*Y+C*j+P*N,H}function h0(H,M,Q){var W=Q[0],Z=Q[1],k=Q[2],J,V,K,$,Y,F,B,R,j,E,X,h;if(M===H)H[12]=M[0]*W+M[4]*Z+M[8]*k+M[12],H[13]=M[1]*W+M[5]*Z+M[9]*k+M[13],H[14]=M[2]*W+M[6]*Z+M[10]*k+M[14],H[15]=M[3]*W+M[7]*Z+M[11]*k+M[15];else J=M[0],V=M[1],K=M[2],$=M[3],Y=M[4],F=M[5],B=M[6],R=M[7],j=M[8],E=M[9],X=M[10],h=M[11],H[0]=J,H[1]=V,H[2]=K,H[3]=$,H[4]=Y,H[5]=F,H[6]=B,H[7]=R,H[8]=j,H[9]=E,H[10]=X,H[11]=h,H[12]=J*W+Y*Z+j*k+M[12],H[13]=V*W+F*Z+E*k+M[13],H[14]=K*W+B*Z+X*k+M[14],H[15]=$*W+R*Z+h*k+M[15];return H}function C0(H,M,Q){var W=Q[0],Z=Q[1],k=Q[2];return H[0]=M[0]*W,H[1]=M[1]*W,H[2]=M[2]*W,H[3]=M[3]*W,H[4]=M[4]*Z,H[5]=M[5]*Z,H[6]=M[6]*Z,H[7]=M[7]*Z,H[8]=M[8]*k,H[9]=M[9]*k,H[10]=M[10]*k,H[11]=M[11]*k,H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15],H}function P0(H,M,Q,W){var Z=W[0],k=W[1],J=W[2],V=Math.hypot(Z,k,J),K,$,Y,F,B,R,j,E,X,h,N,D,U,C,P,q,G,O,I,S,L,w,T,d;if(V<_)return null;if(V=1/V,Z*=V,k*=V,J*=V,K=Math.sin(Q),$=Math.cos(Q),Y=1-$,F=M[0],B=M[1],R=M[2],j=M[3],E=M[4],X=M[5],h=M[6],N=M[7],D=M[8],U=M[9],C=M[10],P=M[11],q=Z*Z*Y+$,G=k*Z*Y+J*K,O=J*Z*Y-k*K,I=Z*k*Y-J*K,S=k*k*Y+$,L=J*k*Y+Z*K,w=Z*J*Y+k*K,T=k*J*Y-Z*K,d=J*J*Y+$,H[0]=F*q+E*G+D*O,H[1]=B*q+X*G+U*O,H[2]=R*q+h*G+C*O,H[3]=j*q+N*G+P*O,H[4]=F*I+E*S+D*L,H[5]=B*I+X*S+U*L,H[6]=R*I+h*S+C*L,H[7]=j*I+N*S+P*L,H[8]=F*w+E*T+D*d,H[9]=B*w+X*T+U*d,H[10]=R*w+h*T+C*d,H[11]=j*w+N*T+P*d,M!==H)H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15];return H}function U0(H,M,Q){var W=Math.sin(Q),Z=Math.cos(Q),k=M[4],J=M[5],V=M[6],K=M[7],$=M[8],Y=M[9],F=M[10],B=M[11];if(M!==H)H[0]=M[0],H[1]=M[1],H[2]=M[2],H[3]=M[3],H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15];return H[4]=k*Z+$*W,H[5]=J*Z+Y*W,H[6]=V*Z+F*W,H[7]=K*Z+B*W,H[8]=$*Z-k*W,H[9]=Y*Z-J*W,H[10]=F*Z-V*W,H[11]=B*Z-K*W,H}function D0(H,M,Q){var W=Math.sin(Q),Z=Math.cos(Q),k=M[0],J=M[1],V=M[2],K=M[3],$=M[8],Y=M[9],F=M[10],B=M[11];if(M!==H)H[4]=M[4],H[5]=M[5],H[6]=M[6],H[7]=M[7],H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15];return H[0]=k*Z-$*W,H[1]=J*Z-Y*W,H[2]=V*Z-F*W,H[3]=K*Z-B*W,H[8]=k*W+$*Z,H[9]=J*W+Y*Z,H[10]=V*W+F*Z,H[11]=K*W+B*Z,H}function N0(H,M,Q){var W=Math.sin(Q),Z=Math.cos(Q),k=M[0],J=M[1],V=M[2],K=M[3],$=M[4],Y=M[5],F=M[6],B=M[7];if(M!==H)H[8]=M[8],H[9]=M[9],H[10]=M[10],H[11]=M[11],H[12]=M[12],H[13]=M[13],H[14]=M[14],H[15]=M[15];return H[0]=k*Z+$*W,H[1]=J*Z+Y*W,H[2]=V*Z+F*W,H[3]=K*Z+B*W,H[4]=$*Z-k*W,H[5]=Y*Z-J*W,H[6]=F*Z-V*W,H[7]=B*Z-K*W,H}function T0(H,M){return H[0]=1,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=1,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=1,H[11]=0,H[12]=M[0],H[13]=M[1],H[14]=M[2],H[15]=1,H}function A0(H,M){return H[0]=M[0],H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=M[1],H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=M[2],H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function _0(H,M,Q){var W=Q[0],Z=Q[1],k=Q[2],J=Math.hypot(W,Z,k),V,K,$;if(J<_)return null;return J=1/J,W*=J,Z*=J,k*=J,V=Math.sin(M),K=Math.cos(M),$=1-K,H[0]=W*W*$+K,H[1]=Z*W*$+k*V,H[2]=k*W*$-Z*V,H[3]=0,H[4]=W*Z*$-k*V,H[5]=Z*Z*$+K,H[6]=k*Z*$+W*V,H[7]=0,H[8]=W*k*$+Z*V,H[9]=Z*k*$-W*V,H[10]=k*k*$+K,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function G0(H,M){var Q=Math.sin(M),W=Math.cos(M);return H[0]=1,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=W,H[6]=Q,H[7]=0,H[8]=0,H[9]=-Q,H[10]=W,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function O0(H,M){var Q=Math.sin(M),W=Math.cos(M);return H[0]=W,H[1]=0,H[2]=-Q,H[3]=0,H[4]=0,H[5]=1,H[6]=0,H[7]=0,H[8]=Q,H[9]=0,H[10]=W,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function I0(H,M){var Q=Math.sin(M),W=Math.cos(M);return H[0]=W,H[1]=Q,H[2]=0,H[3]=0,H[4]=-Q,H[5]=W,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=1,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function t(H,M,Q){var W=M[0],Z=M[1],k=M[2],J=M[3],V=W+W,K=Z+Z,$=k+k,Y=W*V,F=W*K,B=W*$,R=Z*K,j=Z*$,E=k*$,X=J*V,h=J*K,N=J*$;return H[0]=1-(R+E),H[1]=F+N,H[2]=B-h,H[3]=0,H[4]=F-N,H[5]=1-(Y+E),H[6]=j+X,H[7]=0,H[8]=B+h,H[9]=j-X,H[10]=1-(Y+R),H[11]=0,H[12]=Q[0],H[13]=Q[1],H[14]=Q[2],H[15]=1,H}function q0(H,M){var Q=new i(3),W=-M[0],Z=-M[1],k=-M[2],J=M[3],V=M[4],K=M[5],$=M[6],Y=M[7],F=W*W+Z*Z+k*k+J*J;if(F>0)Q[0]=(V*J+Y*W+K*k-$*Z)*2/F,Q[1]=(K*J+Y*Z+$*W-V*k)*2/F,Q[2]=($*J+Y*k+V*Z-K*W)*2/F;else Q[0]=(V*J+Y*W+K*k-$*Z)*2,Q[1]=(K*J+Y*Z+$*W-V*k)*2,Q[2]=($*J+Y*k+V*Z-K*W)*2;return t(H,M,Q),H}function S0(H,M){return H[0]=M[12],H[1]=M[13],H[2]=M[14],H}function a(H,M){var Q=M[0],W=M[1],Z=M[2],k=M[4],J=M[5],V=M[6],K=M[8],$=M[9],Y=M[10];return H[0]=Math.hypot(Q,W,Z),H[1]=Math.hypot(k,J,V),H[2]=Math.hypot(K,$,Y),H}function L0(H,M){var Q=new i(3);a(Q,M);var W=1/Q[0],Z=1/Q[1],k=1/Q[2],J=M[0]*W,V=M[1]*Z,K=M[2]*k,$=M[4]*W,Y=M[5]*Z,F=M[6]*k,B=M[8]*W,R=M[9]*Z,j=M[10]*k,E=J+Y+j,X=0;if(E>0)X=Math.sqrt(E+1)*2,H[3]=0.25*X,H[0]=(F-R)/X,H[1]=(B-K)/X,H[2]=(V-$)/X;else if(J>Y&&J>j)X=Math.sqrt(1+J-Y-j)*2,H[3]=(F-R)/X,H[0]=0.25*X,H[1]=(V+$)/X,H[2]=(B+K)/X;else if(Y>j)X=Math.sqrt(1+Y-J-j)*2,H[3]=(B-K)/X,H[0]=(V+$)/X,H[1]=0.25*X,H[2]=(F+R)/X;else X=Math.sqrt(1+j-J-Y)*2,H[3]=(V-$)/X,H[0]=(B+K)/X,H[1]=(F+R)/X,H[2]=0.25*X;return H}function w0(H,M,Q,W){var Z=M[0],k=M[1],J=M[2],V=M[3],K=Z+Z,$=k+k,Y=J+J,F=Z*K,B=Z*$,R=Z*Y,j=k*$,E=k*Y,X=J*Y,h=V*K,N=V*$,D=V*Y,U=W[0],C=W[1],P=W[2];return H[0]=(1-(j+X))*U,H[1]=(B+D)*U,H[2]=(R-N)*U,H[3]=0,H[4]=(B-D)*C,H[5]=(1-(F+X))*C,H[6]=(E+h)*C,H[7]=0,H[8]=(R+N)*P,H[9]=(E-h)*P,H[10]=(1-(F+j))*P,H[11]=0,H[12]=Q[0],H[13]=Q[1],H[14]=Q[2],H[15]=1,H}function v0(H,M,Q,W,Z){var k=M[0],J=M[1],V=M[2],K=M[3],$=k+k,Y=J+J,F=V+V,B=k*$,R=k*Y,j=k*F,E=J*Y,X=J*F,h=V*F,N=K*$,D=K*Y,U=K*F,C=W[0],P=W[1],q=W[2],G=Z[0],O=Z[1],I=Z[2],S=(1-(E+h))*C,L=(R+U)*C,w=(j-D)*C,T=(R-U)*P,d=(1-(B+h))*P,c=(X+N)*P,g=(j+D)*q,e=(X-N)*q,b=(1-(B+E))*q;return H[0]=S,H[1]=L,H[2]=w,H[3]=0,H[4]=T,H[5]=d,H[6]=c,H[7]=0,H[8]=g,H[9]=e,H[10]=b,H[11]=0,H[12]=Q[0]+G-(S*G+T*O+g*I),H[13]=Q[1]+O-(L*G+d*O+e*I),H[14]=Q[2]+I-(w*G+c*O+b*I),H[15]=1,H}function d0(H,M){var Q=M[0],W=M[1],Z=M[2],k=M[3],J=Q+Q,V=W+W,K=Z+Z,$=Q*J,Y=W*J,F=W*V,B=Z*J,R=Z*V,j=Z*K,E=k*J,X=k*V,h=k*K;return H[0]=1-F-j,H[1]=Y+h,H[2]=B-X,H[3]=0,H[4]=Y-h,H[5]=1-$-j,H[6]=R+E,H[7]=0,H[8]=B+X,H[9]=R-E,H[10]=1-$-F,H[11]=0,H[12]=0,H[13]=0,H[14]=0,H[15]=1,H}function i0(H,M,Q,W,Z,k,J){var V=1/(Q-M),K=1/(Z-W),$=1/(k-J);return H[0]=k*2*V,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=k*2*K,H[6]=0,H[7]=0,H[8]=(Q+M)*V,H[9]=(Z+W)*K,H[10]=(J+k)*$,H[11]=-1,H[12]=0,H[13]=0,H[14]=J*k*2*$,H[15]=0,H}function H0(H,M,Q,W,Z){var k=1/Math.tan(M/2),J;if(H[0]=k/Q,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=k,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[11]=-1,H[12]=0,H[13]=0,H[15]=0,Z!=null&&Z!==Infinity)J=1/(W-Z),H[10]=(Z+W)*J,H[14]=2*Z*W*J;else H[10]=-1,H[14]=-2*W;return H}function c0(H,M,Q,W,Z){var k=1/Math.tan(M/2),J;if(H[0]=k/Q,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=k,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[11]=-1,H[12]=0,H[13]=0,H[15]=0,Z!=null&&Z!==Infinity)J=1/(W-Z),H[10]=Z*J,H[14]=Z*W*J;else H[10]=-1,H[14]=-W;return H}function g0(H,M,Q,W){var Z=Math.tan(M.upDegrees*Math.PI/180),k=Math.tan(M.downDegrees*Math.PI/180),J=Math.tan(M.leftDegrees*Math.PI/180),V=Math.tan(M.rightDegrees*Math.PI/180),K=2/(J+V),$=2/(Z+k);return H[0]=K,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=$,H[6]=0,H[7]=0,H[8]=-((J-V)*K*0.5),H[9]=(Z-k)*$*0.5,H[10]=W/(Q-W),H[11]=-1,H[12]=0,H[13]=0,H[14]=W*Q/(Q-W),H[15]=0,H}function M0(H,M,Q,W,Z,k,J){var V=1/(M-Q),K=1/(W-Z),$=1/(k-J);return H[0]=-2*V,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=-2*K,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=2*$,H[11]=0,H[12]=(M+Q)*V,H[13]=(Z+W)*K,H[14]=(J+k)*$,H[15]=1,H}function z0(H,M,Q,W,Z,k,J){var V=1/(M-Q),K=1/(W-Z),$=1/(k-J);return H[0]=-2*V,H[1]=0,H[2]=0,H[3]=0,H[4]=0,H[5]=-2*K,H[6]=0,H[7]=0,H[8]=0,H[9]=0,H[10]=$,H[11]=0,H[12]=(M+Q)*V,H[13]=(Z+W)*K,H[14]=k*$,H[15]=1,H}function f0(H,M,Q,W){var Z,k,J,V,K,$,Y,F,B,R,j=M[0],E=M[1],X=M[2],h=W[0],N=W[1],D=W[2],U=Q[0],C=Q[1],P=Q[2];if(Math.abs(j-U)<_&&Math.abs(E-C)<_&&Math.abs(X-P)<_)return u(H);if(Y=j-U,F=E-C,B=X-P,R=1/Math.hypot(Y,F,B),Y*=R,F*=R,B*=R,Z=N*B-D*F,k=D*Y-h*B,J=h*F-N*Y,R=Math.hypot(Z,k,J),!R)Z=0,k=0,J=0;else R=1/R,Z*=R,k*=R,J*=R;if(V=F*J-B*k,K=B*Z-Y*J,$=Y*k-F*Z,R=Math.hypot(V,K,$),!R)V=0,K=0,$=0;else R=1/R,V*=R,K*=R,$*=R;return H[0]=Z,H[1]=V,H[2]=Y,H[3]=0,H[4]=k,H[5]=K,H[6]=F,H[7]=0,H[8]=J,H[9]=$,H[10]=B,H[11]=0,H[12]=-(Z*j+k*E+J*X),H[13]=-(V*j+K*E+$*X),H[14]=-(Y*j+F*E+B*X),H[15]=1,H}function x0(H,M,Q,W){var Z=M[0],k=M[1],J=M[2],V=W[0],K=W[1],$=W[2],Y=Z-Q[0],F=k-Q[1],B=J-Q[2],R=Y*Y+F*F+B*B;if(R>0)R=1/Math.sqrt(R),Y*=R,F*=R,B*=R;var j=K*B-$*F,E=$*Y-V*B,X=V*F-K*Y;if(R=j*j+E*E+X*X,R>0)R=1/Math.sqrt(R),j*=R,E*=R,X*=R;return H[0]=j,H[1]=E,H[2]=X,H[3]=0,H[4]=F*X-B*E,H[5]=B*j-Y*X,H[6]=Y*E-F*j,H[7]=0,H[8]=Y,H[9]=F,H[10]=B,H[11]=0,H[12]=Z,H[13]=k,H[14]=J,H[15]=1,H}function m0(H){return"mat4("+H[0]+", "+H[1]+", "+H[2]+", "+H[3]+", "+H[4]+", "+H[5]+", "+H[6]+", "+H[7]+", "+H[8]+", "+H[9]+", "+H[10]+", "+H[11]+", "+H[12]+", "+H[13]+", "+H[14]+", "+H[15]+")"}function l0(H){return Math.hypot(H[0],H[1],H[2],H[3],H[4],H[5],H[6],H[7],H[8],H[9],H[10],H[11],H[12],H[13],H[14],H[15])}function y0(H,M,Q){return H[0]=M[0]+Q[0],H[1]=M[1]+Q[1],H[2]=M[2]+Q[2],H[3]=M[3]+Q[3],H[4]=M[4]+Q[4],H[5]=M[5]+Q[5],H[6]=M[6]+Q[6],H[7]=M[7]+Q[7],H[8]=M[8]+Q[8],H[9]=M[9]+Q[9],H[10]=M[10]+Q[10],H[11]=M[11]+Q[11],H[12]=M[12]+Q[12],H[13]=M[13]+Q[13],H[14]=M[14]+Q[14],H[15]=M[15]+Q[15],H}function Q0(H,M,Q){return H[0]=M[0]-Q[0],H[1]=M[1]-Q[1],H[2]=M[2]-Q[2],H[3]=M[3]-Q[3],H[4]=M[4]-Q[4],H[5]=M[5]-Q[5],H[6]=M[6]-Q[6],H[7]=M[7]-Q[7],H[8]=M[8]-Q[8],H[9]=M[9]-Q[9],H[10]=M[10]-Q[10],H[11]=M[11]-Q[11],H[12]=M[12]-Q[12],H[13]=M[13]-Q[13],H[14]=M[14]-Q[14],H[15]=M[15]-Q[15],H}function s0(H,M,Q){return H[0]=M[0]*Q,H[1]=M[1]*Q,H[2]=M[2]*Q,H[3]=M[3]*Q,H[4]=M[4]*Q,H[5]=M[5]*Q,H[6]=M[6]*Q,H[7]=M[7]*Q,H[8]=M[8]*Q,H[9]=M[9]*Q,H[10]=M[10]*Q,H[11]=M[11]*Q,H[12]=M[12]*Q,H[13]=M[13]*Q,H[14]=M[14]*Q,H[15]=M[15]*Q,H}function r0(H,M,Q,W){return H[0]=M[0]+Q[0]*W,H[1]=M[1]+Q[1]*W,H[2]=M[2]+Q[2]*W,H[3]=M[3]+Q[3]*W,H[4]=M[4]+Q[4]*W,H[5]=M[5]+Q[5]*W,H[6]=M[6]+Q[6]*W,H[7]=M[7]+Q[7]*W,H[8]=M[8]+Q[8]*W,H[9]=M[9]+Q[9]*W,H[10]=M[10]+Q[10]*W,H[11]=M[11]+Q[11]*W,H[12]=M[12]+Q[12]*W,H[13]=M[13]+Q[13]*W,H[14]=M[14]+Q[14]*W,H[15]=M[15]+Q[15]*W,H}function e0(H,M){return H[0]===M[0]&&H[1]===M[1]&&H[2]===M[2]&&H[3]===M[3]&&H[4]===M[4]&&H[5]===M[5]&&H[6]===M[6]&&H[7]===M[7]&&H[8]===M[8]&&H[9]===M[9]&&H[10]===M[10]&&H[11]===M[11]&&H[12]===M[12]&&H[13]===M[13]&&H[14]===M[14]&&H[15]===M[15]}function b0(H,M){var Q=H[0],W=H[1],Z=H[2],k=H[3],J=H[4],V=H[5],K=H[6],$=H[7],Y=H[8],F=H[9],B=H[10],R=H[11],j=H[12],E=H[13],X=H[14],h=H[15],N=M[0],D=M[1],U=M[2],C=M[3],P=M[4],q=M[5],G=M[6],O=M[7],I=M[8],S=M[9],L=M[10],w=M[11],T=M[12],d=M[13],c=M[14],g=M[15];return Math.abs(Q-N)<=_*Math.max(1,Math.abs(Q),Math.abs(N))&&Math.abs(W-D)<=_*Math.max(1,Math.abs(W),Math.abs(D))&&Math.abs(Z-U)<=_*Math.max(1,Math.abs(Z),Math.abs(U))&&Math.abs(k-C)<=_*Math.max(1,Math.abs(k),Math.abs(C))&&Math.abs(J-P)<=_*Math.max(1,Math.abs(J),Math.abs(P))&&Math.abs(V-q)<=_*Math.max(1,Math.abs(V),Math.abs(q))&&Math.abs(K-G)<=_*Math.max(1,Math.abs(K),Math.abs(G))&&Math.abs($-O)<=_*Math.max(1,Math.abs($),Math.abs(O))&&Math.abs(Y-I)<=_*Math.max(1,Math.abs(Y),Math.abs(I))&&Math.abs(F-S)<=_*Math.max(1,Math.abs(F),Math.abs(S))&&Math.abs(B-L)<=_*Math.max(1,Math.abs(B),Math.abs(L))&&Math.abs(R-w)<=_*Math.max(1,Math.abs(R),Math.abs(w))&&Math.abs(j-T)<=_*Math.max(1,Math.abs(j),Math.abs(T))&&Math.abs(E-d)<=_*Math.max(1,Math.abs(E),Math.abs(d))&&Math.abs(X-c)<=_*Math.max(1,Math.abs(X),Math.abs(c))&&Math.abs(h-g)<=_*Math.max(1,Math.abs(h),Math.abs(g))}var p0=H0,n0=M0,u0=o,o0=Q0;var a0=function(H){return new Proxy(H,{get(Q,W){const Z=Q,k=Z[W];if(typeof k==="function")return(...V)=>{const K=k.apply(Z,V);return console.log(`gl.${String(W)}(`,V,") = ",K),K};else return console.log(`gl.${String(W)} = `,k),k}})},t0={alpha:!0,antialias:!1,depth:!0,desynchronized:!0,failIfMajorPerformanceCaveat:void 0,powerPreference:"default",premultipliedAlpha:!0,preserveDrawingBuffer:!1,stencil:!1},A=WebGL2RenderingContext;class r extends v{gl;programs;attributeBuffers;uniforms;constructor(H,M){super();this.gl=a0(H.getContext("webgl2",{...t0,...M})),this.programs=this.own(new m(this.gl)),this.attributeBuffers=this.own(new y(this.gl,this.programs)),this.uniforms=this.own(new s(this.gl,this.programs))}initialize(){this.gl.enable(A.DEPTH_TEST),this.gl.depthFunc(A.LEQUAL),this.gl.enable(A.BLEND),this.gl.blendFunc(A.SRC_ALPHA,A.ONE_MINUS_SRC_ALPHA),this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight);{this.attributeBuffers.createBuffer(z);const H=this.attributeBuffers.getAttributeBuffer(z);this.attributeBuffers.bindBuffer(A.ELEMENT_ARRAY_BUFFER,H),this.attributeBuffers.bufferData(A.ELEMENT_ARRAY_BUFFER,z,Uint16Array.from([0,1,2,3,0,2]),0,A.STATIC_DRAW)}{this.attributeBuffers.createBuffer(n);const H=this.attributeBuffers.getAttributeBuffer(n);this.attributeBuffers.bindBuffer(A.ARRAY_BUFFER,H),this.gl.vertexAttribPointer(H.location,3,A.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(H.location),this.attributeBuffers.bufferData(A.ARRAY_BUFFER,n,Float32Array.from([1,1,0,1,-1,0,-1,-1,0,-1,1,0]),0,A.STATIC_DRAW)}{this.attributeBuffers.createBuffer(f);const H=this.attributeBuffers.getAttributeBuffer(f);this.attributeBuffers.bindBuffer(A.ARRAY_BUFFER,H);for(let M=0;M<4;M++){const Q=H.location+M;this.gl.vertexAttribPointer(Q,4,A.FLOAT,!1,16*Float32Array.BYTES_PER_ELEMENT,M*4*Float32Array.BYTES_PER_ELEMENT),this.gl.enableVertexAttribArray(Q),this.gl.vertexAttribDivisor(Q,1)}this.attributeBuffers.bufferData(A.ARRAY_BUFFER,f,Float32Array.from([...p.identity(p.create()),...p.fromZRotation(p.create(),Math.PI/4)]),0,A.DYNAMIC_DRAW)}}updateTrianglePosition(H,M){const Q=this.attributeBuffers.getAttributeBuffer(n);this.attributeBuffers.bindBuffer(A.ARRAY_BUFFER,Q),this.attributeBuffers.bufferSubData(A.ARRAY_BUFFER,Float32Array.from(M),H*4*3*Float32Array.BYTES_PER_ELEMENT)}drawArrays(H){this.gl.drawArrays(A.TRIANGLES,0,H)}drawElementsInstanced(H,M){this.gl.clear(A.COLOR_BUFFER_BIT|A.DEPTH_BUFFER_BIT),this.gl.drawElementsInstanced(A.TRIANGLES,H,A.UNSIGNED_SHORT,0,M)}bindVertexArray(){this.own(new l(this.gl))}}function _H(){console.log("Hello World!")}function GH(H){const M=new r(H);return M.programs.addProgram("test",`
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
        `),M.programs.useProgram("test"),M.initialize(),M.drawElementsInstanced(6,2),M}export{GH as testCanvas,_H as hello};

//# debugId=11EC5462E010CC7264756e2164756e21
