import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">지금 가입하면 첫 응모 당첨 확률 2배!</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            특별한 문화 경험,<br />
            지금 바로 시작하세요
          </h2>
          
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 text-pretty">
            무료 회원가입하고 이번 주 12개의 초대권 이벤트에 응모해보세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-bold rounded-full"
            >
              더 알아보기
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/70 mt-6">
            신용카드 등록 불필요 · 언제든 무료 이용
          </p>
        </div>
      </div>
    </section>
  )
}
