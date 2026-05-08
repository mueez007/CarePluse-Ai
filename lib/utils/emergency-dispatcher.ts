export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface EmergencyAlert {
  type: 'high_risk_food' | 'missed_medication' | 'emergency_sos' | 'abnormal_health' | 'stress_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  location?: { lat: number; lng: number; address?: string };
  healthData?: any;
}

export class EmergencyDispatcher {
  private contacts: EmergencyContact[];
  private alertHistory: EmergencyAlert[] = [];

  constructor(contacts: EmergencyContact[]) {
    this.contacts = contacts;
  }

  async dispatchAlert(alert: EmergencyAlert): Promise<{ 
    success: boolean; 
    notifiedContacts: string[];
    errors: string[];
  }> {
    const notifiedContacts: string[] = [];
    const errors: string[] = [];

    // Filter contacts based on severity
    const contactsToNotify = this.getContactsBySeverity(alert.severity);
    
    // Log alert
    this.alertHistory.push(alert);
    
    // Send notifications to each contact
    for (const contact of contactsToNotify) {
      try {
        await this.notifyContact(contact, alert);
        notifiedContacts.push(contact.name);
      } catch (error) {
        errors.push(`Failed to notify ${contact.name}: ${error}`);
      }
    }
    
    // For critical alerts, also attempt to call emergency services
    if (alert.severity === 'critical') {
      await this.callEmergencyServices(alert);
    }
    
    return {
      success: errors.length === 0,
      notifiedContacts,
      errors
    };
  }

  private getContactsBySeverity(severity: string): EmergencyContact[] {
    switch (severity) {
      case 'critical':
        return this.contacts; // All contacts for critical
      case 'high':
        return this.contacts.filter(c => c.isPrimary); // Primary only for high
      default:
        return [this.contacts[0]].filter(Boolean); // First contact only
    }
  }

  private async notifyContact(contact: EmergencyContact, alert: EmergencyAlert): Promise<void> {
    const alertMessage = this.formatAlertMessage(alert, contact);
    
    // Send SMS (mock implementation)
    console.log(`[SMS to ${contact.phone}]: ${alertMessage}`);
    
    // Send Email if available
    if (contact.email) {
      console.log(`[Email to ${contact.email}]: ${alertMessage}`);
    }
  }

  private async callEmergencyServices(alert: EmergencyAlert): Promise<void> {
    console.log(`[Emergency Call] Critical alert for ${alert.userName}. Location: ${alert.location?.address || 'Unknown'}`);
    // In production, this would integrate with emergency dispatch API
  }

  private formatAlertMessage(alert: EmergencyAlert, contact: EmergencyContact): string {
    const alertTypes = {
      high_risk_food: "⚠️ High Risk Food Alert",
      missed_medication: "💊 Missed Medication Alert",
      emergency_sos: "🚨 EMERGENCY SOS - Immediate Action Required",
      abnormal_health: "❤️ Abnormal Health Reading Alert",
      stress_alert: "�� High Stress Level Detected"
    };
    
    return `${alertTypes[alert.type]}
    
Patient: ${alert.userName || 'Unknown'}
Time: ${alert.timestamp.toLocaleString()}
Message: ${alert.message}
${alert.location?.address ? `Location: ${alert.location.address}` : ''}
${alert.healthData ? `Health Data: ${JSON.stringify(alert.healthData)}` : ''}

Please take immediate action.
- CarePulse AI`;
  }

  getAlertHistory(): EmergencyAlert[] {
    return this.alertHistory;
  }

  getRecentAlerts(hours: number = 24): EmergencyAlert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert => alert.timestamp >= cutoff);
  }
}
