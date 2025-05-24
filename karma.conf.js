// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-sonarqube-unit-reporter'),
      require('karma-coverage-istanbul-reporter')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/cip-eclipse'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml', 'coverage-istanbul', 'sonarqubeUnit'],
    browsers: ['ChromeHeadlessCustom'],
    browserNoActivityTimeout: 400000,
    captureTimeout: 100000,
    singleRun: true,
    restartOnFileChange: true,
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/sirval-ux'),
      reports: ['html','lcovonly'],
      fixWebpackSourcePaths: true
    },
    sonarQubeUnitReporter: {
      sonarQubeVersion: '8.x',
      outputFile: 'test-coverage-report.xml',
      ignoreFailures: true,
      reportPath: require('path').join(__dirname, './coverage/sirval-ux/test-coverage-report.xml')
    },
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--headless']
      }
    },
  });
};
process.env.CHROME_BIN = require('puppeteer').executablePath()
