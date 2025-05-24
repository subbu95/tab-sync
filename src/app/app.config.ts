import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CrfTranslateService, translatationBundleLoader } from '@nielseniq/crf-translate';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { I18nModule, TOOLTIP_HOST_RESIZE_THROTTLE_INTERVAL } from '@nielseniq/athena-core';
import {authInterceptor}  from '../app/interceptors/auth.interceptor';
import { parseBlobInterceptor } from './interceptors/parse-blob.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
    appRoutes,
    withHashLocation()
  ),
  provideAnimationsAsync(),
  provideHttpClient(withInterceptors([authInterceptor, parseBlobInterceptor])),
  importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translatationBundleLoader,
        deps: [HttpClient, CrfTranslateService]
      },
      useDefaultLang: false
    }), I18nModule
  ),
  {
    provide: TOOLTIP_HOST_RESIZE_THROTTLE_INTERVAL,
    useValue: 250
  },

  TranslateService
]
};

