import * as React from 'react'
import Types from 'prop-types';
import {StyleSheet,View,useWindowDimensions} from "react-native";
import ScrollView  from "$ecomponents/ScrollView";
import {Paragraph,Button,List } from "react-native-paper";
import Portal from "$ecomponents/Portal";
import theme from "$theme";
import {navigationRef,sanitizeName} from "$cnavigation";
import Expandable from "$ecomponents/Expandable";
import Label from "$ecomponents/Label";

const homeRoute = sanitizeName("Home");
import {isWeb} from "$cplatform";

const ErrorMessage = React.forwardRef(function(props,ref){
  const { error,resetError,onGoBack, info } = props
    const goToHome = ()=> {
      if(navigationRef){
        navigationRef.navigate(homeRoute);
        if(typeof onGoBack =='function'){
          onGoBack();
        }
        return;
      }
    }
    if(!error || !info || !error.toString) return null;
    const pointerEvents = 'auto';
    const {width,height} = useWindowDimensions();
    return <Portal>
          <View ref={ref} testID='RN_ErrorBoundary_Container' pointerEvents={pointerEvents} style={[styles.container,isWeb()?{position:'fixed'}:null,{backgroundColor:theme.colors.surface,width,height}]}>
            <View style={styles.content} pointerEvents={pointerEvents}>
              <Label style={styles.title}>Oops!</Label>
              <Label style={styles.subtitle}>{'Une erreur est survenue'}</Label>
              <Label style={styles.error}>{error.toString()}</Label>
              <Button mode="contained" pointerEvents={pointerEvents} iconProps={{marginVertical:0,paddingVertical:0}} icon='home-variant' style={{backgroundColor:theme.colors.primary,marginHorizontal:10}} labelStyle={{color:theme.colors.primaryLabel}} onPress={goToHome}>
                  Retour à l'accueil
              </Button>
              <Expandable title="Plus de détail sur l'erreur">
                  <View style={{maxHeight:height}}>
                    <ScrollView style={{flex:1}} contentContainerStyle={{flex:1,flexGrow:1,paddingBottom:30,maxHeight:Math.max(height-200,200)}} testID='RN_ErrorBoundary_ScrollView'>
                      <Paragraph testID='RN_ErrorBoundary_StackDetails' style={[styles.componentStack,{color:theme.colors.text}]}>
                        {info.componentStack}
                      </Paragraph>
                    </ScrollView>
                </View>
              </Expandable>
            </View>
        </View>
    </Portal>
});

ErrorMessage.displayName = "ErroBoundaryMessageComponent";

ErrorMessage.propTypes = {
  error: Types.object,//.isRequired,
  info: Types.shape({
    componentStack: Types.string.isRequired
  }),//.isRequired,
  customStyles: Types.shape({
    container: Types.object,
    errorMessage: Types.object,
    componentStack: Types.object,
    browserInfo: Types.object,
    arrow: Types.object
  })
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    flex: 1,
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal : 16,
    top : 0,
    left : 0,
    paddingVertical : 16,
  },
  content : {
    flex : 1,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  error: {
    paddingVertical:16
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 50,
    padding: 16
  },
  buttonLabel: {
    fontWeight: '600',
    textAlign: 'center'
  },
})


export default ErrorMessage