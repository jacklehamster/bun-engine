var e0=Object.defineProperty;var o=(M,Q)=>{for(var V in Q)e0(M,V,{get:Q[V],enumerable:!0,configurable:!0,set:(W)=>Q[V]=()=>W})};class n{disposables;own(M){if(!this.disposables)this.disposables=new Set;return this.disposables.add(M),M}destroy(){this.disposables?.forEach((M)=>M.destroy())}}var b0=function(M,Q,V){function W($,H){function X(C){return C===M?.VERTEX_SHADER?"vertex":C===M?.FRAGMENT_SHADER?"fragment":void 0}if(H!==M.VERTEX_SHADER&&H!==M.FRAGMENT_SHADER)throw new Error(`Shader error in ${X(H)}`);const J=M.createShader(H);if(!J)throw new Error(`Unable to generate ${X(H)} shader.`);if(M.shaderSource(J,$),M.compileShader(J),!M.getShaderParameter(J,M.COMPILE_STATUS))console.error(`Shader compile error in ${X(H)}:`+M.getShaderInfoLog(J));return J}const Y=M.createProgram();if(!Y)throw new Error("Unable to create program.");const Z=W(Q,M.VERTEX_SHADER),K=W(V,M.FRAGMENT_SHADER);if(M.attachShader(Y,Z),M.attachShader(Y,K),M.linkProgram(Y),M.detachShader(Y,Z),M.detachShader(Y,K),M.deleteShader(Z),M.deleteShader(K),M.validateProgram(Y),!M.getProgramParameter(Y,M.LINK_STATUS))throw new Error("Unable to initialize the shader program:\n"+M.getProgramInfoLog(Y));return Y},u0=function(M,Q){M.deleteProgram(Q)};class t extends n{gl;program;constructor(M,Q,V){super();this.gl=M,this.program=b0(M,Q.trim(),V.trim())}use(){this.gl.useProgram(this.program)}destroy(){super.destroy(),u0(this.gl,this.program)}}class a extends n{activeProgramId="";gl;programs={};constructor(M){super();this.gl=M}addProgram(M,Q,V){if(this.programs[M])this.removeProgram(M);this.programs[M]=this.own(new t(this.gl,Q,V))}useProgram(M){if(this.activeProgramId!==M)this.activeProgramId=M,this.programs[M].use()}removeProgram(M){this.programs[M].destroy(),delete this.programs[M]}getProgram(M){return this.programs[M??this.activeProgramId]?.program}}class M0 extends n{gl;triangleArray;constructor(M){super();this.gl=M,this.triangleArray=M.createVertexArray(),M.bindVertexArray(this.triangleArray)}destroy(){this.gl.deleteVertexArray(this.triangleArray)}}class Q0 extends n{bufferRecord={};lastBoundBuffer;gl;programs;constructor(M,Q){super();this.gl=M,this.programs=Q}getAttributeLocation(M,Q){const V=this.programs.getProgram(Q);return V?this.gl.getAttribLocation(V,M)??-1:-1}createBuffer(M){this.deleteBuffer(M);const Q=this.gl?.createBuffer();if(!Q)throw new Error(`Unable to create buffer "${M}"`);const V={buffer:Q,location:this.getAttributeLocation(M)};return this.bufferRecord[M]=V,V}deleteBuffer(M){if(this.bufferRecord[M])this.gl.deleteBuffer(this.bufferRecord[M].buffer),delete this.bufferRecord[M]}getAttributeBuffer(M,Q){const V=this.bufferRecord[M];if(!V){if(Q)return this.createBuffer(M);throw new Error(`Attribute "${M}" not created. Make sure "createBuffer" is called.`)}return V}bufferData(M,Q,V,W,Y){const Z=this.getAttributeBuffer(Q);if(V)this.gl.bufferData(M,V,Y);else this.gl.bufferData(M,W,Y);Z.bufferSize=W||V?.length,Z.bufferArray=V??new Float32Array(Z.bufferSize/Float32Array.BYTES_PER_ELEMENT).fill(0),Z.usage=Y,Z.target=M}bufferSubData(M,Q,V,W,Y){if(W)this.gl.bufferSubData(M,V,Q,W,Y);else this.gl.bufferSubData(M,V,Q)}bindBuffer(M,Q){if(this.lastBoundBuffer!==Q)this.lastBoundBuffer=Q,this.gl.bindBuffer(M,Q.buffer)}destroy(){Object.keys(this.bufferRecord).forEach((M)=>this.deleteBuffer(M))}}class V0 extends n{gl;programs;constructor(M,Q){super();this.gl=M,this.programs=Q}getUniformLocation(M,Q){const V=this.programs.getProgram(Q);return V?this.gl.getUniformLocation(V,M)??void 0:void 0}}var l="position",m="index",r="transform",J0="cam";var A=0.000001,I=typeof Float32Array!=="undefined"?Float32Array:Array,d=Math.random,EV=Math.PI/180;if(!Math.hypot)Math.hypot=function(){var M=0,Q=arguments.length;while(Q--)M+=arguments[Q]*arguments[Q];return Math.sqrt(M)};function B0(){var M=new I(9);if(I!=Float32Array)M[1]=0,M[2]=0,M[3]=0,M[5]=0,M[6]=0,M[7]=0;return M[0]=1,M[4]=1,M[8]=1,M}var O={};o(O,{transpose:()=>{{return WM}},translate:()=>{{return $M}},targetTo:()=>{{return pM}},subtract:()=>{{return U0}},sub:()=>{{return lM}},str:()=>{{return wM}},set:()=>{{return VM}},scale:()=>{{return HM}},rotateZ:()=>{{return CM}},rotateY:()=>{{return BM}},rotateX:()=>{{return JM}},rotate:()=>{{return XM}},perspectiveZO:()=>{{return GM}},perspectiveNO:()=>{{return F0}},perspectiveFromFieldOfView:()=>{{return _M}},perspective:()=>{{return IM}},orthoZO:()=>{{return LM}},orthoNO:()=>{{return N0}},ortho:()=>{{return SM}},multiplyScalarAndAdd:()=>{{return dM}},multiplyScalar:()=>{{return gM}},multiply:()=>{{return P0}},mul:()=>{{return cM}},lookAt:()=>{{return qM}},invert:()=>{{return YM}},identity:()=>{{return C0}},getTranslation:()=>{{return DM}},getScaling:()=>{{return E0}},getRotation:()=>{{return kM}},frustum:()=>{{return OM}},fromZRotation:()=>{{return UM}},fromYRotation:()=>{{return NM}},fromXRotation:()=>{{return FM}},fromValues:()=>{{return QM}},fromTranslation:()=>{{return PM}},fromScaling:()=>{{return hM}},fromRotationTranslationScaleOrigin:()=>{{return TM}},fromRotationTranslationScale:()=>{{return AM}},fromRotationTranslation:()=>{{return h0}},fromRotation:()=>{{return EM}},fromQuat2:()=>{{return RM}},fromQuat:()=>{{return jM}},frob:()=>{{return vM}},exactEquals:()=>{{return iM}},equals:()=>{{return fM}},determinant:()=>{{return KM}},create:()=>{{return t0}},copy:()=>{{return MM}},clone:()=>{{return a0}},adjoint:()=>{{return ZM}},add:()=>{{return nM}}});function t0(){var M=new I(16);if(I!=Float32Array)M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[11]=0,M[12]=0,M[13]=0,M[14]=0;return M[0]=1,M[5]=1,M[10]=1,M[15]=1,M}function a0(M){var Q=new I(16);return Q[0]=M[0],Q[1]=M[1],Q[2]=M[2],Q[3]=M[3],Q[4]=M[4],Q[5]=M[5],Q[6]=M[6],Q[7]=M[7],Q[8]=M[8],Q[9]=M[9],Q[10]=M[10],Q[11]=M[11],Q[12]=M[12],Q[13]=M[13],Q[14]=M[14],Q[15]=M[15],Q}function MM(M,Q){return M[0]=Q[0],M[1]=Q[1],M[2]=Q[2],M[3]=Q[3],M[4]=Q[4],M[5]=Q[5],M[6]=Q[6],M[7]=Q[7],M[8]=Q[8],M[9]=Q[9],M[10]=Q[10],M[11]=Q[11],M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15],M}function QM(M,Q,V,W,Y,Z,K,$,H,X,J,C,h,P,F,E){var B=new I(16);return B[0]=M,B[1]=Q,B[2]=V,B[3]=W,B[4]=Y,B[5]=Z,B[6]=K,B[7]=$,B[8]=H,B[9]=X,B[10]=J,B[11]=C,B[12]=h,B[13]=P,B[14]=F,B[15]=E,B}function VM(M,Q,V,W,Y,Z,K,$,H,X,J,C,h,P,F,E,B){return M[0]=Q,M[1]=V,M[2]=W,M[3]=Y,M[4]=Z,M[5]=K,M[6]=$,M[7]=H,M[8]=X,M[9]=J,M[10]=C,M[11]=h,M[12]=P,M[13]=F,M[14]=E,M[15]=B,M}function C0(M){return M[0]=1,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=1,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=1,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function WM(M,Q){if(M===Q){var V=Q[1],W=Q[2],Y=Q[3],Z=Q[6],K=Q[7],$=Q[11];M[1]=Q[4],M[2]=Q[8],M[3]=Q[12],M[4]=V,M[6]=Q[9],M[7]=Q[13],M[8]=W,M[9]=Z,M[11]=Q[14],M[12]=Y,M[13]=K,M[14]=$}else M[0]=Q[0],M[1]=Q[4],M[2]=Q[8],M[3]=Q[12],M[4]=Q[1],M[5]=Q[5],M[6]=Q[9],M[7]=Q[13],M[8]=Q[2],M[9]=Q[6],M[10]=Q[10],M[11]=Q[14],M[12]=Q[3],M[13]=Q[7],M[14]=Q[11],M[15]=Q[15];return M}function YM(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=Q[4],$=Q[5],H=Q[6],X=Q[7],J=Q[8],C=Q[9],h=Q[10],P=Q[11],F=Q[12],E=Q[13],B=Q[14],N=Q[15],T=V*$-W*K,k=V*H-Y*K,D=V*X-Z*K,U=W*H-Y*$,R=W*X-Z*$,q=Y*X-Z*H,_=J*E-C*F,S=J*B-h*F,L=J*N-P*F,p=C*B-h*E,w=C*N-P*E,v=h*N-P*B,j=T*v-k*w+D*p+U*L-R*S+q*_;if(!j)return null;return j=1/j,M[0]=($*v-H*w+X*p)*j,M[1]=(Y*w-W*v-Z*p)*j,M[2]=(E*q-B*R+N*U)*j,M[3]=(h*R-C*q-P*U)*j,M[4]=(H*L-K*v-X*S)*j,M[5]=(V*v-Y*L+Z*S)*j,M[6]=(B*D-F*q-N*k)*j,M[7]=(J*q-h*D+P*k)*j,M[8]=(K*w-$*L+X*_)*j,M[9]=(W*L-V*w-Z*_)*j,M[10]=(F*R-E*D+N*T)*j,M[11]=(C*D-J*R-P*T)*j,M[12]=($*S-K*p-H*_)*j,M[13]=(V*p-W*S+Y*_)*j,M[14]=(E*k-F*U-B*T)*j,M[15]=(J*U-C*k+h*T)*j,M}function ZM(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=Q[4],$=Q[5],H=Q[6],X=Q[7],J=Q[8],C=Q[9],h=Q[10],P=Q[11],F=Q[12],E=Q[13],B=Q[14],N=Q[15];return M[0]=$*(h*N-P*B)-C*(H*N-X*B)+E*(H*P-X*h),M[1]=-(W*(h*N-P*B)-C*(Y*N-Z*B)+E*(Y*P-Z*h)),M[2]=W*(H*N-X*B)-$*(Y*N-Z*B)+E*(Y*X-Z*H),M[3]=-(W*(H*P-X*h)-$*(Y*P-Z*h)+C*(Y*X-Z*H)),M[4]=-(K*(h*N-P*B)-J*(H*N-X*B)+F*(H*P-X*h)),M[5]=V*(h*N-P*B)-J*(Y*N-Z*B)+F*(Y*P-Z*h),M[6]=-(V*(H*N-X*B)-K*(Y*N-Z*B)+F*(Y*X-Z*H)),M[7]=V*(H*P-X*h)-K*(Y*P-Z*h)+J*(Y*X-Z*H),M[8]=K*(C*N-P*E)-J*($*N-X*E)+F*($*P-X*C),M[9]=-(V*(C*N-P*E)-J*(W*N-Z*E)+F*(W*P-Z*C)),M[10]=V*($*N-X*E)-K*(W*N-Z*E)+F*(W*X-Z*$),M[11]=-(V*($*P-X*C)-K*(W*P-Z*C)+J*(W*X-Z*$)),M[12]=-(K*(C*B-h*E)-J*($*B-H*E)+F*($*h-H*C)),M[13]=V*(C*B-h*E)-J*(W*B-Y*E)+F*(W*h-Y*C),M[14]=-(V*($*B-H*E)-K*(W*B-Y*E)+F*(W*H-Y*$)),M[15]=V*($*h-H*C)-K*(W*h-Y*C)+J*(W*H-Y*$),M}function KM(M){var Q=M[0],V=M[1],W=M[2],Y=M[3],Z=M[4],K=M[5],$=M[6],H=M[7],X=M[8],J=M[9],C=M[10],h=M[11],P=M[12],F=M[13],E=M[14],B=M[15],N=Q*K-V*Z,T=Q*$-W*Z,k=Q*H-Y*Z,D=V*$-W*K,U=V*H-Y*K,R=W*H-Y*$,q=X*F-J*P,_=X*E-C*P,S=X*B-h*P,L=J*E-C*F,p=J*B-h*F,w=C*B-h*E;return N*w-T*p+k*L+D*S-U*_+R*q}function P0(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=Q[4],H=Q[5],X=Q[6],J=Q[7],C=Q[8],h=Q[9],P=Q[10],F=Q[11],E=Q[12],B=Q[13],N=Q[14],T=Q[15],k=V[0],D=V[1],U=V[2],R=V[3];return M[0]=k*W+D*$+U*C+R*E,M[1]=k*Y+D*H+U*h+R*B,M[2]=k*Z+D*X+U*P+R*N,M[3]=k*K+D*J+U*F+R*T,k=V[4],D=V[5],U=V[6],R=V[7],M[4]=k*W+D*$+U*C+R*E,M[5]=k*Y+D*H+U*h+R*B,M[6]=k*Z+D*X+U*P+R*N,M[7]=k*K+D*J+U*F+R*T,k=V[8],D=V[9],U=V[10],R=V[11],M[8]=k*W+D*$+U*C+R*E,M[9]=k*Y+D*H+U*h+R*B,M[10]=k*Z+D*X+U*P+R*N,M[11]=k*K+D*J+U*F+R*T,k=V[12],D=V[13],U=V[14],R=V[15],M[12]=k*W+D*$+U*C+R*E,M[13]=k*Y+D*H+U*h+R*B,M[14]=k*Z+D*X+U*P+R*N,M[15]=k*K+D*J+U*F+R*T,M}function $M(M,Q,V){var W=V[0],Y=V[1],Z=V[2],K,$,H,X,J,C,h,P,F,E,B,N;if(Q===M)M[12]=Q[0]*W+Q[4]*Y+Q[8]*Z+Q[12],M[13]=Q[1]*W+Q[5]*Y+Q[9]*Z+Q[13],M[14]=Q[2]*W+Q[6]*Y+Q[10]*Z+Q[14],M[15]=Q[3]*W+Q[7]*Y+Q[11]*Z+Q[15];else K=Q[0],$=Q[1],H=Q[2],X=Q[3],J=Q[4],C=Q[5],h=Q[6],P=Q[7],F=Q[8],E=Q[9],B=Q[10],N=Q[11],M[0]=K,M[1]=$,M[2]=H,M[3]=X,M[4]=J,M[5]=C,M[6]=h,M[7]=P,M[8]=F,M[9]=E,M[10]=B,M[11]=N,M[12]=K*W+J*Y+F*Z+Q[12],M[13]=$*W+C*Y+E*Z+Q[13],M[14]=H*W+h*Y+B*Z+Q[14],M[15]=X*W+P*Y+N*Z+Q[15];return M}function HM(M,Q,V){var W=V[0],Y=V[1],Z=V[2];return M[0]=Q[0]*W,M[1]=Q[1]*W,M[2]=Q[2]*W,M[3]=Q[3]*W,M[4]=Q[4]*Y,M[5]=Q[5]*Y,M[6]=Q[6]*Y,M[7]=Q[7]*Y,M[8]=Q[8]*Z,M[9]=Q[9]*Z,M[10]=Q[10]*Z,M[11]=Q[11]*Z,M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15],M}function XM(M,Q,V,W){var Y=W[0],Z=W[1],K=W[2],$=Math.hypot(Y,Z,K),H,X,J,C,h,P,F,E,B,N,T,k,D,U,R,q,_,S,L,p,w,v,j,g;if($<A)return null;if($=1/$,Y*=$,Z*=$,K*=$,H=Math.sin(V),X=Math.cos(V),J=1-X,C=Q[0],h=Q[1],P=Q[2],F=Q[3],E=Q[4],B=Q[5],N=Q[6],T=Q[7],k=Q[8],D=Q[9],U=Q[10],R=Q[11],q=Y*Y*J+X,_=Z*Y*J+K*H,S=K*Y*J-Z*H,L=Y*Z*J-K*H,p=Z*Z*J+X,w=K*Z*J+Y*H,v=Y*K*J+Z*H,j=Z*K*J-Y*H,g=K*K*J+X,M[0]=C*q+E*_+k*S,M[1]=h*q+B*_+D*S,M[2]=P*q+N*_+U*S,M[3]=F*q+T*_+R*S,M[4]=C*L+E*p+k*w,M[5]=h*L+B*p+D*w,M[6]=P*L+N*p+U*w,M[7]=F*L+T*p+R*w,M[8]=C*v+E*j+k*g,M[9]=h*v+B*j+D*g,M[10]=P*v+N*j+U*g,M[11]=F*v+T*j+R*g,Q!==M)M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15];return M}function JM(M,Q,V){var W=Math.sin(V),Y=Math.cos(V),Z=Q[4],K=Q[5],$=Q[6],H=Q[7],X=Q[8],J=Q[9],C=Q[10],h=Q[11];if(Q!==M)M[0]=Q[0],M[1]=Q[1],M[2]=Q[2],M[3]=Q[3],M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15];return M[4]=Z*Y+X*W,M[5]=K*Y+J*W,M[6]=$*Y+C*W,M[7]=H*Y+h*W,M[8]=X*Y-Z*W,M[9]=J*Y-K*W,M[10]=C*Y-$*W,M[11]=h*Y-H*W,M}function BM(M,Q,V){var W=Math.sin(V),Y=Math.cos(V),Z=Q[0],K=Q[1],$=Q[2],H=Q[3],X=Q[8],J=Q[9],C=Q[10],h=Q[11];if(Q!==M)M[4]=Q[4],M[5]=Q[5],M[6]=Q[6],M[7]=Q[7],M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15];return M[0]=Z*Y-X*W,M[1]=K*Y-J*W,M[2]=$*Y-C*W,M[3]=H*Y-h*W,M[8]=Z*W+X*Y,M[9]=K*W+J*Y,M[10]=$*W+C*Y,M[11]=H*W+h*Y,M}function CM(M,Q,V){var W=Math.sin(V),Y=Math.cos(V),Z=Q[0],K=Q[1],$=Q[2],H=Q[3],X=Q[4],J=Q[5],C=Q[6],h=Q[7];if(Q!==M)M[8]=Q[8],M[9]=Q[9],M[10]=Q[10],M[11]=Q[11],M[12]=Q[12],M[13]=Q[13],M[14]=Q[14],M[15]=Q[15];return M[0]=Z*Y+X*W,M[1]=K*Y+J*W,M[2]=$*Y+C*W,M[3]=H*Y+h*W,M[4]=X*Y-Z*W,M[5]=J*Y-K*W,M[6]=C*Y-$*W,M[7]=h*Y-H*W,M}function PM(M,Q){return M[0]=1,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=1,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=1,M[11]=0,M[12]=Q[0],M[13]=Q[1],M[14]=Q[2],M[15]=1,M}function hM(M,Q){return M[0]=Q[0],M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=Q[1],M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=Q[2],M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function EM(M,Q,V){var W=V[0],Y=V[1],Z=V[2],K=Math.hypot(W,Y,Z),$,H,X;if(K<A)return null;return K=1/K,W*=K,Y*=K,Z*=K,$=Math.sin(Q),H=Math.cos(Q),X=1-H,M[0]=W*W*X+H,M[1]=Y*W*X+Z*$,M[2]=Z*W*X-Y*$,M[3]=0,M[4]=W*Y*X-Z*$,M[5]=Y*Y*X+H,M[6]=Z*Y*X+W*$,M[7]=0,M[8]=W*Z*X+Y*$,M[9]=Y*Z*X-W*$,M[10]=Z*Z*X+H,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function FM(M,Q){var V=Math.sin(Q),W=Math.cos(Q);return M[0]=1,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=W,M[6]=V,M[7]=0,M[8]=0,M[9]=-V,M[10]=W,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function NM(M,Q){var V=Math.sin(Q),W=Math.cos(Q);return M[0]=W,M[1]=0,M[2]=-V,M[3]=0,M[4]=0,M[5]=1,M[6]=0,M[7]=0,M[8]=V,M[9]=0,M[10]=W,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function UM(M,Q){var V=Math.sin(Q),W=Math.cos(Q);return M[0]=W,M[1]=V,M[2]=0,M[3]=0,M[4]=-V,M[5]=W,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=1,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function h0(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=W+W,H=Y+Y,X=Z+Z,J=W*$,C=W*H,h=W*X,P=Y*H,F=Y*X,E=Z*X,B=K*$,N=K*H,T=K*X;return M[0]=1-(P+E),M[1]=C+T,M[2]=h-N,M[3]=0,M[4]=C-T,M[5]=1-(J+E),M[6]=F+B,M[7]=0,M[8]=h+N,M[9]=F-B,M[10]=1-(J+P),M[11]=0,M[12]=V[0],M[13]=V[1],M[14]=V[2],M[15]=1,M}function RM(M,Q){var V=new I(3),W=-Q[0],Y=-Q[1],Z=-Q[2],K=Q[3],$=Q[4],H=Q[5],X=Q[6],J=Q[7],C=W*W+Y*Y+Z*Z+K*K;if(C>0)V[0]=($*K+J*W+H*Z-X*Y)*2/C,V[1]=(H*K+J*Y+X*W-$*Z)*2/C,V[2]=(X*K+J*Z+$*Y-H*W)*2/C;else V[0]=($*K+J*W+H*Z-X*Y)*2,V[1]=(H*K+J*Y+X*W-$*Z)*2,V[2]=(X*K+J*Z+$*Y-H*W)*2;return h0(M,Q,V),M}function DM(M,Q){return M[0]=Q[12],M[1]=Q[13],M[2]=Q[14],M}function E0(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[4],K=Q[5],$=Q[6],H=Q[8],X=Q[9],J=Q[10];return M[0]=Math.hypot(V,W,Y),M[1]=Math.hypot(Z,K,$),M[2]=Math.hypot(H,X,J),M}function kM(M,Q){var V=new I(3);E0(V,Q);var W=1/V[0],Y=1/V[1],Z=1/V[2],K=Q[0]*W,$=Q[1]*Y,H=Q[2]*Z,X=Q[4]*W,J=Q[5]*Y,C=Q[6]*Z,h=Q[8]*W,P=Q[9]*Y,F=Q[10]*Z,E=K+J+F,B=0;if(E>0)B=Math.sqrt(E+1)*2,M[3]=0.25*B,M[0]=(C-P)/B,M[1]=(h-H)/B,M[2]=($-X)/B;else if(K>J&&K>F)B=Math.sqrt(1+K-J-F)*2,M[3]=(C-P)/B,M[0]=0.25*B,M[1]=($+X)/B,M[2]=(h+H)/B;else if(J>F)B=Math.sqrt(1+J-K-F)*2,M[3]=(h-H)/B,M[0]=($+X)/B,M[1]=0.25*B,M[2]=(C+P)/B;else B=Math.sqrt(1+F-K-J)*2,M[3]=($-X)/B,M[0]=(h+H)/B,M[1]=(C+P)/B,M[2]=0.25*B;return M}function AM(M,Q,V,W){var Y=Q[0],Z=Q[1],K=Q[2],$=Q[3],H=Y+Y,X=Z+Z,J=K+K,C=Y*H,h=Y*X,P=Y*J,F=Z*X,E=Z*J,B=K*J,N=$*H,T=$*X,k=$*J,D=W[0],U=W[1],R=W[2];return M[0]=(1-(F+B))*D,M[1]=(h+k)*D,M[2]=(P-T)*D,M[3]=0,M[4]=(h-k)*U,M[5]=(1-(C+B))*U,M[6]=(E+N)*U,M[7]=0,M[8]=(P+T)*R,M[9]=(E-N)*R,M[10]=(1-(C+F))*R,M[11]=0,M[12]=V[0],M[13]=V[1],M[14]=V[2],M[15]=1,M}function TM(M,Q,V,W,Y){var Z=Q[0],K=Q[1],$=Q[2],H=Q[3],X=Z+Z,J=K+K,C=$+$,h=Z*X,P=Z*J,F=Z*C,E=K*J,B=K*C,N=$*C,T=H*X,k=H*J,D=H*C,U=W[0],R=W[1],q=W[2],_=Y[0],S=Y[1],L=Y[2],p=(1-(E+N))*U,w=(P+D)*U,v=(F-k)*U,j=(P-D)*R,g=(1-(h+N))*R,f=(B+T)*R,c=(F+k)*q,H0=(B-T)*q,X0=(1-(h+E))*q;return M[0]=p,M[1]=w,M[2]=v,M[3]=0,M[4]=j,M[5]=g,M[6]=f,M[7]=0,M[8]=c,M[9]=H0,M[10]=X0,M[11]=0,M[12]=V[0]+_-(p*_+j*S+c*L),M[13]=V[1]+S-(w*_+g*S+H0*L),M[14]=V[2]+L-(v*_+f*S+X0*L),M[15]=1,M}function jM(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=V+V,$=W+W,H=Y+Y,X=V*K,J=W*K,C=W*$,h=Y*K,P=Y*$,F=Y*H,E=Z*K,B=Z*$,N=Z*H;return M[0]=1-C-F,M[1]=J+N,M[2]=h-B,M[3]=0,M[4]=J-N,M[5]=1-X-F,M[6]=P+E,M[7]=0,M[8]=h+B,M[9]=P-E,M[10]=1-X-C,M[11]=0,M[12]=0,M[13]=0,M[14]=0,M[15]=1,M}function OM(M,Q,V,W,Y,Z,K){var $=1/(V-Q),H=1/(Y-W),X=1/(Z-K);return M[0]=Z*2*$,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=Z*2*H,M[6]=0,M[7]=0,M[8]=(V+Q)*$,M[9]=(Y+W)*H,M[10]=(K+Z)*X,M[11]=-1,M[12]=0,M[13]=0,M[14]=K*Z*2*X,M[15]=0,M}function F0(M,Q,V,W,Y){var Z=1/Math.tan(Q/2),K;if(M[0]=Z/V,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=Z,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[11]=-1,M[12]=0,M[13]=0,M[15]=0,Y!=null&&Y!==Infinity)K=1/(W-Y),M[10]=(Y+W)*K,M[14]=2*Y*W*K;else M[10]=-1,M[14]=-2*W;return M}function GM(M,Q,V,W,Y){var Z=1/Math.tan(Q/2),K;if(M[0]=Z/V,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=Z,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[11]=-1,M[12]=0,M[13]=0,M[15]=0,Y!=null&&Y!==Infinity)K=1/(W-Y),M[10]=Y*K,M[14]=Y*W*K;else M[10]=-1,M[14]=-W;return M}function _M(M,Q,V,W){var Y=Math.tan(Q.upDegrees*Math.PI/180),Z=Math.tan(Q.downDegrees*Math.PI/180),K=Math.tan(Q.leftDegrees*Math.PI/180),$=Math.tan(Q.rightDegrees*Math.PI/180),H=2/(K+$),X=2/(Y+Z);return M[0]=H,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=X,M[6]=0,M[7]=0,M[8]=-((K-$)*H*0.5),M[9]=(Y-Z)*X*0.5,M[10]=W/(V-W),M[11]=-1,M[12]=0,M[13]=0,M[14]=W*V/(V-W),M[15]=0,M}function N0(M,Q,V,W,Y,Z,K){var $=1/(Q-V),H=1/(W-Y),X=1/(Z-K);return M[0]=-2*$,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=-2*H,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=2*X,M[11]=0,M[12]=(Q+V)*$,M[13]=(Y+W)*H,M[14]=(K+Z)*X,M[15]=1,M}function LM(M,Q,V,W,Y,Z,K){var $=1/(Q-V),H=1/(W-Y),X=1/(Z-K);return M[0]=-2*$,M[1]=0,M[2]=0,M[3]=0,M[4]=0,M[5]=-2*H,M[6]=0,M[7]=0,M[8]=0,M[9]=0,M[10]=X,M[11]=0,M[12]=(Q+V)*$,M[13]=(Y+W)*H,M[14]=Z*X,M[15]=1,M}function qM(M,Q,V,W){var Y,Z,K,$,H,X,J,C,h,P,F=Q[0],E=Q[1],B=Q[2],N=W[0],T=W[1],k=W[2],D=V[0],U=V[1],R=V[2];if(Math.abs(F-D)<A&&Math.abs(E-U)<A&&Math.abs(B-R)<A)return C0(M);if(J=F-D,C=E-U,h=B-R,P=1/Math.hypot(J,C,h),J*=P,C*=P,h*=P,Y=T*h-k*C,Z=k*J-N*h,K=N*C-T*J,P=Math.hypot(Y,Z,K),!P)Y=0,Z=0,K=0;else P=1/P,Y*=P,Z*=P,K*=P;if($=C*K-h*Z,H=h*Y-J*K,X=J*Z-C*Y,P=Math.hypot($,H,X),!P)$=0,H=0,X=0;else P=1/P,$*=P,H*=P,X*=P;return M[0]=Y,M[1]=$,M[2]=J,M[3]=0,M[4]=Z,M[5]=H,M[6]=C,M[7]=0,M[8]=K,M[9]=X,M[10]=h,M[11]=0,M[12]=-(Y*F+Z*E+K*B),M[13]=-($*F+H*E+X*B),M[14]=-(J*F+C*E+h*B),M[15]=1,M}function pM(M,Q,V,W){var Y=Q[0],Z=Q[1],K=Q[2],$=W[0],H=W[1],X=W[2],J=Y-V[0],C=Z-V[1],h=K-V[2],P=J*J+C*C+h*h;if(P>0)P=1/Math.sqrt(P),J*=P,C*=P,h*=P;var F=H*h-X*C,E=X*J-$*h,B=$*C-H*J;if(P=F*F+E*E+B*B,P>0)P=1/Math.sqrt(P),F*=P,E*=P,B*=P;return M[0]=F,M[1]=E,M[2]=B,M[3]=0,M[4]=C*B-h*E,M[5]=h*F-J*B,M[6]=J*E-C*F,M[7]=0,M[8]=J,M[9]=C,M[10]=h,M[11]=0,M[12]=Y,M[13]=Z,M[14]=K,M[15]=1,M}function wM(M){return"mat4("+M[0]+", "+M[1]+", "+M[2]+", "+M[3]+", "+M[4]+", "+M[5]+", "+M[6]+", "+M[7]+", "+M[8]+", "+M[9]+", "+M[10]+", "+M[11]+", "+M[12]+", "+M[13]+", "+M[14]+", "+M[15]+")"}function vM(M){return Math.hypot(M[0],M[1],M[2],M[3],M[4],M[5],M[6],M[7],M[8],M[9],M[10],M[11],M[12],M[13],M[14],M[15])}function nM(M,Q,V){return M[0]=Q[0]+V[0],M[1]=Q[1]+V[1],M[2]=Q[2]+V[2],M[3]=Q[3]+V[3],M[4]=Q[4]+V[4],M[5]=Q[5]+V[5],M[6]=Q[6]+V[6],M[7]=Q[7]+V[7],M[8]=Q[8]+V[8],M[9]=Q[9]+V[9],M[10]=Q[10]+V[10],M[11]=Q[11]+V[11],M[12]=Q[12]+V[12],M[13]=Q[13]+V[13],M[14]=Q[14]+V[14],M[15]=Q[15]+V[15],M}function U0(M,Q,V){return M[0]=Q[0]-V[0],M[1]=Q[1]-V[1],M[2]=Q[2]-V[2],M[3]=Q[3]-V[3],M[4]=Q[4]-V[4],M[5]=Q[5]-V[5],M[6]=Q[6]-V[6],M[7]=Q[7]-V[7],M[8]=Q[8]-V[8],M[9]=Q[9]-V[9],M[10]=Q[10]-V[10],M[11]=Q[11]-V[11],M[12]=Q[12]-V[12],M[13]=Q[13]-V[13],M[14]=Q[14]-V[14],M[15]=Q[15]-V[15],M}function gM(M,Q,V){return M[0]=Q[0]*V,M[1]=Q[1]*V,M[2]=Q[2]*V,M[3]=Q[3]*V,M[4]=Q[4]*V,M[5]=Q[5]*V,M[6]=Q[6]*V,M[7]=Q[7]*V,M[8]=Q[8]*V,M[9]=Q[9]*V,M[10]=Q[10]*V,M[11]=Q[11]*V,M[12]=Q[12]*V,M[13]=Q[13]*V,M[14]=Q[14]*V,M[15]=Q[15]*V,M}function dM(M,Q,V,W){return M[0]=Q[0]+V[0]*W,M[1]=Q[1]+V[1]*W,M[2]=Q[2]+V[2]*W,M[3]=Q[3]+V[3]*W,M[4]=Q[4]+V[4]*W,M[5]=Q[5]+V[5]*W,M[6]=Q[6]+V[6]*W,M[7]=Q[7]+V[7]*W,M[8]=Q[8]+V[8]*W,M[9]=Q[9]+V[9]*W,M[10]=Q[10]+V[10]*W,M[11]=Q[11]+V[11]*W,M[12]=Q[12]+V[12]*W,M[13]=Q[13]+V[13]*W,M[14]=Q[14]+V[14]*W,M[15]=Q[15]+V[15]*W,M}function iM(M,Q){return M[0]===Q[0]&&M[1]===Q[1]&&M[2]===Q[2]&&M[3]===Q[3]&&M[4]===Q[4]&&M[5]===Q[5]&&M[6]===Q[6]&&M[7]===Q[7]&&M[8]===Q[8]&&M[9]===Q[9]&&M[10]===Q[10]&&M[11]===Q[11]&&M[12]===Q[12]&&M[13]===Q[13]&&M[14]===Q[14]&&M[15]===Q[15]}function fM(M,Q){var V=M[0],W=M[1],Y=M[2],Z=M[3],K=M[4],$=M[5],H=M[6],X=M[7],J=M[8],C=M[9],h=M[10],P=M[11],F=M[12],E=M[13],B=M[14],N=M[15],T=Q[0],k=Q[1],D=Q[2],U=Q[3],R=Q[4],q=Q[5],_=Q[6],S=Q[7],L=Q[8],p=Q[9],w=Q[10],v=Q[11],j=Q[12],g=Q[13],f=Q[14],c=Q[15];return Math.abs(V-T)<=A*Math.max(1,Math.abs(V),Math.abs(T))&&Math.abs(W-k)<=A*Math.max(1,Math.abs(W),Math.abs(k))&&Math.abs(Y-D)<=A*Math.max(1,Math.abs(Y),Math.abs(D))&&Math.abs(Z-U)<=A*Math.max(1,Math.abs(Z),Math.abs(U))&&Math.abs(K-R)<=A*Math.max(1,Math.abs(K),Math.abs(R))&&Math.abs($-q)<=A*Math.max(1,Math.abs($),Math.abs(q))&&Math.abs(H-_)<=A*Math.max(1,Math.abs(H),Math.abs(_))&&Math.abs(X-S)<=A*Math.max(1,Math.abs(X),Math.abs(S))&&Math.abs(J-L)<=A*Math.max(1,Math.abs(J),Math.abs(L))&&Math.abs(C-p)<=A*Math.max(1,Math.abs(C),Math.abs(p))&&Math.abs(h-w)<=A*Math.max(1,Math.abs(h),Math.abs(w))&&Math.abs(P-v)<=A*Math.max(1,Math.abs(P),Math.abs(v))&&Math.abs(F-j)<=A*Math.max(1,Math.abs(F),Math.abs(j))&&Math.abs(E-g)<=A*Math.max(1,Math.abs(E),Math.abs(g))&&Math.abs(B-f)<=A*Math.max(1,Math.abs(B),Math.abs(f))&&Math.abs(N-c)<=A*Math.max(1,Math.abs(N),Math.abs(c))}var IM=F0,SM=N0,cM=P0,lM=U0;var y={};o(y,{str:()=>{{return dQ}},squaredLength:()=>{{return s0}},sqrLen:()=>{{return rQ}},sqlerp:()=>{{return uQ}},slerp:()=>{{return u}},setAxisAngle:()=>{{return f0}},setAxes:()=>{{return oQ}},set:()=>{{return lQ}},scale:()=>{{return y0}},rotationTo:()=>{{return bQ}},rotateZ:()=>{{return LQ}},rotateY:()=>{{return SQ}},rotateX:()=>{{return _Q}},random:()=>{{return wQ}},pow:()=>{{return pQ}},normalize:()=>{{return K0}},multiply:()=>{{return c0}},mul:()=>{{return xQ}},ln:()=>{{return z0}},lerp:()=>{{return yQ}},length:()=>{{return r0}},len:()=>{{return mQ}},invert:()=>{{return vQ}},identity:()=>{{return OQ}},getAxisAngle:()=>{{return IQ}},getAngle:()=>{{return GQ}},fromValues:()=>{{return fQ}},fromMat3:()=>{{return x0}},fromEuler:()=>{{return gQ}},exp:()=>{{return l0}},exactEquals:()=>{{return sQ}},equals:()=>{{return eQ}},dot:()=>{{return m0}},create:()=>{{return Z0}},copy:()=>{{return cQ}},conjugate:()=>{{return nQ}},clone:()=>{{return iQ}},calculateW:()=>{{return qQ}},add:()=>{{return zQ}}});var i={};o(i,{zero:()=>{{return CQ}},transformQuat:()=>{{return $Q}},transformMat4:()=>{{return ZQ}},transformMat3:()=>{{return KQ}},subtract:()=>{{return D0}},sub:()=>{{return FQ}},str:()=>{{return PQ}},squaredLength:()=>{{return O0}},squaredDistance:()=>{{return j0}},sqrLen:()=>{{return kQ}},sqrDist:()=>{{return DQ}},set:()=>{{return yM}},scaleAndAdd:()=>{{return tM}},scale:()=>{{return oM}},round:()=>{{return uM}},rotateZ:()=>{{return JQ}},rotateY:()=>{{return XQ}},rotateX:()=>{{return HQ}},random:()=>{{return YQ}},normalize:()=>{{return W0}},negate:()=>{{return aM}},multiply:()=>{{return k0}},mul:()=>{{return NQ}},min:()=>{{return eM}},max:()=>{{return bM}},lerp:()=>{{return QQ}},length:()=>{{return R0}},len:()=>{{return Y0}},inverse:()=>{{return MQ}},hermite:()=>{{return VQ}},fromValues:()=>{{return e}},forEach:()=>{{return AQ}},floor:()=>{{return sM}},exactEquals:()=>{{return hQ}},equals:()=>{{return EQ}},dot:()=>{{return b}},divide:()=>{{return A0}},div:()=>{{return UQ}},distance:()=>{{return T0}},dist:()=>{{return RQ}},cross:()=>{{return x}},create:()=>{{return s}},copy:()=>{{return xM}},clone:()=>{{return zM}},ceil:()=>{{return rM}},bezier:()=>{{return WQ}},angle:()=>{{return BQ}},add:()=>{{return mM}}});function s(){var M=new I(3);if(I!=Float32Array)M[0]=0,M[1]=0,M[2]=0;return M}function zM(M){var Q=new I(3);return Q[0]=M[0],Q[1]=M[1],Q[2]=M[2],Q}function R0(M){var Q=M[0],V=M[1],W=M[2];return Math.hypot(Q,V,W)}function e(M,Q,V){var W=new I(3);return W[0]=M,W[1]=Q,W[2]=V,W}function xM(M,Q){return M[0]=Q[0],M[1]=Q[1],M[2]=Q[2],M}function yM(M,Q,V,W){return M[0]=Q,M[1]=V,M[2]=W,M}function mM(M,Q,V){return M[0]=Q[0]+V[0],M[1]=Q[1]+V[1],M[2]=Q[2]+V[2],M}function D0(M,Q,V){return M[0]=Q[0]-V[0],M[1]=Q[1]-V[1],M[2]=Q[2]-V[2],M}function k0(M,Q,V){return M[0]=Q[0]*V[0],M[1]=Q[1]*V[1],M[2]=Q[2]*V[2],M}function A0(M,Q,V){return M[0]=Q[0]/V[0],M[1]=Q[1]/V[1],M[2]=Q[2]/V[2],M}function rM(M,Q){return M[0]=Math.ceil(Q[0]),M[1]=Math.ceil(Q[1]),M[2]=Math.ceil(Q[2]),M}function sM(M,Q){return M[0]=Math.floor(Q[0]),M[1]=Math.floor(Q[1]),M[2]=Math.floor(Q[2]),M}function eM(M,Q,V){return M[0]=Math.min(Q[0],V[0]),M[1]=Math.min(Q[1],V[1]),M[2]=Math.min(Q[2],V[2]),M}function bM(M,Q,V){return M[0]=Math.max(Q[0],V[0]),M[1]=Math.max(Q[1],V[1]),M[2]=Math.max(Q[2],V[2]),M}function uM(M,Q){return M[0]=Math.round(Q[0]),M[1]=Math.round(Q[1]),M[2]=Math.round(Q[2]),M}function oM(M,Q,V){return M[0]=Q[0]*V,M[1]=Q[1]*V,M[2]=Q[2]*V,M}function tM(M,Q,V,W){return M[0]=Q[0]+V[0]*W,M[1]=Q[1]+V[1]*W,M[2]=Q[2]+V[2]*W,M}function T0(M,Q){var V=Q[0]-M[0],W=Q[1]-M[1],Y=Q[2]-M[2];return Math.hypot(V,W,Y)}function j0(M,Q){var V=Q[0]-M[0],W=Q[1]-M[1],Y=Q[2]-M[2];return V*V+W*W+Y*Y}function O0(M){var Q=M[0],V=M[1],W=M[2];return Q*Q+V*V+W*W}function aM(M,Q){return M[0]=-Q[0],M[1]=-Q[1],M[2]=-Q[2],M}function MQ(M,Q){return M[0]=1/Q[0],M[1]=1/Q[1],M[2]=1/Q[2],M}function W0(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=V*V+W*W+Y*Y;if(Z>0)Z=1/Math.sqrt(Z);return M[0]=Q[0]*Z,M[1]=Q[1]*Z,M[2]=Q[2]*Z,M}function b(M,Q){return M[0]*Q[0]+M[1]*Q[1]+M[2]*Q[2]}function x(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2],K=V[0],$=V[1],H=V[2];return M[0]=Y*H-Z*$,M[1]=Z*K-W*H,M[2]=W*$-Y*K,M}function QQ(M,Q,V,W){var Y=Q[0],Z=Q[1],K=Q[2];return M[0]=Y+W*(V[0]-Y),M[1]=Z+W*(V[1]-Z),M[2]=K+W*(V[2]-K),M}function VQ(M,Q,V,W,Y,Z){var K=Z*Z,$=K*(2*Z-3)+1,H=K*(Z-2)+Z,X=K*(Z-1),J=K*(3-2*Z);return M[0]=Q[0]*$+V[0]*H+W[0]*X+Y[0]*J,M[1]=Q[1]*$+V[1]*H+W[1]*X+Y[1]*J,M[2]=Q[2]*$+V[2]*H+W[2]*X+Y[2]*J,M}function WQ(M,Q,V,W,Y,Z){var K=1-Z,$=K*K,H=Z*Z,X=$*K,J=3*Z*$,C=3*H*K,h=H*Z;return M[0]=Q[0]*X+V[0]*J+W[0]*C+Y[0]*h,M[1]=Q[1]*X+V[1]*J+W[1]*C+Y[1]*h,M[2]=Q[2]*X+V[2]*J+W[2]*C+Y[2]*h,M}function YQ(M,Q){Q=Q||1;var V=d()*2*Math.PI,W=d()*2-1,Y=Math.sqrt(1-W*W)*Q;return M[0]=Math.cos(V)*Y,M[1]=Math.sin(V)*Y,M[2]=W*Q,M}function ZQ(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2],K=V[3]*W+V[7]*Y+V[11]*Z+V[15];return K=K||1,M[0]=(V[0]*W+V[4]*Y+V[8]*Z+V[12])/K,M[1]=(V[1]*W+V[5]*Y+V[9]*Z+V[13])/K,M[2]=(V[2]*W+V[6]*Y+V[10]*Z+V[14])/K,M}function KQ(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2];return M[0]=W*V[0]+Y*V[3]+Z*V[6],M[1]=W*V[1]+Y*V[4]+Z*V[7],M[2]=W*V[2]+Y*V[5]+Z*V[8],M}function $Q(M,Q,V){var W=V[0],Y=V[1],Z=V[2],K=V[3],$=Q[0],H=Q[1],X=Q[2],J=Y*X-Z*H,C=Z*$-W*X,h=W*H-Y*$,P=Y*h-Z*C,F=Z*J-W*h,E=W*C-Y*J,B=K*2;return J*=B,C*=B,h*=B,P*=2,F*=2,E*=2,M[0]=$+J+P,M[1]=H+C+F,M[2]=X+h+E,M}function HQ(M,Q,V,W){var Y=[],Z=[];return Y[0]=Q[0]-V[0],Y[1]=Q[1]-V[1],Y[2]=Q[2]-V[2],Z[0]=Y[0],Z[1]=Y[1]*Math.cos(W)-Y[2]*Math.sin(W),Z[2]=Y[1]*Math.sin(W)+Y[2]*Math.cos(W),M[0]=Z[0]+V[0],M[1]=Z[1]+V[1],M[2]=Z[2]+V[2],M}function XQ(M,Q,V,W){var Y=[],Z=[];return Y[0]=Q[0]-V[0],Y[1]=Q[1]-V[1],Y[2]=Q[2]-V[2],Z[0]=Y[2]*Math.sin(W)+Y[0]*Math.cos(W),Z[1]=Y[1],Z[2]=Y[2]*Math.cos(W)-Y[0]*Math.sin(W),M[0]=Z[0]+V[0],M[1]=Z[1]+V[1],M[2]=Z[2]+V[2],M}function JQ(M,Q,V,W){var Y=[],Z=[];return Y[0]=Q[0]-V[0],Y[1]=Q[1]-V[1],Y[2]=Q[2]-V[2],Z[0]=Y[0]*Math.cos(W)-Y[1]*Math.sin(W),Z[1]=Y[0]*Math.sin(W)+Y[1]*Math.cos(W),Z[2]=Y[2],M[0]=Z[0]+V[0],M[1]=Z[1]+V[1],M[2]=Z[2]+V[2],M}function BQ(M,Q){var V=M[0],W=M[1],Y=M[2],Z=Q[0],K=Q[1],$=Q[2],H=Math.sqrt(V*V+W*W+Y*Y),X=Math.sqrt(Z*Z+K*K+$*$),J=H*X,C=J&&b(M,Q)/J;return Math.acos(Math.min(Math.max(C,-1),1))}function CQ(M){return M[0]=0,M[1]=0,M[2]=0,M}function PQ(M){return"vec3("+M[0]+", "+M[1]+", "+M[2]+")"}function hQ(M,Q){return M[0]===Q[0]&&M[1]===Q[1]&&M[2]===Q[2]}function EQ(M,Q){var V=M[0],W=M[1],Y=M[2],Z=Q[0],K=Q[1],$=Q[2];return Math.abs(V-Z)<=A*Math.max(1,Math.abs(V),Math.abs(Z))&&Math.abs(W-K)<=A*Math.max(1,Math.abs(W),Math.abs(K))&&Math.abs(Y-$)<=A*Math.max(1,Math.abs(Y),Math.abs($))}var FQ=D0,NQ=k0,UQ=A0,RQ=T0,DQ=j0,Y0=R0,kQ=O0,AQ=function(){var M=s();return function(Q,V,W,Y,Z,K){var $,H;if(!V)V=3;if(!W)W=0;if(Y)H=Math.min(Y*V+W,Q.length);else H=Q.length;for($=W;$<H;$+=V)M[0]=Q[$],M[1]=Q[$+1],M[2]=Q[$+2],Z(M,M,K),Q[$]=M[0],Q[$+1]=M[1],Q[$+2]=M[2];return Q}}();function TQ(){var M=new I(4);if(I!=Float32Array)M[0]=0,M[1]=0,M[2]=0,M[3]=0;return M}function I0(M){var Q=new I(4);return Q[0]=M[0],Q[1]=M[1],Q[2]=M[2],Q[3]=M[3],Q}function G0(M,Q,V,W){var Y=new I(4);return Y[0]=M,Y[1]=Q,Y[2]=V,Y[3]=W,Y}function _0(M,Q){return M[0]=Q[0],M[1]=Q[1],M[2]=Q[2],M[3]=Q[3],M}function S0(M,Q,V,W,Y){return M[0]=Q,M[1]=V,M[2]=W,M[3]=Y,M}function L0(M,Q,V){return M[0]=Q[0]+V[0],M[1]=Q[1]+V[1],M[2]=Q[2]+V[2],M[3]=Q[3]+V[3],M}function q0(M,Q,V){return M[0]=Q[0]*V,M[1]=Q[1]*V,M[2]=Q[2]*V,M[3]=Q[3]*V,M}function p0(M){var Q=M[0],V=M[1],W=M[2],Y=M[3];return Math.hypot(Q,V,W,Y)}function w0(M){var Q=M[0],V=M[1],W=M[2],Y=M[3];return Q*Q+V*V+W*W+Y*Y}function v0(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=V*V+W*W+Y*Y+Z*Z;if(K>0)K=1/Math.sqrt(K);return M[0]=V*K,M[1]=W*K,M[2]=Y*K,M[3]=Z*K,M}function n0(M,Q){return M[0]*Q[0]+M[1]*Q[1]+M[2]*Q[2]+M[3]*Q[3]}function g0(M,Q,V,W){var Y=Q[0],Z=Q[1],K=Q[2],$=Q[3];return M[0]=Y+W*(V[0]-Y),M[1]=Z+W*(V[1]-Z),M[2]=K+W*(V[2]-K),M[3]=$+W*(V[3]-$),M}function d0(M,Q){return M[0]===Q[0]&&M[1]===Q[1]&&M[2]===Q[2]&&M[3]===Q[3]}function i0(M,Q){var V=M[0],W=M[1],Y=M[2],Z=M[3],K=Q[0],$=Q[1],H=Q[2],X=Q[3];return Math.abs(V-K)<=A*Math.max(1,Math.abs(V),Math.abs(K))&&Math.abs(W-$)<=A*Math.max(1,Math.abs(W),Math.abs($))&&Math.abs(Y-H)<=A*Math.max(1,Math.abs(Y),Math.abs(H))&&Math.abs(Z-X)<=A*Math.max(1,Math.abs(Z),Math.abs(X))}var FV=function(){var M=TQ();return function(Q,V,W,Y,Z,K){var $,H;if(!V)V=4;if(!W)W=0;if(Y)H=Math.min(Y*V+W,Q.length);else H=Q.length;for($=W;$<H;$+=V)M[0]=Q[$],M[1]=Q[$+1],M[2]=Q[$+2],M[3]=Q[$+3],Z(M,M,K),Q[$]=M[0],Q[$+1]=M[1],Q[$+2]=M[2],Q[$+3]=M[3];return Q}}();function Z0(){var M=new I(4);if(I!=Float32Array)M[0]=0,M[1]=0,M[2]=0;return M[3]=1,M}function OQ(M){return M[0]=0,M[1]=0,M[2]=0,M[3]=1,M}function f0(M,Q,V){V=V*0.5;var W=Math.sin(V);return M[0]=W*Q[0],M[1]=W*Q[1],M[2]=W*Q[2],M[3]=Math.cos(V),M}function IQ(M,Q){var V=Math.acos(Q[3])*2,W=Math.sin(V/2);if(W>A)M[0]=Q[0]/W,M[1]=Q[1]/W,M[2]=Q[2]/W;else M[0]=1,M[1]=0,M[2]=0;return V}function GQ(M,Q){var V=m0(M,Q);return Math.acos(2*V*V-1)}function c0(M,Q,V){var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=V[0],H=V[1],X=V[2],J=V[3];return M[0]=W*J+K*$+Y*X-Z*H,M[1]=Y*J+K*H+Z*$-W*X,M[2]=Z*J+K*X+W*H-Y*$,M[3]=K*J-W*$-Y*H-Z*X,M}function _Q(M,Q,V){V*=0.5;var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=Math.sin(V),H=Math.cos(V);return M[0]=W*H+K*$,M[1]=Y*H+Z*$,M[2]=Z*H-Y*$,M[3]=K*H-W*$,M}function SQ(M,Q,V){V*=0.5;var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=Math.sin(V),H=Math.cos(V);return M[0]=W*H-Z*$,M[1]=Y*H+K*$,M[2]=Z*H+W*$,M[3]=K*H-Y*$,M}function LQ(M,Q,V){V*=0.5;var W=Q[0],Y=Q[1],Z=Q[2],K=Q[3],$=Math.sin(V),H=Math.cos(V);return M[0]=W*H+Y*$,M[1]=Y*H-W*$,M[2]=Z*H+K*$,M[3]=K*H-Z*$,M}function qQ(M,Q){var V=Q[0],W=Q[1],Y=Q[2];return M[0]=V,M[1]=W,M[2]=Y,M[3]=Math.sqrt(Math.abs(1-V*V-W*W-Y*Y)),M}function l0(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=Math.sqrt(V*V+W*W+Y*Y),$=Math.exp(Z),H=K>0?$*Math.sin(K)/K:0;return M[0]=V*H,M[1]=W*H,M[2]=Y*H,M[3]=$*Math.cos(K),M}function z0(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=Math.sqrt(V*V+W*W+Y*Y),$=K>0?Math.atan2(K,Z)/K:0;return M[0]=V*$,M[1]=W*$,M[2]=Y*$,M[3]=0.5*Math.log(V*V+W*W+Y*Y+Z*Z),M}function pQ(M,Q,V){return z0(M,Q),y0(M,M,V),l0(M,M),M}function u(M,Q,V,W){var Y=Q[0],Z=Q[1],K=Q[2],$=Q[3],H=V[0],X=V[1],J=V[2],C=V[3],h,P,F,E,B;if(P=Y*H+Z*X+K*J+$*C,P<0)P=-P,H=-H,X=-X,J=-J,C=-C;if(1-P>A)h=Math.acos(P),F=Math.sin(h),E=Math.sin((1-W)*h)/F,B=Math.sin(W*h)/F;else E=1-W,B=W;return M[0]=E*Y+B*H,M[1]=E*Z+B*X,M[2]=E*K+B*J,M[3]=E*$+B*C,M}function wQ(M){var Q=d(),V=d(),W=d(),Y=Math.sqrt(1-Q),Z=Math.sqrt(Q);return M[0]=Y*Math.sin(2*Math.PI*V),M[1]=Y*Math.cos(2*Math.PI*V),M[2]=Z*Math.sin(2*Math.PI*W),M[3]=Z*Math.cos(2*Math.PI*W),M}function vQ(M,Q){var V=Q[0],W=Q[1],Y=Q[2],Z=Q[3],K=V*V+W*W+Y*Y+Z*Z,$=K?1/K:0;return M[0]=-V*$,M[1]=-W*$,M[2]=-Y*$,M[3]=Z*$,M}function nQ(M,Q){return M[0]=-Q[0],M[1]=-Q[1],M[2]=-Q[2],M[3]=Q[3],M}function x0(M,Q){var V=Q[0]+Q[4]+Q[8],W;if(V>0)W=Math.sqrt(V+1),M[3]=0.5*W,W=0.5/W,M[0]=(Q[5]-Q[7])*W,M[1]=(Q[6]-Q[2])*W,M[2]=(Q[1]-Q[3])*W;else{var Y=0;if(Q[4]>Q[0])Y=1;if(Q[8]>Q[Y*3+Y])Y=2;var Z=(Y+1)%3,K=(Y+2)%3;W=Math.sqrt(Q[Y*3+Y]-Q[Z*3+Z]-Q[K*3+K]+1),M[Y]=0.5*W,W=0.5/W,M[3]=(Q[Z*3+K]-Q[K*3+Z])*W,M[Z]=(Q[Z*3+Y]+Q[Y*3+Z])*W,M[K]=(Q[K*3+Y]+Q[Y*3+K])*W}return M}function gQ(M,Q,V,W){var Y=0.5*Math.PI/180;Q*=Y,V*=Y,W*=Y;var Z=Math.sin(Q),K=Math.cos(Q),$=Math.sin(V),H=Math.cos(V),X=Math.sin(W),J=Math.cos(W);return M[0]=Z*H*J-K*$*X,M[1]=K*$*J+Z*H*X,M[2]=K*H*X-Z*$*J,M[3]=K*H*J+Z*$*X,M}function dQ(M){return"quat("+M[0]+", "+M[1]+", "+M[2]+", "+M[3]+")"}var iQ=I0,fQ=G0,cQ=_0,lQ=S0,zQ=L0,xQ=c0,y0=q0,m0=n0,yQ=g0,r0=p0,mQ=r0,s0=w0,rQ=s0,K0=v0,sQ=d0,eQ=i0,bQ=function(){var M=s(),Q=e(1,0,0),V=e(0,1,0);return function(W,Y,Z){var K=b(Y,Z);if(K<-0.999999){if(x(M,Q,Y),Y0(M)<0.000001)x(M,V,Y);return W0(M,M),f0(W,M,Math.PI),W}else if(K>0.999999)return W[0]=0,W[1]=0,W[2]=0,W[3]=1,W;else return x(M,Y,Z),W[0]=M[0],W[1]=M[1],W[2]=M[2],W[3]=1+K,K0(W,W)}}(),uQ=function(){var M=Z0(),Q=Z0();return function(V,W,Y,Z,K,$){return u(M,W,K,$),u(Q,Y,Z,$),u(V,M,Q,2*$*(1-$)),V}}(),oQ=function(){var M=B0();return function(Q,V,W,Y){return M[0]=W[0],M[3]=W[1],M[6]=W[2],M[1]=Y[0],M[4]=Y[1],M[7]=Y[2],M[2]=-V[0],M[5]=-V[1],M[8]=-V[2],K0(Q,x0(Q,M))}}();var MV=function(M){if(!aQ)return M;return new Proxy(M,{get(V,W){const Y=V,Z=Y[W];if(typeof Z==="function")return(...$)=>{const H=Z.apply(Y,$);return console.log(`gl.${String(W)}(`,$,") = ",H),H};else return console.log(`gl.${String(W)} = `,Z),Z}})},tQ={alpha:!0,antialias:!1,depth:!0,desynchronized:!0,failIfMajorPerformanceCaveat:void 0,powerPreference:"default",premultipliedAlpha:!0,preserveDrawingBuffer:!1,stencil:!1},G=WebGL2RenderingContext;var aQ=!1;class $0 extends n{gl;programs;attributeBuffers;uniforms;cameraMatrix;camTurnMatrix;perspectiveMatrix;constructor(M,Q){super();this.gl=MV(M.getContext("webgl2",{...tQ,...Q})),this.programs=this.own(new a(this.gl)),this.attributeBuffers=this.own(new Q0(this.gl,this.programs)),this.uniforms=this.own(new V0(this.gl,this.programs)),this.cameraMatrix=O.identity(O.create()),this.camTurnMatrix=O.identity(O.create()),this.perspectiveMatrix=O.identity(O.create())}initialize(){this.gl.enable(G.DEPTH_TEST),this.gl.depthFunc(G.LEQUAL),this.gl.enable(G.BLEND),this.gl.blendFunc(G.SRC_ALPHA,G.ONE_MINUS_SRC_ALPHA),this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight);{this.attributeBuffers.createBuffer(m);const M=this.attributeBuffers.getAttributeBuffer(m);this.attributeBuffers.bindBuffer(G.ELEMENT_ARRAY_BUFFER,M),this.attributeBuffers.bufferData(G.ELEMENT_ARRAY_BUFFER,m,Uint16Array.from([0,1,2,3,0,2]),0,G.STATIC_DRAW)}{this.attributeBuffers.createBuffer(l);const M=this.attributeBuffers.getAttributeBuffer(l);this.attributeBuffers.bindBuffer(G.ARRAY_BUFFER,M),this.gl.vertexAttribPointer(M.location,3,G.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(M.location),this.attributeBuffers.bufferData(G.ARRAY_BUFFER,l,Float32Array.from([1,1,0,1,-1,0,-1,-1,0,-1,1,0]),0,G.STATIC_DRAW)}{this.attributeBuffers.createBuffer(r);const M=this.attributeBuffers.getAttributeBuffer(r);this.attributeBuffers.bindBuffer(G.ARRAY_BUFFER,M);for(let Q=0;Q<4;Q++){const V=M.location+Q;this.gl.vertexAttribPointer(V,4,G.FLOAT,!1,16*Float32Array.BYTES_PER_ELEMENT,Q*4*Float32Array.BYTES_PER_ELEMENT),this.gl.enableVertexAttribArray(V),this.gl.vertexAttribDivisor(V,1)}this.attributeBuffers.bufferData(G.ARRAY_BUFFER,r,Float32Array.from([...O.fromYRotation(O.create(),Math.PI/4),...O.fromYRotation(O.create(),Math.PI/2),...O.identity(O.create())]),0,G.DYNAMIC_DRAW)}{const M=Math.PI/90;this.perspectiveMatrix=O.perspective(O.create(),45*M,1,0,1e4)}{const M=O.ortho(O.create(),-2,2,-2,2,-100,100)}this.refreshCam()}refreshCam(){const M=O.identity(O.create());O.mul(M,this.cameraMatrix,M),O.mul(M,this.camTurnMatrix,M),O.mul(M,this.perspectiveMatrix,M);const Q=this.uniforms.getUniformLocation(J0);if(Q)this.gl.uniformMatrix4fv(Q,!1,M)}updateTrianglePosition(M,Q){const V=this.attributeBuffers.getAttributeBuffer(l);this.attributeBuffers.bindBuffer(G.ARRAY_BUFFER,V),this.attributeBuffers.bufferSubData(G.ARRAY_BUFFER,Float32Array.from(Q),M*4*3*Float32Array.BYTES_PER_ELEMENT)}moveCam(M,Q){const V=y.create();O.getRotation(V,this.camTurnMatrix),y.invert(V,V);const W=i.fromValues(-M,0,Q);i.transformQuat(W,W,V),O.translate(this.cameraMatrix,this.cameraMatrix,W),this.refreshCam()}turnCam(M){O.rotateY(this.camTurnMatrix,this.camTurnMatrix,M),this.refreshCam()}drawArrays(M){this.gl.drawArrays(G.TRIANGLES,0,M)}drawElementsInstanced(M,Q){this.gl.clear(G.COLOR_BUFFER_BIT|G.DEPTH_BUFFER_BIT),this.gl.drawElementsInstanced(G.TRIANGLES,M,G.UNSIGNED_SHORT,0,Q)}bindVertexArray(){this.own(new M0(this.gl))}}function GV(){console.log("Hello World!")}function _V(M){M.style.border=".5px solid silver";const Q=new $0(M);Q.programs.addProgram("test",`
            #version 300 es

            precision highp float;
            
            layout (location=0) in vec4 position;
            layout (location=1) in mat4 transform;

            uniform mat4 cam;

            void main() {
                gl_Position = cam * transform * position;
                // gl_Position = position;
            }
        `,`
            #version 300 es

            precision highp float;
            out vec4 fragColor;
            
            void main() {
                fragColor = vec4(1.0, 0.0, 0.0, 0.5);
            }
        `),Q.programs.useProgram("test"),Q.initialize(),Q.drawElementsInstanced(6,2);const V={};document.addEventListener("keydown",(Y)=>{V[Y.code]=!0,console.log(V)}),document.addEventListener("keyup",(Y)=>{V[Y.code]=!1});function W(){if(V.KeyW)Q.moveCam(0,0.25);if(V.KeyS)Q.moveCam(0,-0.25);if(V.KeyA)Q.moveCam(-0.25,0);if(V.KeyD)Q.moveCam(0.25,0);if(V.KeyQ)Q.turnCam(-0.05);if(V.KeyE)Q.turnCam(0.05);Q.drawElementsInstanced(6,3),requestAnimationFrame(W)}return W(),Q}export{_V as testCanvas,GV as hello};

//# debugId=24BADA6ECD8522C364756e2164756e21
