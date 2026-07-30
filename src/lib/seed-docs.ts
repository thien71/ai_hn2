// Bộ tài liệu mẫu (kiến thức nền) dùng khi chi bộ chưa có văn bản riêng.
export type SeedDoc = { title: string; content: string };

export const SEED_DOCS: SeedDoc[] = [
  {
    title: "Thu, nộp đảng phí (hướng dẫn nghiệp vụ)",
    content: `THU, NỘP ĐẢNG PHÍ

1. Mức đóng đảng phí
- Đảng viên trong các cơ quan hành chính, đơn vị sự nghiệp, tổ chức chính trị - xã hội: đóng đảng phí bằng 1% tiền lương (tiền lương theo ngạch, bậc), các khoản phụ cấp tính đóng bảo hiểm xã hội.
- Đảng viên hưởng lương bảo hiểm xã hội (hưu trí, mất sức): đóng 0,5% mức tiền lương hưu, trợ cấp.
- Đảng viên làm việc trong doanh nghiệp, đơn vị sự nghiệp ngoài công lập: đóng 1% tiền lương, tiền công và các khoản thu nhập khác từ quỹ tiền lương.
- Đảng viên khác (nông dân, học sinh, sinh viên, người không có thu nhập ổn định): đóng từ 2.000 đồng đến 30.000 đồng/tháng tùy điều kiện; đảng viên đang sinh sống ở ngoài nước đóng tối thiểu 2 USD/tháng.
- Khuyến khích đảng viên tự nguyện đóng cao hơn mức quy định.

2. Hình thức thu, nộp
- Nộp trực tiếp bằng tiền mặt cho chi ủy, đồng chí được phân công thu đảng phí của chi bộ, có ký nhận vào sổ theo dõi.
- Nộp bằng chuyển khoản vào tài khoản của tổ chức đảng.
- Nộp trực tuyến trên Cổng Dịch vụ công của Đảng (nếu tổ chức đảng đã triển khai), thanh toán qua ngân hàng điện tử hoặc ví điện tử liên kết.

3. Nộp đảng phí trực tuyến
- Đảng viên đăng nhập Cổng Dịch vụ công của Đảng bằng tài khoản định danh điện tử VNeID (mức 2) hoặc tài khoản do tổ chức đảng cấp.
- Chọn chức năng "Nộp đảng phí", hệ thống hiển thị kỳ đóng, số tiền phải nộp theo mức lương đã kê khai.
- Kiểm tra thông tin, chọn phương thức thanh toán, xác nhận giao dịch và lưu biên lai điện tử.
- Đảng viên xem lịch sử nộp đảng phí tại mục "Lịch sử giao dịch/Sổ đảng phí điện tử" trên Cổng Dịch vụ công của Đảng, hoặc đối chiếu sổ thu đảng phí của chi bộ.

4. Thông tin kê khai khi đóng đảng phí
- Họ tên, số thẻ đảng viên, chi bộ sinh hoạt.
- Kỳ đóng (tháng/quý/năm), mức tiền lương hoặc thu nhập làm căn cứ tính, tỷ lệ đóng và số tiền phải nộp.
- Hình thức thanh toán và thông tin tài khoản (nếu nộp trực tuyến).

5. Đóng hộ
- Có thể đóng hộ cho đảng viên khác trong trường hợp đảng viên đi công tác, ốm đau, ở xa; người đóng hộ phải ghi rõ nộp thay cho ai và chi bộ ghi nhận đầy đủ trong sổ thu đảng phí.

6. Thời hạn, hồ sơ, lệ phí
- Đảng viên nộp đảng phí hằng tháng, chậm nhất trong tháng phát sinh; chi bộ nộp lên cấp trên theo định kỳ quy định.
- Hồ sơ: bản kê khai mức đóng đảng phí; không thu phí, lệ phí đối với thủ tục thu nộp đảng phí.
- Trích giữ đảng phí: chi bộ được giữ lại một phần theo tỷ lệ quy định để chi hoạt động công tác đảng, phần còn lại nộp lên cấp trên.`,
  },
  {
    title: "Chuyển sinh hoạt Đảng chính thức",
    content: `CHUYỂN SINH HOẠT ĐẢNG CHÍNH THỨC

1. Trường hợp áp dụng
Đảng viên chuyển công tác, thay đổi nơi cư trú, nghỉ hưu, thôi việc, chuyển đơn vị sang địa bàn khác từ 12 tháng trở lên thì làm thủ tục chuyển sinh hoạt đảng chính thức.

2. Trình tự thực hiện
- Bước 1: Đảng viên làm đơn (hoặc báo cáo) đề nghị chuyển sinh hoạt đảng gửi chi ủy, chi bộ nơi đang sinh hoạt.
- Bước 2: Chi bộ xem xét, nếu đảng viên đã hoàn thành nhiệm vụ và nộp đủ đảng phí thì đề nghị cấp ủy cơ sở giới thiệu chuyển sinh hoạt.
- Bước 3: Cấp ủy cơ sở nhận xét vào bản tự kiểm điểm của đảng viên, viết Giấy giới thiệu chuyển sinh hoạt đảng (mẫu quy định) và chuyển hồ sơ đảng viên.
- Bước 4: Đảng viên nộp giấy giới thiệu cho cấp ủy nơi chuyển đến trong thời hạn 30 ngày làm việc kể từ ngày giới thiệu chuyển đi.
- Bước 5: Cấp ủy nơi chuyển đến tiếp nhận, giới thiệu về chi bộ và thông báo cho đảng viên tham gia sinh hoạt.

3. Thành phần hồ sơ
- Đơn/báo cáo đề nghị chuyển sinh hoạt đảng.
- Bản tự kiểm điểm của đảng viên có nhận xét của chi bộ, cấp ủy cơ sở.
- Giấy giới thiệu chuyển sinh hoạt đảng và hồ sơ đảng viên (do tổ chức đảng quản lý, chuyển theo đường tổ chức).

4. Thời hạn giải quyết
- Cấp ủy cơ sở giải quyết trong thời hạn không quá 5 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ.
- Không thu phí, lệ phí.

5. Lưu ý
- Đảng viên phải nộp đủ đảng phí đến thời điểm chuyển đi.
- Trong thời gian chuyển sinh hoạt, đảng viên vẫn phải giữ mối liên hệ và chấp hành nghiêm kỷ luật của Đảng.`,
  },
  {
    title: "Chuyển sinh hoạt Đảng tạm thời",
    content: `CHUYỂN SINH HOẠT ĐẢNG TẠM THỜI

1. Trường hợp áp dụng
Đảng viên đi công tác, học tập, chữa bệnh, lao động, làm việc xa nơi sinh hoạt chi bộ trong thời gian từ 3 tháng đến dưới 12 tháng, hoặc được cử đến đơn vị khác mà vẫn thuộc biên chế của đơn vị cũ.

2. Trình tự
- Đảng viên báo cáo chi bộ và làm đơn đề nghị chuyển sinh hoạt đảng tạm thời.
- Cấp ủy cơ sở nơi đảng viên đang sinh hoạt cấp Giấy giới thiệu sinh hoạt đảng tạm thời (không chuyển hồ sơ đảng viên).
- Đảng viên nộp giấy giới thiệu cho cấp ủy nơi đến để được giới thiệu về chi bộ sinh hoạt.
- Hết thời hạn, đảng viên nhận giấy giới thiệu trở lại và báo cáo chi bộ nơi sinh hoạt chính thức.

3. Quyền và nhiệm vụ
- Đảng viên sinh hoạt tạm thời có đầy đủ nhiệm vụ, quyền của đảng viên, trừ quyền biểu quyết, ứng cử, bầu cử tại chi bộ nơi sinh hoạt tạm thời.
- Đảng viên đóng đảng phí ở chi bộ nơi sinh hoạt tạm thời (hoặc theo hướng dẫn của cấp ủy).

4. Hồ sơ, thời hạn, lệ phí
- Hồ sơ: đơn đề nghị; giấy giới thiệu sinh hoạt đảng tạm thời theo mẫu.
- Thời hạn giải quyết: không quá 5 ngày làm việc; không thu phí, lệ phí.`,
  },
  {
    title: "Lấy ý kiến nhận xét của chi ủy nơi cư trú",
    content: `LẤY Ý KIẾN NHẬN XÉT NƠI CƯ TRÚ

1. Mục đích
Lấy ý kiến nhận xét của chi ủy, chi bộ nơi cư trú đối với đảng viên và người xin vào Đảng nhằm đánh giá phẩm chất chính trị, đạo đức lối sống, quan hệ với nhân dân và việc thực hiện nghĩa vụ công dân nơi cư trú.

2. Trường hợp áp dụng
- Người xin vào Đảng trước khi chi bộ xét đề nghị kết nạp.
- Đảng viên đang công tác thực hiện việc giữ mối liên hệ với chi ủy nơi cư trú theo Quy định 213-QĐ/TW, được nhận xét hằng năm.

3. Trình tự
- Chi bộ nơi công tác gửi phiếu/giấy đề nghị nhận xét đến chi ủy nơi cư trú của bản thân và gia đình.
- Chi ủy nơi cư trú họp, lấy ý kiến đại diện tổ dân phố/thôn và ghi nhận xét vào phiếu.
- Chi ủy nơi cư trú ký, đóng dấu của đảng ủy xã/phường và gửi lại chi bộ đề nghị.

4. Nội dung nhận xét
- Việc chấp hành chủ trương, đường lối của Đảng, chính sách pháp luật của Nhà nước.
- Phẩm chất đạo đức, lối sống của bản thân và gia đình.
- Việc tham gia các phong trào, hoạt động ở khu dân cư; quan hệ với nhân dân.

5. Thời hạn
Chi ủy nơi cư trú trả lời trong thời hạn không quá 10 ngày làm việc kể từ khi nhận được đề nghị; không thu phí, lệ phí.`,
  },
  {
    title: "Mô hình chi bộ tiên phong chuyển đổi số",
    content: `MÔ HÌNH "CHI BỘ TIÊN PHONG CHUYỂN ĐỔI SỐ"

1. Mục tiêu
- Nâng cao năng lực số cho cấp ủy và đảng viên; đưa công tác đảng lên môi trường số.
- Mỗi đảng viên là một tuyên truyền viên chuyển đổi số tại cơ quan, đơn vị và khu dân cư.

2. Nội dung triển khai
- Sinh hoạt chi bộ: xây dựng kế hoạch, nghị quyết, biên bản trên nền tảng số; gửi tài liệu sinh hoạt trước phiên họp qua nhóm làm việc điện tử.
- Hồ sơ đảng viên và nghiệp vụ: sử dụng phần mềm quản lý đảng viên, Cổng Dịch vụ công của Đảng để nộp đảng phí, chuyển sinh hoạt đảng, cập nhật thông tin.
- Tuyên truyền: lan tỏa thông tin chính thống trên các nền tảng số; phòng, chống thông tin xấu độc.
- Hỗ trợ nhân dân: đảng viên hướng dẫn người dân cài đặt VNeID, sử dụng dịch vụ công trực tuyến, thanh toán không dùng tiền mặt.

3. Tiêu chí đánh giá
- 100% đảng viên có tài khoản định danh điện tử mức 2 và biết sử dụng dịch vụ công trực tuyến.
- 100% văn bản của chi bộ (trừ văn bản mật) được số hóa, lưu trữ có hệ thống.
- Có ít nhất 1 sáng kiến/mô hình ứng dụng công nghệ trong công tác đảng hoặc chuyên môn mỗi năm.
- Tỷ lệ đảng viên nộp đảng phí trực tuyến đạt trên 80%.

4. Tổ chức thực hiện
- Bí thư chi bộ chịu trách nhiệm chỉ đạo; phân công 01 đồng chí phụ trách chuyển đổi số.
- Đưa nội dung chuyển đổi số vào nghị quyết chi bộ hằng tháng và kiểm điểm cuối năm.
- Định kỳ 6 tháng đánh giá kết quả, báo cáo đảng ủy cấp trên.`,
  },
  {
    title: "Sinh hoạt chi bộ định kỳ và nguyên tắc tổ chức",
    content: `SINH HOẠT CHI BỘ ĐỊNH KỲ

1. Thời gian, hình thức
- Chi bộ sinh hoạt định kỳ ít nhất mỗi tháng một lần; sinh hoạt chuyên đề ít nhất mỗi quý một lần.
- Chi bộ có thể sinh hoạt đột xuất khi có yêu cầu của cấp ủy cấp trên hoặc nhiệm vụ phát sinh.

2. Nguyên tắc
- Tập trung dân chủ, tập thể lãnh đạo, cá nhân phụ trách.
- Tự phê bình và phê bình; đoàn kết trên cơ sở Cương lĩnh, Điều lệ Đảng.

3. Trình tự một buổi sinh hoạt
- Bước 1: Chuẩn bị nội dung, dự thảo nghị quyết, thông báo tới đảng viên trước phiên họp.
- Bước 2: Điểm danh, tuyên bố lý do, thông tin thời sự, phổ biến văn bản mới của cấp trên.
- Bước 3: Đánh giá kết quả thực hiện nghị quyết tháng trước; nêu rõ việc làm được, chưa được, nguyên nhân.
- Bước 4: Thảo luận, tự phê bình và phê bình.
- Bước 5: Đề ra nhiệm vụ trọng tâm tháng tới, phân công thực hiện; biểu quyết thông qua nghị quyết.
- Bước 6: Thu, nộp đảng phí và thông qua biên bản.

4. Hồ sơ chi bộ
- Sổ nghị quyết/biên bản sinh hoạt; sổ theo dõi đảng viên; sổ thu nộp đảng phí; kế hoạch, báo cáo năm.

5. Đánh giá chất lượng
Chất lượng sinh hoạt chi bộ được chấm điểm theo các tiêu chí: tỷ lệ đảng viên dự họp, công tác chuẩn bị, nội dung, việc tự phê bình và phê bình, kết quả lãnh đạo thực hiện nhiệm vụ chính trị.`,
  },
];
