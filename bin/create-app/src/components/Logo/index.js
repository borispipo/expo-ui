import Label from "$ecomponents/Label";
import appConfig from "$capp/config";

export default function LogoComponent(props){
    return <Label primary textBolx>{appConfig.name}</Label>
}