// src/app/contacts/page.tsx
import MainLayout from "@/components/layout/MainLayout";
import ContactList from "@/features/contacts/components/ContactList";

export default function ContactsPage() {
  return (
    <MainLayout>
      <ContactList />
    </MainLayout>
  );
}