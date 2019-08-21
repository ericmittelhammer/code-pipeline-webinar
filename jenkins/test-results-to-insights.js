// takes the test results written by mocha and sends them to insights

const http = require('https');
const testStats = require('../testStats');

const options = {
    hostname: 'insights-collector.newrelic.com',
    path: `/v1/accounts/${process.env['NEW_RELIC_ACCOUNT_ID']}/events`,
    method: 'POST',
    headers: {
        'Content-type': 'application/json',
        'X-Insert-Key': process.env['NEW_RELIC_INSERT_KEY']
    }
}

const payload = {
    eventType: 'testResults',
    numberTests: testStats.stats.tests,
    passes: testStats.stats.passes,
    failures: testStats.stats.failures,
    duration: testStats.stats.duration,
    gitRevision: process.env['GIT_REVISION'],
    buildId: process.env['BUILD_ID'],
    repoUrl: process.env['GIT_URL']
}

console.log("SENDING PAYLOAD:", payload);
const req = http.request(options, (res) => {
    var responseBody = '';
    res.on('data',(chunk) => responseBody = responseBody += chunk);
    res.on('end', () => {
        console.log('Instights Request Completed with code', res.statusCode);
        console.log('Body:')
        console.log(responseBody);
    });
});

req.on('error', (e) => {
    console.error(`Insights insert request failed: ${e}`);
});

// write data to request body
req.write(JSON.stringify(payload));
req.end();
