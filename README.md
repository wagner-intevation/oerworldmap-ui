# Open Educational Resources (OER) World Map

![Travis CI](https://travis-ci.org/hbz/oerworldmap.svg)

For inital background information about this project please refer to the
[Request for Proposals](http://www.hewlett.org/sites/default/files/OER%20mapping%20RFP_Phase%202%20Final%20June%2023%202014.pdf).

## Setup project

### Get Source

    $ git clone git@github.com:hbz/oerworldmap.git

### Create configuration

    $ cp conf/application.example.conf conf/application.conf

### Setup Elasticsearch

#### [Download and install elasticsearch](http://www.elasticsearch.org/overview/elkdownloads/)

    $ cd third-party
    $ wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.2.1.zip
    $ unzip elasticsearch-6.2.1.zip
    $ cd elasticsearch-6.2.1
    $ bin/elasticsearch-plugin install analysis-icu
    $ bin/elasticsearch

Check with `curl -X GET http://localhost:9200/` if all is well.

Optionally, you may want to [use the head plugin](https://www.elastic.co/blog/running-site-plugins-with-elasticsearch-5-0).
This basically comes down to

    $ cd .. # back to oerworldmap/third-party or choose any directory outside this project
    $ git clone git://github.com/mobz/elasticsearch-head.git
    $ cd elasticsearch-head
    $ npm install
    $ npm run start
    $ open http://localhost:9100/

#### Configure elasticsearch

If you are in an environment where your instance of elasticsearch won't be the only one on the network, you might want
to configure your cluster name to be different from the default `elasticsearch`. To do so, shut down elasticsearch and
edit `cluster.name` in `third-party/elasticsearch-2.4.1/config/elasticsearch.yml` and `es.cluster.name`
in `conf/application.conf` before restarting.

#### Create and configure oerworldmap index (as specified in `es.index.app.name` in `conf/application.conf`)

    $ curl -H "Content-type: application/json" -X PUT http://localhost:9200/oerworldmap/ -d @conf/index-config.json

#### If you're caught with some kind of buggy index during development, simply delete the index and re-create:

    $ curl -X DELETE http://localhost:9200/oerworldmap/
    $ curl -X PUT http://localhost:9200/oerworldmap/ -d @conf/index-config.json

#### Set up Keycloak

Download Keykloak 4.8.3:

    $ curl https://downloads.jboss.org/keycloak/4.8.3.Final/keycloak-4.8.3.Final.tar.gz | tar xvz

- Add `X-Forwarded-For` and `X-Forwarded-Proto` headers to proxy vhost.conf
- Modify standalone.xml file and add the `proxy-address-forwarding="true"` attribute to `<http-listener>` element under `<server>`

Create the admin user:

    $ bin/add-user-keycloak.sh -u admin

Start the server:

    $ bin/standalone.sh -Dkeycloak.profile.feature.scripts=enabled

- Create realm oerworldmap
- Configure Valid Redirect URIs
  - /auth/realms/oerworldmap/account/*
  - /oauth2callback
  - /.login
  - /resource/*
- Configure Base URL in "account" client to `/.login?continue=http://oerworldmap.localhost/resource/`
- For ReCaptcha support, configure Realm Security Defenses:
  - `SAMEORIGIN; ALLOW-FROM https://www.google.com`
  - `frame-src 'self' https://www.google.com; frame-ancestors 'self'; object-src 'none';`
- Install & configure theme from https://github.com/hbz/oerworldmap-keycloak-theme
- Configure admin credentials in application.conf
- Copy create profile script to registration flow
- Copy create profile script to first-broker-login flow
- Set up Mappers for profile_id and groups

Install [mod_auth_openidc](https://github.com/zmartzone/mod_auth_openidc), if not on a supported system build from source:

```
$ git clone https://github.com/zmartzone/mod_auth_openidc.git
$ cd mod_auth_openidc
$ ./autogen.sh
$ zypper in apache2-devel
$ zypper in libcurl-devel
$ wget http://mirror.centos.org/centos/7/os/x86_64/Packages/jansson-2.10-1.el7.x86_64.rpm
$ rpm -i jansson-2.10-1.el7.x86_64.rpm
$ wget http://mirror.centos.org/centos/7/os/x86_64/Packages/jansson-devel-2.10-1.el7.x86_64.rpm
$ rpm -i jansson-devel-2.10-1.el7.x86_64.rpm
$ ln -s /lib64/libcrypto.so.1.0.0 /usr/lib64/libcrypto.so.10
$ wget https://mod-auth-openidc.org/download/cjose-0.5.1-1.el7.centos.x86_64.rpm
$ rpm -iv cjose-0.5.1-1.el7.centos.x86_64.rpm --nodeps
$ zypper in pcre-devel
$ ./configure --with-apxs2=/usr/bin/apxs2
$ make
$ make install
$ a2enmod auth_openidc
```

Finally, configure client secret in vhost.conf

#### Set up Apache

    $ sudo apt-get install apache2 libapache2-mod-auth-openidc
    $ sudo a2enmod proxy proxy_html proxy_http rewrite auth_openidc ssl headers

    $ mkdir data/auth
    $ cd data/auth
    $ touch htpasswd htgroups htprofiles

Edit `sudo visudo` and add permission to the user

    username  ALL = NOPASSWD: /usr/sbin/apache2ctl

Configure variables for `conf/vhost.conf`

    Define PUBLIC_HOST oerworldmap.localhost
    Define PUBLIC_PORT 80
    Define PUBLIC_EMAIL webmaster@oerworldmap.localhost
    Define AUTH_DIR /home/fo/local/src/oerworldmap/data
    Define API_HOST http://localhost:9000
    Define UI_HOST http://localhost:3000
    Define KIBANA_HOST http://localhost:5601
    Define PAGES_HOST http://localhost:4000
    #Define SSL_CIPHER_SUITE
    #Define SSL_CERT_FILE
    #Define SSL_CERT_KEY_FILE
    #Define SSL_CERT_CHAIN_FILE

Enable the site

    $ sudo ln -s /home/username/oerworldmap/conf/vhost.conf /etc/apache2/sites-available/oerworldmap.conf
    $ sudo a2ensite oerworldmap.conf
    $ sudo apache2ctl graceful


Modify the path in `data/permissions/.system`

    AuthUserFile /home/username/oerworldmap/data/auth/htpasswd
    AuthGroupFile /home/username/oerworldmap/data/auth/htgroups

Set up the hostname in `/etc/hosts`

    127.0.0.1	localhost oerworldmap.local


### Create database histories

    $ mkdir -p data/consents/objects
    $ touch data/consents/history
    $ mkdir -p data/commits/objects/
    $ touch data/commits/history


### Setup Play! Application

Download [sbt](http://www.scala-sbt.org/download.html), then

    $ sbt run

### Install UI

UI Components are available at https://github.com/hbz/oerworldmap-ui

### Work with IDEs

Using [activator](http://www.lightbend.com/community/core-tools/activator-and-sbt), integration to Eclipse and IDEA IntelliJ is provided by running `eclipse` or `idea` from within activator. To run the OER World Map JUnit tests inside IntelliJ, it is necessary to set the test's working directory to the root directory of this project (i. e. `oerworldmap`):

    Run | Edit configurations... | JUnit | <MyTest> | Configuration | Working directory:
    <absolute/path/to/oerworldmap>

## Contribute

### Coding conventions

Indent blocks by *two spaces* and wrap lines at *100 characters*. For more
details, refer to the [Google Java Style
Guide](https://google-styleguide.googlecode.com/svn/trunk/javaguide.html).

### Bug reports

Please file bugs as an issue labeled "Bug" [here](https://github.com/hbz/oerworldmap/issues/new). Include browser information and screenshot(s) when applicable.

## Attributions

This product includes GeoLite2 data created by MaxMind, available from
<a href="http://www.maxmind.com">http://www.maxmind.com</a>.
