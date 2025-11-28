/**
 * Basic test to verify Jest and fast-check are properly configured
 */
import * as fc from 'fast-check';

describe('Testing Framework Setup', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have fast-check available for property-based testing', () => {
    const result = fc.check(
      fc.property(fc.integer(), (n) => {
        return n === n;
      }),
      { numRuns: 10 }
    );
    expect(result.failed).toBe(false);
  });
});
