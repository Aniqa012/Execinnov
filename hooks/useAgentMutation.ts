import { useMutation } from '@tanstack/react-query';

export interface AgentQuestion {
  question: string;
  answer: string;
}

export interface AgentRequest {
  toolId: string;
  questions: AgentQuestion[];
}

export interface AgentResponse {
  response: string;
}

async function submitToAgent(data: AgentRequest): Promise<AgentResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate response');
  }

  return response.json();
}

export function useAgentMutation() {
  return useMutation({
    mutationFn: submitToAgent,
    onError: (error) => {
      console.error('Agent submission error:', error);
    },
  });
} 