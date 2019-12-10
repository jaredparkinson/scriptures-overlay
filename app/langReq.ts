import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { appSettings } from '../components/header.component';
import { parseCookieLang } from './parseCookieLang';

export const validLangs = ['eng', 'spa', 'por', 'fra', 'zhs', 'zho', 'jpn'];

export function langReq(req: IncomingMessage, query: ParsedUrlQuery) {
  try {
    const lang = query['lang'] as string;

    if (lang && validLangs.includes(lang.toLowerCase())) {
      return lang;
    }
  } catch (error) {}

  try {
    const lang = parseCookieLang(req.headers.cookie); // req.headers.cookie.toLowerCase() as string;
    if (lang && validLangs.includes(lang)) {
      return lang;
    }
  } catch (error) {}
  try {
    const lang = appSettings.settings.lang; //req.headers.cookie.toLowerCase() as string;
    if (lang && validLangs.includes(lang)) {
      return lang;
    }
  } catch (error) {}

  return 'eng';
}
