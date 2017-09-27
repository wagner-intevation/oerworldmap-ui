/* global FormData */

import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'react-popperjs'
// import Logo from '../assets/logo.svg'
import '../styles/Filters.pcss'


import withEmitter from './withEmitter'
import Icon from './Icon'
import Link from './Link'
import translate from './translate'

const onSubmit = (e, emitter) => {
  e.preventDefault()
  const form = e.target.parentElement.form || e.target.form || e.target
  const formData = new FormData(form)
  const parameters = [...formData.entries()]
    .map(p => encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1])).join("&")
  emitter.emit('navigate', '/resource/?' + parameters)
}

const triggerClick = (e) => {
  if (e.keyCode === 32) {
    e.target.click()
  }
}

const Filters = ({query, filters, aggregations, emitter, extended, translate}) => (
  <nav className="Filters">

    <form action="/resource/" onSubmit={(evt) => onSubmit(evt, emitter)}>
      {extended ? (
        <div className="filterSearch">
          <input type="search" name="q" defaultValue={query} placeholder={`${translate('Filters.searchTheMap')}...`} />
        </div>

      ) : (
        <noscript>
          <div className="search-bar">
            <input type="submit" className="btn" />
          </div>
        </noscript>
      )}

      <div className="filterType">
        <div>
          {aggregations['about.@type']['buckets'].map(function (bucket) {
            return (
              <div className="filterBox" key={bucket.key}>
                <Tooltip
                  message={translate(bucket.key)}
                  placement='top'
                  tooltipClassName='Tooltip'
                  arrowColor='#646464'
                >
                  <input
                    type="radio"
                    value={bucket.key}
                    checked={filters.hasOwnProperty("about.@type")
                      && filters["about.@type"].includes(bucket.key)
                    }
                    name="filter.about.@type"
                    id={"type:" + bucket.key}
                    onChange={(evt) => onSubmit(evt, emitter)}
                  />

                  <label
                    onClick={(evt) => {
                      // Trigger submit only if onChange is not triggered
                      if (filters.hasOwnProperty("about.@type")
                        && filters["about.@type"].includes(bucket.key)) {
                        onSubmit(evt, emitter)
                      }
                    }}
                    onKeyDown={triggerClick}
                    role="button"
                    tabIndex="0"
                    htmlFor={"type:" + bucket.key}
                    aria-label={translate(bucket.key)}
                    className="btn"
                  >
                    <Icon type={bucket.key} />
                  </label>

                </Tooltip>
              </div>
            )
          }, this)}
        </div>
      </div>

      <div className="sortContainer">
        <select name="sort" className="btn" onChange={(evt) => onSubmit(evt, emitter)}>
          <option value="">{translate('Filters.relevance')}</option>
          <option value="dateCreated:ASC">{translate('Filters.dateCreated')}</option>
        </select>
      </div>

      <div className="clearFilter">
        <Link to="/resource/">{translate('Filters.clearFilters')}</Link>
      </div>

    </form>

  </nav>
)

Filters.propTypes = {
  query: PropTypes.string.isRequired,
  filters: PropTypes.objectOf(PropTypes.any).isRequired,
  aggregations: PropTypes.objectOf(PropTypes.any).isRequired,
  emitter: PropTypes.objectOf(PropTypes.any).isRequired,
  extended: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired
}

export default withEmitter(translate(Filters))
