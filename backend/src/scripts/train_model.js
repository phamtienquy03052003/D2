
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import CustomBayes from '../utils/CustomBayes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, '../data/dataset.json');
const MODEL_PATH = path.join(__dirname, '../models/classifier.json');


const modelsDir = path.dirname(MODEL_PATH);
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

async function train() {
    console.log('--- PROFESSIONAL AI TRAINING ---');
    console.log('1. Initialization...');

    if (!fs.existsSync(DATASET_PATH)) {
        console.error('No dataset found. Run "node src/scripts/generate_dataset.js" first.');
        process.exit(1);
    }

    console.log(`Using dataset: ${DATASET_PATH}`);

    const classifier = new CustomBayes();
    let totalSamples = 0;
    let trainCount = 0;
    let validCount = 0;




    const validationSet = [];
    const MAX_VALIDATION = 5000;

    console.log('2. Streaming Dataset & Training...');


    const fileStream = fs.createReadStream(DATASET_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentObject = {};
    let isInsideObject = false;
    const startTime = Date.now();

    for await (const line of rl) {
        const trimmed = line.trim();



        if (trimmed.startsWith('{') && (trimmed.endsWith('}') || trimmed.endsWith('},'))) {
            try {

                const jsonStr = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;
                const obj = JSON.parse(jsonStr);

                if (obj.text && obj.label) {
                    processSample(obj);
                }
            } catch (e) {

            }
            continue;
        }


        if (trimmed === '{') {
            isInsideObject = true;
            currentObject = {};
        } else if (trimmed === '},' || trimmed === '}') {
            if (isInsideObject && currentObject.text && currentObject.label) {
                processSample(currentObject);
            }
            isInsideObject = false;
        } else if (isInsideObject) {
            const textMatch = trimmed.match(/"text":\s*"(.*)"/);
            const labelMatch = trimmed.match(/"label":\s*"(.*)"/);
            if (textMatch) currentObject.text = textMatch[1].replace(/\\"/g, '"');
            else if (labelMatch) currentObject.label = labelMatch[1];
        }
    }

    function processSample(obj) {
        totalSamples++;

        const isValidation = Math.random() < 0.2;

        if (isValidation && validationSet.length < MAX_VALIDATION) {
            validationSet.push(obj);
            validCount++;
        } else {
            classifier.train(obj.text, obj.label);
            trainCount++;
        }

        if (totalSamples % 50000 === 0) {
            const mem = process.memoryUsage().heapUsed / 1024 / 1024;
            const elapsed = (Date.now() - startTime) / 1000;
            console.log(`Processing... ${totalSamples} samples. (Train: ${trainCount}, Valid: ${validCount}) [Heap: ${mem.toFixed(2)} MB, Time: ${elapsed.toFixed(0)}s]`);
        }
    }

    const trainTime = (Date.now() - startTime) / 1000;
    console.log(`\nTraining Finished in ${trainTime.toFixed(2)}s.`);
    console.log(`Total Scanned: ${totalSamples}`);
    console.log(`Training Set: ${trainCount}`);
    console.log(`Validation Set: ${validationSet.length} (Capped at ${MAX_VALIDATION})`);

    console.log('\n3. Optimizing Model...');
    classifier.prune(3);

    console.log('\n4. Validating Accuracy & Professional Metrics...');

    const stats = {
        toxic: { tp: 0, fp: 0, fn: 0, tn: 0 },
        clean: { tp: 0, fp: 0, fn: 0, tn: 0 }
    };

    validationSet.forEach(sample => {
        const prediction = classifier.classify(sample.text);

        if (sample.label === 'toxic') {
            if (prediction === 'toxic') {
                stats.toxic.tp++;
                stats.clean.tn++;
            } else {
                stats.toxic.fn++;
                stats.clean.fp++;
            }
        } else { // clean
            if (prediction === 'clean') {
                stats.clean.tp++;
                stats.toxic.tn++;
            } else {
                stats.clean.fn++;
                stats.toxic.fp++;
            }
        }
    });

    const calculateMetrics = (tp, fp, fn) => {
        const precision = tp / (tp + fp) || 0;
        const recall = tp / (tp + fn) || 0;
        const f1 = 2 * (precision * recall) / (precision + recall) || 0;
        return { precision, recall, f1 };
    };

    const toxicMetrics = calculateMetrics(stats.toxic.tp, stats.toxic.fp, stats.toxic.fn);
    const cleanMetrics = calculateMetrics(stats.clean.tp, stats.clean.fp, stats.clean.fn);

    const totalSamplesVal = validationSet.length;
    const accuracy = ((stats.toxic.tp + stats.clean.tp) / totalSamplesVal * 100).toFixed(2);

    console.log(`\n>>> EVALUATION REPORT <<<`);
    console.log(`Samples: ${totalSamplesVal}`);
    console.log(`Overall Accuracy: ${accuracy}%`);
    console.log(`---------------------------------------------------`);
    console.log(`CLASS     | PRECISION | RECALL    | F1-SCORE`);
    console.log(`---------------------------------------------------`);
    console.log(`Toxic     | ${(toxicMetrics.precision * 100).toFixed(2)}%     | ${(toxicMetrics.recall * 100).toFixed(2)}%     | ${(toxicMetrics.f1).toFixed(4)}`);
    console.log(`Clean     | ${(cleanMetrics.precision * 100).toFixed(2)}%     | ${(cleanMetrics.recall * 100).toFixed(2)}%     | ${(cleanMetrics.f1).toFixed(4)}`);
    console.log(`---------------------------------------------------`);
    console.log(`Confusion Matrix: [ Toxic Pred: ${stats.toxic.tp} (True) / ${stats.toxic.fp} (False) ]`);

    console.log('\n5. Saving Model...');
    const modelData = JSON.stringify(classifier.toJSON());
    fs.writeFileSync(MODEL_PATH, modelData);

    const fileSize = fs.statSync(MODEL_PATH).size / 1024 / 1024;
    console.log(`Model saved to ${MODEL_PATH} (${fileSize.toFixed(2)} MB)`);

    console.log('\n--- PROFESSIONAL SANITY CHECK (Long Texts) ---');
    const testCases = [

        `Tao nói thật với mày, mày là đồ ngu học nhất tao từng gặp. Cả lò nhà mày ăn gì mà ngu thế? Biến đi cho khuất mắt tao không tao lại đập cho trận giờ. Sống chật đất quá.`,


        `Hôm nay phải chạy deadline sấp mặt cho sếp. Dự án này khó thật sự, nhưng mà anh em trong team rất hỗ trợ nhau. Hy vọng cuối tháng sẽ được nhận lương thưởng xứng đáng để đi du lịch một chuyến.`,


        `Hôm qua đánh trận rank căng vãi. Thằng ad bên kia bắn gắt vcl, tao lao vào giết nó mà không được. Cuối cùng team mình vẫn thua, cay thật sự.`,


        `Tuyển cộng tác viên làm việc tại nhà thu nhập khủng 10 triệu một tháng. Không cần cọc, không cần kinh nghiệm. Chỉ cần có điện thoại kết nối mạng. Inbox ngay để nhận việc.`,


        `Vừa đi ăn quán phở đầu ngõ về. Phải nói là ngon tuyệt vời ông mặt trời. Nước dùng đậm đà, thịt bò mềm, giá cả lại phải chăng. Chắc chắn sẽ quay lại ủng hộ dài dài.`,


        `Cái điện thoại cùi bắp này lại đơ rồi. Đang cần gọi grab gấp mà nó cứ quay mòng mòng. Điên hết cả người, muốn đập nát nó ra ghê.`
    ];

    testCases.forEach((text, i) => {
        const result = classifier.classify(text);
        const label = result.toUpperCase();
        console.log(`\n[Test ${i + 1}] Pred: ${label} \nText: "${text.substring(0, 100)}..."`);
    });
}

train().catch(console.error);
