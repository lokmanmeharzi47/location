import { getDictionary } from "@/lib/dictionaries";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <SettingsClient dict={dict} />;
}
