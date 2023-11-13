import React from 'react'

import Block from '../src/components/Block'
import WithStrings from './WithStrings'

export default {
  title: "Block",
  component: Block
}

export const Default = {
  render: () =>
  <WithStrings lang="en">
    <Block title="Title">
      Test
    </Block>
  </WithStrings>
}

export const Collapsible = {
  render: () =>
    <WithStrings lang="en">
      <Block title="Title" collapsible>
        Test
      </Block>
    </WithStrings>
}
