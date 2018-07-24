#version 300 es
#define POSITION_LOCATION 0

precision highp int;
precision highp float;

layout(location = POSITION_LOCATION) in float a_nodeState;
uniform uint u_nodeCount;
uniform uint u_lineWidth;
uniform float u_pointSize;

flat out float v_nodeState;

float scaleToScreenSpace(float val, vec2 minMax){
    return (((val - minMax.x) / (minMax.y - minMax.x)) * 2.0) - 1.0;
}

void main() {
    float x = scaleToScreenSpace(0.5 + float(float(gl_VertexID) - float(float(u_lineWidth)*floor(float(gl_VertexID)/float(u_lineWidth)))), vec2(0,u_lineWidth));
    float y = scaleToScreenSpace(0.5 + floor(float(float(gl_VertexID)/float(u_lineWidth))), vec2(0,u_lineWidth));
    gl_Position = vec4(x, y, 0.0, 1.0);
    gl_PointSize = u_pointSize;
    v_nodeState = a_nodeState;
}
