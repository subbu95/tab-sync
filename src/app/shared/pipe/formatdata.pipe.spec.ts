import { FormatDataPipe } from "./formatdata.pipe";

describe('FormatDataPipe', () => {
  let pipe: FormatDataPipe;
  // Create a new instance of the pipe before each test
  beforeEach(() => {
    pipe = new FormatDataPipe();
  });
  // Test 1: Should remove all spaces and convert to lowercase
  it('should transform value by removing spaces and converting to lowercase', () => {
    const result = pipe.transform('Hello World');
    expect(result).toBe('helloworld');
  });
  // Test 2: Should handle input with multiple spaces
  it('should handle multiple spaces between words', () => {
    const result = pipe.transform('  Angular   Pipe  ');
    expect(result).toBe('angularpipe');
  });
  // Test 3: Should handle input with leading and trailing spaces
  it('should handle leading and trailing spaces', () => {
    const result = pipe.transform('   Hello Angular   ');
    expect(result).toBe('helloangular');
  });
  // Test 4: Should handle empty string
  it('should return an empty string for empty input', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });
  // Test 5: Should handle a string with only spaces
  it('should return an empty string if only spaces are present', () => {
    const result = pipe.transform('     ');
    expect(result).toBe('');
  });
  // Test 6: Should handle a string with no spaces
  it('should return the same string if no spaces are present', () => {
    const result = pipe.transform('Angular');
    expect(result).toBe('angular');
  });
  // Test 7: Should handle strings with mixed casing
  it('should transform string to lowercase', () => {
    const result = pipe.transform('AngulAR PiPE');
    expect(result).toBe('angularpipe');
  });
});