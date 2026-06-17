const bcrypt = require('bcryptjs');
const hash = '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.';
const isValid = bcrypt.compareSync('password123', hash);
console.log("Is valid?", isValid);

const newHash = bcrypt.hashSync('password123', 10);
console.log("New hash:", newHash);
