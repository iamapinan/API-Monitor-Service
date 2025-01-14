const parseSchedule = (scheduleString) => {
  if (!scheduleString) return '*/5 * * * *'; // default 5 minutes

  const match = scheduleString.match(/^(\d+)(s|m|h)$/);
  if (!match) {
    console.warn('Invalid schedule format. Using default 5 minutes schedule');
    return '*/5 * * * *';
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 's':
      return `*/${numValue} * * * * *`; // seconds
    case 'm':
      return `*/${numValue} * * * *`; // minutes
    case 'h':
      return `0 */${numValue} * * *`; // hours
    default:
      return '*/5 * * * *';
  }
};

module.exports = { parseSchedule }; 