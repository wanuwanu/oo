// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#ifndef oo_metal_shader_uniform_h
#define oo_metal_shader_uniform_h

struct WorldUniform {
  matrix_float4x4 projection;
  matrix_float4x4 view;
  matrix_float4x4 projection_view;

  vector_float4   light_direction;
  vector_float4   light_color;
  vector_float4   light_ambient;
};

#ifndef __METAL_VERSION__
struct OoWorldUniformLayout : OoUniformLayout {
  virtual int projection() { return offsetof(WorldUniform, projection); }
  virtual int view() { return offsetof(WorldUniform, view); }
  virtual int projection_view() { return offsetof(WorldUniform, projection_view); }
  virtual int light_direction() { return offsetof(WorldUniform, light_direction); }
  virtual int light_color() { return offsetof(WorldUniform, light_color); }
  virtual int light_ambient() { return offsetof(WorldUniform, light_ambient); }
  // virtual int xx() { return offsetof(WorldUniform, xx); }
};
#endif

#endif /* oo_metal_shader_uniform_h */


