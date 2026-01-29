// Test script to verify customer endpoint
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// First, login to get a valid token
async function testCustomerEndpoint() {
    try {
        console.log('🔐 Step 1: Logging in...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginData.message);
            console.log('ℹ️  Please create a test user first or update credentials in this script');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');

        // Test GET customers
        console.log('\n📋 Step 2: Getting customers...');
        const getResponse = await fetch(`${API_BASE}/api/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const customers = await getResponse.json();
        console.log('✅ GET /api/customers status:', getResponse.status);
        console.log('📊 Customers:', customers);

        // Test POST customer
        console.log('\n➕ Step 3: Adding a new customer...');
        const newCustomer = {
            name: 'Test Customer',
            email: 'testcustomer@example.com',
            company: 'Test Company',
            phone: '1234567890',
            status: 'active'
        };

        const postResponse = await fetch(`${API_BASE}/api/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCustomer)
        });

        const postData = await postResponse.json();
        console.log('✅ POST /api/customers status:', postResponse.status);
        console.log('📝 Response:', postData);

        if (postResponse.ok) {
            console.log('\n✅ SUCCESS! Customer endpoint is working correctly!');
        } else {
            console.log('\n❌ FAILED! Error:', postData.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCustomerEndpoint();
