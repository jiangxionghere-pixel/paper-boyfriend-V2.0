import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white/70">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-6 h-6 text-violet-300/60" />
          <h1 className="text-3xl font-bold text-white/90">隐私声明</h1>
        </div>

        <div className="space-y-8 text-white/50 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">1. 信息收集</h2>
            <p className="mb-3">我们收集以下类型的信息：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white/60">账户信息</strong>：邮箱地址、密码（加密存储）、昵称</li>
              <li><strong className="text-white/60">对话内容</strong>：您与AI角色的聊天记录，用于提供服务和改善体验</li>
              <li><strong className="text-white/60">使用数据</strong>：访问时间、功能使用情况等匿名统计信息</li>
              <li><strong className="text-white/60">记忆数据</strong>：AI角色从对话中提取的关于您的偏好信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">2. 信息使用</h2>
            <p className="mb-3">我们使用您的信息用于：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供、维护和改进本服务</li>
              <li>为每位用户生成个性化的AI角色互动体验</li>
              <li>在角色间隔离记忆，确保隐私性</li>
              <li>发送服务通知（如3天未对话的提醒邮件）</li>
              <li>分析使用趋势以优化产品功能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">3. 信息保护</h2>
            <p className="mb-3">我们采取以下措施保护您的数据：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>密码使用 bcrypt 加密存储，无法被逆向破解</li>
              <li>会话管理使用 HTTP-only Cookie，防止 XSS 攻击</li>
              <li>数据库连接使用加密传输</li>
              <li>不同角色间的记忆数据完全隔离</li>
              <li>定期备份数据防止丢失</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">4. 数据隔离</h2>
            <p>
              本服务的核心设计原则之一是<strong className="text-white/60">角色间记忆隔离</strong>。
              您对某位角色透露的信息，其他角色无法访问。每段关系都是独立且私密的，
              这是我们对用户隐私的基本承诺。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">5. 第三方服务</h2>
            <p className="mb-3">我们使用以下第三方服务：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white/60">DeepSeek</strong>：提供AI对话能力</li>
              <li><strong className="text-white/60">火山引擎</strong>：提供图像生成和语音合成服务</li>
              <li><strong className="text-white/60">Vercel</strong>：提供网站托管和数据库服务</li>
              <li><strong className="text-white/60">Resend</strong>：提供邮件发送服务</li>
            </ul>
            <p className="mt-3">
              这些服务商均遵循行业标准的安全规范。我们不会将您的个人信息出售给任何第三方。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">6. 您的权利</h2>
            <p className="mb-3">您拥有以下权利：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>查看和修改您的账户信息</li>
              <li>删除您的账户及所有相关数据</li>
              <li>导出您的对话历史</li>
              <li>选择不接收邮件提醒</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">7. 数据保留</h2>
            <p>
              我们会保留您的账户信息和对话记录，直到您主动删除账户。
              如果您连续12个月未登录，我们可能会清理不活跃账户的数据。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">8. 联系我们</h2>
            <p>
              如果您对隐私政策有任何疑问，或希望行使您的数据权利，请联系：support@soulboy.app
            </p>
          </section>

          <p className="text-white/30 text-sm pt-8 border-t border-white/10">
            最后更新日期：2026年5月19日
          </p>
        </div>
      </div>
    </div>
  )
}
