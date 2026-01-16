// app/booking/components/ProgressBar.tsx
export default function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="mb-10">
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-black rounded transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
