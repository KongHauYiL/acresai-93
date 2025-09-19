
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
    const { topic, count = 5 } = await req.json();

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
            content: `You are a quiz generator. Generate exactly ${count} questions about "${topic}". Return a JSON array where each question has this exact format:
            {
              "id": "unique_id_here",
              "question_text": "The question text",
              "question_type": "multiple_choice|true_false|short_answer",
              "options": ["option1", "option2", "option3", "option4"] (only for multiple_choice),
              "correct_answer": "the correct answer",
              "difficulty": "easy|medium|hard"
            }
            
            Make questions engaging and educational. For multiple choice, include 4 options. For true/false, correct_answer should be "true" or "false". For short_answer, accept reasonable variations.`
          },
          { role: 'user', content: `Generate ${count} questions about ${topic}` }
        ],
      }),
    });

    const data = await response.json();
    let questions;
    
    try {
      questions = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, create a fallback question
      questions = [{
        id: "fallback_1",
        question_text: `What is an interesting fact about ${topic}?`,
        question_type: "short_answer",
        correct_answer: "Various answers accepted",
        difficulty: "medium"
      }];
    }

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
