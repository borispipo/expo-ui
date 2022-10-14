import {isMobileMedia,isTabletMedia,isDesktopMedia} from "$cplatform/dimensions";
import theme,{Colors} from "$theme";

export const getBackgroundColor = (backgroundColor)=> Colors.isValid(backgroundColor)? backgroundColor : Colors.darken(theme.colors.background,1);

export const NUMBER_OF_LINES = 5;

export const getNumberOfLines = (props)=> isMobileMedia() ? 2 : isTabletMedia() ? 3 : isDesktopMedia()? 4 : NUMBER_OF_LINES;