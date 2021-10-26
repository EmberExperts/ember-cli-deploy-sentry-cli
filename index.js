/* eslint-disable comma-dangle */
/* eslint-disable max-len, max-lines-per-function */
// eslint-disable-next-line strict
'use strict';

const path = require('path');
const { execSync } = require('child_process');
const BasePlugin = require('ember-cli-deploy-plugin');
const packageJson = require("./package.json");

module.exports = {
  name: packageJson.name,

  createDeployPlugin(options) {
    const DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        assetsDir(context) {
          return path.join(context.distDir, "assets");
        },

        revisionKey(context) {
          return context.revisionData && context.revisionData.revisionKey;
        },

        environment(context) {
          return context.deployTarget;
        },

        url: "",
      },

      requiredConfig: ["appName", "orgName", "authToken"],

      didPrepare() {
        const releaseName = `${this.readConfig("appName")}@${this.readConfig(
          "revisionKey"
        )}`;
        const assetsDir = this.readConfig("assetsDir");
        const urlPrefix = this.readConfig("urlPrefix")
          ? `--url-prefix ${this.readConfig("urlPrefix")}`
          : "";

        this.log("SENTRY: Creating release...");
        this.sentryCliExec("releases", `new "${releaseName}"`);

        this.log("SENTRY: Assigning commits...");
        this.sentryCliExec(
          "releases",
          `set-commits ${releaseName} --auto --ignore-missing`
        );

        this.log("SENTRY: Uploading source maps...");
        this.sentryCliExec(
          "releases",
          `files ${releaseName} upload-sourcemaps --rewrite ${assetsDir} ${urlPrefix}`
        );

        this.log("SENTRY: Finalizing release...");
        this.sentryCliExec("releases", `finalize ${releaseName}`);

        this.log("SENTRY: Release published!...");
      },

      didDeploy() {
        const appName = this.readConfig("appName");
        const releaseName = `${appName}@${this.readConfig("revisionKey")}`;
        const environment = this.readConfig("environment");

        this.log("SENTRY: Deploying release...");
        this.sentryCliExec(
          "releases",
          `deploys ${releaseName} new -e ${environment}`
        );
        this.log("SENTRY: Deployed!");
      },

      didFail() {
        const appName = this.readConfig("appName");
        const releaseName = `${appName}@${this.readConfig("revisionKey")}`;

        this.log("SENTRY: Deleting release...");
        this.sentryCliExec("releases", `delete ${releaseName}`);
        this.log("SENTRY: Release deleted!");
      },

      sentryCliExec(command, subCommand) {
        const authToken = this.readConfig("authToken");
        const orgName = this.readConfig("orgName");
        const appName = this.readConfig("appName");
        const url = this.readConfig("url");

        return this._exec(
          [
            path.join("node_modules", ".bin", "sentry-cli"),
            url ? `--url ${url}` : "",
            `--auth-token ${authToken}`,
            command,
            `--org ${orgName}`,
            `--project ${appName}`,
            subCommand,
          ].join(" ")
        );
      },

      _exec(command = "") {
        return execSync(command, { cwd: this.project.root });
      },
    });

    return new DeployPlugin();
  },
};
