const GOOGLE_CLIENT_ID = "821700928894-63h51cko8dra16gpl3h2ojjnh8736820.apps.googleusercontent.com";
const REDIRECT_URI = "http://localhost:5173/auth/google/callback";

export const GoogleLoginButton = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",  // Chỉ yêu cầu mã xác thực
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent", 
    });

    // Redirect đến Google OAuth 2.0
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Đăng nhập bằng Google
    </button>
  );
};
