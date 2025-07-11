const TopicContent = ({ 
  data, 
  onSubtopicClick, 
  onQuestionClick, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-300/20 rounded-lg p-4 bg-gray-100/10 animate-pulse">
          <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
          <div className="h-4 bg-gray-300/30 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300/30 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300/30 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300/30 rounded w-3/4"></div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Related Subtopics</h3>
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-blue-500/30 rounded-md w-24 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Relevant Questions</h3>
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-green-500/30 rounded-md w-36 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no data, don't render anything
  if (!data) return null;

  const { description, subtopics, questions } = data;

  return (
    <div className="space-y-6">
      {/* Description Card */}
      <div className="border border-gray-300/20 rounded-lg p-4 bg-white/90">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Topic Description</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Subtopics */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">{`Related Subtopics (${subtopics.length})`}</h3>
        <div className="flex flex-wrap gap-2">
          {subtopics.map((subtopic, index) => (
            <button
              key={index}
              onClick={() => onSubtopicClick(subtopic)}
              className="bg-blue-200 hover:bg-blue-300 text-blue-800 py-1 px-3 rounded-md text-sm transition"
            >
              {subtopic}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">{`Relevant Questions (${questions.length})`}</h3>
        <div className="flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="bg-green-200 hover:bg-green-300 text-green-800 py-1 px-3 rounded-md text-sm transition"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicContent;