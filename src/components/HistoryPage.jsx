import HistoryPanel from './HistoryPanel';

const HistoryPage = ({ 
  history, 
  onHistoryItemClick, 
  onClearHistory, 
  isLoading, 
  currentTopicName,
  onNavigateHome // Function to navigate back to the main page
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold text-blue-600">Search History</h1>
      </header>
      <button 
        onClick={onNavigateHome}
        className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-500 rounded hover:bg-blue-50 transition duration-150"
      >
        &larr; Back to Topic Explorer
      </button>
      <HistoryPanel 
        history={history}
        onHistoryItemClick={onHistoryItemClick}
        onClearHistory={onClearHistory}
        isLoading={isLoading}
        currentTopicName={currentTopicName}
      />
    </div>
  );
};

export default HistoryPage; 