#import <UIKit/UIKit.h>
#import <Metal/Metal.h>

NS_ASSUME_NONNULL_BEGIN

@interface MetalView : UIView

- (CAMetalLayer *)metalLayer;
- (instancetype)initWithFrame:(CGRect)frame device:(id<MTLDevice>)device;

@end

NS_ASSUME_NONNULL_END
