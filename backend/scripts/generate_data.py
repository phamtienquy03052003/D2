import json
import random
import os
import time

# Base dictionary of phrases
TOXIC_PHRASES = [
    "dm", "dkm", "vcl", "vl", "cc", "cl", "đụ", "địt", "lồn", "buồi", "cặc", "chó", "súc vật",
    "ngu", "óc chó", "điên", "khùng", "biến thái", "hãm", "phò", "đĩ", "cave",
    "giết", "đánh", "chém", "bắn", "tạt axit", "hiếp dâm", "ấu dâm",
    "phản động", "3 que", "đu càng", "bò đỏ", "cộng sản", "ngụy",
    "lừa đảo", "đa cấp", "cờ bạc", "cá độ", "lô đề", "xóc đĩa", "tài xỉu",
    "sex", "khiêu dâm", "loạn luân", "bú cu", "vú", "mông", "toang",
    "chết đi", "tự tử", "nhảy cầu", "uống thuốc sâu",
    "đm", "đkm", "vkl", "đcm", "đmm", "vãi", "đéo", "đếch",
    "mày", "tao", "nó", "chúng nó", "bọn mày", "lũ",
    "ngu như bò", "ăn hại", "vô dụng", "rác rưởi", "cặn bã",
    "bố mày", "ông nội mày", "cả lò nhà mày",
    "xạo lồn", "xạo chó", "bốc phét", "chém gió",
    "kèo bóng", "soi cầu", "bạch thủ", "lô xiên",
    "vay tiền", "bốc bát họ", "tín dụng đen",
    "thu hồi nợ", "đòi nợ thuê",
    "gái gọi", "check hàng", "massage a-z", "tay vịn",
    "thuốc kích dục", "đồ chơi người lớn", "sextoy",
    "hàng nóng", "hàng lạnh", "kẹo ke", "đá", "cỏ", "cần sa",
    "bay lắc", "phê pha", "ngáo",
    "trẻ trâu", "sửu nhi",
    "kỳ thị", "phân biệt vùng miền", "bắc kỳ", "nam kỳ", "trung kỳ", "tộc", "mọi",
    "thanh hóa", "nghệ an", "hà tĩnh", # Contextual regional hate
    "bê đê", "bóng chó", "xăng pha nhớt", "gay", "les", "lgbt", # Hate speech
    "ngu học", "thất học", "vô học", "mất dạy",
    "mặt lồn", "mặt phụ khoa",
    "hãm lồn", "hãm cành cạch",
    "đụ má", "đụ mẹ", "địt mẹ", "địt cụ",
    "vãi lồn", "vãi cứt", "vãi đái",
    "như cái lồn", "như cái củ cặc",
    "cút", "biến", "xéo",
    "sml", "sấp mặt lồn",
    "atsm", "ảo tưởng sức mạnh",
    "gato", "ghen ăn tức ở",
    "chịch", "xoạc", "nện", "thông đít",
    "bóc phốt", "drama",
    "link sex", "link 18+", "full hd", "không che",
    "lộ clip", "clip nóng",
    "show hàng", "khoe thân",
    "tìm daddy", "tìm baby", "sgdd", "sgbb",
    "bao nuôi", "chu cấp",
    "tuyển nhân viên", "việc nhẹ lương cao", # Scam triggers
    "nhập liệu", "xâu hạt", "gấp dán bao lì xì",
    "cộng tác viên", "shopee", "tiki", "lazada", # Scam triggers
    "hoa hồng cao", "chiết khấu cao",
    "đầu tư", "sinh lời", "lợi nhuận khủng",
    "forex", "bitcoin", "tiền ảo",
    "sàn ảo", "sàn bo", "binary option",
    "hack", "cheat", "tool",
    "rip nick", "report",
    "dịch vụ facebook", "tăng like", "tăng follow",
    "chạy quảng cáo", "bán fanpage",
    "sim số đẹp", "phong thủy",
    "bùa ngải", "tâm linh",
    "trúng thưởng", "quà tặng", "tri ân",
    "miễn phí", "free",
    "ship cod", "kiểm hàng",
    "chính hãng", "xách tay", "fake", "rep 1:1",
    "thanh lý", "xả kho", "giá rẻ",
    "bom hàng", "bùng hàng",
    "phốt", "scam",
    "uy tín", "chất lượng", "đảm bảo", # Often used in scams too, context matters
    "inbox", "ib", "check ib",
    "kết bạn", "add friend", "zalo",
    "số điện thoại", "sđt", "hotline",
    "địa chỉ", "link", "website",
    "tải app", "cài đặt", "đăng ký",
    "mã giới thiệu", "ref",
    "livestream", "chia sẻ", "share",
    "minigame", "giveaway",
    "chấm", ".", "hóng",
]

CLEAN_PHRASES = [
    "xin chào", "cảm ơn", "tạm biệt", "chúc mừng", "tuyệt vời",
    "hay quá", "đẹp quá", "ngon quá", "thích quá", "yêu quá",
    "vui vẻ", "hạnh phúc", "may mắn", "thành công", "sức khỏe",
    "bình an", "an khang", "thịnh vượng",
    "học tập", "làm việc", "nghiên cứu", "phát triển",
    "gia đình", "bạn bè", "người thân", "đồng nghiệp",
    "thầy cô", "cha mẹ", "ông bà", "con cái",
    "yêu thương", "quan tâm", "chia sẻ", "giúp đỡ",
    "đoàn kết", "hòa bình", "nhân ái", "từ bi",
    "trung thực", "thẳng thắn", "dũng cảm", "kiên trì",
    "sáng tạo", "đổi mới", "tiến bộ", "văn minh",
    "lịch sự", "tôn trọng", "khiêm tốn", "giản dị",
    "tiết kiệm", "bảo vệ môi trường", "thiên nhiên",
    "đất nước", "quê hương", "tổ quốc", "đồng bào",
    "văn hóa", "nghệ thuật", "âm nhạc", "thể thao",
    "du lịch", "ẩm thực", "thời trang", "làm đẹp",
    "công nghệ", "khoa học", "giáo dục", "y tế",
    "kinh tế", "chính trị", "xã hội", "pháp luật",
    "tin tức", "thời sự", "giải trí", "thư giãn",
    "sách", "truyện", "phim", "ảnh", "video",
    "bài viết", "bình luận", "ý kiến", "quan điểm",
    "thông tin", "kiến thức", "kinh nghiệm", "kỹ năng",
    "sản phẩm", "dịch vụ", "chất lượng", "giá cả",
    "khách hàng", "người dùng", "cộng đồng", "xã hội",
    "thời tiết", "khí hậu", "môi trường", "không gian",
    "thời gian", "quá khứ", "hiện tại", "tương lai",
    "cuộc sống", "con người", "thế giới", "vũ trụ",
    "tình yêu", "tình bạn", "tình thân", "tình người",
    "niềm vui", "nỗi buồn", "hy vọng", "ước mơ",
    "cố gắng", "nỗ lực", "phấn đấu", "vươn lên",
    "vượt qua", "chiến thắng", "thất bại", "bài học",
    "ý nghĩa", "giá trị", "mục đích", "lý tưởng",
    "tự do", "bình đẳng", "bác ái",
    "trách nhiệm", "nghĩa vụ", "quyền lợi",
    "pháp luật", "kỷ cương", "trật tự",
    "an toàn", "an ninh", "quốc phòng",
    "hòa bình", "hữu nghị", "hợp tác",
    "phát triển", "bền vững", "thịnh vượng",
    "văn minh", "hiện đại", "tiên tiến",
    "truyền thống", "bản sắc", "dân tộc",
    "lịch sử", "địa lý", "văn học",
    "toán học", "vật lý", "hóa học",
    "sinh học", "tin học", "ngoại ngữ",
    "tiếng việt", "tiếng anh", "tiếng pháp",
    "mùa xuân", "mùa hạ", "mùa thu", "mùa đông",
    "ngày tết", "lễ hội", "kỷ niệm",
    "sinh nhật", "đám cưới", "đám hỏi",
    "du lịch", "nghỉ dưỡng", "tham quan",
    "mua sắm", "tiêu dùng", "thị trường",
    "công ty", "doanh nghiệp", "cơ quan",
    "trường học", "bệnh viện", "nhà máy",
    "công viên", "siêu thị", "chợ",
    "đường phố", "xe cộ", "giao thông",
    "nhà cửa", "kiến trúc", "nội thất",
    "món ăn", "đồ uống", "nhà hàng",
    "quán cafe", "trà sữa", "ăn vặt",
    "thú cưng", "chó mèo", "cây cảnh",
    "hoa", "cỏ", "lá", "cành",
    "biển", "núi", "sông", "hồ",
    "trời", "mây", "gió", "nắng", "mưa",
]

# Obfuscation maps
TEENCODE_MAP = {
    'a': ['4', 'a', 'a', '@'],
    'e': ['3', 'e', 'e'],
    'i': ['1', 'j', 'i', 'i'],
    'o': ['0', 'o', 'o', '()'],
    'u': ['u', 'u', 'µ'],
    'b': ['b', 'b', 'bz'],
    'c': ['c', 'k', 'c'],
    'd': ['d', 'dz', 'z'],
    'đ': ['d', 'đ', '+)', 'd'],
    'g': ['g', 'g', 'q'],
    'h': ['h', 'h', 'k'],
    'k': ['k', 'k', 'c'],
    'l': ['l', 'l', '1'],
    'n': ['n', 'n', 'l'], # Common mistake l/n
    'ph': ['f', 'ph'],
    'qu': ['w', 'qu', 'q'],
    'r': ['r', 'z', 'r'],
    's': ['s', 'x', 's'], # Common mistake s/x
    't': ['t', 't', '+'],
    'v': ['v', 'v', 'z'],
    'x': ['x', 's', 'x'],
    'y': ['y', 'i', 'j'],
    'ch': ['ck', 'ch'],
    'kh': ['k', 'kh', 'x'],
    'ng': ['g', 'ng', 'q'],
    'nh': ['nk', 'nh'],
    'th': ['tk', 'th'],
    'tr': ['ch', 'tr'], # Common mistake tr/ch
    'gi': ['j', 'z', 'gi'],
    'd': ['j', 'z', 'd'],
}

HOMOGLYPHS = {
    'a': 'а', 'c': 'с', 'e': 'е', 'i': 'і', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у', # Cyrillic
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'I': 'І', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х',
}

SEPARATORS = ['.', ',', '-', '_', ' ', '*', '+', '/', '\\', '|', '']

def apply_teencode(text):
    chars = list(text)
    for i, char in enumerate(chars):
        lower_char = char.lower()
        if lower_char in TEENCODE_MAP and random.random() < 0.3: # 30% chance to teencode a char
            chars[i] = random.choice(TEENCODE_MAP[lower_char])
    return "".join(chars)

def insert_noise(text):
    if len(text) < 2: return text
    sep = random.choice(SEPARATORS)
    if sep == '': return text
    return sep.join(list(text))

def remove_vowels(text):
    vowels = "aeiouyáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ"
    return "".join([c for c in text if c.lower() not in vowels or random.random() > 0.5]) # Keep 50% vowels

def leetspeak(text):
    chars = list(text)
    for i, char in enumerate(chars):
        if char in HOMOGLYPHS and random.random() < 0.3:
            chars[i] = HOMOGLYPHS[char]
    return "".join(chars)

def random_case(text):
    return "".join([c.upper() if random.random() < 0.5 else c.lower() for c in text])

def generate_sample(base_text, label):
    # Apply random transformations
    text = base_text
    
    # 1. Random casing
    if random.random() < 0.2:
        text = random_case(text)
    
    # 2. Teencode / Typos
    if random.random() < 0.4:
        text = apply_teencode(text)
        
    # 3. Leetspeak / Homoglyphs
    if random.random() < 0.2:
        text = leetspeak(text)
        
    # 4. Insert noise (for toxic phrases mostly to evade)
    if label == "toxic" and random.random() < 0.3:
        # Split words and join with noise or split chars
        if random.random() < 0.5:
            # Split chars: "c.h.ế.t"
            words = text.split()
            if words:
                target_word_idx = random.randint(0, len(words) - 1)
                words[target_word_idx] = insert_noise(words[target_word_idx])
                text = " ".join(words)
        else:
            # Split words with special chars: "chết.tiệt"
            text = text.replace(" ", random.choice(SEPARATORS))

    # 5. Remove vowels (abbreviation style)
    if random.random() < 0.1:
        text = remove_vowels(text)

    return {"text": text, "label": label}

def main():
    output_file = os.path.join(os.path.dirname(__file__), '../src/data/dataset.json')
    
    # Load existing data to avoid duplicates if needed, or just append
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"Loaded {len(data)} existing samples.")
    except FileNotFoundError:
        data = []
        print("No existing dataset found. Creating new.")

    target_count = 2000000
    current_count = len(data)
    needed = target_count
    
    print(f"Generating {needed} new samples...")
    
    new_samples = []
    
    # Generate in batches to manage memory if we were writing to disk incrementally, 
    # but for simplicity we'll build a list and write once or in chunks.
    # Given 2M is large, let's just generate a lot of variations.
    
    start_time = time.time()
    
    for i in range(needed):
        if random.random() < 0.6: # 60% toxic to focus on "lách luật"
            base = random.choice(TOXIC_PHRASES)
            # Combine toxic phrases sometimes
            if random.random() < 0.3:
                base += " " + random.choice(TOXIC_PHRASES)
            label = "toxic"
        else:
            base = random.choice(CLEAN_PHRASES)
            if random.random() < 0.3:
                base += " " + random.choice(CLEAN_PHRASES)
            label = "clean"
            
        sample = generate_sample(base, label)
        new_samples.append(sample)
        
        if (i + 1) % 100000 == 0:
            print(f"Generated {i + 1} samples...")

    data.extend(new_samples)
    
    print(f"Total samples: {len(data)}")
    print("Writing to file...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Done in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
