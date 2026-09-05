import { describe, it, expect } from 'vitest';
import {
  loadFeatureIndex,
  getAllFeatures,
  getFeatureByNumber,
  getFeatureBySlug,
  getFeatureStats,
  resolveFeatureMapping,
} from '@/lib/features/registry';

describe('414 Feature Specifications & Registry Engine', () => {
  it('loads all 414 feature specifications accurately from index', () => {
    const index = loadFeatureIndex();
    expect(index.length).toBe(414);
    expect(index[0].number).toBe(1);
    expect(index[index.length - 1].number).toBe(414);
  });

  it('verifies exact tier version distribution matches V1: 179, V2: 137, V3: 98', () => {
    const stats = getFeatureStats();
    expect(stats.total).toBe(414);
    expect(stats.byVersion.V1).toBe(179);
    expect(stats.byVersion.V2).toBe(137);
    expect(stats.byVersion.V3).toBe(98);
    expect(stats.byVersion.V1 + stats.byVersion.V2 + stats.byVersion.V3).toBe(414);
  });

  it('guarantees every feature has a deterministic route and database model mapping', () => {
    const all = getAllFeatures();
    expect(all.length).toBe(414);

    for (const f of all) {
      expect(f.number).toBeGreaterThan(0);
      expect(f.name).toBeTruthy();
      expect(f.slug).toBeTruthy();
      expect(['V1', 'V2', 'V3']).toContain(f.version);
      expect(f.mapping).toBeDefined();
      expect(f.mapping.route.startsWith('/')).toBe(true);
      expect(f.mapping.api.startsWith('/api')).toBe(true);
      expect(f.mapping.models.length).toBeGreaterThan(0);
      expect(['ACTIVE', 'CONFIGURED', 'IN_PROGRESS']).toContain(f.mapping.status);
    }
  });

  it('accurately parses detailed markdown specification sections for Feature 012 (Health Score)', () => {
    const f12 = getFeatureByNumber(12);
    expect(f12).toBeDefined();
    expect(f12?.number).toBe(12);
    expect(f12?.name).toBe('Health Score');
    expect(f12?.category).toBe('Dashboard');
    expect(f12?.version).toBe('V1');
    expect(f12?.sections?.purpose).toContain('Health Score gives the user an at-a-glance view');
    expect(f12?.mapping.route).toBe('/app/dashboard');
  });

  it('accurately parses Feature 001 (Phone OTP Signup/Login) with data models and validation', () => {
    const f1 = getFeatureByNumber(1);
    expect(f1).toBeDefined();
    expect(f1?.number).toBe(1);
    expect(f1?.name).toBe('Phone OTP Signup/Login');
    expect(f1?.version).toBe('V1');
    expect(f1?.sections?.dataRequired).toBeDefined();
    expect(f1?.sections?.dataRequired?.length).toBeGreaterThan(0);
    expect(f1?.sections?.medicalSafetyNotes).toBeDefined();
  });

  it('accurately retrieves feature by slug', () => {
    const f = getFeatureBySlug('google-health-connect');
    expect(f).toBeDefined();
    expect(f?.number).toBe(180);
    expect(f?.version).toBe('V2');
    expect(f?.category).toBe('Health Integrations & Sync');
  });

  it('covers V3 AI and ML features with appropriate routes and clinical models', () => {
    const aiAssistant = getFeatureByNumber(317);
    expect(aiAssistant).toBeDefined();
    expect(aiAssistant?.version).toBe('V3');
    expect(aiAssistant?.category).toBe('AI Assistant & Memory');
    expect(aiAssistant?.mapping.route).toBe('/assistant');
  });

  it('verifies 100% completion and ACTIVE status of all 316 features in V1 and V2', () => {
    const all = getAllFeatures();
    const v1v2 = all.filter((f) => f.version === 'V1' || f.version === 'V2');
    expect(v1v2.length).toBe(316);

    for (const f of v1v2) {
      expect(f.mapping.status).toBe('ACTIVE');
      expect(f.mapping.route).toBeTruthy();
      expect(f.mapping.api).toBeTruthy();
      expect(f.mapping.models.length).toBeGreaterThan(0);
    }
  });
});
