import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LogInResponseDto } from './dto/loginResponse.dto';
import { SignUpDtoResponse } from './dto/signupResponse.dto';
import { Request, Response } from 'express';
import { LogOutResponseDto } from './dto/logoutResponse.dto';
import { RefreshDto } from './dto/refresh.dto';
import { GetUsersResponseDto } from './dto/getUsersResponse.dto';
import { FreezedGuard } from '../session/freezed.guard';
import { csrfCookieName, generateToken } from '../utils/constants';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserResponseDto } from './dto/updateUserResponse.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshResponseDto } from './dto/refreshResponse.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags('Auth')
  @ApiOperation({ summary: 'User sign-up using Firebase' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    type: SignUpDtoResponse,
    description: 'User successfully signed up',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: Invalid input, password is not valid, username already exists, email is already in use.',
  })
  @Post('auth/users')
  async firebaseSignup(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    try {
      // eslint-disable-next-line prefer-const
      let signUpDtoResponse: SignUpDtoResponse =
        await this.authService.firebaseSignUp(signUpDto);

      res.status(signUpDtoResponse.code).send({
        status: signUpDtoResponse.status,
        code: signUpDtoResponse.code,
        message: signUpDtoResponse.message,
        data: signUpDtoResponse.data.result,
      });
    } catch (error) {
      console.error('Error in firebaseSignup:', error);

      res.status(400).send({
        status: 'error',
        code: 400,
        message: 'Bad Request. Invalid Credentials',
        data: {},
      });
    }
  }

  @ApiTags('Auth')
  @UseGuards(FreezedGuard)
  @ApiBody({ type: LogInDto })
  @ApiResponse({
    status: 201,
    type: LogInResponseDto,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input, password or email not valid',
  })
  @ApiOperation({ summary: 'User login' })
  @Post('auth/users/sessions')
  async firebaseLogin(
    @Body() logInDto: LogInDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const logInTokensResponseDto: LogInResponseDto =
        await this.authService.firebaseLogin(logInDto);

      const { bearer_token, authCookieAge, refresh_token, refreshCookieAge } =
        logInTokensResponseDto;

      res
        .status(logInTokensResponseDto.code)
        .cookie('bearer_token', bearer_token, {
          signed: true,
          maxAge: authCookieAge,
        })
        .cookie('refresh_token', refresh_token, {
          signed: true,
          maxAge: refreshCookieAge,
        })
        .send({
          status: logInTokensResponseDto.status,
          code: logInTokensResponseDto.code,
          message: logInTokensResponseDto.message,
          data: logInTokensResponseDto.data.result,
        });
    } catch (error) {
      console.error('Error in firebaseLogin:', error);

      res.status(400).send({
        status: 'error',
        code: 400,
        message: 'The credentials are invalid. Bad request',
        data: {
          result: {},
        },
      });
    }
  }

  @ApiTags('Auth')
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: 'lbrKxRW4PSea3DPGiiAqVMFzrNW2',
  })
  @ApiOperation({ summary: 'Refreshes user session' })
  @ApiResponse({
    status: 200,
    type: RefreshResponseDto,
    description: 'Session refreshed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid or expired refresh token',
  })
  @Put('auth/users/:userId/sessions')
  async firebaseRefresh(
    @Param('userId') userId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const jwtRefreshToken: string = req.signedCookies.refresh_token;
      const refreshDto: RefreshDto = { refresh_token: jwtRefreshToken };
      const { code, message, bearer_token, status, data } =
        await this.authService.firebaseRefresh(refreshDto);

      res
        .status(code)
        .cookie('bearer_token', bearer_token, { signed: true })
        .send({
          status,
          code,
          message,
          data: data.result,
        });
    } catch (error) {
      console.error('Error in firebaseRefresh:', error);

      res.status(400).send({
        code: 400,
        message:
          'Bad Request: Invalid or expired refresh token. Or no session in course',
      });
    }
  }

  @ApiTags('Auth')
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: 'lbrKxRW4PSea3DPGiiAqVMFzrNW2',
  })
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({
    description: 'User logged out successfully',
    type: LogOutResponseDto,
  })
  @Delete('auth/users/:userId/sessions')
  async logout(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const logoutResponseDto: LogOutResponseDto =
        await this.authService.firebaseLogout();

      res
        .status(logoutResponseDto.code)
        .clearCookie('connect.sid')
        .clearCookie('bearer_token')
        .clearCookie('refresh_token')
        .clearCookie(csrfCookieName)
        .send(logoutResponseDto);
    } catch (error) {
      console.error('Error in logout:', error);

      res.status(400).send({
        code: 400,
        message: 'Bad Request: Logout failed',
        data: {},
      });
    }
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Update user data' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User data changed successfully',
    type: UpdateUserResponseDto,
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: 'lbrKxRW4PSea3DPGiiAqVMFzrNW2',
  })
  @Patch('users/:userId')
  async updateUser(
    @Body() newData?: Partial<UpdateUserDto>,
    @Param('userId') userId?: string,
    @UploadedFile() profilePicture?: any,
    @Res() res?: Response,
  ): Promise<UpdateUserResponseDto> {
    try {
      if (!profilePicture && newData) {
        const response = await this.authService.updateUser(userId, newData);

        if (res) {
          res.status(response.code).send({
            status: response.status,
            code: response.code,
            message: response.message,
            data: response.data.result,
          });
        }

        return response;
      } else if (profilePicture && userId) {
        const response = await this.authService.uploadProfilePicture(
          userId,
          profilePicture,
        );

        if (res) {
          res.status(response.code).send({
            status: response.status,
            code: response.code,
            message: response.message,
            data: response.data.result,
          });
        }

        return response;
      }
    } catch (error) {
      console.error('Error uploading file or updating user:', error);

      const response: UpdateUserResponseDto = {
        status: 'error',
        code: 400,
        message: 'Bad Request: Failed to update user data',
        data: {
          result: {},
        },
      };

      if (res) {
        res.status(400).send({
          status: response.status,
          code: response.code,
          message: response.message,
          data: response.data.result,
        });
      }

      return response;
    }
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: GetUsersResponseDto,
  })
  @Get('users')
  async getAllUsers(@Res() res?: Response): Promise<GetUsersResponseDto> {
    try {
      const users = await this.authService.getUsers();

      if (res) {
        res.status(users.code).send(users);
      }

      return users;
    } catch (error) {
      console.error('An error occurred:', error);

      const response: GetUsersResponseDto = {
        status: 'error',
        code: 400,
        message: 'Bad Request: Failed to retrieve users',
        data: {
          result: {},
        },
      };

      if (res) {
        res.status(400).send(response);
      }

      return response;
    }
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'userId', description: 'Id of the user', type: String })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: GetUsersResponseDto,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: 'lbrKxRW4PSea3DPGiiAqVMFzrNW2',
  })
  @Get('users/:userId')
  async getSingleUserById(
    @Param('userId') userId: string,
    @Res() res?: Response,
  ): Promise<GetUsersResponseDto> {
    try {
      const singleUser = await this.authService.getSingleUser(userId);

      if (res) {
        res.status(singleUser.code).send(singleUser);
      }

      return singleUser;
    } catch (error) {
      console.error('An error occurred:', error);

      const response: GetUsersResponseDto = {
        status: 'error',
        code: 400,
        message: 'Bad Request: Failed to retrieve user',
        data: {
          result: {},
        },
      };

      if (res) {
        res.status(400).send(response);
      }

      return response;
    }
  }

  //
  @ApiTags('Auth')
  @Patch('auth/users')
  @ApiParam({ name: 'lang', description: 'Language (es/en)', example: 'en' })
  @ApiOperation({ summary: 'Send password reset email or change password' })
  @ApiResponse({
    status: 200,
    type: UpdateUserResponseDto,
    description: 'Operation successful.',
  })
  @ApiResponse({
    status: 400,
    type: UpdateUserResponseDto,
    description: 'Error processing the request.',
  })
  @ApiBody({ type: RecoverPasswordDto })
  async handlePasswordOperation(
    @Body() recoverPasswordDto: RecoverPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
    @Param('lang') lang: string,
  ): Promise<UpdateUserResponseDto | any> {
    try {
      if (recoverPasswordDto.email) {
        const response = await this.authService.firebaseForgotPassword(
          recoverPasswordDto.email,
        );

        if (response.status === 'error') {
          return res.status(400).json({
            code: 400,
            status: 'error',
            message:
              response.message || 'There was an error processing the request.',
            data: {},
          });
        }

        return res.status(response.code).json({
          code: response.code,
          status: response.status,
          message: response.message,
          data: {
            result: response.data.result || {},
          },
        });
      } else if (
        recoverPasswordDto.password &&
        recoverPasswordDto.new_password
      ) {
        const jwtToken = req.signedCookies.refresh_token;

        const changePasswordDto = new ChangePasswordDto();
        changePasswordDto.password = recoverPasswordDto.password;
        changePasswordDto.new_password = recoverPasswordDto.new_password;

        const response = await this.authService.firebaseChangePassword(
          changePasswordDto,
          jwtToken,
        );

        if (response.status === 'error') {
          return res.status(400).json({
            code: 400,
            status: 'error',
            message:
              response.message || 'There was an error processing the request.',
            data: {},
          });
        }

        return res.status(response.code).json({
          code: response.code,
          status: response.status,
          message: response.message,
          data: {
            result: response.data.result || {},
          },
        });
      } else {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message:
            'Invalid request. Provide either email or both password and new_password.',
          data: {},
        });
      }
    } catch (error) {
      console.error('Error processing the request:', error);
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'There was an error processing the request.',
        data: {},
      });
    }
  }
}
