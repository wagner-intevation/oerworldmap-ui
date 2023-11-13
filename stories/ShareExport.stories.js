import React from 'react'

import ShareExport from '../src/components/ShareExport'
import WithStrings from './WithStrings'

export default {
  title: "ShareExport",
  component: ShareExport
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <ShareExport />
    </WithStrings>
}
