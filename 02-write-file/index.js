const fs = require('fs');
const path = require('path');
const {stdin, stdout, stderr} = process;

var targetFile = path.join(__dirname, 'text.txt');
fs.writeFile(targetFile, '', (err) => {
  if (err) {
    throw err;
  }
});

stdout.write('Введите что-нибудь:\n');

process.on('SIGINT', function () {
  process.exit(0);
});

stdin.on('data', data => {
  if (data.toString().trim().slice(0, 4).toLowerCase() === 'exit') {
    process.exit(0);
  }
  fs.appendFile(targetFile, data.toString(), (err) => {
    if (err) {
      throw err;
    }
  });
});

process.on('exit', code => {
  if (code === 0) {
    stdout.write('\nУспехов!\n');
  } else {
    stderr.write(`\nОшибка! Программа завершилась с кодом ${code}\n`);
  }
});
