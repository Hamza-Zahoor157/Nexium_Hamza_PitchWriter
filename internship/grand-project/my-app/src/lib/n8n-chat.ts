export interface PitchResponse {
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  callToAction: string;
}

function parsePitchFromText(text: string): PitchResponse {
  // Default values
  const result: PitchResponse = {
    title: 'Untitled Pitch',
    description: '',
    problem: 'Not specified',
    solution: 'Not specified',
    targetMarket: 'Not specified',
    revenueModel: 'Not specified',
    callToAction: 'Not specified',
  };

  try {
    // Extract title (first line after the first ** or the first line)
    const titleMatch = text.match(/\*\*(.*?)\*\*/) || text.match(/^(.+?)[\n\r]/);
    if (titleMatch) {
      result.title = titleMatch[1]?.trim() || result.title;
    }

    // Extract problem (between **Problem:** and **Solution:**)
    const problemMatch = text.match(/\*\*Problem:\*\*([\s\S]*?)(?=\*\*Solution:|$)/i);
    if (problemMatch) {
      result.problem = problemMatch[1].trim();
    }

    // Extract solution (between **Solution:** and next header or end)
    const solutionMatch = text.match(/\*\*Solution:\*\*([\s\S]*?)(?=\*\*\w+:|$)/i);
    if (solutionMatch) {
      result.solution = solutionMatch[1].trim();
    }

    // Extract target market (if present)
    const targetMarketMatch = text.match(/\*\*Target Market:\*\*([\s\S]*?)(?=\*\*\w+:|$)/i);
    if (targetMarketMatch) {
      result.targetMarket = targetMarketMatch[1].trim();
    }

    // Extract revenue model (if present)
    const revenueModelMatch = text.match(/\*\*Revenue Model:\*\*([\s\S]*?)(?=\*\*\w+:|$)/i);
    if (revenueModelMatch) {
      result.revenueModel = revenueModelMatch[1].trim();
    }

    // Extract call to action (if present)
    const ctaMatch = text.match(/\*\*Call to Action:\*\*([\s\S]*?)(?=\*\*\w+:|$)/i);
    if (ctaMatch) {
      result.callToAction = ctaMatch[1].trim();
    }

    // Use the first paragraph as description if not found elsewhere
    if (!result.description) {
      const firstParagraph = text.split('\n\n').find(p => p.trim().length > 0);
      if (firstParagraph) {
        result.description = firstParagraph.replace(/\*\*/g, '').trim();
      }
    }
  } catch (error) {
    console.error('Error parsing pitch text:', error);
  }

  return result;
}

/**
 * Sends a message to the n8n chat workflow and returns the pitch response
 * @param message The startup idea or message to send to n8n
 * @returns Promise with the pitch response or null if failed
 */
export async function getN8nChatResponse(message: string): Promise<PitchResponse | null> {
  if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
    console.error('NEXT_PUBLIC_N8N_WEBHOOK_URL is not set');
    return null;
  }

  console.log('Sending request to n8n with message:', message);
  console.log('Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);

  // Add a timeout to the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message.trim(), // AI Agent node expects 'chatInput' field
        message: message.trim(),   // Keep for backward compatibility
        sessionId: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('n8n response status:', response.status);
    
    // Define the response data type
    let data: Partial<PitchResponse> = {};
    
    try {
      // First check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n API error:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
        });
        throw new Error(`n8n API error: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response as JSON
      const responseData = await response.json();
      console.log('Raw n8n response:', responseData);
      
      // Extract the data based on the response format
      if (Array.isArray(responseData) && responseData.length > 0) {
        // Handle n8n format with response.output
        if (responseData[0]?.response?.output) {
          data = responseData[0].response.output;
        } else {
          // Use the first item directly if it's an array
          data = responseData[0];
        }
      } else if (responseData && typeof responseData === 'object') {
        // Use the response directly if it's an object
        data = responseData;
      } else {
        throw new Error('Unexpected response format from n8n');
      }
      
      console.log('Extracted pitch data:', data);
      
      // Validate the extracted data has required fields
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from n8n');
      }
      
      // Ensure all required fields are present with proper types
      const requiredFields: (keyof PitchResponse)[] = [
        'title', 'description', 'problem', 'solution', 
        'targetMarket', 'revenueModel', 'callToAction'
      ];
      
      // Create a new PitchResponse with default values
      const validatedData: PitchResponse = {
        title: data.title || 'Untitled',
        description: data.description || 'No description available',
        problem: data.problem || 'Not specified',
        solution: data.solution || 'Not specified',
        targetMarket: data.targetMarket || 'Not specified',
        revenueModel: data.revenueModel || 'Not specified',
        callToAction: data.callToAction || 'Not specified'
      };
      
      return validatedData;
    } catch (error) {
      console.error('Error processing n8n response:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in getN8nChatResponse:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Type guard to validate if an object matches our PitchResponse interface
 */
function isValidPitchResponse(data: any): data is PitchResponse {
  const requiredFields: (keyof PitchResponse)[] = [
    'title', 'description', 'problem', 'solution', 
    'targetMarket', 'revenueModel', 'callToAction'
  ];
  
  return (
    data &&
    typeof data === 'object' &&
    requiredFields.every(field => 
      typeof data[field] === 'string' && data[field].trim() !== ''
    )
  );
}

/**
 * Gets a pitch from n8n chat workflow with error handling and fallback
 * @param idea The startup idea to generate a pitch for
 * @returns Promise with the pitch response
 */
export async function generatePitch(idea: string): Promise<PitchResponse> {
  console.log('getPitchFromN8n called with idea:', idea);
  const response = await getN8nChatResponse(idea);
  
  if (!response) {
    throw new Error('Failed to generate pitch');
  }
  
  return response;
}
