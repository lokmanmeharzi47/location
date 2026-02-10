const dictionaries = {
    ar: () => import('../locales/ar/common.json').then((module) => module.default),
    fr: () => import('../locales/fr/common.json').then((module) => module.default),
    en: () => import('../locales/en/common.json').then((module) => module.default),
};

export const getDictionary = async (locale) => {
    return dictionaries[locale]?.() ?? dictionaries.ar();
};
