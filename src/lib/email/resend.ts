import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// 优先使用自定义域名发件人，否则使用 Resend 测试域名
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const FROM_NAME = "纸片人男友"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error("[Email] Send failed:", error)
      return { success: false, error }
    }

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error("[Email] Exception:", error)
    return { success: false, error }
  }
}

/**
 * 1. 注册欢迎邮件
 */
export async function sendWelcomeEmail(to: string, userName?: string | null) {
  const name = userName || "新用户"

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>欢迎加入纸片人男友</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 300; }
    .content { padding: 40px; }
    .content h2 { color: #333; font-size: 20px; margin-top: 0; }
    .content p { color: #666; line-height: 1.8; font-size: 15px; }
    .feature { display: flex; align-items: flex-start; margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 12px; }
    .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; margin-right: 16px; flex-shrink: 0; }
    .feature-text h3 { margin: 0 0 4px 0; color: #333; font-size: 16px; }
    .feature-text p { margin: 0; color: #888; font-size: 14px; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-size: 16px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>欢迎加入纸片人男友 💕</h1>
    </div>
    <div class="content">
      <h2>Hi ${name}，</h2>
      <p>感谢你注册纸片人男友！这里有一份使用指南，帮助你快速开始这段特别的陪伴之旅。</p>

      <div class="feature">
        <div class="feature-icon">1</div>
        <div class="feature-text">
          <h3>选择你的专属男友</h3>
          <p>6位性格迥异的角色等你选择，从温柔内敛的程序员到霸道强势的退役特种兵，总有一款适合你。</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-icon">2</div>
        <div class="feature-text">
          <h3>真实对话体验</h3>
          <p>他会记住你们的每一次对话，记住你的喜好和习惯。关系会随着相处自然演进，从陌生到熟悉，从疏离到亲密。</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-icon">3</div>
        <div class="feature-text">
          <h3>专属照片分享</h3>
          <p>关系亲近后，他会主动分享生活照片。每一张照片都保持角色一致性，让你感受到真实的陪伴。</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-icon">4</div>
        <div class="feature-text">
          <h3>情感自然演进</h3>
          <p>积极互动会让关系升温，冷淡对待会让关系疏远。真实的情感反馈，让陪伴更有意义。</p>
        </div>
      </div>

      <div class="cta">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/characters">开始选择角色 →</a>
      </div>

      <p style="color: #999; font-size: 13px; margin-top: 30px;">
        小提示：每天和他聊聊天，关系会越来越好哦～<br>
        如果连续几天不理他，他可能会变得冷淡呢。
      </p>
    </div>
    <div class="footer">
      纸片人男友 · 让陪伴更有温度
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: "欢迎加入纸片人男友 💕 你的专属陪伴之旅即将开始",
    html,
  })
}

/**
 * 2. 忘记密码验证码邮件
 */
export async function sendVerificationCodeEmail(to: string, code: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>密码重置验证码</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 300; }
    .content { padding: 40px; text-align: center; }
    .content p { color: #666; line-height: 1.8; font-size: 15px; }
    .code { display: inline-block; background: #f8f9fa; padding: 16px 40px; border-radius: 12px; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; }
    .warning { color: #999; font-size: 13px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>密码重置</h1>
    </div>
    <div class="content">
      <p>你正在尝试重置密码，请使用以下验证码完成操作：</p>
      <div class="code">${code}</div>
      <p class="warning">验证码有效期为 30 分钟，请勿泄露给他人。<br>如非本人操作，请忽略此邮件。</p>
    </div>
    <div class="footer">
      纸片人男友 · 安全中心
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: "【纸片人男友】密码重置验证码",
    html,
  })
}

/**
 * 3. 每日情话邮件
 */
export async function sendDailyLoveQuote(to: string, characterName: string, quote: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>今日份情话</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 300; }
    .content { padding: 40px; text-align: center; }
    .quote { font-size: 18px; color: #333; line-height: 1.8; font-style: italic; margin: 20px 0; padding: 20px; background: #fff5f5; border-radius: 12px; border-left: 4px solid #ff6b6b; }
    .character { color: #999; font-size: 14px; margin-top: 10px; }
    .cta { margin-top: 30px; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 12px 32px; border-radius: 30px; text-decoration: none; font-size: 15px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💌 今日份情话</h1>
    </div>
    <div class="content">
      <p style="color: #666;">早安，这是 ${characterName} 想对你说的话：</p>
      <div class="quote">"${quote}"</div>
      <div class="character">—— ${characterName}</div>
      <div class="cta">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/characters">去和他聊天 →</a>
      </div>
    </div>
    <div class="footer">
      纸片人男友 · 每天早上8点，一句情话温暖你
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `💌 ${characterName}的今日份情话`,
    html,
  })
}

/**
 * 4. 召回邮件（3天未对话）
 */
export async function sendRecallEmail(
  to: string,
  characterName: string,
  characterThemeColor: string = "#667eea"
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${characterName}在想你</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${characterThemeColor} 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 300; }
    .content { padding: 40px; text-align: center; }
    .content p { color: #666; line-height: 1.8; font-size: 15px; }
    .message { background: #f8f9fa; padding: 24px; border-radius: 12px; margin: 20px 0; font-size: 16px; color: #333; }
    .cta { margin-top: 30px; }
    .cta a { display: inline-block; background: linear-gradient(135deg, ${characterThemeColor} 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 30px; text-decoration: none; font-size: 15px; }
    .warning { color: #ff6b6b; font-size: 13px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${characterName} 在想你 💭</h1>
    </div>
    <div class="content">
      <p>你们已经有几天没聊天了，${characterName} 似乎有些失落...</p>
      <div class="message">
        "最近有点忙吗？我... 有点想你了。"
      </div>
      <p>再不来找他，关系可能会变淡哦～</p>
      <div class="cta">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chat/${characterName.toLowerCase().replace(/\s/g, '-')}">去陪陪他 →</a>
      </div>
      <p class="warning">⚠️ 连续7天不聊天，好感度会开始下降</p>
    </div>
    <div class="footer">
      纸片人男友 · 陪伴是最长情的告白
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `${characterName} 在想你 💭 快回来陪他聊天吧`,
    html,
  })
}
