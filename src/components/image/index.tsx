import { FC, memo } from 'react';
import { ImageProps, Image as RNImage } from 'react-native';

import requestBus from '@/store/currentRequests';

/**
 * Image 组件，用于追踪图片加载情况
 * @param props Image 组件 props，omit: onError onLoadStart onLoadEnd
 * @param onError 不影响原函数使用
 * @param onLoadEnd 不影响原函数使用
 * @param onLoadStart 不影响原函数使用
 * @constructor
 */
const Image: FC<ImageProps> = ({
  onError,
  onLoadStart,
  onLoadEnd,
  ...props
}) => {
  const handleLoad = () => {
    onLoadStart && onLoadStart();
    requestBus.requestRegister();
  };
  const handleLoadEnd = () => {
    onLoadEnd && onLoadEnd();
    requestBus.requestComplete();
  };
  const handleErr = (err: any) => {
    onError && onError(err);
    requestBus.requestComplete();
  };
  return (
    <RNImage
      {...props}
      onLoadStart={handleLoad}
      onLoadEnd={handleLoadEnd}
      onError={handleErr}
    ></RNImage>
  );
};
export default memo(Image);
