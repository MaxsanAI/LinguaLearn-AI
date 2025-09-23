import React from 'react';
import { useTranslations } from '../hooks/useTranslations.ts';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PolicySection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <div className="text-slate-600 space-y-2 whitespace-pre-line">{children}</div>
    </div>
);

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
    const { t } = useTranslations();
    return (
        <div className="absolute inset-0 z-30 flex" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col mx-auto" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold">{t.privacy_title}</h2>
                        <p className="text-xs text-slate-500">{t.privacy_last_updated}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <PolicySection title={t.privacy_intro_title}>{t.privacy_intro_desc}</PolicySection>
                    <PolicySection title={t.privacy_data_title}>{t.privacy_data_desc}</PolicySection>
                    <PolicySection title={t.privacy_usage_title}>{t.privacy_usage_desc}</PolicySection>
                    <PolicySection title={t.privacy_third_party_title}>{t.privacy_third_party_desc}</PolicySection>
                    <PolicySection title={t.privacy_storage_title}>{t.privacy_storage_desc}</PolicySection>
                    <PolicySection title={t.privacy_rights_title}>{t.privacy_rights_desc}</PolicySection>
                    <PolicySection title={t.privacy_children_title}>{t.privacy_children_desc}</PolicySection>
                    <PolicySection title={t.privacy_changes_title}>{t.privacy_changes_desc}</PolicySection>
                    <PolicySection title={t.privacy_contact_title}>{t.privacy_contact_desc}</PolicySection>
                </div>
            </div>
        </div>
    );
};