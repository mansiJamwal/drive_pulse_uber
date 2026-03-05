import React, { useState, useMemo } from "react"

interface Props {
  driverId: string
  currentGoal: {
    shift_start_time?: string
    shift_end_time?: string
    target_earnings?: number
    target_hours?: number
  }
  onClose: () => void
  onSuccess: () => void
}

const normalizeTime = (t?: string) => {
  if (!t) return ""
  return t.slice(0, 5)   // convert 09:00:00 → 09:00
}

const EditGoalModal: React.FC<Props> = ({
  driverId,
  currentGoal,
  onClose,
  onSuccess
}) => {

  const hasPreviousGoal =
    currentGoal.shift_start_time != null ||
    currentGoal.shift_end_time != null ||
    currentGoal.target_earnings != null ||
    currentGoal.target_hours != null

  const [shiftStart, setShiftStart] = useState(
    normalizeTime(currentGoal.shift_start_time)
  )

  const [shiftEnd, setShiftEnd] = useState(
    normalizeTime(currentGoal.shift_end_time)
  )

  const [targetEarnings, setTargetEarnings] = useState<number | "">(
    currentGoal.target_earnings ?? ""
  )

  const [targetHours, setTargetHours] = useState<number | "">(
    currentGoal.target_hours ?? ""
  )

  /* -----------------------------
     Detect if any value changed
  ----------------------------- */

  const hasChanged = useMemo(() => {

    return (
      shiftStart !== normalizeTime(currentGoal.shift_start_time) ||
      shiftEnd !== normalizeTime(currentGoal.shift_end_time) ||
      targetEarnings !== (currentGoal.target_earnings ?? "") ||
      targetHours !== (currentGoal.target_hours ?? "")
    )

  }, [shiftStart, shiftEnd, targetEarnings, targetHours, currentGoal])


  /* -----------------------------
     Validate first goal
  ----------------------------- */

  const firstGoalValid =
    shiftStart !== "" &&
    shiftEnd !== "" &&
    targetEarnings !== "" &&
    targetHours !== ""

  const canSubmit = hasPreviousGoal
    ? hasChanged
    : firstGoalValid

  /* ----------------------------- */

  const submit = async () => {

    if (!canSubmit) return

    await fetch(`http://localhost:8000/driver/${driverId}/goal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shift_start_time: shiftStart || null,
        shift_end_time: shiftEnd || null,
        target_earnings: targetEarnings === "" ? null : targetEarnings,
        target_hours: targetHours === "" ? null : targetHours
      })
    })

    alert("Goal updated successfully")

    onSuccess()
    onClose()
  }

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[420px]">

        <h2 className="text-xl font-semibold mb-4">
          {hasPreviousGoal ? "Edit Goal" : "Create Goal"}
        </h2>

        <div className="flex flex-col gap-3">

          <label>Shift Start</label>
          <input
            type="time"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
            className="bg-gray-900 p-2 rounded"
            required={!hasPreviousGoal}
          />

          <label>Shift End</label>
          <input
            type="time"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
            className="bg-gray-900 p-2 rounded"
            required={!hasPreviousGoal}
          />

          <label>Target Earnings</label>
          <input
            type="number"
            value={targetEarnings}
            onChange={(e) =>
              setTargetEarnings(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="bg-gray-900 p-2 rounded"
            required={!hasPreviousGoal}
          />

          <label>Target Hours</label>
          <input
            type="number"
            value={targetHours}
            onChange={(e) =>
              setTargetHours(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="bg-gray-900 p-2 rounded"
            required={!hasPreviousGoal}
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancel
          </button>

          <button
            disabled={!canSubmit}
            onClick={submit}
            className={`px-4 py-2 rounded font-semibold
            ${
              canSubmit
                ? "bg-emerald-500 text-black"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>

        </div>

      </div>

    </div>

  )
}

export default EditGoalModal