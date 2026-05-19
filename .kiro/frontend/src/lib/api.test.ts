import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('API Client', () => {
  it('should have baseURL configured', () => {
    expect(api.defaults.baseURL).toBe('/api/v1');
  });

  it('should have Content-Type header', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
