import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventCreationWizard, AttendanceConsole } from "@/components/event-center";
import type { SelectedGuest } from "@/components/event-center";

describe("EventCreationWizard", () => {
  it("생성 폼을 제출하면 이벤트 링크를 보여준다", () => {
    render(
      <EventCreationWizard
        organizations={[
          { id: "org-1", name: "테스트 단체" },
          { id: "org-2", name: "두번째 단체" },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("이벤트 제목"), { target: { value: "테스트 이벤트" } });
    fireEvent.change(screen.getByLabelText("SNS 홍보 링크"), { target: { value: "https://instagram.com/test" } });
    fireEvent.change(screen.getByLabelText("이벤트 기간 (시작)"), { target: { value: "2025-01-05" } });
    fireEvent.change(screen.getByLabelText("이벤트 기간 (종료)"), { target: { value: "2025-01-10" } });
    fireEvent.change(screen.getByLabelText("제공 매수"), { target: { value: 4 } });
    fireEvent.change(screen.getByLabelText("공연 날짜"), { target: { value: "2025-01-15T19:00" } });

    fireEvent.click(screen.getByText("이벤트 페이지 만들기"));

    expect(screen.getByText("이벤트 페이지가 준비됐어요")).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/artause\.com\/events/)).toBeInTheDocument();
  });
});

describe("AttendanceConsole", () => {
  const sampleGuests: SelectedGuest[] = [
    {
      id: "guest-1",
      name: "관객 A",
      email: "guestA@example.com",
      phone: "010-0000-0000",
      seats: 2,
      selectionReason: "추천 코드 + 릴스 공유",
      attendance: "pending",
    },
    {
      id: "guest-2",
      name: "관객 B",
      email: "guestB@example.com",
      phone: "010-1111-1111",
      seats: 1,
      selectionReason: "후기 작성자",
      attendance: "checked_in",
    },
  ];

  it("체크인 버튼을 누르면 상태가 업데이트된다", () => {
    render(<AttendanceConsole defaultGuests={sampleGuests} />);

    const checkinButton = screen.getByTestId("attendance-checkin-guest-1");
    expect(checkinButton).not.toBeDisabled();

    fireEvent.click(checkinButton);

    expect(checkinButton).toBeDisabled();
    expect(screen.getAllByText("체크인").length).toBeGreaterThan(1);
  });
});
