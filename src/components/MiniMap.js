/* global window */
/* global Event */
/* global document */
/* global MutationObserver */
/* global requestAnimationFrame */
/* global cancelAnimationFrame */

import React from 'react'
import PropTypes from 'prop-types'
import bbox from '@turf/bbox'
import { point } from '@turf/helpers'
import { emptyGeometry } from '../common'

import 'mapbox-gl/dist/mapbox-gl.css'

class MiniMap extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      zoom: props.zoom,
    }

    this.mouseDown = this.mouseDown.bind(this)
    this.mouseMove = this.mouseMove.bind(this)
    this.mouseUp = this.mouseUp.bind(this)
    this.mouseEnter = this.mouseEnter.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
    this.updateMap = this.updateMap.bind(this)
    this.animateMarker = this.animateMarker.bind(this)
  }

  componentDidMount() {
    const mo = new MutationObserver((e) => {
      const mutation = e.shift()
      if (mutation
        && mutation.attributeName === 'class'
        && !mutation.target.classList.contains('hidden')) {
        window.dispatchEvent(new Event('resize'))
        mo.disconnect()
      }
    })

    document && document.getElementById('edit')
      && mo.observe(document.getElementById('edit'), { attributes: true })

    const {
      geometry, mapboxConfig, boxZoom, draggable, isLiveEvent,
    } = this.props
    const { Map, NavigationControl } = require('mapbox-gl')

    setTimeout(() => {
      this.MiniMap = new Map({
        container: this.MiniMapContainer,
        center: [0, 0],
        zoom: 1,
        boxZoom,
        style: `mapbox://styles/${mapboxConfig.miniMapStyle}`,
        dragRotate: false,
        accessToken: mapboxConfig.token,
        touchZoomRotate: false,
      })
      this.canvas = this.MiniMap.getCanvasContainer()
      this.isDragging = false

      this.MiniMap.on('load', () => {
        // Set circle layers properties
        this.initialRadius = window.innerWidth <= 700 ? 10 : 7
        this.radius = this.initialRadius
        this.framesPerSecond = 15
        this.initialOpacity = 0.9
        this.opacity = this.initialOpacity
        this.maxRadius = this.initialRadius * 20
        this.animatingMarkers
        this.start = null

        if (draggable) {
          const nav = new NavigationControl({ showCompass: false })
          this.MiniMap.addControl(nav, 'bottom-left')
        }

        this.MiniMapContainer.addEventListener('mouseleave', () => {
          this.selected = null
          this.canvas.style.cursor = ''
          this.isDragging = false
          this.MiniMap.dragPan.enable()
        })

        this.MiniMap.addSource('pointsSource', {
          type: 'geojson',
          data: geometry || emptyGeometry,
        })

        this.MiniMap.addLayer({
          id: 'points',
          type: 'circle',
          source: 'pointsSource',
          paint: {
            'circle-radius': this.initialRadius,
            'circle-color': '#f93',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white',
          },
        })

        this.MiniMap.addSource('eventsSource', {
          type: 'geojson',
          data: isLiveEvent ? geometry : emptyGeometry,
        })

        this.MiniMap.addLayer({
          id: 'EventsGlow',
          source: 'eventsSource',
          type: 'circle',
          paint: {
            'circle-radius': this.initialRadius,
            'circle-radius-transition': { duration: 0 },
            'circle-opacity-transition': { duration: 0 },
            'circle-color': '#f93',
          },
        })

        this.MiniMap.addLayer({
          id: 'Events',
          source: 'eventsSource',
          type: 'circle',
          paint: {
            'circle-radius': this.initialRadius,
            'circle-stroke-color': 'hsl(0, 0%, 100%)',
            'circle-stroke-width': 1,
            'circle-color': '#f93',
          },
        })

        this.updateMap(this.props)
      })
    }, 0)
  }

  componentWillReceiveProps(nextProps) {
    this.updateMap(nextProps)
  }

  shouldComponentUpdate() {
    return false
  }

  animateMarker(timestamp) {
    if (!this.start) this.start = timestamp
    const progress = timestamp - this.start

    if (progress > 1000 / this.framesPerSecond) {
      this.radius += (this.maxRadius - this.radius) / (1000 / this.framesPerSecond)
      this.opacity -= (0.9 / this.framesPerSecond)

      this.MiniMap.setPaintProperty('EventsGlow', 'circle-radius', this.radius)
      this.MiniMap.setPaintProperty('EventsGlow', 'circle-opacity', this.opacity)

      if (this.opacity <= 0.1) {
        this.radius = this.initialRadius
        this.opacity = this.initialOpacity
      }
      this.start = null
    }

    this.animatingMarkers = requestAnimationFrame(this.animateMarker)
  }

  mouseMove(e) {
    if (!this.isDragging) return
    const coords = e.lngLat

    this.canvas.style.cursor = 'grabbing'

    if (this.selected) {
      const data = JSON.parse(JSON.stringify(this.MiniMap.getSource('pointsSource')._data))
      if (data.type === 'Point') {
        data.coordinates = [coords.lng, coords.lat]
      }
      this.MiniMap.getSource('pointsSource').setData(data)
    }
  }

  mouseUp(e) {
    const { onFeatureDrag } = this.props

    this.selected = null
    if (!this.isDragging) {
      return
    }

    this.canvas.style.cursor = ''
    this.isDragging = false
    this.MiniMap.dragPan.enable()

    this.setState({ zoom: this.MiniMap.getZoom() })

    onFeatureDrag && onFeatureDrag({
      type: 'Point',
      coordinates: e.lngLat,
    })
  }

  mouseDown(e) {
    this.selected = this.MiniMap.queryRenderedFeatures(e.point, { layers: ['points'] }).pop()
    this.isDragging = true
    this.MiniMap.dragPan.disable()
    this.canvas.style.cursor = 'grab'
  }

  mouseEnter() {
    this.MiniMap.setPaintProperty('points', 'circle-color', '#3bb2d0')
    this.canvas.style.cursor = 'move'
    this.MiniMap.dragPan.disable()
  }

  mouseLeave() {
    this.MiniMap.setPaintProperty('points', 'circle-color', '#3887be')
    this.canvas.style.cursor = ''
    this.MiniMap.dragPan.enable()
  }

  updateMap(props) {
    const {
      geometry, draggable, zoomable, center, isLiveEvent,
    } = props
    const { zoom } = this.state

    this.MiniMap.getSource('pointsSource').setData(geometry || emptyGeometry)

    if (isLiveEvent) {
      this.MiniMap.getSource('eventsSource').setData(geometry)
      this.animatingMarkers = requestAnimationFrame(this.animateMarker)
    } else {
      this.MiniMap.getSource('eventsSource').setData(emptyGeometry)
      cancelAnimationFrame(this.animatingMarkers)
    }

    setTimeout(() => {
      if (center || geometry) {
        this.MiniMap.fitBounds((center && bbox(point(center))) || bbox(geometry), {
          padding: 20,
          maxZoom: zoom || 1,
        })
      } else {
        this.MiniMap.flyTo({
          center: [0, 0],
          zoom: zoom || 1,
        })
      }
    }, 0)

    this.MiniMap.off('mouseenter', 'points', this.mouseEnter)
    this.MiniMap.off('mouseleave', 'points', this.mouseLeave)
    this.MiniMap.off('mousedown', 'points', this.mouseDown)
    this.MiniMap.off('mousemove', this.mouseMove)
    this.MiniMap.off('mouseup', this.mouseUp)

    if (draggable) {
      this.MiniMap.on('mouseenter', 'points', this.mouseEnter)
      this.MiniMap.on('mouseleave', 'points', this.mouseLeave)
      this.MiniMap.on('mousedown', 'points', this.mouseDown)
      this.MiniMap.on('mousemove', this.mouseMove)
      this.MiniMap.on('mouseup', this.mouseUp)
    }

    if (zoomable) {
      this.MiniMap.scrollZoom.enable()
      this.MiniMap.doubleClickZoom.enable()
    } else {
      this.MiniMap.scrollZoom.disable()
      this.MiniMap.doubleClickZoom.disable()
    }
  }

  render() {
    return (
      <div
        ref={(map) => { this.MiniMapContainer = map }}
        className="MiniMap"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />
    )
  }
}

MiniMap.propTypes = {
  mapboxConfig: PropTypes.shape(
    {
      token: PropTypes.string,
      style: PropTypes.string,
      miniMapStyle: PropTypes.string,
    },
  ).isRequired,
  center: PropTypes.arrayOf(PropTypes.any), // eslint-disable-line react/no-unused-prop-types
  geometry: PropTypes.objectOf(PropTypes.any),
  draggable: PropTypes.bool,
  zoomable: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  onFeatureDrag: PropTypes.func,
  boxZoom: PropTypes.bool,
  zoom: PropTypes.number,
  isLiveEvent: PropTypes.bool,
}

MiniMap.defaultProps = {
  center: undefined,
  geometry: undefined,
  draggable: false,
  zoomable: false,
  onFeatureDrag: null,
  boxZoom: false,
  zoom: null,
  isLiveEvent: undefined,
}

export default MiniMap
