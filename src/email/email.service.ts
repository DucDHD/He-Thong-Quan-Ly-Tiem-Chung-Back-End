import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import * as handlebars from 'handlebars'
import * as nodemailer from 'nodemailer'
import * as path from 'path'
import { successLog } from '@/helpers/logger.helper'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly configService: ConfigService) {}

  private createTransporter() {
    return nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('EMAIL_HOST'),

      port: Number(this.configService.getOrThrow<string>('EMAIL_PORT')),

      secure: this.configService.get<string>('EMAIL_SECURE') === 'true',

      auth: {
        user: this.configService.getOrThrow<string>('EMAIL_USER'),
        pass: this.configService.getOrThrow<string>('EMAIL_PASSWORD')
      }
    })
  }

  private loadTemplate(templateName: string, data: Record<string, unknown>): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'email',
      'templates',
      `${templateName}.hbs`
    )

    const templateSource = fs.readFileSync(templatePath, 'utf8')

    const template = handlebars.compile(templateSource)

    return template(data)
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const transporter = this.createTransporter()

    const html = this.loadTemplate(templateName, data)

    await transporter.sendMail({
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
      to,
      subject,
      html
    })

    this.logger.log(successLog(`Gửi Email Thành Công`))
  }
}
