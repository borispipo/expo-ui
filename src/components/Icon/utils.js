import {isIos} from "$cplatform";

export const BACK_ICON = isIos() ? "chevron-left" : "arrow-left";

export const MORE_ICON = isIos() ? 'dots-horizontal' : 'dots-vertical';

export const MENU_ICON = "menu";

export const COPY_ICON = "content-copy";

export const PRINT_ICON = "printer";

export const ICON_SIZE = 24;
export const ICON_OFFSET = 12;

export const CHECKED_ICON = isIos()? 'check' : "checkbox-marked";

export const CHECK_ICON = 'check';

export const UNCHECKED_ICON = "checkbox-blank-outline";
