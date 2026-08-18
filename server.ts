import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Google GenAI client lazily with telemetry header
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Using smart AI fallbacks.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Procure Diary – Executive CRM' });
  });

  // AI Endpoint: General Dairy Procurement Advice & Executive Copilot
  app.post('/api/ai/dairy-advice', async (req, res) => {
    try {
      const { query, language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          advice: language === 'mr'
            ? `दूध संकलन वाढवण्यासाठी गवळी व शेतकऱ्यांशी नियमित गोठा भेटी, योग्य फॅट/SNF दर समजावून सांगणे, वेळेवर उचल (Advance) नियोजन व दर्जेदार पशुखाद्य पुरवठा अत्यंत उपयुक्त ठरतो.`
            : `To maximize milk procurement, prioritize regular gavali visits, transparent Fat/SNF rate charts, timely advance disbursement, and high-protein cattle feed support.`,
        });
      }

      const prompt = `You are "Procure AI Copilot", an elite Milk Procurement Executive assistant and field advisor for dairy procurement professionals in India (specifically Maharashtra).
The user is asking: "${query}"

Provide practical, highly actionable, field-tested advice for a milk procurement executive (दूध संकलन अधिकारी / गवळी व्यवस्थापक).
Focus on real procurement realities:
1. Gavali (गवळी) negotiations, commission rates, and retention against competitors.
2. Cow / Buffalo Fat (फॅट) & SNF troubleshooting (diet, bypass fat, mineral mixture, clean milking).
3. Field visit strategy, route optimization, chilling center quality testing, and dispute resolution.
4. Professional WhatsApp broadcast message templates if requested.

Respond in ${language === 'mr' ? 'fluent, professional, respectful Marathi (मराठी)' : 'clear, professional English'}. Format with clean bullet points and concise paragraphs. Avoid mentioning any specific commercial brand name.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      const advice = response.text || (language === 'mr' ? 'माहिती उपलब्ध आहे.' : 'Advice generated.');
      res.json({ advice });
    } catch (err: any) {
      console.error('Error in dairy-advice:', err);
      res.status(500).json({ error: err.message || 'AI advice error' });
    }
  });

  // AI Endpoint: Summarize Call
  app.post('/api/ai/summarize-call', async (req, res) => {
    try {
      const { farmerName, purpose, status, discussion, language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          summary: language === 'mr'
            ? `शेतकरी ${farmerName} यांच्याशी '${purpose}' विषयावर चर्चा झाली. कॉल स्थिती: ${status}.`
            : `Discussion with farmer ${farmerName} on ${purpose}. Status: ${status}.`,
          actionItems: [
            language === 'mr' ? 'फॉलो-अप तारीख तपासा आणि आवश्यक माहिती पाठवा.' : 'Check follow-up schedule and send required info.',
          ],
          suggestedFollowUpDays: 2,
          priority: status === 'Follow-up Required' ? 'High' : 'Medium',
        });
      }

      const prompt = `You are an expert Dairy Procurement & Field Operations AI Assistant for a milk cooperative in Maharashtra, India.
Generate a structured call summary in ${language === 'mr' ? 'Marathi (मराठी)' : 'English'}.

Farmer Name: ${farmerName}
Call Purpose: ${purpose}
Call Status: ${status}
Discussion Details: ${discussion}

Respond strictly in JSON format with the following structure:
{
  "summary": "Short 1-2 sentence executive summary of the call",
  "actionItems": ["Action 1", "Action 2"],
  "suggestedFollowUpDays": 2,
  "priority": "High" or "Medium" or "Low",
  "detectedSubject": "Key topic"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedFollowUpDays: { type: Type.INTEGER },
              priority: { type: Type.STRING },
              detectedSubject: { type: Type.STRING },
            },
            required: ['summary', 'actionItems', 'suggestedFollowUpDays', 'priority'],
          },
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in summarize-call:', err);
      res.status(500).json({ error: err.message || 'AI summarization error' });
    }
  });

  // AI Endpoint: Parse Voice Note / Raw Spoken Text into Dairy Form Fields
  app.post('/api/ai/parse-voice-note', async (req, res) => {
    try {
      const { rawText, language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          discussion: rawText,
          infoGiven: language === 'mr' ? 'माहिती दिली.' : 'Information shared.',
          pendingWork: '',
          purpose: 'Milk Collection',
          status: 'Completed',
        });
      }

      const prompt = `You are a dairy field assistant. Convert this transcribed field officer speech/note into structured dairy call register fields in ${language === 'mr' ? 'Marathi' : 'English'}:
Spoken Note: "${rawText}"

Allowed Purposes: Milk Collection, Rate Information, Complaint, Payment, Advance, RT, Milk Quality, Visit, New Producer, Collection Increase, Animal Information, Other.
Allowed Statuses: Completed, Not Received, Switched Off, Busy, Out of Coverage, Call Back Later, Follow-up Required, Invalid Number, Wrong Number, Other.

Respond in JSON:
{
  "discussion": "Clean structured description of conversation",
  "infoGiven": "Key advice or rates given by officer",
  "pendingWork": "Any task that needs to be done later",
  "purpose": "One of allowed purposes",
  "status": "One of allowed statuses"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              discussion: { type: Type.STRING },
              infoGiven: { type: Type.STRING },
              pendingWork: { type: Type.STRING },
              purpose: { type: Type.STRING },
              status: { type: Type.STRING },
            },
            required: ['discussion', 'infoGiven', 'pendingWork', 'purpose', 'status'],
          },
        },
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (err: any) {
      console.error('Error in parse-voice-note:', err);
      res.status(500).json({ error: err.message || 'Voice parser error' });
    }
  });

  // AI Endpoint: Analyze Route Performance
  app.post('/api/ai/analyze-route', async (req, res) => {
    try {
      const { routeName, farmersCount, totalDailyMilk, callsData, language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
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
        });
      }

      const prompt = `Analyze dairy collection route "${routeName}" with ${farmersCount} registered farmers and total daily volume of ${totalDailyMilk} Liters.
Recent calls count on this route: ${callsData?.length || 0}.
Language: ${language === 'mr' ? 'Marathi (मराठी)' : 'English'}.

Respond in JSON:
{
  "routeSummary": "Overview analysis of route health and milk density",
  "milkProcurementTips": ["Tip 1", "Tip 2", "Tip 3"],
  "atRiskProducers": ["List of risk factors / farmer concerns"],
  "growthOpportunities": ["Opportunity 1", "Opportunity 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              routeSummary: { type: Type.STRING },
              milkProcurementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              atRiskProducers: { type: Type.ARRAY, items: { type: Type.STRING } },
              growthOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['routeSummary', 'milkProcurementTips', 'atRiskProducers', 'growthOpportunities'],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Error in analyze-route:', err);
      res.status(500).json({ error: err.message || 'Route analysis error' });
    }
  });

  // In-memory Server-side Task Store for multi-device sync
  let serverTasksStore: any[] = [];

  // API: Get All Tasks
  app.get('/api/tasks', (_req, res) => {
    res.json({ tasks: serverTasksStore });
  });

  // API: Sync Tasks across all devices
  app.post('/api/tasks/sync', (req, res) => {
    try {
      const { tasks } = req.body;
      if (Array.isArray(tasks)) {
        // Merge without losing history
        const existingMap = new Map(serverTasksStore.map(t => [t.id, t]));
        for (const incoming of tasks) {
          const existing = existingMap.get(incoming.id);
          if (!existing) {
            existingMap.set(incoming.id, incoming);
          } else {
            // Merge work logs and timeline to ensure zero loss
            const combinedWorkLogs = [...(existing.workLogs || [])];
            const existingLogIds = new Set(combinedWorkLogs.map((l: any) => l.id));
            for (const log of incoming.workLogs || []) {
              if (!existingLogIds.has(log.id)) {
                combinedWorkLogs.push(log);
                existingLogIds.add(log.id);
              }
            }

            const combinedTimeline = [...(existing.timeline || [])];
            const existingTimeIds = new Set(combinedTimeline.map((t: any) => t.id));
            for (const timeItem of incoming.timeline || []) {
              if (!existingTimeIds.has(timeItem.id)) {
                combinedTimeline.push(timeItem);
                existingTimeIds.add(timeItem.id);
              }
            }

            const combinedAudit = [...(existing.auditTrail || [])];
            const existingAuditIds = new Set(combinedAudit.map((a: any) => a.id));
            for (const auditItem of incoming.auditTrail || []) {
              if (!existingAuditIds.has(auditItem.id)) {
                combinedAudit.push(auditItem);
                existingAuditIds.add(auditItem.id);
              }
            }

            existingMap.set(incoming.id, {
              ...existing,
              ...incoming,
              workLogs: combinedWorkLogs,
              timeline: combinedTimeline,
              auditTrail: combinedAudit,
              completionReport: incoming.completionReport || existing.completionReport,
              reopenHistory: incoming.reopenHistory || existing.reopenHistory || [],
            });
          }
        }
        serverTasksStore = Array.from(existingMap.values());
      }
      res.json({ success: true, count: serverTasksStore.length, tasks: serverTasksStore });
    } catch (err: any) {
      console.error('Error in /api/tasks/sync:', err);
      res.status(500).json({ error: err.message || 'Sync error' });
    }
  });

  // AI Endpoint: Task Intelligence (Summary, Timeline Analysis, Next Actions, Duplicate Detection)
  app.post('/api/ai/task-intelligence', async (req, res) => {
    try {
      const { task, action = 'full_analysis', language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          workSummary: language === 'mr'
            ? `या कामावर एकूण ${task?.workLogs?.length || 0} रोजनिशी नोंदी व ${task?.timeline?.length || 0} घटना घडल्या आहेत.`
            : `Task has ${task?.workLogs?.length || 0} work logs and ${task?.timeline?.length || 0} timeline events.`,
          timelineSummary: language === 'mr'
            ? 'कामाची सुरुवात होऊन प्रत्यक्ष भेटी व कॉल्सद्वारे पाठपुरावा सुरू आहे.'
            : 'Task initiated with on-field calls and visits underway.',
          nextActionRecommendation: language === 'mr'
            ? 'गवळ्यांशी प्रत्यक्ष संपर्क साधून तक्रारीचे अंतिम निवारण नोंदवावे.'
            : 'Contact the gavali and close out pending issues.',
          pendingWorkSuggestions: [
            language === 'mr' ? 'संकलन केंद्र स्लिप फेरतपासणी' : 'Cross-verify collection slips',
            language === 'mr' ? 'अंतिम पूर्णता अहवाल तयार करणे' : 'Prepare final completion report',
          ],
          completionSummary: language === 'mr'
            ? 'सर्व बाबींची पडताळणी पूर्ण झाली असून काम पूर्णतेसाठी सज्ज आहे.'
            : 'All items verified and ready for completion sign-off.',
        });
      }

      const prompt = `You are an expert Milk Procurement Executive AI Copilot. Analyze this specific procurement field task:
Task ID: ${task.id}
Title: ${task.taskTitle}
Category: ${task.taskCategory}
Gavali: ${task.relatedGavali} (${task.gavaliCode}) - Mobile: ${task.mobileNumber}
Route: ${task.route}, Village: ${task.village}
Priority: ${task.priority}, Status: ${task.status}
Notes: ${task.notes || 'N/A'}
Work Logs Count: ${task.workLogs?.length || 0}
Work Logs: ${JSON.stringify((task.workLogs || []).slice(-5), null, 2)}
Timeline Events: ${JSON.stringify((task.timeline || []).slice(-5), null, 2)}

Provide a concise, professional executive response in ${language === 'mr' ? 'Marathi (मराठी)' : 'English'} for Milk Procurement operations.
Return valid JSON with these keys:
{
  "workSummary": "2-3 sentence executive summary of work performed so far",
  "timelineSummary": "Key chronological milestones summary",
  "nextActionRecommendation": "Specific, actionable next step for the procurement officer",
  "pendingWorkSuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "completionSummary": "Summary of resolution or readiness for completion",
  "riskAssessment": "Low, Medium or High risk note"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workSummary: { type: Type.STRING },
              timelineSummary: { type: Type.STRING },
              nextActionRecommendation: { type: Type.STRING },
              pendingWorkSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              completionSummary: { type: Type.STRING },
              riskAssessment: { type: Type.STRING },
            },
            required: [
              'workSummary',
              'timelineSummary',
              'nextActionRecommendation',
              'pendingWorkSuggestions',
              'completionSummary',
              'riskAssessment',
            ],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Error in task-intelligence:', err);
      res.status(500).json({ error: err.message || 'Task intelligence error' });
    }
  });

  // AI Endpoint: Analyze Pending Tasks
  app.post('/api/ai/analyze-tasks', async (req, res) => {
    try {
      const { tasks, language = 'mr' } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          recommendations: [
            language === 'mr'
              ? 'थकीत कामांना प्राधान्य द्या आणि संबंधित अधिकाऱ्यांना अलर्ट पाठवा.'
              : 'Prioritize overdue items and assign follow-up tasks.',
          ],
          bottlenecks: [
            language === 'mr' ? 'कागदपत्रे व पशुखाद्य पुरवठा विलंब.' : 'Documentation and cattle feed supply delays.',
          ],
          urgencyAssessment: language === 'mr' ? 'मध्यम ते उच्च प्राधान्य.' : 'Medium to High Urgency.',
        });
      }

      const prompt = `Analyze these dairy pending tasks (${tasks.length} items):
${JSON.stringify(tasks.slice(0, 10), null, 2)}
Language: ${language === 'mr' ? 'Marathi (मराठी)' : 'English'}.

Respond in JSON:
{
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "bottlenecks": ["Key cause of delays"],
  "urgencyAssessment": "Summary statement of operational risk"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgencyAssessment: { type: Type.STRING },
            },
            required: ['recommendations', 'bottlenecks', 'urgencyAssessment'],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Error in analyze-tasks:', err);
      res.status(500).json({ error: err.message || 'Tasks analysis error' });
    }
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dairy Call Management Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
