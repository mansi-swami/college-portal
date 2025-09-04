type Props = { step: number; totalSteps: number };

const ProgressBar = ({ step, totalSteps }: Props) => {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-300 h-2 rounded mb-4">
      <div className="bg-blue-500 h-2 rounded" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default ProgressBar;
