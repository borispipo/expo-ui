import React from "$react";
import {InteractionManager} from "react-native";
/**** options, les options lié à la transition */
export const AFTER_INTERACTIONS_TIMEOUT = 100;
export const useAfterInteractions =  (options) => {
	const [areInteractionsComplete, setInteractionsComplete] = React.useState(false)
    if(isNumber(options)){
        options = {timeout:options};
    }
    options = defaultObj(options);
    let timeout = isNumber(options.timeout)? options.timeout : defaultNumber(options.timeout,options.transitionTimeout,AFTER_INTERACTIONS_TIMEOUT);
	const subscriptionRef = React.useRef(null)
	const transitionRef = React.useRef(null)
	React.useEffect(() => {
		subscriptionRef.current = InteractionManager.runAfterInteractions(
			() => {
				setTimeout(()=>{
                    //transitionRef.current?.animateNextTransition()
                    setInteractionsComplete(true)
                    subscriptionRef.current = null
                },timeout)
			}
		)
		return () => {
			subscriptionRef.current?.cancel()
		}
	}, [])

	return {
		areInteractionsComplete,
        completed : areInteractionsComplete,
		transitionRef,
	}
}
