import { Module } from '@nestjs/common'
import { CommonService } from './common.service'
import { JwtModule } from '@nestjs/jwt'
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          secret: 'my_key',
          signOptions: { expiresIn: '60m' },
        }
      },
    }),
    
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
