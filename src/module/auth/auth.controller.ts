import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() body: CreateAuthDto) {
    console.log('Register route');
    return this.authService.create(body);
  }

  @Post('login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res) {
    return this.authService.login(body, res);
  }

  @Post('google')
  google(@Body() body: { code: string }, @Res({ passthrough: true }) res) {
    return this.authService.google(body.code, res);
  }

  @Get('refresh')
  refresh(@Res({ passthrough: true }) res) {
    return this.authService.refresh(res);
  }

  @Post('verify_2fa')
  auth(@Body() body: { user_email: string }, @Res({ passthrough: true }) res) {
    return this.authService.verify_2fa(body.user_email, res);
  }

  // send email and new password,email in url sent to mail
  @Post('reset_password')
  reset(@Body() body: LoginDto) {
    return this.authService.reset_password(body);
  }
}
//                           ###############################
//                      FLUTTER AND REACT JS CODE FOR GOOGLE-AUTH
//                           ###############################
//                                      FLUTTER
//                           ###############################
//                      


// import 'package:google_sign_in/google_sign_in.dart';

// final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
// final account = await googleSignIn.signIn();
// final auth = await account!.authentication;
// final response = await http.post(
//   Uri.parse('https://your-api.com/api/auth/google'),
//   headers: {'Content-Type': 'application/json'},
//   body: jsonEncode({'code': auth.accessToken}), // Send code
// );
// final data = jsonDecode(response.body);
// if (data['errors'] == null) {
//   // Store user data, redirect to dashboard
//   await FlutterSecureStorage().write(key: 'user', value: jsonEncode(data['data']['user']));
// } else {
//   print(data['errors'][0]['message']);
// }
//                           ###############################
//                                  REACT JS / NEXT JS
//                           ###############################
// import {useGoogleLogin } from '@react-oauth/google';
// import { useNavigate } from 'react-router-dom';

// const GoogleSignIn = () => {
//   const navigate = useNavigate();

//   const login = useGoogleLogin({
//     onSuccess: async (response) => {
//       try {
//         const res = await fetch('https://your-api.com/api/auth/google', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ code: response.code }),
//           credentials: 'include', // Sends/receives cookies
//         });
//         const data = await res.json();
//         if (data.errors === null) {
//           // Store user data, redirect to dashboard
//           localStorage.setItem('user', JSON.stringify(data.data.user));
//           navigate('/dashboard');
//         } else {
//           console.error(data.errors[0].message);
//           alert(data.errors[0].message); // Replace with UI
//         }
//       } catch (error) {
//         console.error('Network error:', error);
//         alert('Network error');
//       }
//     },
//     onError: (error) => {
//       console.error('Google Sign-In failed:', error);
//       alert('Google Sign-In failed');
//     },
//     flow: 'auth-code', // Authorization code flow
//     scope: 'email profile', // Match Flutter scopes
//   });

//   return (
//     <button onClick={() => login()}>
//       Sign in with Google
//     </button>
//   );
// };
//                           ###############################