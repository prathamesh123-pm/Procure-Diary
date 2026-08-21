import express from 'express';
import path from 'path';
import fs from 'fs';
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
  let serverActivitiesStore: any[] = [];
  let serverCallHistoryStore: any[] = [];
  let serverDailyReportsStore: any[] = [];
  let serverBackupSnapshots: any[] = [];
  let serverSyncStore: Record<string, any> = {};

  // Rate Chart Server-Side Persistent File Storage
  const DATA_DIR = path.join(process.cwd(), 'data');
  const RATE_CHART_FILE = path.join(DATA_DIR, 'rate_chart_master.json');
  const RATE_HISTORY_FILE = path.join(DATA_DIR, 'rate_chart_history.json');
  const PRODUCER_CALLS_FILE = path.join(DATA_DIR, 'producer_communication_calls.json');
  const PRODUCER_CAMPAIGNS_FILE = path.join(DATA_DIR, 'producer_communication_campaigns.json');

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn('Could not create data dir:', e);
    }
  }

  let serverActiveRateChart: any = null;
  let serverRateChartHistory: any[] = [];
  let serverProducerCallsStore: any[] = [];
  let serverProducerCampaignsStore: any[] = [];

  // Load from disk on startup if exists
  try {
    if (fs.existsSync(RATE_CHART_FILE)) {
      serverActiveRateChart = JSON.parse(fs.readFileSync(RATE_CHART_FILE, 'utf-8'));
    }
    if (fs.existsSync(RATE_HISTORY_FILE)) {
      serverRateChartHistory = JSON.parse(fs.readFileSync(RATE_HISTORY_FILE, 'utf-8'));
    }
    if (fs.existsSync(PRODUCER_CALLS_FILE)) {
      serverProducerCallsStore = JSON.parse(fs.readFileSync(PRODUCER_CALLS_FILE, 'utf-8'));
    }
    if (fs.existsSync(PRODUCER_CAMPAIGNS_FILE)) {
      serverProducerCampaignsStore = JSON.parse(fs.readFileSync(PRODUCER_CAMPAIGNS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Could not read persistent files on startup:', err);
  }

  const saveRateChartToDisk = () => {
    try {
      if (serverActiveRateChart) {
        fs.writeFileSync(RATE_CHART_FILE, JSON.stringify(serverActiveRateChart, null, 2), 'utf-8');
      }
      if (serverRateChartHistory && serverRateChartHistory.length > 0) {
        fs.writeFileSync(RATE_HISTORY_FILE, JSON.stringify(serverRateChartHistory, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Error writing rate chart to disk:', err);
    }
  };

  const saveProducerCallsToDisk = () => {
    try {
      fs.writeFileSync(PRODUCER_CALLS_FILE, JSON.stringify(serverProducerCallsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing producer calls to disk:', err);
    }
  };

  const saveProducerCampaignsToDisk = () => {
    try {
      fs.writeFileSync(PRODUCER_CAMPAIGNS_FILE, JSON.stringify(serverProducerCampaignsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing producer campaigns to disk:', err);
    }
  };

  // API: Get Active Rate Chart
  app.get('/api/rate-chart', (_req, res) => {
    res.json({
      success: true,
      rateChart: serverActiveRateChart,
    });
  });

  // API: Save Rate Chart (with new version and history entry)
  app.post('/api/rate-chart', (req, res) => {
    try {
      const { rateChart, historyEntry } = req.body;
      if (!rateChart) {
        return res.status(400).json({ error: 'rateChart is required' });
      }

      serverActiveRateChart = rateChart;
      if (historyEntry) {
        serverRateChartHistory = [historyEntry, ...serverRateChartHistory.filter(h => h.id !== historyEntry.id)];
        if (serverRateChartHistory.length > 100) serverRateChartHistory.pop();
      }

      saveRateChartToDisk();

      res.json({
        success: true,
        version: rateChart.version,
        versionTag: rateChart.versionTag,
        rateChart: serverActiveRateChart,
      });
    } catch (err: any) {
      console.error('Error saving rate chart:', err);
      res.status(500).json({ error: err.message || 'Failed to save rate chart' });
    }
  });

  // API: Get Rate Chart History
  app.get('/api/rate-chart/history', (_req, res) => {
    res.json({
      success: true,
      history: serverRateChartHistory,
    });
  });

  // API: Restore Rate Chart Version (Admin Rollback)
  app.post('/api/rate-chart/restore', (req, res) => {
    try {
      const { rateChart, historyEntry, restoredFromVersion } = req.body;
      if (!rateChart) {
        return res.status(400).json({ error: 'rateChart payload required' });
      }

      serverActiveRateChart = rateChart;
      if (historyEntry) {
        serverRateChartHistory = [historyEntry, ...serverRateChartHistory.filter(h => h.id !== historyEntry.id)];
      }

      saveRateChartToDisk();

      res.json({
        success: true,
        restoredFromVersion,
        newVersion: rateChart.version,
        rateChart: serverActiveRateChart,
      });
    } catch (err: any) {
      console.error('Error restoring rate chart:', err);
      res.status(500).json({ error: err.message || 'Failed to restore rate chart' });
    }
  });

  // API: Activity Tracking Logger
  app.post('/api/activities/log', (req, res) => {
    try {
      const activity = req.body;
      if (!activity.id) {
        activity.id = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      }
      activity.ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      activity.serverTimestamp = new Date().toISOString();

      serverActivitiesStore.unshift(activity);
      if (serverActivitiesStore.length > 5000) serverActivitiesStore.pop();

      res.json({ success: true, activity });
    } catch (err: any) {
      console.error('Error logging activity on server:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: Get Activities with filtering
  app.get('/api/activities', (req, res) => {
    const { userId, type, date, limit = '200' } = req.query;
    let list = [...serverActivitiesStore];

    if (userId) {
      list = list.filter(a => a.userId === userId);
    }
    if (type) {
      list = list.filter(a => a.activityType === type);
    }
    if (date) {
      list = list.filter(a => a.date === date);
    }

    res.json({
      success: true,
      total: list.length,
      activities: list.slice(0, parseInt(limit as string, 10)),
    });
  });

  // API: Call History Tracking
  app.post('/api/calls/track', (req, res) => {
    try {
      const call = req.body;
      if (!call.id) {
        call.id = `CH-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      }
      call.serverTimestamp = new Date().toISOString();

      const idx = serverCallHistoryStore.findIndex(c => c.id === call.id);
      if (idx >= 0) {
        serverCallHistoryStore[idx] = { ...serverCallHistoryStore[idx], ...call };
      } else {
        serverCallHistoryStore.unshift(call);
      }
      if (serverCallHistoryStore.length > 2000) serverCallHistoryStore.pop();

      res.json({ success: true, call });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/calls/history', (req, res) => {
    const { officerId, date } = req.query;
    let list = [...serverCallHistoryStore];
    if (officerId) list = list.filter(c => c.officerId === officerId);
    if (date) list = list.filter(c => c.date === date);
    res.json({ success: true, calls: list });
  });

  // API: Daily Work Reports
  app.post('/api/reports/daily/save', (req, res) => {
    try {
      const report = req.body;
      if (!report.id) {
        report.id = `DWR-${Date.now()}`;
      }
      const idx = serverDailyReportsStore.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        serverDailyReportsStore[idx] = report;
      } else {
        serverDailyReportsStore.unshift(report);
      }
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/reports/daily', (req, res) => {
    const { userId, date } = req.query;
    let list = [...serverDailyReportsStore];
    if (userId) list = list.filter(r => r.userId === userId);
    if (date) list = list.filter(r => r.date === date);
    res.json({ success: true, reports: list });
  });

  // API: Cloud Backup & Snapshot Manager
  app.post('/api/backup/save', (req, res) => {
    try {
      const snapshot = req.body;
      if (!snapshot.id) {
        snapshot.id = `BK-${Date.now()}`;
      }
      snapshot.serverSavedAt = new Date().toISOString();
      serverBackupSnapshots.unshift(snapshot);
      if (serverBackupSnapshots.length > 50) serverBackupSnapshots.pop();

      res.json({ success: true, snapshotId: snapshot.id, timestamp: snapshot.serverSavedAt });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/backup/latest', (_req, res) => {
    const latest = serverBackupSnapshots[0] || null;
    res.json({ success: true, snapshot: latest });
  });

  app.get('/api/backup/list', (_req, res) => {
    const list = serverBackupSnapshots.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      date: s.date,
      time: s.time,
      version: s.version,
      userName: s.userName,
      deviceName: s.deviceName,
      itemCounts: s.itemCounts,
      sizeBytes: s.sizeBytes,
      backupType: s.backupType,
    }));
    res.json({ success: true, backups: list });
  });

  // API: Producer Communication & Call Tracking
  app.get('/api/producer-communication/calls', (req, res) => {
    try {
      const { date, subject, route, producerCode, status, campaignId } = req.query;
      let list = [...serverProducerCallsStore];

      if (date) list = list.filter(c => c.callDate === date);
      if (subject) list = list.filter(c => c.subject === subject);
      if (route && route !== 'all') list = list.filter(c => c.route === route);
      if (producerCode) list = list.filter(c => c.producerCode === producerCode);
      if (status && status !== 'all') list = list.filter(c => c.status === status);
      if (campaignId) list = list.filter(c => c.campaignId === campaignId);

      res.json({ success: true, count: list.length, calls: list });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/producer-communication/calls', (req, res) => {
    try {
      const call = req.body;
      if (!call.id) {
        call.id = `PCC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      }
      call.serverSavedAt = new Date().toISOString();

      const idx = serverProducerCallsStore.findIndex(c => c.id === call.id);
      if (idx >= 0) {
        serverProducerCallsStore[idx] = { ...serverProducerCallsStore[idx], ...call, updatedAt: new Date().toISOString() };
      } else {
        serverProducerCallsStore.unshift(call);
      }
      saveProducerCallsToDisk();

      res.json({ success: true, call });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/producer-communication/calls/:id', (req, res) => {
    try {
      const { id } = req.params;
      serverProducerCallsStore = serverProducerCallsStore.filter(c => c.id !== id);
      saveProducerCallsToDisk();
      res.json({ success: true, message: 'Call deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/producer-communication/history/:producerCode', (req, res) => {
    try {
      const { producerCode } = req.params;
      const history = serverProducerCallsStore.filter(c => c.producerCode === producerCode);
      res.json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/producer-communication/campaigns', (_req, res) => {
    try {
      res.json({ success: true, campaigns: serverProducerCampaignsStore });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/producer-communication/campaigns', (req, res) => {
    try {
      const campaign = req.body;
      if (!campaign.id) {
        campaign.id = `CMP-${Date.now()}`;
      }
      campaign.serverSavedAt = new Date().toISOString();

      const idx = serverProducerCampaignsStore.findIndex(c => c.id === campaign.id);
      if (idx >= 0) {
        serverProducerCampaignsStore[idx] = { ...serverProducerCampaignsStore[idx], ...campaign, updatedAt: new Date().toISOString() };
      } else {
        serverProducerCampaignsStore.unshift(campaign);
      }
      saveProducerCampaignsToDisk();

      res.json({ success: true, campaign });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Universal Full Cloud Sync across devices
  app.post('/api/sync/full', (req, res) => {
    try {
      const payload = req.body; // contains farmers, calls, tasks, routes, etc.
      if (payload.userId) {
        serverSyncStore[payload.userId] = {
          ...serverSyncStore[payload.userId],
          ...payload,
          lastSyncTime: new Date().toISOString(),
        };
      }
      res.json({ success: true, lastSyncTime: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sync/full', (req, res) => {
    const { userId } = req.query;
    const data = (userId && serverSyncStore[userId as string]) || {};
    res.json({ success: true, data });
  });

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
