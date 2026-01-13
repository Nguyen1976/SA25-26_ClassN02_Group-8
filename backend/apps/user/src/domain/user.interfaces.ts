export interface IPasswordService {
  hash(password: string): Promise<string>
  verify(password: string, hash: string): Promise<boolean>
}

export interface IAuthService {
  issue(user: any): Promise<{ token: string }>
  verify(token: string): Promise<any>
}
