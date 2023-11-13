import React from 'react'

import Icon from '../src/components/Icon'

const icons = [
  'Service',
  'Person',
  'Organization',
  'Article',
  'Action',
  'Concept',
  'ConceptScheme',
  'Event',
  'WebPage',
  'Product',
  'Policy'
]

export default {
  title: "Icon",
  component: Icon
}

export const Default = {
  render: () =>
    <Icon type={icons[Math.floor(Math.random() * icons.length)]} />
}

export const AllVariants = {
  render: () =>
    icons.map(icon => (
      <span>
        <Icon type={icon} />
        &nbsp;
        {icon}
        <br />
      </span>
    ))
}

