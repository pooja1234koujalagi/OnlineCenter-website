const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function hashPasswords() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "myapp"
    });

    // Fetch all users with their current password
    const [users] = await db.query("SELECT id, password FROM users");

    for (const user of users) {
      // Skip if already hashed (starts with $2b$)
      if (user.password.startsWith("$2b$")) continue;

      const hashed = await bcrypt.hash(user.password, 10);
      await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
      console.log(`Updated user ID ${user.id}`);
    }

    console.log("All users updated successfully!");
    await db.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

hashPasswords();