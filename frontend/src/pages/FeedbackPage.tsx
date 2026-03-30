import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feedbackService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { FeedbackType } from '../types';

export function FeedbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState<FeedbackType>(FeedbackType.Feedback);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({ type, title, description });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">Feedback Submitted!</h2>
          <p className="text-text-secondary">Thank you for your feedback.</p>
          <Link to="/" className="btn btn-primary mt-4">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="page-header">
        <h1 className="page-title">Submit Feedback</h1>
        <p className="page-subtitle">Help us improve by reporting bugs or sharing suggestions</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(Number(e.target.value) as FeedbackType)}
            >
              <option value={FeedbackType.Feedback}>General Feedback</option>
              <option value={FeedbackType.Bug}>Bug Report</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible..."
              required
              maxLength={2000}
              rows={6}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-solid"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          <Link to="/" className="text-link text-link-with-margin">
            Back to Home
          </Link>
        </form>
      </div>
    </div>
  );
}
