const { parseSchedule } = require('../src/utils/scheduleParser');

describe('Schedule Parser', () => {
  it('should parse seconds correctly', () => {
    expect(parseSchedule('10s')).toBe('*/10 * * * * *');
    expect(parseSchedule('30s')).toBe('*/30 * * * * *');
  });

  it('should parse minutes correctly', () => {
    expect(parseSchedule('1m')).toBe('*/1 * * * *');
    expect(parseSchedule('15m')).toBe('*/15 * * * *');
  });

  it('should parse hours correctly', () => {
    expect(parseSchedule('1h')).toBe('0 */1 * * *');
    expect(parseSchedule('2h')).toBe('0 */2 * * *');
  });

  it('should return default schedule for invalid format', () => {
    expect(parseSchedule('invalid')).toBe('*/5 * * * *');
    expect(parseSchedule('')).toBe('*/5 * * * *');
    expect(parseSchedule(null)).toBe('*/5 * * * *');
  });
}); 