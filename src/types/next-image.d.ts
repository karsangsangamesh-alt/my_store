declare module 'next/image' {
  import * as React from 'react';

  interface StaticImageData {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
    blurWidth?: number;
    blurHeight?: number;
  }

  interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number;
  }

  interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
    src: string | StaticImageData;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    loader?: (resolverProps: ImageLoaderProps) => string;
    quality?: number | `${number}`;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    loading?: 'lazy' | 'eager';
    style?: React.CSSProperties;
  }

  const Image: React.ComponentType<ImageProps>;
  export default Image;
}
