import { useLanguage } from '../../i18n/useLanguage';
import { LANGUAGES } from '../../i18n/constants';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="text-xs text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer appearance-none"
      aria-label="Select language"
    >
      {Object.entries(LANGUAGES).map(([code, { label }]) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}
