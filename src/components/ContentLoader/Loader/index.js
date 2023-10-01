
import ContentLoader from './RLoader';
import React from "$react";
import theme from "$theme";

export * from "./RLoader";

const RContentLoader = React.forwardRef((props,ref)=>{
    const rest = theme.isDark()? {
        backgroundColor : theme.colors.onSurface,
        foregroundColor : theme.colors.text,
    } : {};
    return <ContentLoader
        {...rest}
        {...props}
        ref = {ref}
    />
});
RContentLoader.displayName = "ContentLoaderComponent";
export default RContentLoader;