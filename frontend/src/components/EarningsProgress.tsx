import React from "react"

interface Props {
  current: number
  predicted: number
}

const GOAL = 1200

const EarningsProgress: React.FC<Props> = ({
  current,
  predicted
}) => {

  const percent = Math.min((current / GOAL) * 100, 100)

  return (

    <div style={{ marginBottom: 30 }}>

      <h3>Earnings Progress</h3>

      <div style={{
        height: 20,
        background: "#eee",
        borderRadius: 10
      }}>

        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#4caf50",
            borderRadius: 10
          }}
        />

      </div>

      <p>

        Current: ₹{current} / Goal: ₹{GOAL}

      </p>

      <p>

        Predicted Final: ₹{predicted}

      </p>

    </div>

  )

}

export default EarningsProgress