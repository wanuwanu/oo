// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
#import "oo_pipeline.h"
#import "oo_metal_renderer.h"
#import "oo_ios_utility.h"

void OoPipeline::create() {
  createPipelineState("shader_pc_vertex", "shader_pc_fragment");
  createDepthStencilState();
}

void OoPipeline::createPipelineState(string vertex_shader, string fragment_shader) {
  auto device = OoMetalRenderer::GetDevice();
  id<MTLLibrary> library = [device newDefaultLibrary];
  id<MTLFunction> vertex = [library newFunctionWithName:oo::NSStringMake(vertex_shader)];
  id<MTLFunction> fragment = [library newFunctionWithName:oo::NSStringMake(fragment_shader)];

  _mtlVertexDescriptor = [[MTLVertexDescriptor alloc] init];

  int offset = 0;
  int size = 0;
  NSArray<MTLVertexAttribute *> *attributes = [vertex vertexAttributes];
  for (MTLVertexAttribute* attribute in attributes) {
    string name = oo::stringMake(attribute.name);
    int i = (int)attribute.attributeIndex;
    int type = (int)attribute.attributeType;
    if (type >= MTLDataTypeFloat && type <= MTLDataTypeFloat4) {
      MTLVertexFormat format = MTLVertexFormatFloat;
      if (type == MTLDataTypeFloat ) {size = 4;  format = MTLVertexFormatFloat;}
      if (type == MTLDataTypeFloat2) {size = 8;  format = MTLVertexFormatFloat2;}
      if (type == MTLDataTypeFloat3) {size = 12; format = MTLVertexFormatFloat3;}
      if (type == MTLDataTypeFloat4) {size = 16; format = MTLVertexFormatFloat4;}
      _mtlVertexDescriptor.attributes[i].format = format;
      _mtlVertexDescriptor.attributes[i].offset = offset;
      _mtlVertexDescriptor.attributes[i].bufferIndex = 0;
      offset += size;
    } else {
      NSLog(@"Unknown data type : %@", attribute.name);
    }
  }

  _mtlVertexDescriptor.layouts[0].stride = offset;
  _mtlVertexDescriptor.layouts[0].stepRate = 1;
  _mtlVertexDescriptor.layouts[0].stepFunction = MTLVertexStepFunctionPerVertex;

  MTLRenderPipelineDescriptor *desc = [MTLRenderPipelineDescriptor new];
  desc.colorAttachments[0].pixelFormat = MTLPixelFormatBGRA8Unorm;
  desc.depthAttachmentPixelFormat = MTLPixelFormatDepth32Float;
  desc.vertexFunction = vertex;
  desc.fragmentFunction = fragment;
  desc.vertexDescriptor = _mtlVertexDescriptor;

  NSError *error = nil;
  _pipeline_state = [device newRenderPipelineStateWithDescriptor:desc error:&error];

  if (!_pipeline_state) {
    NSLog(@"Error occurred when creating render pipeline state: %@", error);
  }
}

void OoPipeline::createDepthStencilState() {
  auto device = OoMetalRenderer::GetDevice();
  MTLDepthStencilDescriptor *depthStencilDescriptor = [MTLDepthStencilDescriptor new];
  depthStencilDescriptor.depthCompareFunction = MTLCompareFunctionLess;
  depthStencilDescriptor.depthWriteEnabled = YES;
  _depth_stencil_state = [device newDepthStencilStateWithDescriptor:depthStencilDescriptor];
}

void OoPipeline::setup() {
  auto encoder = OoMetalRenderer::GetRenderCommandEncoder();
  [encoder setRenderPipelineState:_pipeline_state];
  [encoder setDepthStencilState:_depth_stencil_state];
  [encoder setFrontFacingWinding:MTLWindingCounterClockwise];
  [encoder setCullMode:MTLCullModeBack];
}

