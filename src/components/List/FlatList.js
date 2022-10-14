import React from "$react";
import {FlatList,LogBox} from 'react-native'
import CommonListComponent from "./Common";

const FlatListComponent = React.forwardRef((props,ref)=>{
    React.useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
    }, []);
    return (
            <CommonListComponent
                testID = {'RN_FlatListComponent'}
                removeClippedSubviews={true} // Unmount components when outside of window 
                initialNumToRender={2} // Reduce initial render amount
                maxToRenderPerBatch={1} // Reduce number in each render batch
                updateCellsBatchingPeriod={100} // Increase time between renders
                windowSize={7} // Reduce the window size
                {...props}
                itemHeight = {undefined}
                Component = {FlatList}
                ListHeaderComponent={() => (
                    <React.Fragment>{props.children}</React.Fragment>
                )}
                ref={ref}
            />
      )
})

FlatListComponent.propTypes = {
    ...CommonListComponent.propTypes,
}

export default FlatListComponent;

FlatListComponent.displayName = "FlatListComponent";