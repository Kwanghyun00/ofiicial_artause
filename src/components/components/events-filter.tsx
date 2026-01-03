"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, SlidersHorizontal } from "lucide-react"

const categories = ["뮤지컬", "연극", "콘서트", "클래식", "무용", "전시", "페스티벌"]
const regions = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "강원", "제주"]
const priceRanges = ["무료", "할인", "프리미엄"]
const deadlines = ["오늘 마감", "3일 이내", "7일 이내", "그 이상"]

export function EventsFilter() {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  const togglePrice = (price: string) => {
    setSelectedPrices((prev) => (prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]))
  }

  const toggleDeadline = (deadline: string) => {
    setSelectedDeadlines((prev) => (prev.includes(deadline) ? prev.filter((d) => d !== deadline) : [...prev, deadline]))
  }

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedRegions([])
    setSelectedPrices([])
    setSelectedDeadlines([])
  }

  const totalFilters =
    selectedCategories.length + selectedRegions.length + selectedPrices.length + selectedDeadlines.length

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          aria-expanded={isOpen}
          aria-controls="filters-panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
          필터 {isOpen ? "닫기" : "열기"}
          {totalFilters > 0 && (
            <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {totalFilters}
            </Badge>
          )}
        </Button>
      </div>

      <aside
        id="filters-panel"
        className={`lg:block ${isOpen ? "block" : "hidden"} lg:w-80 flex-shrink-0 space-y-4`}
        aria-label="이벤트 필터"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            필터
            {totalFilters > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalFilters}개 선택)</span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-primary"
            disabled={totalFilters === 0}
          >
            초기화
          </Button>
        </div>

        {/* Active Filters */}
        {totalFilters > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">선택한 필터</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {cat}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="hover:text-destructive"
                    aria-label={`${cat} 필터 제거`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedRegions.map((region) => (
                <Badge key={region} variant="secondary" className="gap-1">
                  {region}
                  <button
                    onClick={() => toggleRegion(region)}
                    className="hover:text-destructive"
                    aria-label={`${region} 필터 제거`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedPrices.map((price) => (
                <Badge key={price} variant="secondary" className="gap-1">
                  {price}
                  <button
                    onClick={() => togglePrice(price)}
                    className="hover:text-destructive"
                    aria-label={`${price} 필터 제거`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedDeadlines.map((deadline) => (
                <Badge key={deadline} variant="secondary" className="gap-1">
                  {deadline}
                  <button
                    onClick={() => toggleDeadline(deadline)}
                    className="hover:text-destructive"
                    aria-label={`${deadline} 필터 제거`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              카테고리
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedCategories.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <fieldset>
              <legend className="sr-only">카테고리 선택</legend>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer flex-1">
                    {category}
                  </Label>
                </div>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        {/* Region Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              지역
              {selectedRegions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedRegions.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <fieldset>
              <legend className="sr-only">지역 선택</legend>
              {regions.map((region) => (
                <div key={region} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`region-${region}`}
                    checked={selectedRegions.includes(region)}
                    onCheckedChange={() => toggleRegion(region)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`region-${region}`} className="text-sm font-normal cursor-pointer flex-1">
                    {region}
                  </Label>
                </div>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        {/* Price Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              티켓 유형
              {selectedPrices.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedPrices.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <fieldset>
              <legend className="sr-only">티켓 유형 선택</legend>
              {priceRanges.map((range) => (
                <div key={range} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`price-${range}`}
                    checked={selectedPrices.includes(range)}
                    onCheckedChange={() => togglePrice(range)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`price-${range}`} className="text-sm font-normal cursor-pointer flex-1">
                    {range}
                  </Label>
                </div>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        {/* Deadline Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              마감 기한
              {selectedDeadlines.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">({selectedDeadlines.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <fieldset>
              <legend className="sr-only">마감 기한 선택</legend>
              {deadlines.map((deadline) => (
                <div key={deadline} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`deadline-${deadline}`}
                    checked={selectedDeadlines.includes(deadline)}
                    onCheckedChange={() => toggleDeadline(deadline)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`deadline-${deadline}`} className="text-sm font-normal cursor-pointer flex-1">
                    {deadline}
                  </Label>
                </div>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl"
          disabled={totalFilters === 0}
        >
          필터 적용 {totalFilters > 0 && `(${totalFilters})`}
        </Button>
      </aside>
    </>
  )
}
