const { test, expect } = require('@jest/globals')
const { normalizeUrl } = require('./crawl.js')
const { getURLsFromHTML } = require('./crawlll.js')


test('normalizeURL should remove slash', () => {
    expect(normalizeUrl('https://www.google.com/')).toBe('https://www.google.com');
});

test('normalizeURL should not remove anything if there is no slash', () => {
    expect(normalizeUrl('https://www.google.com')).toBe('https://www.google.com');
});

test ('getURLsFromHTML should return all urls in the html body', () => {
    expect(getURLsFromHTML('<a href="https://www.google.com/">Google</a>', 'https://www.google.com/'))
        .toEqual(['https://www.google.com/']);
});

