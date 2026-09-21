import test from 'node:test';import assert from 'node:assert/strict';
import {allowedDownload} from '../scripts/photo-review.mjs';
test('observed GitHub image bucket and attachment paths are allowed',()=>{
 assert.ok(allowedDownload('https://github-production-user-asset-6210df.s3.amazonaws.com/217095783/photo.jpg?signature=example'));
 assert.ok(allowedDownload('https://github.com/user-attachments/assets/f4ff2feb-4caa-45df-a76d-52871f4eedc2'));
});
test('attachment redirects reject lookalikes and unrelated hosts',()=>{
 for(const url of ['http://github-production-user-asset-6210df.s3.amazonaws.com/x','https://github-production-user-asset-6210df.s3.amazonaws.com.evil.example/x','https://evil.s3.amazonaws.com/x','https://github-production-user-asset-attacker.s3.amazonaws.com/x','https://user:password@github.com/user-attachments/assets/x','https://github.com:8443/user-attachments/assets/x','https://github.com/login','invalid'])assert.equal(allowedDownload(url),false,url);
});
