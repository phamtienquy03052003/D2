import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import CustomBayes from '../utils/CustomBayes.js';

// Đường dẫn file hiện tại và thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const MODEL_PATH = path.join(__dirname, '../models/classifier.json');


// Load model AI (Naive Bayes) nếu tồn tại
const modelPromise = new Promise((resolve, reject) => {
  if (fs.existsSync(MODEL_PATH)) {
    try {
      console.log('Loading AI Moderation Model...');
      fs.readFile(MODEL_PATH, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading model file:', err);
          resolve(null);
          return;
        }
        try {
          const json = JSON.parse(data);
          const loadedClassifier = CustomBayes.fromJSON(json);
          console.log(`Local Moderation Model loaded successfully. (Vocab: ${loadedClassifier.vocabulary.size}, Docs: ${loadedClassifier.totalDocs})`);
          resolve(loadedClassifier);
        } catch (parseErr) {
          console.error('Error parsing model JSON:', parseErr);
          resolve(null);
        }
      });
    } catch (e) {
      console.error('Exception loading model:', e);
      resolve(null);
    }
  } else {
    console.warn('Moderation model not found. Please run "npm run train-model" first.');
    resolve(null);
  }
});

let classifier = null;
modelPromise.then(c => classifier = c);

const VIETNAMESE_BLACKLIST = [

  'đánh bạc', 'cờ bạc', 'cá độ', 'lô đề', 'số đề', 'xổ số chui', 'tín dụng đen',
  'vay nóng', 'lừa đảo', 'đa cấp', 'rửa tiền', 'buôn lậu', 'buôn ma túy', 'thuốc phiện',
  'hàng cấm', 'mại dâm', 'bán dâm', 'hối lộ', 'bóc lột',


  'giết người', 'tự sát', 'tự tử', 'khủng bố', 'phản động',
  'đánh chết', 'chém', 'đâm', 'xác chết', 'hãm hại', 'hãm hiếp', 'tra tấn', 'giết mày',
  'cướp', 'trộm',


  'sex', 'khiêu dâm', 'đồi trụy', 'porn', 'fuck', 'dương vật',
  'thủ dâm', 'nude', 'khỏa thân', 'làm tình', 'xxx', 'lồn', 'cặc', 'buồi',


  'đm', 'dm', 'vcl', 'cc', 'đéo', 'đĩ', 'đù', 'cứt', 'tởm',
  'súc vật', 'óc chó', 'đần độn',
  'địt', 'địt bố', 'địt mẹ', 'đụ má', 'đmcm', 'đkm', 'đklm',


  'phân biệt chủng tộc', 'kỳ thị', 'bắc kỳ', 'nam kỳ', 'thằng mọi',
  'chó bắc', 'chó nam', 'dân tộc mọi', 'thằng tàu', 'kỳ thị tôn giáo',
];

class ModerationService {
  /**
   * Kiểm tra nội dung văn bản (Post, Comment)
   * - Bước 1: Kiểm tra từ khóa trong Blacklist cứng.
   * - Bước 2: Sử dụng AI Model (Classifier) để phân loại 'toxic'.
   * 
   * @param {string} text - Nội dung cần kiểm tra
   * @returns {Promise<{flagged: boolean, reason: string}>} - Kết quả kiểm duyệt
   */
  static async checkContent(text) {
    if (!text) return { flagged: false, reason: '' };


    const lowerText = text.toLowerCase();
    for (const keyword of VIETNAMESE_BLACKLIST) {
      if (lowerText.includes(keyword)) {
        return {
          flagged: true,
          reason: `Nội dung chứa từ khóa bị cấm: "${keyword}"`,
        };
      }
    }


    if (!classifier) {
      classifier = await modelPromise;
    }

    if (classifier) {

      const classification = classifier.classify(text);

      if (classification === 'toxic') {
        return {
          flagged: true,
          reason: "Nội dung vi phạm tiêu chuẩn cộng đồng",
        };
      }
    } else {


    }

    return { flagged: false, reason: '' };
  }
}

export default ModerationService;
