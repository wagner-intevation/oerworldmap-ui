import React from 'react'
import PropTypes from 'prop-types'
import 'normalize.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '../styles/fonts.pcss'
import '../styles/main.pcss'

import Header from './Header'
import Loading from './Loading'
import withUser from './withUser'

const App = ({
  locales, supportedLanguages, children,
}) => (
  <div id="wrapper">
    <Header locales={locales} supportedLanguages={supportedLanguages} />
    {children}
    <Loading />
  </div>
)

App.propTypes = {
  children: PropTypes.node.isRequired,
  locales: PropTypes.arrayOf(PropTypes.any).isRequired,
  supportedLanguages: PropTypes.arrayOf(PropTypes.any).isRequired,
}

export default withUser(App)
