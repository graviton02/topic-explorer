const HistoryPanel = ({ 
  history, 
  onHistoryItemClick, 
  onClearHistory, 
  isLoading,
  currentTopicName
}) => {

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all history for this session?')) {
      onClearHistory();
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="p-4 bg-gray-50 shadow rounded-lg h-full">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">History</h2>
        <p className="text-sm text-gray-500">No history items yet.</p>
        <button 
          onClick={handleClear}
          disabled={isLoading}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm transition disabled:bg-red-300"
        >
          {isLoading ? 'Clearing...' : 'Clear History'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 shadow rounded-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">History</h2>
      <div className="flex-grow overflow-y-auto mb-3 pr-1">
        <ul className="space-y-2">
          {history.map((item, index) => (
            <li key={item.id || index}>
              <button
                onClick={() => onHistoryItemClick(index)}
                className={`w-full text-left p-2 rounded-md text-sm transition hover:bg-blue-100 ${item.name === currentTopicName ? 'bg-blue-100 font-semibold' : 'bg-white'}`}
              >
                <span className="truncate block">{item.name}</span>
                {item.timestamp && (
                  <span className="text-xs text-gray-500 block mt-0.5">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button 
        onClick={handleClear}
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm transition disabled:bg-red-300"
      >
        {isLoading ? 'Clearing...' : 'Clear History'}
      </button>
    </div>
  );
};

export default HistoryPanel; 