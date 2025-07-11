const Navigation = ({ history, onBackClick, currentPosition }) => {
  // If there's no history or we're at the first item, don't show back button
  if (!history || history.length === 0 || currentPosition <= 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <button 
        onClick={onBackClick}
        className="flex items-center text-blue-400 hover:text-blue-300 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to {history[currentPosition - 1].name}
      </button>
    </div>
  );
};

export default Navigation; 