const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');

describe('GET /chain', () => {
  it('should return a valid chain JSON object', (done) => {
    request(app)
      .get('/chain')
      .send()
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
      });
  });
});
