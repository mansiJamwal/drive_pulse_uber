import React from "react";

type Event = {
flag_id: string;
trip_id: string;
severity: string;
flag_type: string;
context: string;
explanation: string;
timestamp: string;
};

type Props = {
events: Event[];
onClose: () => void;
};

const PulseEventsModal: React.FC<Props> = ({ events, onClose }) => {
return ( <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"> <div className="bg-white w-125 max-h-[80vh] overflow-y-auto rounded-xl p-6 shadow-xl">


    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">Pulse Events</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-black"
      >
        ✕
      </button>
    </div>

    <div className="space-y-4">
      {events.map((e) => (
        <div
          key={e.flag_id}
          className="border rounded-lg p-3 text-sm"
        >
          <div><b>Type:</b> {e.flag_type}</div>
          <div><b>Severity:</b> {e.severity}</div>
          <div><b>Context:</b> {e.context}</div>
          <div className="text-gray-600">{e.explanation}</div>
          <div className="text-xs text-gray-400">
            {new Date(e.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>

  </div>
</div>


);
};

export default PulseEventsModal;
