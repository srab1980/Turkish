import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    role: UserRole.STUDENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should return null when user is inactive', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const inactiveUser = { ...mockUser, isActive: false };
      
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const accessToken = 'jwt-token';

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
      });
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          role: mockUser.role,
        },
      });
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });

  describe('register', () => {
    it('should create new user and return access token', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      const hashedPassword = 'hashedPassword';
      const accessToken = 'jwt-token';
      const newUser = {
        ...mockUser,
        email: registerDto.email,
        fullName: registerDto.fullName,
        password: hashedPassword,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        fullName: registerDto.fullName,
        role: UserRole.STUDENT,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      const newAccessToken = 'new-access-token';

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(newAccessToken);

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        access_token: newAccessToken,
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
        role: UserRole.STUDENT,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = mockUser.id;
      const changePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const newHashedPassword = 'newHashedPassword';

      mockUsersService.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(newHashedPassword as never);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.changePassword(userId, changePasswordDto);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        password: newHashedPassword,
      });
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      const userId = mockUser.id;
      const changePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password
      );
    });
  });
});
