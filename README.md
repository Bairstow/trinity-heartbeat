### Install instructions

#### Setup monitoring script
- Clone this repository
- Install dependencies via `npm install`
- Update monitory script values where necessary:
  - loggingServerAddress to point at the server where logging records are to be kept
  - logPackage is the base stat data package used to define stats in the logging container

#### Setup cron job to run monitoring script
- Set interval execution for the script via cron job or other means
- Example cron job setup (`crontab -e` and add the following line):
```
*/15 * * * * node /path/to/repository/trinity-heartbeat/log-monitoring.js uniqueLocation
```
- This will collate speedtest stats and log them to the monitoring server every 15 mins. The uniqueLocation label in
    this case would be used differentiate between multiple logging locations. If this is is not added and the script is
    run without a location argument then 'default' will be used in replacement.

#### Setup graphite-statsd logging stack
- Graphite have a publicly available docker image that allows for quick and easy setup of the logging collection utility
    that we require. This stack configuration can be setup using the native applications but the docker option is the
    easier install option. Obviously docker needs to be available on the logging server for this:
```
docker run -d --name graphite --restart=always -p 1200:80 -p 8125:8125/udp graphiteapp/graphite-statsd
```
- Initial credentials are root/root unless otherwise specified
- We need to expose the http port (I've used 1200 to not clash with other running containers) to allow access by the
    graphing framework we'll setup next.
- The 8125 udp port is the communication method in the monitoring script. If that changes then this will likely require
    some configuration changes for the graphite container also.
- Once this container is running (and either the cron job has executed, or the monitoring script has been manually run)
    you should be able to see some basic logging collection via the 1200 port graphite web view.

#### Setup Grafana display framework
- Open source display framework, with a slightly friendlier looking monitoring display and UI.
- Will set this up alongside the graphite container which it will just be able to plug into for display.
```
docker run -d --name grafana --restart=always -p 3000:3000 grafana/grafana
```
- Initial credentials are admin/admin unless otherwise specified
- Accessing the Grafana web view via the 3000 port and logging in allows setup of a data source (point this at the
    graphite http port e.g. log.server.address:1200) and dashboard to show the newly logged stats.
