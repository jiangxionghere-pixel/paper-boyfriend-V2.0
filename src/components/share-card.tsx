"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download, X, Heart, MessageCircle, Calendar, Sparkles, Quote } from "lucide-react"

interface ShareCardProps {
  character: {
    name: string
    occupation: string
    themeColor: string
    baselineImageUrl?: string | null
    tagline?: string | null
  }
  stats: {
    affinity: number
    stage: string
    daysTogether: number
  }
  onClose: () => void
}

export function ShareCard({ character, stats, onClose }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 根据亲密度计算进度条宽度
  const affinityPercent = Math.min((stats.affinity / 100) * 100, 100)

  // 根据阶段获取描述
  const getStageDescription = (stage: string) => {
    const descriptions: Record<string, string> = {
      "疏离期": "缘分刚刚开始",
      "冷淡期": "渐渐熟悉彼此",
      "平稳期": "关系趋于稳定",
      "亲密期": "感情日益深厚",
      "热恋期": "命中注定的他",
    }
    return descriptions[stage] || "在彼此陪伴中成长"
  }

  const handleCopy = async () => {
    const text = `✨ 我和 ${character.name} 已经相识 ${stats.daysTogether} 天了！\n\n💕 当前亲密度：${stats.affinity}（${stats.stage}）\n${character.tagline ? `\n「${character.tagline}」` : ""}\n\n—— 来自 纸片人男友 2.0`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  // 降级下载方案
  const fallbackDownload = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 800, 1000)
    gradient.addColorStop(0, "#0a0a0a")
    gradient.addColorStop(1, "#1a1a2e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 1000)

    // 顶部装饰
    ctx.fillStyle = character.themeColor + "15"
    ctx.fillRect(0, 0, 800, 350)

    // 装饰圆
    ctx.beginPath()
    ctx.arc(400, 200, 120, 0, Math.PI * 2)
    ctx.fillStyle = character.themeColor + "10"
    ctx.fill()

    // 角色名
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 56px -apple-system, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(character.name, 400, 180)

    // 职业
    ctx.fillStyle = "#ffffff60"
    ctx.font = "24px -apple-system, sans-serif"
    ctx.fillText(character.occupation, 400, 230)

    // 分隔线
    ctx.beginPath()
    ctx.moveTo(250, 280)
    ctx.lineTo(550, 280)
    ctx.strokeStyle = character.themeColor + "40"
    ctx.lineWidth = 1
    ctx.stroke()

    // 天数
    ctx.fillStyle = "#ffffff"
    ctx.font = "48px -apple-system, sans-serif"
    ctx.fillText(`${stats.daysTogether}`, 400, 400)
    ctx.fillStyle = "#ffffff50"
    ctx.font = "20px -apple-system, sans-serif"
    ctx.fillText("相识天数", 400, 440)

    // 亲密度
    ctx.fillStyle = "#ffffff"
    ctx.font = "36px -apple-system, sans-serif"
    ctx.fillText(`${stats.affinity}`, 400, 520)
    ctx.fillStyle = "#ffffff50"
    ctx.font = "20px -apple-system, sans-serif"
    ctx.fillText(`亲密度 · ${stats.stage}`, 400, 560)

    // 进度条背景
    ctx.fillStyle = "#ffffff10"
    ctx.roundRect(200, 590, 400, 8, 4)
    ctx.fill()

    // 进度条
    ctx.fillStyle = character.themeColor + "cc"
    ctx.roundRect(200, 590, 400 * (stats.affinity / 100), 8, 4)
    ctx.fill()

    // 底部
    ctx.fillStyle = "#ffffff30"
    ctx.font = "18px -apple-system, sans-serif"
    ctx.fillText("纸片人男友 2.0", 400, 900)

    const link = document.createElement("a")
    link.download = `share-${character.name}.png`
    link.href = canvas.toDataURL()
    link.click()
  }, [character.name, character.themeColor, character.occupation, stats.daysTogether, stats.affinity, stats.stage])

  // 使用 html2canvas 生成高质量分享图
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setIsGenerating(true)

    try {
      // 动态导入 html2canvas
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const link = document.createElement("a")
      link.download = `share-${character.name}-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("[ShareCard] Generate image failed:", error)
      // 降级方案：使用原生 canvas
      fallbackDownload()
    } finally {
      setIsGenerating(false)
    }
  }, [character.name, fallbackDownload])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.15] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Preview Card (for html2canvas capture) */}
        <div
          ref={cardRef}
          className="bg-gradient-to-b from-[#0a0a0a] to-[#111122] rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl"
        >
          {/* Top decoration */}
          <div
            className="relative h-40 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${character.themeColor}08` }}
          >
            {/* Decorative circles */}
            <div
              className="absolute w-64 h-64 rounded-full -top-20 -left-20 opacity-20"
              style={{ backgroundColor: `${character.themeColor}20` }}
            />
            <div
              className="absolute w-48 h-48 rounded-full -bottom-10 -right-10 opacity-15"
              style={{ backgroundColor: `${character.themeColor}15` }}
            />

            {/* Avatar */}
            <div className="relative z-10">
              {character.baselineImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.baselineImageUrl}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover border-3 shadow-lg"
                  style={{
                    borderColor: `${character.themeColor}50`,
                    boxShadow: `0 0 30px ${character.themeColor}20`,
                  }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-light shadow-lg"
                  style={{
                    backgroundColor: `${character.themeColor}20`,
                    color: `${character.themeColor}cc`,
                    boxShadow: `0 0 30px ${character.themeColor}20`,
                  }}
                >
                  {character.name[0]}
                </div>
              )}
              {/* Status dot */}
              <div
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0a]"
                style={{ backgroundColor: character.themeColor }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-4">
            {/* Character info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-light text-white/80 mb-1">{character.name}</h3>
              <p className="text-white/30 text-sm">{character.occupation}</p>
              <div
                className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: `${character.themeColor}12`,
                  color: `${character.themeColor}aa`,
                }}
              >
                <Sparkles className="w-3 h-3" />
                {getStageDescription(stats.stage)}
              </div>
            </div>

            {/* Tagline */}
            {character.tagline && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Quote className="w-3 h-3 text-white/10 mb-1" />
                <p className="text-white/40 text-sm italic leading-relaxed">
                  {character.tagline}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <Calendar className="w-4 h-4 mx-auto mb-2 text-white/20" />
                <div className="text-xl font-light text-white/70">{stats.daysTogether}</div>
                <div className="text-[10px] text-white/20 mt-1">相识天数</div>
              </div>
              <div
                className="text-center p-4 rounded-2xl border transition-colors"
                style={{
                  backgroundColor: `${character.themeColor}08`,
                  borderColor: `${character.themeColor}15`,
                }}
              >
                <Heart className="w-4 h-4 mx-auto mb-2" style={{ color: `${character.themeColor}90` }} />
                <div className="text-xl font-light" style={{ color: `${character.themeColor}cc` }}>
                  {stats.affinity}
                </div>
                <div className="text-[10px] text-white/20 mt-1">亲密度</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <MessageCircle className="w-4 h-4 mx-auto mb-2 text-white/20" />
                <div className="text-lg font-light text-white/70">{stats.stage}</div>
                <div className="text-[10px] text-white/20 mt-1">关系阶段</div>
              </div>
            </div>

            {/* Affinity progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[10px] text-white/20 mb-1.5">
                <span>亲密度进度</span>
                <span>{Math.round(affinityPercent)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${affinityPercent}%`,
                    backgroundColor: character.themeColor,
                    boxShadow: `0 0 10px ${character.themeColor}40`,
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/[0.04]">
              <p className="text-white/15 text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                纸片人男友 2.0 · 让陪伴更有温度
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white/70 transition-all"
            onClick={handleCopy}
          >
            {copied ? (
              <span className="text-emerald-400/70">已复制</span>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                复制文案
              </>
            )}
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: `${character.themeColor}20`,
              border: `1px solid ${character.themeColor}30`,
              color: `${character.themeColor}cc`,
            }}
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="animate-pulse">生成中...</span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                保存卡片
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
