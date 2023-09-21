import theme from "$theme";
import Label from "$ecomponents/Label";

export {default as Paragraph} from "../Paragraph";

export function H1({style,...props}){
    return <Label {...props} style={[theme.styles.h1,style]}/>
}

H1.displayName = "TypographyH1Component";

export function H2({style,...props}){
    return <Label {...props} style={[theme.styles.h2,style]}/>
}

H2.displayName = "TypographyH2Component";

export function H3({style,...props}){
    return <Label {...props} style={[theme.styles.h3,style]}/>
}

H3.displayName = "TypographyH3Component";

export function H4({style,...props}){
    return <Label {...props} style={[theme.styles.h4,style]}/>
}

H4.displayName = "TypographyH4Component";


export function H5({style,...props}){
    return <Label {...props} style={[theme.styles.h5,style]}/>
}

H5.displayName = "TypographyH5Component";


export function H6({style,...props}){
    return <Label {...props} style={[theme.styles.h6,style]}/>
}

H6.displayName = "TypographyH6Component";