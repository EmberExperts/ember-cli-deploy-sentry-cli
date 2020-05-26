/* eslint-disable max-len, max-lines-per-function */
'use strict';

const path = require('path');
const { execSync } = require('child_process');
const BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: require('./package').name,

  createDeployPlugin(options) {
    const DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        assetsDir(context) {
          return path.join(context.distDir, 'assets');
        },

        revisionKey(context) {
          return context.revisionData && context.revisionData.revisionKey;
        },

        environment(context) {
          return context.deployTarget;
        },

        url: '',
      },

      requiredConfig: ['appName', 'orgName', 'authToken'],

      didPrepare() {
        const releaseName = `${this.readConfig('appName')}@${this.readConfig('revisionKey')}`;
        const assetsDir = this.readConfig('assetsDir');

        this.log('SENTRY: Creating release...');
        this.sentryCliExec(`new ${releaseName}`);

        this.log('SENTRY: Assigning commits...');
        this.sentryCliExec(`set-commits --auto ${releaseName}`);

        this.log('SENTRY: Uploading source maps...');
        this.sentryCliExec(`files ${releaseName} upload-sourcemaps --rewrite ${assetsDir}`);

        this.log('SENTRY: Finalizing release...');
        this.sentryCliExec(`finalize ${releaseName}`);

        this.log('SENTRY: Release published!...');
      },

      didDeploy() {
        const appName = this.readConfig('appName');
        const releaseName = `${appName}@${this.readConfig('revisionKey')}`;
        const environment = this.readConfig('environment');

        this.log('SENTRY: Deploying release...');
        this.sentryCliExec(`deploys ${releaseName} new -e ${environment}`);
        this.log('SENTRY: Deployed!');
      },

      didFail() {
        const appName = this.readConfig('appName');
        const releaseName = `${appName}@${this.readConfig('revisionKey')}`;

        this.log('SENTRY: Deleting release...');
        this.sentryCliExec(`delete ${releaseName}`);
        this.log('SENTRY: Release deleted!');
      },

      sentryCliExec(params) {
        const authToken = this.readConfig('authToken');
        const orgName = this.readConfig('orgName');
        const appName = this.readConfig('appName');
        const url = this.readConfig('url');

        return this._exec(
          [
            path.join('node_modules', '.bin', 'sentry-cli'),
            url ? `SENTRY_URL=${url}` : '',
            `--auth-token ${authToken}`,
            'releases',
            `--org ${orgName}`,
            `--project ${appName}`,
            params,
          ].join(' ')
        );
      },

      _exec(command = '') {
        return execSync(command, { cwd: this.project.root });
      },
    });

    return new DeployPlugin();
  },
};
