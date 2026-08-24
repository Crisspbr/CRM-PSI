const fs = require('fs');
const buffer = fs.readFileSync('.env.local');
console.log('Bytes:', buffer);
console.log('Hex:', buffer.toString('hex'));
console.log('Length:', buffer.length);
for (let i = 0; i < buffer.length; i++) {
  if (buffer[i] < 32 || buffer[i] > 126) {
    console.log(`Non-printable char at position ${i}: ${buffer[i]}`);
  }
}