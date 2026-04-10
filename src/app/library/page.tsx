"use client";

import MainLayout from '@/components/layout/MainLayout';
import LibraryManager from '@/features/library/components/LibraryManager';

export default function LibraryPage() {
    return (
        <MainLayout>
            <LibraryManager />
        </MainLayout>
    );
}
