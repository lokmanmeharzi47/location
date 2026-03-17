import { getDictionary } from '@/lib/dictionaries';
import AdminClientLayout from './AdminClientLayout';

export default async function AdminLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <AdminClientLayout lang={lang} dict={dict}>
            {children}
        </AdminClientLayout>
    );
}
