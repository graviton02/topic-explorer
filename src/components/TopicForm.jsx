import { useState } from 'react';

const TopicForm = ({ onTopicSubmit, isLoading, className = '' }) => {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!topic || topic.trim() === '') {
      setError('Please enter a valid topic');
      return;
    }
    
    // Clear error if valid
    setError('');
    
    // Call the parent component's handler
    onTopicSubmit(topic);
    
    // Clear the input after submission
    setTopic('');
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            id="topic-input"
            className={`w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className} ${error ? 'border-red-500' : ''}`}
            placeholder="Enter any topic (e.g., Artificial Intelligence)"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Explore'}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default TopicForm; 