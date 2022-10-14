import React, { Component } from 'react';
import { Animated, StyleSheet, I18nManager,View } from 'react-native';
import {Button} from "react-native-paper";
import Swipeable from 'react-native-gesture-handler/Swipeable';

const AnimatedView = Animated.createAnimatedComponent(View);

export default class GmailStyleSwipeableRow extends Component {
  renderLeftActions = (_progress,dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <Button style={styles.leftAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]} />
      </Button>
    );
  };
  renderRightActions = (
    _progress,
    dragX
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <Button style={styles.rightAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]} />
      </Button>
    );
  };

  swipeableRow;

  updateRef = (ref) => {
    this.swipeableRow = ref;
  };
  close = () => {
    this.swipeableRow?.close();
  };
  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#388e3c',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    backgroundColor: 'plum',
    height: 20,
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#dd2c00',
    flex: 1,
    justifyContent: 'flex-end',
  },
});