"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, Copy, Check } from "lucide-react"
import { useState } from "react"

export function VenueMap() {
  const [copied, setCopied] = useState(false)
  const address = "서울특별시 종로구 삼청로 30"

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">오시는 길</h2>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden h-full">
                <div className="relative aspect-video lg:aspect-auto lg:h-full min-h-[400px] bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    지도 영역 (카카오맵/네이버맵 연동)
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주소</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">{address}</p>
                  <div className="flex gap-2">
                    <Button onClick={copyAddress} variant="outline" size="sm" className="flex-1 bg-transparent">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          주소 복사
                        </>
                      )}
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      길찾기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">대중교통</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">지하철</p>
                    <p className="text-muted-foreground leading-relaxed">
                      3호선 안국역 1번 출구
                      <br />
                      도보 10분
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">버스</p>
                    <p className="text-muted-foreground leading-relaxed">
                      간선: 109, 151, 162, 171, 172
                      <br />
                      지선: 7025
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주차</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    미술관 지하 주차장 이용 가능
                    <br />
                    (유료, 30분당 2,000원)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
