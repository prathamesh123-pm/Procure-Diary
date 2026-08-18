export interface AISummaryResponse {
  summary: string;
  actionItems: string[];
  suggestedFollowUpDays?: number;
  priority?: 'High' | 'Medium' | 'Low';
  detectedSubject?: string;
}

export interface AIRouteAnalysisResponse {
  routeSummary: string;
  milkProcurementTips: string[];
  atRiskProducers: string[];
  growthOpportunities: string[];
}

export interface AIPendingTaskAnalysis {
  recommendations: string[];
  bottlenecks: string[];
  urgencyAssessment: string;
}

export const GeminiService = {
  // Summarize Call
  summarizeCall: async (
    farmerName: string,
    purpose: string,
    status: string,
    discussion: string,
    language: 'en' | 'mr' = 'mr'
  ): Promise<AISummaryResponse> => {
    try {
      const res = await fetch('/api/ai/summarize-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerName, purpose, status, discussion, language }),
      });
      if (!res.ok) throw new Error('AI service error');
      return await res.json();
    } catch (err) {
      console.warn('Fallback AI summary:', err);
      return {
        summary: language === 'mr'
          ? `शेतकरी ${farmerName} यांच्याशी '${purpose}' बाबत चर्चा झाली. कॉल स्थिती: ${status}.`
          : `Call with ${farmerName} regarding ${purpose}. Status: ${status}.`,
        actionItems: [
          language === 'mr' ? 'फॉलो-अप तारीख तपासा आणि माहिती पाठवा.' : 'Verify follow-up schedule and send required info.',
        ],
        suggestedFollowUpDays: 2,
        priority: 'Medium',
      };
    }
  },

  // Transcribe / Parse Voice Note or Raw Text
  parseVoiceNotes: async (
    rawText: string,
    language: 'en' | 'mr' = 'mr'
  ): Promise<{
    discussion: string;
    infoGiven: string;
    pendingWork: string;
    purpose: string;
    status: string;
  }> => {
    try {
      const res = await fetch('/api/ai/parse-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, language }),
      });
      if (!res.ok) throw new Error('AI voice parser error');
      return await res.json();
    } catch (err) {
      console.warn('Fallback voice parse:', err);
      return {
        discussion: rawText,
        infoGiven: language === 'mr' ? 'मार्गदर्शन व माहिती दिली.' : 'Information provided.',
        pendingWork: '',
        purpose: 'Milk Collection',
        status: 'Completed',
      };
    }
  },

  // Analyze Route
  analyzeRoute: async (
    routeName: string,
    farmersCount: number,
    totalDailyMilk: number,
    callsData: any[],
    language: 'en' | 'mr' = 'mr'
  ): Promise<AIRouteAnalysisResponse> => {
    try {
      const res = await fetch('/api/ai/analyze-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeName, farmersCount, totalDailyMilk, callsData, language }),
      });
      if (!res.ok) throw new Error('AI route analysis error');
      return await res.json();
    } catch (err) {
      return {
        routeSummary: language === 'mr'
          ? `${routeName} वर सध्या दैनिक ${totalDailyMilk} लिटर संकलन सुरू आहे.`
          : `${routeName} currently generates ${totalDailyMilk} L daily milk.`,
        milkProcurementTips: [
          language === 'mr'
            ? 'अनियमित उत्पादकांशी थेट गोठा भेट संपर्क वाढवा.'
            : 'Schedule on-farm visits for irregular milk suppliers.',
          language === 'mr'
            ? 'उत्पादक बोनस व वेळेवर बिल भरणा स्पष्ट करा.'
            : 'Clarify bonus rates and timely bill payment cycles.',
        ],
        atRiskProducers: [],
        growthOpportunities: [
          language === 'mr'
            ? 'पशुखाद्य व सायलेज सवलत योजना राबवा.'
            : 'Promote subsidized cattle feed and silage programs.',
        ],
      };
    }
  },

  // Analyze Pending Tasks
  analyzeTasks: async (tasks: any[], language: 'en' | 'mr' = 'mr'): Promise<AIPendingTaskAnalysis> => {
    try {
      const res = await fetch('/api/ai/analyze-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, language }),
      });
      if (!res.ok) throw new Error('AI task analysis error');
      return await res.json();
    } catch (err) {
      return {
        recommendations: [
          language === 'mr' ? 'थकीत कामांना प्राधान्य द्या आणि संबंधित अधिकाऱ्यांना अलर्ट पाठवा.' : 'Prioritize overdue items and send alerts.',
        ],
        bottlenecks: [language === 'mr' ? 'कागदपत्रे व पशुखाद्य पुरवठा विलंब.' : 'Documentation and feed distribution delays.'],
        urgencyAssessment: language === 'mr' ? 'मध्यम ते उच्च प्राधान्य.' : 'Medium to High Urgency.',
      };
    }
  },
};
