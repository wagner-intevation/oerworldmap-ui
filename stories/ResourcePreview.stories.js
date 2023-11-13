import React from 'react'

import ResourcePreview from '../src/components/ResourcePreview'
import WithStrings from './WithStrings'

import about from '../test/resources/WebPage.json'

export default {
  title: "ResourcePreview",
  component: ResourcePreview
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <ResourcePreview
        about={about}
      />
    </WithStrings>
}
