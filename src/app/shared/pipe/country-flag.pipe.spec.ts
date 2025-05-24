import { environment } from "../../../environments/environment";
import { CountryFlagPipe } from "./country-flag.pipe";

describe('CountryFlagPipe', () => {
  let pipe: CountryFlagPipe;
  // Create a new instance of the pipe before each test
  beforeEach(() => {
    pipe = new CountryFlagPipe();
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should return flag HTML when countryCode exists and the flag is valid', () => {
    // Create a mock div that behaves like a Node element
    const fakeFlagElement = document.createElement('span');
    fakeFlagElement.className = 'fi fi-us'; // Example: US flag
    fakeFlagElement.appendChild = jasmine.createSpy('appendChild');
    fakeFlagElement.removeChild = jasmine.createSpy('removeChild');
    // Mock document.createElement to return our fake flag element
    spyOn(document, 'createElement').and.returnValue(fakeFlagElement);
    // Spy on window.getComputedStyle to return a valid background image
    spyOn(window, 'getComputedStyle').and.returnValue({
      backgroundImage: 'url(path-to-us-flag.png)', // Valid background image
    } as CSSStyleDeclaration);
    const result = pipe.transform('US', 'United States');
    expect(result).toBe('<span class="fi fi-us"></span>&nbsp;United States');
  });
  it('should return default flag with name when countryCode is invalid or flag does not exist', () => {
    // Create a mock div that behaves like a Node element
    const fakeFlagElement = document.createElement('span');
    fakeFlagElement.className = 'fi fi-xyz'; // Invalid country code
    fakeFlagElement.appendChild = jasmine.createSpy('appendChild');
    fakeFlagElement.removeChild = jasmine.createSpy('removeChild');
    spyOn(document, 'createElement').and.returnValue(fakeFlagElement);
    spyOn(window, 'getComputedStyle').and.returnValue({
      backgroundImage: 'none', // No valid background image for flag
    } as CSSStyleDeclaration);
    const result = pipe.transform('XYZ', 'Unknown Country');
    expect(result).toBe(`<img src="${environment.imageBasePath}images/Globe.png" alt="globe" width="19.19" height="20">&nbsp;Unknown Country`);
  });
  it('should return default flag when no countryCode is provided', () => {
    const result = pipe.transform('', 'Unknown Country');
    expect(result).toBe(`<img src="${environment.imageBasePath}images/Globe.png" alt="globe" width="19.19" height="20">&nbsp;Unknown Country`);
  });
  it('should return default flag when countryCode is empty and no countryName is provided', () => {
    const result = pipe.transform('', '');
    expect(result).toBe(`<img src="${environment.imageBasePath}images/Globe.png" alt="globe" width="19.19" height="20">`);
  });
  it('should return the flag with name when valid countryCode is given and countryName is provided', () => {
    const fakeFlagElement = document.createElement('span');
    fakeFlagElement.className = 'fi fi-ca'; // Example: Canada flag
    fakeFlagElement.appendChild = jasmine.createSpy('appendChild');
    fakeFlagElement.removeChild = jasmine.createSpy('removeChild');
    spyOn(document, 'createElement').and.returnValue(fakeFlagElement);
    spyOn(window, 'getComputedStyle').and.returnValue({
      backgroundImage: 'url(path-to-canada-flag.png)', // Valid background image
    } as CSSStyleDeclaration);
    const result = pipe.transform('CA', 'Canada');
    expect(result).toBe('<span class="fi fi-ca"></span>&nbsp;Canada');
  });
}); 