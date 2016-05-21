/*
 * @react-settings-pane
 */
import React, { PropTypes, Component, Children } from 'react'
import ReactDOM from 'react-dom'
import serialize from 'form-serialize'

export default class SettingsPane extends Component {

  /**
   * PropTypes
   *
   * @type {{children: *, settings: *, index: *, onChange: *, onPaneLeave: *, onMenuItemClick: *}}
   */
  static propTypes = {
    children: PropTypes.node.isRequired,
    settings: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    index: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onPaneLeave: PropTypes.func,
    onMenuItemClick: PropTypes.func
  };

  /**
   * Construct.
   *
   * @param props
   */
  constructor(props) {
    super(props)

    this.state = {
      currentPage: props.index,
      items: props.items,
      settings: props.settings
    }
  }

  handleKeyUp(ev) {
    if (this.props.keyboard && ev.keyCode === 27) {
      this.props.onPaneLeave(false, this.state.settings, this.state.settings)
      this._keyUpListener.remove()
    }

  }

  componentDidUpdate() {
    let doc = ReactDOM.findDOMNode(this)
    this._keyUpListener = addEventListener(doc, 'keyup', this.handleKeyUp.bind(this))
  }

  /**
   * Switch content to another menuitem
   *
   * @param menuItem
   */
  switchContent(menuItem) {
    // Check if currentPage is different than the new urls
    if (this.state.currentPage !== menuItem.url) {

      // Switch to menuItem's url and reload the components
      this.setState(Object.assign({}, this.state, {
        currentPage: menuItem.url
      }))
    }
  }

  /**
   * Settings changed
   *
   * @param ev
   */
  settingsChanged(ev) {

    // Propagate onChange event
    if (this.props.onChange) {
      this.props.onChange(ev)
    }

  }

  /**
   * Handle Formsubmit
   *
   * @param ev
   */
  handleSubmit(ev) {
    ev.preventDefault()

    if (this.form) {
      // Retrieve settings via form serialization
      // todo: Create custom form Components and retrieve form data from these components instead of serializing..
      let newSettings = Object.assign({}, this.props.settings, serialize(this.form, { hash: true }))

      // Update state with new settings
      if (JSON.stringify(newSettings) !== JSON.stringify(this.props.settings)) {
        this.setState(Object.assign(this.state, {
          settings: newSettings
        }))

        // Propagate onPaneLeave
        this.props.onPaneLeave(
          true, newSettings, this.props.settings
        )
      }
      else {
        // Propagate onPaneLeave
        this.props.onPaneLeave(
          true, this.props.settings, this.props.settings
        )
      }
    }
    else {
      //console.error('Unknown error: Form reference to this.form invalid.')
    }
  }

  /**
   * Render this component
   *
   * @returns {XML}
   */
  render() {

    let { items, settings, currentPage } = this.state

    // Pass some props to all SettingsPane Children (usualy there are two childs: SettingsMenu and SettingsContent)
    let childrenWithProps = Children.map(this.props.children,
      (child) => React.cloneElement(child, {
        items,
        settings,
        currentPage,

        onPaneLeave: this.props.onPaneLeave,
        onMenuItemClick: this.props.onMenuItemClick,
        switchContent: this.switchContent.bind(this),
        onChange: this.settingsChanged
      })
    )

    // Return JSX
    return (
      <div className="settings-pane">
        <form ref={(ref) => this.form = ref} className="settings" onSubmit={this.handleSubmit.bind(this)}>
          {childrenWithProps}
        </form>
      </div>
    )
  }
}
