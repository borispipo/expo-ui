import APP from "$app/instance";
import deviceProps from "./deviceProps";
import Label from "$components/Label";
import theme from "$theme";
import View from "$components/View";

export default  (infos,force)=>{
    infos = defaultObj(infos,APP.DEVICE);
    infos.freeRAMInGB = APP.getFreeRAM();
    let deviceInfo = [];
    force = force !== undefined ? force : true;
    Object.map(deviceProps,(info,p)=>{
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