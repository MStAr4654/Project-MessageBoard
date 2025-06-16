const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let threadId;
let replyId;

describe('Functional Tests', function () {
  
  describe('API ROUTING FOR /api/threads/:board', function () {
    
    it('POST - create a thread', function (done) {
      chai
        .request(server)
        .post('/api/threads/test')
        .send({
          text: 'Test thread',
          delete_password: 'pass123'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it('GET - most recent 10 threads with 3 replies', function (done) {
      chai
        .request(server)
        .get('/api/threads/test')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          threadId = res.body[0]._id;
          done();
        });
    });

    it('PUT - report a thread', function (done) {
      chai
        .request(server)
        .put('/api/threads/test')
        .send({ thread_id: threadId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    it('DELETE - delete thread with incorrect password', function (done) {
      chai
        .request(server)
        .delete('/api/threads/test')
        .send({ thread_id: threadId, delete_password: 'wrong' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    it('DELETE - delete thread with correct password', function (done) {
      chai
        .request(server)
        .delete('/api/threads/test')
        .send({ thread_id: threadId, delete_password: 'pass123' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });

  describe('API ROUTING FOR /api/replies/:board', function () {
    before(function (done) {
      // Recreate thread for reply tests
      chai
        .request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for replies',
          delete_password: 'pass123'
        })
        .end((err, res) => {
          chai
            .request(server)
            .get('/api/threads/test')
            .end((err, res) => {
              threadId = res.body[0]._id;
              done();
            });
        });
    });

    it('POST - add reply to thread', function (done) {
      chai
        .request(server)
        .post('/api/replies/test')
        .send({
          thread_id: threadId,
          text: 'Reply here',
          delete_password: 'replypass'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it('GET - retrieve thread with all replies', function (done) {
      chai
        .request(server)
        .get('/api/replies/test')
        .query({ thread_id: threadId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'replies');
          replyId = res.body.replies[0]._id;
          done();
        });
    });

    it('PUT - report a reply', function (done) {
      chai
        .request(server)
        .put('/api/replies/test')
        .send({
          thread_id: threadId,
          reply_id: replyId
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    it('DELETE - reply with incorrect password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/test')
        .send({
          thread_id: threadId,
          reply_id: replyId,
          delete_password: 'wrong'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    it('DELETE - reply with correct password', function (done) {
      chai
        .request(server)
        .delete('/api/replies/test')
        .send({
          thread_id: threadId,
          reply_id: replyId,
          delete_password: 'replypass'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });
});
