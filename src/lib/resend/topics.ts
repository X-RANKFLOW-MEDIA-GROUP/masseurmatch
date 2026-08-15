import { Resend } from 'resend';

export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  default_subscription?: 'opt_in' | 'opt_out';
  created_at?: string;
}

export interface CreateTopicInput {
  name: string;
  description?: string;
  default_subscription?: 'opt_in' | 'opt_out';
}

export interface UpdateTopicInput {
  id: string;
  name?: string;
  description?: string;
}

class ResendTopicsService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  /**
   * Create a new topic for email subscriptions
   */
  async createTopic(input: CreateTopicInput): Promise<Topic> {
    try {
      const response = await this.resend.topics.create({
        name: input.name,
        description: input.description,
        defaultSubscription: input.default_subscription || 'opt_out',
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create topic');
      }

      return {
        id: response.data?.id || '',
        name: input.name,
        description: input.description,
        default_subscription: input.default_subscription || 'opt_out',
      };
    } catch (error) {
      console.error('Failed to create Resend topic:', error);
      throw error;
    }
  }

  /**
   * Retrieve a topic by ID
   */
  async getTopic(topicId: string): Promise<Topic | null> {
    try {
      const response = await this.resend.topics.get(topicId);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to retrieve topic');
      }

      if (!response.data) {
        return null;
      }

      return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        default_subscription: response.data.default_subscription as 'opt_in' | 'opt_out',
        created_at: response.data.created_at,
      };
    } catch (error) {
      console.error('Failed to retrieve Resend topic:', error);
      throw error;
    }
  }

  /**
   * Update a topic. Resend does not allow changing default subscription after creation.
   */
  async updateTopic(input: UpdateTopicInput): Promise<Topic> {
    try {
      const response = await this.resend.topics.update({
        id: input.id,
        name: input.name,
        description: input.description,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update topic');
      }

      const topic = await this.getTopic(input.id);
      if (!topic) {
        throw new Error('Topic not found after update');
      }

      return topic;
    } catch (error) {
      console.error('Failed to update Resend topic:', error);
      throw error;
    }
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId: string): Promise<boolean> {
    try {
      const response = await this.resend.topics.remove(topicId);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete topic');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete Resend topic:', error);
      throw error;
    }
  }

  /**
   * List all topics
   * Note: Resend SDK may not have a list method, so this is a helper
   */
  async listTopics(): Promise<Topic[]> {
    try {
      // Note: You may need to implement this based on Resend's actual API
      // This is a placeholder that would need to be updated based on SDK availability
      console.warn('Topic listing not yet implemented in Resend SDK');
      return [];
    } catch (error) {
      console.error('Failed to list Resend topics:', error);
      throw error;
    }
  }
}

export function createResendTopicsService(apiKey?: string): ResendTopicsService {
  const key = apiKey || process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new ResendTopicsService(key);
}

export default ResendTopicsService;
