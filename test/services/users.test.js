const assert = require('assert');
const app = require('../.././backend/app');

describe('\'Users\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/users');

    assert.ok(service, 'Registered the service');
  });
});
