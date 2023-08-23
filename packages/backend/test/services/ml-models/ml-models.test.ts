// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert';
import { app } from '../../../src/app';

describe('ml-models service', () => {
  it('registered the service', () => {
    const service = app.getService('ml-models');

    assert.ok(service, 'Registered the service');
  });
});
