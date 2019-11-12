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
        }
      },

      requiredConfig: ['appName', 'orgName', 'authToken'],

      didPrepare() {
        const releaseName = `${this.readConfig('appName')}@${this.readConfig('revisionKey')}`;
        const assetsDir = this.readConfig('assetsDir');

        this.log('SENTRY: Creating release...');
        this.sentryCliExec(`releases new ${releaseName}`);

        this.log('SENTRY: Assigning commits...');
        this.sentryCliExec(`releases set-commits --auto ${releaseName}`);

        this.log('SENTRY: Uploading source maps...');
        this.sentryCliExec(`releases files ${releaseName} upload-sourcemaps --rewrite ${assetsDir}`);

        this.log('SENTRY: Finalizing release...');
        this.sentryCliExec(`releases finalize ${releaseName}`);

        this.log('SENTRY: Release published!...');
      },

      didDeploy() {
        const appName = this.readConfig('appName');
        const releaseName = `${appName}@${this.readConfig('revisionKey')}`;
        const environment = this.readConfig('environment');

        this.log('SENTRY: Deploying release...');
        this.sentryCliExec(`releases deploys ${releaseName} new -e ${environment}`);
        this.log('SENTRY: Deployed!');
      },

      didFail() {
        const appName = this.readConfig('appName');
        const releaseName = `${appName}@${this.readConfig('revisionKey')}`;

        this.log('SENTRY: Deleting release...');
        this.sentryCliExec(`releases delete ${releaseName}`);
        this.log('SENTRY: Release deleted!');
      },

      sentryCliExec(command) {
        const authToken = this.readConfig('authToken');
        const orgName = this.readConfig('orgName');
        const appName = this.readConfig('appName');

        return this._exec(
          `SENTRY_ORG=${orgName} ` +
          `SENTRY_AUTH_TOKEN=${authToken} ` +
          `SENTRY_PROJECT=${appName} ` +
          `node_modules/.bin/sentry-cli ${command}`
        );
      },

      _exec(command = '') {
        return execSync(command, { cwd: this.project.root });
      }
    });

    return new DeployPlugin();
  }
};
