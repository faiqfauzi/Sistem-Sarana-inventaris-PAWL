import FormLokasi from "./FormLokasi";

export default function TambahLokasi({ onBack, onSaved }) {
  return <FormLokasi mode="create" onBack={onBack} onSaved={onSaved} />;
}
