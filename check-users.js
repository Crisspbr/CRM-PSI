import { db } from './lib/db/index.js';
import { users } from './lib/db/schema.js';

async function checkUsers() {
  try {
    const userList = await db.select().from(users);
    console.log('Users found:', userList.length);
    userList.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();