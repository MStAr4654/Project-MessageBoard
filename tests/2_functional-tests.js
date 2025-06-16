const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { describe, it } = require('mocha');

chai.use(chaiHttp);
/*
suite('Functional Tests', function() {

});
*/
describe('Functional Tests', function () {
  it('Example Test', function (done) {
    // Your test logic here
    done();
  });
});