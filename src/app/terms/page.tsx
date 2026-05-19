import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function TermsPage() {
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
          <Shield className="w-6 h-6 text-rose-300/60" />
          <h1 className="text-3xl font-bold text-white/90">服务条款</h1>
        </div>

        <div className="space-y-8 text-white/50 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">1. 服务说明</h2>
            <p>
              纸片人男友 2.0（以下简称"本服务"）是一款AI虚拟陪伴产品，提供基于人工智能技术的角色对话、情感互动等功能。
              本服务仅供娱乐和情感陪伴用途，不构成真实的人际关系或心理咨询服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">2. 用户责任</h2>
            <p className="mb-3">用户在使用本服务时应当：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供真实、准确的注册信息</li>
              <li>不得利用本服务进行违法、欺诈或骚扰行为</li>
              <li>不得尝试破解、攻击或干扰本服务的正常运行</li>
              <li>不得将本服务用于商业目的或未经授权的二次开发</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">3. 内容规范</h2>
            <p>
              用户在与AI角色互动时，不得发送或诱导生成涉及暴力、色情、政治敏感、仇恨言论等违法或不当内容。
              我们有权对违规内容进行过滤和处理，并保留终止违规用户账号的权利。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">4. 知识产权</h2>
            <p>
              本服务生成的角色对话、图片等内容的知识产权归本平台所有。用户仅获得个人使用的权利，
              不得擅自复制、传播或用于商业用途。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">5. 免责声明</h2>
            <p>
              本服务提供的AI角色对话仅为模拟互动，不代表现实中的真实人物或关系。
              用户应理性使用，避免过度沉迷或产生不现实的情感依赖。对于因使用本服务而产生的任何直接或间接损失，
              我们不承担法律责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">6. 服务变更与终止</h2>
            <p>
              我们保留随时修改、暂停或终止本服务的权利。如发生服务变更，我们将尽力提前通知用户。
              用户也可以随时删除账号终止使用本服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white/70 mb-4">7. 联系我们</h2>
            <p>
              如对本服务条款有任何疑问，请通过邮件联系我们：support@soulboy.app
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
