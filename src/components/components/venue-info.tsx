import { Clock, Phone, Globe, Ticket, Wifi, Accessibility, Camera, Coffee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function VenueInfo() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">방문 정보</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  운영 시간
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">화요일 - 일요일</span>
                  <span className="font-medium">10:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">토요일</span>
                  <span className="font-medium">10:00 - 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">월요일</span>
                  <span className="font-medium text-destructive">휴관</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">* 입장 마감은 폐관 30분 전입니다</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-primary" />
                  관람료
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">성인</span>
                  <span className="font-medium">10,000원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">청소년 (13-18세)</span>
                  <span className="font-medium">7,000원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">어린이 (7-12세)</span>
                  <span className="font-medium">5,000원</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">* 7세 미만 및 65세 이상 무료</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>편의시설</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">무료 WiFi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Accessibility className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">휠체어 대여</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">사진 촬영 가능</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">카페테리아</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a
              href="tel:02-1234-5678"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              02-1234-5678
            </a>
            <a
              href="https://mmca.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              mmca.go.kr
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
