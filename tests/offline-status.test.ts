import {describe,it,expect} from 'vitest';
import {isOfflineMessageForScope,offlineScope} from '../src/offline';
describe('Deployment-scoped offline status',()=>{
 it('uses the app directory regardless of its hash scene route',()=>{
  expect(offlineScope('https://example.org/Photography-Tips/index.html#/scene/milky-way')).toBe('https://example.org/Photography-Tips/');
 });
 it('accepts only the same deployment, including when another app has the same identity and version',()=>{
  const scope='https://example.org/Photography-Tips/';
  expect(isOfflineMessageForScope({app:'fieldframe',scope,status:'ready'},scope)).toBe(true);
  expect(isOfflineMessageForScope({app:'fieldframe',scope:'https://example.org/Other-Fieldframe/',status:'ready'},scope)).toBe(false);
  expect(isOfflineMessageForScope({app:'fieldframe',status:'ready'},scope)).toBe(false);
  expect(isOfflineMessageForScope(null,scope)).toBe(false);
 });
});
