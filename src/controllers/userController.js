const sql = require('../config/db');  // Importando a instância do banco de dados

async function createUser(req, res) {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).send('User ID and Email are required.');
  }

  try {
    const userExists = await sql`
      SELECT * FROM users WHERE user_id = ${userId};
    `;

    if (userExists.length > 0) {
      return res.status(200).json({
        message: 'User already exists!',
        user: userExists[0],
      });
    }

    const result = await sql`
      INSERT INTO users (user_id, email)
      VALUES (${userId}, ${email})
      RETURNING *;
    `;

    return res.status(200).json({
      message: 'User created successfully!',
      user: result[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error creating user');
  }
}

module.exports = { createUser };
