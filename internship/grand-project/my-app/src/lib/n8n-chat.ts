export interface PitchResponse {
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  callToAction: string;
}

export function isValidPitchResponse(data: any): data is PitchResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const requiredFields: (keyof PitchResponse)[] = [
    'title', 'description', 'problem', 'solution', 
    'targetMarket', 'revenueModel', 'callToAction'
  ];
  
  // Check if all required fields exist and are non-empty strings
  const hasAllFields = requiredFields.every(field => {
    const value = data[field];
    return typeof value === 'string' && value.trim() !== '';
  });
  
  if (!hasAllFields) {
    console.warn('Missing or invalid fields in pitch response:', {
      hasTitle: !!data.title,
      hasDescription: !!data.description,
      hasProblem: !!data.problem,
      hasSolution: !!data.solution,
      hasTargetMarket: !!data.targetMarket,
      hasRevenueModel: !!data.revenueModel,
      hasCallToAction: !!data.callToAction
    });
  }
  
  return hasAllFields;
}

function parsePitchFromText(text: string): PitchResponse {
  // Default values
  const result: PitchResponse = {
    title: 'App Name',
    description: '',
    problem: 'Not specified',
    solution: 'Not specified',
    targetMarket: 'Not specified',
    revenueModel: 'Not specified',
    callToAction: 'Not specified',
  };

  if (!text) return result;

  try {
    try {
      const jsonData = JSON.parse(text);
      if (jsonData && typeof jsonData === 'object') {
        if (isValidPitchResponse(jsonData)) {
          return jsonData as PitchResponse;
        }
        return {
          title: jsonData.title || result.title,
          description: jsonData.description || jsonData.summary || result.description,
          problem: jsonData.problem || jsonData.issue || result.problem,
          solution: jsonData.solution || jsonData.answer || result.solution,
          targetMarket: jsonData.targetMarket || jsonData.market || result.targetMarket,
          revenueModel: jsonData.revenueModel || jsonData.businessModel || result.revenueModel,
          callToAction: jsonData.callToAction || jsonData.cta || result.callToAction
        };
      }
    } catch (e) {
    }

    const titleMatch = text.match(/\*\*(.*?)\*\*/) || text.match(/^#?\s*(.+?)[\n\r]/);
    if (titleMatch) {
      result.title = titleMatch[1]?.trim() || result.title;
    }

    const extractSection = (pattern: RegExp, fallback: string = '') => {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1]
          .replace(/\*\*/g, '')  
          .replace(/^[\s\-*]+/, '')  
          .trim();
      }
      return fallback;
    };

    result.problem = extractSection(
      /(?:problem|issue)[:\*\s]*([\s\S]*?)(?=\n\s*\*\*(?:solution|target|revenue|call|$)|$)/i,
      result.problem
    );

    result.solution = extractSection(
      /(?:solution|answer)[:\*\s]*([\s\S]*?)(?=\n\s*\*\*(?:target|revenue|call|$)|$)/i,
      result.solution
    );
    
    result.targetMarket = extractSection(
      /(?:target\s*market|audience|market)[:\*\s]*([\s\S]*?)(?=\n\s*\*\*(?:revenue|call|$)|$)/i,
      result.targetMarket
    );

    result.revenueModel = extractSection(
      /(?:revenue\s*model|business\s*model|monetization)[:\*\s]*([\s\S]*?)(?=\n\s*\*\*(?:call|$)|$)/i,
      result.revenueModel
    );

    result.callToAction = extractSection(
      /(?:call\s*to\s*action|cta|next\s*steps|get\s*started)[:\*\s]*([\s\S]*?)(?=\n\s*\*\*|$)/i,
      result.callToAction
    );

    if (!result.description) {
      const firstParagraph = text.split('\n\n').find(p => {
        const trimmed = p.trim();
        return trimmed.length > 0 && !trimmed.startsWith('**') && !trimmed.match(/^[#\-*]/);
      });
      
      if (firstParagraph) {
        result.description = firstParagraph
          .replace(/\*\*/g, '')
          .replace(/^[#\-*\s]+/, '')
          .trim();
      } else {
        result.description = text.replace(/[#*_-]/g, '').substring(0, 150).trim() + '...';
      }
    }
  } catch (error) {
    console.error('Error parsing pitch text:', error);
  }

  return result;
}


export async function getN8nChatResponse(message: string): Promise<PitchResponse | null> {
  if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
    console.error('NEXT_PUBLIC_N8N_WEBHOOK_URL is not set');
    return null;
  }

  console.log('Sending request to n8n with message:', message);
  console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message.trim(),
        message: message.trim(),
        sessionId: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('n8n response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n API error:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText,
      });
      throw new Error(`n8n API error: ${response.status} - ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Raw n8n response:', JSON.stringify(responseData, null, 2));
    
    console.log('Processing n8n response:', JSON.stringify(responseData, null, 2));
    
    if (isValidPitchResponse(responseData)) {
      return responseData as PitchResponse;
    }
    
    if (Array.isArray(responseData) && responseData.length > 0) {
      const firstItem = responseData[0];
      
      if (firstItem.output) {
        if (isValidPitchResponse(firstItem.output)) {
          return firstItem.output;
        }
        if (typeof firstItem.output === 'string') {
          try {
            const parsedOutput = JSON.parse(firstItem.output);
            if (isValidPitchResponse(parsedOutput)) {
              return parsedOutput;
            }
          } catch (e) {
            console.log('Could not parse output as JSON, will try as text');
          }
        }
      }
      
      if (isValidPitchResponse(firstItem)) {
        return firstItem;
      }
      
      if (typeof firstItem === 'string') {
        return parsePitchFromText(firstItem);
      }
    }
    
    if (responseData && typeof responseData === 'object') {
      if (responseData.output) {
        if (isValidPitchResponse(responseData.output)) {
          return responseData.output;
        }
        if (typeof responseData.output === 'string') {
          try {
            const parsedOutput = JSON.parse(responseData.output);
            if (isValidPitchResponse(parsedOutput)) {
              return parsedOutput;
            }
          } catch (e) {
            console.log('Could not parse output as JSON, will try as text');
            return parsePitchFromText(responseData.output);
          }
        }
      }
      
      if (isValidPitchResponse(responseData)) {
        return responseData as PitchResponse;
      }
    }
    
    console.warn('Could not find valid pitch data in response, trying to parse as text');
    const pitchText = typeof responseData === 'string' 
      ? responseData 
      : JSON.stringify(responseData);
    
    console.log('Extracted pitch text:', pitchText);
    
    if (pitchText) {
      const pitchTextStr = String(pitchText);
      console.log('Extracted pitch text:', pitchTextStr.substring(0, Math.min(200, pitchTextStr.length)) + (pitchTextStr.length > 200 ? '...' : ''));
      
      let parsedPitch: PitchResponse;
      try {
        const potentialJson = pitchText.trim();
        if ((potentialJson.startsWith('{') && potentialJson.endsWith('}')) || 
            (potentialJson.startsWith('[') && potentialJson.endsWith(']'))) {
          const jsonData = JSON.parse(potentialJson);
          if (isValidPitchResponse(jsonData)) {
            return jsonData;
          }
        }
      } catch (e) {
        console.log('Response is not valid JSON, parsing as text');
      }
      
      parsedPitch = parsePitchFromText(pitchText);
      console.log('Parsed pitch:', JSON.stringify(parsedPitch, null, 2));
      
      const result: PitchResponse = {
        title: parsedPitch.title || 'Untitled Pitch',
        description: parsedPitch.description || `Summary of: ${message}`,
        problem: parsedPitch.problem || 'No problem statement provided.',
        solution: parsedPitch.solution || 'No solution details provided.',
        targetMarket: parsedPitch.targetMarket || 'Target market not specified.',
        revenueModel: parsedPitch.revenueModel || 'Revenue model not specified.',
        callToAction: parsedPitch.callToAction || 'Contact us for more information.'
      };
      
      return result;
    } else {
      console.log('Extracted pitch data:', responseData);
      
      console.warn('Could not extract valid pitch data from response');
      
      return {
        title: 'Generated Pitch',
        description: `Here's a pitch for: ${message}`,
        problem: `The problem that ${message} solves...`,
        solution: `How ${message} provides value...`,
        targetMarket: 'Your target customers...',
        revenueModel: 'How this will make money...',
        callToAction: 'What you want the user to do next...'
      };
    }
  } catch (error) {
    console.error('Error in getN8nChatResponse:', error);
    return null;
  }
}

export async function generatePitch(idea: string): Promise<PitchResponse> {
  console.log('getPitchFromN8n called with idea:', idea);
  const response = await getN8nChatResponse(idea);
  
  if (!response) {
    throw new Error('Failed to generate pitch');
  }
  
  return response;
}
