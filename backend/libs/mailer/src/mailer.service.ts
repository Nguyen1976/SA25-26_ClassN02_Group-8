import { Injectable } from '@nestjs/common'
import { MailerService as NestMailerService } from '@nestjs-modules/mailer'
import { readFileSync } from 'fs'

@Injectable()
export class MailerService {
  constructor(private mailer: NestMailerService) {}

  async sendUserConfirmation(data) {
    let html = readFileSync('./libs/mailer/src/templates/welcome.html', 'utf8')

    html = html
      .replace(/{{\s*name\s*}}/g, data.username)
      .replace(/{{\s*loginUrl\s*}}/g, 'https://chat-app.com/login')
      .replace(/{{\s*year\s*}}/g, String(new Date().getFullYear()))

    await this.mailer.sendMail({
      to: data.email,
      subject: 'Chào mừng bạn đến với Chat App 🎉',
      html, // mail/templates/confirmation.hbs
    })
  }

  async sendMakeFriendNotification(data) {
    let html = readFileSync(
      './libs/mailer/src/templates/make-friend.html',
      'utf8',
    )

    html = html
      .replace(/{{\s*senderName\s*}}/g, data.senderName)
      .replace(/{{\s*receiverName\s*}}/g, data.receiverName)
      .replace(/{{\s*acceptUrl\s*}}/g, 'ok')
      .replace(/{{\s*rejectUrl\s*}}/g, 'ok')
      .replace(/{{\s*year\s*}}/g, String(new Date().getFullYear()))

      //ở template này sẽ thiết kế lại để redirect người dùng về đúng trang web của mình 
    await this.mailer.sendMail({
      to: data.friendEmail,
      subject: 'Bạn có một lời mời kết bạn mới trên Chat App 🎉',
      html, // mail/templates/confirmation.hbs
    })
  }
}
