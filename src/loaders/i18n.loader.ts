import i18next, { i18n as I18n } from 'i18next';
import i18nHttpMiddleware from 'i18next-http-middleware';
import * as resources from '../locale';

/**
 * I18n instance initializer
 */
export default async function initI18n(): Promise<I18n> {
  const i18n = await new Promise<I18n>((resolve, reject) =>
    i18next.use(i18nHttpMiddleware.LanguageDetector).init(
      {
        detection: {
          order: ['cookie', 'header'],
          lookupCookie: 'i18next',
          lookupHeader: 'accept-language',
          caches: ['cookie'],
        },
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        ns: [],
        preload: ['en'],
        resources,
        supportedLngs: ['en'],
      },
      err => {
        if (err) reject(new Error(`failed to initialize i18n instance. ${err}`));
        else resolve(i18next);
      },
    ),
  );

  return i18n;
}
