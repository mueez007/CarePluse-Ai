export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  timing: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime';
  frequency: 'daily' | 'twice_daily' | 'weekly';
  daysOfWeek?: number[]; // 0-6, Sunday=0
  customTime?: string; // HH:MM format
  isActive: boolean;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'taken' | 'missed';
  responseTime?: Date;
  callSid?: string;
}

export class ReminderScheduler {
  private reminders: MedicationReminder[];
  private logs: ReminderLog[];

  constructor(reminders: MedicationReminder[] = []) {
    this.reminders = reminders;
    this.logs = [];
  }

  addReminder(reminder: MedicationReminder): void {
    this.reminders.push(reminder);
  }

  removeReminder(id: string): void {
    this.reminders = this.reminders.filter(r => r.id !== id);
  }

  getRemindersForTime(currentTime: Date): MedicationReminder[] {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentDay = currentTime.getDay();

    return this.reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      // Check day of week for weekly reminders
      if (reminder.frequency === 'weekly' && reminder.daysOfWeek) {
        if (!reminder.daysOfWeek.includes(currentDay)) return false;
      }
      
      // Check timing
      const reminderTime = this.getTimeForTiming(reminder.timing);
      if (!reminderTime) return false;
      
      // Allow 5-minute window
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (reminderTime.hour * 60 + reminderTime.minute));
      return timeDiff <= 5;
    });
  }

  private getTimeForTiming(timing: string): { hour: number; minute: number } | null {
    const times: Record<string, { hour: number; minute: number }> = {
      before_breakfast: { hour: 7, minute: 0 },
      after_breakfast: { hour: 8, minute: 30 },
      before_lunch: { hour: 12, minute: 0 },
      after_lunch: { hour: 13, minute: 30 },
      before_dinner: { hour: 18, minute: 0 },
      after_dinner: { hour: 20, minute: 0 },
      bedtime: { hour: 21, minute: 30 }
    };
    return times[timing] || null;
  }

  getNextReminderTime(): Date | null {
    let nextTime: Date | null = null;
    const now = new Date();

    for (const reminder of this.reminders) {
      if (!reminder.isActive) continue;
      
      const reminderTime = this.getTimeForTiming(reminder.timing);
      if (!reminderTime) continue;
      
      let candidate = new Date(now);
      candidate.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
      
      // If time already passed today, check tomorrow
      if (candidate <= now) {
        candidate.setDate(candidate.getDate() + 1);
      }
      
      // For weekly reminders, ensure correct day of week
      if (reminder.frequency === 'weekly' && reminder.daysOfWeek) {
        while (!reminder.daysOfWeek.includes(candidate.getDay())) {
          candidate.setDate(candidate.getDate() + 1);
        }
      }
      
      if (!nextTime || candidate < nextTime) {
        nextTime = candidate;
      }
    }
    
    return nextTime;
  }

  logReminderSent(reminderId: string, callSid?: string): ReminderLog {
    const log: ReminderLog = {
      id: Date.now().toString(),
      reminderId,
      scheduledTime: new Date(),
      status: 'sent',
      callSid
    };
    this.logs.push(log);
    return log;
  }

  markAsTaken(logId: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.status = 'taken';
      log.responseTime = new Date();
    }
  }

  markAsMissed(logId: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.status = 'missed';
    }
  }

  getAdherenceRate(days: number = 7): number {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(l => l.scheduledTime >= cutoff);
    
    if (recentLogs.length === 0) return 0;
    
    const takenCount = recentLogs.filter(l => l.status === 'taken').length;
    return Math.round((takenCount / recentLogs.length) * 100);
  }

  getMissedReminders(): ReminderLog[] {
    return this.logs.filter(l => l.status === 'missed');
  }

  generateReminderMessage(reminder: MedicationReminder, userName: string): string {
    const timingLabels: Record<string, string> = {
      before_breakfast: "before breakfast",
      after_breakfast: "after breakfast",
      before_lunch: "before lunch",
      after_lunch: "after lunch",
      before_dinner: "before dinner",
      after_dinner: "after dinner",
      bedtime: "at bedtime"
    };
    
    return `Hello ${userName}, this is your CarePulse AI assistant. 
    This is a reminder to take your ${reminder.medicationName} ${reminder.dosage} 
    ${timingLabels[reminder.timing] || ""}. 
    Please take your medication as prescribed. Stay healthy!`;
  }
}
