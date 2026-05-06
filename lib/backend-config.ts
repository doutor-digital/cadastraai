// =====================================================
// CONFIGURAÇÃO DO BACKEND C# - INSTRUÇÕES
// =====================================================
//
// Este arquivo contém as instruções para configurar o backend C#
// com integração Google OAuth e as APIs necessárias para o dashboard.
//
// =====================================================
// VARIÁVEIS DE AMBIENTE NECESSÁRIAS
// =====================================================
//
// No frontend (Next.js):
// - NEXT_PUBLIC_API_URL=http://localhost:5000 (URL do backend C#)
// - NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_google_client_id
//
// No backend (C#):
// - Google:ClientId=seu_google_client_id
// - Google:ClientSecret=seu_google_client_secret
// - Jwt:Secret=sua_chave_secreta_jwt
// - Jwt:Issuer=instituto-trauma
// - Jwt:Audience=instituto-trauma-app
//
// =====================================================
// ENDPOINTS ESPERADOS NO BACKEND C#
// =====================================================
//
// AUTH:
// POST /api/auth/login - Login com email/senha
//   Body: { email: string, password: string }
//   Response: { token: string, user: User }
//
// POST /api/auth/google - Login com Google OAuth
//   Body: { idToken: string }
//   Response: { token: string, user: User }
//
// POST /api/auth/logout - Logout
//   Headers: Authorization: Bearer {token}
//   Response: { success: true }
//
// POST /api/auth/refresh - Refresh token
//   Headers: Authorization: Bearer {token}
//   Response: { token: string }
//
// GET /api/auth/me - Obter usuário atual
//   Headers: Authorization: Bearer {token}
//   Response: { user: User }
//
// =====================================================
// DASHBOARD:
// GET /api/dashboard/stats - Obter estatísticas
//   Headers: Authorization: Bearer {token}
//   Query: periodo, dataInicio, dataFim, usuario
//   Response: DashboardStats
//
// =====================================================
// LEADS:
// GET /api/leads - Listar leads
// POST /api/leads - Criar lead
// PUT /api/leads/:id - Atualizar lead
// DELETE /api/leads/:id - Deletar lead
//
// =====================================================
// CONSULTAS:
// GET /api/consultas - Listar consultas
// POST /api/consultas - Criar consulta
// PUT /api/consultas/:id - Atualizar consulta
//
// =====================================================
// TRATAMENTOS:
// GET /api/tratamentos - Listar tratamentos
// POST /api/tratamentos - Criar tratamento
// PUT /api/tratamentos/:id - Atualizar tratamento
//
// =====================================================
// EXEMPLO DE CONTROLLER C# PARA GOOGLE AUTH
// =====================================================
//
// using Google.Apis.Auth;
// using Microsoft.AspNetCore.Mvc;
//
// [ApiController]
// [Route("api/auth")]
// public class AuthController : ControllerBase
// {
//     private readonly IConfiguration _configuration;
//     private readonly IUserService _userService;
//     private readonly IJwtService _jwtService;
//
//     public AuthController(
//         IConfiguration configuration,
//         IUserService userService,
//         IJwtService jwtService)
//     {
//         _configuration = configuration;
//         _userService = userService;
//         _jwtService = jwtService;
//     }
//
//     [HttpPost("google")]
//     public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
//     {
//         try
//         {
//             var settings = new GoogleJsonWebSignature.ValidationSettings
//             {
//                 Audience = new[] { _configuration["Google:ClientId"] }
//             };
//
//             var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
//
//             var user = await _userService.FindOrCreateByGoogleId(
//                 payload.Subject,
//                 payload.Email,
//                 payload.Name,
//                 payload.Picture
//             );
//
//             var token = _jwtService.GenerateToken(user);
//
//             return Ok(new { token, user });
//         }
//         catch (InvalidJwtException)
//         {
//             return Unauthorized(new { message = "Token inválido" });
//         }
//     }
//
//     [HttpPost("login")]
//     public async Task<IActionResult> Login([FromBody] LoginDto dto)
//     {
//         var user = await _userService.ValidateCredentials(dto.Email, dto.Password);
//         
//         if (user == null)
//             return Unauthorized(new { message = "Credenciais inválidas" });
//
//         var token = _jwtService.GenerateToken(user);
//         return Ok(new { token, user });
//     }
// }
//
// =====================================================
// PACOTES NUGET NECESSÁRIOS
// =====================================================
//
// dotnet add package Google.Apis.Auth
// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
// dotnet add package System.IdentityModel.Tokens.Jwt
//
// =====================================================

export const BACKEND_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
}
