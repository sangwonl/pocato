import { glsl } from './utils/glsl'

export default glsl`
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 uResolution,uMouse,uMove,uRotate;uniform float uTime;uniform sampler2D uImgBase,uImgPopup;varying vec2 vUv;
#define mod289(x)mod(x,289.)
float m(int u,int x){vec2 m=vUv;const mat3 v=mat3(13.323122,23.5112,21.71123,21.1212,28.7312,11.9312,21.8112,14.7212,61.3934);vec2 f=uMove.xy/uResolution.xy;f.x=max(.15,smoothstep(.15,.8,f.x));m.x+=f.x*.2;float r=float(66),g=0.,s=5.*sin(uTime*.1);for(int f=max(u,0);f<min(x,66);f++){float y=float(f),a=smoothstep(.3,.1,y/r),e=smoothstep(.4,.3,y/r);vec2 i=m*(1.+y*a);i+=vec2(i.y*(e*mod(y*7.238917,1.)-e*.1*sin(uTime*2.+y)),smoothstep(.6,.1,y/r)*uTime/(1.+y*a*.03));vec3 n=vec3(floor(i),31.189+y),B=floor(n)*1e-5+fract(n);n=fract((31415.9+B)/fract(v*B));i=abs(mod(i,1.)-.5+.9*n.xy-.45)+.01*abs(2.*fract(10.*i.yx)-1.);e=.05+.05*min(.5*abs(y-5.-s),1.);g+=smoothstep(e,-e,.6*max(i.x-i.y,i.x+i.y)+max(i.x,i.y)-.01)*(n.x/(1.+.02*y*a));}return g;}void main(){vec4 i=texture2D(uImgBase,vUv);gl_FragColor=mix(gl_FragColor,i,i.w);float f=m(5,15);gl_FragColor+=vec4(vec3(f),1);i=texture2D(uImgPopup,vUv+uMove.xy/uResolution.xy*0.);gl_FragColor=mix(gl_FragColor,i,i.w);f=m(16,20);gl_FragColor+=vec4(vec3(f),1);}
`
