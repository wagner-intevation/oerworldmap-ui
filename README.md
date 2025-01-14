# oerworldmap-ui
The user interface for https://gitlab.com/oer-world-map/oerworldmap/

It consists of two parts:

- the static pages, served by jekyll
- the the UI for the worldmap application, using node

## Prerequisites

- git
- Node >= 20.5.1, tested with 20.10.0 on Debian Bullseye
- jekyll 4.2.0

## Installation

Clone this repository:
```
$ git clone https://gitlab.com/oer-world-map/oerworldmap-ui.git
$ cd oerworldmap-ui
```

Install node packages:
```
$ npm install
```

Set up environment:
```
$ cp .env.example .env
```
Open .env in the editor of your choice and configure as follows:
```
# node binds on this
SERVER_HOST=localhost
SERVER_PORT=3000
# Reachable by the browser, used as publicPath for assets
PUBLIC_HOST=worldmap.example
PUBLIC_PORT=
PUBLIC_SCHEME=https
# for the minimap
MAPBOX_ACCESS_TOKEN=your.mapbox.access.token
MAPBOX_STYLE=username/style_id
API_HOST=worldmap.example
API_PORT=443
API_SCHEME=https
PIWIK_ID=your.piwik.id
PIWIK_URL=your.piwik.url
# as reachable by the browser
ELASTICSEARCH_INDEX=
ELASTICSEARCH_URL=
```

Check if all is well and run:
```bash
npm test
npm run build:dev
npm run server:dev
```

## Static pages


```
jekyll serve --watch --incremental
```

## Apache configuration

Enable modules
```
sudo a2enmod rewrite #mod_rewrite
sudo a2enmod proxy #mod_proxy
sudo a2enmod proxy_http #mod_proxy_http
```

Details on the Apache configuration can be found in [OER World Maps' repository](https://gitlab.com/oer-world-map/oerworldmap/).

Add the local hostname to `/etc/hosts` for easier access in local development environments:

```
127.0.0.1 oerworldmap.local
```

Visit http://oerworldmap.local/resource/


## Tests

To run all tests

```bash
npm test
```

To run a single test the description tag of the test must be passed to the npm script

```bash
npm run singleTest -- "<ActionButtons />"
```

## Statistics

Statistics are based on Elasticsearch [term aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/search-aggregations-bucket-terms-aggregation.html). Such an aggregation defines `buckets` which contain the values found in a certain field along with the amount of documents for which the specified field has that value. The field is the only required parameter when using the `/stats` endpoint:

```bash
curl https://oerworldmap.local/stats?field=about.location.address.addressCountry
```

The above will deliver an SVG pie chart with the slices referring to the country of the location of entries on the OER World Map, the size of the slices depending on the amount of entries for the respective country. By default, the ten largest slices are shown. You can override this by setting the `size` parameter:

```bash
curl https://oerworldmap.local/stats?field=about.location.address.addressCountry&size=200
```

It is possible to limit the entries that are aggregated by providing filter parameters such as those that you will see in the URL when using the filter section in the OER World Map UI. For example, you could aggregate only services by country as follows:

```bash
curl https://oerworldmap.local/stats?field=about.location.address.addressCountry&filter.about.@type=%22Service%22
```

If needed, you can use [Query String Queries](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/query-dsl-query-string-query.html) in the `q` parameter along with or instead of explicit filter parameters. To aggregate all types except services for countries, you could exclude services by using `NOT`:

```bash
curl https://oerworldmap.local/stats?field=about.location.address.addressCountry&q=NOT%20about.@type:Service
```

Finally, you can provide a `subField` parameter to generate stacked bar charts. The following chart shows a bar for each country, the size depending on the total number of entries for each country. Each bar is divided into sections according to the amount of entries for each data type:

```bash
curl https://oerworldmap.local/stats?field=about.location.address.addressCountry&subField=about.@type
```

Of course you can also use `filter` and/or `q` parameters with stacked bar charts.
