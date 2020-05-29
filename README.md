# ember-cli-deploy-sentry-cli

Integrate your deploy pipeline with Sentry. Upload sourcemaps, assign related commits and manage releases.


# Compatibility

* ember-cli-deploy v1.0 or above
* Node.js v8 or above


## Installation

```
ember install ember-cli-deploy-sentry-cli
```


## Usage

Turn on `sourcemaps` generation in `ember-cli-build.js` config:
```js
{
  sourcemaps: {
    enabled: true,
    extensions: ['js']
  }
}
```

Add plugin config to your `config/deploy.js`:
```js
{
  'sentry-cli': {
    appName: 'sentry-app-name',
    orgName: 'sentry-org-name',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    urlPrefix: '', // if you need prefix for Sentry to catch like ~/assets
    // url: 'https://your-custom-sentry-server.test/` // in case of self-hosted server
  }
}
```

Optionaly set revision type to `version-commit` to have unified versioning pattern:
```js
{
  'revision-data': {
    type: 'version-commit'
  }
}
```

Leave the rest for sentry-cli ;) Deploy! 🚀✌️

## FAQ & Possible errors

#### 1. `You do not have permission to perform this action`
Your `authToken` needs to have following scopes: `org:read` and `project:releases`

#### 2. `Could not determine any commits to be associated automatically.`
Your application repository needs to be connected on Sentry to your ogranization account and connected with the project.

#### 3. Your app's issues and not correctly related with app deploy version
Make sure your app's `moudlePrefix` is equal to your Sentry `appName`, and your `revision-data` `type` in `config/deploy.js` is using the same versioning strategy. In most cases you should use `version-commit`

## BONUS: Integrate your app with Sentry

1. Install Sentry:

`npm i @sentry/browser @sentry/integrations`

2. Add sentry config to `config/environment.js` file

```js
// config/environment.js

// Add following config
{
  sentry: {
    dsn: 'your-app-dsn'
  }
}
```

3. Configure Sentry instance with defaults.
**Remember to define `environment` and `release`**

```js
// app/sentry.js

import * as Sentry from '@sentry/browser';
import { Ember } from '@sentry/integrations/esm/ember';
import config from 'web-app/config/environment';

const sentryConfig = config.sentry || {};

export function startSentry() {
  Sentry.init({
    environment: config.environment,
    release: `${config.modulePrefix}@${config.APP.version}`,
    ...sentryConfig,
    integrations: [new Ember()]
  });
}
```

4. Initialize Sentry at the begining of `app/index.js` file

```js
// app/index.js

import { startSentry } from './sentry';

startSentry();

```

More info: https://simplabs.com/blog/2019/07/15/sentry-and-ember

## License

This project is licensed under the [MIT License](LICENSE.md).
