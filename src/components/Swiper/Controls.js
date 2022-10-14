import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text } from 'react-native';
import View from "$ecomponents/View";

import { nodeType } from './nodeType';
import { renderNode } from './renderNode';
import Badge  from '$ecomponents/Badge';
import Button  from '$ecomponents/Button';
import theme from "$theme";

const cellPositions = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
];

export default class DefaultControls extends React.Component {
  dotsPos = (() => this._getPos(this.props.dotsPos, 'bottom', 'right'))();
  prevPos = (() =>
    this._getPos(this.props.prevPos, 'bottom-left', 'top-right'))();
  nextPos = (() => this._getPos(this.props.nextPos, 'bottom-right'))();

  constructor(props) {
    super(props);

    this._renderRow = this._renderRow.bind(this);
    this._renderCell = this._renderCell.bind(this);
    this._renderDot = this._renderDot.bind(this);
    this._renderButton = this._renderButton.bind(this);
  }

  _getPos(prop, horizontalDefault, verticalDefault) {
    return prop === false
      ? null
      : prop
      ? prop
      : verticalDefault && this.props.vertical
      ? verticalDefault
      : horizontalDefault;
  }

  _renderDot({ isActive, onPress }) {
    const { dotProps = {}, dotActiveStyle } = this.props;
    const { containerStyle, badgeStyle, ...others } = dotProps;
    return (
      <Badge
        containerStyle={StyleSheet.flatten([
          styles.dotsItemContainer,
          containerStyle,
        ])}
        color = {isActive ? theme.colors.primary : theme.colors.text}
        onPress={onPress}
        {...others}
      />
    );
  }

  _renderDots() {
    const {
      vertical,
      count,
      activeIndex,
      dotsTouchable,
      dotsWrapperStyle,
      DotComponent = this._renderDot,
      goTo,
    } = this.props;
    return (
      <View
        style={StyleSheet.flatten([
          styles.dotsWrapper(vertical),
          dotsWrapperStyle,
        ])}
      >
        {Array.from({ length: count }, (v, i) => i).map(index => (
          <DotComponent
            key={index}
            index={index}
            activeIndex={activeIndex}
            isActive={activeIndex === index}
            onPress={!dotsTouchable ? undefined : () => goTo(index)}
          />
        ))}
      </View>
    );
  }

  _renderButton({ type, title, titleStyle, onPress, ...props }) {
    return (
      <Button
        type="clear"
        onPress={onPress}
        title={title}
        {...props}
      />
    );
  }

  _renderPrev() {
    const {
      goToPrev,
      isFirst,
      prevTitle,
      firstPrevElement,
      prevTitleStyle,
      PrevComponent = this._renderButton,
    } = this.props;
    if (isFirst) {
      return renderNode(Text, firstPrevElement);
    }
    return (
      <PrevComponent
        type="prev"
        title={prevTitle}
        titleStyle={prevTitleStyle}
        onPress={goToPrev}
      />
    );
  }

  _renderNext() {
    const {
      goToNext,
      isLast,
      nextTitle,
      lastNextElement,
      nextTitleStyle,
      NextComponent = this._renderButton,
    } = this.props;
    if (isLast) {
      return renderNode(Text, lastNextElement);
    }
    return (
      <NextComponent
        type="next"
        title={nextTitle}
        titleStyle={nextTitleStyle}
        onPress={goToNext}
      />
    );
  }

  _renderCell({ name }) {
    const { cellsStyle = {}, cellsContent = {} } = this.props;
    return (
      <View style={StyleSheet.flatten([styles.cell, cellsStyle[name]])}>
        {this.dotsPos === name && this._renderDots()}
        {this.prevPos === name && this._renderPrev()}
        {this.nextPos === name && this._renderNext()}
        {cellsContent[name] && renderNode(Text, cellsContent[name])}
      </View>
    );
  }

  _renderRow({ rowAlign }) {
    const Cell = this._renderCell;
    const row = [
      `${!rowAlign ? '' : rowAlign + '-'}left`,
      rowAlign || 'center',
      `${!rowAlign ? '' : rowAlign + '-'}right`,
    ];
    const alignItems = ['flex-start', 'center', 'flex-end'];
    return (
      <View style={styles.row}>
        {row.map((name, index) => (
          <View key={name} style={styles.spaceHolder(alignItems[index])}>
            <Cell name={name} />
          </View>
        ))}
      </View>
    );
  }

  render() {
    const Row = this._renderRow;
    return (
      <React.Fragment>
        <Row rowAlign="top" contentAlign="flex-start" />
        <Row contentAlign="center" />
        <Row rowAlign="bottom" contentAlign="flex-end" />
      </React.Fragment>
    );
  }
}

DefaultControls.propTypes = {
  cellsStyle: PropTypes.shape(
    cellPositions.reduce(
      (obj, item) => ({ ...obj, [item]: PropTypes.style }),
      {}
    )
  ),
  cellsContent: PropTypes.shape(
    cellPositions.reduce((obj, item) => ({ ...obj, [item]: nodeType }), {})
  ),

  dotsPos: PropTypes.oneOf([...cellPositions, true, false]),
  prevPos: PropTypes.oneOf([...cellPositions, true, false]),
  nextPos: PropTypes.oneOf([...cellPositions, true, false]),
  prevTitle: PropTypes.string,
  nextTitle: PropTypes.string,

  dotsTouchable: PropTypes.bool,
  dotsWrapperStyle: PropTypes.shape({
    style: PropTypes.any,
  }),

  dotProps: PropTypes.shape(Badge.propTypes),
  dotActiveStyle: PropTypes.shape({
    style: PropTypes.any,
  }),
  DotComponent: PropTypes.func,

  prevTitleStyle: PropTypes.shape({
    style: PropTypes.any,
  }),
  nextTitleStyle: PropTypes.shape({
    style: PropTypes.any,
  }),
  PrevComponent: PropTypes.func,
  NextComponent: PropTypes.func,
  firstPrevElement: nodeType,
  lastNextElement: nodeType,
  vertical: PropTypes.bool,
  count: PropTypes.number,
  activeIndex: PropTypes.number,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  goToPrev: PropTypes.func,
  goToNext: PropTypes.func,
  goTo: PropTypes.func,
};

DefaultControls.defaultProps = {
  prevTitle: 'Prev',
  nextTitle: 'Next',
};

const styles = {
  row: {
    flexDirection: 'row',
    height: 0,
    alignItems: 'center',
    margin: 20,
  },
  spaceHolder: alignItems => ({
    height: 0,
    flex: 1,
    alignItems,
    justifyContent: 'center',
  }),
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  dotsWrapper: vertical => ({
    flexDirection: vertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 1,
    minHeight: 1,
  }),
  dotsItemContainer: {
    margin: 3,
  },
  hidden: {
    opacity: 0,
  },
};