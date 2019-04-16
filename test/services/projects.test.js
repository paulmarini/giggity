const assert = require('assert');
const app = require('../.././backend/app');

describe('\'projects\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/projects');

    assert.ok(service, 'Registered the service');
  });
});
