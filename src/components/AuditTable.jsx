const AuditTable = ({ logs = [] }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Jurnal Audit</h2>
      <div className="overflow-x-auto">
        <div className="flex bg-gray-200 text-gray-600 uppercase text-sm border border-gray-300 rounded-lg">
          <div className="flex-none w-12 py-2 px-4 border border-gray-300 font-semibold">
            #
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Data și ora
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Utilizator
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Proiect
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Echipă
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Tichet
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Acțiune
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Valoare anterioară
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Valoare nouă
          </div>
        </div>

        {logs.length ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex hover:bg-gray-50 border border-gray-300 rounded-lg"
            >
              <div className="flex-none w-12 py-2 px-4 border border-gray-300">
                {log.id}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.timestamp}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.user}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.project}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.echipa}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.entity}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.actiune}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.previousValue}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {log.newValue}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border border-gray-300 rounded-lg text-gray-500">
            Nu există jurnale de audit de afișat.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTable;
