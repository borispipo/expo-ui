import Label from "$ecomponents/Label";
import appConfig from "$capp/config";

export default function LogoComponent(props){
    return <Label primary textBold>{appConfig.name}</Label>
}