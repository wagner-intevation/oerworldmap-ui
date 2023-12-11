/* global document */
/* global window */
/* global navigator */
/* global requestAnimationFrame */
/* global cancelAnimationFrame */

import React from 'react'
import PropTypes from 'prop-types'
import { createRoot } from 'react-dom/client';

import { scaleLog, quantile, interpolateHcl, color as d3color, formatHex } from 'd3'

import 'leaflet/dist/leaflet.css'
import * as countriesGeojsonFile from '../geojson/countries.geojson'
import * as regionsGeojsonFile from '../geojson/regions.geojson'

import centroids from '../json/centroids.json'

import Icon from './Icon'
import Link from './Link'
import withI18n from './withI18n'
import withEmitter from './withEmitter'
import withConfig from './withConfig'
import EmittProvider from './EmittProvider'
import bounds from '../json/bounds.json'
import ResourcePreview from './ResourcePreview'
import I18nProvider from './I18nProvider'
import i18n from '../i18n'
import MapLeyend from './MapLeyend'

import '../styles/components/ReactiveMap.pcss'

const timeout = async ms => new Promise(resolve => setTimeout(resolve, ms))

let resizeTimer
const pointsLayers = ['points', 'points-hover', 'points-select']

const calculateTypes = (features) => {
  const types = []
  features.forEach((feature) => {
    if (types[feature.properties['@type']]) {
      types[feature.properties['@type']] += 1
    } else {
      types[feature.properties['@type']] = 1
    }
  })
  return Object.keys(types).map(key => (
    <span className="item" key={key}>
      <Icon type={key} />
      &nbsp;
      {types[key]}
    </span>
  ))
}

const renderTypes = types => (
  types.map(type => (
    <div key={type.key}>
      <Icon type={type.key} />
      <span>{type.doc_count}</span>
    </div>
  ))
)


class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      aggregations: {},
    }


    this.updatePoints = this.updatePoints.bind(this)
    this.updateLiveEventsPoints = this.updateLiveEventsPoints.bind(this)
    this.updateActiveCountry = this.updateActiveCountry.bind(this)
    this.mouseMovePoints = this.mouseMovePoints.bind(this)
    this.mouseMove = this.mouseMove.bind(this)
    // this.moveEnd = this.moveEnd.bind(this)
    this.clickPoints = this.clickPoints.bind(this)
    this.clickCountries = this.clickCountries.bind(this)
    this.clickRegions = this.clickRegions.bind(this)
    this.choroplethStopsFromBuckets = this.choroplethStopsFromBuckets.bind(this)
    this.zoom = this.zoom.bind(this)
    this.setPinSize = this.setPinSize.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.animateMarker = this.animateMarker.bind(this)
    this.setMapData = this.setMapData.bind(this)
    this.setLiveEventsData = this.setLiveEventsData.bind(this)
    this.resize = this.resize.bind(this)
    this.selectCountry = this.selectCountry.bind(this)
    this.isReady = false
    this.data = {}

    props.emitter.on('resize', this.resize)
  }

  componentDidMount() {
    const {
      config: map, locales, iso3166, emitter, region,
    } = this.props

    emitter.on('mapData', this.setMapData)
    emitter.on('liveEventsData', this.setLiveEventsData)

    this.L = require('leaflet')

    this.map = this.L.map('Map').setView([51.505, -0.09], 2);
    this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 2
    }).addTo(this.map);
    this.map.setMaxBounds([
      [-90,-180],
      [90,180]
    ])

    this.map.on('click', (event) => {
      this.handleClick(event)
    })

    this.hoveredPointLayers = new Set()

    this.map.on('mousemove', this.mouseMove)

    this.tooltip = this.L.tooltip({
      opacity: 1,
      permanent: true,
    })

    this.map.on('mouseout', () => {
      this.tooltip.close()
    })

    this.addCountries()

    this.regionLayerGroup = L.layerGroup().addTo(this.map)

    this.initialRadius = window.innerWidth <= 700 ? 10 : 5
    this.radius = this.initialRadius
    this.framesPerSecond = 15
    this.initialOpacity = 0.9
    this.opacity = this.initialOpacity
    this.maxRadius = this.initialRadius * 20
    this.animatingMarkers = null
    this.start = null

    this.map.on('zoom', this.zoom)

    // Initialize choropleth layers
    this.updateActiveCountry(iso3166, region)

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(this.setPinSize, 250)
    })

    // Update URL values
    // this.map.on('moveend', this.moveEnd)

    this.map.on('click', this.handleClick)

    this.isReady = true
  }

  componentDidUpdate(nextProps) {
    this.map.invalidateSize(false)
    const {
      iso3166, map, region, home,
    } = this.props

    if ((iso3166 !== nextProps.iso3166) || (region !== nextProps.region)) {
      this.updateActiveCountry(iso3166, region)
    }
  }

  componentWillUnmount() {
    const { emitter } = this.props
    this.map.off('zoom', this.zoom)
    this.map.off('mousemove', this.mouseMove)
    // this.map.off('moveend', this.moveEnd)
    this.map.off('click', this.handleClick)
    emitter.off('mapData', this.setMapData)
    emitter.off('liveEventsData', this.setLiveEventsData)
    emitter.off('resize', this.resize)
  }

  async setMapData(data) {
    if (this.isReady) {
      this.updateChoropleth(data.aggregations)
      this.updatePoints(data.features)
      this.setState(data)
    } else {
      await timeout(10)
      this.setMapData(data)
    }
  }

  async setLiveEventsData(data) {
    if (this.isReady) {
      this.updateLiveEventsPoints(data.features)
    } else {
      await timeout(10)
      this.setLiveEventsData(data)
    }
  }

  addRegions(countryCode) {
    this.regionsGeojson = this.L.geoJSON(regionsGeojsonFile, {
      style: {
        'color': '#222222',
        'opacity': 0.7,
        'weight': 1,
        'fillColor': '#349900',
        'fillOpacity': 0
      },
      filter: (feature) => {
        if (!countryCode) return false
        const country = feature.properties.iso_3166_2.split('-')[0]
        return country === countryCode
      }
    })
    this.removeRegions()
    this.regionsGeojson.addTo(this.regionLayerGroup)
    this.regionsGeojson.on('click', (event) => {
      this.L.DomEvent.stop(event)
      this.selectRegion(event)
    })

    this.regionsGeojson.on('mousemove', (event) => {
      const [ country, region ] = event.sourceTarget.feature.properties['iso_3166_2'].split('-')
      if (country && country !== -99) {
        this.hoveredCountry = country
      } else {
        this.hoveredCountry = undefined
      }
      this.hoveredRegion = region
    })

    this.regionsGeojson.on('mouseout', () => {
      this.hoveredCountry = undefined
      this.hoveredRegion = undefined
    })
  }

  removeRegions() {
    this.regionLayerGroup.clearLayers()
  }

  addCountries() {
    const { iso3166 } = this.props
    this.countriesGeojson = this.L.geoJSON(countriesGeojsonFile, {
      style: {
        "color": "#222222",
        "weight": 1,
        "fillColor": "#349900",
        "fillOpacity": 0
      }
    })

    this.countriesGeojson.addTo(this.map)
    this.countriesGeojson.on('click', (event) => {
      this.selectCountry(event)
      this.L.DomEvent.stop(event)
    })

    this.countriesGeojson.on('mousemove', (event) => {
      const country = event.sourceTarget.feature.properties['ISO_A2']
      if (country && country !== -99) {
        this.hoveredCountry = country
      } else {
        this.hoveredCountry = undefined
      }
      this.hoveredRegion = undefined
    })

    this.countriesGeojson.on('mouseout', () => {
      this.hoveredCountry = undefined
    })
  }

  selectRegion(event) {
    const { emitter } = this.props
    const [ country, region ] = event.propagatedFrom.feature.properties['iso_3166_2'].split('-')
    if (country && region) {
      emitter.emit('navigate', `/country/${country}/${region}${window.location.search}`)
      this.regionsGeojson.setStyle((feature) => {
        const featureRegion = feature.properties['iso_3166_2'].split('-')[1]
        if (featureRegion === region) {
          return { 'weight': 2 }
        } else {
          return { 'weight': 1 }
        }
      })
    }
  }

  selectCountry(event) {
    const countryCode = event.propagatedFrom.feature.properties['ISO_A2']
    this.countriesGeojson.setStyle((feature) => {
      if (feature.properties['ISO_A2'] !== -99 && feature.properties['ISO_A2'] === countryCode) {
        return { 'fillOpacity': 0.8 }
      } else {
        return { 'fillOpacity': 0 }
      }
    })
    if (countryCode) {
      const { emitter } = this.props
      this.addRegions(countryCode)
      emitter.emit('navigate', `/country/${countryCode.toLowerCase()}${window.location.search}`)
    }
    const boundsToUse = countryCode in bounds ?
      bounds[countryCode] :
      event.layer._bounds
    this.map.flyTo(this.L.latLng(boundsToUse[1], boundsToUse[0]), boundsToUse[2])
  }

  getBucket(location, aggregation) {
    const { aggregations } = this.state

    return (aggregations && aggregations[aggregation]
      && aggregations[aggregation].buckets.find(agg => agg.key === location))
      || null
  }

  setPinSize() {
    this.initialRadius = window.innerWidth <= 700 ? 10 : 5
    this.maxRadius = this.initialRadius * 20
  }

  resize() {
    const { iso3166, map, home } = this.props
    if (!this.map) {
      window.setTimeout(() => {
        this.resize()
      }, 500)
    }
  }

  animateMarker(timestamp) {
    if (!this.start) this.start = timestamp
    const progress = timestamp - this.start

    if (progress > 1000 / this.framesPerSecond) {
      this.radius += (this.maxRadius - this.radius) / (1000 / this.framesPerSecond)
      this.opacity -= (0.9 / this.framesPerSecond)

      if (this.opacity <= 0.1) {
        this.radius = this.initialRadius
        this.opacity = this.initialOpacity
      }
      this.start = null
    }

    this.animatingMarkers = requestAnimationFrame(this.animateMarker)
  }

  zoom(e) {
    const { iso3166 } = this.props

    const zoom = e.target.getZoom()
  }

  mouseMovePoints(e) {
    const ids = e.features.map(feat => feat.properties['@id'])
    this.map.setFilter('points-hover', ['in', '@id'].concat(ids))
    if (ids.length) {
      this.map.getCanvas().style.cursor = 'pointer'
    }
  }

  /**
   * Calculates the distance in pixels between a container point and a geographical point.
   * @param {*} geo geo object inside a feature object
   * @param {*} containerPoint (see for example https://leafletjs.com/reference.html#mouseevent-containerpoint)
   * @returns The distance in pixels
   */
  calculateDistance(geo, containerPoint) {
    const latlng = this.L.latLng(geo.lat, geo.lon)
    const secondContainerPoint = this.map.latLngToContainerPoint(latlng)
    return Math.sqrt(
      Math.pow((containerPoint.x - secondContainerPoint.x), 2)
      + Math.pow((containerPoint.y - secondContainerPoint.y), 2)
    )
  }

  getGeoObjects(location) {
    const geoObjects = []
    if (!location.length && location.geo) {
      geoObjects.push(location.geo)
    } else if (location.length) {
      location.forEach((element) => {
        geoObjects.push(...this.getGeoObjects(element))
      })
    }
    return geoObjects
  }

  getPointsAtMouseEvent(event) {
    this.pointsGeojson.eachLayer((layer) => {
      const distances = []
      const geoObjects = this.getGeoObjects(layer.feature.properties.location)
      geoObjects.forEach((geo) => {
        distances.push(this.calculateDistance(geo, event.containerPoint))
      })

      if (distances.length === 0) return []

      if (Math.min(distances) <= 10) {
        this.hoveredPointLayers.add(layer)
      } else if (this.hoveredPointLayers.has(layer)) {
        this.hoveredPointLayers.delete(layer)
      }
    })
    const points = []
    this.hoveredPointLayers.forEach(layer => {
      points.push(layer.feature)
    });
    return points
  }

  mouseMove(event) {
    if(this.popup?.isOpen()) return
    const { overlayList } = this.state

    if (!overlayList) {
      const {
        translate, iso3166, phrases, locales, emitter, region,
      } = this.props
      const { aggregations } = this.state
      const hoveredPoints = this.getPointsAtMouseEvent(event)
      const hasc = `${this.hoveredCountry}.${this.hoveredRegion}`
      if (!this.hoveredCountry && !hoveredPoints.length) {
        // Water since there is no country
        this.tooltip.close()
      } else {
        let popupContent
        if (hoveredPoints.length > 0) {
          if (hoveredPoints.length > 6) {
            popupContent = (
              <ul>
                <li style={{ display: 'flex', justifyContent: 'space-evenly', fontSize: 'var(--font-size-xs)' }}>
                  {calculateTypes(hoveredPoints)}
                </li>
              </ul>
            )
            // More than 6 points
          } else if (hoveredPoints.length > 1 && hoveredPoints.length <= 6) {
          // More than 1 point, less than 6
            popupContent = (
              <ul className="list">
                {hoveredPoints.map(point => (
                  <li key={point.properties['@id']}>
                    <Icon type={point.properties['@type']} />
                    {translate(point.properties.name)}
                  </li>
                ))}
              </ul>
            )
          } else {
            // Single point
            popupContent = (
              <ul className="list">
                <li>
                  <I18nProvider i18n={i18n(locales, phrases)}>
                    <EmittProvider emitter={emitter}>
                      <ResourcePreview
                        about={Object.assign(hoveredPoints[0].properties, {
                          name: hoveredPoints[0].properties.name,
                          location: [hoveredPoints[0].properties.location],
                          additionalType: hoveredPoints[0].properties.additionalType,
                          alternateName: hoveredPoints[0].properties.alternateName,
                        })}
                      />
                    </EmittProvider>
                  </I18nProvider>
                </li>
              </ul>
            )
          }
        } else if (this.hoveredRegion) {
          // Hover a region
          const bucket = this.getBucket(this.hoveredRegion, 'sterms#feature.properties.location.address.addressRegion')
          popupContent = (
            <ul>
              <li>
                <b>
                  <span className="tooltipTitle">
                    {translate(hasc)}
                    &nbsp;(
                    {translate(this.hoveredCountry)}
                    )
                  </span>
                </b>
                {(region && hasc !== `${this.hoveredCountry}.${region}`) && (
                  <>
                    <br />
                    <span className="tip">
                      {translate('Map.clickRegion')}
                    </span>
                  </>
                )
                }
                {(bucket && !region) && (
                  <>
                    <br />
                    <div className="buckets">{renderTypes(bucket['sterms#by_type'].buckets)}</div>
                  </>
                )}
              </li>
              {bucket && aggregations['global#champions']['sterms#about.regionalChampionFor.keyword']
                .buckets.some(b => b.key === bucket.key) ? (
                  <li className="separator"><span>{translate('Map.countryChampionAvailable')}</span></li>
                ) : (
                  <li className="separator"><span>{translate('Map.noCountryChampionYet')}</span></li>
                )
              }
            </ul>
          )
        } else if (iso3166 && this.hoveredCountry !== iso3166) {
          // Not the country that is selected
          popupContent = (
            <ul>
              <li>
                <b>
                  <span className="tooltipTitle">
                    {translate(this.hoveredCountry)}
                  </span>
                </b>
                <br />
                <span className="tip">
                  {translate('Map.clickCountry')}
                </span>
              </li>
            </ul>
          )
        } else {
          // Hover a country
          const bucket = this.getBucket(this.hoveredCountry, 'sterms#feature.properties.location.address.addressCountry')
          popupContent = (
            <ul>
              <li>
                <b>
                  <span className="tooltipTitle">
                    {translate(this.hoveredCountry)}
                  </span>
                  <br />
                </b>
                <span className="tip">
                  {translate('Map.clickCountry')}
                </span>
                {bucket && (
                  <>
                    <br />
                    <div className="buckets">{renderTypes(bucket['sterms#by_type'].buckets)}</div>
                  </>
                )}
              </li>
              {bucket && aggregations['global#champions']['sterms#about.countryChampionFor.keyword']
                .buckets.some(b => b.key === bucket.key) ? (
                  <li className="separator"><span>{translate('Map.countryChampionAvailable')}</span></li>
                ) : (
                  <li className="separator"><span>{translate('Map.noCountryChampionYet')}</span></li>
                )
              }
            </ul>
          )
        }
        const div = document.createElement('div')
        const root = createRoot(div);
        root.render(
          <div
            className="tooltip noEvents"
            style={
              {
                zIndex: 9,
                pointerEvents: 'none',
              }}
          >
            {popupContent}
          </div>
        )
        this.tooltip.setLatLng(event.latlng)
        // The delay by setTimeout() - even with a delay of 0 - is enough so the HTML
        // is ready to be shown. Necessary to prevent an annoying flickering effect.
        setTimeout(() => {
          if (!this.tooltip.getContent() || this.tooltip.getContent().innerText?.replaceAll('\n', '') !== div.innerText) {
            this.tooltip.setContent(div)
          }
          if (!this.tooltip.isOpen()) {
            this.tooltip.openOn(this.map)
          }
        }, 0)

      }
    }
  }

  moveEnd(e) {
    const { iso3166 } = this.props

    if (!iso3166) {
      const { lng, lat } = e.target.getCenter()
      const zoom = e.target.getZoom()

      const url = new URL(window.location.href)
      url.searchParams.set('map', `${lng.toFixed(5)},${lat.toFixed(5)},${Math.floor(zoom)}`)
      window.history.replaceState(null, null, url.href)
    }
  }

  updateActiveCountry(iso3166, region) {

  }

  choroplethStopsFromBuckets(buckets) {
    const counts = buckets.map(bucket => bucket.doc_count)
    const range = [
      '#bc3754',
      '#fcffa4',
    ]

    const getColor = (count) => {
      const rgb = scaleLog()
        .range([range[range.length - 1], range[0]])
        .interpolate(interpolateHcl)
        .domain([quantile(counts, 0.01), quantile(counts, 0.99)])
      return d3color(rgb(count)).formatHex()
    }

    return buckets.length
      ? buckets.map(bucket => [bucket.key, getColor(bucket.doc_count)])
      : [['', '#fff']]
  }

  updateChoropleth(aggregations) {
    const { emitter } = this.props
    if (aggregations) {
      const aggregation = aggregations['sterms#feature.properties.location.address.addressRegion']
        || aggregations['sterms#feature.properties.location.address.addressCountry']
      const stops = this.choroplethStopsFromBuckets(aggregation.buckets)
      const colors = stops
      .map(stop => stop[1])
      .filter((value, index, self) => self.indexOf(value) === index)
      .concat('#fff')
      .reverse()
      const layer = aggregations['sterms#feature.properties.location.address.addressRegion']
        ? 'Regions' : 'countries'

      const colorsObject = {}
      stops.forEach((stop) => {
        colorsObject[stop[0]] = stop[1]
      })

      if (layer === 'countries') {
        this.countriesGeojson.setStyle((feature) => {
          if (feature.properties['ISO_A2'] !== -99 && colorsObject[feature.properties['ISO_A2']]) {
            return {
              "fillColor": colorsObject[feature.properties['ISO_A2']],
              "fillOpacity": 1
            }
          } else {
            return {
              "fillColor": '#FFFFFF',
              "fillOpacity": 1
            }
          }
        })
      } else {
        this.regionsGeojson.setStyle((feature) => {
          if (feature.properties['iso_3166_2'].split('-')[1] !== -99
            && colorsObject[feature.properties['iso_3166_2'].replace('-', '.')])
          {
            return {
              "fillColor": colorsObject[feature.properties['iso_3166_2'].replace('-', '.')],
              "fillOpacity": 1
            }
          } else {
            return {
              "fillColor": '#FFFFFF',
              "fillOpacity": 1
            }
          }
        })
      }

      const max = (aggregation.buckets.length && aggregation.buckets[0].doc_count) || 0
      emitter.emit('updateColors', { colors, max })
    }
  }

  clickPoints(e) {
    const features = this.getPointsAtMouseEvent(e)
    const { translate, emitter } = this.props
    if (features.length > 6 && this.map.getZoom() !== this.map.getMaxZoom()) {
      this.map.flyTo(e.latlng, this.map.getZoom() + 5)
    } else if (features.length > 1) {
      const list = features.map(feature => (
        <li key={feature.properties['@id']}>
          <Link href={feature.properties['@id']}>
            <Icon type={feature.properties['@type']} />
            {translate(feature.properties.name)}
          </Link>
        </li>
      ))

      // Show overlay
      const popupDOM = document.createElement('div')
      const root = createRoot(popupDOM);
      root.render(
        <EmittProvider emitter={emitter}>
          <div
            className="tooltip"
            style={
              {
                zIndex: 9,
                pointerEvents: 'all',
              }}
          >
            <ul className="list">{list}</ul>
          </div>
        </EmittProvider>
      )

      if (this.popup) {
        if (this.popup.isOpen()) {
          this.popup.close()
        }
      } else {
        this.popup = new this.L.popup({
          opacity: 1,
          permanent: true,
        })
      }

      this.popup.on('remove', () => {
        this.setState({ overlayList: false })
      })

      this.popup.setContent(popupDOM)
      this.popup.setLatLng(e.latlng)
      this.popup.openOn(this.map)

      this.tooltip.close()

      this.setState({
        overlayList: true,
      })
    } else {
      // Click on a single resource
      const url = `/resource/${features[0].properties['@id']}`
      emitter.emit('navigate', url)
    }
  }

  clickCountries(e, features) {
    if (this.tooltip && this.tooltip.isOpen()) return

    const { emitter } = this.props

    this.removeRegions()

    if (features[0].properties.iso_3166_1 !== '-99') {
      emitter.emit('navigate', `/country/${features[0].properties.iso_3166_1.toLowerCase()}${window.location.search}`)
    }
  }

  clickRegions(e, features) {
    if (this.tooltip && this.tooltip.isOpen()) return

    const { emitter } = this.props
    const [country, region] = features[0].properties['HASC_1'].toLowerCase().split('.')
    if (features[0].properties.iso_3166_1 !== '-99') {
      emitter.emit('navigate', `/country/${country}/${region}${window.location.search}`)
    }
  }

  updatePoints(features) {
    if (
      !features
      || (features.length !== undefined && features.length === 0 && this.pointsGeojson)
    ) {
      this.pointsGeojson.remove()
      this.tooltip.close()
      this.tooltip.setContent('')
      this.popup.close()
      return
    }
    const pointsCollection = {
      type: 'FeatureCollection',
      features,
    }
    this.tooltip && this.tooltip.close()
    const self = this
    var geojsonMarkerOptions = {
      radius: this.initialRadius,
      fillColor: "#fff",
      color: "#ff9933",
      weight: 1,
      opacity: 1,
      fillOpacity: this.initialOpacity
    }

    this.pointsGeojson = this.L.geoJSON(pointsCollection, {
      pointToLayer: function (feature, latlng) {
        const marker = self.L.circleMarker(latlng, geojsonMarkerOptions)
        return marker
      }})
    this.pointsGeojson.addTo(this.map)

    this.pointsGeojson.on('click', (event) => {
      this.clickPoints(event)
    })

    this.pointsGeojson.on('mousemove', (event) => {
      this.mouseMove(event)
    })

  }

  updateLiveEventsPoints(features) {
    cancelAnimationFrame(this.animatingMarkers)
    const eventsCollection = {
      type: 'FeatureCollection',
      features,
    }
    this.animatingMarkers = requestAnimationFrame(this.animateMarker)
  }

  handleClick(e) {
    this.removeRegions()
    const { emitter } = this.props
    emitter.emit('navigate', '/resource/?view=map&size=20&sort=dateCreated')
  }

  render() {
    const {
      iso3166, emitter, translate,
    } = this.props
    const { overlayList } = this.state

    return (
      <div
        ref={(map) => { this.Map = map }}
        id="Map"
        style={
          {
            position: 'relative',
            width: '100%',
            height: '75vh',
          }
        }
        onKeyDown={(e) => {
          if (e.keyCode === 27 && iso3166) {
            emitter.emit('navigate', '/resource/')
          }
        }}
        role="presentation"
      >
        {overlayList && <div className="overlayList" />}

        <MapLeyend
          iso3166={iso3166}
        />

        <a className="imprintLink" href="/imprint">{translate('main.imprintPrivacy')}</a>

      </div>
    )
  }
}

Map.propTypes = {
  config: PropTypes.objectOf(PropTypes.any).isRequired,
  emitter: PropTypes.objectOf(PropTypes.any).isRequired,
  locales: PropTypes.arrayOf(PropTypes.any).isRequired,
  iso3166: PropTypes.string,
  translate: PropTypes.func.isRequired,
  map: PropTypes.string,
  home: PropTypes.bool.isRequired,
  phrases: PropTypes.objectOf(PropTypes.any).isRequired,
  region: PropTypes.string,
}

Map.defaultProps = {
  iso3166: null,
  map: null,
  region: null,
}

export default withConfig(withEmitter(withI18n(Map)))
