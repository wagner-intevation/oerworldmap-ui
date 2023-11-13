import React from 'react'

import Link from '../src/components/Link'
import mock from '../test/helpers/mock'
import EmittProvider from '../src/components/EmittProvider'

export default {
  title: "Link",
  component: Link
}

export const Default = {
  render: () =>
    <EmittProvider emitter={mock.emitter}>
      <Link href="http://test.de">
        Test Link
      </Link>
    </EmittProvider>
}
