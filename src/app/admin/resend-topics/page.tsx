'use client';

import { useState, useEffect } from 'react';
import { useResendTopics } from '@/app/_lib/hooks/useResendTopics';
import type { CreateTopicInput } from '@/lib/resend/topics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function ResendTopicsPage() {
  const { topics, loading, error, listTopics, createTopic, updateTopic, deleteTopic } = useResendTopics();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTopicInput>({
    name: '',
    description: '',
    default_subscription: 'opt_out',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    listTopics();
  }, [listTopics]);

  const handleReset = () => {
    setFormData({ name: '', description: '', default_subscription: 'opt_out' });
    setEditingId(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name.trim()) {
      setSubmitError('Topic name is required');
      return;
    }

    try {
      if (editingId) {
        await updateTopic({ id: editingId, ...formData });
        setSuccessMessage('Topic updated successfully');
      } else {
        await createTopic(formData);
        setSuccessMessage('Topic created successfully');
      }
      handleReset();
      await listTopics();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save topic');
    }
  };

  const handleEdit = (topic: any) => {
    setFormData({
      name: topic.name,
      description: topic.description || '',
      default_subscription: topic.default_subscription,
    });
    setEditingId(topic.id);
    setSubmitError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      await deleteTopic(id);
      setSuccessMessage('Topic deleted successfully');
      await listTopics();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to delete topic');
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="rounded-lg hover:bg-gray-100 p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-bold">Resend Topics</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">
          {editingId ? 'Edit Topic' : 'Create New Topic'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Product Updates, Promotional Emails"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe what this topic is for"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Subscription</label>
            <select
              value={formData.default_subscription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  default_subscription: e.target.value as 'opt_in' | 'opt_out',
                })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="opt_out">Opt-out (subscribed by default)</option>
              <option value="opt_in">Opt-in (unsubscribed by default)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Topic' : 'Create Topic'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Topics ({topics.length})</h2>

        {loading && <p className="text-gray-500">Loading topics...</p>}

        {!loading && topics.length === 0 && (
          <p className="text-gray-500">No topics created yet. Create one to get started!</p>
        )}

        {!loading && topics.length > 0 && (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                  {topic.description && (
                    <p className="mt-1 text-sm text-gray-600">{topic.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    ID: {topic.id} · Default: {topic.default_subscription === 'opt_in' ? 'Opt-in' : 'Opt-out'}
                    {topic.created_at && ` · Created: ${new Date(topic.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(topic)}
                    className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100"
                    title="Edit topic"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="rounded-lg border border-red-300 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    title="Delete topic"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
