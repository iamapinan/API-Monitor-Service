# API Monitor Service
Automated API status monitoring service with email notification system

## Key Features
- Monitor multiple API endpoints simultaneously
- Configurable monitoring schedule (seconds/minutes/hours)
- Email notifications for API errors
- Error history logging
- Prevention of duplicate notifications for the same error
- Build-in GUI for easy monitoring

## Installation
`npm install`  
`npm start`  

## Configuration
`MONITOR_SCHEDULE` defines the monitoring interval. Examples: `10s` for every 10 seconds, `10m` for every 10 minutes, or `10h` for every 10 hours.  
`ENDPOINTS` is a list of APIs to monitor. 

## SMTP Configuration
SMTP configuration is required for sending emails. Set up your SMTP API key in the `.env` file using the `SMTP_API_KEY` variable.

## LICENSE
MIT