export type TopicKey = "thu-tuc" | "chuyen-doi-so";

export const TOPICS: { key: TopicKey; label: string; heading: string }[] = [
  {
    key: "thu-tuc",
    label: "Thủ tục hành chính Đảng",
    heading: "CÂU HỎI GỢI Ý — THỦ TỤC HÀNH CHÍNH ĐẢNG",
  },
  {
    key: "chuyen-doi-so",
    label: "Mô hình chi bộ tiên phong chuyển đổi số",
    heading: "CÂU HỎI GỢI Ý — CHI BỘ TIÊN PHONG CHUYỂN ĐỔI SỐ",
  },
];

export const SUGGESTION_GROUPS: Record<TopicKey, { group: string; questions: string[] }[]> = {
  "thu-tuc": [
    {
      group: "Thu, nộp đảng phí",
      questions: [
        "Thủ tục “Thu, nộp đảng phí” được thực hiện bằng những hình thức nào?",
        "Đảng viên nộp đảng phí trực tuyến ở đâu?",
        "Mức đóng đảng phí của đảng viên hưởng lương là bao nhiêu?",
        "Khi kê khai thông tin đóng đảng phí, đảng viên cần nhập những thông tin gì?",
        "Có thể đóng hộ đảng phí cho đảng viên khác không?",
        "Đảng viên xem lịch sử nộp đảng phí ở đâu?",
      ],
    },
    {
      group: "Chuyển sinh hoạt Đảng chính thức",
      questions: [
        "Trình tự chuyển sinh hoạt Đảng chính thức gồm những bước nào?",
        "Hồ sơ chuyển sinh hoạt Đảng chính thức gồm những gì?",
        "Thời hạn giải quyết chuyển sinh hoạt Đảng chính thức là bao lâu?",
      ],
    },
    {
      group: "Chuyển sinh hoạt Đảng tạm thời",
      questions: [
        "Khi nào đảng viên phải chuyển sinh hoạt Đảng tạm thời?",
        "Đảng viên sinh hoạt tạm thời có quyền biểu quyết, bầu cử không?",
        "Đảng viên sinh hoạt tạm thời đóng đảng phí ở đâu?",
      ],
    },
    {
      group: "Lấy ý kiến nhận xét nơi cư trú",
      questions: [
        "Thủ tục lấy ý kiến nhận xét của chi ủy nơi cư trú thực hiện thế nào?",
        "Nội dung nhận xét của chi ủy nơi cư trú gồm những gì?",
      ],
    },
  ],
  "chuyen-doi-so": [
    {
      group: "Mục tiêu, nội dung mô hình",
      questions: [
        "Mô hình chi bộ tiên phong chuyển đổi số hướng tới mục tiêu gì?",
        "Chi bộ triển khai chuyển đổi số trong sinh hoạt Đảng như thế nào?",
        "Đảng viên hỗ trợ nhân dân chuyển đổi số bằng những việc gì?",
      ],
    },
    {
      group: "Tiêu chí đánh giá",
      questions: [
        "Tiêu chí đánh giá chi bộ tiên phong chuyển đổi số là gì?",
        "Tỷ lệ đảng viên nộp đảng phí trực tuyến cần đạt bao nhiêu?",
      ],
    },
    {
      group: "Sinh hoạt chi bộ",
      questions: [
        "Một buổi sinh hoạt chi bộ định kỳ gồm những bước nào?",
        "Chi bộ phải sinh hoạt chuyên đề bao nhiêu lần một quý?",
        "Hồ sơ, sổ sách của chi bộ gồm những loại nào?",
      ],
    },
  ],
};
