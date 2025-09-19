
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answer, questionId, correctAnswer } = await req.json();

    // Simple exact match for true/false and multiple choice
    if (correctAnswer === "true" || correctAnswer === "false") {
      const isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();
      return new Response(JSON.stringify({
        isCorrect,
        explanation: isCorrect 
          ? "Correct!" 
          : `The correct answer is ${correctAnswer}.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For other answers, use AI to check
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are checking quiz answers. Compare the user answer with the correct answer. Be somewhat lenient with spelling and phrasing. Return JSON with "isCorrect" (boolean) and "explanation" (string explaining why it\'s right or wrong and what the correct answer is).'
          },
          {
            role: 'user',
            content: `User answer: "${answer}"\nCorrect answer: "${correctAnswer}"\nIs the user answer correct?`
          }
        ],
      }),
    });

    const data = await response.json();
    let result;
    
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback if parsing fails
      const isCorrect = answer.toLowerCase().includes(correctAnswer.toLowerCase()) || 
                       correctAnswer.toLowerCase().includes(answer.toLowerCase());
      result = {
        isCorrect,
        explanation: isCorrect ? "Correct!" : `The correct answer is: ${correctAnswer}`
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    return new Response(JSON.stringify({ 
      isCorrect: false, 
      explanation: "Error checking answer. Please try again." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
