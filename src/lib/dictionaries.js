const dictionaries = {
    ar: () => import('../dictionaries/ar.json').then((module) => module.default),
    fr: () => import('../dictionaries/fr.json').then((module) => module.default),
    en: () => import('../dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale) => {
    return dictionaries[locale]?.() ?? dictionaries.ar();
};
