import React from 'react'

import Loading from '../src/components/Loading'
import WithStrings from './WithStrings'

import EmittProvider from '../src/components/EmittProvider'
import mock from '../test/helpers/mock'

export default {
  title: "Loading",
  component: Loading
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <EmittProvider emitter={mock.emitter}>
        <Loading />
      </EmittProvider>
    </WithStrings>
}
