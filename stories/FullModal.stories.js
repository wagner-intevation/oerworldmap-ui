import React from 'react'

import FullModal from '../src/components/FullModal'
import WithStrings from './WithStrings'

export default {
  title: "FullModal",
  component: FullModal
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <FullModal>
        Test
      </FullModal>
    </WithStrings>
}
