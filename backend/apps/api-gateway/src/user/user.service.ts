import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'
import { LoginUserDto, MakeFriendDto, RegisterUserDto } from './dto/user.dto'
import {
  MakeFriendRequest,
  MakeFriendResponse,
  USER_SERVICE_NAME,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
  UserServiceClient,
} from 'interfaces/user'
import type { ClientGrpc } from '@nestjs/microservices'
import { catchError, firstValueFrom, throwError } from 'rxjs'

@Injectable()
export class UserService implements OnModuleInit {
  private userClient: UserServiceClient
  constructor(@Inject(USER_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.userClient =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }

  async register(dto: RegisterUserDto): Promise<UserRegisterResponse> {
    let observable = this.userClient.register({
      email: dto.email,
      password: dto.password,
      username: dto.username,
    } as UserRegisterRequest)
    return await firstValueFrom(observable)
  }
  async login(dto: LoginUserDto): Promise<UserLoginResponse> {
    let observable = this.userClient.login({
      email: dto.email,
      password: dto.password,
    } as UserLoginRequest)

    return await firstValueFrom(observable)
  }

  async makeFriend(dto: any): Promise<MakeFriendResponse> {
    const observable = this.userClient.makeFriend({
      userId: dto.userId,
      friendEmail: dto.friendEmail,
    } as MakeFriendRequest)
    return await firstValueFrom(observable)
  }
}
