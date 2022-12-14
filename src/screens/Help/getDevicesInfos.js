import appConfig from "$capp/config";
import deviceProps from "./deviceProps";
import Label from "$ecomponents/Label";
import theme from "$theme";
import View from "$ecomponents/View";

export default  (infos,force)=>{
    infos = defaultObj(infos);
    infos.deviceId = appConfig.deviceId;
    const deviceInfo = [];
    force = force !== undefined ? force : true;
    Object.map(deviceProps,(info,p)=>{
        if(!(p in infos)){
            infos[p] = appConfig.get(p) || undefined;
        }
        if((infos[p])){
            let _info = infos[p];
            if(_info == 'unknown' || !_info) return null;
            const testID = 'RN_DeviceInfo_'+p;
            deviceInfo.push(
                <View testID={testID} textBold key={p} style={[theme.styles.row,theme.styles.w100]}>
                    <Label testID = {testID+"_Label"} textBold>{info+" : "}</Label>
                    <Label testID = {testID+"_Value"} primary textBold>
                        {_info}
                    </Label>
                </View>
            )
        }
    })
    return deviceInfo;
}