const en = {
  'meta.title': 'Leonel Gauna · Full-Stack Developer',
  'meta.description': 'Leonel Gauna, full-stack developer with 5+ years of experience.',
  'home.greeting': 'Hi! I’m',
  'home.name': 'Leonel Gauna.',
  'home.summary':
    'I’m a full-stack developer based in Argentina with 5+ years of experience in tech. I like building things, making them work, and figuring out why they don’t. I’m very meticulous and organized, with a strong focus on quality.',
  'home.cv': 'Download CV ↓',
  'home.linkedin': 'LinkedIn ↗',
  'home.github': 'GitHub ↗',
  'home.email': 'Email',
} as const;

export type UiKey = keyof typeof en;

/** Every Locale must define every key that `en` defines. */
export const ui = {
  en,
} satisfies Record<string, Record<UiKey, string>>;

export type Locale = keyof typeof ui;
