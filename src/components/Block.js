import React from 'react'
import PropTypes from 'prop-types'

import '../styles/components/Block.pcss'

class Block extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      collapsed: props.collapsible ? props.collapsed : false,
    }
  }

  render() {
    return (
      <div className={`Block ${this.props.className}`}>
        <h3>
          <span>{this.props.title}</span>
          {this.props.collapsible &&
            <button
              className="btn"
              onClick={() => this.setState({collapsed: !this.state.collapsed})}
            >
              <i className={`fa fa-${this.state.collapsed ? 'plus' : 'minus'}`} />
            </button>
          }
        </h3>
        <div className={this.state.collapsed ? 'hidden' : ''}>
          {this.props.children}
        </div>
      </div>
    )
  }

}

Block.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  collapsible: PropTypes.bool,
  collapsed: PropTypes.bool
}


Block.defaultProps = {
  className: '',
  collapsible: false,
  collapsed: false
}

export default Block