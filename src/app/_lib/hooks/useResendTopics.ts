import { useState, useCallback } from 'react';
import type { Topic, CreateTopicInput, UpdateTopicInput } from '@/lib/resend/topics';

interface UseResendTopicsReturn {
  loading: boolean;
  error: string | null;
  topics: Topic[];
  createTopic: (input: CreateTopicInput) => Promise<Topic>;
  getTopic: (id: string) => Promise<Topic | null>;
  updateTopic: (input: UpdateTopicInput) => Promise<Topic>;
  deleteTopic: (id: string) => Promise<boolean>;
  listTopics: () => Promise<Topic[]>;
}

export function useResendTopics(): UseResendTopicsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  const createTopic = useCallback(async (input: CreateTopicInput): Promise<Topic> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resend/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create topic');
      }

      const data = await response.json();
      setTopics((prev) => [...prev, data.data]);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopic = useCallback(async (id: string): Promise<Topic | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resend/topics/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        const data = await response.json();
        throw new Error(data.error || 'Failed to retrieve topic');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTopic = useCallback(async (input: UpdateTopicInput): Promise<Topic> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resend/topics/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update topic');
      }

      const data = await response.json();
      setTopics((prev) =>
        prev.map((t) => (t.id === input.id ? data.data : t))
      );
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTopic = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resend/topics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete topic');
      }

      setTopics((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listTopics = useCallback(async (): Promise<Topic[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resend/topics');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to list topics');
      }

      const data = await response.json();
      setTopics(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    topics,
    createTopic,
    getTopic,
    updateTopic,
    deleteTopic,
    listTopics,
  };
}
