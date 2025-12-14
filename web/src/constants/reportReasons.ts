
export interface ReportReason {
    value: string;
    label: string;
    description: string;
}

export const REPORT_REASONS: ReportReason[] = [
    {
        value: "pornographic",
        label: "Nội dung khiêu dâm",
        description: "Hình ảnh, video hoặc văn bản có nội dung khiêu dâm."
    },
    {
        value: "violence",
        label: "Bạo lực hoặc nguy hiểm",
        description: "Nội dung khuyến khích bạo lực, tự tử, hoặc gây nguy hiểm cho người khác"
    },
    {
        value: "spam",
        label: "Spam hoặc quảng cáo",
        description: "Nội dung spam, lừa đảo, quảng cáo không mong muốn hoặc lặp lại"
    },
    {
        value: "hate_speech",
        label: "Ngôn từ thù ghét",
        description: "Phân biệt chủng tộc, tôn giáo, giới tính hoặc các hình thức kỳ thị khác"
    },
    {
        value: "harassment",
        label: "Quấy rối hoặc bắt nạt",
        description: "Quấy rối, đe dọa, bắt nạt hoặc xâm phạm quyền riêng tư của người khác"
    },
    {
        value: "misinformation",
        label: "Thông tin sai lệch",
        description: "Tin giả, thông tin sai sự thật hoặc gây hiểu lầm nghiêm trọng"
    },
    {
        value: "rules_violation",
        label: "Vi phạm quy tắc cộng đồng",
        description: "Vi phạm các quy tắc và điều khoản của cộng đồng"
    },
    {
        value: "other",
        label: "Khác",
        description: "Lý do khác không thuộc các danh mục trên"
    }
];

export const getReasonLabel = (value: string): string => {
    const reason = REPORT_REASONS.find(r => r.value === value);
    return reason ? reason.label : value;
};
