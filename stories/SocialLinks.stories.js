import React from 'react'

import SocialLinks from '../src/components/SocialLinks'
import WithStrings from './WithStrings'

const links = [
  'external-link-square',
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
  'plus',
  'youtube',
  'github',
  'xing',
  'linkedin',
  'reddit-alien',
  'slack',
  'soundcloud',
  'stack-overflow',
  'vimeo',
  'wikipedia',
  'wordpress-simple',
  'slideshare',
  'pinterest'
]

export default {
  title: "SocialLinks",
  component: SocialLinks
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <SocialLinks links={links} />
    </WithStrings>
}
