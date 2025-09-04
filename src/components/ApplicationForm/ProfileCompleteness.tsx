type Props = {
  form: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    program: string;
    address: string;
    pdf: File | null;
  };
};

export default function ProfileCompleteness({ form }: Props) {
  // Count completed fields
  const completed = [
    form.name?.trim(),
    form.email?.trim(),
    form.phone?.trim(),
    form.dob?.trim(),
    form.program?.trim(),
    form.address?.trim(),
    form.pdf,
  ].filter(Boolean).length;

  const total = 7;

  return (
    <div className="mb-3">
      <p className="text-sm">
        Profile Completeness: {completed}/{total}
      </p>
      <div className="h-2 bg-gray-300 rounded">
        <div
          className="h-2 bg-green-500 rounded transition-all"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
