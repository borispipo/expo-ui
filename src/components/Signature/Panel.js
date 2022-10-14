import * as React from 'react';
import View from "$components/View";
import {
	PanResponder,
	StyleSheet,
	PixelRatio,
	GestureResponderEvent,
	LayoutChangeEvent,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot';
import PropTypes from "prop-types";

class SignaturePanel extends React.Component {

	static timer = null;

	constructor(props) {
		super(props);
		this.state = {
			paths: [],
			points: [],
			posX: 0,
			posY: 0,
		};
		this.signatureContainer = React.createRef();
		this.panResponder = PanResponder.create({
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: e => this.onTouch(e),
			onPanResponderMove: e => this.onTouch(e),
			onPanResponderRelease: e => this.onTouchEnd(),
			onStartShouldSetPanResponder: () => true,
		});
	}
	render() {
		const { containerStyle, width, height } = this.props;
		const { paths, points } = this.state;
		return (
			<View
				{...this.panResponder.panHandlers}
				ref={this.signatureContainer}
				onLayout={this.onLayoutContainer}
				style={[containerStyle, { width, height }]}
			>
				{this.renderSvg(paths, points)}
			</View>
		);
	}

	/**
	 * Resets the signature pad container
	 * @param {GestureResponderEvent} e Event
	 * @public
	 */
    reset() {
		this.setState({
			paths: [],
			points: [],
			posX: 0,
			posY: 0,
		});
	}

	/**
	 * Detect the touch start and move events on the signature pad
	 * @param {GestureResponderEvent} e Event
	 * @private
	 */

	onTouch(e) {
		const { locationX, locationY } = e.nativeEvent;
		const { points } = this.state;
		if (SignaturePanel.timer) {
			clearTimeout(SignaturePanel.timer);
		}
		this.setState({
			paths: this.state.paths,
			points: [...points, { locationX, locationY }],
		});

		this.props.onTouch(e);
	}

	/**
	 * Detect when the user has finished the gesture
	 * @private
	 */

	onTouchEnd() {
		const { paths, points } = this.state;
		const { strokeColor, strokeWidth } = this.props;
		const newPath = <Path d={this.plotToSvg(points)} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />;
		this.setState(
			{
				paths: [...paths, newPath],
				points: [],
			},
			this.returnImageData({ paths, points })
		);

		this.props.onTouchEnd();
	}

	/**
	 * Plots the captured points to an array
	 * @param {Array} points Points
	 * @return {any}
	 * @private
	 */

	plotToSvg(points) {
		const { posX, posY } = this.state;
		if (points.length > 0) {
			let path = `M ${points[0].locationX - posX},${points[0].locationY - posY}`;
			points.forEach(point => {
				path += ` L ${point.locationX - posX},${point.locationY - posY}`;
			});
			return path;
		} else {
			return '';
		}
	}

	/**
	 * Takes the points and forms an SVG from them
	 * @param {Array} paths
	 * @param {Array} points
	 * @return {Element}*
	 * @private
	 */

	renderSvg = (paths, points) => {
		const { width, height, strokeColor, strokeWidth } = this.props;
		this.svgRef = this.svgRef || React.createRef();
		return (
			<Svg style={styles.pad} width={width} height={height} ref={this.svgRef}>
				<G>
					{paths.map((path, i) => {
						return <React.Fragment key={`path-${i}`}>{path}</React.Fragment>;
					})}
					<Path d={this.plotToSvg(points)} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
				</G>
			</Svg>
		);
	};

	/**
	 * Sets the layout view
	 * @param {LayoutChangeEvent} e Event
	 * @private
	 */

	onLayoutContainer = (e) => {
		const { x, y } = e.nativeEvent.layout;
		const { offsetX, offsetY } = this.props;
		this.setState({
			posX: x + offsetX,
			posY: y + offsetY,
		});
	};

	/**
	 * Creates a snapshot image from the view container
	 * @param {Array} paths
	 * @param {Array} points
	 * @return {SignaturePanelProps['onFingerUp']}*
	 * @private
	 */

	returnImageData({ paths, points }) {
		const { onFingerUp, onFingerUpTimeout, imageFormat, outputType, imageOutputSize, imageQuality } = this.props;
		return () => {
			if (!['jpg', 'png', 'webm', 'raw'].includes(imageFormat)) {
				onFingerUp(this.renderSvg(paths, points));
			} else {
				const pixelRatio = PixelRatio.get();
				const pixels = imageOutputSize / pixelRatio;
				console.log(this.svgRef," is svg ref");
				return;
				SignaturePanel.timer = setTimeout(async () => {
					const file = await takeSnapshotAsync(this.signatureContainer, {
						format: imageFormat,
						height: pixels,
						quality: imageQuality,
						result: outputType,
						width: pixels,
					});
					onFingerUp(file);
					SignaturePanel.timer = null;
				}, onFingerUpTimeout);
			}
		};
	}
}

const styles = StyleSheet.create({
	pad: {
		backgroundColor: 'transparent',
	},
});
export default SignaturePanel;

SignaturePanel.propTypes = {
	containerStyle : PropTypes.object,
	width: PropTypes.oneOfType([
        PropTypes.string, 
        PropTypes.number
    ]),
	height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
	offsetX: PropTypes.number,
	offsetY: PropTypes.number,
	strokeColor: PropTypes.string,
	strokeWidth: PropTypes.number,
	onFingerUp: PropTypes.any,
	onFingerUpTimeout: PropTypes.number,
	onTouch: PropTypes.any,
	onTouchEnd: PropTypes.any,
	imageOutputSize:PropTypes.number,
	imageQuality:PropTypes.number,
	imageFormat: PropTypes.oneOf([
        'jpg' , 'png' , 'webm' , 'raw'
    ]),
	outputType: PropTypes.oneOf([
        'tmpfile' , 'base64' , 'data-uri' , 'zip-base64'
    ])
}

SignaturePanel.defaultProps = {
    height: 300,
    imageFormat: 'png',
    imageOutputSize: 480,
    imageQuality: 1,
    offsetX: 0,
    offsetY: 0,
    onFingerUp: () => {},
    onFingerUpTimeout: 1000,
    onTouch: () => {},
    onTouchEnd: () => {},
    outputType: 'tmpfile',
    strokeColor: '#000',
    strokeWidth: 3,
    width: '100%',
}