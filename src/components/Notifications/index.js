import { forwardRef } from "react";
import View from "$ecomponents/View";
import { Badge as RNBadge } from "react-native-paper";
import { StyleSheet, Pressable } from "react-native";
import Menu from "$ecomponents/Menu";
import List from "$ecomponents/List";
import theme from "$theme";
import Icon from "$ecomponents/Icon";
import { defaultStr} from "$cutils";
import { HStack } from "$ecomponents/Stack";
import Label from "$ecomponents/Label";
import Divider from "$ecomponents/Divider";
import Button from "$ecomponents/Button";
import Dimensions from "$cdimensions";
import React from "$react";
import PropTypes from "prop-types";

const Notifications = forwardRef(({testID,items:cItems,menuProps,title,containerProps,contentContainerProps,clearAllButton,clearAll,...rest}, ref) => {
  const items = React.useMemo(()=>{
    return Array.isArray(cItems) ? cItems : [];
  },[cItems]);
  testID = defaultStr(testID, "RN_Main_Notifications");
  const { height } = Dimensions.get("window");
  menuProps = Object.assign({},menuProps);
  containerProps = Object.assign({},containerProps);
  contentContainerProps = Object.assign({},contentContainerProps);
  return (
    <Menu
      testID = {`${testID}_NotificationsMenu`}
      ref = {ref}
      anchor={(p) => {
        const { onPress } = p;
        return (
          <Pressable {...p} style={[p.style, styles.anchor]}>
            <RNBadge
              onPress={onPress}
              style={[
                styles.badge,
                {
                  color: theme.colors.onSecondary,
                  backgroundColor: theme.colors.secondary,
                },
              ]}
            >
              {items.length}
            </RNBadge>
            <Icon
              containerColor={theme.colors.onPrimary}
              mode={"contained"}
              onPress={onPress}
              size={22}
              style={[theme.styles.noMargin]}
              color={theme.colors.primary}
              name={
                items.length ? "material-notifications" : "material-notifications-none"
              }
            />
          </Pressable>
        );
      }}
      {...menuProps}
      style={[styles.menu,menuProps.style]}
      children={
        <View {...containerProps} style={[styles.container,containerProps.style]} testID={`${testID}_Container`}>
          {items.length ? (
            <View
              style={theme.styles.w100}
              testID={testID + "_TiteleContainer"}
            >
              <HStack
                testID={`${testID}_LabelContainer`}
                style={[theme.styles.justifyContentSpaceBetween]}
              >
                {title !== false ? (
                    React.isValidElement(title)? title : <Label fontSize={17} textBold primary>
                        Notifications : {items.length?.formatNumber()}
                    </Label>
                ) : null}
                {clearAllButton !== false && (React.isValidElement(clearAllButton)? clearAllButton : 
                    <Button
                        borderRadius={10}
                        style={[theme.styles.cursorPointer]}
                        title={`Effacer les ${items.length.formatNumber()} notifications?`}
                        error
                        upperCase={false}
                        mode="contained"
                        onPress={(event)=>{
                            if(typeof clearAll =="function"){
                                return clearAll({items,event});
                            }
                        }}
                        icon="delete"
                      >
                        Effacer tout
                      </Button>
                )  || null}
              </HStack>
              <Divider style={[theme.styles.w100, theme.styles.mt1]} />
            </View>
          ) : null}
          <View
            testID={`${testID}_ListContainer`}
            {...contentContainerProps}
            style={[{ maxHeight: Math.max(height - 150, 230) },contentContainerProps.style]}
          >
            <List
              items={items}
              testID = {testID}
              {...rest}
            />
          </View>
        </View>
      }
    />
  );
});

Notifications.displayName = "NotificationsComponents";

Notifications.propTypes = {
    ...Object.assign({},List.propTypes), ///les props identiques au composant List
    items : PropTypes.array.isRequired,//les items à afficher dans le menu
    menuProps : PropTypes.shape(Object.assign({},Menu.propTypes)), //les props du composant menu
    containerProps : PropTypes.object,
    contentContainerProps : PropTypes.object, //les props du contentContainer, composant wrapper au composant List
    title : PropTypes.oneOfType([
        PropTypes.bool, //si false, alors le titre qui s'affiche lorsque le menu est ouvert ne sera pas rendu
        PropTypes.node, //si un composant react alors il sera utilisé pour substituer le composant title par défaut
    ]),
    clearAllButton : PropTypes.oneOfType([
        PropTypes.bool, //si false, alors le bouton clearAll ne sera pas affiché
        PropTypes.node, //si un composant react alors il sera utilisé pour substituer le composant bouton par défaut
    ])
}

const styles = StyleSheet.create({
  container: {
    minWidth: 300,
    padding: 15,
  },
  anchor: {
    position: "relative",
    marginRight: 10,
    marginTop: 10,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    zIndex: 1000,
  },
  menu: {
    maxWidth: 300,
  },
});

export default Notifications;