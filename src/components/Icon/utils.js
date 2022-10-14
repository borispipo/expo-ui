import {isIos} from "$cplatfrom";
import theme,{Colors} from "$theme";

export const BACK_ICON = isIos() ? "chevron-left" : "arrow-left";

export const MORE_ICON = isIos() ? 'dots-horizontal' : 'dots-vertical';

export const MENU_ICON = "menu";

export const COPY_ICON = "content-copy";

export const PRINT_ICON = "printer";

export const ICON_SIZE = 24;
export const ICON_OFFSET = 12;
