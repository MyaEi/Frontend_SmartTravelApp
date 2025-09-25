export default function Home() {
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN;

  const cognitoLoginUrl = `https://${domain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${redirectUri}`;

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem' }}>
      <h1>Welcome to SmartTravelApp</h1>
      <p>Sign in or register using Cognito's secure hosted UI:</p>
      <a href={cognitoLoginUrl}>
        <button style={{ padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}>
          Login / Register with Cognito
        </button>
      </a>
    </main>
  );
}