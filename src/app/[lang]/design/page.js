import CarCategories from '@/components/CarCategories';
import { getDictionary } from '@/lib/dictionaries';

export default async function DesignPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
            <CarCategories dict={dict} lang={lang} />
        </div>
    );
}