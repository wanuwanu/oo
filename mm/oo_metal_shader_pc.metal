#include <metal_stdlib>
using namespace metal;

struct Uniforms {
  float4x4 transform;
};

struct Vertex {
  float3 position [[attribute(0)]];
  float4 color    [[attribute(1)]];
};

struct Fragment {
  float4 position [[position]];
  float4 p2;
  float4 color;
};

vertex Fragment shader_pc_vertex(Vertex in [[stage_in]],
                                 constant Uniforms & uniforms [[ buffer(1) ]]){
  Fragment out;

  out.position = float4(in.position, 1);
  out.position = uniforms.transform * float4(in.position, 1);
  out.p2 = float4(in.position, 1);

  out.color = in.color;
  return out;
}

fragment float4 shader_pc_fragment(Fragment in [[stage_in]]){

//  float4 c;
//  c.x = in.p2.x * 0.5 + 0.5;
//  c.y = in.p2.y * 0.5 + 0.5;
//  c.z = 0;
//  c.w = 1;
//  return c;

  return in.color;
}

