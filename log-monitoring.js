const NetcatClient = require('netcat/client');
const speedTest = require('speedtest-net');

const sendUDPStatLog = (payload) => {
  const nc = new NetcatClient();
  nc.udp().port(8125).wait(1000).init().send(payload, '127.0.0.1');
};

const test = speedTest({maxTime: 5000});
const logPackage = 'trinity.heartbeat.speedtest';
const location = 'bottomJeopFlat';
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

