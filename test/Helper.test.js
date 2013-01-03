var expect = require('expect.js');
var formatNumber = require('../src/js/Helper.js').formatNumber;
describe('formatNumber', function() {
    var nrs = [123456, 1234567, 12345678];
    var formats = ['123.456', '1.234.567', '12.345.678'];
    it('should format to ' + formats[0], function() {
        expect(formats[0]).to.equal(formatNumber(nrs[0]));
    });
    it('should format to ' + formats[1], function() {
        expect(formats[1]).to.equal(formatNumber(nrs[1]));
    });
    it('should format to ' + formats[2], function() {
        expect(formats[2]).to.equal(formatNumber(nrs[2]));
    });
});