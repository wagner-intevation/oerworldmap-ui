import React from 'react'

import Feedback from '../src/components/Feedback'
import WithStrings from './WithStrings'

export default {
  title: "Feedback",
  component: Feedback
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <Feedback>
        Testing
      </Feedback>
    </WithStrings>
}
