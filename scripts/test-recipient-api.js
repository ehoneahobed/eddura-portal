require('dotenv').config({ path: '.env.local' });

async function testRecipientAPI() {
  try {
    console.log('🧪 Testing Recipient API Endpoint...\n');

    // Test with the real token from the database
    const testToken = '3f0462c23210cb05d11f4e9ed8c617853347bcdd14b6812b2627da7f0b4e08eb';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    console.log('Testing API endpoint:', `${baseUrl}/api/recommendations/recipient/${testToken}`);
    
    const response = await fetch(`${baseUrl}/api/recommendations/recipient/${testToken}`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response (success):');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Response (error):');
      console.log('Status:', response.status);
      console.log('Error text:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('Error data:', errorData);
      } catch (e) {
        console.log('Could not parse error as JSON');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testRecipientAPI();
}

module.exports = { testRecipientAPI }; 