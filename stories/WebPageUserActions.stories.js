import React from 'react'

import WebPageUserActions from '../src/components/WebPageUserActions'
import WithStrings from './WithStrings'

import about from '../test/resources/WebPage.json'
import user from '../test/resources/user.json'
import mock from '../test/helpers/mock'

export default {
  title: "WebPageUserActions",
  component: WebPageUserActions
}

export const Default = {
  render: () =>
    <WithStrings lang="en">
      <WebPageUserActions
        about={about}
        user={user}
        view="edit"
        schema={mock.schema}
      />
    </WithStrings>
}
