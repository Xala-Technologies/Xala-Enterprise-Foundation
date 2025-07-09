import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
console.log('Description length:', pkg.description?.length || 0);
console.log('Keywords count:', pkg.keywords?.length || 0);
console.log('Repository URL:', pkg.repository?.url || 'missing');

if (!pkg.description || pkg.description.length < 50) {
  throw new Error('Package description too short or missing');
}
if (!pkg.keywords || pkg.keywords.length < 5) {
  throw new Error('Insufficient keywords for discoverability');
}
if (!pkg.repository || !pkg.repository.url) {
  throw new Error('Repository URL missing');
}
console.log('✅ Package.json documentation validation passed');
