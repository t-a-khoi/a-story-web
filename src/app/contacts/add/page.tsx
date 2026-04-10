// src/app/contacts/add/page.tsx
import MainLayout from "@/components/layout/MainLayout";
import ContactAddForm from "@/features/contacts/components/ContactAddForm";

export default function AddContactPage() {
    return (
        <MainLayout>
            <ContactAddForm />
        </MainLayout>
    );
}
