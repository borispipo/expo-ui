import React from 'react'
import Types from 'prop-types'
import ErrorMessage from './ErrorMessage'
import {open,close} from "$epreloader";


class ErrorBoundary extends React.Component {
  state = {
    error: null,
    info: null,
    hasError: false
  }

  componentDidCatch (error, info) {
    close();
    this.setState({
      hasError : true,
      error,info
    },()=>{
      const args =  {context:this,error, info: info.componentStack,stack:info.componentStack};
      if (typeof this.props.onError === 'function') {
        this.props.onError(args);
      } else if(typeof this.props.onCatch =='function'){
         this.props.onCatch(args);
      }
    })
  }
  resetError(){
    this.setState({ hasError: false })
  }

  render () {
    const { error, info, hasError } = this.state
    const { render, customStyles } = this.props
    if (hasError) {
      if (typeof (render) === 'function') {
        return render(error, info)
      } else {
        return (
          <ErrorMessage
            testID={"RN_ErrorBoundaryErrorMessage"}
            error={error}
            info={info}
            resetError={this.resetError}
            customStyles={customStyles}
          />
        )
      }
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  render: Types.func,
  customStyles: Types.shape({
    container: Types.object,
    errorMessage: Types.object,
    componentStack: Types.object,
    arrow: Types.object
  })
}

export default ErrorBoundary