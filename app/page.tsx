'use client';

import Navbar from './capstone/components/Navbar';
import Hero from './capstone/components/Hero';

export default function Home() {
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN;

  const cognitoLoginUrl = `https://${domain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${redirectUri}`;
  const cognitoSignupUrl = `https://${domain}.auth.${region}.amazoncognito.com/signup?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${redirectUri}`;

  return (
    <main>
      <Navbar loginUrl={cognitoLoginUrl} signupUrl={cognitoSignupUrl} />
      <Hero />
    </main>
  );
}
