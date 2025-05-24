import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
    name: 'countryFlag',
    standalone: true,
})
export class CountryFlagPipe implements PipeTransform {
    transform(countryCode: string | number, countryName = ''): string {
        if (!countryCode) {
            return this.getDefaultFlagWithName(countryName); // Default flag with name
        }
        countryCode = countryCode as string;
        const flagSpan = document.createElement('span');
        flagSpan.className = `fi fi-${countryCode.toLowerCase()}`;
        document.body.appendChild(flagSpan);
        const computedStyle = window.getComputedStyle(flagSpan);
        const backgroundImage = computedStyle.backgroundImage;
        document.body.removeChild(flagSpan);
        return backgroundImage === 'none' || !backgroundImage
            ? this.getDefaultFlagWithName(countryName)
            : `<span class="fi fi-${countryCode.toLowerCase()}"></span>&nbsp;${countryName}`;
    }

    private getDefaultFlagWithName(countryName: string): string {
        if (countryName) {
            return `<img src="${environment.imageBasePath}images/Globe.png" alt="globe" width="19.19" height="20">&nbsp;${countryName || 'Unknown'}` // Default flag with fallback name
        } else {
            return `<img src="${environment.imageBasePath}images/Globe.png" alt="globe" width="19.19" height="20">` // Default flag with fallback name
        }
    }
}
