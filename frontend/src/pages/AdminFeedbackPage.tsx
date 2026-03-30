import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feedbackService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { type Feedback, FeedbackStatus } from '../types';

const statusLabels: Record<FeedbackStatus, string> = {
  [FeedbackStatus.Open]: 'Open',
  [FeedbackStatus.InProgress]: 'In Progress',
  [FeedbackStatus.Resolved]: 'Resolved',
  [FeedbackStatus.Closed]: 'Closed',
};

const statusColors: Record<FeedbackStatus, string> = {
  [FeedbackStatus.Open]: 'tag-red',
  [FeedbackStatus.InProgress]: 'tag-blue',
  [FeedbackStatus.Resolved]: 'tag-green',
  [FeedbackStatus.Closed]: 'tag',
};

export function AdminFeedbackPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
      return;
    }
    loadFeedbacks();
  }, [isAuthenticated, user]);

  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch {
      setError('Failed to load feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: FeedbackStatus) => {
    try {
      const updated = await feedbackService.updateFeedbackStatus(id, { status });
      setFeedbacks(feedbacks.map(f => f.id === id ? updated : f));
    } catch {
      setError('Failed to update status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner spinner-lg"></div>
        <p className="text-text-secondary">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Feedback Management</h1>
          <p className="page-subtitle">Review and manage user feedback</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>

      {error && (
        <div className="alert-error mb-4">
          {error}
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary">No feedback submissions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className={`card feedback-card ${feedback.type === 0 ? 'bug' : 'feedback'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`tag ${feedback.type === 0 ? 'tag-red' : 'tag-blue'}`}>
                    {feedback.type === 0 ? 'Bug' : 'Feedback'}
                  </span>
                  <span className={`tag ${statusColors[feedback.status]}`}>
                    {statusLabels[feedback.status]}
                  </span>
                </div>
                <span className="text-sm text-text-muted">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2">{feedback.title}</h3>
              <p className="text-text-secondary text-sm mb-3">{feedback.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-surface-soft">
                <span className="text-sm text-text-muted">
                  Submitted by: <span className="text-text-primary">{feedback.username}</span>
                </span>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-secondary">Status:</label>
                  <select
                    className="input py-2 px-3 text-sm w-auto"
                    value={feedback.status}
                    onChange={(e) => handleStatusChange(feedback.id, Number(e.target.value) as FeedbackStatus)}
                  >
                    {Object.values(FeedbackStatus).filter(v => typeof v === 'number').map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status as FeedbackStatus]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
