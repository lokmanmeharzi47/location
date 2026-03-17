import { getDictionary } from "@/lib/dictionaries";
import CategoryClient from "./CategoryClient";

export default async function CategoryPage({ params }) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

    return <CategoryClient slug={slug} dict={dict} lang={lang} />;
}
