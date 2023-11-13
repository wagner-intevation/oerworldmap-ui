import React from 'react'

import ResourceImage from '../src/components/ResourceImage'
import WithStrings from './WithStrings'

import about from '../test/resources/WebPage.json'

const aboutWithImage = JSON.parse(JSON.stringify(about))
const aboutWithTwitter = JSON.parse(JSON.stringify(about))

aboutWithImage.image = "http://open-educational-resources.de/wp-content/uploads/Jan-Neumann-Foto-unter-CC-BY-4.0.jpg"
aboutWithTwitter.sameAs = [
  "https://oersys.org/",
  "https://twitter.com/trugwaldsaenger",
  "https://www.linkedin.com/in/jan-neumann-18a30495?trk=hp-identity-name"
]

export default {
  title: "ResourceImage",
  component: ResourceImage
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <ResourceImage
        about={about}
      />
    </WithStrings>
}

export const WithImage = {
  render: () =>
    <WithStrings lang="en">
      <ResourceImage
        about={aboutWithImage}
      />
    </WithStrings>
}

export const WithTwitterButNotImage = {
  render: () =>
    <WithStrings lang="en">
      <ResourceImage
        about={aboutWithTwitter}
      />
    </WithStrings>
}
