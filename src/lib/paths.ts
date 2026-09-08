export const paths = {
  about: '/about/',
  home: '/',
  journal: '/journal/',
  works: '/works/',
  work: (slug: string) => `/works/${slug}/`,
} as const;
