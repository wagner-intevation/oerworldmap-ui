import React from 'react'

import ConceptBlock from '../src/components/ConceptBlock'
import WithStrings from './WithStrings'

export default {
  title: "ConceptBlock",
  component: ConceptBlock
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <ConceptBlock
        type="Service"
        conceptScheme={require('../src/json/services.json').hasTopConcept}
        linkTemplate="/resource/?filter.about.additionalType.@id={@id}"
      />
    </WithStrings>
}
