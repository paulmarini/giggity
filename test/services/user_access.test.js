const assert = require('assert');
const app = require('../.././backend/app');

describe('\'members\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/members');

    assert.ok(service, 'Registered the service');
  });
});
