import React, { useState, useMemo } from "react";

interface Props {
  driverId: string;
  currentGoal: {
    shift_start_time?: string;
    shift_end_time?: string;
    target_earnings?: number;
    target_hours?: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const normalizeTime = (t?: string) => {
  if (!t) return "";
  return t.slice(0, 5);
};

const EditGoalModal: React.FC<Props> = ({
  driverId,
  currentGoal,
  onClose,
  onSuccess,
}) => {
  const hasPreviousGoal =
    currentGoal.shift_start_time != null ||
    currentGoal.shift_end_time != null ||
    currentGoal.target_earnings != null ||
    currentGoal.target_hours != null;

  const [shiftStart, setShiftStart] = useState(
    normalizeTime(currentGoal.shift_start_time),
  );

  const [shiftEnd, setShiftEnd] = useState(
    normalizeTime(currentGoal.shift_end_time),
  );

  const [targetEarnings, setTargetEarnings] = useState<number | "">(
    currentGoal.target_earnings ?? "",
  );

  const [targetHours, setTargetHours] = useState<number | "">(
    currentGoal.target_hours ?? "",
  );

  const hasChanged = useMemo(() => {
    return (
      shiftStart !== normalizeTime(currentGoal.shift_start_time) ||
      shiftEnd !== normalizeTime(currentGoal.shift_end_time) ||
      targetEarnings !== (currentGoal.target_earnings ?? "") ||
      targetHours !== (currentGoal.target_hours ?? "")
    );
  }, [shiftStart, shiftEnd, targetEarnings, targetHours, currentGoal]);

  const firstGoalValid =
    shiftStart !== "" &&
    shiftEnd !== "" &&
    targetEarnings !== "" &&
    targetHours !== "";

  const canSubmit = hasPreviousGoal ? hasChanged : firstGoalValid;

  const submit = async () => {
    if (!canSubmit) return;

    await fetch(`http://localhost:8000/driver/${driverId}/goal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shift_start_time: shiftStart || null,
        shift_end_time: shiftEnd || null,
        target_earnings: targetEarnings === "" ? null : targetEarnings,
        target_hours: targetHours === "" ? null : targetHours,
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 w-[420px]">
        <h2 className="text-lg font-black text-slate-900 mb-6">
          {hasPreviousGoal ? "Edit Goal" : "Create Goal"}
        </h2>

        <div className="flex flex-col gap-4 text-sm">
          <div>
            <label className="block mb-1 text-slate-500 font-semibold">
              Shift Start
            </label>
            <input
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-500 font-semibold">
              Shift End
            </label>
            <input
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-500 font-semibold">
              Target Earnings
            </label>
            <input
              type="number"
              value={targetEarnings}
              onChange={(e) =>
                setTargetEarnings(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="₹"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-500 font-semibold">
              Target Hours
            </label>
            <input
              type="number"
              value={targetHours}
              onChange={(e) =>
                setTargetHours(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            disabled={!canSubmit}
            onClick={submit}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition
            ${
              canSubmit
                ? "bg-slate-900 text-white hover:bg-slate-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGoalModal;