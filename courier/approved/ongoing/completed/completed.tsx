import * as React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export const DeliveryCompletedIcon = (props: SvgProps) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={100} height={100} fill="none" {...props}>
      <Circle cx={50} cy={50} r={50} fill="#fff" />
      <Path
        fill="#FFE493"
        d="M54.708 71.417C43.837 71.417 35 62.58 35 51.708 35 40.837 43.837 32 54.708 32c10.872 0 19.709 8.837 19.709 19.708 0 10.872-8.837 19.709-19.709 19.709Z"
      />
      <Path
        fill="#292D32"
        d="M51 67.708c-10.872 0-19.708-8.836-19.708-19.708 0-10.872 8.836-19.708 19.708-19.708 10.872 0 19.708 8.836 19.708 19.708 0 10.872-8.836 19.708-19.708 19.708Zm0-36.666c-9.35 0-16.958 7.608-16.958 16.958 0 9.35 7.608 16.958 16.958 16.958 9.35 0 16.958-7.608 16.958-16.958 0-9.35-7.608-16.958-16.958-16.958Z"
      />
      <Path
        fill="#292D32"
        d="M48.397 54.563c-.367 0-.715-.146-.972-.403l-5.188-5.188a1.383 1.383 0 0 1 0-1.944 1.383 1.383 0 0 1 1.943 0l4.217 4.217 9.423-9.423a1.383 1.383 0 0 1 1.943 0 1.383 1.383 0 0 1 0 1.943L49.368 54.16a1.374 1.374 0 0 1-.971.403Z"
      />
    </Svg>
  );
};
