
const OPENAI_API_KEY = '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';

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options?: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const generateQuestions = async (
  topic: string, 
  count: number = 15,
  onProgress?: (progress: number) => void
): Promise<Question[]> => {
  try {
    if (onProgress) onProgress(10);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a quiz generator. Generate exactly ${count} questions about "${topic}". Return ONLY a valid JSON array where each question has this exact format:
            {
              "id": "unique_id_here",
              "question_text": "The question text",
              "question_type": "multiple_choice|true_false",
              "options": ["option1", "option2", "option3", "option4"] (only for multiple_choice),
              "correct_answer": "the correct answer",
              "difficulty": "easy|medium|hard"
            }
            
            Make questions engaging and educational. For multiple choice, include 4 options. For true/false, correct_answer should be "true" or "false". Mix question types evenly.`
          },
          { role: 'user', content: `Generate ${count} questions about ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (onProgress) onProgress(50);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (onProgress) onProgress(75);

    let questions;
    try {
      const content = data.choices[0].message.content.trim();
      // Remove any markdown code block formatting
      const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      questions = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse questions:', e);
      // Fallback questions
      questions = Array.from({ length: count }, (_, i) => ({
        id: `fallback_${i + 1}`,
        question_text: `What is true about ${topic}? (Question ${i + 1})`,
        question_type: "true_false" as const,
        correct_answer: "true",
        difficulty: "medium" as const
      }));
    }

    if (onProgress) onProgress(100);

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return fallback questions
    return Array.from({ length: count }, (_, i) => ({
      id: `fallback_${i + 1}`,
      question_text: `What is true about ${topic}? (Question ${i + 1})`,
      question_type: "true_false" as const,
      correct_answer: "true",
      difficulty: "medium" as const
    }));
  }
};

export const checkAnswer = (userAnswer: string, correctAnswer: string, questionType: string): { isCorrect: boolean; explanation: string } => {
  const userAnswerLower = userAnswer.toLowerCase().trim();
  const correctAnswerLower = correctAnswer.toLowerCase().trim();
  
  let isCorrect = false;
  
  if (questionType === 'multiple_choice' || questionType === 'true_false') {
    isCorrect = userAnswerLower === correctAnswerLower;
  }
  
  const explanation = isCorrect 
    ? `Correct! ${correctAnswer}` 
    : `The correct answer is: ${correctAnswer}`;
    
  return { isCorrect, explanation };
};
