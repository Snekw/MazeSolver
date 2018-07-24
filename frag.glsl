#version 300 es

precision highp int;
precision highp float;

flat in float v_nodeState;
out vec4 fragColor;

void main() {
  switch(int(v_nodeState)){
  case 1:
    fragColor = vec4(1.0,0.0,0.0,1.0);
    break;
  case 2:
    fragColor = vec4(1.0,1.0,0.0,1.0);
    break;
  default:
    fragColor = vec4(1.0,1.0,1.0,1.0);
    break;
  }
}
