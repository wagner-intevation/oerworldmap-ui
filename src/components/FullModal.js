/* global window */
import React from 'react'
import PropTypes from 'prop-types'
import withEmitter from './withEmitter'
import Link from './Link'

import '../styles/components/FullModal.pcss'

class FullModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: true
    }

    this.closeModal = this.closeModal.bind(this)
  }

  closeModal(e) {
    if (e.target.classList.contains('FullModal') ||
      e.target.classList.contains('closeModal')) {
      this.setState({visible: false})
      window.history.length
        ? window.history.back()
        : this.props.emitter.emit('navigate', '/resource/')
    }
  }

  render() {
    return (
      <div className={this.props.className} >
        {this.state.visible === true ? (
          <div
            className="FullModal"
            role="button"
            tabIndex="-1"
            onClick={this.closeModal}
            onKeyDown={(e) => {
              if (e.keyCode === 27) {
                e.target.click()
              }
            }}
          >
            <div className="modalDialog">
              {this.props.children}

              {typeof window !== 'undefined' &&
                window.history.length ?
                (
                  <span
                    className="closeModal"
                    onClick={this.closeModal}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.keyCode === 27) {
                        e.target.click()
                      }
                    }}
                  >
                    <i className="fa fa-close" />
                  </span>
                ) : (
                  <Link
                    href='/resource/'
                    className="closeModal"
                  >
                    <i className="fa fa-close" />
                  </Link>
                )
              }

            </div>
          </div>
        ) : null
        }
      </div>
    )
  }
}

FullModal.propTypes = {
  emitter: PropTypes.objectOf(PropTypes.any).isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

FullModal.defaultProps = {
  className: null,
}
export default withEmitter(FullModal)