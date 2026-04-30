


async function test() {
  console.log("Testing Signup...");
  const res1 = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User 2', email: 'test2@example.com', password: 'password123' })
  });
  console.log("Signup status:", res1.status);
  const data1 = await res1.json();
  console.log("Signup res:", data1);

async function test() {
  console.log("Testing Login...");
  const res2 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test2@example.com', password: 'password123' })
  });
  console.log("Login status:", res2.status);
  const data2 = await res2.json();
  const cookies = res2.headers.get('set-cookie');
  console.log("Login cookies:", cookies);

  console.log("Testing GET /user...");
  const res3 = await fetch('http://localhost:3000/api/user', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies 
    }
  });
  console.log("User status:", res3.status);
  const data3 = await res3.text();
  console.log("User data:", data3);
}
test();
