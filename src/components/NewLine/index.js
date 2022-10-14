import {Text} from "react-native"
export default function BrComponent(props){
    return <Text>{"\n"}{props.children|| null}</Text>
}