const getCustomFabSize = (customSize, roundness) => ({
    height: customSize,
    width: customSize,
    borderRadius: roundness === 0 ? 0 : customSize / roundness,
});

export const standardSize = {
    height: 56,
    width: 56,
    borderRadius: 28,
  };
export const smallSize = {
    height: 40,
    width: 40,
    borderRadius: 28,
  };
  export const largeSize = {
    height: 96,
    width: 96,
    borderRadius : 45,
  }
  const v3SmallSize = {
    height: 40,
    width: 40,
  };
  const v3MediumSize = {
    height: 56,
    width: 56,
  };
  const v3LargeSize = {
    height: 96,
    width: 96,
  };

export const getFabStyle = ({size,theme,customSize}) => {
    const { isV3, roundness } = theme;
  
    if (customSize) return getCustomFabSize(customSize, roundness);
  
    if (isV3) {
      switch (size) {
        case 'small':
          return { ...v3SmallSize, borderRadius: 3 * roundness };
        case 'medium':
          return { ...v3MediumSize, borderRadius: 4 * roundness };
        case 'large':
          return { ...v3LargeSize, borderRadius: 7 * roundness };
      }
    }
    if (size === 'small') {
      return smallSize;
    }
    return standardSize;
  };