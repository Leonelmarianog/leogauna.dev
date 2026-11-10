import { i18n } from 'astro:config/server';

const en = {
  'meta.title': 'Leonel Gauna · Full-Stack Developer',
  'meta.description': 'Leonel Gauna, full-stack developer with 5+ years of experience.',
  'home.greeting': 'Hi! I’m',
  'home.name': 'Leonel Gauna.',
  'home.summary':
    'I’m a full-stack developer based in Argentina with 5+ years of experience in tech. I like building things, making them work, and figuring out why when they don’t. I’m very meticulous and organized, with a strong focus on quality.',
  'home.cv': 'Download CV ↓',
  'home.linkedin': 'LinkedIn ↗',
  'home.github': 'GitHub ↗',
  'home.email': 'Email',
  /** Shown on the language toggle that leads to this Locale. */
  'locale.code': 'EN',
  /** Accessible name of the language toggle that leads to this Locale, in this Locale. */
  'locale.viewIn': 'View in English',
} as const;

export type UiKey = keyof typeof en;

const es = {
  'meta.title': 'Leonel Gauna · Desarrollador Full-Stack',
  'meta.description': 'Leonel Gauna, desarrollador full-stack con más de 5 años de experiencia.',
  'home.greeting': '¡Hola! Soy',
  'home.name': 'Leonel Gauna.',
  'home.summary':
    'Soy desarrollador full-stack en Argentina, con más de 5 años de experiencia en tecnología. Me gusta construir cosas, hacer que funcionen y descubrir por qué no lo hacen. Soy muy meticuloso y organizado, con un fuerte enfoque en la calidad.',
  'home.cv': 'Descargar CV ↓',
  'home.linkedin': 'LinkedIn ↗',
  'home.github': 'GitHub ↗',
  'home.email': 'Correo',
  'locale.code': 'ES',
  'locale.viewIn': 'Ver en español',
} as const;

/** Every Locale must define every key that `en` defines. */
export const ui = {
  en,
  es,
} satisfies Record<string, Record<UiKey, string>>;

export type Locale = keyof typeof ui;

export const locales = Object.keys(ui) as Locale[];

/** The Locale served without a URL prefix, from `i18n.defaultLocale` in `astro.config.mjs`. */
export const defaultLocale = i18n!.defaultLocale as Locale;

/** The Locale the language toggle leads to from each Locale. */
export const localeDictionary = {
  en: 'es',
  es: 'en',
} as const satisfies Record<Locale, Locale>;
