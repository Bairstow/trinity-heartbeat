const NetcatClient = require('netcat/client');
const speedTest = require('speedtest-net');

const loggingServerAddress = '103.25.58.233';
const sendUDPStatLog = (payload) => {
  const nc = new NetcatClient();
  nc.udp().port(8125).wait(1000).init().send(payload, loggingServerAddress);
};

const test = speedTest({maxTime: 5000});
const logPackage = 'trinity.heartbeat.speedtest';
const hasLocationArgument = process.argv.length > 2;
const location = hasLocationArgument ? process.argv[2] : 'default';
const generateNamedGaugeLog = (metric, value) => `${logPackage}.${metric}.${location}:${value}|g`;

test.on('data', data => {
  const { download, upload } = data.speeds;
  const { ping } = data.server;
  console.dir(`Retrieved - Download: ${download} - Upload: ${upload} - Ping: ${ping}`);

  sendUDPStatLog(generateNamedGaugeLog('download', download));
  sendUDPStatLog(generateNamedGaugeLog('upload', upload));
  sendUDPStatLog(generateNamedGaugeLog('ping', ping));
});

test.on('error', err => {
  console.error(err);
});
