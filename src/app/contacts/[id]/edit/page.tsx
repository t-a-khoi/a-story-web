// src/app/contacts/[id]/edit/page.tsx
import { use } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ContactEditForm from "@/features/contacts/components/ContactEditForm";

export default function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const contactId = Number(id);

    return (
        <MainLayout>
            <ContactEditForm contactId={contactId} />
        </MainLayout>
    );
}
