import React from 'react'
import PropTypes from 'prop-types'

import translate from './translate'
import Metadata from './Metadata'
import { formatURL } from '../common'
import Link from './Link'

import '../styles/WebPage.pcss'

const WebPage = ({
  translate,
  moment,
  about,
  contributor,
  dateModified,
  author,
  dateCreated
}) => (
  <div className="WebPage">
    <div className="webPageContainer">
      <div className="webPageHeader">
        <b>
          <Metadata
            type={about['@type']}
            author={author}
            contributor={contributor}
            dateModified={dateModified}
            dateCreated={dateCreated}
          />
        </b>

        <div className="webPageActions">
          <Link to="/resource/"><i className="fa fa-pencil" /></Link>
          <Link to="/resource/"><i className="fa fa-gear" /></Link>
          <Link to="/resource/"><i className="fa fa-close" /></Link>
        </div>

      </div>

      {about.image &&
        <div className="webPageCover">
          <img src={about.image} alt={translate(about.name)} />
        </div>
      }

      <div className="webPageContent">
        <h1>{translate(about.name)}</h1>

        <b className="date">{moment(dateCreated).format('D.MMM YYYY')} by {author}</b>

        {about.url && 
        about.description[0]['@value'] &&
          <p>{about.description[0]['@value']}</p>
        }

        {about.url &&
          <a href={about.url} className="boxedLink">
            {formatURL(about.url)}
          </a>
        }
        
        {/* Example of data, GENERATE THIS */}
        <table>
          <tbody>
            <tr>
              <td>Location</td>
              <td>
                Whitehurst Freeway<br />
                Washington <br />
                United States
              </td>
            </tr>
            <tr>
              <td>Tags</td>
              <td>
                OER
              </td>
            </tr>
            <tr>
              <td>Creator</td>
              <td>
                Katy Jordan
              </td>
            </tr>
            <tr>
              <td>Entries mentioned</td>
              <td>
                The Saylor Academy <br />
                OER Hub
              </td>
            </tr>
          </tbody>
        </table>

        <pre>{JSON.stringify(about, null, 2)}</pre>
      </div>
    </div>
  </div>
)

WebPage.propTypes = {
  translate: PropTypes.func.isRequired,
  moment: PropTypes.func.isRequired,
  about: PropTypes.objectOf(PropTypes.any).isRequired,
  author: PropTypes.string.isRequired,
  contributor: PropTypes.string.isRequired,
  dateCreated: PropTypes.string.isRequired,
  dateModified: PropTypes.string.isRequired
}

export default translate(WebPage)
