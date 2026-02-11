import { getDictionary } from "@/lib/dictionaries";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <DashboardClient dict={dict} />;
}
