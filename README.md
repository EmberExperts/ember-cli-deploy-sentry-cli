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

Add plugin config to your `config/deploy.js`:
```js
{
  'sentry-cli': {
    appName: 'sentry-app-name',
    orgName: 'sentry-org-name',
    authToken: process.env.SENTRY_AUTH_TOKEN
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

## License

This project is licensed under the [MIT License](LICENSE.md).
