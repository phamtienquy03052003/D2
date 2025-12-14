import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const TOXIC_PHRASES = [
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
    "thanh hóa", "nghệ an", "hà tĩnh",
    "bê đê", "bóng chó", "xăng pha nhớt", "gay", "les", "lgbt",
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
    "tuyển nhân viên", "việc nhẹ lương cao",
    "nhập liệu", "xâu hạt", "gấp dán bao lì xì",
    "cộng tác viên", "shopee", "tiki", "lazada",
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
    "uy tín", "chất lượng", "đảm bảo",
    "inbox", "ib", "check ib",
    "kết bạn", "add friend", "zalo",
    "số điện thoại", "sđt", "hotline",
    "địa chỉ", "link", "website",
    "tải app", "cài đặt", "đăng ký",
    "mã giới thiệu", "ref",
    "livestream", "chia sẻ", "share",
    "minigame", "giveaway",
    "chấm", ".", "hóng",
];

const CLEAN_PHRASES = [
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
];


const TEENCODE_MAP = {
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
    'n': ['n', 'n', 'l'],
    'ph': ['f', 'ph'],
    'qu': ['w', 'qu', 'q'],
    'r': ['r', 'z', 'r'],
    's': ['s', 'x', 's'],
    't': ['t', 't', '+'],
    'v': ['v', 'v', 'z'],
    'x': ['x', 's', 'x'],
    'y': ['y', 'i', 'j'],
    'ch': ['ck', 'ch'],
    'kh': ['k', 'kh', 'x'],
    'ng': ['g', 'ng', 'q'],
    'nh': ['nk', 'nh'],
    'th': ['tk', 'th'],
    'tr': ['ch', 'tr'],
    'gi': ['j', 'z', 'gi'],
    'd': ['j', 'z', 'd'],
};

const HOMOGLYPHS = {
    'a': 'а', 'c': 'с', 'e': 'е', 'i': 'і', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у',
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'I': 'І', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х',
};

const SEPARATORS = ['.', ',', '-', '_', ' ', '*', '+', '/', '\\', '|', ''];

function applyTeencode(text) {
    let chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
        const lowerChar = chars[i].toLowerCase();
        if (TEENCODE_MAP[lowerChar] && Math.random() < 0.3) {
            const replacements = TEENCODE_MAP[lowerChar];
            chars[i] = replacements[Math.floor(Math.random() * replacements.length)];
        }
    }
    return chars.join('');
}

function insertNoise(text) {
    if (text.length < 2) return text;
    const sep = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
    if (sep === '') return text;
    return text.split('').join(sep);
}

function removeVowels(text) {
    const vowels = "aeiouyáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ";
    return text.split('').filter(c => !vowels.includes(c.toLowerCase()) || Math.random() > 0.5).join('');
}

function leetspeak(text) {
    let chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
        if (HOMOGLYPHS[chars[i]] && Math.random() < 0.3) {
            chars[i] = HOMOGLYPHS[chars[i]];
        }
    }
    return chars.join('');
}

function randomCase(text) {
    return text.split('').map(c => Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
}

function generateSample(baseText, label) {
    let text = baseText;

    
    if (Math.random() < 0.2) {
        text = randomCase(text);
    }

    
    if (Math.random() < 0.4) {
        text = applyTeencode(text);
    }

    
    if (Math.random() < 0.2) {
        text = leetspeak(text);
    }

    
    if (label === "toxic" && Math.random() < 0.3) {
        if (Math.random() < 0.5) {
            
            const words = text.split(' ');
            if (words.length > 0) {
                const targetWordIdx = Math.floor(Math.random() * words.length);
                words[targetWordIdx] = insertNoise(words[targetWordIdx]);
                text = words.join(' ');
            }
        } else {
            
            const sep = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
            text = text.replace(/ /g, sep);
        }
    }

    
    if (Math.random() < 0.1) {
        text = removeVowels(text);
    }

    return { text, label };
}

async function main() {
    const outputFile = path.join(__dirname, '../src/data/dataset.json');

    
    

    let fileExists = fs.existsSync(outputFile);
    let fd;
    let isNewFile = false;

    try {
        if (fileExists) {
            
            const stats = fs.statSync(outputFile);
            if (stats.size < 5) {
                
                fs.writeFileSync(outputFile, '[\n');
                fileExists = false;
                isNewFile = true;
                fd = fs.openSync(outputFile, 'a');
            } else {
                
                
                
                const buffer = Buffer.alloc(10);
                fd = fs.openSync(outputFile, 'r+');
                const len = stats.size;
                let position = Math.max(0, len - 10);
                fs.readSync(fd, buffer, 0, 10, position);

                let content = buffer.toString('utf-8');
                let lastBracketIndex = content.lastIndexOf(']');

                if (lastBracketIndex !== -1) {
                    
                    const truncatePos = position + lastBracketIndex;
                    fs.ftruncateSync(fd, truncatePos);
                    
                } else {
                    console.error("File does not end with ']'. Aborting to avoid corruption.");
                    fs.closeSync(fd);
                    return;
                }
            }
        } else {
            fs.writeFileSync(outputFile, '[\n');
            fd = fs.openSync(outputFile, 'a');
            isNewFile = true;
        }

        if (!fd) fd = fs.openSync(outputFile, 'a');

    } catch (error) {
        console.error("Error preparing file:", error);
        return;
    }

    const targetCount = 2000000;
    const needed = targetCount;

    console.log(`Generating ${needed} new samples...`);

    const startTime = Date.now();

    
    let chunk = [];
    const CHUNK_SIZE = 1000;
    let firstChunk = true;

    for (let i = 0; i < needed; i++) {
        let base, label;
        if (Math.random() < 0.6) { 
            base = TOXIC_PHRASES[Math.floor(Math.random() * TOXIC_PHRASES.length)];
            if (Math.random() < 0.3) {
                base += " " + TOXIC_PHRASES[Math.floor(Math.random() * TOXIC_PHRASES.length)];
            }
            label = "toxic";
        } else {
            base = CLEAN_PHRASES[Math.floor(Math.random() * CLEAN_PHRASES.length)];
            if (Math.random() < 0.3) {
                base += " " + CLEAN_PHRASES[Math.floor(Math.random() * CLEAN_PHRASES.length)];
            }
            label = "clean";
        }

        const sample = generateSample(base, label);
        chunk.push(sample);

        if (chunk.length >= CHUNK_SIZE) {
            let str = '';
            for (let j = 0; j < chunk.length; j++) {
                
                
                

                let needComma = true;
                if (isNewFile && firstChunk && j === 0) {
                    needComma = false;
                }

                str += (needComma ? ',\n' : '') + JSON.stringify(chunk[j], null, 2);
            }

            fs.writeSync(fd, str);
            chunk = [];
            firstChunk = false;

            if ((i + 1) % 100000 === 0) {
                console.log(`Generated ${i + 1} samples...`);
            }
        }
    }

    
    if (chunk.length > 0) {
        let str = '';
        for (let j = 0; j < chunk.length; j++) {
            let needComma = true;
            if (isNewFile && firstChunk && j === 0) {
                needComma = false;
            }
            str += (needComma ? ',\n' : '') + JSON.stringify(chunk[j], null, 2);
        }
        fs.writeSync(fd, str);
    }

    
    fs.writeSync(fd, '\n]');
    fs.closeSync(fd);

    console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds.`);
}

main();
