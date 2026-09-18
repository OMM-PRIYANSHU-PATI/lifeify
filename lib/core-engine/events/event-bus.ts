/**
 * LIFIFY Domain Event Bus
 * Event-driven reactive health pipeline
 */

export type DomainEventType =
  | "HealthDataIngested"
  | "WorkoutCompleted"
  | "SleepRecorded"
  | "NutritionLogged"
  | "MedicationTaken"
  | "MedicationMissed"
  | "SymptomRecorded"
  | "VitalRecorded"
  | "BaselineUpdated"
  | "RiskSignalGenerated"
  | "DoctorPreferenceUpdated";

export interface DomainEvent<T = any> {
  id?: string;
  eventId?: string;
  eventType: DomainEventType;
  userId: string;
  timestamp: Date;
  payload: T;
  sourceType?: string;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

export class DomainEventBus {
  private static handlers = new Map<DomainEventType, Set<EventHandler>>();
  private static eventHistory: DomainEvent[] = [];

  static subscribe<T = any>(type: DomainEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  static async publish<T = any>(
    typeOrEvent: DomainEventType | DomainEvent<T>,
    userId?: string,
    payload?: T
  ): Promise<DomainEvent<T>> {
    let event: DomainEvent<T>;
    if (typeof typeOrEvent === "object") {
      event = {
        ...typeOrEvent,
        eventId: typeOrEvent.eventId || typeOrEvent.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: typeOrEvent.timestamp || new Date()
      };
    } else {
      event = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        eventType: typeOrEvent,
        userId: userId!,
        timestamp: new Date(),
        payload: payload!
      };
    }

    this.eventHistory.push(event);
    if (this.eventHistory.length > 200) {
      this.eventHistory.shift();
    }

    const listeners = this.handlers.get(event.eventType);
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        try {
          await listener(event);
        } catch (err) {
          console.error(`Error executing event listener for ${event.eventType}:`, err);
        }
      }
    }

    return event;
  }

  static getRecentEvents(userId?: string): DomainEvent[] {
    if (!userId) return [...this.eventHistory];
    return this.eventHistory.filter((e) => e.userId === userId);
  }

  static clear(): void {
    this.handlers.clear();
    this.eventHistory = [];
  }

  // Instance wrappers for compatibility
  subscribe<T = any>(type: DomainEventType, handler: EventHandler<T>): () => void {
    return DomainEventBus.subscribe(type, handler);
  }

  async publish<T = any>(
    typeOrEvent: DomainEventType | DomainEvent<T>,
    userId?: string,
    payload?: T
  ): Promise<DomainEvent<T>> {
    return DomainEventBus.publish(typeOrEvent, userId, payload);
  }

  getRecentEvents(userId?: string): DomainEvent[] {
    return DomainEventBus.getRecentEvents(userId);
  }

  clear(): void {
    DomainEventBus.clear();
  }
}

export const domainEventBus = new DomainEventBus();
