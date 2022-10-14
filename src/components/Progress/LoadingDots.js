import React from 'react'
import {  StyleSheet, Animated, Easing } from 'react-native';
import View from "$ecomponents/View";
import {isNativeMobile} from "$cplatform"; //boris fouomene
const useNativeDriver = isNativeMobile();
const SIZE = 16
const MARGIN = 5
const BG = 'rgb(172, 172, 172)'
const ACTIVE_BG = '#808184'
const dots = [1, 2, 3]
const INTERVAL = 300
const ANIMATION_DURATION = 400
const ANIMATION_SCALE = 1.4
export default class ThreeDotsLoader extends React.Component {
  state = {
    active: 1
  }

  componentDidMount(){
    this.interval = setInterval(() => {
      const active = this.state.active
      this.setState({ active: active > 2 ? 1 : active + 1})
    }, INTERVAL);
  }

  componentWillUnmount(){
    clearInterval(this.interval)
  }

  render() {
  /*** update by boris Fouomene to fix react warning : every child must have an unique key :
   * Warning: Each child in a list should have a unique "key" prop.
   */
  const active = this.state.active
   return (
     <View style={styles.main}>
       {dots.map(i => <Dot {...this.props} key={i} active={i === active}/>)}
     </View>
   )
  }
}

class Dot extends React.Component {
  static defaultProps = {
    size: SIZE,
    background: BG,
    activeBackground: ACTIVE_BG,
    dotMargin: MARGIN,
    animationDuration: ANIMATION_DURATION,
    animationScale: ANIMATION_SCALE,
  }

  constructor(props) {
    super(props)
    this.scale = new Animated.Value(1)
  }

  componentDidMount(){
    if (this.props.active) this.scaleUp()
  }

  componentDidUpdate(prevProps){
    if (prevProps.active && !this.props.active){
      this.scaleDown()
    }
    if (!prevProps.active && this.props.active){
      this.scaleUp()
    }
  }

  scaleDown = () => {
    Animated.timing(
      this.scale,
      {
        toValue: 1,
        easing : this.props.easing,
        duration: this.props.animationDuration,
        delay : this.props.delay,
        useNativeDriver,
      }
    ).start((o) => {
      if(o.finished) {
        this.scaleDown();
      }
    })
  }

  scaleUp = () => {
    Animated.timing(
      this.scale,
      {
        toValue: this.props.animationScale,
        easing : this.props.easing,
        duration: this.props.animationDuration,
        delay : this.props.delay,
        useNativeDriver
      }
    ).start((o) => {
      if(o.finished) {
        this.scaleUp();
      }
    })
  }

  render(){
    const { active, size, background, activeBackground, dotMargin } = this.props
    const style = {
      height: size, 
      width: size,
      borderRadius: size / 2,
      marginHorizontal: dotMargin,
      backgroundColor: active ? activeBackground : background
    }
    return (
      <Animated.View style={[style, {transform: [{ scale: this.scale }]}]}/>
    )
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})