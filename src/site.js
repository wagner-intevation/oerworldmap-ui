/* global document */
/* global window */
/* global ENVIRONMENT */
/* global LANG */
/* global $ */
/* global i18ns */
/* global DOMParser */

import React from 'react'
import { createRoot } from 'react-dom/client';
import fetch from 'isomorphic-fetch'
import mitt from 'mitt'
import 'normalize.css'
import { gsap } from 'gsap/all'

import { updateUser } from './common'
import Header from './components/Header'
import Link from './components/Link'
import I18nProvider from './components/I18nProvider'
import EmittProvider from './components/EmittProvider'
import UserProvider from './components/UserProvider'
import i18n from './i18n'
import ItemList from './components/ItemList'
import Overview from './components/Overview'

import './styles/main.pcss'
import './styles/static.pcss'
import './styles/components/Header.pcss'

const locales = [LANG]
const emitter = mitt()

const baseURL = ENVIRONMENT === 'development'
  ? 'https://oerworldmap.org/'
  : '/'

const navigate = (url) => {
  const parser = document.createElement('a')
  parser.href = url
  window.open(url, '_self')
}

emitter.on('navigate', navigate)

window.addEventListener('beforeunload', () => {
  emitter.off('navigate', navigate)
})

const hideUserLoginButtons = (() => {
  function init() {
    const target = document.querySelector('#user-login-buttons')
    target && window.__APP_USER__ && target.remove()
  }

  return { init }
})()

const injectHeader = (() => {
  function init() {
    Link.self = window.location.href
    const target = document.querySelector('[data-inject-header]')

    if (target) {
      const root = createRoot(target);
      root.render(
        <I18nProvider i18n={
          i18n(
            locales,
            i18ns[locales[0]],
          )}
        >
          <EmittProvider emitter={emitter}>
            <UserProvider>
              <Header />
            </UserProvider>
          </EmittProvider>
        </I18nProvider>,
      )
    }
  }

  return { init }
})()


const animateScrollToFragment = (() => {
  const initOne = (one) => {
    one.addEventListener('click', (event) => {
      event.preventDefault()
      const id = one.hash.substr(1)
      const element = document.getElementById(id)
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      // See https://stackoverflow.com/a/1489802
      element.id = ''
      window.location.hash = one.hash
      element.id = id
    })
  }

  const init = () => document.querySelectorAll('[data-animate-scroll-to-fragment]').forEach(el => initOne(el))

  return { init }
})()


const injectStats = (() => {
  function init() {
    if (target) {
      const root = createRoot(document.createElement('div'));
      fetch(`${baseURL}resource.json?size=0`)
        .then(response => response.json())
        .then((json) => {
          root.render(
            <Overview buckets={json.aggregations['sterms#about.@type'].buckets} />
          )
        })
    }
  }

  return { init }
})()


const toggleShow = (() => {
  const initOne = (one) => {
    const target = document.querySelector(one.dataset.toggleShow)
    one.addEventListener('click', () => target && target.classList.toggle('show'))
  }

  const init = () => document.querySelectorAll('[data-toggle-show]').forEach(el => initOne(el))

  return { init }
})()

const createAccordeon = (() => {
  const init = () => {
    if (window.location.pathname.includes('FAQ')) {
      const titles = document.querySelectorAll('h2')
      titles.forEach((title) => {
        const accordion = document.createElement('div')
        accordion.classList.add('accordion')

        const accordionContainer = document.createElement('div')
        accordionContainer.classList.add('accordionContainer')

        let currentChild = title.nextElementSibling

        while (currentChild && currentChild.nodeName !== 'H2' && currentChild.nodeName !== 'SECTION') {
          const next = currentChild.nextElementSibling
          accordionContainer.appendChild(currentChild)
          currentChild = next
        }

        title.addEventListener('click', (e) => {
          document.querySelectorAll('.active').forEach(active => active.classList.remove('active'))
          e.target.parentElement.classList.toggle('active')
        })

        title.parentNode.insertBefore(accordion, title)

        accordion.appendChild(title)
        accordion.appendChild(accordionContainer)
      })
    }
  }

  return { init }
})()

const createPoliciesFeed = (() => {
  const init = async () => {
    if (window.location.pathname.includes('oerpolicies')) {
      // Request data for policies
      // ADD carry a tag called policy
      const rawResponse = await fetch(`${baseURL}resource.json?q=about.@type:Policy&sort=dateCreated:DESC`, {
        headers: {
          accept: 'application/json',
        },
      })

      const content = await rawResponse.json()

      if (content) {
        const feedContainer = document.querySelector('[data-inject-feed]')
        const root = createRoot(feedContainer);
        root.render(
          <I18nProvider i18n={
            i18n(
              locales,
              i18ns[locales[0]],
            )}
          >
            <EmittProvider emitter={emitter}>
              <ItemList listItems={content.member.map(member => member.about)} />
            </EmittProvider>
          </I18nProvider>
        )
      }
    }
  }

  return { init }
})()

const createPolicyRelated = (() => {
  const init = async () => {
    if (window.location.pathname.includes('oerpolicies')) {
      const rawResponse = await fetch(`${baseURL}resource.json?q=NOT%20about.@type:Policy%20AND%20about.keywords:policy&sort=dateCreated:DESC`, {
        headers: {
          accept: 'application/json',
        },
      })

      const content = await rawResponse.json()

      if (content) {
        const feedContainer = document.querySelector('[data-inject-policy-related]')
        const root = createRoot(feedContainer);
        root.render(
          <I18nProvider i18n={
            i18n(
              locales,
              i18ns[locales[0]],
            )}
          >
            <EmittProvider emitter={emitter}>
              <ItemList listItems={content.member.map(member => member.about)} />
            </EmittProvider>
          </I18nProvider>
        )
      }
    }
  }

  return { init }
})()

const animateMap = (() => {
  const init = async () => {
    const isLanding = document.querySelector('.landing')

    if (isLanding) {
      const circles = [...document.querySelectorAll('circle')]
      setInterval(() => {
        const circle = circles[Math.floor(Math.random() * circles.length)]
        gsap.fromTo(circle, {
          opacity: 1,
          duration: 7,
        }, {
          opacity: 0,
          duration: 7,
        })
      }, 1000)
    }
  }

  return { init }
})()


$(async () => {
  await updateUser()
  animateScrollToFragment.init()
  injectHeader.init()
  injectStats.init()
  toggleShow.init()
  createAccordeon.init()
  createPoliciesFeed.init()
  createPolicyRelated.init()
  hideUserLoginButtons.init()
  animateMap.init()

  $('[data-slick]').slick()
})
