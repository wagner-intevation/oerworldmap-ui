import React from 'react'

import Log from '../src/components/Log'

export default {
  title: "Log",
  component: Log
}

export const Default = {
  render: () =>
    <Log
      entries={{test: "test"}}
    />
}
