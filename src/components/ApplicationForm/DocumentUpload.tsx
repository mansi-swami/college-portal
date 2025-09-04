type Props = { onUpload: (f: File) => void };

export default function DocumentUpload({ onUpload }: Props) {
  return (
    <div>
      <label className="block mb-2 font-semibold">Upload Transcript (PDF only)</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) onUpload(e.target.files[0]);
        }}
      />
    </div>
  );
}
