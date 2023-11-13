import React from 'react'

import Export from '../src/components/Export'
import WithStrings from './WithStrings'

export default {
  title: "Export",
  component: Export
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <Export
        _self="httpss://example.com"
        _links={{refs:[
          {type: "Json", uri: "httpss://example.com/json"},
          {type: "CSV", uri: "httpss://example.com/csv"}
        ]}}
      />
    </WithStrings>
}
