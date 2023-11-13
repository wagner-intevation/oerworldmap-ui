import React from 'react'

import Share from '../src/components/Share'
import WithStrings from './WithStrings'

export default {
  title: "Share",
  component: Share
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <Share
        _self="httpss://example.com"
      />
    </WithStrings>
}
