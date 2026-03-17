import { getDictionary } from "@/lib/dictionaries";
import CarsClient from "./CarsClient";

export default async function CarsPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <CarsClient dict={dict} lang={lang} />;
}
