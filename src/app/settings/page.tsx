// src/app/settings/page.tsx
"use client";

import MainLayout from "@/components/layout/MainLayout";
import SettingsForm from "@/features/settings/components/SettingsForm";

export default function SettingsPage() {
    return (
        <MainLayout>
            <SettingsForm />
        </MainLayout>
    );
}