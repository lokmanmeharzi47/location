import { getDictionary } from "@/lib/dictionaries";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <DashboardLayoutClient dict={dict} lang={lang}>
            {children}
        </DashboardLayoutClient>
    );
}
