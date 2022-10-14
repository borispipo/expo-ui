import Component from "./Component";
import React from "$react";
import { getStatusBarStyle } from "$theme";

export default function StatusBarMainComponent(props){
    return <Component {...getStatusBarStyle()} {...props}/>
}