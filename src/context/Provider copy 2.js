import React from "$react";
import appConfig from "$capp/config";
import {View,Text} from "react-native";
export default function Provider(props){
  return <View style={{justifyContent:"center",flex:1,alignItems:"center"}}>
      <Text style={{fontSize:16}}>La vie de material</Text>
  </View>
}