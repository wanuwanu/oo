#import "oo_test_model.h"
#import "metal_renderer.h"

typedef struct{
  vector_float4 position;
  vector_float4 color;
} VertexPC;

void OoTestModel::create()
{
  auto device = MetalRenderer::GetDevice();

  static const VertexPC vertices[] =    {
    { .position = {  0.0,  0.9, 0, 1 }, .color = { 1, 0, 0, 1 } },
    { .position = { -0.9, -0.0, 0, 1 }, .color = { 0, 1, 0, 1 } },
    { .position = {  0.9, -0.0, 0, 1 }, .color = { 0, 0, 1, 1 } },
    { .position = {  0.0, -0.9, 1.1, 1 }, .color = { 1, 1, 1, 1 } }
  };
  _vertexBuffer = [device newBufferWithBytes:vertices
                                      length:sizeof(vertices)
                                     options:MTLResourceOptionCPUCacheModeDefault];

  static const uint16_t indices[] =  {
    0, 1, 2,
    2, 1, 3,
  };
  _indexBuffer = [device newBufferWithBytes:indices
                                     length:sizeof(indices)
                                    options:MTLResourceOptionCPUCacheModeDefault];
}

void OoTestModel::draw()
{
  auto encoder = MetalRenderer::GetRenderCommandEncoder();
  [encoder setVertexBuffer:_vertexBuffer offset:0 atIndex:0];
//  [encoder setVertexBuffer:_vertexBuffer offset:0 atIndex:1];

//    [encoder drawPrimitives:MTLPrimitiveTypeTriangle vertexStart:0 vertexCount:3];

  [encoder drawIndexedPrimitives:MTLPrimitiveTypeTriangle
                      indexCount:[_indexBuffer length] / sizeof(uint16_t)
                       indexType:MTLIndexTypeUInt16
                     indexBuffer:_indexBuffer
               indexBufferOffset:0];
}
