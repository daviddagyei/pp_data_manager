// Quick token verification utility
export const verifyGoogleToken = async (accessToken: string) => {
  console.log('🔍 Manual Token Verification');
  console.log('Token length:', accessToken.length);
  console.log('Token starts with:', accessToken.substring(0, 10));
  
  // Test 1: Try to get token info from Google
  try {
    const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = await tokenInfoResponse.json();
    console.log('✅ Token info from Google:', tokenInfo);
  } catch (error) {
    console.log('❌ Failed to get token info:', error);
  }
  
  // Test 2: Try a simple userinfo request
  try {
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const userinfo = await userinfoResponse.json();
    console.log('✅ User info request success:', userinfo);
  } catch (error) {
    console.log('❌ Failed userinfo request:', error);
  }
  
  // Test 3: Check token expiration if it's a JWT
  try {
    if (accessToken.includes('.')) {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🕐 Token payload:', payload);
        console.log('🕐 Expires at:', new Date(payload.exp * 1000));
        console.log('🕐 Current time:', new Date());
        console.log('🕐 Is expired:', payload.exp * 1000 < Date.now());
      }
    }
  } catch (error) {
    console.log('ℹ️ Token is not a JWT or cannot decode');
  }
};
